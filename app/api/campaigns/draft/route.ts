import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CampaignStatus } from "@prisma/client";

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

    // Check organization
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

    const createdById = org.members[0]?.userId || (await db.user.findFirst())?.id;
    if (!createdById) {
      return NextResponse.json({ error: "No valid user found to assign draft" }, { status: 400 });
    }

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
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save campaign draft", details: String(error) },
      { status: 500 }
    );
  }
}
