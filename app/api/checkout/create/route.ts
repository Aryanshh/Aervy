import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initiateCheckout } from "@/lib/payments/checkout";
import { AuthContextUser } from "@/lib/permissions/can";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, quoteHash } = body;

    if (!campaignId) {
      return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
    }

    // Fetch campaign to resolve organization
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
      include: { organization: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Build auth context user (from session or campaign creator/org)
    const user: AuthContextUser = {
      id: campaign.createdById,
      role: "ADVERTISER",
      organizationIds: [campaign.organizationId],
      isActive: true,
    };

    const checkoutResult = await initiateCheckout({
      campaignId,
      user,
      clientQuoteHash: quoteHash,
    });

    return NextResponse.json({
      success: true,
      orderId: checkoutResult.orderId,
      amountPaise: checkoutResult.amountPaise,
      currency: checkoutResult.currency,
      keyId: checkoutResult.keyId,
      quote: checkoutResult.quote,
      paymentId: checkoutResult.paymentId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Checkout initiation failed";
    const status = message.includes("not found")
      ? 404
      : message.includes("Unauthorized")
        ? 403
        : message.includes("unavailable") || message.includes("inputs have changed")
          ? 400
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
