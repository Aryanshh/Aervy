import { Prisma, CampaignStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { InvalidSlotTimeError, ZoneNotFoundError } from "./errors";

type PrismaClientOrTx = Prisma.TransactionClient | typeof db;

export interface SlotAvailabilityCheckParams {
  zoneId: string;
  startAt: Date;
  endAt: Date;
  excludeCampaignId?: string;
}

export interface SlotAvailabilityResult {
  isAvailable: boolean;
  zoneId: string;
  startAt: Date;
  endAt: Date;
  conflictingCampaignsCount: number;
  conflictingHoldsCount: number;
  capacity: number;
}

const INACTIVE_CAMPAIGN_STATUSES = [
  CampaignStatus.DRAFT,
  CampaignStatus.REJECTED,
  CampaignStatus.CANCELLED,
  CampaignStatus.FAILED,
];

/**
 * Checks whether a given time window in a zone is available for booking.
 * An overlap occurs if startAt < existingEnd AND endAt > existingStart.
 */
export async function checkSlotAvailability(
  params: SlotAvailabilityCheckParams,
  client: PrismaClientOrTx = db
): Promise<SlotAvailabilityResult> {
  const { zoneId, startAt, endAt, excludeCampaignId } = params;

  if (endAt.getTime() <= startAt.getTime()) {
    throw new InvalidSlotTimeError("Slot end time must be after start time");
  }

  const zone = await client.zone.findUnique({
    where: { id: zoneId },
    select: { id: true, capacity: true, isActive: true },
  });

  if (!zone) {
    throw new ZoneNotFoundError(zoneId);
  }

  if (!zone.isActive) {
    return {
      isAvailable: false,
      zoneId,
      startAt,
      endAt,
      conflictingCampaignsCount: 0,
      conflictingHoldsCount: 0,
      capacity: zone.capacity,
    };
  }

  const now = new Date();

  // 1. Check overlapping active campaigns
  const conflictingCampaignsCount = await client.campaign.count({
    where: {
      zoneId,
      id: excludeCampaignId ? { not: excludeCampaignId } : undefined,
      status: { notIn: INACTIVE_CAMPAIGN_STATUSES },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  // 2. Check overlapping active slot holds (that haven't expired)
  const conflictingHoldsCount = await client.slotHold.count({
    where: {
      zoneId,
      campaignId: excludeCampaignId ? { not: excludeCampaignId } : undefined,
      status: "ACTIVE",
      expiresAt: { gt: now },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });

  const totalConflicts = conflictingCampaignsCount + conflictingHoldsCount;
  const isAvailable = totalConflicts < zone.capacity;

  return {
    isAvailable,
    zoneId,
    startAt,
    endAt,
    conflictingCampaignsCount,
    conflictingHoldsCount,
    capacity: zone.capacity,
  };
}
