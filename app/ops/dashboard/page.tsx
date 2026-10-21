"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Inbox,
  Clock,
  Calendar,
  ArrowRight,
  Plane,
  Loader2,
} from "lucide-react";

interface DashboardData {
  counts: {
    submitted: number;
    underReview: number;
    changesRequested: number;
    approved: number;
    scheduled: number;
    activeFlight: number;
    completed: number;
    archived: number;
  };
  recentCampaigns: Array<{
    id: string;
    name: string;
    brand: string;
    status: string;
    createdAt: string;
    organization: {
      name: string;
    };
    zone: {
      name: string;
    } | null;
  }>;
}

export default function OpsDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/ops/campaigns?limit=5");
        if (!res.ok) throw new Error("Failed to load dashboard");
        const json = await res.json();
        setData({
          counts: json.counts,
          recentCampaigns: json.campaigns,
        });
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#ebebeb] flex flex-col relative overflow-x-hidden selection:bg-[#ccff00] selection:text-black font-sans">
      
      {/* Background Grid & Noise */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-80 z-0" />
      <div className="fixed inset-0 bg-noise pointer-events-none mix-blend-overlay z-0" />
      <div className="absolute top-0 right-1/3 w-[600px] h-[600px] glow-sphere-lime pointer-events-none z-0" />

      {/* Standard Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-[#000000]/85 backdrop-blur-[16px] border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#ccff00] text-black font-extrabold flex items-center justify-center text-xl shadow-[0_0_20px_rgba(204,255,0,0.4)] group-hover:scale-105 transition-transform font-mono">
                A
              </div>
              <span className="font-heading font-bold text-xl tracking-tighter text-[#ebebeb]">
                Aervy
              </span>
            </Link>
            <span className="text-white/20">/</span>
            <span className="font-mono text-xs uppercase tracking-wider text-[#ccff00]">
              Operations Command Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ops/campaigns"
              className="font-mono text-xs uppercase tracking-wider text-black bg-[#ccff00] hover:bg-white font-bold px-4 py-2 rounded-full transition-colors shadow-[0_0_15px_rgba(204,255,0,0.25)]"
            >
              Open Review Queue
            </Link>
            <Link
              href="/ops/zones"
              className="font-mono text-xs uppercase tracking-wider text-[#ebebeb]/70 hover:text-white bg-white/5 border border-white/10 px-4 py-2 rounded-full transition-colors"
            >
              Airspace Zones
            </Link>
          </div>
        </div>
      </header>

      {/* Safety Gate Banner */}
      <div className="bg-[#ccff00]/10 border-b border-[#ccff00]/20 px-4 sm:px-6 lg:px-8 py-2.5 text-xs font-mono text-[#ccff00] relative z-10 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>
              <strong>Operations Safety Gate:</strong> Reviewers must verify DGCA Green Zone corridors, weather envelopes (&lt;14 kts), and creative strobe limits before authorizing flight.
            </span>
          </div>
          <Link href="/ops/campaigns" className="hover:underline font-bold hidden md:inline ml-4">
            Review Queue →
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-[#ebebeb]">
            Operations Command Center
          </h1>
          <p className="text-xs font-mono text-[#ebebeb]/60 mt-1">
            Active campaign requests, regulatory review queue, and scheduled drone deployment pipeline.
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Pending Safety Review */}
          <Link
            href="/ops/campaigns?status=SUBMITTED"
            className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 hover:border-[#ccff00]/50 transition-all duration-300 group block font-mono shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ccff00]">
                Pending Safety Review
              </span>
              <div className="rounded-xl bg-[#ccff00]/10 p-2 text-[#ccff00] group-hover:scale-110 transition-transform">
                <Inbox className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline">
              <span className="text-3xl font-heading font-bold text-[#ebebeb]">
                {isLoading ? "..." : data?.counts.submitted ?? 0}
              </span>
              <span className="text-[10px] text-[#ccff00] font-bold ml-2">Needs Review</span>
            </div>
            <p className="text-xs text-[#ebebeb]/50 mt-2">New campaigns paid & submitted</p>
          </Link>

          {/* Card 2: In Review */}
          <Link
            href="/ops/campaigns?status=UNDER_REVIEW"
            className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 hover:border-amber-500/50 transition-all duration-300 group block font-mono shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Under Ops Review
              </span>
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400 group-hover:scale-110 transition-transform">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-heading font-bold text-[#ebebeb]">
                {isLoading ? "..." : data?.counts.underReview ?? 0}
              </span>
            </div>
            <p className="text-xs text-[#ebebeb]/50 mt-2">Corridor checklist underway</p>
          </Link>

          {/* Card 3: Scheduled Flights */}
          <Link
            href="/ops/campaigns?status=SCHEDULED"
            className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 hover:border-[#10b981]/50 transition-all duration-300 group block font-mono shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#10b981]">
                Scheduled Slots
              </span>
              <div className="rounded-xl bg-[#10b981]/10 p-2 text-[#10b981] group-hover:scale-110 transition-transform">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-heading font-bold text-[#ebebeb]">
                {isLoading ? "..." : (data?.counts.approved ?? 0) + (data?.counts.scheduled ?? 0)}
              </span>
            </div>
            <p className="text-xs text-[#ebebeb]/50 mt-2">Approved & confirmed flight windows</p>
          </Link>

          {/* Card 4: Active in Flight */}
          <Link
            href="/ops/campaigns?status=READY_FOR_OPERATIONS"
            className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 hover:border-purple-500/50 transition-all duration-300 group block font-mono shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Active in Flight
              </span>
              <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 group-hover:scale-110 transition-transform">
                <Plane className="h-4 w-4 animate-pulse" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-heading font-bold text-[#ebebeb]">
                {isLoading ? "..." : data?.counts.activeFlight ?? 0}
              </span>
            </div>
            <p className="text-xs text-[#ebebeb]/50 mt-2">Live drone luminaire broadcasts</p>
          </Link>

        </div>

        {/* Recent Submissions Table */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-2xl overflow-hidden font-mono">
          <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
            <h2 className="text-base font-heading font-bold text-[#ebebeb]">
              Recent Campaign Submissions
            </h2>
            <Link
              href="/ops/campaigns"
              className="text-xs font-bold text-[#ccff00] hover:text-white flex items-center transition-colors"
            >
              View full queue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="p-16 text-center text-xs text-[#ebebeb]/50">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#ccff00] mb-2" />
              Loading submissions...
            </div>
          ) : !data?.recentCampaigns.length ? (
            <div className="p-16 text-center text-xs text-[#ebebeb]/50">No submissions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-xs">
                <thead>
                  <tr className="text-[#ebebeb]/40 uppercase text-[10px] tracking-widest bg-white/[0.02]">
                    <th className="px-6 py-4">Campaign</th>
                    <th className="px-6 py-4">Brand / Org</th>
                    <th className="px-6 py-4">Corridor</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.recentCampaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/ops/campaigns/${camp.id}`}
                          className="font-heading font-bold text-[#ebebeb] hover:text-[#ccff00] text-sm block"
                        >
                          {camp.name}
                        </Link>
                        <span className="text-[10px] text-[#ebebeb]/40">ID: {camp.id.slice(0, 8)}...</span>
                      </td>
                      <td className="px-6 py-4 text-[#ebebeb]/70">
                        <div>{camp.brand}</div>
                        <div className="text-[10px] text-[#ebebeb]/40">{camp.organization.name}</div>
                      </td>
                      <td className="px-6 py-4 text-[#ebebeb]/70">
                        {camp.zone?.name || "Unassigned"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] text-[#ebebeb]/80">
                          {camp.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/ops/campaigns/${camp.id}`}
                          className="inline-flex items-center text-xs font-bold text-[#ccff00] hover:text-white"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-[#000000] py-6 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#ebebeb]/40">
          <div>© 2026 AERVY TECHNOLOGIES INC.</div>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/ops/campaigns" className="hover:text-white transition-colors">Queue</Link>
            <Link href="/ops/zones" className="hover:text-white transition-colors">Zones</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
