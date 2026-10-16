import crypto from "crypto";

export interface HashablePricingInputs {
  zoneId: string;
  zoneRatePaise: number;
  startAt: Date;
  endAt: Date;
  billableHours: number;
  multiplierBps: number;
  discountPaise: number;
  gstBps: number;
}

/**
 * Computes a deterministic SHA-256 hash for quote inputs to verify price integrity.
 */
export function computeQuoteInputsHash(inputs: HashablePricingInputs): string {
  const canonicalString = [
    `zoneId:${inputs.zoneId}`,
    `rate:${inputs.zoneRatePaise}`,
    `start:${inputs.startAt.toISOString()}`,
    `end:${inputs.endAt.toISOString()}`,
    `hours:${inputs.billableHours}`,
    `multiplier:${inputs.multiplierBps}`,
    `discount:${inputs.discountPaise}`,
    `gst:${inputs.gstBps}`,
  ].join("|");

  return crypto.createHash("sha256").update(canonicalString).digest("hex");
}

/**
 * Verifies if an existing hash matches the current recomputed inputs.
 */
export function verifyQuoteInputsHash(
  existingHash: string,
  currentInputs: HashablePricingInputs
): boolean {
  const expectedHash = computeQuoteInputsHash(currentInputs);
  return crypto.timingSafeEqual(Buffer.from(existingHash), Buffer.from(expectedHash));
}
