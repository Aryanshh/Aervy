import { describe, it, expect, beforeEach, vi } from "vitest";
import { CampaignStatus, PaymentStatus } from "@prisma/client";
import {
  getOpsReviewQueue,
  getOpsCampaignDetail,
  submitReviewDecision,
  advanceOperationalMilestone,
} from "@/lib/ops/review";
import { AuthContextUser } from "@/lib/permissions/can";

interface MockZone {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  ratePerHourPaise: number;
  status: string;
  isActive: boolean;
  capacity: number;
  geojson: unknown;
  centerLat: number;
  centerLng: number;
}

interface MockOrganization {
  id: string;
  name: string;
  slug: string;
}

interface MockUser {
  id: string;
  name: string;
  email: string;
}

interface MockCampaign {
  id: string;
  name: string;
  brand: string;
  objective: string;
  description: string | null;
  organizationId: string;
  createdById: string;
  zoneId: string | null;
  startAt: Date | null;
  endAt: Date | null;
  status: CampaignStatus;
  version: number;
  flexibility: string | null;
  audienceNotes: string | null;
  ctaText: string | null;
  destinationUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockReviewDecision {
  id: string;
  campaignId: string;
  reviewerId: string;
  decision: string;
  reason: string;
  constraints: string | null;
  createdAt: Date;
}

const { dbState, mockDb } = vi.hoisted(() => {
  const dbState = {
    zones: new Map<string, MockZone>(),
    organizations: new Map<string, MockOrganization>(),
    users: new Map<string, MockUser>(),
    campaigns: new Map<string, MockCampaign>(),
    reviewDecisions: new Map<string, MockReviewDecision>(),
    statusEvents: [] as Array<Record<string, unknown>>,
    auditLogs: [] as Array<Record<string, unknown>>,
    notifications: [] as Array<Record<string, unknown>>,
    payments: [] as Array<Record<string, unknown>>,
    refunds: [] as Array<Record<string, unknown>>,
  };

  const mockDb = {
    campaign: {
      findUnique: vi.fn(
        async ({
          where,
          include,
        }: {
          where: { id: string };
          include?: Record<string, unknown>;
        }) => {
          const camp = dbState.campaigns.get(where.id);
          if (!camp) return null;

          const result: Record<string, unknown> = { ...camp };
          if (include?.organization) {
            result.organization = dbState.organizations.get(camp.organizationId) ?? {
              id: camp.organizationId,
              name: "Test Org",
              slug: "test-org",
            };
          }
          if (include?.createdBy) {
            result.createdBy = dbState.users.get(camp.createdById) ?? {
              id: camp.createdById,
              name: "Test Submitter",
              email: "submitter@test.com",
            };
          }
          if (include?.zone && camp.zoneId) {
            result.zone = dbState.zones.get(camp.zoneId) ?? null;
          }
          if (include?.assets) {
            result.assets = [];
          }
          if (include?.quotes) {
            result.quotes = [];
          }
          if (include?.payments) {
            result.payments = dbState.payments.filter((p) => p.campaignId === camp.id);
          }
          if (include?.statusEvents) {
            result.statusEvents = dbState.statusEvents.filter((e) => e.campaignId === camp.id);
          }
          if (include?.decisions) {
            result.decisions = Array.from(dbState.reviewDecisions.values()).filter(
              (d) => d.campaignId === camp.id
            );
          }
          if (include?.slotHolds) {
            result.slotHolds = [];
          }
          return result;
        }
      ),
      findMany: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
        let camps = Array.from(dbState.campaigns.values());
        if (where?.status) {
          camps = camps.filter((c) => c.status === where.status);
        }
        if (where?.zoneId) {
          camps = camps.filter((c) => c.zoneId === where.zoneId);
        }
        return camps.map((camp) => ({
          ...camp,
          organization: dbState.organizations.get(camp.organizationId) ?? {
            id: camp.organizationId,
            name: "Test Org",
          },
          zone: camp.zoneId ? dbState.zones.get(camp.zoneId) ?? null : null,
          assets: [],
          payments: [],
          decisions: [],
        }));
      }),
      count: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
        let camps = Array.from(dbState.campaigns.values());
        if (where?.status) {
          if (typeof where.status === "object" && "in" in where.status) {
            const inList = (where.status as { in: CampaignStatus[] }).in;
            camps = camps.filter((c) => inList.includes(c.status));
          } else {
            camps = camps.filter((c) => c.status === where.status);
          }
        }
        return camps.length;
      }),
      update: vi.fn(
        async ({
          where,
          data,
        }: {
          where: { id: string };
          data: { status?: CampaignStatus; version?: { increment: number } };
        }) => {
          const camp = dbState.campaigns.get(where.id);
          if (!camp) throw new Error("Campaign not found");
          if (data.status) camp.status = data.status;
          if (data.version?.increment) camp.version += data.version.increment;
          camp.updatedAt = new Date();
          dbState.campaigns.set(camp.id, camp);
          return { ...camp };
        }
      ),
    },
    reviewDecision: {
      create: vi.fn(async ({ data }: { data: Omit<MockReviewDecision, "id" | "createdAt"> }) => {
        const dec: MockReviewDecision = {
          id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          createdAt: new Date(),
          ...data,
        };
        dbState.reviewDecisions.set(dec.id, dec);
        return dec;
      }),
    },
    statusEvent: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        dbState.statusEvents.push(data);
        return data;
      }),
    },
    auditLog: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        dbState.auditLogs.push(data);
        return data;
      }),
    },
    notification: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        dbState.notifications.push(data);
        return data;
      }),
    },
    payment: {
      findMany: vi.fn(async ({ where }: { where: { campaignId: string; status?: string } }) => {
        return dbState.payments.filter((p) => p.campaignId === where.campaignId && (!where.status || p.status === where.status));
      }),
    },
    refund: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        dbState.refunds.push(data);
        return data;
      }),
    },
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
      return await callback(mockDb);
    }),
  };

  return { dbState, mockDb };
});

