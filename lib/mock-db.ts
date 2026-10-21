import { CampaignStatus, PaymentStatus, Role } from "@prisma/client";

// In-Memory Pilot Database for instant local demonstration without external database dependencies

export interface InMemoryUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryOrganization {
  id: string;
  name: string;
  contactEmail: string;
  gstin: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryOrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: Date;
}

export interface InMemoryZone {
  id: string;
  name: string;
  description: string | null;
  centerLat: number;
  centerLng: number;
  timezone: string;
  ratePerHourPaise: number;
  capacity: number;
  isActive: boolean;
  notes: string | null;
  geojson: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryCampaign {
  id: string;
  organizationId: string;
  createdById: string;
  name: string;
  brand: string;
  objective: string;
  description: string | null;
  status: CampaignStatus;
  zoneId: string | null;
  startAt: Date | null;
  endAt: Date | null;
  flexibility: string | null;
  audienceNotes: string | null;
  ctaText: string | null;
  destinationUrl: string | null;
  acknowledgedAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryCreativeAsset {
  id: string;
  campaignId: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  title: string | null;
  altText: string | null;
  validationStatus: string;
  validationNote: string | null;
  createdAt: Date;
}

export interface InMemoryQuote {
  id: string;
  campaignId: string;
  zoneRatePaise: number;
  billableHours: number;
  subtotalPaise: number;
  multiplierBps: number;
  discountPaise: number;
  gstBps: number;
  gstPaise: number;
  totalPaise: number;
  currency: string;
  inputsHash: string;
  createdAt: Date;
}

export interface InMemorySlotHold {
  id: string;
  campaignId: string;
  zoneId: string;
  startAt: Date;
  endAt: Date;
  expiresAt: Date;
  status: string;
  createdAt: Date;
}

export interface InMemoryPayment {
  id: string;
  campaignId: string;
  quoteId: string;
  provider: string;
  providerOrderId: string;
  providerPaymentId: string | null;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  failureReason: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface InMemoryRefund {
  id: string;
  paymentId: string;
  providerRefundId: string | null;
  amountPaise: number;
  reason: string;
  status: string;
  createdAt: Date;
}

export interface InMemoryReviewDecision {
  id: string;
  campaignId: string;
  reviewerId: string;
  decision: string;
  reason: string;
  constraints: string | null;
  createdAt: Date;
}

export interface InMemoryStatusEvent {
  id: string;
  campaignId: string;
  fromStatus: CampaignStatus | null;
  toStatus: CampaignStatus;
  actorId: string | null;
  actorType: string;
  reason: string | null;
  createdAt: Date;
}

export interface InMemoryNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  readAt: Date | null;
  createdAt: Date;
}

export interface InMemoryAuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  createdAt: Date;
}

class InMemoryDatabase {
  users = new Map<string, InMemoryUser>();
  organizations = new Map<string, InMemoryOrganization>();
  organizationMembers: InMemoryOrganizationMember[] = [];
  zones = new Map<string, InMemoryZone>();
  campaigns = new Map<string, InMemoryCampaign>();
  creativeAssets = new Map<string, InMemoryCreativeAsset>();
  quotes = new Map<string, InMemoryQuote>();
  slotHolds: InMemorySlotHold[] = [];
  payments = new Map<string, InMemoryPayment>();
  refunds = new Map<string, InMemoryRefund>();
  reviewDecisions = new Map<string, InMemoryReviewDecision>();
  statusEvents: InMemoryStatusEvent[] = [];
  notifications: InMemoryNotification[] = [];
  auditLogs: InMemoryAuditLog[] = [];

  constructor() {
    this.seedPilotData();
  }

