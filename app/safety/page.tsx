import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Wind,
  Lock,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

export default function SafetyRegulationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-2xl font-black tracking-tight text-blue-600">
              Aervy
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-semibold text-slate-700">Safety & Compliance</span>
          </div>

          <nav className="flex items-center space-x-6 text-xs sm:text-sm font-medium text-slate-600">
            <Link href="/how-it-works" className="hover:text-blue-600">
              How It Works
            </Link>
            <Link href="/app/campaigns" className="hover:text-blue-600">
              Track Campaigns
            </Link>
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              New Campaign
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header intro */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
              Safety-First Operational Charter
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Airspace Safety, Compliance & Regulatory Standards
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              At Aervy, public safety and strict airspace compliance take absolute precedence over commercial flight hours.
              Our platform operates strictly within approved DGCA Green Zones with physical human-in-the-loop pilot control.
            </p>
          </div>

          {/* Primary Safety Mandate Banner */}
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 text-amber-950 shadow-sm">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base font-bold">The Non-Flight Web Boundary Guarantee</h3>
                <p className="mt-2 text-xs sm:text-sm text-amber-900 leading-relaxed">
                  The Aervy web application strictly serves as a digital coordination and campaign request portal.
                  Under no circumstances does our web server connect to drone telemetry, command links, or autonomous flight hardware.
                  All physical aerial operations are exclusively controlled on site by certified Remote Pilots in Command (RPIC).
                </p>
              </div>
            </div>
          </div>

          {/* Core Safety Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pillar 1 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">1. DGCA Green Zone Exclusivity</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Flights are scheduled exclusively within designated Green Airspaces mapped on the DGCA Digital Sky platform.
                Flights in Red (prohibited) or Yellow (controlled) airspace are strictly excluded from our platform corridors.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Maximum altitude capped at 400 ft Above Ground Level (AGL)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Permanent 5 km buffer from airport reference points</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Wind className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">2. Strict Weather Envelope</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Weather parameters are continuously evaluated leading up to and during flight windows. Operations are paused if thresholds are breached:
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Sustained ground wind velocity strictly under 14 knots (26 km/h)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Visibility greater than 3 kilometers (Visual Meteorological Conditions)</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                  <span>Zero precipitation tolerance (rain, thunderstorm, or heavy mist)</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">3. Certified Remote Pilots in Command (RPIC)</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Every aerial activation is manned by a certified, type-rated Remote Pilot with dedicated spotters.
                The pilot maintains visual line of sight (VLOS) and retains manual override authority throughout the mission.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Pre-flight 24-point airworthiness hardware checklist</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Dedicated perimeter safety marshals at ground launch zones</span>
                </li>
              </ul>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">4. 100% Automated Safety Refund Guarantee</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                We eliminate all commercial incentives to compromise on safety. If our Operations review team or ground pilot cancels or rejects a campaign due to weather, airspace, or technical reasons:
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>100% full refund is programmatically issued to the original payment method</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Zero cancellation fees or administrative penalties for safety holds</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Geo-caging & Hardware Failsafes */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">
              Hardware Geo-Caging & Autonomous Return-to-Home (RTH)
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              All flight display equipment utilizes dual-constellation GNSS (GPS + NavIC) with hardcoded virtual geofence polygons.
              If the drone approaches within 50 meters of a corridor boundary, software locks halt forward velocity.
              In the event of command link degradation or battery threshold (&lt;25%), automated fail-safe Return-to-Home triggers immediately.
            </p>
          </div>

          {/* Safety Contact */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-8 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold">Flight Safety & Regulatory Inquiries</h3>
              <p className="mt-1 text-xs text-slate-400">
                Reach our flight safety oversight committee for NOTAM updates, local authority coordination, or compliance inquiries.
              </p>
            </div>
            <a
              href="mailto:safety@aervy.internal"
              className="inline-flex shrink-0 items-center rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Contact Safety Lead
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Aervy Technologies Pvt Ltd. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
