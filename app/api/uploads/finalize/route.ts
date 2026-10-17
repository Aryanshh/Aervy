import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { validateMagicBytes } from "@/lib/storage/magic-bytes";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storageKey, originalName, campaignId, title, altText } = body;

    if (!storageKey || typeof storageKey !== "string") {
      return NextResponse.json({ error: "Missing storageKey" }, { status: 400 });
    }

    const quarantineFilename = path.basename(storageKey);
    const quarantinePath = path.join(process.cwd(), "public", "uploads", "quarantine", quarantineFilename);

    let buffer: Buffer;
    try {
      buffer = await fs.readFile(quarantinePath);
    } catch {
      return NextResponse.json(
        { error: "Uploaded quarantine file not found. Please upload again." },
        { status: 404 }
      );
    }

    // Secondary magic byte integrity check
    const check = validateMagicBytes(buffer);
    if (!check.isValid || !check.detectedMimeType) {
      return NextResponse.json(
        { error: check.error ?? "Corrupted or invalid file format" },
        { status: 400 }
      );
    }

    // Move to permanent active storage folder
    const permanentDir = path.join(process.cwd(), "public", "uploads", "active");
    await fs.mkdir(permanentDir, { recursive: true });

    const permanentKey = `assets/${quarantineFilename}`;
    const permanentPath = path.join(permanentDir, quarantineFilename);
    await fs.rename(quarantinePath, permanentPath);

    // If campaignId is supplied, persist CreativeAsset to database
    let asset = null;
    if (campaignId) {
      asset = await db.creativeAsset.create({
        data: {
          campaignId,
          storageKey: permanentKey,
          originalName: originalName || quarantineFilename,
          mimeType: check.detectedMimeType,
          sizeBytes: buffer.length,
          title: title || null,
          altText: altText || null,
          validationStatus: "PASSED",
          validationNote: "Magic bytes and format verified.",
        },
      });
    }

    return NextResponse.json({
      success: true,
      storageKey: permanentKey,
      mimeType: check.detectedMimeType,
      sizeBytes: buffer.length,
      publicUrl: `/uploads/active/${quarantineFilename}`,
      asset,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to finalize upload", details: String(error) },
      { status: 500 }
    );
  }
}
