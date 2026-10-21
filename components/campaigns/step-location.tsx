"use client";

import React, { useState } from "react";
import { ZoneMap } from "@/components/maps/zone-map";
import { ZoneMapItem } from "@/components/maps/zone-map-inner";
import { MapPin, Check, AlertTriangle, ArrowLeft, ArrowRight } from "lucide-react";
import { step3LocationSchema } from "@/lib/validation/campaign";

// Default pilot zones data
const APPROVED_ZONES: ZoneMapItem[] = [
  {
    id: "zone-blr-mg-road",
    name: "Bangalore MG Road Corridor",
    description: "High-visibility commercial perimeter along MG Road and Brigade Road junction.",
    centerLat: 12.9756,
    centerLng: 77.6066,
    ratePerHourPaise: 1500000,
    capacity: 1,
    isActive: true,
    notes: "Operating window: 18:00 - 22:00 IST. Flight subject to day-of-ops weather checks.",
    geojson: {
      type: "Polygon",
      coordinates: [
        [
          [77.604, 12.974],
          [77.609, 12.974],
          [77.609, 12.978],
          [77.604, 12.978],
          [77.604, 12.974],
        ],
      ],
    },
  },
  {
    id: "zone-mum-bkc",
    name: "Mumbai BKC Financial Hub",
    description: "Bandra Kurla Complex central business plaza and exhibition perimeter.",
    centerLat: 19.0664,
    centerLng: 72.8687,
    ratePerHourPaise: 2500000,
    capacity: 1,
    isActive: true,
    notes: "Restricted proximity to airport approach. Strict wind limit inspections prior to flight.",
    geojson: {
      type: "Polygon",
      coordinates: [
        [
          [72.864, 19.063],
          [72.873, 19.063],
          [72.873, 19.069],
          [72.864, 19.069],
          [72.864, 19.063],
        ],
      ],
    },
  },
  {
    id: "zone-del-aerocity",
    name: "Delhi Aerocity Hospitality Corridor",
    description: "Premium hospitality and business park perimeter in Aerocity.",
    centerLat: 28.5501,
    centerLng: 77.1205,
    ratePerHourPaise: 2000000,
    capacity: 1,
    isActive: true,
    notes: "High security zone. Campaigns require advance operations review and police clearance.",
    geojson: {
      type: "Polygon",
      coordinates: [
        [
          [77.116, 28.547],
          [77.125, 28.547],
          [77.125, 28.553],
          [77.116, 28.553],
          [77.116, 28.547],
        ],
      ],
    },
  },
];

interface StepLocationProps {
  initialData: {
    zoneId?: string;
  };
  onBack: () => void;
  onNext: (data: { zoneId: string; zoneName: string; zoneRatePaise: number }) => void;
}

export function StepLocation({ initialData, onBack, onNext }: StepLocationProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(initialData.zoneId ?? "");
  const [error, setError] = useState<string | null>(null);

  const selectedZone = APPROVED_ZONES.find((z) => z.id === selectedZoneId);

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setError(null);
  };

  const handleContinue = () => {
    const result = step3LocationSchema.safeParse({ zoneId: selectedZoneId });
    if (!result.success || !selectedZone) {
      setError("Please select an approved flight zone from the list or map");
      return;
    }

    onNext({
      zoneId: selectedZone.id,
      zoneName: selectedZone.name,
      zoneRatePaise: selectedZone.ratePerHourPaise,
    });
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h2 className="text-xl font-heading font-bold text-[#ebebeb]">Step 3: Choose Approved Flight Zone</h2>
        <p className="text-xs text-[#ebebeb]/50 mt-1">
          Select an admin-verified flight zone with pre-cleared airspace boundaries.
        </p>
      </div>

      {/* Safety Notice */}
      <div className="rounded-2xl border border-[#ccff00]/30 bg-[#ccff00]/10 p-4 text-[11px] text-[#ccff00]">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#ccff00]" />
          <div>
            <p className="font-bold uppercase tracking-wider">Airspace & Green Zone Notice:</p>
            <p className="mt-0.5 text-[#ebebeb]/80 leading-relaxed">
              All flight corridors operate strictly within DGCA Green Zones. Flight altitudes are hard-capped at 400 ft AGL.
            </p>
          </div>
        </div>
      </div>

      {/* Map Preview */}
      <div className="rounded-2xl border border-white/10 overflow-hidden bg-black shadow-xl">
        <ZoneMap
          zones={APPROVED_ZONES}
          selectedZoneId={selectedZoneId}
          onSelectZone={handleSelectZone}
          center={selectedZone ? [selectedZone.centerLat, selectedZone.centerLng] : [12.9756, 77.6066]}
          zoom={13}
        />
      </div>

      {/* Corridor Cards List */}
      <div className="space-y-3">
        <label className="block text-xs uppercase tracking-wider text-[#ebebeb]/70">
          Available Metropolitan Corridors <span className="text-[#ccff00]">*</span>
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {APPROVED_ZONES.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            return (
              <div
                key={zone.id}
                onClick={() => handleSelectZone(zone.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 relative ${
                  isSelected
                    ? "border-[#ccff00] bg-[#ccff00]/10 shadow-[0_0_20px_rgba(204,255,0,0.15)] scale-[1.02]"
                    : "border-white/10 bg-black/40 hover:border-white/20 hover:bg-white/[0.02]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-1.5 text-xs font-heading font-bold text-[#ebebeb]">
                    <MapPin className={`h-3.5 w-3.5 ${isSelected ? "text-[#ccff00]" : "text-white/40"}`} />
                    <span className="truncate">{zone.name}</span>
                  </div>
                  {isSelected && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ccff00] text-black">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <p className="mt-2 text-[11px] text-[#ebebeb]/50 line-clamp-2">{zone.description}</p>

                <div className="mt-4 flex items-baseline justify-between border-t border-white/5 pt-2">
                  <span className="text-[10px] uppercase text-[#ebebeb]/40">Rate</span>
                  <span className="text-xs font-bold text-[#ccff00]">
                    ₹{(zone.ratePerHourPaise / 100).toLocaleString("en-IN")}/hr
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>

      {/* Selected Corridor Specs */}
      {selectedZone && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#ebebeb]/40 uppercase">Selected Corridor</span>
            <span className="font-bold text-[#ebebeb]">{selectedZone.name}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#ebebeb]/40 uppercase">Hourly Flight Rate</span>
            <span className="font-bold text-[#ccff00]">
              ₹{(selectedZone.ratePerHourPaise / 100).toLocaleString("en-IN")} INR / hr (excl. 18% GST)
            </span>
          </div>
          {selectedZone.notes && (
            <div className="pt-2 text-[11px] text-[#ebebeb]/50 border-t border-white/5">
              <strong>Corridor Note:</strong> {selectedZone.notes}
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
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
          type="button"
          disabled={!selectedZoneId}
          onClick={handleContinue}
          className="inline-flex items-center rounded-full bg-[#ccff00] px-6 py-2.5 text-xs font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] disabled:opacity-40"
        >
          Next: Schedule Window
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
