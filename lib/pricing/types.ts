export interface PricingInputs {
  zoneId: string;
  zoneRatePaise: number;
  startAt: Date;
  endAt: Date;
  multiplierBps?: number; // 10000 = 1.0x (basis points)
  discountPaise?: number; // Promo discount in integer paise
  gstBps?: number; // 1800 = 18% GST (basis points)
}

export interface QuoteBreakdown {
  zoneId: string;
  zoneRatePaise: number;
  billableHours: number;
  subtotalPaise: number;
  multiplierBps: number;
  adjustedPaise: number;
  discountPaise: number;
  taxablePaise: number;
  gstBps: number;
  gstPaise: number;
  totalPaise: number;
  currency: "INR";
  inputsHash: string;
  calculatedAt: Date;
}

export interface PricingConfig {
  minDurationHours: number;
  maxDurationHours: number;
  defaultGstBps: number;
  defaultMultiplierBps: number;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  minDurationHours: 1,
  maxDurationHours: 720, // 30 days
  defaultGstBps: 1800, // 18% GST
  defaultMultiplierBps: 10000, // 1.0x base
};
