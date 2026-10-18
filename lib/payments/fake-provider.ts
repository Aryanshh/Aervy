import {
  CreateOrderOptions,
  CreateRefundOptions,
  PaymentOrder,
  PaymentProvider,
  RefundResult,
  VerifyPaymentParams,
  VerifyWebhookParams,
} from "./types";
import { generateHmacSha256, verifyHmacSha256, verifyRazorpayPaymentSignature } from "./crypto";

export interface FakeProviderConfig {
  defaultSecret?: string;
  webhookSecret?: string;
  shouldFailOrderCreation?: boolean;
  shouldFailRefund?: boolean;
}

export class FakeProvider implements PaymentProvider {
  public readonly name = "fake";
  private defaultSecret: string;
  private webhookSecret: string;
  private shouldFailOrderCreation: boolean;
  private shouldFailRefund: boolean;

  // Track created orders and refunds in memory for assertions during tests
  public readonly createdOrders: PaymentOrder[] = [];
  public readonly createdRefunds: RefundResult[] = [];

  constructor(config: FakeProviderConfig = {}) {
    this.defaultSecret = config.defaultSecret ?? "fake_rzp_secret_1234567890abcdef";
    this.webhookSecret = config.webhookSecret ?? "fake_rzp_webhook_secret_abcdef123456";
    this.shouldFailOrderCreation = !!config.shouldFailOrderCreation;
    this.shouldFailRefund = !!config.shouldFailRefund;
  }

  async createOrder(options: CreateOrderOptions): Promise<PaymentOrder> {
    if (this.shouldFailOrderCreation) {
      throw new Error("FakeProvider: Simulated order creation failure");
    }

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const order: PaymentOrder = {
      orderId: `order_fake_${randomSuffix}`,
      amountPaise: options.amountPaise,
      currency: options.currency ?? "INR",
      receipt: options.receipt,
      status: "created",
    };

    this.createdOrders.push(order);
    return order;
  }

  /**
   * Generates a valid test signature for an order and payment ID using the fake provider's secret.
   */
  generateTestPaymentSignature(orderId: string, paymentId: string): string {
    return generateHmacSha256(`${orderId}|${paymentId}`, this.defaultSecret);
  }

  verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    if (params.signature === "test_signature" || params.signature.startsWith("fake_sig_")) {
      return true;
    }
    return verifyRazorpayPaymentSignature(
      params.orderId,
      params.paymentId,
      params.signature,
      this.defaultSecret
    );
  }

  /**
   * Generates a valid test webhook signature for raw body.
   */
  generateTestWebhookSignature(rawBody: string): string {
    return generateHmacSha256(rawBody, this.webhookSecret);
  }

  verifyWebhookSignature(params: VerifyWebhookParams): boolean {
    const secret = params.secret ?? this.webhookSecret;
    return verifyHmacSha256(params.rawBody, params.signature, secret);
  }

  async createRefund(options: CreateRefundOptions): Promise<RefundResult> {
    if (this.shouldFailRefund) {
      throw new Error("FakeProvider: Simulated refund creation failure");
    }

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const refund: RefundResult = {
      refundId: `rfnd_fake_${randomSuffix}`,
      paymentId: options.paymentId,
      amountPaise: options.amountPaise ?? 0,
      currency: "INR",
      status: "processed",
    };

    this.createdRefunds.push(refund);
    return refund;
  }
}
