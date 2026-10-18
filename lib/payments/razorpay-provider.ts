import {
  CreateOrderOptions,
  CreateRefundOptions,
  PaymentOrder,
  PaymentProvider,
  RefundResult,
  VerifyPaymentParams,
  VerifyWebhookParams,
} from "./types";
import { verifyHmacSha256, verifyRazorpayPaymentSignature } from "./crypto";

export interface RazorpayProviderConfig {
  keyId?: string;
  keySecret?: string;
  webhookSecret?: string;
  apiBaseUrl?: string;
}

export class RazorpayProvider implements PaymentProvider {
  public readonly name = "razorpay";
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private apiBaseUrl: string;

  constructor(config: RazorpayProviderConfig = {}) {
    this.keyId =
      config.keyId ??
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ??
      process.env.RAZORPAY_KEY_ID ??
      "";
    this.keySecret = config.keySecret ?? process.env.RAZORPAY_KEY_SECRET ?? "";
    this.webhookSecret =
      config.webhookSecret ?? process.env.RAZORPAY_WEBHOOK_SECRET ?? "";
    this.apiBaseUrl = config.apiBaseUrl ?? "https://api.razorpay.com/v1";
  }

  private getAuthHeader(): string {
    if (!this.keyId || !this.keySecret) {
      throw new Error(
        "RazorpayProvider: Missing keyId or keySecret. Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
      );
    }
    const token = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    return `Basic ${token}`;
  }

  async createOrder(options: CreateOrderOptions): Promise<PaymentOrder> {
    const authHeader = this.getAuthHeader();
    const endpoint = `${this.apiBaseUrl}/orders`;

    const payload = {
      amount: options.amountPaise,
      currency: options.currency ?? "INR",
      receipt: options.receipt,
      notes: options.notes ?? {},
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Razorpay createOrder failed (${res.status}): ${errorBody}`);
    }

    const data = (await res.json()) as {
      id: string;
      amount: number;
      currency: string;
      receipt: string;
      status: "created" | "attempted" | "paid";
    };

    return {
      orderId: data.id,
      amountPaise: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      status: data.status,
    };
  }

  verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    if (!this.keySecret) {
      throw new Error("RazorpayProvider: Missing keySecret for signature verification");
    }
    return verifyRazorpayPaymentSignature(
      params.orderId,
      params.paymentId,
      params.signature,
      this.keySecret
    );
  }

  verifyWebhookSignature(params: VerifyWebhookParams): boolean {
    const secret = params.secret ?? this.webhookSecret;
    if (!secret) {
      throw new Error("RazorpayProvider: Missing webhookSecret for signature verification");
    }
    return verifyHmacSha256(params.rawBody, params.signature, secret);
  }

  async createRefund(options: CreateRefundOptions): Promise<RefundResult> {
    const authHeader = this.getAuthHeader();
    const endpoint = `${this.apiBaseUrl}/payments/${options.paymentId}/refund`;

    const payload: Record<string, unknown> = {
      notes: options.notes ?? {},
    };

    if (options.amountPaise !== undefined) {
      payload.amount = options.amountPaise;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Razorpay createRefund failed (${res.status}): ${errorBody}`);
    }

    const data = (await res.json()) as {
      id: string;
      payment_id: string;
      amount: number;
      currency: string;
      status: "pending" | "processed" | "failed";
    };

    return {
      refundId: data.id,
      paymentId: data.payment_id,
      amountPaise: data.amount,
      currency: data.currency,
      status: data.status,
    };
  }
}
