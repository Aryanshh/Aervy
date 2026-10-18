import { CampaignStatus, Payment, Quote } from "@prisma/client";
import { db } from "@/lib/db";
import { AuthContextUser, can } from "@/lib/permissions/can";
import { calculateQuote } from "@/lib/pricing/calculate";
import { createSlotHold, convertSlotHold } from "@/lib/availability/hold";
import { transition } from "@/lib/campaign-workflow/transition";
import { PaymentProvider } from "./types";
import { getPaymentProvider } from "./provider";

export interface InitiateCheckoutParams {
  campaignId: string;
  user: AuthContextUser;
  clientQuoteHash?: string;
  provider?: PaymentProvider;
}

export interface InitiateCheckoutResult {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  quote: Quote;
  paymentId: string;
}

export interface VerifyCheckoutParams {
  campaignId: string;
  orderId: string;
  paymentId: string;
  signature: string;
  user: AuthContextUser;
  provider?: PaymentProvider;
}

export interface VerifyCheckoutResult {
  success: boolean;
  campaignId: string;
  status: CampaignStatus;
  payment: Payment;
}

/**
 * Initiates the checkout sequence:
 * 1. Checks permissions and campaign status (must be DRAFT or PENDING_PAYMENT).
 * 2. Recomputes pricing quote server-side and checks hash.
 * 3. Creates a 15-minute slot hold reservation.
 * 4. Creates an order with the payment gateway.
 * 5. Records Payment in database.
 * 6. Transitions campaign status to PENDING_PAYMENT.
 */
export async function initiateCheckout(
  params: InitiateCheckoutParams
): Promise<InitiateCheckoutResult> {
  const { campaignId, user, clientQuoteHash } = params;
  const provider = params.provider ?? getPaymentProvider();

  // 1. Fetch campaign with zone
  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
    include: { zone: true },
  });

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  // 2. Check permissions
  const isAuthorized = can(user, "campaign:pay", {
    organizationId: campaign.organizationId,
    status: campaign.status,
  });

  if (!isAuthorized) {
    throw new Error("Unauthorized to initiate checkout for this campaign");
  }

  // 3. Check status
  if (
    campaign.status !== CampaignStatus.DRAFT &&
    campaign.status !== CampaignStatus.PENDING_PAYMENT
  ) {
    throw new Error(
      `Campaign cannot be checked out in current status '${campaign.status}'. Must be DRAFT or PENDING_PAYMENT.`
    );
  }

  // 4. Validate campaign schedule and zone
  if (!campaign.zoneId || !campaign.zone) {
    throw new Error("Campaign must have an approved zone selected before checkout");
  }

  if (!campaign.zone.isActive) {
    throw new Error(`Selected zone '${campaign.zone.name}' is not active for bookings`);
  }

  if (!campaign.startAt || !campaign.endAt) {
    throw new Error("Campaign must have valid start and end dates before checkout");
  }

  // 5. Calculate server-verified pricing
  const quoteCalculation = calculateQuote({
    zoneId: campaign.zone.id,
    zoneRatePaise: campaign.zone.ratePerHourPaise,
    startAt: campaign.startAt,
    endAt: campaign.endAt,
    multiplierBps: 10000,
  });

  // Verify client quote hash if supplied
  if (clientQuoteHash && clientQuoteHash !== quoteCalculation.inputsHash) {
    throw new Error(
      "Pricing inputs have changed since the quote was generated. Please review the updated pricing."
    );
  }

  // 6. Execute atomic hold creation, quote save, provider order, and campaign transition
  return await db.$transaction(async (tx) => {
    // 6a. Create 15-minute slot hold (throws SlotUnavailableError if slot is taken)
    await createSlotHold(
      {
        campaignId: campaign.id,
        zoneId: campaign.zoneId!,
        startAt: campaign.startAt!,
        endAt: campaign.endAt!,
      },
      tx
    );

    // 6b. Persist Quote record
    const quoteRecord = await tx.quote.create({
      data: {
        campaignId: campaign.id,
        zoneRatePaise: quoteCalculation.zoneRatePaise,
        billableHours: quoteCalculation.billableHours,
        subtotalPaise: quoteCalculation.subtotalPaise,
        multiplierBps: quoteCalculation.multiplierBps,
        discountPaise: quoteCalculation.discountPaise,
        gstBps: quoteCalculation.gstBps,
        gstPaise: quoteCalculation.gstPaise,
        totalPaise: quoteCalculation.totalPaise,
        currency: quoteCalculation.currency,
        inputsHash: quoteCalculation.inputsHash,
      },
    });

    // 6c. Create Order with Payment Provider
    const receiptId = `rcpt_${campaign.id.slice(-6)}_${Date.now()}`;
    const order = await provider.createOrder({
      amountPaise: quoteCalculation.totalPaise,
      currency: quoteCalculation.currency,
      receipt: receiptId,
      notes: {
        campaignId: campaign.id,
        organizationId: campaign.organizationId,
        campaignName: campaign.name,
      },
    });

    // 6d. Create Payment record in database
    const payment = await tx.payment.create({
      data: {
        campaignId: campaign.id,
        quoteId: quoteRecord.id,
        provider: provider.name,
        providerOrderId: order.orderId,
        amountPaise: quoteCalculation.totalPaise,
        currency: quoteCalculation.currency,
        status: "CREATED",
      },
    });

    // 6e. Transition campaign status DRAFT -> PENDING_PAYMENT if currently DRAFT
    if (campaign.status === CampaignStatus.DRAFT) {
      await transition(
        {
          campaignId: campaign.id,
          toStatus: CampaignStatus.PENDING_PAYMENT,
          actor: {
            type: "USER",
            userId: user.id,
            role: user.role,
            organizationIds: user.organizationIds,
          },
          reason: "Checkout initiated, slot held for 15 minutes",
          metadata: {
            orderId: order.orderId,
            paymentId: payment.id,
            totalPaise: quoteCalculation.totalPaise,
          },
        },
        tx
      );
    }

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ??
      process.env.RAZORPAY_KEY_ID ??
      "fake_key_id";

    return {
      orderId: order.orderId,
      amountPaise: quoteCalculation.totalPaise,
      currency: quoteCalculation.currency,
      keyId,
      quote: quoteRecord,
      paymentId: payment.id,
    };
  });
}

