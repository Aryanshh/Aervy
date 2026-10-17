import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "@/lib/validation/campaign";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, mimeType, sizeBytes } = body;

    if (!filename || typeof filename !== "string") {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 });
    }

    if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: "Invalid mime type. Allowed: JPG, PNG, WebP, MP4" },
        { status: 400 }
      );
    }

    if (!sizeBytes || sizeBytes <= 0 || sizeBytes > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds 25 MB limit (${sizeBytes} bytes)` },
        { status: 400 }
      );
    }

    // Generate random quarantine key (never trust user filenames)
    const randomId = crypto.randomUUID();
    const ext = filename.split(".").pop()?.toLowerCase() || "bin";
    const storageKey = `quarantine/${randomId}.${ext}`;

    // For web MVP: direct upload endpoint
    const uploadUrl = `/api/uploads/direct?key=${encodeURIComponent(storageKey)}`;

    return NextResponse.json({
      storageKey,
      uploadUrl,
      maxSizeBytes: MAX_FILE_SIZE_BYTES,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate presigned upload parameters", details: String(error) },
      { status: 500 }
    );
  }
}
