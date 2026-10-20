import { NextRequest, NextResponse } from "next/server";
import {
  getAdvertiserCampaignDetail,
  resubmitAdvertiserCampaign,
  cancelAdvertiserCampaign,
} from "@/lib/campaigns/advertiser";
import { AuthContextUser, can } from "@/lib/permissions/can";
import { db } from "@/lib/db";

const DEFAULT_ADVERTISER_USER: AuthContextUser = {
  id: "user-advertiser-1",
  role: "ADVERTISER",
  organizationIds: ["org-acme-india"],
  isActive: true,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const campaign = await getAdvertiserCampaignDetail(
      campaignId,
      DEFAULT_ADVERTISER_USER
    );

    return NextResponse.json({ success: true, campaign });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load campaign";
    const status = message.includes("not found")
      ? 404
      : message.includes("Unauthorized")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const body = await req.json();

    // 1. Resubmit Action
    if (body.action === "resubmit") {
      const result = await resubmitAdvertiserCampaign({
        campaignId,
        user: DEFAULT_ADVERTISER_USER,
        notes: body.notes,
      });
      return NextResponse.json(result);
    }

    // 2. Cancel Action
    if (body.action === "cancel") {
      const result = await cancelAdvertiserCampaign({
        campaignId,
        user: DEFAULT_ADVERTISER_USER,
        reason: body.reason || "Cancelled by advertiser",
      });
      return NextResponse.json(result);
    }

    // 3. Draft/Changes Edit Action
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const isAuthorized = can(DEFAULT_ADVERTISER_USER, "campaign:update", {
      organizationId: campaign.organizationId,
      status: campaign.status,
    });

    if (!isAuthorized) {
      return NextResponse.json(
        { error: `Cannot update campaign with status '${campaign.status}'` },
        { status: 403 }
      );
    }

    const {
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
    } = body;

    const updated = await db.campaign.update({
      where: { id: campaignId },
      data: {
        ...(name !== undefined && { name }),
        ...(brand !== undefined && { brand }),
        ...(objective !== undefined && { objective }),
        ...(description !== undefined && { description }),
        ...(zoneId !== undefined && { zoneId }),
        ...(startAt !== undefined && { startAt: startAt ? new Date(startAt) : null }),
        ...(endAt !== undefined && { endAt: endAt ? new Date(endAt) : null }),
        ...(flexibility !== undefined && { flexibility }),
        ...(audienceNotes !== undefined && { audienceNotes }),
        ...(ctaText !== undefined && { ctaText }),
        ...(destinationUrl !== undefined && { destinationUrl }),
      },
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update campaign";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
