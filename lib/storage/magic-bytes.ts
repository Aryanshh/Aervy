export interface MagicByteValidationResult {
  isValid: boolean;
  detectedMimeType: string | null;
  error?: string;
}

/**
 * Validates the true file type of a buffer by inspecting its raw header magic bytes.
 * Never trusts file extensions or client-supplied MIME headers.
 */
export function validateMagicBytes(buffer: Buffer): MagicByteValidationResult {
  if (!buffer || buffer.length < 12) {
    return {
      isValid: false,
      detectedMimeType: null,
      error: "Buffer too small to determine file type",
    };
  }

  // 1. Explicit dangerous type rejections
  // DOS/Windows executable (MZ header)
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return {
      isValid: false,
      detectedMimeType: "application/x-msdownload",
      error: "Executable files are strictly forbidden",
    };
  }

  // Text / XML / SVG / HTML check
  const headerText = buffer.subarray(0, 100).toString("utf-8").toLowerCase();
  if (
    headerText.includes("<svg") ||
    headerText.includes("<?xml") ||
    headerText.includes("<html") ||
    headerText.includes("<script") ||
    headerText.includes("<!doctype")
  ) {
    return {
      isValid: false,
      detectedMimeType: "image/svg+xml",
      error: "SVG, XML, and HTML scripts are strictly forbidden for security",
    };
  }

  // 2. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return {
      isValid: true,
      detectedMimeType: "image/jpeg",
    };
  }

  // 3. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return {
      isValid: true,
      detectedMimeType: "image/png",
    };
  }

  // 4. WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50 // P
  ) {
    return {
      isValid: true,
      detectedMimeType: "image/webp",
    };
  }

  // 5. MP4: bytes 4-7 are 'ftyp'
  if (
    buffer[4] === 0x66 && // f
    buffer[5] === 0x74 && // t
    buffer[6] === 0x79 && // y
    buffer[7] === 0x70 // p
  ) {
    return {
      isValid: true,
      detectedMimeType: "video/mp4",
    };
  }

  return {
    isValid: false,
    detectedMimeType: null,
    error: "Unsupported file type. Only JPG, PNG, WebP, and MP4 files are permitted.",
  };
}
