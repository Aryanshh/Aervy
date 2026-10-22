import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#ebebeb] flex flex-col relative overflow-x-hidden selection:bg-[#ccff00] selection:text-black font-sans">
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] glow-sphere-lime pointer-events-none z-0" />

      {/* Standard Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-[#000000]/85 backdrop-blur-[16px] border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#ccff00] text-black font-extrabold flex items-center justify-center text-xl shadow-[0_0_20px_rgba(204,255,0,0.4)] group-hover:scale-105 transition-transform font-mono">
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

          <nav className="hidden sm:flex items-center bg-white/[0.04] backdrop-blur-[16px] border border-white/10 rounded-full px-7 py-2.5 gap-8 text-xs font-medium">
            <Link href="/how-it-works" className="text-[#ccff00] font-bold">
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
              className="inline-flex items-center justify-center bg-[#ccff00] text-black hover:bg-white font-mono font-bold text-xs px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm"
            >
              New Campaign
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
        
        {/* Intro */}
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
          <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 sm:p-10 hover:border-[#ccff00]/40 transition-colors shadow-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
              Step 01
            </span>
            <h3 className="mt-3 text-2xl font-heading font-bold text-[#ebebeb]">
              Creative Upload & Specs
            </h3>
            <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
              Upload 1080p banner or 15-second video creative. Automatic checks verify 16:9 aspect ratio and ground visibility safe areas.
            </p>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 sm:p-10 hover:border-[#ccff00]/40 transition-colors shadow-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
              Step 02
            </span>
            <h3 className="mt-3 text-2xl font-heading font-bold text-[#ebebeb]">
              Zone & 15-Min Slot Hold
            </h3>
            <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
              Select an approved DGCA Green Zone and flight window. A temporary 15-minute slot hold prevents double-booking.
            </p>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 sm:p-10 hover:border-[#ccff00]/40 transition-colors shadow-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
              Step 03
            </span>
            <h3 className="mt-3 text-2xl font-heading font-bold text-[#ebebeb]">
              Server Quote & Test Escrow
            </h3>
            <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
              Deterministic server quote calculated in integer paise with 18% GST. Cryptographically verified before payment.
            </p>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 sm:p-10 hover:border-[#ccff00]/40 transition-colors shadow-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
              Step 04
            </span>
            <h3 className="mt-3 text-2xl font-heading font-bold text-[#ebebeb]">
              Human Safety Review & Flight
            </h3>
            <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
              Certified operations team reviews weather (&lt;14 knots) and airspace. 100% automatic refund if flight cannot proceed.
            </p>
          </div>
        </div>

        {/* Contrast Comparison Card */}
        <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-[#ccff00]" />
            <span className="font-mono text-xs text-[#ccff00] uppercase tracking-widest font-bold">
              PLATFORM SPECIFICATION
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#ebebeb]">
            Aervy Digital Aerial Platform vs Traditional Static Billboards
          </h2>
          <p className="text-xs font-mono text-[#ebebeb]/50 mt-1 mb-10">
            Key operational differences between programmatic drone displays and static outdoor billboards.
          </p>

          <div className="space-y-5 text-xs font-mono">
            <div className="flex flex-col sm:flex-row justify-between pb-5 border-b border-white/10">
              <span className="text-[#ebebeb]/60 uppercase tracking-wider">Turnaround Time</span>
              <span className="text-[#ccff00] font-bold sm:text-right mt-1 sm:mt-0">
                Aervy: 4 to 24 hrs vs Billboards: 2 to 4 weeks
              </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between pb-5 border-b border-white/10">
              <span className="text-[#ebebeb]/60 uppercase tracking-wider">Location Agility</span>
              <span className="text-[#ccff00] font-bold sm:text-right mt-1 sm:mt-0">
                Aervy: Multiple approved city corridors vs Billboards: Single static spot
              </span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between pb-5 border-b border-white/10">
              <span className="text-[#ebebeb]/60 uppercase tracking-wider">Cancellation & Refunds</span>
              <span className="text-[#ccff00] font-bold sm:text-right mt-1 sm:mt-0">
                100% automated refund on weather/airspace cancellation vs Billboards: Non-refundable
              </span>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-mono text-[#ebebeb]/50">
              NON-FLIGHT BOUNDARY GUARANTEE ENFORCED ON EVERY SUBMISSION
            </span>
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center text-xs font-mono font-bold text-black bg-[#ccff00] hover:bg-white px-6 py-3 rounded-full transition-colors shadow-[0_0_20px_rgba(204,255,0,0.25)]"
            >
              Plan Flight Campaign
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </main>

      {/* Standard Full-Bleed Footer */}
      <footer className="w-full relative z-30 bg-[#000000] border-t border-white/10 px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#ebebeb]/40">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between">
          <div>© 2026 AERVY TECHNOLOGIES INC.</div>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/safety" className="hover:text-white transition-colors">Safety</Link>
            <Link href="/app/campaigns" className="hover:text-white transition-colors">Campaigns</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
