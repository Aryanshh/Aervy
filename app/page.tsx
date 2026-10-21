import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Activity,
  Navigation as NavIcon,
  Sparkles,
} from "lucide-react";
import {
  NeonPulseButton,
  SystemStatusTag,
} from "@/components/ui/obsidian-components";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#ebebeb] flex flex-col relative overflow-x-hidden selection:bg-[#ccff00] selection:text-black font-sans">
      
      {/* Background Grid Pattern & Noise Spanning Full Viewport */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-80 z-0" />
      <div className="fixed inset-0 bg-noise pointer-events-none mix-blend-overlay z-0" />

      {/* Atmospheric Glow Spheres */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] glow-sphere-lime pointer-events-none z-0" />
      <div className="absolute top-[35%] -right-40 w-[700px] h-[700px] glow-sphere-emerald pointer-events-none z-0" />
      <div className="absolute bottom-10 left-[15%] w-[600px] h-[600px] glow-sphere-lime pointer-events-none opacity-40 z-0" />

      {/* Standard Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-[#000000]/85 backdrop-blur-[16px] border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo Left */}
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

          {/* Center: Pill-shaped navigation bar */}
          <nav className="hidden md:flex items-center bg-white/[0.04] backdrop-blur-[16px] border border-white/10 rounded-full px-7 py-2.5 gap-8 text-xs font-medium tracking-wide">
            <Link
              href="/how-it-works"
              className="text-[#ebebeb]/70 hover:text-[#ccff00] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/safety"
              className="text-[#ebebeb]/70 hover:text-[#ccff00] transition-colors"
            >
              Safety & Regulations
            </Link>
            <Link
              href="/app/campaigns"
              className="text-[#ebebeb]/70 hover:text-[#ccff00] transition-colors"
            >
              Track Campaigns
            </Link>
            <Link
              href="/ops/campaigns"
              className="text-[#ebebeb]/70 hover:text-[#ccff00] transition-colors"
            >
              Ops Queue
            </Link>
          </nav>

          {/* Right Side: Status Tag & Sign In */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:block bg-white/[0.03] backdrop-blur-[16px] border border-white/10 px-4 py-2 rounded-full">
              <SystemStatusTag label="SYS: DGCA_CORRIDORS_ACTIVE" />
            </div>

            <Link
              href="/auth/sign-in"
              className="inline-flex items-center justify-center bg-white text-black hover:bg-[#ccff00] hover:text-black font-mono font-bold text-xs px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm"
            >
              Sign In
            </Link>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col w-full">
        
        {/* Hero Section: Split 12-Column Grid */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left Column (7 cols): Giant Typography */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* AI / Aerial OS Label */}
              <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#ccff00] bg-white/[0.03] backdrop-blur-[16px] border border-white/10 px-4 py-1.5 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                <span>AI AIRSPACE OS // METROPOLITAN CORRIDORS</span>
              </div>

              {/* Giant Heading */}
              <h1 className="font-heading font-bold text-5xl sm:text-7xl lg:text-[6.8rem] tracking-[-0.06em] leading-[0.88] text-[#ebebeb] mb-6">
                Dynamic Aerial Advertising, <br className="hidden sm:inline" />
                <span className="italic bg-gradient-to-r from-[#ccff00] via-[#ccff00] to-white bg-clip-text text-transparent">
                  engineered for the sky.
                </span>
              </h1>

              {/* Body Text */}
              <p className="text-base sm:text-lg text-[#ebebeb]/60 max-w-xl font-normal leading-relaxed mb-8">
                Autonomous aerial media arrays across DGCA-cleared metropolitan corridors.
                High-luminance LED matrices with real-time wind telemetry, instant escrow holds, and human safety approval.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <NeonPulseButton href="/app/campaigns/new">
                  Deploy Flight Campaign
                  <ArrowRight className="ml-2 h-4 w-4" />
                </NeonPulseButton>

                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center bg-white/[0.03] text-[#ebebeb] hover:bg-white/[0.08] hover:border-[#ccff00]/40 backdrop-blur-[16px] border border-white/10 rounded-full px-7 py-4 text-sm font-medium tracking-wide transition-all duration-200"
                >
                  Explore Airspace Corridors
                </Link>
              </div>

              {/* Mandatory Safety Boundary Note */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md max-w-xl">
                <Shield className="h-4 w-4 text-[#ccff00] shrink-0 mt-0.5" />
                <p className="text-[11px] font-mono leading-relaxed text-[#ebebeb]/50">
                  Submitting a campaign on Aervy represents an operational request, not an automatic flight clearance. All flights operate strictly within DGCA Green Zones with certified dual-pilots.
                </p>
              </div>

            </div>

            {/* Right Column (5 cols): Interactive Glassmorphism Mockup Shell */}
            <div className="lg:col-span-5 relative">
              {/* Floating AI Cursor Label */}
              <div className="absolute -top-4 -right-2 z-30 bg-[#ccff00] text-black text-[10px] font-mono font-bold px-3 py-1 rounded-full shadow-[0_0_20px_rgba(204,255,0,0.6)] flex items-center gap-1.5 animate-pulse-glow">
                <Sparkles className="w-3 h-3" />
                AI CURSOR // 99.4% CLEARANCE
              </div>

              {/* Outer Glass Mockup Shell */}
              <div className="bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-6 relative shadow-2xl overflow-hidden ring-1 ring-white/10">
                
                {/* Subtle Grid Inside Shell */}
                <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

                {/* Shell Window Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" />
                    <span className="ml-2 font-mono text-[10px] uppercase text-[#ebebeb]/50">
                      NODE // BLR-GREEN-081
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/30 px-2 py-0.5 rounded-full">
                    TELEMETRY_SYNCED
                  </span>
                </div>

                {/* Floating Card 1: Telemetry Radar */}
                <div className="bg-white/[0.04] backdrop-blur-[16px] border border-white/10 rounded-2xl p-4 mt-5 shadow-xl animate-float relative z-10 hover:border-[#ccff00]/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#ccff00]" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#ebebeb]">
                        AIRSPACE CORRIDOR TELEMETRY
                      </span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
                      <div className="text-[10px] text-[#ebebeb]/40 uppercase">Ground Wind</div>
                      <div className="text-sm font-bold text-[#ebebeb] mt-0.5">5.8 KTS</div>
                      <div className="text-[9px] text-[#10b981]">SAFE (&lt; 14 KTS)</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
                      <div className="text-[10px] text-[#ebebeb]/40 uppercase">DGCA Airspace</div>
                      <div className="text-sm font-bold text-[#ccff00] mt-0.5">GREEN ZONE</div>
                      <div className="text-[9px] text-[#ebebeb]/60">NO PERMIT DELAY</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
                      <div className="text-[10px] text-[#ebebeb]/40 uppercase">Luminance Array</div>
                      <div className="text-sm font-bold text-[#ebebeb] mt-0.5">45,000 NITS</div>
                      <div className="text-[9px] text-[#10b981]">HIGH DAYLIGHT VIS</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/50 border border-white/5">
                      <div className="text-[10px] text-[#ebebeb]/40 uppercase">Escrow Protocol</div>
                      <div className="text-sm font-bold text-[#ebebeb] mt-0.5">LOCKED</div>
                      <div className="text-[9px] text-[#ebebeb]/60">100% REFUND SAFE</div>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2: Mission Path Visualizer */}
                <div className="bg-white/[0.04] backdrop-blur-[16px] border border-white/10 rounded-2xl p-4 mt-4 shadow-xl animate-float-delayed relative z-10 hover:border-[#ccff00]/40 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <NavIcon className="w-4 h-4 text-[#10b981]" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#ebebeb]">
                        BANGALORE MG ROAD CORRIDOR
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#ebebeb]/50">ALT: 120M AGL</span>
                  </div>

                  {/* Flight Path Mock Progress */}
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden my-2">
                    <div className="h-full bg-gradient-to-r from-[#ccff00] to-[#10b981] w-[78%] rounded-full" />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-[#ebebeb]/60">
                    <span>COORDINATES: 12.9716°N, 77.5946°E</span>
                    <span className="text-[#ccff00]">LIVE TRANSMISSION</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section className="w-full border-t border-white/5 py-24 bg-[#0a0a0a]/60 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-left">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-[#ccff00] mb-2">
                [ BENTO AIRSPACE ARCHITECTURE ]
              </div>
              <h2 className="font-heading font-bold text-3xl sm:text-5xl tracking-tight text-[#ebebeb]">
                Engineered for High-Stakes Public Aerial Media
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Large Card: Spans 2x2 with Internal Data Visualization */}
              <div className="lg:col-span-2 lg:row-span-2 rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 sm:p-10 flex flex-col justify-between hover:border-[#ccff00]/40 transition-all duration-300 relative overflow-hidden group shadow-2xl">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ccff00]">
                      [ TELEMETRY SPECTRUM ANALYSIS ]
                    </span>
                    <span className="font-mono text-xs bg-white/5 px-2.5 py-1 rounded-full text-[#ebebeb]/70">
                      REAL-TIME STREAM
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-2xl sm:text-3xl text-[#ebebeb] mb-3">
                    Luminance Array Dynamic Frequency
                  </h3>
                  <p className="text-sm text-[#ebebeb]/60 max-w-md mb-8 leading-relaxed">
                    Adaptive luminance control adjusts 45,000-nit aerial LEDs to metropolitan ambient light levels, wind shears, and optical angles.
                  </p>

                  {/* Vertical Data Visualization Bars */}
                  <div className="bg-black/60 rounded-2xl p-6 border border-white/5">
                    <div className="flex items-end justify-between h-44 gap-2 px-2">
                      {[42, 65, 88, 55, 92, 70, 84, 98, 76, 89, 64, 95, 78, 100].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                          <div className="w-full bg-white/5 rounded-t-sm h-full flex items-end">
                            <div
                              className="w-full bg-gradient-to-t from-[#10b981] to-[#ccff00] rounded-t-sm transition-all duration-500 group-hover/bar:brightness-125"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-[8px] font-mono text-[#ebebeb]/30 hidden sm:inline">
                            0{i + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/10 text-xs font-mono text-[#ebebeb]/60">
                      <span>SPECTRUM: 5.8 GHZ AES-256</span>
                      <span className="text-[#ccff00]">SYNC: 99.8% OPTIMAL</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between text-xs font-mono text-[#ebebeb]/50 pt-4 border-t border-white/5 relative z-10">
                  <span>METRIC: 100% REVERSIBLE ESCROW</span>
                  <span className="text-[#10b981]">STATUS: OPERATIONAL</span>
                </div>
              </div>

              {/* Tall Card: Spans 1x2 with Token / Color Swatches */}
              <div className="lg:col-span-1 lg:row-span-2 rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 flex flex-col justify-between hover:border-[#ccff00]/40 transition-all duration-300 relative overflow-hidden shadow-2xl">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ccff00] mb-3">
                    [ DESIGN TOKENS ]
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[#ebebeb] mb-3">
                    High-Contrast Hardware Tokens
                  </h3>
                  <p className="text-xs text-[#ebebeb]/60 mb-6 leading-relaxed">
                    Industrial color palette built for cockpit readability and dark-mode precision.
                  </p>

                  {/* Swatch List */}
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/50 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] border border-white/20 shrink-0" />
                      <div>
                        <div className="text-[#ebebeb] font-bold">#0a0a0a</div>
                        <div className="text-[10px] text-[#ebebeb]/40 uppercase">Obsidian Base</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/50 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-[#ccff00] shrink-0 shadow-[0_0_12px_rgba(204,255,0,0.5)]" />
                      <div>
                        <div className="text-[#ccff00] font-bold">#ccff00</div>
                        <div className="text-[10px] text-[#ebebeb]/40 uppercase">Neon Lime Accent</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/50 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-[#10b981] shrink-0" />
                      <div>
                        <div className="text-[#10b981] font-bold">#10b981</div>
                        <div className="text-[10px] text-[#ebebeb]/40 uppercase">Emerald Glow</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-black/50 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-[#ebebeb] shrink-0" />
                      <div>
                        <div className="text-[#ebebeb] font-bold">#ebebeb</div>
                        <div className="text-[10px] text-[#ebebeb]/40 uppercase">Signal White</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 text-[11px] font-mono text-[#ccff00]">
                  DGCA GREEN ZONE: 100% COMPLIANT
                </div>
              </div>

              {/* Accent Card: Solid #ccff00 with Black Text & Noise */}
              <div className="rounded-[2.5rem] bg-[#ccff00] text-black p-8 flex flex-col justify-between shadow-[0_0_40px_rgba(204,255,0,0.25)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-noise opacity-30 mix-blend-multiply pointer-events-none" />

                <div className="relative z-10">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/70 mb-2">
                    [ ABSOLUTE SAFETY PLEDGE ]
                  </div>
                  <h3 className="font-heading font-black text-2xl text-black leading-tight mb-3">
                    Non-Flight Web Boundary Guarantee
                  </h3>
                  <p className="text-xs font-medium text-black/80 leading-relaxed mb-4">
                    Submitting a campaign on Aervy represents an operational request. If weather, airspace restrictions, or safety boundaries mandate abort, funds are 100% refunded instantly.
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-black/15 font-mono text-[10px] font-bold tracking-wider uppercase text-black/80">
                  ZERO RISK // ESCROW REVERSAL
                </div>
              </div>

              {/* Card 4: Operations & Certified Pilots */}
              <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-8 flex flex-col justify-between hover:border-[#ccff00]/40 transition-all duration-300 shadow-2xl">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#ccff00] mb-3">
                    [ HUMAN PROTOCOL ]
                  </div>
                  <h3 className="font-heading font-bold text-xl text-[#ebebeb] mb-2">
                    Dual-Command Remote Pilot Verification
                  </h3>
                  <p className="text-xs text-[#ebebeb]/60 leading-relaxed mb-4">
                    Every scheduled coordinate corridor is assigned two certified DGCA Remote Pilot License holders with physical kill-switches.
                  </p>
                </div>

                <div className="space-y-2 font-mono text-[10px] text-[#ebebeb]/70">
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>PILOT LICENSES</span>
                    <span className="text-[#10b981]">DGCA-RPL 100%</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-white/5">
                    <span>GEOFENCE ENFORCEMENT</span>
                    <span className="text-[#ccff00]">HARDWARE HARD-LOCKED</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>WEATHER CUTOFF</span>
                    <span className="text-[#ebebeb]">&lt; 14 KTS STRICT</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Contrast Methodology Section: Full-Width Light Grey Band */}
        <section className="w-full bg-[#e5e5e5] text-black rounded-t-[3.5rem] sm:rounded-t-[4.5rem] py-24 px-4 sm:px-6 lg:px-8 relative z-20 shadow-2xl">
          <div className="max-w-7xl mx-auto">
            
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-black/60 mb-2">
                  [ METHODOLOGY & EXECUTION ]
                </div>
                <h2 className="font-heading font-bold text-3xl sm:text-5xl tracking-tight text-black">
                  From Creative Ingestion to Certified Flight
                </h2>
              </div>
              <p className="text-sm font-medium text-black/60 max-w-sm">
                Four rigorous phases ensuring absolute airspace integrity, zero regulatory delays, and guaranteed visibility.
              </p>
            </div>

            {/* Split Content: Numbered List & Portrait / Orb */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left (7 cols): Numbered Step List */}
              <div className="lg:col-span-7 space-y-8">
                {[
                  {
                    num: "01",
                    title: "Digital Ingestion & Vector Optimization",
                    desc: "Upload brand visuals or video assets. Our pipeline automatically formats content for high-density LED pitch and optical contrast.",
                  },
                  {
                    num: "02",
                    title: "DGCA Green Zone Corridor Reservation",
                    desc: "Select pre-mapped metropolitan corridors. The platform locks your time window without long government paperwork delays.",
                  },
                  {
                    num: "03",
                    title: "Operations & Dual-Pilot Review",
                    desc: "A licensed human Operations Lead inspects weather envelopes, NOTAM advisories, and corridor clearances before flight sign-off.",
                  },
                  {
                    num: "04",
                    title: "Autonomous Flight & Proof of Performance",
                    desc: "Drones execute precision synchronized flight patterns with telemetry-logged 4K video receipts uploaded to your advertiser dashboard.",
                  },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center font-mono font-bold text-lg shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xl text-black mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-black/70 leading-relaxed font-normal">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right (5 cols): Drone Telemetry Orb with Glassmorphic Testimonial */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="w-72 h-72 sm:w-88 sm:h-88 rounded-full border-4 border-black/10 overflow-hidden relative shadow-2xl bg-gradient-to-tr from-slate-400 via-slate-300 to-slate-100 flex items-center justify-center">
                  {/* Visual Orb Rings */}
                  <div className="absolute inset-4 rounded-full border border-black/15 animate-spin duration-[20s]" />
                  <div className="absolute inset-12 rounded-full border border-black/20" />
                  <div className="w-28 h-28 rounded-full bg-black flex items-center justify-center text-[#ccff00] font-mono font-bold text-xs text-center p-3 shadow-2xl">
                    DGCA GREEN ZONE
                  </div>
                </div>

                {/* Glassmorphism Testimonial Overlay */}
                <div className="absolute -bottom-6 -right-2 sm:-right-4 bg-black/90 backdrop-blur-[16px] text-[#ebebeb] border border-white/20 rounded-2xl p-6 shadow-2xl max-w-xs sm:max-w-sm">
                  <p className="text-xs font-normal leading-relaxed text-[#ebebeb]/90 mb-3">
                    “Aervy’s guaranteed Green Zone corridors eliminated regulatory friction for our Bangalore product launch. 100% safety precision.”
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#ebebeb]/50 pt-2 border-t border-white/10">
                    <span className="text-[#ccff00]">OPERATIONS VERIFIED</span>
                    <span>BENGALURU AIRSPACE</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* Standard Full-Bleed Footer: Obsidian #000000 */}
      <footer className="w-full relative z-30 bg-[#000000] border-t border-white/10 px-4 sm:px-6 lg:px-8 pt-24 pb-12 overflow-hidden">
        
        {/* Massive Background Watermark 'AERVY' */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9rem] sm:text-[14rem] lg:text-[18rem] font-heading font-black tracking-tighter text-white/[0.03] select-none pointer-events-none leading-none">
          AERVY
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* CTA Section */}
          <div className="text-center mb-20 pb-16 border-b border-white/10">
            <h2 className="font-heading font-bold text-3xl sm:text-5xl text-[#ebebeb] mb-4">
              Ready to illuminate metropolitan skies?
            </h2>
            <p className="text-base text-[#ebebeb]/60 max-w-lg mx-auto mb-8 font-normal">
              Reserve approved drone flight corridors in minutes. Automated pricing, human flight review, zero ambiguity.
            </p>
            
            {/* Oversized Lime Button with Hover Transition */}
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center justify-center bg-[#ccff00] text-black font-heading font-bold text-lg sm:text-xl rounded-full px-12 py-5 shadow-[0_0_50px_rgba(204,255,0,0.35)] hover:bg-white hover:text-black transition-all duration-300 font-mono uppercase tracking-wider"
            >
              Launch Campaign
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>

          {/* 3-Column Footer Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#ccff00] text-black font-extrabold flex items-center justify-center text-sm font-mono">
                  A
                </div>
                <span className="font-heading font-bold text-lg tracking-tight text-[#ebebeb]">
                  AERVY AIRSPACE
                </span>
              </div>
              <p className="text-xs text-[#ebebeb]/50 leading-relaxed font-mono">
                Autonomous aerial media platforms operated in strict compliance with DGCA Drone Rules 2021.
              </p>
            </div>

            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#ccff00] mb-4">
                Safety & Compliance
              </h4>
              <ul className="space-y-2.5 text-xs font-mono text-[#ebebeb]/60">
                <li>
                  <Link href="/safety" className="hover:text-white transition-colors">
                    DGCA Green Zones
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-white transition-colors">
                    Weather Envelope Criteria
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-white transition-colors">
                    Non-Flight Escrow Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-[#ccff00] mb-4">
                Platform Portals
              </h4>
              <ul className="space-y-2.5 text-xs font-mono text-[#ebebeb]/60">
                <li>
                  <Link href="/app/campaigns" className="hover:text-white transition-colors">
                    Advertiser Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/ops/campaigns" className="hover:text-white transition-colors">
                    Operations Safety Queue
                  </Link>
                </li>
                <li>
                  <Link href="/auth/sign-in" className="hover:text-white transition-colors">
                    Demo Persona Switcher
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Hollow Social Circles */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="font-mono text-[11px] text-[#ebebeb]/40 uppercase tracking-widest">
              © 2026 AERVY TECHNOLOGIES INC. ALL RIGHTS RESERVED.
            </div>

            <div className="flex items-center gap-3">
              {["X", "GH", "IN"].map((network) => (
                <div
                  key={network}
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-mono text-[10px] text-[#ebebeb]/60 hover:border-[#ccff00] hover:text-[#ccff00] transition-colors cursor-pointer"
                >
                  {network}
                </div>
              ))}
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