/**
 * Verifies the client-side return signature after Razorpay checkout completion:
 * 1. Validates checkout signature using timing-safe HMAC SHA-256.
 * 2. Idempotently updates Payment to PAID.
 * 3. Converts SlotHold to CONVERTED.
 * 4. Transitions campaign to SUBMITTED.
 */
export async function verifyAndCompleteCheckout(
  params: VerifyCheckoutParams
): Promise<VerifyCheckoutResult> {
  const { campaignId, orderId, paymentId, signature, user } = params;
  const provider = params.provider ?? getPaymentProvider();

  // 1. Fetch campaign
  const campaign = await db.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }

  // 2. Fetch existing payment record
  const existingPayment = await db.payment.findUnique({
    where: { providerOrderId: orderId },
  });

  if (!existingPayment) {
    throw new Error(`Payment order '${orderId}' not found`);
  }

  if (existingPayment.campaignId !== campaignId) {
    throw new Error("Order ID does not correspond to this campaign");
  }

  // 3. Idempotent check: if already paid & campaign already submitted
  if (
    existingPayment.status === "PAID" &&
    campaign.status === CampaignStatus.SUBMITTED
  ) {
    return {
      success: true,
      campaignId,
      status: campaign.status,
      payment: existingPayment,
    };
  }

  // 4. Verify signature with provider
  const isValid = provider.verifyPaymentSignature({
    orderId,
    paymentId,
    signature,
  });

  if (!isValid) {
    await db.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: "FAILED",
        failureReason: "Signature verification failed",
      },
    });

    throw new Error("Invalid payment signature");
  }

  // 5. Execute atomic payment completion
  return await db.$transaction(async (tx) => {
    // 5a. Update payment record
    const updatedPayment = await tx.payment.update({
      where: { id: existingPayment.id },
      data: {
        status: "PAID",
        providerPaymentId: paymentId,
        paidAt: new Date(),
      },
    });

    // 5b. Convert slot hold
    await convertSlotHold(campaignId, tx);

    // 5c. Transition campaign to SUBMITTED
    if (campaign.status === CampaignStatus.PENDING_PAYMENT) {
      await transition(
        {
          campaignId,
          toStatus: CampaignStatus.SUBMITTED,
          actor: {
            type: "USER",
            userId: user.id,
            role: user.role,
            organizationIds: user.organizationIds,
          },
          reason: "Payment verified successfully, submitted for operations review",
          metadata: {
            orderId,
            paymentId,
            paidAt: updatedPayment.paidAt?.toISOString(),
          },
        },
        tx
      );
    }

    return {
      success: true,
      campaignId,
      status: CampaignStatus.SUBMITTED,
      payment: updatedPayment,
    };
  });
}
