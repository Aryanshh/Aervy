import { describe, it, expect } from "vitest";
import { validateMagicBytes } from "@/lib/storage/magic-bytes";

describe("Stage 4 Storage & Magic-Byte Validation", () => {
  it("detects valid JPEG image magic bytes (FF D8 FF)", () => {
    const jpegBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00,
    ]);
    const res = validateMagicBytes(jpegBuffer);
    expect(res.isValid).toBe(true);
    expect(res.detectedMimeType).toBe("image/jpeg");
  });

  it("detects valid PNG image magic bytes (89 50 4E 47 0D 0A 1A 0A)", () => {
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    ]);
    const res = validateMagicBytes(pngBuffer);
    expect(res.isValid).toBe(true);
    expect(res.detectedMimeType).toBe("image/png");
  });

  it("detects valid WebP image magic bytes (RIFF ... WEBP)", () => {
    const webpBuffer = Buffer.alloc(16);
    // RIFF
    webpBuffer.write("RIFF", 0);
    // WEBP at offset 8
    webpBuffer.write("WEBP", 8);

    const res = validateMagicBytes(webpBuffer);
    expect(res.isValid).toBe(true);
    expect(res.detectedMimeType).toBe("image/webp");
  });

  it("detects valid MP4 video magic bytes (ftyp at offset 4)", () => {
    const mp4Buffer = Buffer.alloc(16);
    mp4Buffer.write("ftyp", 4);

    const res = validateMagicBytes(mp4Buffer);
    expect(res.isValid).toBe(true);
    expect(res.detectedMimeType).toBe("video/mp4");
  });

  it("CRITICAL: Rejects SVG files disguised as PNG/JPG", () => {
    const fakeSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>');
    const res = validateMagicBytes(fakeSvg);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("SVG, XML, and HTML scripts are strictly forbidden");
  });

  it("CRITICAL: Rejects executable files (MZ header)", () => {
    const exeBuffer = Buffer.alloc(20);
    exeBuffer[0] = 0x4d; // M
    exeBuffer[1] = 0x5a; // Z
    const res = validateMagicBytes(exeBuffer);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain("Executable files are strictly forbidden");
  });

  it("CRITICAL: Rejects HTML and script payloads", () => {
    const scriptBuffer = Buffer.from("<!DOCTYPE html><html><script>malicious()</script></html>");
    const res = validateMagicBytes(scriptBuffer);
    expect(res.isValid).toBe(false);
  });

  it("rejects truncated or tiny buffers below 12 bytes", () => {
    const tiny = Buffer.from([0xff, 0xd8]);
    const res = validateMagicBytes(tiny);
    expect(res.isValid).toBe(false);
  });
});
