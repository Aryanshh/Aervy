import { Refund } from "@prisma/client";
import { db } from "@/lib/db";
import { PaymentProvider } from "./types";
import { getPaymentProvider } from "./provider";

export interface ProcessRefundParams {
  campaignId: string;
  reason: string;
  provider?: PaymentProvider;
  actorId?: string;
}

export interface RefundExecutionSummary {
  campaignId: string;
  totalRefundedPaise: number;
  refunds: Refund[];
}

/**
 * Triggers full refund for all paid transactions on a rejected or cancelled campaign.
 */
export async function processCampaignRefund(
  params: ProcessRefundParams
): Promise<RefundExecutionSummary> {
  const { campaignId, reason, actorId } = params;
  const provider = params.provider ?? getPaymentProvider();

  // 1. Fetch campaign and its payments with existing refunds
  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: {
      payments: {
        where: { status: "PAID" },
        include: { refunds: true },
      },
    },
  });

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  const createdRefundRecords: Refund[] = [];
  let totalRefunded = 0;

  for (const payment of campaign.payments) {
    // Check if already refunded
    const alreadyRefundedPaise = payment.refunds
      .filter((r) => r.status === "PROCESSED" || r.status === "PENDING")
      .reduce((sum, r) => sum + r.amountPaise, 0);

    const remainingPaise = payment.amountPaise - alreadyRefundedPaise;
    if (remainingPaise <= 0) {
      continue;
    }

    // Call payment gateway to issue refund
    const refundResult = await provider.createRefund({
      paymentId: payment.providerPaymentId ?? payment.providerOrderId,
      amountPaise: remainingPaise,
      reason,
      notes: {
        campaignId,
        paymentId: payment.id,
        reason,
      },
    });

    // Save refund record and audit log in a transaction
    const savedRefund = await db.$transaction(async (tx) => {
      const refundRecord = await tx.refund.create({
        data: {
          paymentId: payment.id,
          providerRefundId: refundResult.refundId,
          amountPaise: refundResult.amountPaise || remainingPaise,
          reason,
          status: refundResult.status === "processed" ? "PROCESSED" : "PENDING",
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          actorId: actorId ?? null,
          action: "PAYMENT_REFUND_ISSUED",
          entityType: "CAMPAIGN",
          entityId: campaignId,
          metadata: {
            paymentId: payment.id,
            refundId: refundRecord.id,
            providerRefundId: refundResult.refundId,
            amountPaise: refundRecord.amountPaise,
            reason,
          },
        },
      });

      // Notification to campaign owner if available
      if (campaign.createdById) {
        await tx.notification.create({
          data: {
            userId: campaign.createdById,
            title: "Payment Refund Initiated",
            body: `A refund of ₹${(refundRecord.amountPaise / 100).toFixed(2)} for campaign '${campaign.name}' has been initiated. Reason: ${reason}`,
          },
        });
      }

      return refundRecord;
    });

    createdRefundRecords.push(savedRefund);
    totalRefunded += savedRefund.amountPaise;
  }

  return {
    campaignId,
    totalRefundedPaise: totalRefunded,
    refunds: createdRefundRecords,
  };
}
