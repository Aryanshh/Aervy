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
    <div className="min-h-screen w-full bg-[#000000] text-[#ebebeb] flex flex-col relative overflow-x-hidden selection:bg-[#ccff00] selection:text-black font-sans">
      
      {/* Background Grid & Noise */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-80 z-0" />
      <div className="fixed inset-0 bg-noise pointer-events-none mix-blend-overlay z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] glow-sphere-lime pointer-events-none z-0" />

      {/* Standard Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-[#000000]/85 backdrop-blur-[16px] border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center text-xs font-mono text-[#ebebeb]/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Home
            </Link>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-lg text-[#ebebeb]">Aervy Ops</span>
              <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[#ccff00]">
                Zones Management
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-[#10b981] bg-[#10b981]/10 px-3.5 py-1.5 rounded-full border border-[#10b981]/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin Authorized</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Regulatory Notice Banner */}
        <div className="rounded-2xl border border-[#ccff00]/30 bg-[#ccff00]/10 backdrop-blur-[16px] p-6 text-xs font-mono text-[#ccff00]">
          <div className="flex items-start">
            <AlertTriangle className="mr-3 h-5 w-5 flex-shrink-0 text-[#ccff00]" />
            <div>
              <p className="font-bold uppercase tracking-wider">Regulatory Notice:</p>
              <p className="mt-1 text-[#ebebeb]/80 leading-relaxed">
                A zone listed here is not proof of airspace clearance or permission for a specific flight.
                All operational flights require separate local regulatory, airspace, and weather authorizations.
              </p>
            </div>
          </div>
        </div>

        {/* Map Visualization */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 sm:p-8 shadow-2xl font-mono">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading font-bold text-[#ebebeb]">Approved Flight Zones Map</h2>
              <p className="text-xs text-[#ebebeb]/50 mt-1">
                Geofenced polygon perimeters defining authorized flight boundaries.
              </p>
            </div>
            <span className="text-[10px] text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/30 px-3 py-1 rounded-full">
              DGCA GREEN ZONES
            </span>
          </div>
          <div className="rounded-xl overflow-hidden border border-white/10">
            <ZoneMap zones={DEMO_ZONES} center={[12.9756, 77.6066]} zoom={13} />
          </div>
        </div>

        {/* Zones List Table */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-2xl overflow-hidden font-mono">
          <div className="border-b border-white/10 px-8 py-5">
            <h3 className="text-lg font-heading font-bold text-[#ebebeb]">Approved Flight Zones Directory</h3>
            <p className="text-xs text-[#ebebeb]/50 mt-1">
              Configured rates, simultaneous flight capacities, and operating constraints.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-xs">
              <thead className="bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-[#ebebeb]/40">
                <tr>
                  <th className="px-6 py-4">Zone Name</th>
                  <th className="px-6 py-4">Center Coordinates</th>
                  <th className="px-6 py-4">Hourly Rate</th>
                  <th className="px-6 py-4">Capacity</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Restrictions & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {DEMO_ZONES.map((zone) => (
                  <tr key={zone.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-heading font-bold text-sm text-[#ebebeb]">{zone.name}</div>
                      <div className="text-[11px] text-[#ebebeb]/50 mt-0.5">{zone.description}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#ebebeb]/60">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#ccff00]" />
                        <span>
                          {zone.centerLat}, {zone.centerLng}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#ccff00]">
                      ₹{(zone.ratePerHourPaise / 100).toLocaleString("en-IN")}{" "}
                      <span className="text-[10px] font-normal text-[#ebebeb]/40">/ hr</span>
                    </td>
                    <td className="px-6 py-4 text-[#ebebeb]/70">
                      {zone.capacity} {zone.capacity === 1 ? "drone" : "drones"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-[#10b981]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#10b981] border border-[#10b981]/30">
                        Active
                      </span>
                    </td>
                    <td className="max-w-xs px-6 py-4 text-[11px] text-[#ebebeb]/50">
                      {zone.notes ?? "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-[#000000] py-6 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#ebebeb]/40">
          <div>© 2026 AERVY TECHNOLOGIES INC.</div>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/ops/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/ops/campaigns" className="hover:text-white transition-colors">Queue</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
