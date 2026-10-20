import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submitReviewDecision, ReviewDecisionType } from "@/lib/ops/review";
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
    const { decision, reason, constraints, reviewerId, reviewerRole } = body;

    if (!decision) {
      return NextResponse.json({ error: "Missing review decision" }, { status: 400 });
    }

    // Resolve Reviewer User (from request or seed ops reviewer)
    let reviewerUser: AuthContextUser;
    if (reviewerId) {
      reviewerUser = {
        id: reviewerId,
        role: reviewerRole || "OPS_REVIEWER",
        organizationIds: [],
        isActive: true,
      };
    } else {
      const opsUser = await db.user.findFirst({
        where: { role: "OPS_REVIEWER" },
      });
      reviewerUser = {
        id: opsUser?.id || "ops-reviewer-default",
        role: "OPS_REVIEWER",
        organizationIds: [],
        isActive: true,
      };
    }

    const result = await submitReviewDecision({
      campaignId,
      reviewer: reviewerUser,
      decision: decision as ReviewDecisionType,
      reason: reason || `Decision: ${decision}`,
      constraints,
    });

    return NextResponse.json({
      success: true,
      decisionRecord: result.decisionRecord,
      transitionResult: result.transitionResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Review decision failed";
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
