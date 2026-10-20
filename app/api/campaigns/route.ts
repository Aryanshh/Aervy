import { NextRequest, NextResponse } from "next/server";
import { getAdvertiserCampaigns, StatusCategory } from "@/lib/campaigns/advertiser";
import { AuthContextUser } from "@/lib/permissions/can";
import { CampaignStatus } from "@prisma/client";
import { db } from "@/lib/db";

// Default demo session user for Advertiser portal
const DEFAULT_ADVERTISER_USER: AuthContextUser = {
  id: "user-advertiser-1",
  role: "ADVERTISER",
  organizationIds: ["org-acme-india"],
  isActive: true,
};

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const categoryParam = searchParams.get("category") as StatusCategory | null;
    const organizationId = searchParams.get("organizationId") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    let status: CampaignStatus | undefined = undefined;
    if (statusParam && Object.values(CampaignStatus).includes(statusParam as CampaignStatus)) {
      status = statusParam as CampaignStatus;
    }

    const data = await getAdvertiserCampaigns(
      {
        status,
        statusCategory: categoryParam || undefined,
        organizationId,
        search,
        limit,
        offset,
      },
      DEFAULT_ADVERTISER_USER
    );

    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load campaigns";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      organizationId = "org-acme-india",
      name,
      brand,
      objective,
      description,
      zoneId,
      startAt,
      endAt,
      flexibility,
      audienceNotes,
      ctaText,
      destinationUrl,
      acknowledgedSafety,
    } = body;

    const org = await db.organization.findFirst({
      where: { id: organizationId },
      include: { members: true },
    });

    if (!org) {
      return NextResponse.json(
        { error: `Organization not found: ${organizationId}` },
        { status: 400 }
      );
    }

    const createdById = org.members[0]?.userId || (await db.user.findFirst())?.id || "user-advertiser-1";

    const campaignData = {
      organizationId: org.id,
      createdById,
      name: name || "Untitled Campaign Draft",
      brand: brand || "Brand",
      objective: objective || "Brand Awareness",
      description: description || null,
      zoneId: zoneId || null,
      startAt: startAt ? new Date(startAt) : null,
      endAt: endAt ? new Date(endAt) : null,
      flexibility: flexibility || "FIXED",
      audienceNotes: audienceNotes || null,
      ctaText: ctaText || null,
      destinationUrl: destinationUrl || null,
      acknowledgedAt: acknowledgedSafety ? new Date() : null,
      status: CampaignStatus.DRAFT,
    };

    let campaign;
    if (id) {
      campaign = await db.campaign.update({
        where: { id },
        data: campaignData,
      });
    } else {
      campaign = await db.campaign.create({
        data: campaignData,
      });
    }

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      status: campaign.status,
      updatedAt: campaign.updatedAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save campaign";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
