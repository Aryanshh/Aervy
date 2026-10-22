export default function Loading() {
  return (
    <div className="min-h-[75vh] w-full flex items-center justify-center p-6 relative">
      {/* Ambient background glow */}
      <div className="absolute w-72 h-72 rounded-full glow-sphere-lime blur-3xl pointer-events-none" />

      {/* Central Glass Card */}
      <div className="relative rounded-[2.5rem] border border-white/10 bg-[#0c0c0c]/85 p-8 sm:p-10 shadow-2xl backdrop-blur-xl flex flex-col items-center max-w-sm w-full text-center ring-1 ring-white/5">
        
        {/* Radar Reticle Spinner */}
        <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
          {/* Outer dashed radar ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[#ccff00]/30 animate-[spin_8s_linear_infinite]" />
          
          {/* Inner counter-rotating gradient accent ring */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#ccff00] border-r-emerald-500 animate-[spin_1.5s_linear_infinite_reverse]" />
          
          {/* Central obsidian badge */}
          <div className="w-12 h-12 rounded-2xl bg-black border border-white/15 flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.25)]">
            <span className="font-heading font-black text-2xl text-[#ccff00] tracking-tighter">
              A
            </span>
          </div>
        </div>

        {/* System Status Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ccff00] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ccff00]" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#ccff00] font-semibold">
            TELEMETRY DISPATCH
          </span>
        </div>

        <h3 className="font-heading font-bold text-white text-lg tracking-tight mb-1">
          Loading Airspace Interface
        </h3>
        <p className="font-mono text-xs text-white/40 mb-6 uppercase tracking-wider">
          SYNCHRONIZING SATELLITE LINKS
        </p>

        {/* Shimmering Micro Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-[#ccff00] to-white rounded-full w-2/5 animate-telemetry-sweep" />
        </div>
      </div>
    </div>
  );
}
