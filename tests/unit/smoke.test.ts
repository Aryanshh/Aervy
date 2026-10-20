import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";
import {
  ALL_CAMPAIGN_STATUSES,
  ALLOWED_TRANSITIONS,
  isTransitionAllowed,
} from "@/lib/campaign-workflow/transitions";
import { CampaignStatus } from "@prisma/client";

describe("Stage 8 Comprehensive System Smoke & Boundary Tests", () => {
  it("validates that vitest test runner executes properly", () => {
    expect(true).toBe(true);
  });

  it("validates cn utility combines tailwind classes correctly", () => {
    const combined = cn("p-4", "text-center", false && "hidden", "text-blue-500");
    expect(combined).toBe("p-4 text-center text-blue-500");
  });

  it("validates paise integer math sanity (no floating point)", () => {
    const basePaise = 100000; // ₹1,000 INR
    const gstBps = 1800; // 18%
    const gstPaise = Math.round((basePaise * gstBps) / 10000);
    const totalPaise = basePaise + gstPaise;

    expect(Number.isInteger(gstPaise)).toBe(true);
    expect(Number.isInteger(totalPaise)).toBe(true);
    expect(gstPaise).toBe(18000);
    expect(totalPaise).toBe(118000);
  });

  it("validates all 14 campaign statuses exist in workflow definition", () => {
    expect(ALL_CAMPAIGN_STATUSES).toHaveLength(14);
    expect(ALL_CAMPAIGN_STATUSES).toContain(CampaignStatus.DRAFT);
    expect(ALL_CAMPAIGN_STATUSES).toContain(CampaignStatus.SUBMITTED);
    expect(ALL_CAMPAIGN_STATUSES).toContain(CampaignStatus.UNDER_REVIEW);
    expect(ALL_CAMPAIGN_STATUSES).toContain(CampaignStatus.COMPLETED);
    expect(ALL_CAMPAIGN_STATUSES).toContain(CampaignStatus.REJECTED);
  });

  it("enforces state machine terminal state invariants", () => {
    // COMPLETED, REJECTED, CANCELLED, FAILED must have 0 outgoing transitions
    expect(ALLOWED_TRANSITIONS[CampaignStatus.COMPLETED]).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS[CampaignStatus.REJECTED]).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS[CampaignStatus.CANCELLED]).toHaveLength(0);
    expect(ALLOWED_TRANSITIONS[CampaignStatus.FAILED]).toHaveLength(0);

    // Direct jump from DRAFT to COMPLETED is strictly forbidden
    expect(isTransitionAllowed(CampaignStatus.DRAFT, CampaignStatus.COMPLETED)).toBe(false);
  });

  it("verifies safety boundary: SUBMITTED campaigns require operations review before scheduling", () => {
    // Cannot skip review directly to SCHEDULED
    expect(isTransitionAllowed(CampaignStatus.SUBMITTED, CampaignStatus.SCHEDULED)).toBe(false);
    expect(isTransitionAllowed(CampaignStatus.SUBMITTED, CampaignStatus.IN_PROGRESS)).toBe(false);

    // Must go through UNDER_REVIEW
    expect(isTransitionAllowed(CampaignStatus.SUBMITTED, CampaignStatus.UNDER_REVIEW)).toBe(true);
  });
});
