import { describe, it, expect } from "vitest";
import {
  step1BasicsSchema,
  step2CreativeSchema,
  step3LocationSchema,
  step4ScheduleSchema,
  step6ReviewSchema,
} from "@/lib/validation/campaign";

describe("Stage 4 Shared Zod Validation Schemas", () => {
  describe("Step 1: Basics Schema", () => {
    it("accepts valid campaign basics data", () => {
      const valid = {
        name: "Acme Summer Launch",
        brand: "Acme Corp",
        objective: "Brand Awareness",
        description: "Launching summer beverage line across Bangalore.",
      };
      expect(step1BasicsSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects names shorter than 3 characters", () => {
      const invalid = {
        name: "AB",
        brand: "Acme",
        objective: "Brand Awareness",
      };
      const res = step1BasicsSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });

    it("rejects unknown campaign objectives", () => {
      const invalid = {
        name: "Acme Launch",
        brand: "Acme",
        objective: "Unknown Arbitrary Objective",
      };
      const res = step1BasicsSchema.safeParse(invalid);
      expect(res.success).toBe(false);
    });
  });

  describe("Step 2: Creative Schema", () => {
    it("accepts valid creative file metadata and CTA", () => {
      const valid = {
        storageKey: "assets/valid-uuid.png",
        originalName: "banner-1080p.png",
        mimeType: "image/png",
        sizeBytes: 1024 * 1024 * 2, // 2 MB
        title: "Summer Promo",
        ctaText: "Scan QR",
        destinationUrl: "https://acme.com/promo",
      };
      expect(step2CreativeSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects files exceeding 25 MB", () => {
      const oversized = {
        storageKey: "assets/huge.mp4",
        originalName: "huge.mp4",
        mimeType: "video/mp4",
        sizeBytes: 26 * 1024 * 1024, // 26 MB
      };
      const res = step2CreativeSchema.safeParse(oversized);
      expect(res.success).toBe(false);
    });

    it("rejects disallowed MIME types (e.g. SVG or PDF)", () => {
      const disallowedSvg = {
        storageKey: "assets/vector.svg",
        originalName: "vector.svg",
        mimeType: "image/svg+xml",
        sizeBytes: 5000,
      };
      expect(step2CreativeSchema.safeParse(disallowedSvg).success).toBe(false);
    });
  });

  describe("Step 3: Location Schema", () => {
    it("requires a non-empty zoneId", () => {
      expect(step3LocationSchema.safeParse({ zoneId: "zone-blr-mg-road" }).success).toBe(true);
      expect(step3LocationSchema.safeParse({ zoneId: "" }).success).toBe(false);
    });
  });

  describe("Step 4: Schedule Schema", () => {
    it("accepts valid future ISO dates where end is after start", () => {
      const valid = {
        startAt: "2026-11-01T18:00:00Z",
        endAt: "2026-11-01T20:00:00Z",
        flexibility: "FIXED",
      };
      expect(step4ScheduleSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects when end date is on or before start date", () => {
      const invalid = {
        startAt: "2026-11-01T20:00:00Z",
        endAt: "2026-11-01T18:00:00Z", // Inverted
        flexibility: "FIXED",
      };
      expect(step4ScheduleSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("Step 6: Review & Safety Schema", () => {
    it("strictly requires safety acknowledgement checkbox to be true", () => {
      expect(step6ReviewSchema.safeParse({ acknowledgedSafety: true }).success).toBe(true);
      expect(step6ReviewSchema.safeParse({ acknowledgedSafety: false }).success).toBe(false);
    });
  });
});
