import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { advanceOperationalMilestone } from "@/lib/ops/review";
import { CampaignStatus } from "@prisma/client";
import { AuthContextUser } from "@/lib/permissions/can";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
    }

    const body = await req.json();
    const { toStatus, note, opsUserId } = body;

    if (!toStatus || !Object.values(CampaignStatus).includes(toStatus)) {
      return NextResponse.json({ error: "Invalid or missing toStatus" }, { status: 400 });
    }

    // Resolve Ops User
    let opsUser: AuthContextUser;
    if (opsUserId) {
      opsUser = {
        id: opsUserId,
        role: "OPS_REVIEWER",
        organizationIds: [],
        isActive: true,
      };
    } else {
      const dbOpsUser = await db.user.findFirst({
        where: { role: "OPS_REVIEWER" },
      });
      opsUser = {
        id: dbOpsUser?.id || "ops-user-default",
        role: "OPS_REVIEWER",
        organizationIds: [],
        isActive: true,
      };
    }

    const transitionResult = await advanceOperationalMilestone({
      campaignId,
      opsUser,
      toStatus: toStatus as CampaignStatus,
      note,
    });

    return NextResponse.json({
      success: true,
      transitionResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Milestone transition failed";
    const status = message.includes("not authorized")
      ? 403
      : message.includes("not found")
        ? 404
        : message.includes("not permitted") || message.includes("reason")
          ? 400
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
