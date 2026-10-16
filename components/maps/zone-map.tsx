"use client";

import dynamic from "next/dynamic";
import { ZoneMapItem } from "./zone-map-inner";

const ZoneMapDynamic = dynamic(() => import("./zone-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[450px] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
      <div className="flex flex-col items-center space-y-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <span className="text-sm">Loading flight zones map...</span>
      </div>
    </div>
  ),
});

export interface ZoneMapProps {
  zones: ZoneMapItem[];
  selectedZoneId?: string;
  onSelectZone?: (zoneId: string) => void;
  center?: [number, number];
  zoom?: number;
}

export function ZoneMap(props: ZoneMapProps) {
  return <ZoneMapDynamic {...props} />;
}
