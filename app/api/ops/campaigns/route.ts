import { NextRequest, NextResponse } from "next/server";
import { getOpsReviewQueue } from "@/lib/ops/review";
import { CampaignStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const zoneId = searchParams.get("zoneId") || undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : 0;

    let status: CampaignStatus | undefined = undefined;
    if (statusParam && Object.values(CampaignStatus).includes(statusParam as CampaignStatus)) {
      status = statusParam as CampaignStatus;
    }

    const data = await getOpsReviewQueue({
      status,
      zoneId,
      search,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load review queue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
