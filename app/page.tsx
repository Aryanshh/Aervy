import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Sleek Minimal Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
              Aervy
            </Link>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
              Airspace Platform
            </span>
          </div>

          <nav className="hidden sm:flex items-center space-x-7 text-xs font-medium text-slate-500">
            <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">
              How It Works
            </Link>
            <Link href="/safety" className="hover:text-slate-900 transition-colors">
              Safety & Regulations
            </Link>
            <Link href="/app/campaigns" className="hover:text-slate-900 transition-colors">
              Track Campaigns
            </Link>
            <Link href="/ops/campaigns" className="hover:text-slate-900 transition-colors">
              Ops Queue
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/auth/sign-in"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800 transition-all"
            >
              New Campaign
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Minimal Hero Section */}
        <section className="relative px-6 pt-20 pb-16 sm:pt-28 sm:pb-24 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-medium text-slate-600 mb-8">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
            DGCA Green Airspace • Verified Human Operations
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
            Dynamic Aerial Advertising, <br className="hidden sm:inline" />
            <span className="text-blue-600">simplified and safe.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed">
            Reserve drone display flights in pre-cleared metropolitan corridors.
            Transparent hourly pricing, automated slot holds, and human safety review.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center rounded-full bg-blue-600 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all"
            >
              Request a Campaign
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all"
            >
              Explore Demo Switcher
            </Link>
          </div>

          {/* Calm Boundary Note */}
          <p className="mt-6 text-[11px] text-slate-400 max-w-xl mx-auto">
            Submitting a campaign on Aervy represents an operational request for feasibility review, never an automated flight authorization.
          </p>
        </section>

        {/* 3-Step Simple Flow */}
        <section className="border-t border-slate-100 bg-slate-50/50 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Simple 3-Step Workflow
              </h2>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                How a flight request works
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                  1
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">Upload Creative</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Provide your 1080p banner or 15-second visual asset for instant aspect ratio validation.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                  2
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">Pick Zone & Slot</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Choose an approved Green Zone corridor. Your slot is temporarily held for 15 minutes.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                  3
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">Safety Review</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Our operations team validates weather and airspace. 100% refund if conditions prevent flight.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Approved Corridors */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Approved Flight Zones
                </h2>
                <p className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Pre-cleared metropolitan corridors
                </p>
              </div>
              <Link
                href="/app/campaigns/new"
                className="mt-4 sm:mt-0 text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center"
              >
                View all zones <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  city: "Bengaluru",
                  name: "MG Road Commercial Corridor",
                  rate: "₹4,500/hr",
                  status: "Green Zone",
                },
                {
                  city: "Mumbai",
                  name: "BKC Financial Plaza",
                  rate: "₹6,000/hr",
                  status: "Green Zone",
                },
                {
                  city: "Hyderabad",
                  name: "Hitec City Cyber Towers",
                  rate: "₹4,000/hr",
                  status: "Green Zone",
                },
              ].map((zone, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                        {zone.city}
                      </span>
                      <span className="font-bold text-blue-600">{zone.rate}</span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-slate-900">{zone.name}</h3>
                    <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      {zone.status} Verified
                    </p>
                  </div>

                  <Link
                    href="/app/campaigns/new"
                    className="mt-6 inline-flex items-center text-xs font-semibold text-slate-700 hover:text-blue-600"
                  >
                    Select this corridor <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Minimal CTA */}
        <section className="border-t border-slate-100 bg-slate-950 py-16 px-6 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to schedule an aerial campaign?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-400">
              Upload your creative and get a server-verified quote in minutes.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                href="/app/campaigns/new"
                className="rounded-full bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-all"
              >
                Create Campaign Request
              </Link>
              <Link
                href="/safety"
                className="rounded-full border border-slate-800 bg-slate-900 px-5 py-2.5 text-xs font-medium text-slate-300 hover:text-white transition-all"
              >
                Safety Policy
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-100 bg-white py-8 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Aervy Technologies. All rights reserved.</p>
          <div className="flex space-x-6 text-slate-400">
            <Link href="/how-it-works" className="hover:text-slate-700">
              How It Works
            </Link>
            <Link href="/safety" className="hover:text-slate-700">
              Safety
            </Link>
            <Link href="/auth/sign-in" className="hover:text-slate-700">
              Demo Switcher
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