  private seedPilotData() {
    const now = new Date();

    // 1. Users
    this.users.set("user-admin-1", {
      id: "user-admin-1",
      email: "admin@aervy.internal",
      name: "Aervy Administrator",
      role: Role.ADMIN,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    this.users.set("user-ops-reviewer", {
      id: "user-ops-reviewer",
      email: "ops@aervy.internal",
      name: "Captain Vikram Malhotra (DGCA Ops Lead)",
      role: Role.OPS_REVIEWER,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    this.users.set("user-advertiser-1", {
      id: "user-advertiser-1",
      email: "advertiser@acmebrands.in",
      name: "Priya Sharma (Acme Marketing)",
      role: Role.ADVERTISER,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    this.users.set("user-advertiser-2", {
      id: "user-advertiser-2",
      email: "advertiser2@starlight.com",
      name: "Rohan Varma (Starlight Media)",
      role: Role.ADVERTISER,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Organizations
    this.organizations.set("org-acme-india", {
      id: "org-acme-india",
      name: "Acme Brands India Pvt Ltd",
      contactEmail: "campaigns@acmebrands.in",
      gstin: "29AAAAA0000A1Z5",
      createdAt: now,
      updatedAt: now,
    });

    this.organizations.set("org-starlight-events", {
      id: "org-starlight-events",
      name: "Starlight Media & Events Pvt Ltd",
      contactEmail: "accounts@starlightmedia.com",
      gstin: "27BBBBB1111B1Z2",
      createdAt: now,
      updatedAt: now,
    });

    this.organizationMembers.push(
      {
        id: "mem-1",
        organizationId: "org-acme-india",
        userId: "user-advertiser-1",
        role: "OWNER",
        createdAt: now,
      },
      {
        id: "mem-2",
        organizationId: "org-starlight-events",
        userId: "user-advertiser-2",
        role: "OWNER",
        createdAt: now,
      }
    );

    // 3. Approved DGCA Green Zones
    const zonesList: InMemoryZone[] = [
      {
        id: "zone-blr-mg-road",
        name: "Bangalore MG Road Corridor",
        description: "High-visibility commercial perimeter along MG Road and Brigade Road junction.",
        centerLat: 12.9756,
        centerLng: 77.6066,
        timezone: "Asia/Kolkata",
        ratePerHourPaise: 450000,
        capacity: 2,
        isActive: true,
        notes: "Operating window: 18:00 - 22:00 IST. DGCA Green Zone verified.",
        geojson: {
          type: "Polygon",
          coordinates: [
            [
              [77.604, 12.974],
              [77.609, 12.974],
              [77.609, 12.978],
              [77.604, 12.978],
              [77.604, 12.974],
            ],
          ],
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "zone-mum-bkc",
        name: "Mumbai BKC Financial Hub",
        description: "Bandra Kurla Complex central business plaza and exhibition perimeter.",
        centerLat: 19.0664,
        centerLng: 72.8687,
        timezone: "Asia/Kolkata",
        ratePerHourPaise: 600000,
        capacity: 1,
        isActive: true,
        notes: "Proximity to airport approach. Flight subject to strict wind limits (<14 kts).",
        geojson: {
          type: "Polygon",
          coordinates: [
            [
              [72.864, 19.063],
              [72.873, 19.063],
              [72.873, 19.069],
              [72.864, 19.069],
              [72.864, 19.063],
            ],
          ],
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "zone-hyd-hitec",
        name: "Hyderabad Hitec City Cyber Towers",
        description: "IT corridor perimeter surrounding Cyber Towers and Knowledge City.",
        centerLat: 17.4474,
        centerLng: 78.3762,
        timezone: "Asia/Kolkata",
        ratePerHourPaise: 400000,
        capacity: 2,
        isActive: true,
        notes: "High footfall tech corridor. Night flying approved up to 21:30 IST.",
        geojson: {
          type: "Polygon",
          coordinates: [
            [
              [78.372, 17.444],
              [78.381, 17.444],
              [78.381, 17.451],
              [78.372, 17.451],
              [78.372, 17.444],
            ],
          ],
        },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "zone-del-aerocity",
        name: "Delhi Aerocity Hospitality Corridor",
        description: "Premium hospitality and business park perimeter in Aerocity.",
        centerLat: 28.5501,
        centerLng: 77.1205,
        timezone: "Asia/Kolkata",
        ratePerHourPaise: 500000,
        capacity: 1,
        isActive: true,
        notes: "High security perimeter. Campaigns require advance operations review.",
        geojson: {
          type: "Polygon",
          coordinates: [
            [
              [77.116, 28.547],
              [77.125, 28.547],
              [77.125, 28.553],
              [77.116, 28.553],
              [77.116, 28.547],
            ],
          ],
        },
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const z of zonesList) {
      this.zones.set(z.id, z);
    }

    // 4. Pilot Campaigns
    // A. DRAFT
    this.campaigns.set("camp-pilot-draft", {
      id: "camp-pilot-draft",
      name: "Acme Spring Brand Teaser",
      brand: "Acme Brands",
      objective: "Brand Awareness",
      description: "Early-stage concept draft for upcoming retail launch.",
      status: CampaignStatus.DRAFT,
      organizationId: "org-acme-india",
      createdById: "user-advertiser-1",
      zoneId: "zone-blr-mg-road",
      startAt: new Date("2026-11-20T18:00:00Z"),
      endAt: new Date("2026-11-20T20:00:00Z"),
      flexibility: "FIXED",
      audienceNotes: null,
      ctaText: "Explore Spring Collection",
      destinationUrl: "https://acmebrands.in/spring",
      acknowledgedAt: null,
      version: 0,
      createdAt: new Date(Date.now() - 3600000 * 24 * 3),
      updatedAt: now,
    });

    // B. SUBMITTED
    this.campaigns.set("camp-pilot-submitted", {
      id: "camp-pilot-submitted",
      name: "Acme Diwali Mega Brand Activation",
      brand: "Acme Brands",
      objective: "Festive Engagement",
      description: "Festive greeting with promotional QR voucher for Diwali season.",
      status: CampaignStatus.SUBMITTED,
      organizationId: "org-acme-india",
      createdById: "user-advertiser-1",
      zoneId: "zone-blr-mg-road",
      startAt: new Date("2026-11-01T18:30:00Z"),
      endAt: new Date("2026-11-01T20:30:00Z"),
      flexibility: "FLEXIBLE_PLUS_MINUS_1_HOUR",
      audienceNotes: "Shoppers and evening pedestrians",
      ctaText: "Shop Diwali Offers",
      destinationUrl: "https://acmebrands.in/diwali",
      acknowledgedAt: now,
      version: 1,
      createdAt: new Date(Date.now() - 3600000 * 12),
      updatedAt: now,
    });

    this.creativeAssets.set("asset-diwali-1", {
      id: "asset-diwali-1",
      campaignId: "camp-pilot-submitted",
      storageKey: "assets/acme-diwali-banner.mp4",
      originalName: "diwali-banner-1080p.mp4",
      mimeType: "video/mp4",
      sizeBytes: 15420000,
      width: 1920,
      height: 1080,
      durationSec: 15,
      title: "Diwali Gold Banner",
      altText: "Acme festive brand display",
      validationStatus: "APPROVED",
      validationNote: null,
      createdAt: now,
    });

    this.quotes.set("quote-acme-diwali", {
      id: "quote-acme-diwali",
      campaignId: "camp-pilot-submitted",
      zoneRatePaise: 450000,
      billableHours: 2,
      subtotalPaise: 900000,
      multiplierBps: 10000,
      discountPaise: 0,
      gstBps: 1800,
      gstPaise: 162000,
      totalPaise: 1062000,
      currency: "INR",
      inputsHash: "hash-acme-diwali-quote",
      createdAt: now,
    });

    this.payments.set("pay-acme-diwali", {
      id: "pay-acme-diwali",
      campaignId: "camp-pilot-submitted",
      quoteId: "quote-acme-diwali",
      provider: "razorpay",
      providerOrderId: "order_test_acme_diwali",
      providerPaymentId: "pay_test_acme_diwali_123",
      amountPaise: 1062000,
      currency: "INR",
      status: PaymentStatus.PAID,
      failureReason: null,
      paidAt: now,
      createdAt: now,
    });

    this.statusEvents.push(
      {
        id: "evt-sub-1",
        campaignId: "camp-pilot-submitted",
        fromStatus: null,
        toStatus: CampaignStatus.DRAFT,
        actorType: "USER",
        actorId: "user-advertiser-1",
        reason: "Draft created",
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
      {
        id: "evt-sub-2",
        campaignId: "camp-pilot-submitted",
        fromStatus: CampaignStatus.DRAFT,
        toStatus: CampaignStatus.PENDING_PAYMENT,
        actorType: "USER",
        actorId: "user-advertiser-1",
        reason: "Checkout initiated",
        createdAt: new Date(Date.now() - 3600000 * 11),
      },
      {
        id: "evt-sub-3",
        campaignId: "camp-pilot-submitted",
        fromStatus: CampaignStatus.PENDING_PAYMENT,
        toStatus: CampaignStatus.SUBMITTED,
        actorType: "PAYMENT_GATEWAY",
        actorId: null,
        reason: "Razorpay test payment verified",
        createdAt: new Date(Date.now() - 3600000 * 10),
      }
    );

    // C. CHANGES_REQUESTED
    this.campaigns.set("camp-pilot-changes", {
      id: "camp-pilot-changes",
      name: "Acme Cyber Monday Flash Sale",
      brand: "Acme Brands",
      objective: "Direct Response",
      description: "Flash discounts countdown",
      status: CampaignStatus.CHANGES_REQUESTED,
      organizationId: "org-acme-india",
      createdById: "user-advertiser-1",
      zoneId: "zone-mum-bkc",
      startAt: new Date("2026-11-28T17:00:00Z"),
      endAt: new Date("2026-11-28T19:00:00Z"),
      flexibility: "FIXED",
      audienceNotes: null,
      ctaText: "Shop Sale",
      destinationUrl: null,
      acknowledgedAt: now,
      version: 2,
      createdAt: new Date(Date.now() - 3600000 * 24),
      updatedAt: now,
    });

    this.reviewDecisions.set("dec-changes-1", {
      id: "dec-changes-1",
      campaignId: "camp-pilot-changes",
      reviewerId: "user-ops-reviewer",
      decision: "REQUEST_CHANGES",
      reason: "Creative text contrast is too low for ground visibility at twilight. Please upload revised asset with dark typography and higher luminescence.",
      constraints: "Ground visibility minimum 400:1 contrast required.",
      createdAt: new Date(Date.now() - 3600000 * 6),
    });

    // D. SCHEDULED
    this.campaigns.set("camp-pilot-scheduled", {
      id: "camp-pilot-scheduled",
      name: "Starlight Winter Tech Summit Promo",
      brand: "Starlight Events",
      objective: "Conference Promotion",
      description: "Annual Tech Summit promo",
      status: CampaignStatus.SCHEDULED,
      organizationId: "org-starlight-events",
      createdById: "user-advertiser-2",
      zoneId: "zone-hyd-hitec",
      startAt: new Date("2026-11-15T18:00:00Z"),
      endAt: new Date("2026-11-15T21:00:00Z"),
      flexibility: "FIXED",
      audienceNotes: "Cyber Towers tech professionals",
      ctaText: "Register Online",
      destinationUrl: "https://starlightmedia.com/tech-summit",
      acknowledgedAt: now,
      version: 3,
      createdAt: new Date(Date.now() - 3600000 * 48),
      updatedAt: now,
    });

    this.quotes.set("quote-starlight-1", {
      id: "quote-starlight-1",
      campaignId: "camp-pilot-scheduled",
      zoneRatePaise: 400000,
      billableHours: 3,
      subtotalPaise: 1200000,
      multiplierBps: 10000,
      discountPaise: 0,
      gstBps: 1800,
      gstPaise: 216000,
      totalPaise: 1416000,
      currency: "INR",
      inputsHash: "hash-starlight-1",
      createdAt: now,
    });

    this.reviewDecisions.set("dec-scheduled-1", {
      id: "dec-scheduled-1",
      campaignId: "camp-pilot-scheduled",
      reviewerId: "user-ops-reviewer",
      decision: "APPROVE",
      reason: "Airspace cleared. All 4 safety pillars validated.",
      constraints: "Deploy only between 18:00 - 21:00 IST with ground marshals.",
      createdAt: new Date(Date.now() - 3600000 * 18),
    });

    // E. REJECTED
    this.campaigns.set("camp-pilot-rejected", {
      id: "camp-pilot-rejected",
      name: "Ultra Strobe Rapid Display",
      brand: "Acme Brands",
      objective: "High-Visibility Strobe Test",
      description: null,
      status: CampaignStatus.REJECTED,
      organizationId: "org-acme-india",
      createdById: "user-advertiser-1",
      zoneId: "zone-del-aerocity",
      startAt: null,
      endAt: null,
      flexibility: null,
      audienceNotes: null,
      ctaText: null,
      destinationUrl: null,
      acknowledgedAt: now,
      version: 2,
      createdAt: new Date(Date.now() - 3600000 * 72),
      updatedAt: now,
    });

    this.reviewDecisions.set("dec-rejected-1", {
      id: "dec-rejected-1",
      campaignId: "camp-pilot-rejected",
      reviewerId: "user-ops-reviewer",
      decision: "REJECT",
      reason: "Disallowed strobe sequence and high security aerodrome corridor proximity.",
      constraints: null,
      createdAt: new Date(Date.now() - 3600000 * 36),
    });

    this.payments.set("pay-pilot-rejected", {
      id: "pay-pilot-rejected",
      campaignId: "camp-pilot-rejected",
      quoteId: "quote-pilot-rejected",
      provider: "razorpay",
      providerOrderId: "order_test_rejected",
      providerPaymentId: "pay_test_rejected_456",
      amountPaise: 1180000,
      currency: "INR",
      status: PaymentStatus.REFUNDED,
      failureReason: null,
      paidAt: now,
      createdAt: now,
    });

    this.refunds.set("rfnd-pilot-rejected", {
      id: "rfnd-pilot-rejected",
      paymentId: "pay-pilot-rejected",
      providerRefundId: "rfnd_test_rejected_789",
      amountPaise: 1180000,
      reason: "Automatic refund triggered on campaign rejection",
      status: "PROCESSED",
      createdAt: now,
    });
  }
}

export function createMockDatabaseClient() {
  const memDb = new InMemoryDatabase();

  const client: Record<string, unknown> = {
    user: {
      findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
        if (where.id) return memDb.users.get(where.id) ?? null;
        if (where.email) {
          return Array.from(memDb.users.values()).find((u) => u.email === where.email) ?? null;
        }
        return null;
      },
      findFirst: async () => {
        return Array.from(memDb.users.values())[0] ?? null;
      },
      findMany: async () => Array.from(memDb.users.values()),
    },

    organization: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        return memDb.organizations.get(where.id) ?? null;
      },
      findFirst: async ({ where }: { where?: { id?: string } }) => {
        if (where?.id) return memDb.organizations.get(where.id) ?? null;
        return Array.from(memDb.organizations.values())[0] ?? null;
      },
      findMany: async () => Array.from(memDb.organizations.values()),
    },

    zone: {
      findUnique: async ({ where }: { where: { id: string } }) => {
        return memDb.zones.get(where.id) ?? null;
      },
      findFirst: async ({ where }: { where?: { id?: string } }) => {
        if (where?.id) return memDb.zones.get(where.id) ?? null;
        return Array.from(memDb.zones.values())[0] ?? null;
      },
      findMany: async ({ where }: { where?: { isActive?: boolean } } = {}) => {
        let list = Array.from(memDb.zones.values());
        if (where?.isActive !== undefined) {
          list = list.filter((z) => z.isActive === where.isActive);
        }
        return list;
      },
    },

    campaign: {
      findUnique: async ({
        where,
        include,
      }: {
        where: { id: string };
        include?: Record<string, unknown>;
      }) => {
        const camp = memDb.campaigns.get(where.id);
        if (!camp) return null;

        const res: Record<string, unknown> = { ...camp };
        if (include?.organization) {
          res.organization = memDb.organizations.get(camp.organizationId) ?? null;
        }
        if (include?.createdBy) {
          res.createdBy = memDb.users.get(camp.createdById) ?? null;
        }
        if (include?.zone && camp.zoneId) {
          res.zone = memDb.zones.get(camp.zoneId) ?? null;
        }
        if (include?.assets) {
          res.assets = Array.from(memDb.creativeAssets.values()).filter(
            (a) => a.campaignId === camp.id
          );
        }
        if (include?.quotes) {
          res.quotes = Array.from(memDb.quotes.values()).filter((q) => q.campaignId === camp.id);
        }
        if (include?.payments) {
          const payments = Array.from(memDb.payments.values()).filter(
            (p) => p.campaignId === camp.id
          );
          res.payments = payments.map((p) => ({
            ...p,
            refunds: Array.from(memDb.refunds.values()).filter((r) => r.paymentId === p.id),
          }));
        }
        if (include?.statusEvents) {
          res.statusEvents = memDb.statusEvents
            .filter((e) => e.campaignId === camp.id)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        if (include?.decisions) {
          const decisions = Array.from(memDb.reviewDecisions.values()).filter(
            (d) => d.campaignId === camp.id
          );
          res.decisions = decisions.map((d) => ({
            ...d,
            reviewer: memDb.users.get(d.reviewerId) ?? { name: "Ops Lead" },
          }));
        }
        if (include?.slotHolds) {
          res.slotHolds = memDb.slotHolds.filter((s) => s.campaignId === camp.id);
        }
        return res;
      },

      findMany: async ({
        where,
        include,
        orderBy,
        take,
        skip,
      }: {
        where?: Record<string, unknown>;
        include?: Record<string, unknown>;
        orderBy?: Record<string, "asc" | "desc">;
        take?: number;
        skip?: number;
      } = {}) => {
        let list = Array.from(memDb.campaigns.values());

        // Org filter
        if (where?.organizationId) {
          if (typeof where.organizationId === "object" && "in" in (where.organizationId as object)) {
            const orgs = (where.organizationId as { in: string[] }).in;
            list = list.filter((c) => orgs.includes(c.organizationId));
          } else {
            list = list.filter((c) => c.organizationId === where.organizationId);
          }
        }

        // Status filter
        if (where?.status) {
          if (typeof where.status === "object" && "in" in (where.status as object)) {
            const statuses = (where.status as { in: CampaignStatus[] }).in;
            list = list.filter((c) => statuses.includes(c.status));
          } else {
            list = list.filter((c) => c.status === where.status);
          }
        }

        // Zone filter
        if (where?.zoneId) {
          list = list.filter((c) => c.zoneId === where.zoneId);
        }

        // Search filter
        if (where?.OR && Array.isArray(where.OR)) {
          list = list.filter((c) => {
            const orList = where.OR as Array<Record<string, { contains: string }>>;
            return orList.some((cond) => {
              if (cond.name?.contains) {
                return c.name.toLowerCase().includes(cond.name.contains.toLowerCase());
              }
              if (cond.brand?.contains) {
                return c.brand.toLowerCase().includes(cond.brand.contains.toLowerCase());
              }
              if (cond.organization?.contains) {
                const org = memDb.organizations.get(c.organizationId);
                return org?.name.toLowerCase().includes(cond.organization.contains.toLowerCase());
              }
              return false;
            });
          });
        }

        // Sort
        if (orderBy?.updatedAt === "desc") {
          list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        }

        // Pagination
        const start = skip ?? 0;
        const end = take ? start + take : list.length;
        list = list.slice(start, end);

        return list.map((camp) => {
          const res: Record<string, unknown> = { ...camp };
          if (include?.organization) {
            res.organization = memDb.organizations.get(camp.organizationId) ?? null;
          }
          if (include?.zone && camp.zoneId) {
            res.zone = memDb.zones.get(camp.zoneId) ?? null;
          }
          if (include?.assets) {
            res.assets = Array.from(memDb.creativeAssets.values()).filter(
              (a) => a.campaignId === camp.id
            );
          }
          if (include?.quotes) {
            res.quotes = Array.from(memDb.quotes.values()).filter(
              (q) => q.campaignId === camp.id
            );
          }
          if (include?.payments) {
            res.payments = Array.from(memDb.payments.values()).filter(
              (p) => p.campaignId === camp.id
            );
          }
          if (include?.decisions) {
            res.decisions = Array.from(memDb.reviewDecisions.values()).filter(
              (d) => d.campaignId === camp.id
            );
          }
          return res;
        });
      },

      count: async ({ where }: { where?: Record<string, unknown> } = {}) => {
        let list = Array.from(memDb.campaigns.values());

        if (where?.organizationId) {
          if (typeof where.organizationId === "object" && "in" in (where.organizationId as object)) {
            const orgs = (where.organizationId as { in: string[] }).in;
            list = list.filter((c) => orgs.includes(c.organizationId));
          } else {
            list = list.filter((c) => c.organizationId === where.organizationId);
          }
        }

        if (where?.status) {
          if (typeof where.status === "object" && "in" in (where.status as object)) {
            const statuses = (where.status as { in: CampaignStatus[] }).in;
            list = list.filter((c) => statuses.includes(c.status));
          } else {
            list = list.filter((c) => c.status === where.status);
          }
        }

        return list.length;
      },

      create: async ({ data }: { data: Record<string, unknown> }) => {
        const id = (data.id as string) || `camp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const camp: InMemoryCampaign = {
          id,
          organizationId: data.organizationId as string,
          createdById: (data.createdById as string) || "user-advertiser-1",
          name: (data.name as string) || "Untitled Campaign",
          brand: (data.brand as string) || "Brand",
          objective: (data.objective as string) || "Awareness",
          description: (data.description as string) || null,
          status: (data.status as CampaignStatus) || CampaignStatus.DRAFT,
          zoneId: (data.zoneId as string) || null,
          startAt: data.startAt ? new Date(data.startAt as string) : null,
          endAt: data.endAt ? new Date(data.endAt as string) : null,
          flexibility: (data.flexibility as string) || "FIXED",
          audienceNotes: (data.audienceNotes as string) || null,
          ctaText: (data.ctaText as string) || null,
          destinationUrl: (data.destinationUrl as string) || null,
          acknowledgedAt: data.acknowledgedAt ? new Date(data.acknowledgedAt as string) : null,
          version: (data.version as number) || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        memDb.campaigns.set(id, camp);
        return { ...camp };
      },

      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Record<string, unknown>;
      }) => {
        const camp = memDb.campaigns.get(where.id);
        if (!camp) throw new Error(`Campaign '${where.id}' not found`);

        if (data.status) camp.status = data.status as CampaignStatus;
        if (data.name) camp.name = data.name as string;
        if (data.brand) camp.brand = data.brand as string;
        if (data.description !== undefined) camp.description = data.description as string | null;
        if (data.zoneId !== undefined) camp.zoneId = data.zoneId as string | null;
        if (data.startAt !== undefined) {
          camp.startAt = data.startAt ? new Date(data.startAt as string) : null;
        }
        if (data.endAt !== undefined) {
          camp.endAt = data.endAt ? new Date(data.endAt as string) : null;
        }
        if (data.version && typeof data.version === "object" && "increment" in data.version) {
          camp.version += (data.version as { increment: number }).increment;
        }

        camp.updatedAt = new Date();
        memDb.campaigns.set(camp.id, camp);
        return { ...camp };
      },
    },

    creativeAsset: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const id = `asset_${Date.now()}`;
        const asset: InMemoryCreativeAsset = {
          id,
          campaignId: data.campaignId as string,
          storageKey: data.storageKey as string,
          originalName: data.originalName as string,
          mimeType: data.mimeType as string,
          sizeBytes: Number(data.sizeBytes) || 0,
          width: (data.width as number) || null,
          height: (data.height as number) || null,
          durationSec: (data.durationSec as number) || null,
          title: (data.title as string) || null,
          altText: (data.altText as string) || null,
          validationStatus: (data.validationStatus as string) || "PENDING",
          validationNote: (data.validationNote as string) || null,
          createdAt: new Date(),
        };
        memDb.creativeAssets.set(id, asset);
        return asset;
      },
      findMany: async ({ where }: { where: { campaignId: string } }) => {
        return Array.from(memDb.creativeAssets.values()).filter(
          (a) => a.campaignId === where.campaignId
        );
      },
    },

    quote: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const id = `quote_${Date.now()}`;
        const quote: InMemoryQuote = {
          id,
          campaignId: data.campaignId as string,
          zoneRatePaise: Number(data.zoneRatePaise),
          billableHours: Number(data.billableHours),
          subtotalPaise: Number(data.subtotalPaise),
          multiplierBps: Number(data.multiplierBps) || 10000,
          discountPaise: Number(data.discountPaise) || 0,
          gstBps: Number(data.gstBps) || 1800,
          gstPaise: Number(data.gstPaise),
          totalPaise: Number(data.totalPaise),
          currency: (data.currency as string) || "INR",
          inputsHash: data.inputsHash as string,
          createdAt: new Date(),
        };
        memDb.quotes.set(id, quote);
        return quote;
      },
      findFirst: async ({ where }: { where: { campaignId: string } }) => {
        return (
          Array.from(memDb.quotes.values()).find((q) => q.campaignId === where.campaignId) ?? null
        );
      },
    },

    payment: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const id = `pay_${Date.now()}`;
        const payment: InMemoryPayment = {
          id,
          campaignId: data.campaignId as string,
          quoteId: data.quoteId as string,
          provider: (data.provider as string) || "razorpay",
          providerOrderId: data.providerOrderId as string,
          providerPaymentId: (data.providerPaymentId as string) || null,
          amountPaise: Number(data.amountPaise),
          currency: (data.currency as string) || "INR",
          status: (data.status as PaymentStatus) || PaymentStatus.CREATED,
          failureReason: null,
          paidAt: data.paidAt ? new Date(data.paidAt as string) : null,
          createdAt: new Date(),
        };
        memDb.payments.set(id, payment);
        return payment;
      },
      findMany: async ({ where }: { where: { campaignId: string; status?: PaymentStatus } }) => {
        let list = Array.from(memDb.payments.values()).filter(
          (p) => p.campaignId === where.campaignId
        );
        if (where.status) {
          list = list.filter((p) => p.status === where.status);
        }
        return list;
      },
      findUnique: async ({ where }: { where: { id?: string; providerOrderId?: string } }) => {
        if (where.id) return memDb.payments.get(where.id) ?? null;
        if (where.providerOrderId) {
          return (
            Array.from(memDb.payments.values()).find(
              (p) => p.providerOrderId === where.providerOrderId
            ) ?? null
          );
        }
        return null;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Record<string, unknown>;
      }) => {
        const payment = memDb.payments.get(where.id);
        if (!payment) throw new Error("Payment not found");
        if (data.status) payment.status = data.status as PaymentStatus;
        if (data.providerPaymentId) payment.providerPaymentId = data.providerPaymentId as string;
        if (data.paidAt) payment.paidAt = new Date(data.paidAt as string);
        memDb.payments.set(payment.id, payment);
        return payment;
      },
    },

    refund: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const id = `rfnd_${Date.now()}`;
        const refund: InMemoryRefund = {
          id,
          paymentId: data.paymentId as string,
          providerRefundId: (data.providerRefundId as string) || null,
          amountPaise: Number(data.amountPaise),
          reason: data.reason as string,
          status: (data.status as string) || "PENDING",
          createdAt: new Date(),
        };
        memDb.refunds.set(id, refund);
        return refund;
      },
    },

    reviewDecision: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const id = `dec_${Date.now()}`;
        const dec: InMemoryReviewDecision = {
          id,
          campaignId: data.campaignId as string,
          reviewerId: data.reviewerId as string,
          decision: data.decision as string,
          reason: data.reason as string,
          constraints: (data.constraints as string) || null,
          createdAt: new Date(),
        };
        memDb.reviewDecisions.set(id, dec);
        return dec;
      },
    },

    statusEvent: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const id = `evt_${Date.now()}`;
        const evt: InMemoryStatusEvent = {
          id,
          campaignId: data.campaignId as string,
          fromStatus: (data.fromStatus as CampaignStatus) || null,
          toStatus: data.toStatus as CampaignStatus,
          actorId: (data.actorId as string) || null,
          actorType: (data.actorType as string) || "USER",
          reason: (data.reason as string) || null,
          createdAt: new Date(),
        };
        memDb.statusEvents.push(evt);
        return evt;
      },
    },

    slotHold: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const id = `hold_${Date.now()}`;
        const hold: InMemorySlotHold = {
          id,
          campaignId: data.campaignId as string,
          zoneId: data.zoneId as string,
          startAt: new Date(data.startAt as string),
          endAt: new Date(data.endAt as string),
          expiresAt: new Date(data.expiresAt as string),
          status: (data.status as string) || "ACTIVE",
          createdAt: new Date(),
        };
        memDb.slotHolds.push(hold);
        return hold;
      },
      findMany: async ({
        where,
      }: {
        where: {
          zoneId?: string;
          status?: string;
          expiresAt?: { gt?: Date };
        };
      }) => {
        let list = memDb.slotHolds;
        if (where.zoneId) list = list.filter((h) => h.zoneId === where.zoneId);
        if (where.status) list = list.filter((h) => h.status === where.status);
        if (where.expiresAt?.gt) {
          const gt = where.expiresAt.gt;
          list = list.filter((h) => h.expiresAt > gt);
        }
        return list;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { campaignId?: string };
        data: Record<string, unknown>;
      }) => {
        let count = 0;
        for (const h of memDb.slotHolds) {
          if (!where.campaignId || h.campaignId === where.campaignId) {
            if (data.status) h.status = data.status as string;
            count++;
          }
        }
        return { count };
      },
    },

    notification: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const id = `notif_${Date.now()}`;
        const notif: InMemoryNotification = {
          id,
          userId: data.userId as string,
          title: data.title as string,
          body: data.body as string,
          readAt: null,
          createdAt: new Date(),
        };
        memDb.notifications.push(notif);
        return notif;
      },
    },

    auditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const id = `audit_${Date.now()}`;
        const log: InMemoryAuditLog = {
          id,
          actorId: (data.actorId as string) || null,
          action: data.action as string,
          entityType: data.entityType as string,
          entityId: data.entityId as string,
          metadata: data.metadata ?? null,
          createdAt: new Date(),
        };
        memDb.auditLogs.push(log);
        return log;
      },
    },

    $transaction: async (cb: (tx: unknown) => Promise<unknown>) => {
      return await cb(client);
    },
  };

  return client;
}
