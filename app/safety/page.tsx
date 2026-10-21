import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function SafetyRegulationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
              Aervy
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-slate-500">Safety Policy</span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <Link href="/how-it-works" className="text-slate-500 hover:text-slate-900">
              How It Works
            </Link>
            <Link
              href="/app/campaigns/new"
              className="rounded-full bg-slate-900 px-3.5 py-1.5 text-white hover:bg-slate-800"
            >
              New Campaign
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-16 px-6 max-w-4xl mx-auto space-y-14">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Airspace Safety, Compliance & Regulatory Standards
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
            Public safety and regulatory adherence are non-negotiable foundations of every flight window.
          </p>
        </div>

        {/* The Non-Flight Web Boundary Guarantee Box */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-6 sm:p-8">
          <h2 className="text-base font-bold text-amber-950">
            The Non-Flight Web Boundary Guarantee
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-amber-900 leading-relaxed">
            The Aervy web application strictly serves as a digital coordination and slot reservation request platform.
            Under no circumstances does our web application control drone hardware or flight telemetry.
            All flight operations are physically conducted by certified Remote Pilots in Command (RPIC).
          </p>
        </div>

        {/* 4 Clean Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">1. DGCA Green Zone Exclusivity</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Flight corridors operate solely in pre-cleared Green Airspace. Max altitude strictly capped at 400 ft Above Ground Level (AGL).
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-emerald-600">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Digital Sky compliant
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">2. Strict Weather Thresholds</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Sustained ground wind velocity strictly under 14 knots (26 km/h). Visibility &gt; 3 km and zero precipitation tolerance.
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-blue-600">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Automated weather gate
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">3. Certified Remote Pilots</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Every operation is managed on site by a DGCA-licensed remote pilot with visual line-of-sight (VLOS) and manual override controls.
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-indigo-600">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              On-site pilot in command
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">4. 100% Refund Policy</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              If weather, airspace NOTAM, or safety conditions require a cancellation, a 100% automatic refund is triggered immediately.
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-emerald-600">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Programmatic refund guarantee
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/app/campaigns/new"
            className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all"
          >
            Create Campaign Request
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-6 px-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Aervy Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}
