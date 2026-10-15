import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("Stage 0 Smoke Test Suite", () => {
  it("validates that vitest test runner executes properly", () => {
    expect(true).toBe(true);
  });

  it("validates cn utility combines tailwind classes correctly", () => {
    const combined = cn("p-4", "text-center", false && "hidden", "text-blue-500");
    expect(combined).toBe("p-4 text-center text-blue-500");
  });

  it("validates paise integer math sanity (no floating point)", () => {
    const basePaise = 100000; // 1,000 INR
    const gstBps = 1800; // 18%
    const gstPaise = Math.round((basePaise * gstBps) / 10000);
    const totalPaise = basePaise + gstPaise;

    expect(Number.isInteger(gstPaise)).toBe(true);
    expect(Number.isInteger(totalPaise)).toBe(true);
    expect(gstPaise).toBe(18000);
    expect(totalPaise).toBe(118000);
  });
});
