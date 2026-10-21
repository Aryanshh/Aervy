"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { CampaignStatus } from "@prisma/client";

interface CampaignSummary {
  id: string;
  name: string;
  brand: string;
  status: CampaignStatus;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  zone?: {
    name: string;
  } | null;
}

export default function AdvertiserDashboardPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [counts, setCounts] = useState({
    all: 0,
    draft: 0,
    review: 0,
    active: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/campaigns?limit=5");
        const data = await res.json();
        if (data.success && data.campaigns) {
          setCampaigns(data.campaigns);
          setCounts(data.counts);
        }
      } catch (err) {
        console.error("Failed to load dashboard campaigns", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.DRAFT:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[#ebebeb]/60">
            Draft
          </span>
        );
      case CampaignStatus.SUBMITTED:
      case CampaignStatus.UNDER_REVIEW:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-amber-400">
            In Review
          </span>
        );
      case CampaignStatus.CHANGES_REQUESTED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 text-orange-400">
            Action Needed
          </span>
        );
      case CampaignStatus.SCHEDULED:
      case CampaignStatus.APPROVED_FOR_SCHEDULING:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-[#10b981]/10 border border-[#10b981]/30 px-2.5 py-0.5 text-[#10b981]">
            Scheduled
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[#ebebeb]/60">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] p-2 sm:p-5 lg:p-8 flex justify-center text-[#ebebeb] selection:bg-[#ccff00] selection:text-black font-sans">
      {/* Floating Shell Container */}
      <div className="w-full max-w-[1600px] rounded-[2.5rem] ring-1 ring-white/10 shadow-2xl bg-[#0c0c0c] overflow-hidden relative flex flex-col justify-between">
        
        {/* Background Grid & Noise */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-80" />
        <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-overlay" />
        <div className="absolute top-0 right-10 w-[500px] h-[500px] glow-sphere-lime pointer-events-none" />

        {/* Header */}
        <header className="relative z-30 px-6 sm:px-10 py-6 flex items-center justify-between border-b border-white/5">
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
            <span className="font-mono text-xs uppercase tracking-wider text-[#ebebeb]/60">
              Overview
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/app/campaigns"
              className="font-mono text-xs uppercase tracking-wider text-[#ebebeb]/60 hover:text-white px-3 py-1.5 transition-colors"
            >
              All Campaigns
            </Link>
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center rounded-full bg-[#ccff00] px-5 py-2 text-xs font-mono font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)]"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Campaign
            </Link>
          </div>
        </header>

        {/* Main Container */}
        <main className="relative z-20 flex-1 px-6 sm:px-12 py-10 space-y-10">
          
          {/* Quick Stats Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-6 hover:border-[#ccff00]/40 transition-colors">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ebebeb]/40 block">
                Total Submissions
              </span>
              <p className="mt-2 text-3xl font-heading font-bold text-[#ebebeb]">
                {counts.all}
              </p>
            </div>
            
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-6 hover:border-[#ccff00]/40 transition-colors">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ebebeb]/40 block">
                Drafts
              </span>
              <p className="mt-2 text-3xl font-heading font-bold text-[#ebebeb]">
                {counts.draft}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-6 hover:border-[#ccff00]/40 transition-colors">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#ccff00] block">
                Under Safety Review
              </span>
              <p className="mt-2 text-3xl font-heading font-bold text-[#ccff00]">
                {counts.review}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-6 hover:border-[#ccff00]/40 transition-colors">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#10b981] block">
                Scheduled & Active
              </span>
              <p className="mt-2 text-3xl font-heading font-bold text-[#10b981]">
                {counts.active}
              </p>
            </div>
          </div>

          {/* Recent Campaigns Table */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-heading font-bold text-[#ebebeb]">
                  Recent Flight Campaigns
                </h2>
              </div>
              <Link
                href="/app/campaigns"
                className="font-mono text-xs font-bold text-[#ccff00] hover:text-white flex items-center transition-colors"
              >
                View directory <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="p-14 text-center font-mono text-xs text-[#ebebeb]/50">
                Loading campaigns...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="p-14 text-center font-mono text-xs text-[#ebebeb]/50">
                No campaigns yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[#ebebeb]/40 uppercase text-[10px] tracking-widest bg-white/[0.02]">
                      <th className="px-6 py-4">Campaign</th>
                      <th className="px-6 py-4">Corridor</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            href={`/app/campaigns/${camp.id}`}
                            className="font-heading font-bold text-[#ebebeb] hover:text-[#ccff00] text-sm block"
                          >
                            {camp.name}
                          </Link>
                          <span className="text-[11px] text-[#ebebeb]/40">{camp.brand}</span>
                        </td>
                        <td className="px-6 py-4 text-[#ebebeb]/70">
                          {camp.zone?.name || "Unassigned"}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(camp.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/app/campaigns/${camp.id}`}
                            className="font-mono text-xs font-bold text-[#ccff00] hover:text-white transition-colors"
                          >
                            View →
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
