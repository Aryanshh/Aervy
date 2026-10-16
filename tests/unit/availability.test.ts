import { describe, it, expect, vi } from "vitest";
import { checkSlotAvailability } from "@/lib/availability/check";
import {
  createSlotHold,
  convertSlotHold,
  releaseSlotHold,
  expireStaleSlotHolds,
} from "@/lib/availability/hold";
import {
  SlotUnavailableError,
  InvalidSlotTimeError,
  ZoneNotFoundError,
} from "@/lib/availability/errors";
import { Prisma } from "@prisma/client";

describe("Stage 3 Availability & SlotHold Engine", () => {
  const zoneId = "zone-blr-mg-road";
  const startAt = new Date("2026-11-01T18:00:00Z");
  const endAt = new Date("2026-11-01T20:00:00Z");

  function createMockDb(overrides?: {
    zone?: { id: string; capacity: number; isActive: boolean } | null;
    campaignCount?: number;
    holdCount?: number;
    createdHold?: Record<string, unknown>;
  }) {
    const mockZone =
      overrides?.zone === undefined
        ? { id: zoneId, capacity: 1, isActive: true }
        : overrides.zone;

    return {
      zone: {
        findUnique: vi.fn().mockResolvedValue(mockZone),
      },
      campaign: {
        count: vi.fn().mockResolvedValue(overrides?.campaignCount ?? 0),
      },
      slotHold: {
        count: vi.fn().mockResolvedValue(overrides?.holdCount ?? 0),
        create: vi.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: "hold-new-123",
            ...data,
          })
        ),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as Prisma.TransactionClient;
  }

  describe("checkSlotAvailability", () => {
    it("reports slot available when there are zero conflicting bookings or holds", async () => {
      const mockClient = createMockDb({ campaignCount: 0, holdCount: 0 });

      const result = await checkSlotAvailability(
        {
          zoneId,
          startAt,
          endAt,
        },
        mockClient
      );

      expect(result.isAvailable).toBe(true);
      expect(result.conflictingCampaignsCount).toBe(0);
      expect(result.conflictingHoldsCount).toBe(0);
    });

    it("reports slot unavailable when an active campaign overlaps", async () => {
      const mockClient = createMockDb({ campaignCount: 1, holdCount: 0 });

      const result = await checkSlotAvailability(
        {
          zoneId,
          startAt,
          endAt,
        },
        mockClient
      );

      expect(result.isAvailable).toBe(false);
      expect(result.conflictingCampaignsCount).toBe(1);
    });

    it("reports slot unavailable when an active 15-minute slot hold exists", async () => {
      const mockClient = createMockDb({ campaignCount: 0, holdCount: 1 });

      const result = await checkSlotAvailability(
        {
          zoneId,
          startAt,
          endAt,
        },
        mockClient
      );

      expect(result.isAvailable).toBe(false);
      expect(result.conflictingHoldsCount).toBe(1);
    });

    it("throws ZoneNotFoundError if zone does not exist", async () => {
      const mockClient = createMockDb({ zone: null });

      await expect(
        checkSlotAvailability(
          {
            zoneId: "non-existent-zone",
            startAt,
            endAt,
          },
          mockClient
        )
      ).rejects.toThrow(ZoneNotFoundError);
    });

    it("throws InvalidSlotTimeError when end time is on or before start time", async () => {
      const mockClient = createMockDb();

      await expect(
        checkSlotAvailability(
          {
            zoneId,
            startAt,
            endAt: startAt,
          },
          mockClient
        )
      ).rejects.toThrow(InvalidSlotTimeError);
    });
  });

  describe("createSlotHold & Concurrency Collision Protection", () => {
    it("creates an active 15-minute hold when slot is free", async () => {
      const mockClient = createMockDb({ campaignCount: 0, holdCount: 0 });

      const hold = await createSlotHold(
        {
          campaignId: "camp-123",
          zoneId,
          startAt,
          endAt,
          holdMinutes: 15,
        },
        mockClient
      );

      expect(hold.status).toBe("ACTIVE");
      expect(hold.campaignId).toBe("camp-123");
      expect(hold.zoneId).toBe(zoneId);
      expect(hold.expiresAt.getTime()).toBeGreaterThan(Date.now() + 14 * 60 * 1000);
    });

    it("CRITICAL: Denies simultaneous booking collision — second hold throws SlotUnavailableError", async () => {
      // First attempt succeeds
      const freeClient = createMockDb({ campaignCount: 0, holdCount: 0 });
      const firstHold = await createSlotHold(
        {
          campaignId: "camp-buyer-1",
          zoneId,
          startAt,
          endAt,
        },
        freeClient
      );
      expect(firstHold.status).toBe("ACTIVE");

      // Second attempt on the same slot encounters the active hold (holdCount: 1)
      const collisionClient = createMockDb({ campaignCount: 0, holdCount: 1 });
      await expect(
        createSlotHold(
          {
            campaignId: "camp-buyer-2",
            zoneId,
            startAt,
            endAt,
          },
          collisionClient
        )
      ).rejects.toThrow(SlotUnavailableError);
    });
  });

  describe("SlotHold Lifecycle Transitions", () => {
    it("converts active hold upon payment verification", async () => {
      const mockClient = createMockDb();
      const count = await convertSlotHold("camp-123", mockClient);
      expect(count).toBe(1);
    });

    it("releases active hold on cancellation or abandonment", async () => {
      const mockClient = createMockDb();
      const count = await releaseSlotHold("camp-123", mockClient);
      expect(count).toBe(1);
    });

    it("expires past-due active holds during sweep", async () => {
      const mockClient = createMockDb();
      const count = await expireStaleSlotHolds(mockClient);
      expect(count).toBe(1);
    });
  });
});
