import {
  PricingInputs,
  QuoteBreakdown,
  DEFAULT_PRICING_CONFIG,
  PricingConfig,
} from "./types";
import { computeQuoteInputsHash } from "./hash";

export class PricingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PricingError";
  }
}

/**
 * Pure function that calculates an immutable, server-side quote in integer paise.
 * Enforces integer arithmetic (Round Half Up) and cryptographic input hashing.
 */
export function calculateQuote(
  inputs: PricingInputs,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): QuoteBreakdown {
  const { startAt, endAt, zoneId, zoneRatePaise } = inputs;

  // 1. Validate temporal boundaries
  const diffMs = endAt.getTime() - startAt.getTime();
  if (diffMs <= 0) {
    throw new PricingError("Campaign end time must be after start time");
  }

  // 2. Validate zone rate
  if (!Number.isInteger(zoneRatePaise) || zoneRatePaise <= 0) {
    throw new PricingError("Zone rate must be a positive integer in paise");
  }

  // 3. Compute billable hours (ceiling to full hour increments)
  const exactHours = diffMs / (1000 * 60 * 60);
  const billableHours = Math.ceil(exactHours);

  if (billableHours < config.minDurationHours) {
    throw new PricingError(
      `Campaign duration (${billableHours}h) is less than minimum required duration (${config.minDurationHours}h)`
    );
  }

  if (billableHours > config.maxDurationHours) {
    throw new PricingError(
      `Campaign duration (${billableHours}h) exceeds maximum allowed duration (${config.maxDurationHours}h)`
    );
  }

  // 4. Configurable parameters (fallback to defaults)
  const multiplierBps = inputs.multiplierBps ?? config.defaultMultiplierBps;
  const discountPaise = inputs.discountPaise ?? 0;
  const gstBps = inputs.gstBps ?? config.defaultGstBps;

  if (!Number.isInteger(multiplierBps) || multiplierBps <= 0) {
    throw new PricingError("Multiplier must be a positive integer in basis points (e.g. 10000 = 1.0x)");
  }

  if (!Number.isInteger(discountPaise) || discountPaise < 0) {
    throw new PricingError("Discount must be a non-negative integer in paise");
  }

  // 5. Integer Paise Arithmetic with Round Half Up (Math.round)
  const subtotalPaise = zoneRatePaise * billableHours;
  const adjustedPaise = Math.round((subtotalPaise * multiplierBps) / 10000);
  const taxablePaise = Math.max(0, adjustedPaise - discountPaise);
  const gstPaise = Math.round((taxablePaise * gstBps) / 10000);
  const totalPaise = taxablePaise + gstPaise;

  // 6. Cryptographic quote inputs hash
  const inputsHash = computeQuoteInputsHash({
    zoneId,
    zoneRatePaise,
    startAt,
    endAt,
    billableHours,
    multiplierBps,
    discountPaise,
    gstBps,
  });

  return {
    zoneId,
    zoneRatePaise,
    billableHours,
    subtotalPaise,
    multiplierBps,
    adjustedPaise,
    discountPaise,
    taxablePaise,
    gstBps,
    gstPaise,
    totalPaise,
    currency: "INR",
    inputsHash,
    calculatedAt: new Date(),
  };
}
