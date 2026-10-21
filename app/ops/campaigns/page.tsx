"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CampaignStatus } from "@prisma/client";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Eye,
  Loader2,
  MapPin,
} from "lucide-react";

interface CampaignQueueItem {
  id: string;
  name: string;
  brand: string;
  status: CampaignStatus;
  startAt: string | null;
  endAt: string | null;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
  };
  zone: {
    id: string;
    name: string;
  } | null;
  assets: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    validationStatus: string;
  }>;
  payments: Array<{
    status: string;
    amountPaise: number;
  }>;
}

interface QueueCounts {
  submitted: number;
  underReview: number;
  changesRequested: number;
  approved: number;
  scheduled: number;
  activeFlight: number;
  completed: number;
  archived: number;
}

export default function OpsCampaignsQueuePage() {
  const [campaigns, setCampaigns] = useState<CampaignQueueItem[]>([]);
  const [counts, setCounts] = useState<QueueCounts>({
    submitted: 0,
    underReview: 0,
    changesRequested: 0,
    approved: 0,
    scheduled: 0,
    activeFlight: 0,
    completed: 0,
    archived: 0,
  });
  const [selectedTab, setSelectedTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTab !== "ALL") {
        params.append("status", selectedTab);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const res = await fetch(`/api/ops/campaigns?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns || []);
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.error("Error loading queue:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTab, searchQuery]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const tabs = [
    { id: "ALL", label: "All Submissions" },
    { id: "SUBMITTED", label: "Pending Review", count: counts.submitted, highlight: counts.submitted > 0 },
    { id: "UNDER_REVIEW", label: "Under Review", count: counts.underReview },
    { id: "APPROVED_FOR_SCHEDULING", label: "Approved", count: counts.approved },
    { id: "CHANGES_REQUESTED", label: "Changes Requested", count: counts.changesRequested },
    { id: "SCHEDULED", label: "Scheduled", count: counts.scheduled },
    { id: "READY_FOR_OPERATIONS", label: "Active Deployments", count: counts.activeFlight },
    { id: "COMPLETED", label: "Completed", count: counts.completed },
    { id: "REJECTED", label: "Archived / Rejected", count: counts.archived },
  ];

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 px-2.5 py-0.5 text-[#ccff00]">Submitted</span>;
      case "UNDER_REVIEW":
        return <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-amber-400">Under Review</span>;
      case "CHANGES_REQUESTED":
        return <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 text-orange-400">Changes Requested</span>;
      case "APPROVED_FOR_SCHEDULING":
        return <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-[#10b981]/10 border border-[#10b981]/30 px-2.5 py-0.5 text-[#10b981]">Approved</span>;
      case "SCHEDULED":
        return <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 text-indigo-300">Scheduled</span>;
      case "READY_FOR_OPERATIONS":
      case "IN_PROGRESS":
        return <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 text-purple-300 animate-pulse">In Flight</span>;
      case "COMPLETED":
        return <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-white">Completed</span>;
      case "REJECTED":
        return <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-red-400">Rejected & Refunded</span>;
      case "ON_HOLD":
        return <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 text-orange-300">On Hold</span>;
      default:
        return <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[#ebebeb]/50">{status}</span>;
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
            <Link href="/ops/dashboard" className="font-mono text-xs text-[#ebebeb]/60 hover:text-white uppercase tracking-wider">
              Ops Dashboard
            </Link>
            <span className="text-white/20">/</span>
            <span className="font-mono text-xs uppercase tracking-wider text-[#ccff00]">
              Operations Review Queue
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ops/zones"
              className="font-mono text-xs uppercase tracking-wider text-[#ebebeb]/70 hover:text-white bg-white/5 border border-white/10 px-4 py-2 rounded-full transition-colors"
            >
              Approved Zones
            </Link>
            <div className="flex items-center space-x-1.5 rounded-full bg-[#ccff00]/10 px-3.5 py-1.5 text-xs font-mono font-bold text-[#ccff00] border border-[#ccff00]/30">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Operations Portal</span>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="relative z-20 flex-1 px-6 sm:px-12 py-10 space-y-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-[#ebebeb]">
              Operations Review Queue
            </h1>
            <p className="text-xs font-mono text-[#ebebeb]/60 mt-1">
              Verify advertiser creative media, assess DGCA airspace boundaries, and issue flight scheduling decisions.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="pointer-events-none absolute left-3.5 top-2.5 h-3.5 w-3.5 text-[#ebebeb]/40" />
              <input
                type="text"
                placeholder="Search campaigns, brands, or advertisers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-black/50 py-2 pl-9 pr-4 text-xs font-mono text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-[#ebebeb]/50 self-end sm:self-auto">
              <span>Showing <strong>{campaigns.length}</strong> campaigns</span>
            </div>
          </div>

          {/* Status Tabs Bar */}
          <div className="border-b border-white/10 overflow-x-auto pb-2">
            <nav className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`inline-flex items-center whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-mono transition-all duration-200 cursor-pointer ${
                    selectedTab === tab.id
                      ? "bg-[#ccff00] text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                      : "bg-white/[0.03] text-[#ebebeb]/60 border border-white/10 hover:text-white hover:border-white/20"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] ${
                        selectedTab === tab.id
                          ? "bg-black text-[#ccff00] font-bold"
                          : tab.highlight
                            ? "bg-[#ccff00]/20 text-[#ccff00] font-bold"
                            : "bg-white/10 text-[#ebebeb]/70"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Queue List Table */}
          {isLoading ? (
            <div className="py-20 text-center font-mono text-xs text-[#ebebeb]/50">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#ccff00]" />
              <p className="mt-3">Loading campaign review queue...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/20 bg-white/[0.02] backdrop-blur-[16px] p-16 text-center font-mono">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#10b981] mb-2" />
              <h3 className="text-sm font-bold text-[#ebebeb]">Queue is Clear</h3>
              <p className="text-xs text-[#ebebeb]/50 mt-1 max-w-sm mx-auto">
                No campaigns currently match the selected operational review filter.
              </p>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] shadow-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 text-left text-xs font-mono">
                  <thead>
                    <tr className="text-[#ebebeb]/40 uppercase text-[10px] tracking-widest bg-white/[0.02]">
                      <th className="px-6 py-4">Campaign</th>
                      <th className="px-6 py-4">Advertiser / Brand</th>
                      <th className="px-6 py-4">Airspace Zone</th>
                      <th className="px-6 py-4">Flight Window</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {campaigns.map((camp) => (
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
                          <div className="font-semibold text-[#ebebeb]">{camp.brand}</div>
                          <div className="text-[10px] text-[#ebebeb]/40">{camp.organization.name}</div>
                        </td>
                        <td className="px-6 py-4 text-[#ebebeb]/70">
                          {camp.zone ? (
                            <div className="flex items-center space-x-1.5">
                              <MapPin className="h-3.5 w-3.5 text-[#ccff00] shrink-0" />
                              <span>{camp.zone.name}</span>
                            </div>
                          ) : (
                            <span className="text-[#ebebeb]/30">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#ebebeb]/60">
                          {camp.startAt ? (
                            <div>
                              <div>{new Date(camp.startAt).toLocaleDateString()}</div>
                              <div className="text-[10px] text-[#ebebeb]/40">
                                {new Date(camp.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          ) : (
                            "Flexible"
                          )}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(camp.status)}</td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/ops/campaigns/${camp.id}`}
                            className="inline-flex items-center rounded-full bg-[#ccff00] px-4 py-1.5 text-xs font-bold text-black hover:bg-white transition-colors"
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Review Media
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="relative z-30 px-6 sm:px-10 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#ebebeb]/40">
          <div>© 2026 AERVY TECHNOLOGIES INC.</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/ops/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/ops/zones" className="hover:text-white">Zones</Link>
          </div>
        </footer>

      </div>
    </div>
  );
}
