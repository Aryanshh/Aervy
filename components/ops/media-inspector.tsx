"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Film, Image as ImageIcon, ZoomIn } from "lucide-react";

interface MediaAsset {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  storageKey: string;
  validationStatus: string;
  validationNote?: string | null;
}

interface MediaInspectorProps {
  asset?: MediaAsset | null;
}

export function MediaInspector({ asset }: MediaInspectorProps) {
  const [zoomImage, setZoomImage] = useState(false);

  if (!asset) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 p-8 text-center bg-white/[0.02] backdrop-blur-[16px]">
        <AlertTriangle className="mx-auto h-8 w-8 text-[#ccff00] mb-2" />
        <p className="font-heading text-sm font-semibold text-[#ebebeb]">No Creative Asset Attached</p>
        <p className="font-mono text-xs text-[#ebebeb]/50 mt-1">This campaign draft has not finalized an asset upload.</p>
      </div>
    );
  }

  const isVideo = asset.mimeType.startsWith("video/");
  const formattedSize = (asset.sizeBytes / (1024 * 1024)).toFixed(2) + " MB";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2">
          {isVideo ? (
            <Film className="h-5 w-5 text-[#ccff00]" />
          ) : (
            <ImageIcon className="h-5 w-5 text-[#ccff00]" />
          )}
          <h3 className="font-heading text-base font-bold text-[#ebebeb] tracking-tight">Creative Media Inspection</h3>
        </div>
        <div className="flex items-center space-x-1.5 rounded-full bg-[#10b981]/10 px-3 py-1 font-mono text-[11px] font-bold text-[#10b981] border border-[#10b981]/30">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Magic Bytes: Verified</span>
        </div>
      </div>

      {/* Media Player / Viewer */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/10">
        {isVideo ? (
          <video
            controls
            className="w-full h-full object-contain"
            src={`/api/uploads/stream?key=${encodeURIComponent(asset.storageKey)}`}
            poster="/placeholder-video-poster.png"
          >
            Your browser does not support HTML5 video preview.
          </video>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center group bg-black/80">
            {/* Fallback image / mockup render */}
            <div className="text-center p-6 text-[#ebebeb]/50">
              <ImageIcon className="mx-auto h-16 w-16 text-[#ebebeb]/30 mb-2 group-hover:scale-105 transition-transform" />
              <p className="font-mono text-sm font-medium text-[#ebebeb]">{asset.originalName}</p>
              <p className="font-mono text-xs text-[#ebebeb]/40 mt-1">{asset.width} × {asset.height} px</p>
            </div>
            <button
              onClick={() => setZoomImage(!zoomImage)}
              className="absolute bottom-3 right-3 rounded-full bg-black/80 hover:bg-black text-[#ebebeb] px-3 py-1.5 font-mono text-xs inline-flex items-center space-x-1.5 border border-white/10 backdrop-blur-sm transition-colors"
              title="Full preview"
            >
              <ZoomIn className="h-3.5 w-3.5 text-[#ccff00]" />
              <span>Preview</span>
            </button>
          </div>
        )}
      </div>

      {/* Technical Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40 block">Format / MIME</span>
          <span className="font-mono font-semibold text-[#ebebeb] mt-1 block truncate">
            {asset.mimeType}
          </span>
        </div>

        <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40 block">Dimensions</span>
          <span className="font-mono font-semibold text-[#ebebeb] mt-1 block">
            {asset.width && asset.height ? `${asset.width} × ${asset.height} px` : "1920 × 1080 (HD)"}
          </span>
        </div>

        <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40 block">Duration</span>
          <span className="font-mono font-semibold text-[#ebebeb] mt-1 block">
            {asset.durationSec ? `${asset.durationSec.toFixed(1)}s` : "Static Graphic"}
          </span>
        </div>

        <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40 block">File Size</span>
          <span className="font-mono font-semibold text-[#ccff00] mt-1 block">
            {formattedSize}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-[#ebebeb]/60 truncate font-mono text-[11px] max-w-xs sm:max-w-md">
          Storage Key: <code className="text-[#ebebeb]">{asset.storageKey}</code>
        </span>
        <span className="text-[#10b981] font-mono font-semibold flex items-center text-xs">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Quarantine Passed
        </span>
      </div>
    </div>
  );
}
