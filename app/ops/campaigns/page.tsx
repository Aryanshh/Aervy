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
    <div className="min-h-screen w-full bg-[#000000] text-[#ebebeb] flex flex-col relative overflow-x-hidden selection:bg-[#ccff00] selection:text-black font-sans">
      
      <div className="absolute top-0 right-10 w-[600px] h-[600px] glow-sphere-lime pointer-events-none z-0" />

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
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
                    : "text-[#ebebeb]/60 hover:text-white bg-white/5 border border-white/5"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-2 rounded-full px-2 py-0.2 text-[10px] font-bold ${
                      selectedTab === tab.id
                        ? "bg-black text-[#ccff00]"
                        : tab.highlight
                          ? "bg-[#ccff00]/20 text-[#ccff00]"
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

        {/* Campaigns Table / Cards */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-[#ebebeb]/40">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-[#ccff00]" />
            <span className="font-mono text-xs uppercase tracking-wider">Loading operations queue...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-12 text-center shadow-xl">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#ccff00]/40 mb-3" />
            <h3 className="font-heading text-lg font-bold text-[#ebebeb]">Queue Clear</h3>
            <p className="text-xs font-mono text-[#ebebeb]/50 mt-1">
              No campaigns found matching filter &quot;{selectedTab}&quot;.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-white/10 bg-white/[0.02] text-[#ebebeb]/50 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Campaign</th>
                    <th className="px-6 py-4 font-semibold">Advertiser</th>
                    <th className="px-6 py-4 font-semibold">Target Zone</th>
                    <th className="px-6 py-4 font-semibold">Requested Window</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/ops/campaigns/${camp.id}`}
                          className="font-heading text-sm font-semibold text-[#ebebeb] hover:text-[#ccff00] block truncate max-w-xs transition-colors"
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
      <footer className="w-full border-t border-white/10 bg-[#000000] py-6 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#ebebeb]/40">
          <div>© 2026 AERVY TECHNOLOGIES INC.</div>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/ops/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/ops/zones" className="hover:text-white transition-colors">Zones</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
