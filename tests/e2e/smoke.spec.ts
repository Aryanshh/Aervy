import { test, expect } from "@playwright/test";

test.describe("Stage 0 E2E Smoke Tests", () => {
  test("homepage loads and displays Aervy branding and safety boundary banner", async ({
    page,
  }) => {
    await page.goto("/");

    // Verify main brand heading exists
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Dynamic Aerial Advertising"
    );

    // Verify safety disclaimer is visible on the page
    await expect(
      page.getByText("Submitting a campaign on Aervy is a request for review")
    ).toBeVisible();

    // Verify navigation links exist
    await expect(page.getByRole("link", { name: "Advertiser Portal" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Operations Review" })).toBeVisible();
  });
});
