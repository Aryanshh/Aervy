import Link from "next/link";
import { ShieldCheck, MapPin, Clock, UploadCloud, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tight text-blue-600">Aervy</span>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
              Web MVP
            </span>
          </div>
          <nav className="flex items-center space-x-4">
            <Link
              href="/app/dashboard"
              className="text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Advertiser Portal
            </Link>
            <Link
              href="/ops/campaigns"
              className="text-sm font-medium text-slate-700 hover:text-blue-600"
            >
              Operations Review
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                Operations Platform — Safety First
              </div>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                Dynamic Aerial Advertising <br />
                <span className="text-blue-600">Managed with Digital Precision</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
                Plan, upload, schedule, and review aerial campaigns in approved zones.
                A digital-first workflow built for advertisers and flight operations teams.
              </p>

              {/* Safety Boundary Banner */}
              <div className="mx-auto mt-8 max-w-xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
                <p className="font-semibold">⚠️ Safety & Regulatory Boundary:</p>
                <p className="mt-1">
                  Submitting a campaign on Aervy is a <strong>request</strong> for review, never a
                  flight authorization. Actual flight deployment is subject to airspace permissions,
                  weather clearance, and trained human operations approval.
                </p>
              </div>

              {/* CTAs */}
              <div className="mt-10 flex items-center justify-center gap-x-4">
                <Link
                  href="/app/campaigns/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Create Campaign Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/ops/campaigns"
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Operations Dashboard
                </Link>
              </div>
            </div>

            {/* Workflow Steps Preview */}
            <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-900">1. Upload Creative</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Provide verified banner assets, titles, and call-to-action text for review.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-900">2. Choose Location</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Select from admin-defined approved zones with clear airspace boundaries.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-900">3. Select Schedule</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Pick date windows with live slot availability checks and automatic holds.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-900">4. Review & Pay</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Transparent server-computed quotes in integer paise with automatic refund rules.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Aervy Technologies. All rights reserved.</p>
          <p className="mt-1">
            Aervy Web Platform coordinates campaign requests. Real flight operations require separate
            pilot, weather, and regulatory clearance.
          </p>
        </div>
      </footer>
    </div>
  );
}
