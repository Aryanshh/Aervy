import { NextRequest, NextResponse } from "next/server";
import { processWebhookEvent } from "@/lib/payments/webhook";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing x-razorpay-signature header" },
        { status: 400 }
      );
    }

    const rawBody = await req.text();

    if (!rawBody) {
      return NextResponse.json(
        { error: "Empty request body" },
        { status: 400 }
      );
    }

    const result = await processWebhookEvent({
      rawBody,
      signature,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    const status = message.includes("Invalid webhook signature")
      ? 400
      : message.includes("JSON")
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
