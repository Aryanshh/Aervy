import { NextRequest, NextResponse } from "next/server";
import { getOpsCampaignDetail } from "@/lib/ops/review";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
    }

    const campaign = await getOpsCampaignDetail(campaignId);
    return NextResponse.json({ success: true, campaign });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Campaign not found";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
