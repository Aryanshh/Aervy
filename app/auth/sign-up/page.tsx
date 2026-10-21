"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // In demo mode, redirect directly to advertiser campaigns
      router.push("/app/campaigns");
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#ebebeb] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-[#ccff00] selection:text-black">
      
      {/* Decorative Grid & Noise */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-80 z-0" />
      <div className="fixed inset-0 bg-noise pointer-events-none mix-blend-overlay z-0" />
      <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] glow-sphere-lime pointer-events-none z-0" />
      <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] glow-sphere-emerald pointer-events-none z-0" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#ccff00] text-black font-extrabold flex items-center justify-center text-xl shadow-[0_0_20px_rgba(204,255,0,0.4)] group-hover:scale-105 transition-transform font-mono">
              A
            </div>
            <span className="font-heading font-bold text-2xl tracking-tighter text-[#ebebeb]">
              AERVY
            </span>
          </Link>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl tracking-tight text-[#ebebeb]">
            Create an Advertiser Account
          </h1>
          <p className="mt-1 text-xs font-mono text-[#ebebeb]/50">
            Manage your aerial campaigns and brand activations
          </p>
        </div>

        {/* Glass Card */}
        <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-7 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#ebebeb]/60 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#ebebeb]/60 mb-1.5">
                Organization / Brand
              </label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Acme Brands India Pvt Ltd"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#ebebeb]/60 mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@acmebrands.in"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#ebebeb]/60 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:outline-none transition-colors"
              />
            </div>

            <div className="rounded-xl border border-[#ccff00]/20 bg-[#ccff00]/10 p-3 text-[11px] text-[#ccff00] flex items-start gap-2">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Notice:</strong> Submitting a campaign is an operational request for review, not flight clearance.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#ccff00] py-3 text-xs font-bold font-sans uppercase tracking-wider text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account & Get Started"}
            </button>
          </form>

          <p className="text-center text-xs font-mono text-[#ebebeb]/40">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="text-[#ccff00] hover:underline font-bold">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
