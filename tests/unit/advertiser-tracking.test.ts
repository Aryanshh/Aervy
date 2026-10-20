import { describe, it, expect, beforeEach, vi } from "vitest";
import { CampaignStatus } from "@prisma/client";
import {
  getAdvertiserCampaigns,
  getAdvertiserCampaignDetail,
  resubmitAdvertiserCampaign,
  cancelAdvertiserCampaign,
} from "@/lib/campaigns/advertiser";
import { AuthContextUser } from "@/lib/permissions/can";

interface MockZone {
  id: string;
  name: string;
  ratePerHourPaise: number;
}

interface MockOrganization {
  id: string;
  name: string;
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

const { dbState, mockDb } = vi.hoisted(() => {
  const dbState = {
    zones: new Map<string, MockZone>(),
    organizations: new Map<string, MockOrganization>(),
    users: new Map<string, MockUser>(),
    campaigns: new Map<string, MockCampaign>(),
    quotes: [] as Array<Record<string, unknown>>,
    payments: [] as Array<Record<string, unknown>>,
    statusEvents: [] as Array<Record<string, unknown>>,
    auditLogs: [] as Array<Record<string, unknown>>,
    notifications: [] as Array<Record<string, unknown>>,
    decisions: [] as Array<Record<string, unknown>>,
    slotHolds: [] as Array<Record<string, unknown>>,
    assets: [] as Array<Record<string, unknown>>,
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
              name: "Acme India",
            };
          }
          if (include?.createdBy) {
            result.createdBy = dbState.users.get(camp.createdById) ?? {
              id: camp.createdById,
              name: "Advertiser User",
              email: "advertiser@acme.in",
            };
          }
          if (include?.zone && camp.zoneId) {
            result.zone = dbState.zones.get(camp.zoneId) ?? null;
          }
          if (include?.assets) {
            result.assets = dbState.assets.filter((a) => a.campaignId === camp.id);
          }
          if (include?.quotes) {
            result.quotes = dbState.quotes.filter((q) => q.campaignId === camp.id);
          }
          if (include?.payments) {
            result.payments = dbState.payments.filter((p) => p.campaignId === camp.id);
          }
          if (include?.statusEvents) {
            result.statusEvents = dbState.statusEvents.filter((e) => e.campaignId === camp.id);
          }
          if (include?.decisions) {
            result.decisions = dbState.decisions.filter((d) => d.campaignId === camp.id);
          }
          if (include?.slotHolds) {
            result.slotHolds = dbState.slotHolds.filter((s) => s.campaignId === camp.id);
          }
          return result;
        }
      ),
      findMany: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
        let camps = Array.from(dbState.campaigns.values());

        // Org isolation
        if (where?.organizationId) {
          if (typeof where.organizationId === "object" && "in" in (where.organizationId as object)) {
            const orgList = (where.organizationId as { in: string[] }).in;
            camps = camps.filter((c) => orgList.includes(c.organizationId));
          } else {
            camps = camps.filter((c) => c.organizationId === where.organizationId);
          }
        }

        // Status
        if (where?.status) {
          if (typeof where.status === "object" && "in" in (where.status as object)) {
            const statusList = (where.status as { in: CampaignStatus[] }).in;
            camps = camps.filter((c) => statusList.includes(c.status));
          } else {
            camps = camps.filter((c) => c.status === where.status);
          }
        }

        // Search OR
        if (where?.OR && Array.isArray(where.OR)) {
          camps = camps.filter((c) => {
            return (where.OR as Array<Record<string, { contains: string }>>).some((cond) => {
              if (cond.name?.contains) {
                return c.name.toLowerCase().includes(cond.name.contains.toLowerCase());
              }
              if (cond.brand?.contains) {
                return c.brand.toLowerCase().includes(cond.brand.contains.toLowerCase());
              }
              return false;
            });
          });
        }

        return camps.map((c) => ({
          ...c,
          organization: dbState.organizations.get(c.organizationId) ?? {
            id: c.organizationId,
            name: "Org",
          },
          zone: c.zoneId ? dbState.zones.get(c.zoneId) ?? null : null,
          assets: dbState.assets.filter((a) => a.campaignId === c.id),
          quotes: dbState.quotes.filter((q) => q.campaignId === c.id),
          payments: dbState.payments.filter((p) => p.campaignId === c.id),
          decisions: dbState.decisions.filter((d) => d.campaignId === c.id),
        }));
      }),
      count: vi.fn(async ({ where }: { where?: Record<string, unknown> }) => {
        let camps = Array.from(dbState.campaigns.values());

        if (where?.organizationId) {
          if (typeof where.organizationId === "object" && "in" in (where.organizationId as object)) {
            const orgList = (where.organizationId as { in: string[] }).in;
            camps = camps.filter((c) => orgList.includes(c.organizationId));
          } else {
            camps = camps.filter((c) => c.organizationId === where.organizationId);
          }
        }

        if (where?.status) {
          if (typeof where.status === "object" && "in" in (where.status as object)) {
            const statusList = (where.status as { in: CampaignStatus[] }).in;
            camps = camps.filter((c) => statusList.includes(c.status));
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
      findMany: vi.fn(async () => []),
    },
    refund: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => data),
    },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => {
      return await cb(mockDb);
    }),
  };

  return { dbState, mockDb };
});

