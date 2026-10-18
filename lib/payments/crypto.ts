import crypto from "crypto";

/**
 * Generates an HMAC SHA-256 hexadecimal digest for a given payload and secret.
 */
export function generateHmacSha256(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Safely compares two hexadecimal strings using constant-time timingSafeEqual
 * to protect against timing attacks.
 */
export function safeCompareHex(expectedHex: string, actualHex: string): boolean {
  if (typeof expectedHex !== "string" || typeof actualHex !== "string") {
    return false;
  }

  // Hex strings must be even length
  if (expectedHex.length % 2 !== 0 || actualHex.length % 2 !== 0) {
    return false;
  }

  try {
    const expectedBuf = Buffer.from(expectedHex, "hex");
    const actualBuf = Buffer.from(actualHex, "hex");

    if (expectedBuf.length !== actualBuf.length || expectedBuf.length === 0) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  } catch {
    return false;
  }
}

/**
 * Verifies that a signature matches the HMAC SHA-256 digest of the payload.
 */
export function verifyHmacSha256(payload: string, signature: string, secret: string): boolean {
  if (!payload || !signature || !secret) {
    return false;
  }

  const expectedSignature = generateHmacSha256(payload, secret);
  return safeCompareHex(expectedSignature, signature);
}

/**
 * Verifies a Razorpay checkout signature for an order and payment ID.
 * Format specified by Razorpay: HMAC-SHA256(order_id + "|" + payment_id, secret)
 */
export function verifyRazorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  const payload = `${orderId}|${paymentId}`;
  return verifyHmacSha256(payload, signature, secret);
}
