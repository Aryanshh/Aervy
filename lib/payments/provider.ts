import { PaymentProvider } from "./types";
import { RazorpayProvider } from "./razorpay-provider";
import { FakeProvider } from "./fake-provider";

let activeProvider: PaymentProvider | null = null;

/**
 * Resolves the active payment provider based on environment configuration or override.
 * Defaults to FakeProvider during tests or when Razorpay credentials are not provided.
 */
export function getPaymentProvider(preferredName?: string): PaymentProvider {
  if (activeProvider && !preferredName) {
    return activeProvider;
  }

  const providerType =
    preferredName ??
    process.env.PAYMENT_PROVIDER ??
    (process.env.NODE_ENV === "test" || !process.env.RAZORPAY_KEY_SECRET ? "fake" : "razorpay");

  if (providerType === "fake") {
    return new FakeProvider();
  }

  return new RazorpayProvider();
}

/**
 * Sets an explicit active provider instance (useful for integration tests and custom mocks).
 */
export function setPaymentProvider(provider: PaymentProvider | null): void {
  activeProvider = provider;
}
