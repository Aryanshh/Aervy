import { describe, it, expect } from "vitest";
import { can, AuthContextUser, CampaignResource } from "@/lib/permissions/can";

describe("Stage 1 RBAC and Permissions Engine", () => {
  const adminUser: AuthContextUser = {
    id: "user-admin",
    role: "ADMIN",
    organizationIds: [],
    isActive: true,
  };

  const opsUser: AuthContextUser = {
    id: "user-ops",
    role: "OPS_REVIEWER",
    organizationIds: [],
    isActive: true,
  };

  const advertiserOrgA: AuthContextUser = {
    id: "user-adv-a",
    role: "ADVERTISER",
    organizationIds: ["org-alpha"],
    isActive: true,
  };

  const advertiserOrgB: AuthContextUser = {
    id: "user-adv-b",
    role: "ADVERTISER",
    organizationIds: ["org-beta"],
    isActive: true,
  };

  const inactiveUser: AuthContextUser = {
    id: "user-inactive",
    role: "ADVERTISER",
    organizationIds: ["org-alpha"],
    isActive: false,
  };

  const campaignAlphaDraft: CampaignResource = {
    organizationId: "org-alpha",
    status: "DRAFT",
  };

  const campaignAlphaSubmitted: CampaignResource = {
    organizationId: "org-alpha",
    status: "SUBMITTED",
  };

  const campaignAlphaCompleted: CampaignResource = {
    organizationId: "org-alpha",
    status: "COMPLETED",
  };

  const campaignBetaDraft: CampaignResource = {
    organizationId: "org-beta",
    status: "DRAFT",
  };

  describe("Admin Role (Superuser)", () => {
    it("permits admin to perform all actions across any organization", () => {
      expect(can(adminUser, "campaign:read", campaignAlphaDraft)).toBe(true);
      expect(can(adminUser, "campaign:read", campaignBetaDraft)).toBe(true);
      expect(can(adminUser, "campaign:approve", campaignAlphaSubmitted)).toBe(true);
      expect(can(adminUser, "zone:manage")).toBe(true);
      expect(can(adminUser, "user:manage")).toBe(true);
      expect(can(adminUser, "audit:read")).toBe(true);
    });
  });

  describe("Ops Reviewer Role", () => {
    it("permits ops reviewer to inspect and decide on submitted campaigns", () => {
      expect(can(opsUser, "campaign:read", campaignAlphaSubmitted)).toBe(true);
      expect(can(opsUser, "campaign:review", campaignAlphaSubmitted)).toBe(true);
      expect(can(opsUser, "campaign:approve", campaignAlphaSubmitted)).toBe(true);
      expect(can(opsUser, "campaign:reject", campaignAlphaSubmitted)).toBe(true);
      expect(can(opsUser, "campaign:schedule", campaignAlphaSubmitted)).toBe(true);
      expect(can(opsUser, "audit:read")).toBe(true);
      expect(can(opsUser, "zone:read")).toBe(true);
    });

    it("DENIES ops reviewer from managing zones, pricing, or users", () => {
      expect(can(opsUser, "zone:manage")).toBe(false);
      expect(can(opsUser, "user:manage")).toBe(false);
    });

    it("DENIES ops reviewer from creating or paying for campaigns", () => {
      expect(can(opsUser, "campaign:create")).toBe(false);
      expect(can(opsUser, "campaign:pay", campaignAlphaDraft)).toBe(false);
    });
  });

  describe("Advertiser Role — Positive Access", () => {
    it("permits advertiser to create campaigns when assigned to an organization", () => {
      expect(can(advertiserOrgA, "campaign:create")).toBe(true);
    });

    it("permits advertiser to read, update, pay, and cancel own organization campaigns", () => {
      expect(can(advertiserOrgA, "campaign:read", campaignAlphaDraft)).toBe(true);
      expect(can(advertiserOrgA, "campaign:update", campaignAlphaDraft)).toBe(true);
      expect(can(advertiserOrgA, "campaign:pay", campaignAlphaDraft)).toBe(true);
      expect(can(advertiserOrgA, "campaign:delete", campaignAlphaDraft)).toBe(true);
      expect(can(advertiserOrgA, "campaign:cancel", campaignAlphaSubmitted)).toBe(true);
    });

    it("permits advertiser to read public zones", () => {
      expect(can(advertiserOrgA, "zone:read")).toBe(true);
    });
  });

  describe("Advertiser Role — Negative Security Cases", () => {
    it("CRITICAL: DENIES cross-organization campaign access (IDOR protection)", () => {
      // Advertiser A cannot read, update, delete, or pay for Org B's campaign
      expect(can(advertiserOrgA, "campaign:read", campaignBetaDraft)).toBe(false);
      expect(can(advertiserOrgA, "campaign:update", campaignBetaDraft)).toBe(false);
      expect(can(advertiserOrgA, "campaign:delete", campaignBetaDraft)).toBe(false);
      expect(can(advertiserOrgA, "campaign:pay", campaignBetaDraft)).toBe(false);
      expect(can(advertiserOrgA, "campaign:cancel", campaignBetaDraft)).toBe(false);
    });

    it("CRITICAL: DENIES advertiser from reviewing, approving, or scheduling campaigns", () => {
      expect(can(advertiserOrgA, "campaign:review", campaignAlphaSubmitted)).toBe(false);
      expect(can(advertiserOrgA, "campaign:approve", campaignAlphaSubmitted)).toBe(false);
      expect(can(advertiserOrgA, "campaign:reject", campaignAlphaSubmitted)).toBe(false);
      expect(can(advertiserOrgA, "campaign:schedule", campaignAlphaSubmitted)).toBe(false);
    });

    it("CRITICAL: DENIES advertiser from managing zones, users, or reading audit logs", () => {
      expect(can(advertiserOrgA, "zone:manage")).toBe(false);
      expect(can(advertiserOrgA, "user:manage")).toBe(false);
      expect(can(advertiserOrgA, "audit:read")).toBe(false);
    });

    it("DENIES advertiser from editing a campaign that is not in DRAFT or CHANGES_REQUESTED", () => {
      expect(can(advertiserOrgA, "campaign:update", campaignAlphaSubmitted)).toBe(false);
      expect(can(advertiserOrgA, "campaign:update", campaignAlphaCompleted)).toBe(false);
    });

    it("DENIES advertiser from deleting a non-draft campaign", () => {
      expect(can(advertiserOrgA, "campaign:delete", campaignAlphaSubmitted)).toBe(false);
    });
  });

  describe("Deactivated / Inactive User", () => {
    it("strictly denies all actions for deactivated accounts", () => {
      expect(can(inactiveUser, "campaign:read", campaignAlphaDraft)).toBe(false);
      expect(can(inactiveUser, "campaign:create")).toBe(false);
      expect(can(inactiveUser, "zone:read")).toBe(false);
      expect(can(inactiveUser, "campaign:pay", campaignAlphaDraft)).toBe(false);
    });

    it("strictly denies operations for null or undefined user", () => {
      expect(can(null, "campaign:create")).toBe(false);
      expect(can(undefined, "zone:read")).toBe(false);
    });
  });
});
