"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Clock,
  ArrowRight,
  MapPin,
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
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            Draft
          </span>
        );
      case CampaignStatus.PENDING_PAYMENT:
        return (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
            Payment Pending
          </span>
        );
      case CampaignStatus.SUBMITTED:
        return (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
            Submitted
          </span>
        );
      case CampaignStatus.UNDER_REVIEW:
        return (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
            Under Review
          </span>
        );
      case CampaignStatus.CHANGES_REQUESTED:
        return (
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-medium text-orange-700">
            Changes Requested
          </span>
        );
      case CampaignStatus.APPROVED_FOR_SCHEDULING:
      case CampaignStatus.SCHEDULED:
        return (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            Scheduled
          </span>
        );
      case CampaignStatus.READY_FOR_OPERATIONS:
      case CampaignStatus.IN_PROGRESS:
        return (
          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-medium text-purple-700">
            Active Flight
          </span>
        );
      case CampaignStatus.COMPLETED:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
            Completed
          </span>
        );
      case CampaignStatus.REJECTED:
        return (
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-medium text-red-700">
            Rejected (Refunded)
          </span>
        );
      case CampaignStatus.ON_HOLD:
        return (
          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-medium text-purple-700">
            On Hold
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
              Aervy
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-medium text-slate-500">Advertiser Campaign Tracking</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/app/dashboard"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 px-3 py-1.5"
            >
              Overview
            </Link>
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 transition-all"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              New Campaign
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* Calm Safety Notice */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 text-xs text-slate-500 flex items-center justify-between">
          <span>
            <strong className="text-slate-700">Operations Safety Boundary:</strong> Submissions are requests for feasibility review, not flight authorizations.
          </span>
          <span className="text-[11px] text-slate-400">DGCA Green Zones</span>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
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
                className={`inline-flex items-center rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                  activeCategory === tab.id
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 opacity-60 text-[10px]">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs placeholder-slate-400 focus:border-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Campaigns List */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-xs text-slate-400">
              <Clock className="mr-2 h-4 w-4 animate-spin text-slate-400" />
              Loading campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No campaigns found in this view.
              <div className="mt-4">
                <Link
                  href="/app/campaigns/new"
                  className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Create your first campaign
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="px-6 py-3.5">Campaign</th>
                    <th className="px-6 py-3.5">Corridor</th>
                    <th className="px-6 py-3.5">Window</th>
                    <th className="px-6 py-3.5">Quote</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/app/campaigns/${camp.id}`}
                          className="font-semibold text-slate-900 hover:underline block"
                        >
                          {camp.name}
                        </Link>
                        <span className="text-[11px] text-slate-400">{camp.brand}</span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {camp.zone ? (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>{camp.zone.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">Unassigned</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {camp.startAt
                          ? new Date(camp.startAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })
                          : "Flexible"}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-800">
                        {formatPaise(camp.quotes[0]?.totalPaise)}
                      </td>

                      <td className="px-6 py-4">{getStatusBadge(camp.status)}</td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/app/campaigns/${camp.id}`}
                          className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-500"
                        >
                          View <ArrowRight className="ml-1 h-3 w-3" />
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
    </div>
  );
}
