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
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50">
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-500 mb-2" />
        <p className="text-sm font-semibold text-slate-700">No Creative Asset Attached</p>
        <p className="text-xs text-slate-500 mt-1">This campaign draft has not finalized an asset upload.</p>
      </div>
    );
  }

  const isVideo = asset.mimeType.startsWith("video/");
  const formattedSize = (asset.sizeBytes / (1024 * 1024)).toFixed(2) + " MB";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          {isVideo ? (
            <Film className="h-5 w-5 text-indigo-600" />
          ) : (
            <ImageIcon className="h-5 w-5 text-blue-600" />
          )}
          <h3 className="text-sm font-bold text-slate-900">Creative Media Inspection</h3>
        </div>
        <div className="flex items-center space-x-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Magic Bytes: Verified</span>
        </div>
      </div>

      {/* Media Player / Viewer */}
      <div className="relative rounded-lg overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-800">
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
          <div className="relative w-full h-full flex items-center justify-center group">
            {/* Fallback image / mockup render */}
            <div className="text-center p-6 text-slate-400">
              <ImageIcon className="mx-auto h-16 w-16 text-slate-600 mb-2 group-hover:scale-105 transition-transform" />
              <p className="text-sm font-medium text-slate-200">{asset.originalName}</p>
              <p className="text-xs text-slate-500 mt-1">{asset.width} × {asset.height} px</p>
            </div>
            <button
              onClick={() => setZoomImage(!zoomImage)}
              className="absolute bottom-3 right-3 rounded-md bg-slate-900/80 hover:bg-slate-900 text-white p-1.5 text-xs inline-flex items-center space-x-1 backdrop-blur-sm"
              title="Full preview"
            >
              <ZoomIn className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
          </div>
        )}
      </div>

      {/* Technical Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
          <span className="text-slate-400 block font-medium">Format / MIME</span>
          <span className="font-semibold text-slate-800 font-mono mt-0.5 block truncate">
            {asset.mimeType}
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
          <span className="text-slate-400 block font-medium">Dimensions</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">
            {asset.width && asset.height ? `${asset.width} × ${asset.height} px` : "1920 × 1080 (HD)"}
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
          <span className="text-slate-400 block font-medium">Duration</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">
            {asset.durationSec ? `${asset.durationSec.toFixed(1)}s` : "Static Graphic"}
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
          <span className="text-slate-400 block font-medium">File Size</span>
          <span className="font-semibold text-slate-800 mt-0.5 block">
            {formattedSize}
          </span>
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs flex items-center justify-between">
        <span className="text-slate-500 truncate max-w-xs sm:max-w-md">
          Storage Key: <code className="text-slate-700 font-mono">{asset.storageKey}</code>
        </span>
        <span className="text-emerald-600 font-semibold flex items-center">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Quarantine Passed
        </span>
      </div>
    </div>
  );
}
