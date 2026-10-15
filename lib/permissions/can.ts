export type Role = "ADVERTISER" | "OPS_REVIEWER" | "ADMIN";

export type PermissionAction =
  | "campaign:create"
  | "campaign:read"
  | "campaign:update"
  | "campaign:delete"
  | "campaign:pay"
  | "campaign:submit"
  | "campaign:cancel"
  | "campaign:review"
  | "campaign:approve"
  | "campaign:reject"
  | "campaign:schedule"
  | "zone:read"
  | "zone:manage"
  | "user:manage"
  | "audit:read";

export interface AuthContextUser {
  id: string;
  role: Role;
  organizationIds: string[];
  isActive: boolean;
}

export interface CampaignResource {
  organizationId: string;
  status?: string;
}

export interface ZoneResource {
  id?: string;
}

export type Resource = CampaignResource | ZoneResource | Record<string, unknown>;

function isCampaignResource(resource: unknown): resource is CampaignResource {
  return (
    typeof resource === "object" &&
    resource !== null &&
    "organizationId" in resource &&
    typeof (resource as { organizationId: unknown }).organizationId === "string"
  );
}

/**
 * Server-side authorization gate for RBAC and Organization boundary enforcement.
 * Pure function: no database calls, fully deterministic and unit-testable.
 */
export function can(
  user: AuthContextUser | null | undefined,
  action: PermissionAction,
  resource?: Resource
): boolean {
  // Unauthenticated or deactivated users are denied all operations
  if (!user || !user.isActive) {
    return false;
  }

  // ADMIN has full administrative capabilities across all resources
  if (user.role === "ADMIN") {
    return true;
  }

  // Public/shared read actions
  if (action === "zone:read") {
    return true;
  }

  // OPS_REVIEWER permissions
  if (user.role === "OPS_REVIEWER") {
    switch (action) {
      case "campaign:read":
      case "campaign:review":
      case "campaign:approve":
      case "campaign:reject":
      case "campaign:schedule":
      case "audit:read":
        return true;
      case "zone:manage":
      case "user:manage":
      case "campaign:create":
      case "campaign:update":
      case "campaign:delete":
      case "campaign:pay":
      case "campaign:submit":
      case "campaign:cancel":
        return false;
      default:
        return false;
    }
  }

  // ADVERTISER permissions
  if (user.role === "ADVERTISER") {
    // Operations actions strictly forbidden to advertisers
    if (
      action === "campaign:review" ||
      action === "campaign:approve" ||
      action === "campaign:reject" ||
      action === "campaign:schedule" ||
      action === "zone:manage" ||
      action === "user:manage" ||
      action === "audit:read"
    ) {
      return false;
    }

    if (action === "campaign:create") {
      // Must be a member of at least one organization
      return user.organizationIds.length > 0;
    }

    // Organization ownership checks for campaign actions
    if (
      action === "campaign:read" ||
      action === "campaign:update" ||
      action === "campaign:delete" ||
      action === "campaign:pay" ||
      action === "campaign:submit" ||
      action === "campaign:cancel"
    ) {
      if (!resource || !isCampaignResource(resource)) {
        return false;
      }

      // Check organization membership
      const belongsToOrg = user.organizationIds.includes(resource.organizationId);
      if (!belongsToOrg) {
        return false; // Cross-organization isolation
      }

      // State-specific advertiser restrictions
      if (action === "campaign:update") {
        // Advertisers can only edit DRAFT or CHANGES_REQUESTED campaigns
        const allowedStatuses = ["DRAFT", "CHANGES_REQUESTED"];
        return !resource.status || allowedStatuses.includes(resource.status);
      }

      if (action === "campaign:delete") {
        // Advertisers can only delete DRAFT campaigns
        return resource.status === "DRAFT";
      }

      if (action === "campaign:pay" || action === "campaign:submit") {
        return resource.status === "DRAFT" || resource.status === "PENDING_PAYMENT";
      }

      if (action === "campaign:cancel") {
        // Cannot cancel completed, rejected, or already cancelled campaigns
        const nonCancellable = ["COMPLETED", "REJECTED", "CANCELLED", "FAILED"];
        return !resource.status || !nonCancellable.includes(resource.status);
      }

      return true;
    }
  }

  return false;
}
