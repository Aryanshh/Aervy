import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Aervy database with pilot data...");

  const defaultPassword = await bcrypt.hash("Aervy2026!Secure", 10);

  // 1. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@aervy.com" },
    update: {},
    create: {
      email: "admin@aervy.com",
      name: "Aervy Administrator",
      passwordHash: defaultPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const opsReviewer = await prisma.user.upsert({
    where: { email: "ops@aervy.com" },
    update: {},
    create: {
      email: "ops@aervy.com",
      name: "Flight Ops Lead",
      passwordHash: defaultPassword,
      role: Role.OPS_REVIEWER,
      isActive: true,
    },
  });

  const advertiser1 = await prisma.user.upsert({
    where: { email: "advertiser1@acme.com" },
    update: {},
    create: {
      email: "advertiser1@acme.com",
      name: "Acme Marketing Director",
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
      name: "Starlight Events Lead",
      passwordHash: defaultPassword,
      role: Role.ADVERTISER,
      isActive: true,
    },
  });

  console.log("Users seeded:", {
    admin: admin.email,
    ops: opsReviewer.email,
    adv1: advertiser1.email,
    adv2: advertiser2.email,
  });

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
      name: "Starlight Media & Events",
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

  // 3. Seed Demo Approved Zones (TODO(pilot): set real pricing & coordinates)
  const zonesData = [
    {
      id: "zone-blr-mg-road",
      name: "Bangalore MG Road Corridor",
      description: "High-visibility commercial perimeter along MG Road and Brigade Road junction.",
      centerLat: 12.9756,
      centerLng: 77.6066,
      timezone: "Asia/Kolkata",
      ratePerHourPaise: 1500000, // TODO(pilot): ₹15,000 / hr base rate
      capacity: 1,
      isActive: true,
      notes:
        "Standard operating window: 18:00 - 22:00 IST. A zone listing is not proof of airspace clearance for a specific flight.",
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
      ratePerHourPaise: 2500000, // TODO(pilot): ₹25,000 / hr base rate
      capacity: 1,
      isActive: true,
      notes:
        "Proximity to airport approach. Flight subject to strict wind limits and day-of-ops ATC clearance.",
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
      id: "zone-del-aerocity",
      name: "Delhi Aerocity Hospitality Corridor",
      description: "Premium hospitality and business park perimeter in Aerocity.",
      centerLat: 28.5501,
      centerLng: 77.1205,
      timezone: "Asia/Kolkata",
      ratePerHourPaise: 2000000, // TODO(pilot): ₹20,000 / hr base rate
      capacity: 1,
      isActive: true,
      notes:
        "High security zone. Campaigns require advance operations review and police clearance.",
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
