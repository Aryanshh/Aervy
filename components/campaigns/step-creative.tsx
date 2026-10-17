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
  const [altText, setAltText] = useState(initialData.altText ?? "");
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
          mimeType: selected.type,
          sizeBytes: selected.size,
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json();
        throw new Error(err.error || "Presign request failed");
      }

      const { storageKey: quarantineKey, uploadUrl } = await presignRes.json();

      // 2. Direct upload to quarantine with magic byte verification
      const formData = new FormData();
      formData.append("file", selected);

      const directRes = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!directRes.ok) {
        const err = await directRes.json();
        throw new Error(err.error || "File upload failed");
      }

      await directRes.json();

      // 3. Finalize upload
      const finalizeRes = await fetch("/api/uploads/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storageKey: quarantineKey,
          originalName: selected.name,
          title,
          altText,
        }),
      });

      if (!finalizeRes.ok) {
        const err = await finalizeRes.json();
        throw new Error(err.error || "Failed to finalize upload");
      }

      const finalizeResult = await finalizeRes.json();

      setStorageKey(finalizeResult.storageKey);
      setOriginalName(selected.name);
      setMimeType(finalizeResult.mimeType);
      setSizeBytes(finalizeResult.sizeBytes);
      setPreviewUrl(finalizeResult.publicUrl || URL.createObjectURL(selected));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setFile(null);
      setStorageKey("");
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
      title,
      altText,
      ctaText,
      destinationUrl,
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

    onNext(result.data as {
      storageKey: string;
      originalName: string;
      mimeType: "image/jpeg" | "image/png" | "image/webp" | "video/mp4";
      sizeBytes: number;
      title?: string;
      altText?: string;
      ctaText?: string;
      destinationUrl?: string;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Step 2: Creative Upload & Display Content</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload banner media and configure visual presentation metadata.
        </p>
      </div>

      {/* Upload Box */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Creative Banner Asset <span className="text-red-500">*</span>
        </label>
        <div className="relative rounded-lg border-2 border-dashed border-slate-300 p-6 text-center hover:border-blue-400 transition-colors bg-white">
          <input
            id="file-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="flex flex-col items-center">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2 text-blue-600">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-sm font-medium">Verifying format & magic bytes...</span>
              </div>
            ) : storageKey ? (
              <div className="flex flex-col items-center space-y-2 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
                <span className="text-sm font-semibold">{originalName}</span>
                <span className="text-xs text-slate-500">
                  Verified format: {mimeType} • {(sizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
                <span className="text-xs text-blue-600 underline">Click to change asset</span>
              </div>
            ) : (
              <>
                <UploadCloud className="h-10 w-10 text-slate-400" />
                <p className="mt-2 text-sm text-slate-600">
                  <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  JPG, PNG, WebP or short MP4 (max 25 MB). SVG is rejected for safety.
                </p>
              </>
            )}
          </div>
        </div>

        {uploadError && (
          <div className="mt-2 flex items-center text-xs text-red-600">
            <AlertCircle className="mr-1.5 h-4 w-4 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {errors.storageKey && <p className="mt-1 text-xs text-red-600">{errors.storageKey}</p>}
      </div>

      {/* Preview Section */}
      {previewUrl && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Creative Preview</p>
          <div className="max-h-48 flex items-center justify-center overflow-hidden rounded bg-black">
            {mimeType.startsWith("video/") ? (
              <video src={previewUrl} controls className="max-h-48 max-w-full" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Banner Preview" className="max-h-48 object-contain" />
            )}
          </div>
        </div>
      )}

      {/* Title & Alt Text */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="creative-title" className="block text-sm font-medium text-slate-700">
            Banner Title <span className="text-xs text-slate-400">(optional)</span>
          </label>
          <input
            id="creative-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Headline displayed on summary"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="creative-alt" className="block text-sm font-medium text-slate-700">
            Accessibility Alt Text <span className="text-xs text-slate-400">(optional)</span>
          </label>
          <input
            id="creative-alt"
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Visual description for accessibility"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* CTA & Destination URL */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="creative-cta" className="block text-sm font-medium text-slate-700">
            Call to Action (CTA) <span className="text-xs text-slate-400">(optional)</span>
          </label>
          <input
            id="creative-cta"
            type="text"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="e.g. Scan QR Code / Visit Website"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="creative-url" className="block text-sm font-medium text-slate-700">
            Destination URL <span className="text-xs text-slate-400">(optional)</span>
          </label>
          <input
            id="creative-url"
            type="url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="https://yourbrand.com/landing"
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.destinationUrl ? "border-red-500 bg-red-50" : "border-slate-300"
            }`}
          />
          {errors.destinationUrl && (
            <p className="mt-1 text-xs text-red-600">{errors.destinationUrl}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back: Basics
        </button>

        <button
          type="submit"
          disabled={!storageKey || isUploading}
          className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Choose Location
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
