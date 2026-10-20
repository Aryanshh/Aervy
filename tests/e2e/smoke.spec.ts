import { test, expect } from "@playwright/test";

test.describe("Stage 8 E2E Smoke & Public Navigation Tests", () => {
  test("homepage loads with verified brand heading, safety charter, and navigation", async ({
    page,
  }) => {
    await page.goto("/");

    // 1. Verify primary brand heading
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Dynamic Aerial Advertising"
    );

    // 2. Verify mandatory safety boundary banner
    await expect(
      page.getByText(/Submitting a campaign on Aervy represents an operational request/i)
    ).toBeVisible();

    // 3. Verify public navigation links
    await expect(page.getByRole("link", { name: "How It Works" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Safety & Regulations" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Track Campaigns" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ops Queue" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign In" })).toBeVisible();
  });

  test("How It Works page renders 5-phase operational workflow and billboard comparison", async ({
    page,
  }) => {
    await page.goto("/how-it-works");

    await expect(
      page.getByRole("heading", { name: /From Digital Ingestion to Certified Flight Execution/i })
    ).toBeVisible();

    // Verify comparison table
    await expect(page.getByText("Aervy Digital Aerial Platform vs Traditional Static Billboards")).toBeVisible();
    await expect(page.getByText("100% automated refund on weather/airspace cancellation")).toBeVisible();
  });

  test("Safety & Regulations page enforces DGCA Green Zones and non-flight boundary pledge", async ({
    page,
  }) => {
    await page.goto("/safety");

    await expect(
      page.getByRole("heading", { name: /Airspace Safety, Compliance & Regulatory Standards/i })
    ).toBeVisible();

    // Verify non-flight guarantee
    await expect(
      page.getByText(/The Non-Flight Web Boundary Guarantee/i)
    ).toBeVisible();

    // Verify weather envelope thresholds
    await expect(
      page.getByText(/Sustained ground wind velocity strictly under 14 knots/i)
    ).toBeVisible();
  });

  test("Demo Sign In page displays instant persona switchers for Advertiser, Ops, and Admin", async ({
    page,
  }) => {
    await page.goto("/auth/sign-in");

    await expect(
      page.getByRole("heading", { name: /Sign in to your account/i })
    ).toBeVisible();

    await expect(page.getByText("Instant Demo Role Switcher")).toBeVisible();
    await expect(page.getByText("Advertiser (Acme Brands India)")).toBeVisible();
    await expect(page.getByText("Operations Review Lead")).toBeVisible();
    await expect(page.getByText("Platform Administrator")).toBeVisible();
  });
});
