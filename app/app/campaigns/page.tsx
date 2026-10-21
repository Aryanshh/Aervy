"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Clock,
  ArrowRight,
  MapPin,
  Shield,
} from "lucide-react";
import { CampaignStatus } from "@prisma/client";

interface CampaignItem {
  id: string;
  name: string;
  brand: string;
  status: CampaignStatus;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
  organization: {
    name: string;
  };
  zone: {
    name: string;
    ratePerHourPaise: number;
  } | null;
  quotes: Array<{
    totalPaise: number;
  }>;
  decisions: Array<{
    decision: string;
    reason: string;
  }>;
}

interface CampaignCounts {
  all: number;
  draft: number;
  review: number;
  active: number;
  completed: number;
  issues: number;
}

export default function AdvertiserCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [counts, setCounts] = useState<CampaignCounts>({
    all: 0,
    draft: 0,
    review: 0,
    active: 0,
    completed: 0,
    issues: 0,
  });
  const [activeCategory, setActiveCategory] = useState<
    "all" | "draft" | "review" | "active" | "completed" | "issues"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaigns() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory !== "all") {
          params.set("category", activeCategory);
        }
        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        const res = await fetch(`/api/campaigns?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setCampaigns(data.campaigns);
          setCounts(data.counts);
        }
      } catch (err) {
        console.error("Failed to load campaigns", err);
      } finally {
        setLoading(false);
      }
    }

    loadCampaigns();
  }, [activeCategory, searchQuery]);

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case CampaignStatus.DRAFT:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[#ebebeb]/60">
            Draft
          </span>
        );
      case CampaignStatus.PENDING_PAYMENT:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-blue-400">
            Payment Pending
          </span>
        );
      case CampaignStatus.SUBMITTED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 px-2.5 py-0.5 text-[#ccff00]">
            Submitted
          </span>
        );
      case CampaignStatus.UNDER_REVIEW:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-amber-400">
            Under Review
          </span>
        );
      case CampaignStatus.CHANGES_REQUESTED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-orange-500/10 border border-orange-500/30 px-2.5 py-0.5 text-orange-400">
            Changes Requested
          </span>
        );
      case CampaignStatus.APPROVED_FOR_SCHEDULING:
      case CampaignStatus.SCHEDULED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-[#10b981]/10 border border-[#10b981]/30 px-2.5 py-0.5 text-[#10b981]">
            Scheduled
          </span>
        );
      case CampaignStatus.READY_FOR_OPERATIONS:
      case CampaignStatus.IN_PROGRESS:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 text-purple-400">
            Active Flight
          </span>
        );
      case CampaignStatus.COMPLETED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-white/10 border border-white/20 px-2.5 py-0.5 text-white">
            Completed
          </span>
        );
      case CampaignStatus.REJECTED:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-red-400">
            Rejected (Refunded)
          </span>
        );
      case CampaignStatus.ON_HOLD:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 text-purple-300">
            On Hold
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[#ebebeb]/50">
            {status}
          </span>
        );
    }
  };

  const formatPaise = (paise?: number) => {
    if (!paise) return "—";
    return `₹${(paise / 100).toLocaleString("en-IN")}`;
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#ebebeb] flex flex-col relative overflow-x-hidden selection:bg-[#ccff00] selection:text-black font-sans">
      
      {/* Background Grid & Noise */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-80 z-0" />
      <div className="fixed inset-0 bg-noise pointer-events-none mix-blend-overlay z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] glow-sphere-lime pointer-events-none z-0" />

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
            <span className="font-mono text-xs uppercase tracking-wider text-[#ebebeb]/60">
              Advertiser Campaign Tracking
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/app/dashboard"
              className="font-mono text-xs uppercase tracking-wider text-[#ebebeb]/60 hover:text-white px-3 py-1.5 transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center rounded-full bg-[#ccff00] px-5 py-2.5 text-xs font-mono font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)]"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Campaign
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Operations Safety Boundary Banner */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-4 text-xs font-mono text-[#ebebeb]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#ccff00] shrink-0" />
            <span>
              <strong className="text-[#ebebeb]">Operations Safety Boundary:</strong> Submissions are requests for feasibility review, not flight authorizations.
            </span>
          </div>
          <span className="text-[10px] text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/30 px-3 py-0.5 rounded-full">
            DGCA GREEN ZONES
          </span>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Campaigns", count: counts.all },
              { id: "draft", label: "Drafts", count: counts.draft },
              { id: "review", label: "In Review", count: counts.review },
              { id: "active", label: "Scheduled & Active", count: counts.active },
              { id: "completed", label: "Completed", count: counts.completed },
              { id: "issues", label: "Issues", count: counts.issues },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
                className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-mono transition-all duration-200 cursor-pointer ${
                  activeCategory === tab.id
                    ? "bg-[#ccff00] text-black font-bold shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                    : "bg-[#0c0c0c] text-[#ebebeb]/60 border border-white/10 hover:text-white hover:border-white/20"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`ml-2 text-[10px] opacity-70 ${activeCategory === tab.id ? "text-black font-bold" : "text-[#ebebeb]/40"}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-3 h-3.5 w-3.5 text-[#ebebeb]/40" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-white/10 bg-black/60 py-2.5 pl-9 pr-4 text-xs font-mono text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Campaigns Table Card */}
        <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] shadow-2xl overflow-hidden">
          {loading ? (
            <div className="flex h-48 items-center justify-center font-mono text-xs text-[#ebebeb]/50">
              <Clock className="mr-2 h-4 w-4 animate-spin text-[#ccff00]" />
              Loading campaigns telemetry...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-16 text-center font-mono text-xs text-[#ebebeb]/50">
              No campaigns found in this view.
              <div className="mt-4">
                <Link
                  href="/app/campaigns/new"
                  className="inline-flex items-center rounded-full bg-[#ccff00] px-6 py-2.5 text-xs font-bold text-black hover:bg-white transition-colors"
                >
                  Create your first campaign
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-xs font-mono">
                <thead>
                  <tr className="text-[#ebebeb]/40 uppercase text-[10px] tracking-widest bg-white/[0.02]">
                    <th className="px-6 py-4">Campaign</th>
                    <th className="px-6 py-4">Corridor</th>
                    <th className="px-6 py-4">Window</th>
                    <th className="px-6 py-4">Quote</th>
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
                          className="font-heading font-bold text-[#ebebeb] hover:text-[#ccff00] transition-colors text-sm block"
                        >
                          {camp.name}
                        </Link>
                        <span className="text-[11px] text-[#ebebeb]/40">{camp.brand}</span>
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
                        {camp.startAt
                          ? new Date(camp.startAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "Flexible"}
                      </td>

                      <td className="px-6 py-4 font-bold text-[#ebebeb]">
                        {formatPaise(camp.quotes[0]?.totalPaise)}
                      </td>

                      <td className="px-6 py-4">{getStatusBadge(camp.status)}</td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/app/campaigns/${camp.id}`}
                          className="inline-flex items-center text-xs font-bold text-[#ccff00] hover:text-white transition-colors"
                        >
                          View <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
      <footer className="w-full relative z-30 bg-[#000000] border-t border-white/10 px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#ebebeb]/40">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between">
          <div>© 2026 AERVY TECHNOLOGIES INC.</div>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/safety" className="hover:text-white transition-colors">Safety</Link>
            <Link href="/ops/campaigns" className="hover:text-white transition-colors">Ops Queue</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
