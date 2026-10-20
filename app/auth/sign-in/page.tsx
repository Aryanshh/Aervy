"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Building2,
  ArrowRight,
  UserCheck,
  Sparkles,
} from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleQuickSelect = (role: "ADVERTISER" | "OPS_REVIEWER" | "ADMIN") => {
    setLoading(true);
    // Instant demo redirection based on role
    setTimeout(() => {
      if (role === "ADVERTISER") {
        router.push("/app/campaigns");
      } else if (role === "OPS_REVIEWER") {
        router.push("/ops/campaigns");
      } else {
        router.push("/ops/dashboard");
      }
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      // Default to advertiser portal
      router.push("/app/campaigns");
    }, 500);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="text-3xl font-black tracking-tight text-blue-600">
            Aervy
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Aerial advertising and operational review platform
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6">
          {/* Quick Demo Role Switcher */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-blue-900 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Instant Demo Role Switcher</span>
            </div>
            <p className="text-[11px] text-blue-700 mb-3">
              Select a pre-configured persona for instant evaluation without passwords:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleRoleQuickSelect("ADVERTISER")}
                className="w-full flex items-center justify-between rounded-lg border border-blue-200 bg-white p-2.5 text-left text-xs font-semibold text-slate-800 shadow-sm hover:border-blue-400 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Advertiser (Acme Brands India)</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Create, track, and pay for campaign requests
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect("OPS_REVIEWER")}
                className="w-full flex items-center justify-between rounded-lg border border-amber-200 bg-white p-2.5 text-left text-xs font-semibold text-slate-800 shadow-sm hover:border-amber-400 hover:bg-amber-50 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Operations Review Lead</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Airspace safety checklist & approval review
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleRoleQuickSelect("ADMIN")}
                className="w-full flex items-center justify-between rounded-lg border border-purple-200 bg-white p-2.5 text-left text-xs font-semibold text-slate-800 shadow-sm hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <UserCheck className="h-4 w-4 text-purple-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Platform Administrator</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      Full system access, zone management & audits
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-semibold uppercase text-slate-400">
              Or Sign In with Email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="advertiser@acmebrands.in"
                className="mt-1 w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1 w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-1.5 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600" />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-medium text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In to Portal"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link href="/auth/sign-up" className="font-semibold text-blue-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
