import { describe, it, expect, vi } from "vitest";
import { CampaignStatus, Prisma } from "@prisma/client";
import {
  ALL_CAMPAIGN_STATUSES,
  ALLOWED_TRANSITIONS,
  isTransitionAllowed,
  getAllowedNextStatuses,
  requiresReason,
} from "@/lib/campaign-workflow/transitions";
import { transition } from "@/lib/campaign-workflow/transition";
import {
  CampaignNotFoundError,
  ConcurrencyConflictError,
  InvalidTransitionError,
  MissingReasonError,
  UnauthorizedTransitionError,
} from "@/lib/campaign-workflow/errors";

describe("Stage 2 Campaign Workflow State Machine", () => {
  describe("Exhaustive Transition Matrix Validation", () => {
    it("strictly verifies every status pair across all 196 combinations", () => {
      let allowedCount = 0;
      let forbiddenCount = 0;

      for (const from of ALL_CAMPAIGN_STATUSES) {
        const allowedTargets = ALLOWED_TRANSITIONS[from];

        for (const to of ALL_CAMPAIGN_STATUSES) {
          const isAllowed = isTransitionAllowed(from, to);

          if (allowedTargets.includes(to)) {
            expect(isAllowed).toBe(true);
            allowedCount++;
          } else {
            expect(isAllowed).toBe(false);
            forbiddenCount++;
          }
        }
      }

      // Assert total combinations equal 14 x 14 = 196
      expect(allowedCount + forbiddenCount).toBe(196);
      expect(allowedCount).toBeGreaterThan(15);
      expect(forbiddenCount).toBeGreaterThan(160);
    });

    it("enforces that terminal states have 0 allowed transitions", () => {
      const terminalStatuses = [
        CampaignStatus.COMPLETED,
        CampaignStatus.REJECTED,
        CampaignStatus.CANCELLED,
        CampaignStatus.FAILED,
      ];

      for (const terminal of terminalStatuses) {
        expect(getAllowedNextStatuses(terminal)).toEqual([]);
        for (const anyStatus of ALL_CAMPAIGN_STATUSES) {
          expect(isTransitionAllowed(terminal, anyStatus)).toBe(false);
        }
      }
    });

    it("verifies mandatory reason requirement on sensitive state transitions", () => {
      expect(requiresReason(CampaignStatus.REJECTED)).toBe(true);
      expect(requiresReason(CampaignStatus.CHANGES_REQUESTED)).toBe(true);
      expect(requiresReason(CampaignStatus.ON_HOLD)).toBe(true);
      expect(requiresReason(CampaignStatus.FAILED)).toBe(true);

      expect(requiresReason(CampaignStatus.DRAFT)).toBe(false);
      expect(requiresReason(CampaignStatus.PENDING_PAYMENT)).toBe(false);
      expect(requiresReason(CampaignStatus.SUBMITTED)).toBe(false);
      expect(requiresReason(CampaignStatus.UNDER_REVIEW)).toBe(false);
      expect(requiresReason(CampaignStatus.APPROVED_FOR_SCHEDULING)).toBe(false);
      expect(requiresReason(CampaignStatus.SCHEDULED)).toBe(false);
      expect(requiresReason(CampaignStatus.READY_FOR_OPERATIONS)).toBe(false);
      expect(requiresReason(CampaignStatus.IN_PROGRESS)).toBe(false);
      expect(requiresReason(CampaignStatus.COMPLETED)).toBe(false);
      expect(requiresReason(CampaignStatus.CANCELLED)).toBe(false);
    });
  });

  describe("transition() Transactional Engine", () => {
    function createMockTx(campaignRecord: Record<string, unknown> | null) {
      const tx = {
        campaign: {
          findUnique: vi.fn().mockResolvedValue(campaignRecord),
          update: vi.fn().mockImplementation(({ data }) =>
            Promise.resolve({
              ...campaignRecord,
              ...data,
              version: ((campaignRecord?.version as number) ?? 0) + 1,
            })
          ),
        },
        statusEvent: {
          create: vi.fn().mockResolvedValue({ id: "evt-1" }),
        },
        auditLog: {
          create: vi.fn().mockResolvedValue({ id: "audit-1" }),
        },
        notification: {
          create: vi.fn().mockResolvedValue({ id: "notif-1" }),
        },
      };

      return tx as unknown as Prisma.TransactionClient;
    }

    it("successfully performs an allowed transition and generates status event, audit log, and notification", async () => {
      const mockCampaign = {
        id: "camp-123",
        organizationId: "org-alpha",
        createdById: "user-owner",
        name: "Summer Drone Banner",
        status: CampaignStatus.DRAFT,
        version: 0,
      };

      const mockTx = createMockTx(mockCampaign);

      const result = await transition(
        {
          campaignId: "camp-123",
          toStatus: CampaignStatus.PENDING_PAYMENT,
          actor: {
            type: "USER",
            userId: "user-owner",
            role: "ADVERTISER",
            organizationIds: ["org-alpha"],
          },
          expectedVersion: 0,
        },
        mockTx
      );

      expect(result.success).toBe(true);
      expect(result.fromStatus).toBe(CampaignStatus.DRAFT);
      expect(result.toStatus).toBe(CampaignStatus.PENDING_PAYMENT);
      expect(result.version).toBe(1);

      // Verify campaign update called
      expect(mockTx.campaign.update).toHaveBeenCalledWith({
        where: { id: "camp-123" },
        data: {
          status: CampaignStatus.PENDING_PAYMENT,
          version: { increment: 1 },
        },
      });

      // Verify StatusEvent created
      expect(mockTx.statusEvent.create).toHaveBeenCalledWith({
        data: {
          campaignId: "camp-123",
          fromStatus: CampaignStatus.DRAFT,
          toStatus: CampaignStatus.PENDING_PAYMENT,
          actorId: "user-owner",
          actorType: "USER",
          reason: null,
        },
      });

      // Verify AuditLog created
      expect(mockTx.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "CAMPAIGN_STATUS_TRANSITION",
            entityType: "CAMPAIGN",
            entityId: "camp-123",
          }),
        })
      );
    });

    it("throws CampaignNotFoundError when campaign does not exist", async () => {
      const mockTx = createMockTx(null);

      await expect(
        transition(
          {
            campaignId: "non-existent-camp",
            toStatus: CampaignStatus.PENDING_PAYMENT,
            actor: { type: "SYSTEM" },
          },
          mockTx
        )
      ).rejects.toThrow(CampaignNotFoundError);
    });

    it("throws ConcurrencyConflictError when expectedVersion does not match", async () => {
      const mockCampaign = {
        id: "camp-123",
        organizationId: "org-alpha",
        status: CampaignStatus.DRAFT,
        version: 5,
      };
      const mockTx = createMockTx(mockCampaign);

      await expect(
        transition(
          {
            campaignId: "camp-123",
            toStatus: CampaignStatus.PENDING_PAYMENT,
            actor: { type: "SYSTEM" },
            expectedVersion: 4, // Stale version
          },
          mockTx
        )
      ).rejects.toThrow(ConcurrencyConflictError);
    });

    it("throws InvalidTransitionError when transition is not permitted", async () => {
      const mockCampaign = {
        id: "camp-123",
        organizationId: "org-alpha",
        status: CampaignStatus.DRAFT,
        version: 0,
      };
      const mockTx = createMockTx(mockCampaign);

      // DRAFT directly to COMPLETED is forbidden
      await expect(
        transition(
          {
            campaignId: "camp-123",
            toStatus: CampaignStatus.COMPLETED,
            actor: { type: "SYSTEM" },
          },
          mockTx
        )
      ).rejects.toThrow(InvalidTransitionError);
    });

    it("throws MissingReasonError when transitioning to REJECTED without a reason", async () => {
      const mockCampaign = {
        id: "camp-123",
        organizationId: "org-alpha",
        status: CampaignStatus.UNDER_REVIEW,
        version: 1,
      };
      const mockTx = createMockTx(mockCampaign);

      await expect(
        transition(
          {
            campaignId: "camp-123",
            toStatus: CampaignStatus.REJECTED,
            actor: {
              type: "USER",
              userId: "user-ops",
              role: "OPS_REVIEWER",
              organizationIds: [],
            },
            reason: "   ", // Blank reason
          },
          mockTx
        )
      ).rejects.toThrow(MissingReasonError);
    });

    it("throws UnauthorizedTransitionError when advertiser attempts to approve a campaign", async () => {
      const mockCampaign = {
        id: "camp-123",
        organizationId: "org-alpha",
        status: CampaignStatus.UNDER_REVIEW,
        version: 1,
      };
      const mockTx = createMockTx(mockCampaign);

      await expect(
        transition(
          {
            campaignId: "camp-123",
            toStatus: CampaignStatus.APPROVED_FOR_SCHEDULING,
            actor: {
              type: "USER",
              userId: "user-adv",
              role: "ADVERTISER",
              organizationIds: ["org-alpha"],
            },
          },
          mockTx
        )
      ).rejects.toThrow(UnauthorizedTransitionError);
    });

    it("throws UnauthorizedTransitionError when advertiser attempts cross-organization cancel", async () => {
      const mockCampaign = {
        id: "camp-123",
        organizationId: "org-alpha", // Belongs to org-alpha
        status: CampaignStatus.SUBMITTED,
        version: 1,
      };
      const mockTx = createMockTx(mockCampaign);

      await expect(
        transition(
          {
            campaignId: "camp-123",
            toStatus: CampaignStatus.CANCELLED,
            actor: {
              type: "USER",
              userId: "user-adv-beta",
              role: "ADVERTISER",
              organizationIds: ["org-beta"], // Belongs to org-beta
            },
          },
          mockTx
        )
      ).rejects.toThrow(UnauthorizedTransitionError);
    });

    it("permits Ops Reviewer to reject with reason and generates owner notification", async () => {
      const mockCampaign = {
        id: "camp-123",
        organizationId: "org-alpha",
        createdById: "user-adv",
        name: "Festival Banner",
        status: CampaignStatus.UNDER_REVIEW,
        version: 1,
      };
      const mockTx = createMockTx(mockCampaign);

      const result = await transition(
        {
          campaignId: "camp-123",
          toStatus: CampaignStatus.REJECTED,
          actor: {
            type: "USER",
            userId: "user-ops",
            role: "OPS_REVIEWER",
            organizationIds: [],
          },
          reason: "Creative resolution does not meet safety visibility standards.",
        },
        mockTx
      );

      expect(result.success).toBe(true);
      expect(result.toStatus).toBe(CampaignStatus.REJECTED);

      // Notification created for owner
      expect(mockTx.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: "user-adv",
          title: "Campaign Status: REJECTED",
        }),
      });
    });
  });
});
