import Link from "next/link";
import { ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";

export default function SafetyRegulationsPage() {
  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#ebebeb] flex flex-col relative overflow-x-hidden selection:bg-[#ccff00] selection:text-black font-sans">
      
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] glow-sphere-emerald pointer-events-none z-0" />

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
            <Link href="/how-it-works" className="text-[#ebebeb]/70 hover:text-[#ccff00] transition-colors">
              How It Works
            </Link>
            <Link href="/safety" className="text-[#ccff00] font-bold">
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
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-14">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#ccff00] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span>DGCA DRONE RULES 2021 COMPLIANT</span>
          </div>

          <h1 className="font-heading font-bold text-4xl sm:text-6xl tracking-tight text-[#ebebeb]">
            Airspace Safety, Compliance & Regulatory Standards
          </h1>
          <p className="mt-4 text-base text-[#ebebeb]/60 font-normal leading-relaxed">
            Public safety, pre-cleared airspace envelopes, and hardware failsafes are the absolute foundations of every flight window.
          </p>
        </div>

        {/* The Non-Flight Web Boundary Guarantee Box */}
        <div className="rounded-[2.5rem] border border-[#ccff00]/40 bg-[#ccff00]/10 backdrop-blur-[16px] p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#ccff00] mb-3 font-bold">
            <AlertTriangle className="w-4 h-4" />
            [ OPERATIONAL SEPARATION CHARTER ]
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#ebebeb]">
            The Non-Flight Web Boundary Guarantee
          </h2>
          <p className="mt-3 text-sm font-mono text-[#ebebeb]/80 leading-relaxed max-w-4xl">
            The Aervy web application strictly serves as a digital coordination and slot reservation request platform.
            Under no circumstances does our web application control drone hardware or flight telemetry.
            All flight operations are physically conducted by certified Remote Pilots in Command (RPIC).
          </p>
        </div>

        {/* 4 Clean Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 sm:p-10 hover:border-[#ccff00]/40 transition-colors shadow-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
              Pillar 01
            </span>
            <h3 className="mt-3 text-2xl font-heading font-bold text-[#ebebeb]">
              1. DGCA Green Zone Exclusivity
            </h3>
            <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
              Flight corridors operate solely in pre-cleared Green Airspace. Max altitude strictly capped at 400 ft Above Ground Level (AGL).
            </p>
            <div className="mt-5 flex items-center text-xs font-mono text-[#10b981]">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Digital Sky compliant
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 sm:p-10 hover:border-[#ccff00]/40 transition-colors shadow-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
              Pillar 02
            </span>
            <h3 className="mt-3 text-2xl font-heading font-bold text-[#ebebeb]">
              2. Strict Weather Thresholds
            </h3>
            <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
              Sustained ground wind velocity strictly under 14 knots (26 km/h). Visibility &gt; 3 km and zero precipitation tolerance.
            </p>
            <div className="mt-5 flex items-center text-xs font-mono text-[#ccff00]">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Automated weather gate
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 sm:p-10 hover:border-[#ccff00]/40 transition-colors shadow-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
              Pillar 03
            </span>
            <h3 className="mt-3 text-2xl font-heading font-bold text-[#ebebeb]">
              3. Certified Remote Pilots
            </h3>
            <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
              Every operation is managed on site by a DGCA-licensed remote pilot with visual line-of-sight (VLOS) and manual override controls.
            </p>
            <div className="mt-5 flex items-center text-xs font-mono text-[#10b981]">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              On-site pilot in command
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 sm:p-10 hover:border-[#ccff00]/40 transition-colors shadow-xl">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
              Pillar 04
            </span>
            <h3 className="mt-3 text-2xl font-heading font-bold text-[#ebebeb]">
              4. 100% Refund Policy
            </h3>
            <p className="mt-2 text-xs font-mono text-[#ebebeb]/60 leading-relaxed">
              If weather, airspace NOTAM, or safety conditions require a cancellation, a 100% automatic refund is triggered immediately.
            </p>
            <div className="mt-5 flex items-center text-xs font-mono text-[#ccff00]">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Programmatic refund guarantee
            </div>
          </div>
        </div>

        {/* Action CTA */}
        <div className="text-center pt-8">
          <Link
            href="/app/campaigns/new"
            className="inline-flex items-center text-xs font-mono font-bold text-black bg-[#ccff00] hover:bg-white px-8 py-4 rounded-full transition-colors shadow-[0_0_30px_rgba(204,255,0,0.3)] uppercase tracking-wider"
          >
            Deploy Safe Campaign
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

      </main>

      {/* Standard Full-Bleed Footer */}
      <footer className="w-full relative z-30 bg-[#000000] border-t border-white/10 px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#ebebeb]/40">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between">
          <div>© 2026 AERVY TECHNOLOGIES INC.</div>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="/app/campaigns" className="hover:text-white transition-colors">Campaigns</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
