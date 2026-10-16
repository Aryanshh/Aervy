import Link from "next/link";
import { ZoneMap } from "@/components/maps/zone-map";
import { ShieldCheck, MapPin, AlertTriangle, ArrowLeft } from "lucide-react";

// Demo pilot zones data (matches seed data)
const DEMO_ZONES = [
  {
    id: "zone-blr-mg-road",
    name: "Bangalore MG Road Corridor",
    description: "High-visibility commercial perimeter along MG Road and Brigade Road junction.",
    centerLat: 12.9756,
    centerLng: 77.6066,
    ratePerHourPaise: 1500000,
    capacity: 1,
    isActive: true,
    notes:
      "Operating window: 18:00 - 22:00 IST. A zone listing is not proof of airspace clearance for a specific flight.",
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
    notes: "Proximity to airport approach. Flight subject to strict wind limits and day-of-ops ATC clearance.",
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

export default function AdminZonesPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Home
            </Link>
            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-blue-600">Aervy Ops</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                Zones Management
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin Authorized
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Safety Disclaimer Banner */}
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="flex items-start">
            <AlertTriangle className="mr-3 h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm">
              <p className="font-semibold">Regulatory Notice:</p>
              <p className="mt-0.5">
                A zone listed here is not proof of airspace clearance or permission for a specific flight.
                All operational flights require separate local regulatory, airspace, and weather authorizations.
              </p>
            </div>
          </div>
        </div>

        {/* Map Visualization */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Approved Flight Zones Map</h2>
              <p className="text-xs text-slate-500">
                Geofenced polygon perimeters defining authorized flight boundaries.
              </p>
            </div>
            <span className="text-xs text-slate-400">TODO(pilot): Leaflet / OpenStreetMap</span>
          </div>
          <ZoneMap zones={DEMO_ZONES} center={[12.9756, 77.6066]} zoom={13} />
        </div>

        {/* Zones List Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-base font-semibold text-slate-900">Approved Flight Zones Directory</h3>
            <p className="text-xs text-slate-500">
              Configured rates, simultaneous flight capacities, and operating constraints.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Zone Name</th>
                  <th className="px-6 py-3">Center Coordinates</th>
                  <th className="px-6 py-3">Hourly Rate</th>
                  <th className="px-6 py-3">Capacity</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Restrictions & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {DEMO_ZONES.map((zone) => (
                  <tr key={zone.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{zone.name}</div>
                      <div className="text-xs text-slate-500">{zone.description}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <span>
                          {zone.centerLat}, {zone.centerLng}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      ₹{(zone.ratePerHourPaise / 100).toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-normal text-slate-500">/ hr</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {zone.capacity} {zone.capacity === 1 ? "drone" : "drones"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        Active
                      </span>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-xs text-slate-500">
                      {zone.notes ?? "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