vi.mock("@/lib/db", () => {
  return { db: mockDb };
});

describe("Stage 7: Advertiser Campaign Tracking", () => {
  const orgAlpha = "org-alpha-acme";
  const orgBeta = "org-beta-competitor";
  const testZoneId = "zone-blr-central";

  const userAlpha: AuthContextUser = {
    id: "user-alpha",
    role: "ADVERTISER",
    organizationIds: [orgAlpha],
    isActive: true,
  };

  const userBeta: AuthContextUser = {
    id: "user-beta",
    role: "ADVERTISER",
    organizationIds: [orgBeta],
    isActive: true,
  };

  const userAdmin: AuthContextUser = {
    id: "user-admin",
    role: "ADMIN",
    organizationIds: [],
    isActive: true,
  };

  beforeEach(() => {
    dbState.zones.clear();
    dbState.organizations.clear();
    dbState.users.clear();
    dbState.campaigns.clear();
    dbState.quotes.length = 0;
    dbState.payments.length = 0;
    dbState.statusEvents.length = 0;
    dbState.auditLogs.length = 0;
    dbState.notifications.length = 0;
    dbState.decisions.length = 0;
    dbState.slotHolds.length = 0;
    dbState.assets.length = 0;

    // Seed test orgs
    dbState.organizations.set(orgAlpha, { id: orgAlpha, name: "Acme India" });
    dbState.organizations.set(orgBeta, { id: orgBeta, name: "Beta Corp" });

    // Seed test zone
    dbState.zones.set(testZoneId, {
      id: testZoneId,
      name: "MG Road Airspace",
      ratePerHourPaise: 450000,
    });
  });

  describe("getAdvertiserCampaigns", () => {
    it("returns only campaigns belonging to advertiser's organization (multi-tenant isolation)", async () => {
      // Org Alpha campaign
      dbState.campaigns.set("camp-a1", {
        id: "camp-a1",
        name: "Acme Diwali Fest",
        brand: "Acme",
        objective: "Awareness",
        description: null,
        organizationId: orgAlpha,
        createdById: userAlpha.id,
        zoneId: testZoneId,
        startAt: new Date("2026-11-01T10:00:00Z"),
        endAt: new Date("2026-11-01T12:00:00Z"),
        status: CampaignStatus.DRAFT,
        version: 0,
        flexibility: "FIXED",
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Org Beta campaign
      dbState.campaigns.set("camp-b1", {
        id: "camp-b1",
        name: "Beta Mega Expo",
        brand: "Beta",
        objective: "Traffic",
        description: null,
        organizationId: orgBeta,
        createdById: userBeta.id,
        zoneId: testZoneId,
        startAt: new Date("2026-11-05T10:00:00Z"),
        endAt: new Date("2026-11-05T12:00:00Z"),
        status: CampaignStatus.SUBMITTED,
        version: 1,
        flexibility: "FIXED",
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const resAlpha = await getAdvertiserCampaigns({}, userAlpha);
      expect(resAlpha.campaigns).toHaveLength(1);
      expect(resAlpha.campaigns[0]?.id).toBe("camp-a1");
      expect(resAlpha.counts.all).toBe(1);
      expect(resAlpha.counts.draft).toBe(1);

      const resBeta = await getAdvertiserCampaigns({}, userBeta);
      expect(resBeta.campaigns).toHaveLength(1);
      expect(resBeta.campaigns[0]?.id).toBe("camp-b1");
      expect(resBeta.counts.all).toBe(1);
      expect(resBeta.counts.review).toBe(1);
    });

    it("throws unauthorized error if advertiser requests another organization's campaigns", async () => {
      await expect(
        getAdvertiserCampaigns({ organizationId: orgBeta }, userAlpha)
      ).rejects.toThrow("Unauthorized: User is not a member of organization 'org-beta-competitor'");
    });

    it("filters campaigns by statusCategory correctly", async () => {
      // 1 Draft, 1 Under Review, 1 Scheduled
      dbState.campaigns.set("camp-1", {
        id: "camp-1",
        name: "Draft Camp",
        brand: "Acme",
        objective: "Awareness",
        description: null,
        organizationId: orgAlpha,
        createdById: userAlpha.id,
        zoneId: null,
        startAt: null,
        endAt: null,
        status: CampaignStatus.DRAFT,
        version: 0,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      dbState.campaigns.set("camp-2", {
        id: "camp-2",
        name: "Under Review Camp",
        brand: "Acme",
        objective: "Awareness",
        description: null,
        organizationId: orgAlpha,
        createdById: userAlpha.id,
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

      dbState.campaigns.set("camp-3", {
        id: "camp-3",
        name: "Scheduled Camp",
        brand: "Acme",
        objective: "Awareness",
        description: null,
        organizationId: orgAlpha,
        createdById: userAlpha.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.SCHEDULED,
        version: 3,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const reviewFiltered = await getAdvertiserCampaigns(
        { statusCategory: "review" },
        userAlpha
      );
      expect(reviewFiltered.campaigns).toHaveLength(1);
      expect(reviewFiltered.campaigns[0]?.id).toBe("camp-2");

      const activeFiltered = await getAdvertiserCampaigns(
        { statusCategory: "active" },
        userAlpha
      );
      expect(activeFiltered.campaigns).toHaveLength(1);
      expect(activeFiltered.campaigns[0]?.id).toBe("camp-3");

      expect(activeFiltered.counts.all).toBe(3);
      expect(activeFiltered.counts.draft).toBe(1);
      expect(activeFiltered.counts.review).toBe(1);
      expect(activeFiltered.counts.active).toBe(1);
    });
  });

  describe("getAdvertiserCampaignDetail", () => {
    it("returns comprehensive campaign detail for authorized advertiser", async () => {
      dbState.campaigns.set("camp-detail-1", {
        id: "camp-detail-1",
        name: "Festive Blitz",
        brand: "Acme",
        objective: "Direct Response",
        description: "Full description",
        organizationId: orgAlpha,
        createdById: userAlpha.id,
        zoneId: testZoneId,
        startAt: new Date("2026-11-01T18:00:00Z"),
        endAt: new Date("2026-11-01T20:00:00Z"),
        status: CampaignStatus.SUBMITTED,
        version: 1,
        flexibility: "FIXED",
        audienceNotes: "Tech park crowd",
        ctaText: "Shop Now",
        destinationUrl: "https://acme.in",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      dbState.quotes.push({
        id: "quote-1",
        campaignId: "camp-detail-1",
        totalPaise: 1062000,
        gstPaise: 162000,
        subtotalPaise: 900000,
        inputsHash: "hash123",
      });

      const detail = await getAdvertiserCampaignDetail("camp-detail-1", userAlpha);
      expect(detail.id).toBe("camp-detail-1");
      expect(detail.name).toBe("Festive Blitz");
      expect(detail.organization.name).toBe("Acme India");
      expect(detail.quotes).toHaveLength(1);
      expect(detail.zone?.name).toBe("MG Road Airspace");
    });

    it("strictly blocks cross-organization detail inspection (IDOR defense)", async () => {
      dbState.campaigns.set("camp-secret", {
        id: "camp-secret",
        name: "Confidential Launch",
        brand: "Beta",
        objective: "Launch",
        description: null,
        organizationId: orgBeta,
        createdById: userBeta.id,
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

      await expect(
        getAdvertiserCampaignDetail("camp-secret", userAlpha)
      ).rejects.toThrow("Unauthorized");
    });

    it("allows admin user to inspect any campaign detail", async () => {
      dbState.campaigns.set("camp-any", {
        id: "camp-any",
        name: "Any Org Campaign",
        brand: "Beta",
        objective: "Launch",
        description: null,
        organizationId: orgBeta,
        createdById: userBeta.id,
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

      const camp = await getAdvertiserCampaignDetail("camp-any", userAdmin);
      expect(camp.id).toBe("camp-any");
    });
  });

  describe("resubmitAdvertiserCampaign", () => {
    it("transitions CHANGES_REQUESTED -> SUBMITTED with advertiser notes", async () => {
      dbState.campaigns.set("camp-changes", {
        id: "camp-changes",
        name: "Creative Resolution Issue",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: orgAlpha,
        createdById: userAlpha.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.CHANGES_REQUESTED,
        version: 2,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await resubmitAdvertiserCampaign({
        campaignId: "camp-changes",
        user: userAlpha,
        notes: "Uploaded new high-contrast 1080p banner asset with dark text as requested.",
      });

      expect(res.toStatus).toBe(CampaignStatus.SUBMITTED);
      expect(dbState.campaigns.get("camp-changes")?.status).toBe(CampaignStatus.SUBMITTED);
      expect(dbState.statusEvents.length).toBeGreaterThan(0);
    });

    it("rejects resubmission if campaign is not in CHANGES_REQUESTED state", async () => {
      dbState.campaigns.set("camp-draft", {
        id: "camp-draft",
        name: "Draft Campaign",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: orgAlpha,
        createdById: userAlpha.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.DRAFT,
        version: 0,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        resubmitAdvertiserCampaign({
          campaignId: "camp-draft",
          user: userAlpha,
        })
      ).rejects.toThrow("Cannot resubmit campaign with status 'DRAFT'");
    });
  });

  describe("cancelAdvertiserCampaign", () => {
    it("allows advertiser to cancel campaign from DRAFT or SUBMITTED", async () => {
      dbState.campaigns.set("camp-cancel", {
        id: "camp-cancel",
        name: "Unwanted Campaign",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: orgAlpha,
        createdById: userAlpha.id,
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

      const res = await cancelAdvertiserCampaign({
        campaignId: "camp-cancel",
        user: userAlpha,
        reason: "Event postponed by marketing team",
      });

      expect(res.toStatus).toBe(CampaignStatus.CANCELLED);
      expect(dbState.campaigns.get("camp-cancel")?.status).toBe(CampaignStatus.CANCELLED);
    });

    it("rejects advertiser from cancelling a COMPLETED campaign", async () => {
      dbState.campaigns.set("camp-done", {
        id: "camp-done",
        name: "Finished Flight",
        brand: "Acme",
        objective: "Sales",
        description: null,
        organizationId: orgAlpha,
        createdById: userAlpha.id,
        zoneId: testZoneId,
        startAt: null,
        endAt: null,
        status: CampaignStatus.COMPLETED,
        version: 4,
        flexibility: null,
        audienceNotes: null,
        ctaText: null,
        destinationUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        cancelAdvertiserCampaign({
          campaignId: "camp-done",
          user: userAlpha,
          reason: "Attempted cancellation",
        })
      ).rejects.toThrow("not authorized to cancel");
    });
  });
});
