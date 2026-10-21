import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
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
            <span className="text-xs font-medium text-slate-500">How It Works</span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium">
            <Link href="/safety" className="text-slate-500 hover:text-slate-900">
              Safety
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
      <main className="flex-1 py-16 px-6 max-w-4xl mx-auto space-y-16">
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            From Digital Ingestion to Certified Flight Execution
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-500 font-normal leading-relaxed">
            A safe, predictable sequence for reserving and executing aerial display campaigns in metropolitan skies.
          </p>
        </div>

        {/* 4 Clean Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Step 01</span>
            <h3 className="mt-2 text-base font-bold text-slate-900">Creative Upload & Specs</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Upload 1080p banner or 15-second video creative. Automatic checks verify 16:9 aspect ratio and ground visibility safe areas.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Step 02</span>
            <h3 className="mt-2 text-base font-bold text-slate-900">Zone & 15-Min Slot Hold</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Select an approved DGCA Green Zone and flight window. A temporary 15-minute slot hold prevents double-booking.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Step 03</span>
            <h3 className="mt-2 text-base font-bold text-slate-900">Server Quote & Test Escrow</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Deterministic server quote calculated in integer paise with 18% GST. Cryptographically verified before payment.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Step 04</span>
            <h3 className="mt-2 text-base font-bold text-slate-900">Human Safety Review & Flight</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Certified operations team reviews weather (&lt;14 knots) and airspace. 100% automatic refund if flight cannot proceed.
            </p>
          </div>
        </div>

        {/* Minimal Comparison */}
        <div className="rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">
            Aervy Digital Aerial Platform vs Traditional Static Billboards
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Key differences between dynamic drone displays and static out-of-home media.
          </p>

          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Turnaround Time</span>
              <span className="text-blue-600 font-medium sm:text-right">Aervy: 4 to 24 hrs vs Billboards: 2 to 4 weeks</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Location Agility</span>
              <span className="text-blue-600 font-medium sm:text-right">Aervy: Multiple approved city corridors vs Billboards: Single static spot</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-slate-100">
              <span className="font-semibold text-slate-700">Cancellation & Refunds</span>
              <span className="text-blue-600 font-medium sm:text-right">
                100% automated refund on weather/airspace cancellation vs Billboards: Non-refundable
              </span>
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
