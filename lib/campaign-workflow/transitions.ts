import { CampaignStatus } from "@prisma/client";
import { PermissionAction } from "@/lib/permissions/can";

export const ALL_CAMPAIGN_STATUSES: readonly CampaignStatus[] = [
  CampaignStatus.DRAFT,
  CampaignStatus.PENDING_PAYMENT,
  CampaignStatus.SUBMITTED,
  CampaignStatus.UNDER_REVIEW,
  CampaignStatus.CHANGES_REQUESTED,
  CampaignStatus.REJECTED,
  CampaignStatus.APPROVED_FOR_SCHEDULING,
  CampaignStatus.SCHEDULED,
  CampaignStatus.READY_FOR_OPERATIONS,
  CampaignStatus.IN_PROGRESS,
  CampaignStatus.COMPLETED,
  CampaignStatus.CANCELLED,
  CampaignStatus.ON_HOLD,
  CampaignStatus.FAILED,
] as const;

/**
 * Strict, deterministic state machine transition matrix.
 * No status transition may take place unless explicitly permitted here.
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<CampaignStatus, readonly CampaignStatus[]>> = {
  [CampaignStatus.DRAFT]: [CampaignStatus.PENDING_PAYMENT, CampaignStatus.CANCELLED],
  [CampaignStatus.PENDING_PAYMENT]: [
    CampaignStatus.SUBMITTED,
    CampaignStatus.DRAFT,
    CampaignStatus.CANCELLED,
  ],
  [CampaignStatus.SUBMITTED]: [
    CampaignStatus.UNDER_REVIEW,
    CampaignStatus.ON_HOLD,
    CampaignStatus.CANCELLED,
  ],
  [CampaignStatus.UNDER_REVIEW]: [
    CampaignStatus.CHANGES_REQUESTED,
    CampaignStatus.REJECTED,
    CampaignStatus.APPROVED_FOR_SCHEDULING,
    CampaignStatus.ON_HOLD,
    CampaignStatus.CANCELLED,
  ],
  [CampaignStatus.CHANGES_REQUESTED]: [CampaignStatus.SUBMITTED, CampaignStatus.CANCELLED],
  [CampaignStatus.APPROVED_FOR_SCHEDULING]: [
    CampaignStatus.SCHEDULED,
    CampaignStatus.ON_HOLD,
    CampaignStatus.CANCELLED,
  ],
  [CampaignStatus.SCHEDULED]: [
    CampaignStatus.READY_FOR_OPERATIONS,
    CampaignStatus.ON_HOLD,
    CampaignStatus.CANCELLED,
  ],
  [CampaignStatus.READY_FOR_OPERATIONS]: [
    CampaignStatus.IN_PROGRESS,
    CampaignStatus.ON_HOLD,
    CampaignStatus.CANCELLED,
  ],
  [CampaignStatus.IN_PROGRESS]: [
    CampaignStatus.COMPLETED,
    CampaignStatus.FAILED,
    CampaignStatus.ON_HOLD,
  ],
  [CampaignStatus.ON_HOLD]: [
    CampaignStatus.UNDER_REVIEW,
    CampaignStatus.APPROVED_FOR_SCHEDULING,
    CampaignStatus.SCHEDULED,
    CampaignStatus.READY_FOR_OPERATIONS,
    CampaignStatus.CANCELLED,
  ],
  // Terminal states (strictly immutable, 0 transitions)
  [CampaignStatus.COMPLETED]: [],
  [CampaignStatus.REJECTED]: [],
  [CampaignStatus.CANCELLED]: [],
  [CampaignStatus.FAILED]: [],
};

/**
 * Checks whether a proposed transition from one status to another is permitted by the state machine.
 */
export function isTransitionAllowed(fromStatus: CampaignStatus, toStatus: CampaignStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[fromStatus];
  return allowed ? allowed.includes(toStatus) : false;
}

/**
 * Returns all valid next statuses from a given status.
 */
export function getAllowedNextStatuses(fromStatus: CampaignStatus): readonly CampaignStatus[] {
  return ALLOWED_TRANSITIONS[fromStatus] ?? [];
}

/**
 * Returns true if the target status mandates an explicit, non-empty reason.
 */
export function requiresReason(toStatus: CampaignStatus): boolean {
  return (
    toStatus === CampaignStatus.REJECTED ||
    toStatus === CampaignStatus.CHANGES_REQUESTED ||
    toStatus === CampaignStatus.ON_HOLD ||
    toStatus === CampaignStatus.FAILED
  );
}

/**
 * Maps a target status transition to the required RBAC permission action.
 */
export function getRequiredPermissionAction(
  fromStatus: CampaignStatus,
  toStatus: CampaignStatus
): PermissionAction {
  if (toStatus === CampaignStatus.CANCELLED) {
    return "campaign:cancel";
  }
  if (toStatus === CampaignStatus.PENDING_PAYMENT) {
    return "campaign:pay";
  }
  if (toStatus === CampaignStatus.SUBMITTED) {
    return "campaign:submit";
  }
  if (toStatus === CampaignStatus.DRAFT) {
    return "campaign:update";
  }
  if (toStatus === CampaignStatus.UNDER_REVIEW) {
    return "campaign:review";
  }
  if (toStatus === CampaignStatus.CHANGES_REQUESTED) {
    return "campaign:review";
  }
  if (toStatus === CampaignStatus.REJECTED) {
    return "campaign:reject";
  }
  if (toStatus === CampaignStatus.APPROVED_FOR_SCHEDULING) {
    return "campaign:approve";
  }
  if (
    toStatus === CampaignStatus.SCHEDULED ||
    toStatus === CampaignStatus.READY_FOR_OPERATIONS ||
    toStatus === CampaignStatus.IN_PROGRESS ||
    toStatus === CampaignStatus.COMPLETED ||
    toStatus === CampaignStatus.FAILED
  ) {
    return "campaign:schedule";
  }
  if (toStatus === CampaignStatus.ON_HOLD) {
    return "campaign:review";
  }

  return "campaign:update";
}
