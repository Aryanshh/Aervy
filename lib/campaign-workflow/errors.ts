export class WorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkflowError";
  }
}

export class InvalidTransitionError extends WorkflowError {
  constructor(fromStatus: string, toStatus: string) {
    super(`Illegal campaign transition from ${fromStatus} to ${toStatus}`);
    this.name = "InvalidTransitionError";
  }
}

export class ConcurrencyConflictError extends WorkflowError {
  constructor(expectedVersion: number, actualVersion: number) {
    super(
      `Campaign was modified by another operation (expected version ${expectedVersion}, found ${actualVersion})`
    );
    this.name = "ConcurrencyConflictError";
  }
}

export class UnauthorizedTransitionError extends WorkflowError {
  constructor(action: string, role?: string) {
    super(`Actor with role ${role ?? "UNKNOWN"} is not authorized to execute ${action}`);
    this.name = "UnauthorizedTransitionError";
  }
}

export class CampaignNotFoundError extends WorkflowError {
  constructor(campaignId: string) {
    super(`Campaign not found: ${campaignId}`);
    this.name = "CampaignNotFoundError";
  }
}

export class MissingReasonError extends WorkflowError {
  constructor(toStatus: string) {
    super(`A non-empty reason is required when transitioning to ${toStatus}`);
    this.name = "MissingReasonError";
  }
}