vi.mock("@/lib/db", () => {
  return { db: mockDb };
});

describe("Stage 6: Operations Reviewer Dashboard & Workflow", () => {
  let opsUser: AuthContextUser;
  let advertiserUser: AuthContextUser;
  let adminUser: AuthContextUser;
  const testZoneId = "zone-ops-blr";
  const testOrgId = "org-ops-acme";

  beforeEach(() => {
    dbState.zones.clear();
    dbState.organizations.clear();
    dbState.users.clear();
    dbState.campaigns.clear();
    dbState.reviewDecisions.clear();
    dbState.statusEvents.length = 0;
    dbState.auditLogs.length = 0;
    dbState.notifications.length = 0;
    dbState.payments.length = 0;
    dbState.refunds.length = 0;

    opsUser = {
      id: "user-ops-reviewer",
      role: "OPS_REVIEWER",
      organizationIds: [],
      isActive: true,
    };

    advertiserUser = {
      id: "user-advertiser",
      role: "ADVERTISER",
      organizationIds: [testOrgId],
      isActive: true,
    };

    adminUser = {
      id: "user-admin",
      role: "ADMIN",
      organizationIds: [],
      isActive: true,
    };

    // Seed Zone & Org
    dbState.zones.set(testZoneId, {
      id: testZoneId,
      name: "MG Road Green Airspace",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      ratePerHourPaise: 450000,
      status: "APPROVED",
      isActive: true,
      capacity: 2,
      centerLat: 12.9716,
      centerLng: 77.5946,
      geojson: {},
    });

    dbState.organizations.set(testOrgId, {
      id: testOrgId,
      name: "Acme India",
      slug: "acme-india",
    });
  });

  // --------------------------------------------------------------------------
  // 1. Review Queue & Counters (`getOpsReviewQueue`)
  // --------------------------------------------------------------------------
  describe("getOpsReviewQueue", () => {
    it("returns review queue campaigns and calculates status counts correctly", async () => {
      // Seed 2 SUBMITTED, 1 UNDER_REVIEW, 1 APPROVED
      dbState.campaigns.set("camp-1", {
        id: "camp-1",
        name: "Festive Sale 1",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: new Date("2026-11-01T10:00:00Z"),
        endAt: new Date("2026-11-01T12:00:00Z"),
        status: CampaignStatus.SUBMITTED,
        version: 1,
        flexibility: "FIXED",
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      dbState.campaigns.set("camp-2", {
        id: "camp-2",
        name: "Festive Sale 2",
        brand: "Acme",
        objective: "Awareness",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: new Date("2026-11-02T10:00:00Z"),
        endAt: new Date("2026-11-02T12:00:00Z"),
        status: CampaignStatus.SUBMITTED,
        version: 1,
        flexibility: "FIXED",
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      dbState.campaigns.set("camp-3", {
        id: "camp-3",
        name: "Under Review Campaign",
        brand: "Acme",
        objective: "Launch",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: new Date("2026-11-03T10:00:00Z"),
        endAt: new Date("2026-11-03T12:00:00Z"),
        status: CampaignStatus.UNDER_REVIEW,
        version: 2,
        flexibility: "FIXED",
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const queue = await getOpsReviewQueue();
      expect(queue.campaigns).toHaveLength(3);
      expect(queue.counts.submitted).toBe(2);
      expect(queue.counts.underReview).toBe(1);
      expect(queue.counts.approved).toBe(0);
    });

    it("filters queue by specific status", async () => {
      dbState.campaigns.set("camp-sub", {
        id: "camp-sub",
        name: "Submitted Campaign",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.SUBMITTED,
        version: 1,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      dbState.campaigns.set("camp-app", {
        id: "camp-app",
        name: "Approved Campaign",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.APPROVED_FOR_SCHEDULING,
        version: 2,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const filtered = await getOpsReviewQueue({ status: CampaignStatus.SUBMITTED });
      expect(filtered.campaigns).toHaveLength(1);
      expect(filtered.campaigns[0]?.id).toBe("camp-sub");
    });
  });

  // --------------------------------------------------------------------------
  // 2. Campaign Detail Retrieval (`getOpsCampaignDetail`)
  // --------------------------------------------------------------------------
  describe("getOpsCampaignDetail", () => {
    it("returns comprehensive campaign detail and throws for non-existent IDs", async () => {
      dbState.campaigns.set("camp-detail-1", {
        id: "camp-detail-1",
        name: "Detailed Promo",
        brand: "BrandX",
        objective: "Direct Response",
        description: "Full campaign description",
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: new Date("2026-11-05T14:00:00Z"),
        endAt: new Date("2026-11-05T16:00:00Z"),
        status: CampaignStatus.SUBMITTED,
        version: 1,
        flexibility: "FIXED",
        audienceNotes: "Shoppers on MG road",
        ctaText: "Shop Now",
        destinationUrl: "https://brandx.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const detail = await getOpsCampaignDetail("camp-detail-1");
      expect(detail.id).toBe("camp-detail-1");
      expect(detail.organization.name).toBe("Acme India");
      expect(detail.zone?.name).toBe("MG Road Green Airspace");

      await expect(getOpsCampaignDetail("non-existent-camp")).rejects.toThrow("not found");
    });
  });

  // --------------------------------------------------------------------------
  // 3. Review Decisions & Authorization Gates (`submitReviewDecision`)
  // --------------------------------------------------------------------------
  describe("submitReviewDecision", () => {
    it("denies advertiser from reviewing or approving campaigns (RBAC enforcement)", async () => {
      dbState.campaigns.set("camp-rbac", {
        id: "camp-rbac",
        name: "RBAC Campaign",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.SUBMITTED,
        version: 1,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Advertiser trying to approve own campaign
      await expect(
        submitReviewDecision({
          campaignId: "camp-rbac",
          reviewer: advertiserUser,
          decision: "APPROVE",
          reason: "Self approval attempt",
        })
      ).rejects.toThrow("not authorized to perform 'campaign:approve'");
    });

    it("allows Ops Reviewer to pick up campaign (SUBMITTED -> UNDER_REVIEW)", async () => {
      dbState.campaigns.set("camp-pickup", {
        id: "camp-pickup",
        name: "Pick Up Test",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.SUBMITTED,
        version: 1,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await submitReviewDecision({
        campaignId: "camp-pickup",
        reviewer: opsUser,
        decision: "PICK_UP",
        reason: "Assigned reviewer starting feasibility review",
      });

      expect(res.transitionResult.toStatus).toBe(CampaignStatus.UNDER_REVIEW);
      expect(dbState.campaigns.get("camp-pickup")?.status).toBe(CampaignStatus.UNDER_REVIEW);
      expect(dbState.reviewDecisions.size).toBe(1);
    });

    it("executes REQUEST_CHANGES (UNDER_REVIEW -> CHANGES_REQUESTED) with required reviewer note", async () => {
      dbState.campaigns.set("camp-changes", {
        id: "camp-changes",
        name: "Creative Resolution Issue",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.UNDER_REVIEW,
        version: 2,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await submitReviewDecision({
        campaignId: "camp-changes",
        reviewer: opsUser,
        decision: "REQUEST_CHANGES",
        reason: "Creative contrast too low for safe ground visibility. Please upload 1080p asset with darker text.",
      });

      expect(res.transitionResult.toStatus).toBe(CampaignStatus.CHANGES_REQUESTED);
      expect(dbState.campaigns.get("camp-changes")?.status).toBe(CampaignStatus.CHANGES_REQUESTED);

      const decision = Array.from(dbState.reviewDecisions.values())[0];
      expect(decision?.decision).toBe("REQUEST_CHANGES");
      expect(decision?.reason).toContain("Creative contrast too low");
    });

    it("executes APPROVE (UNDER_REVIEW -> APPROVED_FOR_SCHEDULING) with operational constraints", async () => {
      dbState.campaigns.set("camp-approve", {
        id: "camp-approve",
        name: "Feasible Campaign",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.UNDER_REVIEW,
        version: 2,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await submitReviewDecision({
        campaignId: "camp-approve",
        reviewer: opsUser,
        decision: "APPROVE",
        reason: "All 4 pre-flight pillars verified. Clear Green Zone airspace.",
        constraints: "Ground winds strictly under 14 knots; deploy after 6:30 PM",
      });

      expect(res.transitionResult.toStatus).toBe(CampaignStatus.APPROVED_FOR_SCHEDULING);
      expect(dbState.campaigns.get("camp-approve")?.status).toBe(CampaignStatus.APPROVED_FOR_SCHEDULING);

      const decision = Array.from(dbState.reviewDecisions.values())[0];
      expect(decision?.constraints).toContain("Ground winds strictly under 14 knots");
    });

    it("executes REJECT (UNDER_REVIEW -> REJECTED) with mandatory reason and automated refund linkage", async () => {
      dbState.campaigns.set("camp-reject", {
        id: "camp-reject",
        name: "Hazardous Display",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.UNDER_REVIEW,
        version: 2,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Seed a paid payment
      dbState.payments.push({
        id: "pay-to-refund-1",
        campaignId: "camp-reject",
        amountPaise: 500000,
        status: "PAID",
        providerOrderId: "order_fake_123",
        providerPaymentId: "pay_fake_456",
        refunds: [],
      });

      const res = await submitReviewDecision({
        campaignId: "camp-reject",
        reviewer: opsUser,
        decision: "REJECT",
        reason: "Disallowed strobe sequence and restricted airspace proximity.",
      });

      expect(res.transitionResult.toStatus).toBe(CampaignStatus.REJECTED);
      expect(dbState.campaigns.get("camp-reject")?.status).toBe(CampaignStatus.REJECTED);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Operational Milestones (`advanceOperationalMilestone`)
  // --------------------------------------------------------------------------
  describe("advanceOperationalMilestone", () => {
    it("progresses campaign through real-world operational flight deployment states", async () => {
      const campId = "camp-flight-1";
      dbState.campaigns.set(campId, {
        id: campId,
        name: "Diwali Flight",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: new Date("2026-11-01T18:00:00Z"),
        endAt: new Date("2026-11-01T20:00:00Z"),
        status: CampaignStatus.APPROVED_FOR_SCHEDULING,
        version: 3,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 1. APPROVED_FOR_SCHEDULING -> SCHEDULED
      const step1 = await advanceOperationalMilestone({
        campaignId: campId,
        opsUser,
        toStatus: CampaignStatus.SCHEDULED,
        note: "Drone operator assigned, flight slot confirmed.",
      });
      expect(step1.toStatus).toBe(CampaignStatus.SCHEDULED);

      // 2. SCHEDULED -> READY_FOR_OPERATIONS
      const step2 = await advanceOperationalMilestone({
        campaignId: campId,
        opsUser,
        toStatus: CampaignStatus.READY_FOR_OPERATIONS,
        note: "Pre-flight equipment and weather checks confirmed on site.",
      });
      expect(step2.toStatus).toBe(CampaignStatus.READY_FOR_OPERATIONS);

      // 3. READY_FOR_OPERATIONS -> IN_PROGRESS
      const step3 = await advanceOperationalMilestone({
        campaignId: campId,
        opsUser,
        toStatus: CampaignStatus.IN_PROGRESS,
        note: "Simulated flight airborne and active over Indiranagar zone.",
      });
      expect(step3.toStatus).toBe(CampaignStatus.IN_PROGRESS);

      // 4. IN_PROGRESS -> COMPLETED
      const step4 = await advanceOperationalMilestone({
        campaignId: campId,
        opsUser,
        toStatus: CampaignStatus.COMPLETED,
        note: "Flight hours fulfilled successfully without telemetry incidents.",
      });
      expect(step4.toStatus).toBe(CampaignStatus.COMPLETED);
    });

    it("rejects unauthorized users from advancing operational milestones", async () => {
      dbState.campaigns.set("camp-unauth", {
        id: "camp-unauth",
        name: "Unauth Milestone",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: testOrgId,
        createdById: advertiserUser.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.SCHEDULED,
        version: 1,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Advertiser cannot update operational schedule
      await expect(
        advanceOperationalMilestone({
          campaignId: "camp-unauth",
          opsUser: advertiserUser,
          toStatus: CampaignStatus.READY_FOR_OPERATIONS,
        })
      ).rejects.toThrow("not authorized to update operational schedule");
    });
  });
});
