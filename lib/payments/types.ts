export interface CreateOrderOptions {
  amountPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrder {
  orderId: string;
  amountPaise: number;
  currency: string;
  receipt: string;
  status: "created" | "attempted" | "paid";
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyWebhookParams {
  rawBody: string;
  signature: string;
  secret?: string;
}

export interface CreateRefundOptions {
  paymentId: string;
  amountPaise?: number;
  reason?: string;
  notes?: Record<string, string>;
}

export interface RefundResult {
  refundId: string;
  paymentId: string;
  amountPaise: number;
  currency: string;
  status: "pending" | "processed" | "failed";
}

export interface PaymentProvider {
  name: string;
  createOrder(options: CreateOrderOptions): Promise<PaymentOrder>;
  verifyPaymentSignature(params: VerifyPaymentParams): boolean;
  verifyWebhookSignature(params: VerifyWebhookParams): boolean;
  createRefund(options: CreateRefundOptions): Promise<RefundResult>;
}
