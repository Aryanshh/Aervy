import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyAndCompleteCheckout } from "@/lib/payments/checkout";
import { AuthContextUser } from "@/lib/permissions/can";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { campaignId, orderId, paymentId, signature } = body;

    if (!campaignId || !orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: "campaignId, orderId, paymentId, and signature are all required" },
        { status: 400 }
      );
    }

    const campaign = await db.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const user: AuthContextUser = {
      id: campaign.createdById,
      role: "ADVERTISER",
      organizationIds: [campaign.organizationId],
      isActive: true,
    };

    const result = await verifyAndCompleteCheckout({
      campaignId,
      orderId,
      paymentId,
      signature,
      user,
    });

    return NextResponse.json({
      success: true,
      campaignId: result.campaignId,
      status: result.status,
      paymentId: result.payment.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Payment verification failed";
    const status = message.includes("Invalid payment signature")
      ? 400
      : message.includes("not found")
        ? 404
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
