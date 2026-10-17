import { NextRequest, NextResponse } from "next/server";
import { checkSlotAvailability } from "@/lib/availability/check";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const zoneId = searchParams.get("zoneId");
    const startStr = searchParams.get("startAt");
    const endStr = searchParams.get("endAt");
    const excludeCampaignId = searchParams.get("excludeCampaignId") || undefined;

    if (!zoneId || !startStr || !endStr) {
      return NextResponse.json(
        { error: "Missing required query parameters: zoneId, startAt, endAt" },
        { status: 400 }
      );
    }

    const startAt = new Date(startStr);
    const endAt = new Date(endStr);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (endAt.getTime() <= startAt.getTime()) {
      return NextResponse.json({ error: "End time must be after start time" }, { status: 400 });
    }

    const result = await checkSlotAvailability({
      zoneId,
      startAt,
      endAt,
      excludeCampaignId,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to evaluate slot availability", details: String(error) },
      { status: 500 }
    );
  }
}
