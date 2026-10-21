"use client";

import React, { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { step2CreativeSchema } from "@/lib/validation/campaign";

interface StepCreativeProps {
  initialData: {
    storageKey?: string;
    originalName?: string;
    mimeType?: string;
    sizeBytes?: number;
    title?: string;
    altText?: string;
    ctaText?: string;
    destinationUrl?: string;
  };
  onBack: () => void;
  onNext: (data: {
    storageKey: string;
    originalName: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp" | "video/mp4";
    sizeBytes: number;
    title?: string;
    altText?: string;
    ctaText?: string;
    destinationUrl?: string;
  }) => void;
}

export function StepCreative({ initialData, onBack, onNext }: StepCreativeProps) {
  const [_file, setFile] = useState<File | null>(null);
  const [storageKey, setStorageKey] = useState(initialData.storageKey ?? "");
  const [originalName, setOriginalName] = useState(initialData.originalName ?? "");
  const [mimeType, setMimeType] = useState<string>(initialData.mimeType ?? "");
  const [sizeBytes, setSizeBytes] = useState<number>(initialData.sizeBytes ?? 0);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [title, setTitle] = useState(initialData.title ?? "");
  const [altText] = useState(initialData.altText ?? "");
  const [ctaText, setCtaText] = useState(initialData.ctaText ?? "");
  const [destinationUrl, setDestinationUrl] = useState(initialData.destinationUrl ?? "");

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setUploadError(null);
    setFile(selected);
    setIsUploading(true);

    try {
      // 1. Request presigned upload parameters
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selected.name,
          contentType: selected.type,
          sizeBytes: selected.size,
        }),
      });

      if (!presignRes.ok) {
        const errorData = await presignRes.json();
        throw new Error(errorData.error || "Failed to initialize upload");
      }

      const { uploadUrl, fileKey, directUploadFallback } = await presignRes.json();

      if (directUploadFallback) {
        // Fallback: direct multipart upload
        const formData = new FormData();
        formData.append("file", selected);
        const directRes = await fetch("/api/uploads/direct", {
          method: "POST",
          body: formData,
        });

        if (!directRes.ok) {
          const directError = await directRes.json();
          throw new Error(directError.error || "Direct upload failed");
        }

        const directData = await directRes.json();
        setStorageKey(directData.storageKey);
        setOriginalName(selected.name);
        setMimeType(selected.type);
        setSizeBytes(selected.size);
      } else {
        // Direct PUT to upload URL (S3 / mock)
        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": selected.type,
          },
          body: selected,
        });

        if (!putRes.ok) {
          throw new Error("Failed to store creative asset");
        }

        setStorageKey(fileKey);
        setOriginalName(selected.name);
        setMimeType(selected.type);
        setSizeBytes(selected.size);
      }

      if (selected.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl("");
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = step2CreativeSchema.safeParse({
      storageKey,
      originalName,
      mimeType,
      sizeBytes,
      title: title || undefined,
      altText: altText || undefined,
      ctaText: ctaText || undefined,
      destinationUrl: destinationUrl || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    onNext(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
      <div>
        <h2 className="text-xl font-heading font-bold text-[#ebebeb]">Step 2: Creative Upload & Formatting</h2>
        <p className="text-xs text-[#ebebeb]/50 mt-1">
          Upload media assets for high-luminance aerial drone displays.
        </p>
      </div>

      <div className="space-y-4">
        {/* Upload Zone */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#ebebeb]/70 mb-1.5">
            Asset File (JPG, PNG, WEBP, or MP4) <span className="text-[#ccff00]">*</span>
          </label>
          <div className="flex justify-center rounded-2xl border-2 border-dashed border-white/20 bg-black/40 px-6 pt-5 pb-6 hover:border-[#ccff00]/40 transition-colors">
            <div className="space-y-2 text-center">
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#ccff00]" />
                  <p className="mt-2 text-xs text-[#ccff00]">Streaming & validating asset...</p>
                </div>
              ) : storageKey ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="h-8 w-8 text-[#10b981]" />
                  <p className="mt-1 text-xs font-bold text-[#10b981]">Asset Uploaded & Verified</p>
                  <p className="text-[11px] text-[#ebebeb]/60">{originalName}</p>
                  <label
                    htmlFor="file-upload"
                    className="mt-2 cursor-pointer text-xs font-bold text-[#ccff00] hover:underline"
                  >
                    Replace asset
                  </label>
                </div>
              ) : (
                <>
                  <UploadCloud className="mx-auto h-10 w-10 text-white/30" />
                  <div className="flex text-xs text-[#ebebeb]/60 justify-center">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-bold text-[#ccff00] hover:underline"
                    >
                      <span>Upload creative media</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4"
                        className="sr-only"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1 text-[#ebebeb]/40">or drag and drop</p>
                  </div>
                  <p className="text-[10px] text-[#ebebeb]/40">
                    Max size: 50MB. Recommended resolution: 1920×1080 (16:9).
                  </p>
                </>
              )}
            </div>
          </div>
          {uploadError && <p className="mt-1 text-xs text-red-400">{uploadError}</p>}
          {errors.storageKey && (
            <p className="mt-1 text-xs text-red-400">Please upload a valid creative asset to proceed.</p>
          )}
        </div>

        {/* Media Preview Box */}
        {previewUrl && (
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4">
            <span className="text-[10px] uppercase tracking-wider text-[#ebebeb]/50 block mb-2">
              Optical Display Preview
            </span>
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black flex items-center justify-center border border-white/10">
              <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
            </div>
          </div>
        )}

        {/* Operational Safety Notice */}
        <div className="rounded-2xl border border-[#ccff00]/20 bg-[#ccff00]/10 p-4 text-[11px] text-[#ccff00]">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider">Aerial Media Compliance Standard:</p>
              <p className="mt-0.5 text-[#ebebeb]/80 leading-relaxed">
                Flashing patterns faster than 3Hz and strobe transitions are strictly prohibited by DGCA public safety regulations.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Title */}
        <div>
          <label htmlFor="title" className="block text-xs uppercase tracking-wider text-[#ebebeb]/70 mb-1.5">
            Asset Headline / Title <span className="text-xs text-[#ebebeb]/40">(optional)</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Acme Diwali Mega Sale 2026"
            className="block w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-white/30 focus:border-[#ccff00] focus:outline-none transition-colors"
          />
        </div>

        {/* Call to Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ctaText" className="block text-xs uppercase tracking-wider text-[#ebebeb]/70 mb-1.5">
              Call to Action Pill <span className="text-xs text-[#ebebeb]/40">(optional)</span>
            </label>
            <input
              id="ctaText"
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="e.g. Scan QR Code Below"
              className="block w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-white/30 focus:border-[#ccff00] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="destinationUrl" className="block text-xs uppercase tracking-wider text-[#ebebeb]/70 mb-1.5">
              QR Destination URL <span className="text-xs text-[#ebebeb]/40">(optional)</span>
            </label>
            <input
              id="destinationUrl"
              type="url"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://acmebrands.in/festival"
              className="block w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-white/30 focus:border-[#ccff00] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-5 py-2 text-xs font-bold text-[#ebebeb]/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </button>
        <button
          type="submit"
          disabled={!storageKey || isUploading}
          className="inline-flex items-center rounded-full bg-[#ccff00] px-6 py-2.5 text-xs font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] disabled:opacity-40"
        >
          Next: Flight Zone Selection
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
