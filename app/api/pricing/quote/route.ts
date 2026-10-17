import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateQuote } from "@/lib/pricing/calculate";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zoneId, startAt: startStr, endAt: endStr, multiplierBps, discountPaise } = body;

    if (!zoneId || !startStr || !endStr) {
      return NextResponse.json(
        { error: "Missing required fields: zoneId, startAt, endAt" },
        { status: 400 }
      );
    }

    const startAt = new Date(startStr);
    const endAt = new Date(endStr);

    if (isNaN(startAt.getTime()) || isNaN(endAt.getTime())) {
      return NextResponse.json({ error: "Invalid start or end date" }, { status: 400 });
    }

    // Look up true zone rate strictly on the server
    const zone = await db.zone.findUnique({
      where: { id: zoneId },
      select: { id: true, ratePerHourPaise: true, isActive: true },
    });

    if (!zone) {
      return NextResponse.json({ error: `Zone not found: ${zoneId}` }, { status: 404 });
    }

    if (!zone.isActive) {
      return NextResponse.json({ error: "Selected zone is not currently active" }, { status: 400 });
    }

    // Server-side calculation in integer paise
    const quote = calculateQuote({
      zoneId: zone.id,
      zoneRatePaise: zone.ratePerHourPaise,
      startAt,
      endAt,
      multiplierBps: multiplierBps ?? 10000,
      discountPaise: discountPaise ?? 0,
    });

    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: "Pricing calculation failed", details: String(error) },
      { status: 500 }
    );
  }
}
