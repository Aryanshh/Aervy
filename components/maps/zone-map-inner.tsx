"use client";

import React from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet default marker icon fix for Next.js bundler
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface ZoneMapItem {
  id: string;
  name: string;
  description: string | null;
  centerLat: number;
  centerLng: number;
  ratePerHourPaise: number;
  capacity: number;
  geojson: unknown;
  isActive: boolean;
  notes: string | null;
}

interface ZoneMapInnerProps {
  zones: ZoneMapItem[];
  selectedZoneId?: string;
  onSelectZone?: (zoneId: string) => void;
  center?: [number, number];
  zoom?: number;
}

interface GeoJSONPolygon {
  type: string;
  coordinates: number[][][];
}

function parsePolygonCoordinates(geojson: unknown): [number, number][] {
  try {
    const parsed = typeof geojson === "string" ? JSON.parse(geojson) : geojson;
    if (parsed && (parsed as GeoJSONPolygon).type === "Polygon" && Array.isArray((parsed as GeoJSONPolygon).coordinates)) {
      const ring = (parsed as GeoJSONPolygon).coordinates[0];
      if (Array.isArray(ring)) {
        // GeoJSON is [lng, lat] -> Leaflet expects [lat, lng]
        return ring.map((pt) => [pt[1] ?? 0, pt[0] ?? 0]);
      }
    }
  } catch {
    // Fallback to empty coordinates
  }
  return [];
}

export default function ZoneMapInner({
  zones,
  selectedZoneId,
  onSelectZone,
  center = [12.9716, 77.5946],
  zoom = 12,
}: ZoneMapInnerProps) {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-slate-200">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-[450px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {zones.map((zone) => {
          const positions = parsePolygonCoordinates(zone.geojson);
          const isSelected = zone.id === selectedZoneId;
          const rateRupees = (zone.ratePerHourPaise / 100).toLocaleString("en-IN");

          return (
            <React.Fragment key={zone.id}>
              {positions.length > 0 && (
                <Polygon
                  positions={positions}
                  pathOptions={{
                    color: isSelected ? "#2563eb" : "#0284c7",
                    fillColor: isSelected ? "#3b82f6" : "#38bdf8",
                    fillOpacity: isSelected ? 0.45 : 0.25,
                    weight: isSelected ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => onSelectZone?.(zone.id),
                  }}
                />
              )}

              <Marker
                position={[zone.centerLat, zone.centerLng]}
                eventHandlers={{
                  click: () => onSelectZone?.(zone.id),
                }}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-sm text-slate-900">{zone.name}</p>
                    <p className="text-xs text-slate-600 mt-1">₹{rateRupees} / hour</p>
                    {zone.notes && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-1 rounded mt-1.5 border border-amber-200">
                        {zone.notes}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
