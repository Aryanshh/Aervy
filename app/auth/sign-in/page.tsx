"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleQuickSelect = (role: "ADVERTISER" | "OPS_REVIEWER" | "ADMIN") => {
    setLoading(true);
    setTimeout(() => {
      if (role === "ADVERTISER") {
        router.push("/app/campaigns");
      } else if (role === "OPS_REVIEWER") {
        router.push("/ops/campaigns");
      } else {
        router.push("/ops/dashboard");
      }
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/app/campaigns");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#000000] p-4 sm:p-6 flex flex-col justify-center items-center text-[#ebebeb] selection:bg-[#ccff00] selection:text-black font-sans relative overflow-hidden">
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] glow-sphere-lime pointer-events-none" />
      <div className="absolute bottom-10 -right-40 w-[500px] h-[500px] glow-sphere-emerald pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
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
            Sign in to your account
          </h1>
          <p className="mt-1 text-xs font-mono text-[#ebebeb]/50">
            Select a verified persona below or enter credentials
          </p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-7 sm:p-8 shadow-2xl space-y-6">
          
          {/* Quick Demo Role Switcher */}
          <div className="space-y-3">
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccff00]">
              Instant Demo Role Switcher
            </div>

            <button
              type="button"
              onClick={() => handleRoleQuickSelect("ADVERTISER")}
              className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-3.5 text-left hover:border-[#ccff00]/50 hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00]">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-[#ebebeb] group-hover:text-[#ccff00] transition-colors">
                    Advertiser (Acme Brands India)
                  </div>
                  <div className="text-[10px] font-mono text-[#ebebeb]/40">
                    Create & track aerial campaigns
                  </div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#ebebeb]/40 group-hover:text-[#ccff00] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleRoleQuickSelect("OPS_REVIEWER")}
              className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-3.5 text-left hover:border-[#ccff00]/50 hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-[#ebebeb] group-hover:text-[#10b981] transition-colors">
                    Operations Review Lead
                  </div>
                  <div className="text-[10px] font-mono text-[#ebebeb]/40">
                    Airspace review & approval queue
                  </div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#ebebeb]/40 group-hover:text-[#10b981] transition-colors" />
            </button>

            <button
              type="button"
              onClick={() => handleRoleQuickSelect("ADMIN")}
              className="w-full flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-3.5 text-left hover:border-[#ccff00]/50 hover:bg-white/[0.04] transition-all group"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-[#ebebeb] group-hover:text-purple-400 transition-colors">
                    Platform Administrator
                  </div>
                  <div className="text-[10px] font-mono text-[#ebebeb]/40">
                    System management & audit logs
                  </div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#ebebeb]/40 group-hover:text-purple-400 transition-colors" />
            </button>
          </div>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono uppercase tracking-widest text-[#ebebeb]/40">
              or credentials
            </span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#ebebeb]/60 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advertiser@acmebrands.in"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#ebebeb]/60 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#ccff00] py-3 text-xs font-bold font-sans uppercase tracking-wider text-black hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(204,255,0,0.2)] disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Continue to Dashboard"}
            </button>
          </form>

          <p className="text-center text-xs font-mono text-[#ebebeb]/40">
            Need an account?{" "}
            <Link href="/auth/sign-up" className="text-[#ccff00] hover:underline">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
