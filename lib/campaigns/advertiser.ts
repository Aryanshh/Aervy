import { CampaignStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { AuthContextUser, can } from "@/lib/permissions/can";
import { transition } from "@/lib/campaign-workflow/transition";

export type StatusCategory = "all" | "draft" | "review" | "active" | "completed" | "issues";

export interface AdvertiserCampaignFilters {
  organizationId?: string;
  status?: CampaignStatus;
  statusCategory?: StatusCategory;
  search?: string;
  limit?: number;
  offset?: number;
}

type PrismaTransactionClient = Prisma.TransactionClient;

/**
 * Maps status categories to lists of campaign statuses.
 */
export const CATEGORY_STATUS_MAP: Record<Exclude<StatusCategory, "all">, CampaignStatus[]> = {
  draft: [CampaignStatus.DRAFT, CampaignStatus.PENDING_PAYMENT],
  review: [CampaignStatus.SUBMITTED, CampaignStatus.UNDER_REVIEW, CampaignStatus.CHANGES_REQUESTED],
  active: [
    CampaignStatus.APPROVED_FOR_SCHEDULING,
    CampaignStatus.SCHEDULED,
    CampaignStatus.READY_FOR_OPERATIONS,
    CampaignStatus.IN_PROGRESS,
  ],
  completed: [CampaignStatus.COMPLETED],
  issues: [
    CampaignStatus.REJECTED,
    CampaignStatus.CANCELLED,
    CampaignStatus.ON_HOLD,
    CampaignStatus.FAILED,
  ],
};

/**
 * Retrieves the campaigns list for an advertiser, isolated by organization.
 */
export async function getAdvertiserCampaigns(
  filters: AdvertiserCampaignFilters,
  user: AuthContextUser,
  client: PrismaTransactionClient | typeof db = db
) {
  const where: Prisma.CampaignWhereInput = {};

  // Organization isolation:
  if (user.role === "ADVERTISER") {
    if (filters.organizationId) {
      if (!user.organizationIds.includes(filters.organizationId)) {
        throw new Error(
          `Unauthorized: User is not a member of organization '${filters.organizationId}'`
        );
      }
      where.organizationId = filters.organizationId;
    } else {
      where.organizationId = { in: user.organizationIds };
    }
  } else if (filters.organizationId) {
    where.organizationId = filters.organizationId;
  }

  // Status or Category filter:
  if (filters.status) {
    where.status = filters.status;
  } else if (filters.statusCategory && filters.statusCategory !== "all") {
    where.status = { in: CATEGORY_STATUS_MAP[filters.statusCategory] };
  }

  // Search filter:
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { brand: { contains: filters.search } },
      { zone: { name: { contains: filters.search } } },
    ];
  }

  // Org scope for count aggregations
  const orgCountScope: Prisma.CampaignWhereInput =
    user.role === "ADVERTISER"
      ? filters.organizationId
        ? { organizationId: filters.organizationId }
        : { organizationId: { in: user.organizationIds } }
      : filters.organizationId
      ? { organizationId: filters.organizationId }
      : {};

  const [campaigns, totalCount, statusCounts] = await Promise.all([
    client.campaign.findMany({
      where,
      include: {
        organization: true,
        zone: true,
        assets: true,
        quotes: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
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
      client.campaign.count({ where: orgCountScope }),
      client.campaign.count({
        where: { ...orgCountScope, status: { in: CATEGORY_STATUS_MAP.draft } },
      }),
      client.campaign.count({
        where: { ...orgCountScope, status: { in: CATEGORY_STATUS_MAP.review } },
      }),
      client.campaign.count({
        where: { ...orgCountScope, status: { in: CATEGORY_STATUS_MAP.active } },
      }),
      client.campaign.count({
        where: { ...orgCountScope, status: { in: CATEGORY_STATUS_MAP.completed } },
      }),
      client.campaign.count({
        where: { ...orgCountScope, status: { in: CATEGORY_STATUS_MAP.issues } },
      }),
    ]),
  ]);

  return {
    campaigns,
    totalCount,
    counts: {
      all: statusCounts[0],
      draft: statusCounts[1],
      review: statusCounts[2],
      active: statusCounts[3],
      completed: statusCounts[4],
      issues: statusCounts[5],
    },
  };
}

/**
 * Retrieves comprehensive campaign details for advertiser live tracking.
 */
export async function getAdvertiserCampaignDetail(
  campaignId: string,
  user: AuthContextUser,
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

  // RBAC verification
  const isAuthorized = can(user, "campaign:read", {
    organizationId: campaign.organizationId,
    status: campaign.status,
  });

  if (!isAuthorized) {
    throw new Error(
      `Unauthorized: User ${user.id} does not have permission to view campaign '${campaignId}'`
    );
  }

  return campaign;
}

/**
 * Resubmits a campaign after changes were requested by Operations.
 * Transitions: CHANGES_REQUESTED -> SUBMITTED.
 */
export async function resubmitAdvertiserCampaign(
  params: {
    campaignId: string;
    user: AuthContextUser;
    notes?: string;
  },
  client: PrismaTransactionClient | typeof db = db
) {
  const { campaignId, user, notes } = params;

  const campaign = await client.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error(`Campaign '${campaignId}' not found`);
  }

  if (campaign.status !== CampaignStatus.CHANGES_REQUESTED) {
    throw new Error(
      `Cannot resubmit campaign with status '${campaign.status}'. Only campaigns in CHANGES_REQUESTED state can be resubmitted.`
    );
  }

  const isAuthorized = can(user, "campaign:submit", {
    organizationId: campaign.organizationId,
    status: campaign.status,
  });

  if (!isAuthorized) {
    throw new Error(
      `User ${user.id} is not authorized to submit campaign '${campaignId}'`
    );
  }

  const defaultReason = "Advertiser resolved requested changes and resubmitted for operations review.";

  return transition(
    {
      campaignId,
      toStatus: CampaignStatus.SUBMITTED,
      actor: {
        type: "USER",
        userId: user.id,
        role: user.role,
        organizationIds: user.organizationIds,
      },
      reason: notes ? notes.trim() : defaultReason,
      metadata: {
        resubmittedBy: user.id,
        resubmissionNote: notes,
      },
    },
    "$transaction" in client ? undefined : (client as PrismaTransactionClient)
  );
}

/**
 * Cancels a campaign upon advertiser request.
 */
export async function cancelAdvertiserCampaign(
  params: {
    campaignId: string;
    user: AuthContextUser;
    reason: string;
  },
  client: PrismaTransactionClient | typeof db = db
) {
  const { campaignId, user, reason } = params;

  const campaign = await client.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new Error(`Campaign '${campaignId}' not found`);
  }

  const isAuthorized = can(user, "campaign:cancel", {
    organizationId: campaign.organizationId,
    status: campaign.status,
  });

  if (!isAuthorized) {
    throw new Error(
      `User ${user.id} is not authorized to cancel campaign '${campaignId}'`
    );
  }

  return transition(
    {
      campaignId,
      toStatus: CampaignStatus.CANCELLED,
      actor: {
        type: "USER",
        userId: user.id,
        role: user.role,
        organizationIds: user.organizationIds,
      },
      reason: reason.trim() || "Cancelled by advertiser",
      metadata: {
        cancelledBy: user.id,
      },
    },
    "$transaction" in client ? undefined : (client as PrismaTransactionClient)
  );
}
