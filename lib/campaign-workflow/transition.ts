import { CampaignStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { can, AuthContextUser } from "@/lib/permissions/can";
import {
  isTransitionAllowed,
  requiresReason,
  getRequiredPermissionAction,
} from "./transitions";
import {
  CampaignNotFoundError,
  ConcurrencyConflictError,
  InvalidTransitionError,
  MissingReasonError,
  UnauthorizedTransitionError,
} from "./errors";
import { processCampaignRefund } from "@/lib/payments/refund";

export interface TransitionActor {
  type: "USER" | "SYSTEM" | "WEBHOOK";
  userId?: string;
  role?: "ADVERTISER" | "OPS_REVIEWER" | "ADMIN";
  organizationIds?: string[];
  isActive?: boolean;
}

export interface TransitionParams {
  campaignId: string;
  toStatus: CampaignStatus;
  actor: TransitionActor;
  reason?: string;
  expectedVersion?: number;
  metadata?: Record<string, unknown>;
}

export interface TransitionResult {
  success: boolean;
  campaignId: string;
  fromStatus: CampaignStatus;
  toStatus: CampaignStatus;
  version: number;
}

type PrismaTransactionClient = Prisma.TransactionClient;

/**
 * Executes a verified, atomic state transition for a campaign.
 * All operations (state change, optimistic lock increment, StatusEvent, AuditLog, Notification)
 * execute within a single transaction.
 */
export async function transition(
  params: TransitionParams,
  externalTx?: PrismaTransactionClient
): Promise<TransitionResult> {
  const executeInTransaction = async (tx: PrismaTransactionClient): Promise<TransitionResult> => {
    // 1. Fetch current campaign state
    const campaign = await tx.campaign.findUnique({
      where: { id: params.campaignId },
    });

    if (!campaign) {
      throw new CampaignNotFoundError(params.campaignId);
    }

    const fromStatus = campaign.status;
    const toStatus = params.toStatus;

    // 2. Optimistic locking verification
    if (params.expectedVersion !== undefined && campaign.version !== params.expectedVersion) {
      throw new ConcurrencyConflictError(params.expectedVersion, campaign.version);
    }

    // 3. State machine matrix check
    if (!isTransitionAllowed(fromStatus, toStatus)) {
      throw new InvalidTransitionError(fromStatus, toStatus);
    }

    // 4. Mandatory reason check
    if (requiresReason(toStatus)) {
      if (!params.reason || params.reason.trim().length === 0) {
        throw new MissingReasonError(toStatus);
      }
    }

    // 5. Actor authorization check
    if (params.actor.type === "USER") {
      const authUser: AuthContextUser = {
        id: params.actor.userId ?? "",
        role: params.actor.role ?? "ADVERTISER",
        organizationIds: params.actor.organizationIds ?? [],
        isActive: params.actor.isActive ?? true,
      };

      const requiredAction = getRequiredPermissionAction(fromStatus, toStatus);
      const isAuthorized = can(authUser, requiredAction, {
        organizationId: campaign.organizationId,
        status: fromStatus,
      });

      if (!isAuthorized) {
        throw new UnauthorizedTransitionError(requiredAction, params.actor.role);
      }
    }

    // 6. Mutate campaign status and increment version atomically
    const updatedCampaign = await tx.campaign.update({
      where: { id: campaign.id },
      data: {
        status: toStatus,
        version: { increment: 1 },
      },
    });

    // 7. Insert StatusEvent record
    await tx.statusEvent.create({
      data: {
        campaignId: campaign.id,
        fromStatus,
        toStatus,
        actorId: params.actor.userId ?? null,
        actorType: params.actor.type,
        reason: params.reason ? params.reason.trim() : null,
      },
    });

    // 8. Insert AuditLog entry
    await tx.auditLog.create({
      data: {
        actorId: params.actor.userId ?? null,
        action: "CAMPAIGN_STATUS_TRANSITION",
        entityType: "CAMPAIGN",
        entityId: campaign.id,
        metadata: {
          fromStatus,
          toStatus,
          reason: params.reason,
          actorType: params.actor.type,
          ...params.metadata,
        },
      },
    });

    // 9. Dispatch in-app notification to campaign owner (if actor is not the owner)
    if (campaign.createdById && campaign.createdById !== params.actor.userId) {
      await tx.notification.create({
        data: {
          userId: campaign.createdById,
          title: `Campaign Status: ${toStatus.replace(/_/g, " ")}`,
          body: params.reason
            ? `Status changed from ${fromStatus} to ${toStatus}. Reason: ${params.reason.trim()}`
            : `Your campaign "${campaign.name}" is now ${toStatus.replace(/_/g, " ")}.`,
        },
      });
    }

    return {
      success: true,
      campaignId: updatedCampaign.id,
      fromStatus,
      toStatus: updatedCampaign.status,
      version: updatedCampaign.version,
    };
  };

  let result: TransitionResult;
  if (externalTx) {
    result = await executeInTransaction(externalTx);
  } else {
    result = await db.$transaction(executeInTransaction);
  }

  // If campaign transitioned to REJECTED, automatically initiate refund for any paid payments
  if (params.toStatus === CampaignStatus.REJECTED && !externalTx) {
    try {
      await processCampaignRefund({
        campaignId: params.campaignId,
        reason: params.reason ?? "Campaign rejected by operations reviewer",
        actorId: params.actor.userId,
      });
    } catch (refundErr) {
      console.error(
        `Automated refund processing failed for campaign ${params.campaignId}:`,
        refundErr
      );
    }
  }

  return result;
}
