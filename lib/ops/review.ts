import { CampaignStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { AuthContextUser, can, PermissionAction } from "@/lib/permissions/can";
import { transition } from "@/lib/campaign-workflow/transition";

export interface ReviewQueueFilters {
  status?: CampaignStatus;
  zoneId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export type ReviewDecisionType =
  | "PICK_UP"
  | "APPROVE"
  | "REQUEST_CHANGES"
  | "REJECT"
  | "PUT_ON_HOLD"
  | "RESUME";

export interface SubmitReviewDecisionParams {
  campaignId: string;
  reviewer: AuthContextUser;
  decision: ReviewDecisionType;
  reason: string;
  constraints?: string;
}

export interface OperationalMilestoneParams {
  campaignId: string;
  opsUser: AuthContextUser;
  toStatus: CampaignStatus;
  note?: string;
}

type PrismaTransactionClient = Prisma.TransactionClient;

/**
 * Retrieves the Operations review queue with filtering, search, and status counters.
 */
export async function getOpsReviewQueue(
  filters: ReviewQueueFilters = {},
  client: PrismaTransactionClient | typeof db = db
) {
  const where: Prisma.CampaignWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.zoneId) {
    where.zoneId = filters.zoneId;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { brand: { contains: filters.search } },
      { organization: { name: { contains: filters.search } } },
    ];
  }

  const [campaigns, totalCount, statusCounts] = await Promise.all([
    client.campaign.findMany({
      where,
      include: {
        organization: true,
        zone: true,
        assets: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        decisions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: filters.limit ?? 50,
      skip: filters.offset ?? 0,
    }),
    client.campaign.count({ where }),
    Promise.all([
      client.campaign.count({ where: { status: CampaignStatus.SUBMITTED } }),
      client.campaign.count({ where: { status: CampaignStatus.UNDER_REVIEW } }),
      client.campaign.count({ where: { status: CampaignStatus.CHANGES_REQUESTED } }),
      client.campaign.count({ where: { status: CampaignStatus.APPROVED_FOR_SCHEDULING } }),
      client.campaign.count({ where: { status: CampaignStatus.SCHEDULED } }),
      client.campaign.count({
        where: {
          status: {
            in: [CampaignStatus.READY_FOR_OPERATIONS, CampaignStatus.IN_PROGRESS],
          },
        },
      }),
      client.campaign.count({ where: { status: CampaignStatus.COMPLETED } }),
      client.campaign.count({
        where: {
          status: {
            in: [CampaignStatus.REJECTED, CampaignStatus.CANCELLED, CampaignStatus.FAILED],
          },
        },
      }),
    ]),
  ]);

  return {
    campaigns,
    totalCount,
    counts: {
      submitted: statusCounts[0],
      underReview: statusCounts[1],
      changesRequested: statusCounts[2],
      approved: statusCounts[3],
      scheduled: statusCounts[4],
      activeFlight: statusCounts[5],
      completed: statusCounts[6],
      archived: statusCounts[7],
    },
  };
}

/**
 * Retrieves comprehensive campaign details for review inspection.
 */
export async function getOpsCampaignDetail(
  campaignId: string,
  client: PrismaTransactionClient | typeof db = db
) {
  const campaign = await client.campaign.findUnique({
    where: { id: campaignId },
    include: {
      organization: true,
      createdBy: true,
      zone: true,
      assets: true,
      quotes: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      payments: {
        include: { refunds: true },
        orderBy: { createdAt: "desc" },
      },
      statusEvents: {
        orderBy: { createdAt: "desc" },
      },
      decisions: {
        include: { reviewer: true },
        orderBy: { createdAt: "desc" },
      },
      slotHolds: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!campaign) {
    throw new Error(`Campaign '${campaignId}' not found`);
  }

  return campaign;
}

/**
 * Submits an authoritative review decision (Pick up, Request changes, Approve, Reject, Hold).
 */
export async function submitReviewDecision(
  params: SubmitReviewDecisionParams,
  client: PrismaTransactionClient | typeof db = db
) {
  const { campaignId, reviewer, decision, reason, constraints } = params;

  // 1. Fetch current campaign
  const campaign = await client.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error(`Campaign '${campaignId}' not found`);
  }

  // 2. Map decision to state machine transition and permission action
  let nextStatus: CampaignStatus;
  let requiredAction: PermissionAction;

  switch (decision) {
    case "PICK_UP":
      nextStatus = CampaignStatus.UNDER_REVIEW;
      requiredAction = "campaign:review";
      break;
    case "REQUEST_CHANGES":
      nextStatus = CampaignStatus.CHANGES_REQUESTED;
      requiredAction = "campaign:review";
      break;
    case "APPROVE":
      nextStatus = CampaignStatus.APPROVED_FOR_SCHEDULING;
      requiredAction = "campaign:approve";
      break;
    case "REJECT":
      nextStatus = CampaignStatus.REJECTED;
      requiredAction = "campaign:reject";
      break;
    case "PUT_ON_HOLD":
      nextStatus = CampaignStatus.ON_HOLD;
      requiredAction = "campaign:review";
      break;
    case "RESUME":
      nextStatus = CampaignStatus.UNDER_REVIEW;
      requiredAction = "campaign:review";
      break;
    default:
      throw new Error(`Invalid review decision '${decision}'`);
  }

  // 3. Authorize reviewer role
  const isAuthorized = can(reviewer, requiredAction, {
    organizationId: campaign.organizationId,
    status: campaign.status,
  });

  if (!isAuthorized) {
    throw new Error(
      `User ${reviewer.id} with role '${reviewer.role}' is not authorized to perform '${requiredAction}'`
    );
  }

  // 4. Execute atomic decision recording and status transition
  const execute = async (tx: PrismaTransactionClient) => {
    // Record ReviewDecision
    const decisionRecord = await tx.reviewDecision.create({
      data: {
        campaignId,
        reviewerId: reviewer.id,
        decision,
        reason: reason.trim(),
        constraints: constraints ? constraints.trim() : null,
      },
    });

    // Execute state transition
    const transitionResult = await transition(
      {
        campaignId,
        toStatus: nextStatus,
        actor: {
          type: "USER",
          userId: reviewer.id,
          role: reviewer.role,
          organizationIds: reviewer.organizationIds,
        },
        reason: reason.trim(),
        metadata: {
          decision,
          decisionId: decisionRecord.id,
          constraints,
        },
      },
      tx
    );

    return {
      decisionRecord,
      transitionResult,
    };
  };

  if ("$transaction" in client) {
    return (client as typeof db).$transaction(execute);
  }

  return execute(client as PrismaTransactionClient);
}

/**
 * Advances an approved campaign through operational deployment milestones
 * (SCHEDULED -> READY_FOR_OPERATIONS -> IN_PROGRESS -> COMPLETED).
 */
export async function advanceOperationalMilestone(
  params: OperationalMilestoneParams,
  client: PrismaTransactionClient | typeof db = db
) {
  const { campaignId, opsUser, toStatus, note } = params;

  // 1. Fetch current campaign
  const campaign = await client.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error(`Campaign '${campaignId}' not found`);
  }

  // 2. Authorize scheduling & operations control
  const isAuthorized = can(opsUser, "campaign:schedule", {
    organizationId: campaign.organizationId,
    status: campaign.status,
  });

  if (!isAuthorized) {
    throw new Error(
      `User ${opsUser.id} with role '${opsUser.role}' is not authorized to update operational schedule`
    );
  }

  // 3. Execute state transition
  const defaultNote = `Deployment status updated to ${toStatus.replace(/_/g, " ")}`;
  return transition(
    {
      campaignId,
      toStatus,
      actor: {
        type: "USER",
        userId: opsUser.id,
        role: opsUser.role,
        organizationIds: opsUser.organizationIds,
      },
      reason: note ? note.trim() : defaultNote,
      metadata: {
        operationalMilestone: toStatus,
      },
    },
    "$transaction" in client ? undefined : (client as PrismaTransactionClient)
  );
}
