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
  onNext: (data: { zoneId: string; zoneRatePaise: number; zoneName: string }) => void;
}

export function StepLocation({ initialData, onBack, onNext }: StepLocationProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(initialData.zoneId ?? "");
  const [error, setError] = useState<string | null>(null);

  const selectedZone = APPROVED_ZONES.find((z) => z.id === selectedZoneId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = step3LocationSchema.safeParse({ zoneId: selectedZoneId });
    if (!result.success) {
      setError("Please select an approved flight zone from the list or map");
      return;
    }

    if (!selectedZone) {
      setError("Selected zone could not be found");
      return;
    }

    onNext({
      zoneId: selectedZone.id,
      zoneRatePaise: selectedZone.ratePerHourPaise,
      zoneName: selectedZone.name,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Step 3: Choose Approved Flight Zone</h2>
        <p className="text-sm text-slate-500 mt-1">
          Select an admin-verified flight zone with pre-cleared airspace boundaries.
        </p>
      </div>

      {/* Safety Notice Banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span className="font-semibold">Safety Boundary:</span>
        </div>
        <p className="mt-1">
          A zone listed here is not proof of airspace clearance or permission for a specific flight.
          All flights remain subject to day-of-ops pilot approval and ATC clearance.
        </p>
      </div>

      {/* Interactive Map */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <ZoneMap
          zones={APPROVED_ZONES}
          selectedZoneId={selectedZoneId}
          onSelectZone={(id) => setSelectedZoneId(id)}
          center={selectedZone ? [selectedZone.centerLat, selectedZone.centerLng] : [12.9756, 77.6066]}
          zoom={12}
        />
      </div>

      {/* Zone Cards */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase text-slate-500">Available Approved Zones</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {APPROVED_ZONES.map((zone) => {
            const isSelected = zone.id === selectedZoneId;
            const rateRupees = (zone.ratePerHourPaise / 100).toLocaleString("en-IN");

            return (
              <div
                key={zone.id}
                onClick={() => setSelectedZoneId(zone.id)}
                className={`relative cursor-pointer rounded-lg border p-4 transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-600"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-1.5">
                    <MapPin
                      className={`h-4 w-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`}
                    />
                    <h3 className="font-semibold text-sm text-slate-900">{zone.name}</h3>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                </div>

                <p className="mt-2 text-xs text-slate-500 line-clamp-2">{zone.description}</p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">₹{rateRupees} / hr</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                    Cap: {zone.capacity}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

      <div className="flex justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back: Creative
        </button>

        <button
          type="submit"
          disabled={!selectedZoneId}
          className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Choose Schedule
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
