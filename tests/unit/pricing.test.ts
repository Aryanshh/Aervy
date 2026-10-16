import { describe, it, expect } from "vitest";
import { calculateQuote, PricingError } from "@/lib/pricing/calculate";
import { computeQuoteInputsHash, verifyQuoteInputsHash } from "@/lib/pricing/hash";

describe("Stage 3 Pricing Engine (Integer Paise & Hashing)", () => {
  const baseRatePaise = 1500000; // ₹15,000 / hr
  const zoneId = "zone-blr-mg-road";
  const startAt = new Date("2026-11-01T18:00:00Z");
  const endAt = new Date("2026-11-01T19:00:00Z"); // 1 hour

  describe("Base Pricing Calculations", () => {
    it("calculates accurate 1-hour quote with 18% GST in integer paise", () => {
      const quote = calculateQuote({
        zoneId,
        zoneRatePaise: baseRatePaise,
        startAt,
        endAt,
      });

      expect(quote.billableHours).toBe(1);
      expect(quote.subtotalPaise).toBe(1500000);
      expect(quote.adjustedPaise).toBe(1500000);
      expect(quote.discountPaise).toBe(0);
      expect(quote.taxablePaise).toBe(1500000);
      expect(quote.gstBps).toBe(1800);
      expect(quote.gstPaise).toBe(270000); // 18% of 15,000 = 2,700 INR = 270,000 paise
      expect(quote.totalPaise).toBe(1770000); // 17,700 INR = 1,770,000 paise
      expect(quote.currency).toBe("INR");
      expect(typeof quote.inputsHash).toBe("string");
      expect(quote.inputsHash.length).toBe(64);
    });

    it("calculates accurate multi-day / multi-hour quotes", () => {
      const multiDayEnd = new Date("2026-11-03T18:00:00Z"); // 48 hours
      const quote = calculateQuote({
        zoneId,
        zoneRatePaise: baseRatePaise,
        startAt,
        endAt: multiDayEnd,
      });

      expect(quote.billableHours).toBe(48);
      expect(quote.subtotalPaise).toBe(1500000 * 48); // 72,000,000 paise = ₹720,000
      expect(quote.gstPaise).toBe(Math.round((72000000 * 1800) / 10000)); // 12,960,000 paise
      expect(quote.totalPaise).toBe(72000000 + 12960000);
    });

    it("applies basis point multipliers correctly (e.g. 1.25x = 12500 bps)", () => {
      const quote = calculateQuote({
        zoneId,
        zoneRatePaise: baseRatePaise,
        startAt,
        endAt,
        multiplierBps: 12500, // 1.25x peak multiplier
      });

      expect(quote.multiplierBps).toBe(12500);
      expect(quote.subtotalPaise).toBe(1500000);
      expect(quote.adjustedPaise).toBe(1875000); // 15,000 * 1.25 = ₹18,750
      expect(quote.gstPaise).toBe(Math.round((1875000 * 1800) / 10000)); // ₹3,375 = 337,500 paise
      expect(quote.totalPaise).toBe(1875000 + 337500); // ₹22,125 = 2,212,500 paise
    });

    it("applies promotional discount to taxable subtotal", () => {
      const quote = calculateQuote({
        zoneId,
        zoneRatePaise: baseRatePaise,
        startAt,
        endAt,
        discountPaise: 50000, // ₹500 discount
      });

      expect(quote.subtotalPaise).toBe(1500000);
      expect(quote.discountPaise).toBe(50000);
      expect(quote.taxablePaise).toBe(1450000); // ₹14,500
      expect(quote.gstPaise).toBe(Math.round((1450000 * 1800) / 10000)); // ₹2,610 = 261,000 paise
      expect(quote.totalPaise).toBe(1450000 + 261000); // ₹17,110 = 1,711,000 paise
    });
  });

  describe("Rounding Rule (Round Half Up)", () => {
    it("strictly rounds half up to avoid floating point discrepancies", () => {
      // 133 paise * 18% GST = 23.94 paise -> rounds to 24 paise
      const quote = calculateQuote({
        zoneId,
        zoneRatePaise: 133,
        startAt,
        endAt,
      });

      expect(quote.subtotalPaise).toBe(133);
      expect(quote.gstPaise).toBe(24);
      expect(quote.totalPaise).toBe(157);
    });
  });

  describe("Input Validation & Boundary Safeguards", () => {
    it("rejects when end time is before or equal to start time", () => {
      expect(() =>
        calculateQuote({
          zoneId,
          zoneRatePaise: baseRatePaise,
          startAt,
          endAt: startAt, // 0 duration
        })
      ).toThrow(PricingError);

      expect(() =>
        calculateQuote({
          zoneId,
          zoneRatePaise: baseRatePaise,
          startAt,
          endAt: new Date(startAt.getTime() - 3600000), // Inverted
        })
      ).toThrow(PricingError);
    });

    it("rejects non-positive zone rates", () => {
      expect(() =>
        calculateQuote({
          zoneId,
          zoneRatePaise: 0,
          startAt,
          endAt,
        })
      ).toThrow(PricingError);

      expect(() =>
        calculateQuote({
          zoneId,
          zoneRatePaise: -500,
          startAt,
          endAt,
        })
      ).toThrow(PricingError);
    });

    it("rejects durations exceeding configured maximum (720 hours)", () => {
      const over30DaysEnd = new Date(startAt.getTime() + 721 * 3600 * 1000);
      expect(() =>
        calculateQuote({
          zoneId,
          zoneRatePaise: baseRatePaise,
          startAt,
          endAt: over30DaysEnd,
        })
      ).toThrow(PricingError);
    });
  });

  describe("Cryptographic Quote Hash Integrity", () => {
    it("generates deterministic SHA-256 hashes that verify matching inputs", () => {
      const inputs = {
        zoneId,
        zoneRatePaise: baseRatePaise,
        startAt,
        endAt,
        billableHours: 1,
        multiplierBps: 10000,
        discountPaise: 0,
        gstBps: 1800,
      };

      const hash1 = computeQuoteInputsHash(inputs);
      const hash2 = computeQuoteInputsHash(inputs);

      expect(hash1).toBe(hash2);
      expect(verifyQuoteInputsHash(hash1, inputs)).toBe(true);
    });

    it("detects any client-side tampering of rates, times, or hours", () => {
      const validInputs = {
        zoneId,
        zoneRatePaise: baseRatePaise,
        startAt,
        endAt,
        billableHours: 1,
        multiplierBps: 10000,
        discountPaise: 0,
        gstBps: 1800,
      };

      const originalHash = computeQuoteInputsHash(validInputs);

      // Tampered rate (e.g. client attempts to pay ₹100 instead of ₹15,000)
      const tamperedInputs = {
        ...validInputs,
        zoneRatePaise: 10000,
      };

      expect(computeQuoteInputsHash(tamperedInputs)).not.toBe(originalHash);
      expect(verifyQuoteInputsHash(originalHash, tamperedInputs)).toBe(false);
    });
  });
});
