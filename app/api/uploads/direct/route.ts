import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { validateMagicBytes } from "@/lib/storage/magic-bytes";
import { MAX_FILE_SIZE_BYTES } from "@/lib/validation/campaign";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key || !key.startsWith("quarantine/")) {
      return NextResponse.json({ error: "Invalid or missing quarantine key" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided in form data" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds 25 MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate true magic bytes server-side
    const magicCheck = validateMagicBytes(buffer);
    if (!magicCheck.isValid) {
      return NextResponse.json(
        { error: magicCheck.error ?? "Invalid file header bytes" },
        { status: 400 }
      );
    }

    // Persist to local quarantine storage directory
    const quarantineDir = path.join(process.cwd(), "public", "uploads", "quarantine");
    await fs.mkdir(quarantineDir, { recursive: true });

    const filename = path.basename(key);
    const filePath = path.join(quarantineDir, filename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      storageKey: key,
      detectedMimeType: magicCheck.detectedMimeType,
      sizeBytes: buffer.length,
      publicUrl: `/uploads/quarantine/${filename}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Direct upload failed", details: String(error) },
      { status: 500 }
    );
  }
}
