import { describe, it, expect, beforeEach, vi } from "vitest";
import { CampaignStatus, PaymentStatus } from "@prisma/client";
import { FakeProvider } from "@/lib/payments/fake-provider";
import {
  generateHmacSha256,
  safeCompareHex,
  verifyHmacSha256,
  verifyRazorpayPaymentSignature,
} from "@/lib/payments/crypto";
import { initiateCheckout, verifyAndCompleteCheckout } from "@/lib/payments/checkout";
import { processWebhookEvent } from "@/lib/payments/webhook";
import { processCampaignRefund } from "@/lib/payments/refund";
import { transition } from "@/lib/campaign-workflow/transition";
import { AuthContextUser } from "@/lib/permissions/can";

// In-Memory Database Mock for hermetic, fast, and deterministic tests
interface MockZone {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  ratePerHourPaise: number;
  status: string;
  isActive: boolean;
  capacity: number;
  polygon: unknown;
}

interface MockCampaign {
  id: string;
  name: string;
  brand: string;
  objective: string;
  organizationId: string;
  createdById: string;
  zoneId: string | null;
  startAt: Date | null;
  endAt: Date | null;
  status: CampaignStatus;
  version: number;
  flexibility: string;
}

interface MockSlotHold {
  id: string;
  campaignId: string;
  zoneId: string;
  startAt: Date;
  endAt: Date;
  expiresAt: Date;
  status: string;
}

interface MockQuote {
  id: string;
  campaignId: string;
  zoneRatePaise: number;
  billableHours: number;
  subtotalPaise: number;
  multiplierBps: number;
  discountPaise: number;
  gstBps: number;
  gstPaise: number;
  totalPaise: number;
  currency: string;
  inputsHash: string;
}

