import { Prisma, SlotHold } from "@prisma/client";
import { db } from "@/lib/db";
import { checkSlotAvailability } from "./check";
import { SlotUnavailableError } from "./errors";

export const HOLD_DURATION_MINUTES = 15;

export interface CreateSlotHoldParams {
  campaignId: string;
  zoneId: string;
  startAt: Date;
  endAt: Date;
  holdMinutes?: number;
}

type PrismaTransactionClient = Prisma.TransactionClient;

/**
 * Creates a temporary 15-minute reservation on a zone slot to prevent double-booking during checkout.
 * Must execute inside a database transaction to prevent race conditions.
 */
export async function createSlotHold(
  params: CreateSlotHoldParams,
  client?: PrismaTransactionClient
): Promise<SlotHold> {
  const execute = async (tx: PrismaTransactionClient): Promise<SlotHold> => {
    const { campaignId, zoneId, startAt, endAt, holdMinutes = HOLD_DURATION_MINUTES } = params;

    // 1. First, release any existing active hold for this campaign
    await tx.slotHold.updateMany({
      where: {
        campaignId,
        status: "ACTIVE",
      },
      data: {
        status: "RELEASED",
      },
    });

    // 2. Perform live availability check inside the transaction
    const availability = await checkSlotAvailability(
      {
        zoneId,
        startAt,
        endAt,
        excludeCampaignId: campaignId,
      },
      tx
    );

    if (!availability.isAvailable) {
      throw new SlotUnavailableError(zoneId, startAt, endAt);
    }

    // 3. Create the 15-minute slot hold
    const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

    const hold = await tx.slotHold.create({
      data: {
        campaignId,
        zoneId,
        startAt,
        endAt,
        expiresAt,
        status: "ACTIVE",
      },
    });

    return hold;
  };

  if (client) {
    return execute(client);
  }

  return db.$transaction(execute);
}

/**
 * Marks a slot hold as converted to a confirmed booking upon verified payment.
 */
export async function convertSlotHold(
  campaignId: string,
  client: PrismaTransactionClient = db
): Promise<number> {
  const result = await client.slotHold.updateMany({
    where: {
      campaignId,
      status: "ACTIVE",
    },
    data: {
      status: "CONVERTED",
    },
  });

  return result.count;
}

/**
 * Releases an active slot hold (e.g. user abandoned checkout or selected a different time).
 */
export async function releaseSlotHold(
  campaignId: string,
  client: PrismaTransactionClient = db
): Promise<number> {
  const result = await client.slotHold.updateMany({
    where: {
      campaignId,
      status: "ACTIVE",
    },
    data: {
      status: "RELEASED",
    },
  });

  return result.count;
}

/**
 * Sweeps and marks past-due active slot holds as expired.
 */
export async function expireStaleSlotHolds(client: PrismaTransactionClient = db): Promise<number> {
  const now = new Date();
  const result = await client.slotHold.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });

  return result.count;
}
