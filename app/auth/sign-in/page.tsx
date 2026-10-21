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
    <div className="flex min-h-screen flex-col justify-center bg-slate-50/50 py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900">
          Aervy
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
          Sign in to your account
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Select a role below or enter your credentials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm space-y-6">
          {/* Quick Demo Role Switcher */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Instant Demo Role Switcher
            </div>

            <button
              type="button"
              onClick={() => handleRoleQuickSelect("ADVERTISER")}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-slate-400 hover:bg-slate-50/50 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Advertiser (Acme Brands India)</div>
                  <div className="text-[10px] text-slate-400">Create & track aerial campaigns</div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleRoleQuickSelect("OPS_REVIEWER")}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-slate-400 hover:bg-slate-50/50 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Operations Review Lead</div>
                  <div className="text-[10px] text-slate-400">Airspace review & approval queue</div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => handleRoleQuickSelect("ADMIN")}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 p-3 text-left hover:border-slate-400 hover:bg-slate-50/50 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Platform Administrator</div>
                  <div className="text-[10px] text-slate-400">System management & audit logs</div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-3 text-[10px] font-medium text-slate-400">
              or credentials
            </span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advertiser@acmebrands.in"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-all"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Need an account?{" "}
            <Link href="/auth/sign-up" className="text-slate-900 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
