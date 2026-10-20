import { test, expect } from "@playwright/test";

test.describe("Stage 8 E2E Portal & Workflow Verification", () => {
  test("Advertiser Campaigns page displays filter pills, search input, and safety disclaimer", async ({
    page,
  }) => {
    await page.goto("/app/campaigns");

    // Header & Safety banner
    await expect(page.getByText("Advertiser Campaign Tracking")).toBeVisible();
    await expect(page.getByText("Operations Safety Boundary:")).toBeVisible();

    // Category pills
    await expect(page.getByRole("button", { name: /All Campaigns/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Drafts/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /In Review/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Scheduled & Active/i })).toBeVisible();

    // Search bar
    await expect(page.getByPlaceholder("Search campaigns...")).toBeVisible();
  });

  test("Advertiser New Campaign wizard displays stepper and safety verification", async ({
    page,
  }) => {
    await page.goto("/app/campaigns/new");

    // Stepper navigation
    await expect(page.getByText(/Campaign Setup/i)).toBeVisible();
    await expect(page.getByText(/Flight Zone/i)).toBeVisible();
    await expect(page.getByText(/Date & Time/i)).toBeVisible();

    // Safety notice
    await expect(
      page.getByText(/Submitting a campaign is an operational request/i)
    ).toBeVisible();
  });

  test("Operations Review Queue page loads status tabs and counter badges", async ({
    page,
  }) => {
    await page.goto("/ops/campaigns");

    // Ops queue title
    await expect(page.getByText("Operations Review Queue")).toBeVisible();

    // Review status tabs
    await expect(page.getByRole("button", { name: /All Submissions/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Pending Review/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Under Review/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Approved/i })).toBeVisible();
  });

  test("Operations Zones page loads list of approved metropolitan corridors", async ({
    page,
  }) => {
    await page.goto("/ops/zones");

    await expect(page.getByText("Approved Flight Zones")).toBeVisible();
    await expect(page.getByText("Bangalore MG Road Corridor")).toBeVisible();
    await expect(page.getByText("Mumbai BKC Financial Hub")).toBeVisible();
  });

  test("Operations Dashboard loads metric cards and queue preview", async ({
    page,
  }) => {
    await page.goto("/ops/dashboard");

    await expect(page.getByText("Operations Command Center")).toBeVisible();
    await expect(page.getByText("Pending Safety Review")).toBeVisible();
    await expect(page.getByText("Active in Flight")).toBeVisible();
  });
});
