import { CampaignStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { convertSlotHold, releaseSlotHold } from "@/lib/availability/hold";
import { transition } from "@/lib/campaign-workflow/transition";
import { PaymentProvider } from "./types";
import { getPaymentProvider } from "./provider";

export interface ProcessWebhookParams {
  rawBody: string;
  signature: string;
  provider?: PaymentProvider;
  secret?: string;
}

export interface ProcessWebhookResult {
  received: boolean;
  duplicate: boolean;
  eventId: string;
  eventType: string;
  processed: boolean;
  details?: Record<string, unknown>;
}

interface RazorpayWebhookPayload {
  entity?: string;
  account_id?: string;
  event: string;
  contains?: string[];
  payload?: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        method?: string;
        error_code?: string;
        error_description?: string;
        created_at?: number;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        amount_paid: number;
        status: string;
      };
    };
    refund?: {
      entity: {
        id: string;
        payment_id: string;
        amount: number;
        status: string;
      };
    };
  };
  created_at?: number;
}

/**
 * Validates, records, and processes inbound Razorpay webhook events idempotently.
 */
export async function processWebhookEvent(
  params: ProcessWebhookParams
): Promise<ProcessWebhookResult> {
  const { rawBody, signature, secret } = params;
  const provider = params.provider ?? getPaymentProvider();

  // 1. Verify signature on raw request body
  const isValid = provider.verifyWebhookSignature({
    rawBody,
    signature,
    secret,
  });

  if (!isValid) {
    throw new Error("Invalid webhook signature");
  }

  // 2. Parse payload
  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    throw new Error("Invalid webhook JSON payload");
  }

  const eventType = payload.event;
  if (!eventType) {
    throw new Error("Missing event type in webhook payload");
  }

  // Generate deterministic event ID
  const eventId =
    (payload as { id?: string }).id ??
    `evt_${eventType}_${payload.payload?.payment?.entity?.id ?? payload.payload?.order?.entity?.id ?? Date.now()}`;

  // 3. Idempotency Check
  const existingEvent = await db.webhookEvent.findUnique({
    where: { id: eventId },
  });

  if (existingEvent) {
    return {
      received: true,
      duplicate: true,
      eventId,
      eventType,
      processed: existingEvent.processedAt !== null,
    };
  }

  // Record webhook receipt
  await db.webhookEvent.create({
    data: {
      id: eventId,
      provider: provider.name,
      type: eventType,
      receivedAt: new Date(),
    },
  });

  // 4. Handle specific event types
  let details: Record<string, unknown> = {};

  if (eventType === "order.paid" || eventType === "payment.captured") {
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;
    const orderId = paymentEntity?.order_id ?? orderEntity?.id;

    if (orderId) {
      const payment = await db.payment.findUnique({
        where: { providerOrderId: orderId },
        include: { campaign: true },
      });

      if (payment) {
        await db.$transaction(async (tx) => {
          // Update payment status
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "PAID",
              providerPaymentId: paymentEntity?.id ?? payment.providerPaymentId,
              paidAt: new Date(),
            },
          });

          // Convert slot hold
          await convertSlotHold(payment.campaignId, tx);

          // Transition campaign to SUBMITTED if pending
          if (payment.campaign.status === CampaignStatus.PENDING_PAYMENT) {
            await transition(
              {
                campaignId: payment.campaignId,
                toStatus: CampaignStatus.SUBMITTED,
                actor: { type: "WEBHOOK" },
                reason: `Payment verified via webhook event ${eventType}`,
                metadata: {
                  webhookEventId: eventId,
                  providerPaymentId: paymentEntity?.id,
                  orderId,
                },
              },
              tx
            );
          }

          // Mark webhook event processed
          await tx.webhookEvent.update({
            where: { id: eventId },
            data: { processedAt: new Date() },
          });
        });

        details = { campaignId: payment.campaignId, orderId, paymentId: payment.id };
      }
    }
  } else if (eventType === "payment.failed") {
    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;

    if (orderId) {
      const payment = await db.payment.findUnique({
        where: { providerOrderId: orderId },
        include: { campaign: true },
      });

      if (payment) {
        await db.$transaction(async (tx) => {
          // Update payment record
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: "FAILED",
              failureReason: paymentEntity?.error_description ?? "Payment failed",
            },
          });

          // Release active slot hold
          await releaseSlotHold(payment.campaignId, tx);

          // Revert campaign status to DRAFT so user can retry or adjust schedule
          if (payment.campaign.status === CampaignStatus.PENDING_PAYMENT) {
            await transition(
              {
                campaignId: payment.campaignId,
                toStatus: CampaignStatus.DRAFT,
                actor: { type: "WEBHOOK" },
                reason: `Payment failed (${paymentEntity?.error_description ?? "unknown error"}), slot hold released`,
                metadata: {
                  webhookEventId: eventId,
                  errorCode: paymentEntity?.error_code,
                  errorDescription: paymentEntity?.error_description,
                },
              },
              tx
            );
          }

          // Mark webhook event processed
          await tx.webhookEvent.update({
            where: { id: eventId },
            data: { processedAt: new Date() },
          });
        });

        details = { campaignId: payment.campaignId, orderId, paymentId: payment.id };
      }
    }
  } else if (eventType === "refund.processed") {
    const refundEntity = payload.payload?.refund?.entity;
    if (refundEntity?.id) {
      await db.$transaction(async (tx) => {
        await tx.refund.updateMany({
          where: { providerRefundId: refundEntity.id },
          data: { status: "PROCESSED" },
        });

        await tx.webhookEvent.update({
          where: { id: eventId },
          data: { processedAt: new Date() },
        });
      });

      details = { providerRefundId: refundEntity.id };
    }
  } else {
    // Unhandled event type, simply record processed
    await db.webhookEvent.update({
      where: { id: eventId },
      data: { processedAt: new Date() },
    });
  }

  return {
    received: true,
    duplicate: false,
    eventId,
    eventType,
    processed: true,
    details,
  };
}
