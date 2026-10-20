import { PrismaClient, Role, CampaignStatus, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Aervy database with comprehensive pilot data...");

  const defaultPassword = await bcrypt.hash("Aervy2026!Secure", 10);

  // 1. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@aervy.internal" },
    update: {},
    create: {
      email: "admin@aervy.internal",
      name: "Aervy Administrator",
      passwordHash: defaultPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const opsReviewer = await prisma.user.upsert({
    where: { email: "ops@aervy.internal" },
    update: {},
    create: {
      email: "ops@aervy.internal",
      name: "Captain Vikram Malhotra (DGCA Ops Lead)",
      passwordHash: defaultPassword,
      role: Role.OPS_REVIEWER,
      isActive: true,
    },
  });

  const advertiser1 = await prisma.user.upsert({
    where: { email: "advertiser@acmebrands.in" },
    update: {},
    create: {
      email: "advertiser@acmebrands.in",
      name: "Priya Sharma (Acme Marketing)",
      passwordHash: defaultPassword,
      role: Role.ADVERTISER,
      isActive: true,
    },
  });

  const advertiser2 = await prisma.user.upsert({
    where: { email: "advertiser2@starlight.com" },
    update: {},
    create: {
      email: "advertiser2@starlight.com",
      name: "Rohan Varma (Starlight Media)",
      passwordHash: defaultPassword,
      role: Role.ADVERTISER,
      isActive: true,
    },
  });

  console.log("Users seeded successfully.");

  // 2. Seed Organizations
  const orgAcme = await prisma.organization.upsert({
    where: { id: "org-acme-india" },
    update: {},
    create: {
      id: "org-acme-india",
      name: "Acme Brands India Pvt Ltd",
      contactEmail: "campaigns@acmebrands.in",
      gstin: "29AAAAA0000A1Z5",
      members: {
        create: {
          userId: advertiser1.id,
          role: "OWNER",
        },
      },
    },
  });

  const orgStarlight = await prisma.organization.upsert({
    where: { id: "org-starlight-events" },
    update: {},
    create: {
      id: "org-starlight-events",
      name: "Starlight Media & Events Pvt Ltd",
      contactEmail: "accounts@starlightmedia.com",
      gstin: "27BBBBB1111B1Z2",
      members: {
        create: {
          userId: advertiser2.id,
          role: "OWNER",
        },
      },
    },
  });

  console.log("Organizations seeded:", [orgAcme.name, orgStarlight.name]);

  // 3. Seed Approved DGCA Green Zones
  const zonesData = [
    {
      id: "zone-blr-mg-road",
      name: "Bangalore MG Road Corridor",
      description: "High-visibility commercial perimeter along MG Road and Brigade Road junction.",
      centerLat: 12.9756,
      centerLng: 77.6066,
      timezone: "Asia/Kolkata",
      ratePerHourPaise: 450000, // ₹4,500 / hr
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
    },
    {
      id: "zone-mum-bkc",
      name: "Mumbai BKC Financial Hub",
      description: "Bandra Kurla Complex central business plaza and exhibition perimeter.",
      centerLat: 19.0664,
      centerLng: 72.8687,
      timezone: "Asia/Kolkata",
      ratePerHourPaise: 600000, // ₹6,000 / hr
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
    },
    {
      id: "zone-hyd-hitec",
      name: "Hyderabad Hitec City Cyber Towers",
      description: "IT corridor perimeter surrounding Cyber Towers and Knowledge City.",
      centerLat: 17.4474,
      centerLng: 78.3762,
      timezone: "Asia/Kolkata",
      ratePerHourPaise: 400000, // ₹4,000 / hr
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
    },
    {
      id: "zone-del-aerocity",
      name: "Delhi Aerocity Hospitality Corridor",
      description: "Premium hospitality and business park perimeter in Aerocity.",
      centerLat: 28.5501,
      centerLng: 77.1205,
      timezone: "Asia/Kolkata",
      ratePerHourPaise: 500000, // ₹5,000 / hr
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
    },
  ];

  for (const zone of zonesData) {
    await prisma.zone.upsert({
      where: { id: zone.id },
      update: zone,
      create: zone,
    });
  }

  console.log(`Seeded ${zonesData.length} approved flight zones.`);

  // 4. Seed Pilot Sample Campaigns across Major States
  // A. DRAFT Campaign
  await prisma.campaign.upsert({
    where: { id: "camp-pilot-draft" },
    update: {},
    create: {
      id: "camp-pilot-draft",
      name: "Acme Spring Brand Teaser",
      brand: "Acme Brands",
      objective: "Brand Awareness",
      description: "Early-stage concept draft for upcoming retail launch.",
      status: CampaignStatus.DRAFT,
      organizationId: orgAcme.id,
      createdById: advertiser1.id,
      zoneId: "zone-blr-mg-road",
      startAt: new Date("2026-11-20T18:00:00Z"),
      endAt: new Date("2026-11-20T20:00:00Z"),
      flexibility: "FIXED",
      version: 0,
    },
  });

  // B. SUBMITTED Campaign (Pending Ops Review)
  const submittedCamp = await prisma.campaign.upsert({
    where: { id: "camp-pilot-submitted" },
    update: {},
    create: {
      id: "camp-pilot-submitted",
      name: "Acme Diwali Mega Brand Activation",
      brand: "Acme Brands",
      objective: "Festive Engagement",
      description: "Festive greeting with promotional QR voucher for Diwali season.",
      status: CampaignStatus.SUBMITTED,
      organizationId: orgAcme.id,
      createdById: advertiser1.id,
      zoneId: "zone-blr-mg-road",
      startAt: new Date("2026-11-01T18:30:00Z"),
      endAt: new Date("2026-11-01T20:30:00Z"),
      flexibility: "FLEXIBLE_PLUS_MINUS_1_HOUR",
      ctaText: "Shop Diwali Offers",
      destinationUrl: "https://acmebrands.in/diwali",
      version: 1,
      acknowledgedAt: new Date(),
      assets: {
        create: {
          storageKey: "assets/acme-diwali-banner.mp4",
          originalName: "diwali-banner-1080p.mp4",
          mimeType: "video/mp4",
          sizeBytes: 15420000,
          width: 1920,
          height: 1080,
          durationSec: 15,
          validationStatus: "APPROVED",
        },
      },
      quotes: {
        create: {
          id: "quote-acme-diwali",
          zoneRatePaise: 450000,
          billableHours: 2,
          subtotalPaise: 900000,
          multiplierBps: 10000,
          gstBps: 1800,
          gstPaise: 162000,
          totalPaise: 1062000, // ₹10,620
          currency: "INR",
          inputsHash: "hash-acme-diwali-quote",
        },
      },
      payments: {
        create: {
          id: "pay-acme-diwali",
          quoteId: "quote-acme-diwali",
          provider: "razorpay",
          providerOrderId: "order_test_acme_diwali",
          providerPaymentId: "pay_test_acme_diwali_123",
          amountPaise: 1062000,
          currency: "INR",
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      },
      statusEvents: {
        createMany: {
          data: [
            {
              fromStatus: null,
              toStatus: CampaignStatus.DRAFT,
              actorType: "USER",
              actorId: advertiser1.id,
              reason: "Draft created",
            },
            {
              fromStatus: CampaignStatus.DRAFT,
              toStatus: CampaignStatus.PENDING_PAYMENT,
              actorType: "USER",
              actorId: advertiser1.id,
              reason: "Checkout initiated",
            },
            {
              fromStatus: CampaignStatus.PENDING_PAYMENT,
              toStatus: CampaignStatus.SUBMITTED,
              actorType: "PAYMENT_GATEWAY",
              reason: "Razorpay test payment verified",
            },
          ],
        },
      },
    },
  });

  // C. CHANGES_REQUESTED Campaign
  await prisma.campaign.upsert({
    where: { id: "camp-pilot-changes" },
    update: {},
    create: {
      id: "camp-pilot-changes",
      name: "Acme Cyber Monday Flash Sale",
      brand: "Acme Brands",
      objective: "Direct Response",
      status: CampaignStatus.CHANGES_REQUESTED,
      organizationId: orgAcme.id,
      createdById: advertiser1.id,
      zoneId: "zone-mum-bkc",
      startAt: new Date("2026-11-28T17:00:00Z"),
      endAt: new Date("2026-11-28T19:00:00Z"),
      version: 2,
      decisions: {
        create: {
          reviewerId: opsReviewer.id,
          decision: "REQUEST_CHANGES",
          reason: "Creative text contrast is too low for ground visibility at twilight. Please upload revised asset with dark typography and higher luminescence.",
          constraints: "Ground visibility minimum 400:1 contrast required.",
        },
      },
      statusEvents: {
        create: {
          fromStatus: CampaignStatus.UNDER_REVIEW,
          toStatus: CampaignStatus.CHANGES_REQUESTED,
          actorType: "USER",
          actorId: opsReviewer.id,
          reason: "Creative text contrast adjustment needed",
        },
      },
    },
  });

  // D. SCHEDULED Campaign
  await prisma.campaign.upsert({
    where: { id: "camp-pilot-scheduled" },
    update: {},
    create: {
      id: "camp-pilot-scheduled",
      name: "Starlight Winter Tech Summit Promo",
      brand: "Starlight Events",
      objective: "Conference Promotion",
      status: CampaignStatus.SCHEDULED,
      organizationId: orgStarlight.id,
      createdById: advertiser2.id,
      zoneId: "zone-hyd-hitec",
      startAt: new Date("2026-11-15T18:00:00Z"),
      endAt: new Date("2026-11-15T21:00:00Z"),
      version: 3,
      decisions: {
        create: {
          reviewerId: opsReviewer.id,
          decision: "APPROVE",
          reason: "Airspace cleared. All 4 safety pillars validated.",
          constraints: "Deploy only between 18:00 - 21:00 IST with ground marshals.",
        },
      },
    },
  });

  // E. REJECTED Campaign (with Refund)
  await prisma.campaign.upsert({
    where: { id: "camp-pilot-rejected" },
    update: {},
    create: {
      id: "camp-pilot-rejected",
      name: "Ultra Strobe Rapid Display",
      brand: "Acme Brands",
      objective: "High-Visibility Strobe Test",
      status: CampaignStatus.REJECTED,
      organizationId: orgAcme.id,
      createdById: advertiser1.id,
      zoneId: "zone-del-aerocity",
      version: 2,
      decisions: {
        create: {
          reviewerId: opsReviewer.id,
          decision: "REJECT",
          reason: "Disallowed strobe sequence and high security aerodrome corridor proximity.",
        },
      },
      quotes: {
        create: {
          id: "quote-pilot-rejected",
          zoneRatePaise: 500000,
          billableHours: 2,
          subtotalPaise: 1000000,
          multiplierBps: 10000,
          gstBps: 1800,
          gstPaise: 180000,
          totalPaise: 1180000,
          currency: "INR",
          inputsHash: "hash-rejected",
        },
      },
      payments: {
        create: {
          id: "pay-pilot-rejected",
          quoteId: "quote-pilot-rejected",
          provider: "razorpay",
          providerOrderId: "order_test_rejected",
          providerPaymentId: "pay_test_rejected_456",
          amountPaise: 1180000,
          currency: "INR",
          status: PaymentStatus.REFUNDED,
          paidAt: new Date(),
          refunds: {
            create: {
              amountPaise: 1180000,
              providerRefundId: "rfnd_test_rejected_789",
              reason: "Automatic refund triggered on campaign rejection",
              status: "PROCESSED",
            },
          },
        },
      },
    },
  });

  console.log("Pilot campaigns seeded across all lifecycle states.");
  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
