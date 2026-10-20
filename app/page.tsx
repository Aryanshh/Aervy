import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
  Clock,
  UploadCloud,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Wind,
  FileCheck2,
  Lock,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Top Announcement Bar */}
      <div className="bg-blue-600 px-4 py-2 text-center text-xs font-medium text-white sm:px-6 lg:px-8">
        <span className="inline-flex items-center">
          <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
          Strict DGCA Green Zone Compliance & Human-in-the-Loop Operations Review
        </span>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-2xl font-black tracking-tight text-blue-600">
              Aervy
            </Link>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
              Operations Platform
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <Link href="/how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </Link>
            <Link href="/safety" className="hover:text-blue-600 transition-colors">
              Safety & Regulations
            </Link>
            <Link href="/app/campaigns" className="hover:text-blue-600 transition-colors">
              Track Campaigns
            </Link>
            <Link href="/ops/campaigns" className="hover:text-blue-600 transition-colors">
              Ops Queue
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/auth/sign-in"
              className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              Request Campaign
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Next-Gen Aerial Display Management
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl max-w-4xl mx-auto leading-tight">
                Dynamic Aerial Advertising <br />
                <span className="text-blue-600">Managed with Digital Precision</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600">
                Plan, upload, schedule, and review aerial campaigns in approved flight zones.
                A digital-first workflow built for modern brands, advertising agencies, and certified flight operations teams.
              </p>

              {/* Strict Regulatory Safety Banner */}
              <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-amber-300 bg-amber-50 p-4 text-left text-xs sm:text-sm text-amber-950 shadow-sm">
                <div className="flex items-start space-x-2.5">
                  <ShieldCheck className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">Safety & Regulatory Boundary Commitment:</p>
                    <p className="mt-1 text-amber-900 text-xs leading-relaxed">
                      Submitting a campaign on Aervy represents an <strong>operational request for feasibility review</strong>,
                      never an automated flight authorization. Actual flight deployment is strictly subject to DGCA Green Zone clearance,
                      local weather validation (&lt;15 knots wind), and physical Remote Pilot in Command (RPIC) on-site sign-off.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/app/campaigns/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                >
                  Create Campaign Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  Explore How It Works
                </Link>
                <Link
                  href="/auth/sign-in"
                  className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50/50 px-5 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100 transition-colors"
                >
                  Demo Switcher
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Step Operational Flow */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">The 4-Step Request Lifecycle</h2>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                From Digital Ingestion to Certified Flight Execution
              </p>
              <p className="mt-3 text-sm text-slate-600">
                A transparent, safety-checked workflow ensuring predictable operations and zero unauthorized flights.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">1. Creative Ingestion</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Upload verified banner assets with automated validation for resolution, aspect ratio (16:9), and text safe areas.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">2. Approved Zone & Slot</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Select an authorized DGCA Green Zone with automatic 15-minute slot holds preventing conflicting schedules.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">3. Verified Pricing</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Deterministic server-computed quotes in integer paise with 18% GST and secure Razorpay test escrow integration.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">4. Operations Review</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Certified operations leads review 4 safety pillars. Automatic 100% refund is guaranteed if safety requirements are unmet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Approved Flight Zones Showcase */}
        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Airspace Availability</h2>
              <p className="mt-2 text-3xl font-extrabold text-slate-900">
                Pre-Approved Metropolitan Green Airspaces
              </p>
              <p className="mt-3 text-sm text-slate-600">
                Pre-surveyed flight corridors with verified geo-fencing, altitude limits, and emergency landing zones.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Bengaluru MG Road Corridor",
                  city: "Bengaluru, Karnataka",
                  rate: "₹4,500/hr",
                  status: "DGCA Green Zone",
                  coords: "12.9716° N, 77.5946° E",
                  capacity: "2 slots/hr",
                },
                {
                  name: "Mumbai BKC Financial Hub",
                  city: "Mumbai, Maharashtra",
                  rate: "₹6,000/hr",
                  status: "DGCA Green Zone",
                  coords: "19.0657° N, 72.8687° E",
                  capacity: "1 slot/hr",
                },
                {
                  name: "Hyderabad Hitec City Corridor",
                  city: "Hyderabad, Telangana",
                  rate: "₹4,000/hr",
                  status: "DGCA Green Zone",
                  coords: "17.4474° N, 78.3762° E",
                  capacity: "2 slots/hr",
                },
              ].map((zone, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {zone.status}
                      </span>
                      <span className="text-sm font-bold text-blue-600">{zone.rate}</span>
                    </div>

                    <h3 className="mt-4 text-base font-bold text-slate-900">{zone.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{zone.city}</p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Coordinates:</span>
                        <span className="font-mono text-[11px]">{zone.coords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Corridor Capacity:</span>
                        <span>{zone.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Max Altitude:</span>
                        <span>400 ft AGL</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href="/app/campaigns/new"
                      className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                    >
                      Book Slot in this Zone
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety & Engineering Architecture */}
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Safety by Design</h2>
                <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                  Built on Strict Regulatory & Physical Separation
                </h3>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                  Aervy maintains an uncompromising safety separation: our web application strictly manages
                  digital campaign requests, asset verification, and slot scheduling. Flight execution and piloting
                  are never exposed to the web and remain under certified on-site Remote Pilots in Command (RPIC).
                </p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <Wind className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Weather Envelope Safeguard</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Strict wind velocity cut-off (&lt;15 knots) and zero precipitation tolerance before pilot launch.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <FileCheck2 className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">DGCA Digital Sky Integration</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Operates exclusively within pre-cleared Green Airspaces with automated NOTAM tracking.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Lock className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">100% Automated Refund Guarantee</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        If Operations determines an airspace, weather, or creative issue prevents flight, funds are instantly refunded.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-8 text-white shadow-xl">
                <div className="inline-flex items-center rounded-full bg-blue-900/50 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-800">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                  Flight Operations Review Pledge
                </div>

                <h4 className="mt-4 text-xl font-bold">4-Pillar Operations Verification</h4>
                <p className="mt-2 text-xs text-slate-400">
                  Every submitted campaign must pass all 4 independent inspection gates before dispatch:
                </p>

                <ul className="mt-6 space-y-3 text-xs">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Airspace: Verified DGCA Green Zone without active temporary flight restrictions.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Weather: Forecast sustained ground winds strictly under 14 knots.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Creative: Safe ground-viewing contrast, no disorienting strobe sequences.</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Operations: Certified remote pilot in command (RPIC) assigned on site.</span>
                  </li>
                </ul>

                <div className="mt-8 border-t border-slate-800 pt-6 flex items-center justify-between text-xs text-slate-400">
                  <span>Aervy Operations Protocol v1.0</span>
                  <Link href="/safety" className="text-blue-400 hover:underline">
                    Read Full Policy →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-blue-600 py-16 text-white text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Ready to Launch Your Next Brand Activation?
            </h2>
            <p className="mt-4 text-base text-blue-100 max-w-2xl mx-auto">
              Submit your creative assets, select an approved flight corridor, and receive transparent quote pricing in minutes.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/app/campaigns/new"
                className="inline-flex items-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 transition-colors"
              >
                Create Campaign Request
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center rounded-md border border-white/30 bg-blue-700/50 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Sign In with Demo Roles
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Aervy
              </Link>
              <p className="mt-2 text-xs text-slate-500 max-w-sm">
                Digital coordination platform for approved aerial display advertising.
                Aervy connects advertisers with certified drone operations in compliance with DGCA guidelines.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Platform</h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/app/campaigns/new" className="hover:text-blue-600">
                    New Campaign Request
                  </Link>
                </li>
                <li>
                  <Link href="/app/campaigns" className="hover:text-blue-600">
                    Advertiser Tracking
                  </Link>
                </li>
                <li>
                  <Link href="/ops/campaigns" className="hover:text-blue-600">
                    Operations Queue
                  </Link>
                </li>
                <li>
                  <Link href="/auth/sign-in" className="hover:text-blue-600">
                    Demo Role Switcher
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Compliance & Safety</h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li>
                  <Link href="/safety" className="hover:text-blue-600">
                    Airspace Safety Policy
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-blue-600">
                    How Operations Works
                  </Link>
                </li>
                <li>
                  <span className="text-slate-400">DGCA Green Zones Only</span>
                </li>
                <li>
                  <span className="text-slate-400">100% Refund Policy</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Aervy Technologies Pvt Ltd. All rights reserved.</p>
            <p className="mt-1">
              Important: Submissions are requests for feasibility review, not flight authorizations.
              All flight operations require separate pilot, weather, and regulatory clearance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
