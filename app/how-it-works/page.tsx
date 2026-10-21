import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#000000] p-2 sm:p-5 lg:p-8 flex justify-center text-[#ebebeb] selection:bg-[#ccff00] selection:text-black font-sans">
      {/* Floating Shell Container */}
      <div className="w-full max-w-[1600px] rounded-[2.5rem] ring-1 ring-white/10 shadow-2xl bg-[#0c0c0c] overflow-hidden relative flex flex-col justify-between">
        
        {/* Background Grid & Noise */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-80" />
        <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-overlay" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] glow-sphere-lime pointer-events-none" />

        {/* Navigation */}
        <header className="relative z-30 px-6 sm:px-10 py-6 flex items-center justify-between border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ccff00] text-black font-extrabold flex items-center justify-center text-xl shadow-[0_0_20px_rgba(204,255,0,0.4)] font-mono">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl tracking-tighter text-[#ebebeb]">
                AERVY
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#ebebeb]/40">
                AERIAL OS
              </span>
            </div>
          </Link>

          <nav className="hidden sm:flex items-center bg-white/[0.05] backdrop-blur-[16px] border border-white/10 rounded-full px-6 py-2.5 gap-7 text-xs font-medium">
            <Link href="/how-it-works" className="text-[#ccff00]">
              How It Works
            </Link>
            <Link href="/safety" className="text-[#ebebeb]/70 hover:text-[#ccff00] transition-colors">
              Safety & Regulations
            </Link>
            <Link href="/app/campaigns" className="text-[#ebebeb]/70 hover:text-[#ccff00] transition-colors">
              Track Campaigns
            </Link>
            <Link href="/ops/campaigns" className="text-[#ebebeb]/70 hover:text-[#ccff00] transition-colors">
              Ops Queue
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center justify-center bg-[#ccff00] text-black hover:bg-white font-mono font-bold text-xs px-5 py-2.5 rounded-full transition-all duration-200"
            >
              New Campaign
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-20 flex-1 py-16 px-6 sm:px-12 max-w-5xl mx-auto space-y-16">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#ccff00] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              <span>STANDARDIZED OPERATIONAL LIFECYCLE</span>
            </div>

            <h1 className="font-heading font-bold text-4xl sm:text-6xl tracking-tight text-[#ebebeb]">
              From Digital Ingestion to Certified Flight Execution
            </h1>
            <p className="mt-4 text-base text-[#ebebeb]/60 font-normal leading-relaxed">
              A high-precision, automated workflow for reserving, vetting, and executing aerial display flights across metropolitan corridors.
            </p>
          </div>

          {/* 4 Obsidian Glass Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-8 hover:border-[#ccff00]/40 transition-colors">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
                Step 01
              </span>
              <h3 className="mt-2 text-xl font-heading font-bold text-[#ebebeb]">
                Creative Upload & Specs
              </h3>
              <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
                Upload 1080p banner or 15-second video creative. Automatic checks verify 16:9 aspect ratio and ground visibility safe areas.
              </p>
            </div>

            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-8 hover:border-[#ccff00]/40 transition-colors">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
                Step 02
              </span>
              <h3 className="mt-2 text-xl font-heading font-bold text-[#ebebeb]">
                Zone & 15-Min Slot Hold
              </h3>
              <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
                Select an approved DGCA Green Zone and flight window. A temporary 15-minute slot hold prevents double-booking.
              </p>
            </div>

            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-8 hover:border-[#ccff00]/40 transition-colors">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
                Step 03
              </span>
              <h3 className="mt-2 text-xl font-heading font-bold text-[#ebebeb]">
                Server Quote & Test Escrow
              </h3>
              <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
                Deterministic server quote calculated in integer paise with 18% GST. Cryptographically verified before payment.
              </p>
            </div>

            <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-8 hover:border-[#ccff00]/40 transition-colors">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
                Step 04
              </span>
              <h3 className="mt-2 text-xl font-heading font-bold text-[#ebebeb]">
                Human Safety Review & Flight
              </h3>
              <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
                Certified operations team reviews weather (&lt;14 knots) and airspace. 100% automatic refund if flight cannot proceed.
              </p>
            </div>
          </div>

          {/* Contrast Comparison Card */}
          <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-8 sm:p-10 relative overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#ebebeb]">
              Aervy Digital Aerial Platform vs Traditional Static Billboards
            </h2>
            <p className="text-xs font-mono text-[#ebebeb]/50 mt-1 mb-8">
              Key operational differences between programmatic drone displays and static outdoor billboards.
            </p>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-white/10">
                <span className="text-[#ebebeb]/60 uppercase tracking-wider">Turnaround Time</span>
                <span className="text-[#ccff00] font-bold sm:text-right mt-1 sm:mt-0">
                  Aervy: 4 to 24 hrs vs Billboards: 2 to 4 weeks
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-white/10">
                <span className="text-[#ebebeb]/60 uppercase tracking-wider">Location Agility</span>
                <span className="text-[#ccff00] font-bold sm:text-right mt-1 sm:mt-0">
                  Aervy: Multiple approved city corridors vs Billboards: Single static spot
                </span>
              </div>
              <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-white/10">
                <span className="text-[#ebebeb]/60 uppercase tracking-wider">Cancellation & Refunds</span>
                <span className="text-[#ccff00] font-bold sm:text-right mt-1 sm:mt-0">
                  100% automated refund on weather/airspace cancellation vs Billboards: Non-refundable
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-mono text-[#ebebeb]/50">
                NON-FLIGHT BOUNDARY GUARANTEE ENFORCED ON EVERY SUBMISSION
              </span>
              <Link
                href="/app/campaigns/new"
                className="inline-flex items-center text-xs font-mono font-bold text-black bg-[#ccff00] hover:bg-white px-5 py-2.5 rounded-full transition-colors"
              >
                Plan Flight Campaign
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

        </main>

        {/* Minimal Footer */}
        <footer className="relative z-30 px-6 sm:px-10 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#ebebeb]/40">
          <div>© 2026 AERVY TECHNOLOGIES INC.</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/safety" className="hover:text-white">Safety</Link>
            <Link href="/app/campaigns" className="hover:text-white">Campaigns</Link>
          </div>
        </footer>

      </div>
    </div>
  );
}