interface MockPayment {
  id: string;
  campaignId: string;
  quoteId: string;
  provider: string;
  providerOrderId: string;
  providerPaymentId: string | null;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  failureReason: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

interface MockRefund {
  id: string;
  paymentId: string;
  providerRefundId: string | null;
  amountPaise: number;
  reason: string;
  status: string;
  createdAt: Date;
}

interface MockWebhookEvent {
  id: string;
  provider: string;
  type: string;
  receivedAt: Date;
  processedAt: Date | null;
}

const { dbState, mockDb } = vi.hoisted(() => {
  const dbState = {
    zones: new Map<string, MockZone>(),
    campaigns: new Map<string, MockCampaign>(),
    slotHolds: new Map<string, MockSlotHold>(),
    quotes: new Map<string, MockQuote>(),
    payments: new Map<string, MockPayment>(),
    refunds: new Map<string, MockRefund>(),
    webhookEvents: new Map<string, MockWebhookEvent>(),
    notifications: [] as Array<Record<string, unknown>>,
    auditLogs: [] as Array<Record<string, unknown>>,
    statusEvents: [] as Array<Record<string, unknown>>,
  };

  const mockDb = {
  zone: {
    findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
      return dbState.zones.get(where.id) ?? null;
    }),
  },
  campaign: {
    findUnique: vi.fn(
      async ({
        where,
        include,
      }: {
        where: { id: string };
        include?: { zone?: boolean; payments?: unknown };
      }) => {
        const camp = dbState.campaigns.get(where.id);
        if (!camp) return null;

        const result: Record<string, unknown> = { ...camp };
        if (include?.zone && camp.zoneId) {
          result.zone = dbState.zones.get(camp.zoneId) ?? null;
        }
        if (include?.payments) {
          const matchingPayments = Array.from(dbState.payments.values())
            .filter((p) => p.campaignId === camp.id && p.status === "PAID")
            .map((p) => ({
              ...p,
              refunds: Array.from(dbState.refunds.values()).filter((r) => r.paymentId === p.id),
            }));
          result.payments = matchingPayments;
        }
        return result;
      }
    ),
    update: vi.fn(
      async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { status?: CampaignStatus; version?: { increment: number } };
      }) => {
        const camp = dbState.campaigns.get(where.id);
        if (!camp) throw new Error("Campaign not found");
        if (data.status) camp.status = data.status;
        if (data.version?.increment) camp.version += data.version.increment;
        dbState.campaigns.set(camp.id, camp);
        return { ...camp };
      }
    ),
    count: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const camps = Array.from(dbState.campaigns.values());
      const filtered = camps.filter((c) => {
        if (where.zoneId && c.zoneId !== where.zoneId) return false;
        if (where.id && typeof where.id === "object" && "not" in where.id && c.id === (where.id as { not: string }).not) return false;
        if (where.status && typeof where.status === "object" && "notIn" in where.status) {
          const notIn = (where.status as { notIn: CampaignStatus[] }).notIn;
          if (notIn.includes(c.status)) return false;
        }
        return true;
      });
      return filtered.length;
    }),
  },
  slotHold: {
    create: vi.fn(async ({ data }: { data: Omit<MockSlotHold, "id"> }) => {
      const hold: MockSlotHold = {
        id: `hold_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ...data,
      };
      dbState.slotHolds.set(hold.id, hold);
      return hold;
    }),
    findFirst: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const holds = Array.from(dbState.slotHolds.values());
      return (
        holds.find((h) => {
          if (where.campaignId && h.campaignId !== where.campaignId) return false;
          if (where.status && h.status !== where.status) return false;
          return true;
        }) ?? null
      );
    }),
    findMany: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const holds = Array.from(dbState.slotHolds.values());
      return holds.filter((h) => {
        if (where.campaignId && h.campaignId !== where.campaignId) return false;
        if (where.status && h.status !== where.status) return false;
        return true;
      });
    }),
    updateMany: vi.fn(
      async ({ where, data }: { where: Record<string, unknown>; data: { status: string } }) => {
        let count = 0;
        for (const hold of dbState.slotHolds.values()) {
          let match = true;
          if (where.campaignId && hold.campaignId !== where.campaignId) match = false;
          if (where.status && hold.status !== where.status) match = false;
          if (match) {
            hold.status = data.status;
            count++;
          }
        }
        return { count };
      }
    ),
    count: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const holds = Array.from(dbState.slotHolds.values());
      const filtered = holds.filter((h) => {
        if (where.zoneId && h.zoneId !== where.zoneId) return false;
        if (where.campaignId && typeof where.campaignId === "object" && "not" in where.campaignId && h.campaignId === (where.campaignId as { not: string }).not) return false;
        if (where.status && h.status !== where.status) return false;
        return true;
      });
      return filtered.length;
    }),
  },
  quote: {
    create: vi.fn(async ({ data }: { data: Omit<MockQuote, "id"> }) => {
      const quote: MockQuote = {
        id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ...data,
      };
      dbState.quotes.set(quote.id, quote);
      return quote;
    }),
  },
  payment: {
    create: vi.fn(async ({ data }: { data: Omit<MockPayment, "id" | "createdAt" | "providerPaymentId" | "failureReason" | "paidAt"> }) => {
      const payment: MockPayment = {
        id: `pay_rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        providerPaymentId: null,
        failureReason: null,
        paidAt: null,
        createdAt: new Date(),
        ...data,
      };
      dbState.payments.set(payment.id, payment);
      return payment;
    }),
    findUnique: vi.fn(
      async ({
        where,
        include,
      }: {
        where: { id?: string; providerOrderId?: string };
        include?: { campaign?: boolean };
      }) => {
        let payment: MockPayment | undefined;
        if (where.id) {
          payment = dbState.payments.get(where.id);
        } else if (where.providerOrderId) {
          payment = Array.from(dbState.payments.values()).find(
            (p) => p.providerOrderId === where.providerOrderId
          );
        }
        if (!payment) return null;

        const result: Record<string, unknown> = { ...payment };
        if (include?.campaign) {
          result.campaign = dbState.campaigns.get(payment.campaignId) ?? null;
        }
        return result;
      }
    ),
    findMany: vi.fn(async ({ where }: { where: Record<string, unknown> }) => {
      const payments = Array.from(dbState.payments.values());
      return payments.filter((p) => {
        if (where.campaignId && p.campaignId !== where.campaignId) return false;
        if (where.status && p.status !== where.status) return false;
        return true;
      });
    }),
    update: vi.fn(
      async ({
        where,
        data,
      }: {
        where: { id: string };
        data: Partial<MockPayment>;
      }) => {
        const payment = dbState.payments.get(where.id);
        if (!payment) throw new Error("Payment not found");
        Object.assign(payment, data);
        dbState.payments.set(payment.id, payment);
        return { ...payment };
      }
    ),
  },
  refund: {
    create: vi.fn(async ({ data }: { data: Omit<MockRefund, "id" | "createdAt"> }) => {
      const refund: MockRefund = {
        id: `rfnd_rec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date(),
        ...data,
      };
      dbState.refunds.set(refund.id, refund);
      return refund;
    }),
    findFirst: vi.fn(async ({ where }: { where: { payment?: { campaignId: string } } }) => {
      const campaignId = where.payment?.campaignId;
      for (const refund of dbState.refunds.values()) {
        const payment = dbState.payments.get(refund.paymentId);
        if (payment && payment.campaignId === campaignId) {
          return refund;
        }
      }
      return null;
    }),
    findMany: vi.fn(async () => Array.from(dbState.refunds.values())),
    updateMany: vi.fn(
      async ({ where, data }: { where: { providerRefundId: string }; data: { status: string } }) => {
        let count = 0;
        for (const r of dbState.refunds.values()) {
          if (r.providerRefundId === where.providerRefundId) {
            r.status = data.status;
            count++;
          }
        }
        return { count };
      }
    ),
  },
  webhookEvent: {
    findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
      return dbState.webhookEvents.get(where.id) ?? null;
    }),
    create: vi.fn(async ({ data }: { data: Omit<MockWebhookEvent, "processedAt"> & { processedAt?: Date | null } }) => {
      const evt: MockWebhookEvent = {
        processedAt: null,
        ...data,
      };
      dbState.webhookEvents.set(evt.id, evt);
      return evt;
    }),
    update: vi.fn(async ({ where, data }: { where: { id: string }; data: { processedAt: Date } }) => {
      const evt = dbState.webhookEvents.get(where.id);
      if (evt) {
        evt.processedAt = data.processedAt;
      }
      return evt;
    }),
  },
  notification: {
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      dbState.notifications.push(data);
      return data;
    }),
    findFirst: vi.fn(async ({ where }: { where: { recipientOrgId?: string } }) => {
      return (
        dbState.notifications.find((n) => n.recipientOrgId === where.recipientOrgId) ?? null
      );
    }),
  },
  auditLog: {
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      dbState.auditLogs.push(data);
      return data;
    }),
  },
  statusEvent: {
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      dbState.statusEvents.push(data);
      return data;
    }),
  },
  $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
    return await callback(mockDb);
  }),
};

return { dbState, mockDb };
});

// Mock database module
vi.mock("@/lib/db", () => {
  return { db: mockDb };
});

describe("Stage 5: Payment Gateway, Checkout, Webhooks & Refunds", () => {
  let fakeProvider: FakeProvider;
  let testOrgId: string;
  let testUserId: string;
  let testZoneId: string;
  let testUser: AuthContextUser;

  beforeEach(() => {
    // Reset in-memory database state
    dbState.zones.clear();
    dbState.campaigns.clear();
    dbState.slotHolds.clear();
    dbState.quotes.clear();
    dbState.payments.clear();
    dbState.refunds.clear();
    dbState.webhookEvents.clear();
    dbState.notifications.length = 0;
    dbState.auditLogs.length = 0;
    dbState.statusEvents.length = 0;

    fakeProvider = new FakeProvider({
      defaultSecret: "test_rzp_secret_key_1234567890",
      webhookSecret: "test_rzp_webhook_secret_abcdef",
    });

    testOrgId = "org-test-payments";
    testUserId = "user-test-payments";
    testZoneId = "zone-test-payments";

    testUser = {
      id: testUserId,
      role: "ADVERTISER",
      organizationIds: [testOrgId],
      isActive: true,
    };

    // Seed approved zone
    dbState.zones.set(testZoneId, {
      id: testZoneId,
      name: "Indiranagar 100ft Rd",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      ratePerHourPaise: 500000, // ₹5,000 / hour
      status: "APPROVED",
      isActive: true,
      capacity: 1,
      polygon: [
        [12.9716, 77.6412],
        [12.9726, 77.6422],
        [12.9706, 77.6432],
      ],
    });
  });

  // --------------------------------------------------------------------------
  // 1. Cryptographic HMAC-SHA256 & Constant-Time Verification
  // --------------------------------------------------------------------------
  describe("Cryptographic Signatures", () => {
    const secret = "super_secret_key_1234567890";
    const payload = "order_12345|pay_67890";

    it("should generate and verify valid HMAC-SHA256 signatures", () => {
      const signature = generateHmacSha256(payload, secret);
      expect(signature).toHaveLength(64);

      const isValid = verifyHmacSha256(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it("should reject tampered payloads, secrets, and signatures", () => {
      const signature = generateHmacSha256(payload, secret);

      expect(verifyHmacSha256(payload + "_tampered", signature, secret)).toBe(false);
      expect(verifyHmacSha256(payload, signature, "wrong_secret")).toBe(false);
      expect(verifyHmacSha256(payload, "a".repeat(64), secret)).toBe(false);
    });

    it("should safely compare hex strings without throwing on length mismatches or invalid hex", () => {
      expect(safeCompareHex("abcd", "abcd")).toBe(true);
      expect(safeCompareHex("abcd", "abce")).toBe(false);
      expect(safeCompareHex("abcd", "abcdef")).toBe(false);
      expect(safeCompareHex("odd_length", "odd_length")).toBe(false);
      expect(safeCompareHex("not_hex!!", "not_hex!!")).toBe(false);
    });

    it("should verify Razorpay standard orderId|paymentId signature format", () => {
      const orderId = "order_abc123";
      const paymentId = "pay_xyz789";
      const validSig = generateHmacSha256(`${orderId}|${paymentId}`, secret);

      expect(verifyRazorpayPaymentSignature(orderId, paymentId, validSig, secret)).toBe(true);
      expect(
        verifyRazorpayPaymentSignature(orderId, "pay_wrong", validSig, secret)
      ).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 2. FakeProvider Determinism
  // --------------------------------------------------------------------------
  describe("FakeProvider", () => {
    it("should create orders and allow test signature generation", async () => {
      const order = await fakeProvider.createOrder({
        amountPaise: 1180000,
        currency: "INR",
        receipt: "rcpt_001",
      });

      expect(order.orderId).toMatch(/^order_fake_/);
      expect(order.amountPaise).toBe(1180000);
      expect(fakeProvider.createdOrders).toHaveLength(1);

      const paymentId = "pay_fake_test123";
      const sig = fakeProvider.generateTestPaymentSignature(order.orderId, paymentId);
      expect(
        fakeProvider.verifyPaymentSignature({
          orderId: order.orderId,
          paymentId,
          signature: sig,
        })
      ).toBe(true);
    });

    it("should simulate failure if configured", async () => {
      const failingProvider = new FakeProvider({ shouldFailOrderCreation: true });
      await expect(
        failingProvider.createOrder({
          amountPaise: 1000,
          receipt: "rcpt_fail",
        })
      ).rejects.toThrow("FakeProvider: Simulated order creation failure");
    });
  });

  // --------------------------------------------------------------------------
  // 3. Checkout Initiation (`initiateCheckout`)
  // --------------------------------------------------------------------------
  describe("initiateCheckout", () => {
    it("should hold slot, persist quote, create provider order, and transition DRAFT -> PENDING_PAYMENT", async () => {
      const campaignId = "camp_diwali_1";
      dbState.campaigns.set(campaignId, {
        id: campaignId,
        name: "Diwali Blitz Campaign",
        brand: "Acme",
        objective: "Brand Awareness",
        organizationId: testOrgId,
        createdById: testUserId,
        zoneId: testZoneId,
        startAt: new Date("2026-11-01T10:00:00Z"),
        endAt: new Date("2026-11-01T12:00:00Z"), // 2 billable hours
        status: CampaignStatus.DRAFT,
        version: 0,
        flexibility: "FIXED",
      });

      const checkoutResult = await initiateCheckout({
        campaignId,
        user: testUser,
        provider: fakeProvider,
      });

      expect(checkoutResult.orderId).toMatch(/^order_fake_/);
      // 2 hours * ₹5,000/hr = ₹10,000 + 18% GST = ₹11,800 = 1,180,000 paise
      expect(checkoutResult.amountPaise).toBe(1180000);
      expect(checkoutResult.currency).toBe("INR");

      // Verify SlotHold in DB
      const hold = Array.from(dbState.slotHolds.values()).find(
        (h) => h.campaignId === campaignId && h.status === "ACTIVE"
      );
      expect(hold).toBeDefined();
      expect(hold?.zoneId).toBe(testZoneId);

      // Verify Campaign status transition
      const updatedCampaign = dbState.campaigns.get(campaignId);
      expect(updatedCampaign?.status).toBe(CampaignStatus.PENDING_PAYMENT);

      // Verify Payment record created with status CREATED
      const payment = Array.from(dbState.payments.values()).find(
        (p) => p.providerOrderId === checkoutResult.orderId
      );
      expect(payment).toBeDefined();
      expect(payment?.status).toBe(PaymentStatus.CREATED);
      expect(payment?.amountPaise).toBe(1180000);
    });

    it("should reject checkout if client quote hash does not match server-calculated quote", async () => {
      const campaignId = "camp_tamper_1";
      dbState.campaigns.set(campaignId, {
        id: campaignId,
        name: "Tampered Quote Campaign",
        brand: "Acme",
        objective: "Awareness",
        organizationId: testOrgId,
        createdById: testUserId,
        zoneId: testZoneId,
        startAt: new Date("2026-11-01T10:00:00Z"),
        endAt: new Date("2026-11-01T11:00:00Z"),
        status: CampaignStatus.DRAFT,
        version: 0,
        flexibility: "FIXED",
      });

      await expect(
        initiateCheckout({
          campaignId,
          user: testUser,
          clientQuoteHash: "tampered_fake_quote_hash_123456",
          provider: fakeProvider,
        })
      ).rejects.toThrow("Pricing inputs have changed");
    });
  });

  // --------------------------------------------------------------------------
  // 4. Checkout Verification (`verifyAndCompleteCheckout`)
  // --------------------------------------------------------------------------
  describe("verifyAndCompleteCheckout", () => {
    it("should atomically verify signature, mark Payment PAID, convert hold, and transition to SUBMITTED", async () => {
      const campaignId = "camp_summer_1";
      dbState.campaigns.set(campaignId, {
        id: campaignId,
        name: "Summer Launch",
        brand: "Acme",
        objective: "Launch",
        organizationId: testOrgId,
        createdById: testUserId,
        zoneId: testZoneId,
        startAt: new Date("2026-12-01T10:00:00Z"),
        endAt: new Date("2026-12-01T12:00:00Z"),
        status: CampaignStatus.DRAFT,
        version: 0,
        flexibility: "FIXED",
      });

      const checkout = await initiateCheckout({
        campaignId,
        user: testUser,
        provider: fakeProvider,
      });

      const paymentId = "pay_rzp_mock_998877";
      const validSig = fakeProvider.generateTestPaymentSignature(
        checkout.orderId,
        paymentId
      );

      const verifyResult = await verifyAndCompleteCheckout({
        campaignId,
        orderId: checkout.orderId,
        paymentId,
        signature: validSig,
        user: testUser,
        provider: fakeProvider,
      });

      expect(verifyResult.success).toBe(true);
      expect(verifyResult.status).toBe(CampaignStatus.SUBMITTED);

      // Verify DB updates
      const updatedPayment = Array.from(dbState.payments.values()).find(
        (p) => p.providerOrderId === checkout.orderId
      );
      expect(updatedPayment?.status).toBe(PaymentStatus.PAID);
      expect(updatedPayment?.providerPaymentId).toBe(paymentId);
      expect(updatedPayment?.paidAt).toBeInstanceOf(Date);

      // Verify hold converted
      const holds = Array.from(dbState.slotHolds.values()).filter(
        (h) => h.campaignId === campaignId
      );
      expect(holds[0]?.status).toBe("CONVERTED");

      // Verify campaign status in DB
      const updatedCampaign = dbState.campaigns.get(campaignId);
      expect(updatedCampaign?.status).toBe(CampaignStatus.SUBMITTED);
    });

    it("should reject tampered signature and mark payment as FAILED", async () => {
      const campaignId = "camp_fraud_1";
      dbState.campaigns.set(campaignId, {
        id: campaignId,
        name: "Fraud Attempt Campaign",
        brand: "Acme",
        objective: "Launch",
        organizationId: testOrgId,
        createdById: testUserId,
        zoneId: testZoneId,
        startAt: new Date("2026-12-02T10:00:00Z"),
        endAt: new Date("2026-12-02T12:00:00Z"),
        status: CampaignStatus.DRAFT,
        version: 0,
        flexibility: "FIXED",
      });

      const checkout = await initiateCheckout({
        campaignId,
        user: testUser,
        provider: fakeProvider,
      });

      await expect(
        verifyAndCompleteCheckout({
          campaignId,
          orderId: checkout.orderId,
          paymentId: "pay_fake_attempt",
          signature: "tampered_signature_hex_0000000000000000000000000000000000000000",
          user: testUser,
          provider: fakeProvider,
        })
      ).rejects.toThrow("Invalid payment signature");

      const payment = Array.from(dbState.payments.values()).find(
        (p) => p.providerOrderId === checkout.orderId
      );
      expect(payment?.status).toBe(PaymentStatus.FAILED);
      expect(payment?.failureReason).toBe("Signature verification failed");
    });
  });

  // --------------------------------------------------------------------------
  // 5. Inbound Webhook Processing (`processWebhookEvent`)
  // --------------------------------------------------------------------------
  describe("processWebhookEvent", () => {
    it("should process order.paid webhook, convert hold, and transition campaign idempotently", async () => {
      const campaignId = "camp_webhook_1";
      dbState.campaigns.set(campaignId, {
        id: campaignId,
        name: "Webhook Tested Campaign",
        brand: "Acme",
        objective: "Launch",
        organizationId: testOrgId,
        createdById: testUserId,
        zoneId: testZoneId,
        startAt: new Date("2026-12-05T09:00:00Z"),
        endAt: new Date("2026-12-05T11:00:00Z"),
        status: CampaignStatus.DRAFT,
        version: 0,
        flexibility: "FIXED",
      });

      const checkout = await initiateCheckout({
        campaignId,
        user: testUser,
        provider: fakeProvider,
      });

      const webhookPayload = JSON.stringify({
        id: "evt_test_payment_captured_1",
        event: "order.paid",
        payload: {
          order: {
            entity: {
              id: checkout.orderId,
              amount: 1180000,
              amount_paid: 1180000,
              status: "paid",
            },
          },
          payment: {
            entity: {
              id: "pay_webhook_capt_123",
              order_id: checkout.orderId,
              amount: 1180000,
              currency: "INR",
              status: "captured",
            },
          },
        },
      });

      const validSig = fakeProvider.generateTestWebhookSignature(webhookPayload);

      // First webhook delivery
      const res1 = await processWebhookEvent({
        rawBody: webhookPayload,
        signature: validSig,
        provider: fakeProvider,
      });

      expect(res1.received).toBe(true);
      expect(res1.duplicate).toBe(false);
      expect(res1.processed).toBe(true);

      const updatedCampaign = dbState.campaigns.get(campaignId);
      expect(updatedCampaign?.status).toBe(CampaignStatus.SUBMITTED);

      // Duplicate replay delivery of exact same webhook event ID
      const res2 = await processWebhookEvent({
        rawBody: webhookPayload,
        signature: validSig,
        provider: fakeProvider,
      });

      expect(res2.received).toBe(true);
      expect(res2.duplicate).toBe(true);
    });

    it("should handle payment.failed webhook: release hold and revert to DRAFT", async () => {
      const campaignId = "camp_failed_pay_1";
      dbState.campaigns.set(campaignId, {
        id: campaignId,
        name: "Failed Payment Campaign",
        brand: "Acme",
        objective: "Promo",
        organizationId: testOrgId,
        createdById: testUserId,
        zoneId: testZoneId,
        startAt: new Date("2026-12-10T14:00:00Z"),
        endAt: new Date("2026-12-10T15:00:00Z"),
        status: CampaignStatus.DRAFT,
        version: 0,
        flexibility: "FIXED",
      });

      const checkout = await initiateCheckout({
        campaignId,
        user: testUser,
        provider: fakeProvider,
      });

      const webhookPayload = JSON.stringify({
        id: "evt_test_payment_failed_2",
        event: "payment.failed",
        payload: {
          payment: {
            entity: {
              id: "pay_failed_456",
              order_id: checkout.orderId,
              amount: checkout.amountPaise,
              currency: "INR",
              status: "failed",
              error_description: "Insufficient funds in bank account",
            },
          },
        },
      });

      const validSig = fakeProvider.generateTestWebhookSignature(webhookPayload);

      const res = await processWebhookEvent({
        rawBody: webhookPayload,
        signature: validSig,
        provider: fakeProvider,
      });

      expect(res.processed).toBe(true);

      // Verify campaign reverted to DRAFT
      const updatedCampaign = dbState.campaigns.get(campaignId);
      expect(updatedCampaign?.status).toBe(CampaignStatus.DRAFT);

      // Verify hold was released
      const hold = Array.from(dbState.slotHolds.values()).find(
        (h) => h.campaignId === campaignId
      );
      expect(hold?.status).toBe("RELEASED");

      // Verify payment marked as FAILED
      const payment = Array.from(dbState.payments.values()).find(
        (p) => p.providerOrderId === checkout.orderId
      );
      expect(payment?.status).toBe(PaymentStatus.FAILED);
      expect(payment?.failureReason).toBe("Insufficient funds in bank account");
    });
  });

  // --------------------------------------------------------------------------
  // 6. Automatic Refund on Campaign Rejection
  // --------------------------------------------------------------------------
  describe("Refunds & Rejection Lifecycle", () => {
    it("should trigger refund when an active paid campaign is rejected by Ops reviewer", async () => {
      // 1. Create and submit paid campaign
      const campaignId = "camp_to_reject_1";
      dbState.campaigns.set(campaignId, {
        id: campaignId,
        name: "Holiday Promo to Reject",
        brand: "Acme",
        objective: "Brand Awareness",
        organizationId: testOrgId,
        createdById: testUserId,
        zoneId: testZoneId,
        startAt: new Date("2026-12-25T18:00:00Z"),
        endAt: new Date("2026-12-25T20:00:00Z"),
        status: CampaignStatus.DRAFT,
        version: 0,
        flexibility: "FIXED",
      });

      const checkout = await initiateCheckout({
        campaignId,
        user: testUser,
        provider: fakeProvider,
      });

      const paymentId = "pay_paid_9988";
      await verifyAndCompleteCheckout({
        campaignId,
        orderId: checkout.orderId,
        paymentId,
        signature: fakeProvider.generateTestPaymentSignature(checkout.orderId, paymentId),
        user: testUser,
        provider: fakeProvider,
      });

      // 2. Ops reviewer picks up campaign: SUBMITTED -> UNDER_REVIEW
      await transition({
        campaignId,
        toStatus: CampaignStatus.UNDER_REVIEW,
        actor: { type: "USER", userId: "ops-reviewer-1", role: "OPS_REVIEWER" },
      });

      // 3. Ops reviewer rejects campaign: UNDER_REVIEW -> REJECTED (with reason)
      const rejectResult = await transition({
        campaignId,
        toStatus: CampaignStatus.REJECTED,
        actor: { type: "USER", userId: "ops-reviewer-1", role: "OPS_REVIEWER" },
        reason: "Creative resolution does not meet safety visibility standards",
      });

      expect(rejectResult.toStatus).toBe(CampaignStatus.REJECTED);

      // Verify Refund record created in database
      const refundRecord = Array.from(dbState.refunds.values())[0];
      expect(refundRecord).toBeDefined();
      expect(refundRecord?.amountPaise).toBe(checkout.amountPaise);
      expect(refundRecord?.status).toBe("PROCESSED");
      expect(refundRecord?.reason).toContain("Creative resolution does not meet safety");

      // Verify Notification sent to advertiser
      const notification = dbState.notifications.find(
        (n) => n.userId === testUserId
      );
      expect(notification).toBeDefined();
      expect((notification?.title as string) || "").toContain("Payment Refund Initiated");

      // Verify idempotency: calling processCampaignRefund again does not issue duplicate refund
      const secondRefund = await processCampaignRefund({
        campaignId,
        reason: "Second call test",
        provider: fakeProvider,
      });
      expect(secondRefund.totalRefundedPaise).toBe(0);
      expect(secondRefund.refunds).toHaveLength(0);
    });
  });
});
