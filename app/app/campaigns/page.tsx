"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Clock,
  ShieldCheck,
  FileText,
  ArrowRight,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  CheckCircle2,
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
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            <FileText className="mr-1 h-3 w-3 text-slate-500" />
            Draft
          </span>
        );
      case CampaignStatus.PENDING_PAYMENT:
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <Clock className="mr-1 h-3 w-3 text-blue-500" />
            Payment Pending
          </span>
        );
      case CampaignStatus.SUBMITTED:
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            <Clock className="mr-1 h-3 w-3 text-blue-500 animate-spin" />
            Submitted for Review
          </span>
        );
      case CampaignStatus.UNDER_REVIEW:
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <ShieldCheck className="mr-1 h-3 w-3 text-amber-600" />
            Under Operations Review
          </span>
        );
      case CampaignStatus.CHANGES_REQUESTED:
        return (
          <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700 border border-orange-200">
            <AlertCircle className="mr-1 h-3 w-3 text-orange-600" />
            Changes Requested
          </span>
        );
      case CampaignStatus.APPROVED_FOR_SCHEDULING:
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
            Approved for Scheduling
          </span>
        );
      case CampaignStatus.SCHEDULED:
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <Calendar className="mr-1 h-3 w-3 text-emerald-600" />
            Scheduled
          </span>
        );
      case CampaignStatus.READY_FOR_OPERATIONS:
      case CampaignStatus.IN_PROGRESS:
        return (
          <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
            <Clock className="mr-1 h-3 w-3 text-purple-600 animate-pulse" />
            In Flight Deployment
          </span>
        );
      case CampaignStatus.COMPLETED:
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
            Completed
          </span>
        );
      case CampaignStatus.REJECTED:
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
            <XCircle className="mr-1 h-3 w-3 text-red-500" />
            Rejected (Refunded)
          </span>
        );
      case CampaignStatus.ON_HOLD:
        return (
          <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
            <AlertCircle className="mr-1 h-3 w-3 text-purple-500" />
            Operations Hold
          </span>
        );
      case CampaignStatus.CANCELLED:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Aervy
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-semibold text-slate-700">Advertiser Campaign Tracking</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/app/dashboard"
              className="text-xs font-medium text-slate-600 hover:text-blue-600"
            >
              Dashboard Overview
            </Link>
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Campaign Request
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Safety Disclaimer Banner */}
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
          <div className="flex items-start space-x-2">
            <ShieldCheck className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Operations Safety Boundary:</p>
              <p className="mt-0.5">
                Every campaign submission on Aervy represents an <strong>operational request</strong>.
                Actual aerial deployment requires verified airspace clearance, trained remote pilot in command (RPIC) assignment, and real-time weather envelope confirmation (&lt;15 knots wind).
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            {[
              { id: "all", label: "All Campaigns", count: counts.all },
              { id: "draft", label: "Drafts", count: counts.draft },
              { id: "review", label: "In Review", count: counts.review },
              { id: "active", label: "Scheduled & Active", count: counts.active },
              { id: "completed", label: "Completed", count: counts.completed },
              { id: "issues", label: "Issues / Rejected", count: counts.issues },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
                className={`inline-flex items-center rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeCategory === tab.id
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                    activeCategory === tab.id
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Campaigns Table / Cards */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-xs text-slate-500">
              <Clock className="mr-2 h-4 w-4 animate-spin text-blue-600" />
              Loading your campaign portfolio...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-sm font-semibold text-slate-900">No campaigns found</h3>
              <p className="mt-1 text-xs text-slate-500">
                {searchQuery
                  ? "No campaigns match your search query."
                  : "You have not created any campaign requests in this category yet."}
              </p>
              <div className="mt-6">
                <Link
                  href="/app/campaigns/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Create Your First Campaign
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Campaign & Brand</th>
                    <th className="px-6 py-3.5">Approved Zone</th>
                    <th className="px-6 py-3.5">Requested Window</th>
                    <th className="px-6 py-3.5">Total Quote</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/app/campaigns/${camp.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 hover:underline block"
                        >
                          {camp.name}
                        </Link>
                        <div className="mt-0.5 text-slate-500">{camp.brand}</div>
                      </td>

                      <td className="px-6 py-4">
                        {camp.zone ? (
                          <div className="flex items-center text-slate-700">
                            <MapPin className="mr-1 h-3.5 w-3.5 text-blue-500 shrink-0" />
                            <span className="font-medium">{camp.zone.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Zone unassigned</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {camp.startAt ? (
                          <div>
                            <div className="font-medium text-slate-800">
                              {new Date(camp.startAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                              })}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {new Date(camp.startAt).toLocaleTimeString("en-IN", {
                                timeStyle: "short",
                              })}{" "}
                              –{" "}
                              {camp.endAt
                                ? new Date(camp.endAt).toLocaleTimeString("en-IN", {
                                    timeStyle: "short",
                                  })
                                : ""}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">Schedule pending</span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatPaise(camp.quotes[0]?.totalPaise)}
                      </td>

                      <td className="px-6 py-4">{getStatusBadge(camp.status)}</td>

                      <td className="px-6 py-4 text-right">
                        {camp.status === CampaignStatus.DRAFT ? (
                          <Link
                            href="/app/campaigns/new"
                            className="inline-flex items-center rounded border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Resume Draft
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        ) : camp.status === CampaignStatus.CHANGES_REQUESTED ? (
                          <Link
                            href={`/app/campaigns/${camp.id}`}
                            className="inline-flex items-center rounded border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                          >
                            Resolve Changes
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        ) : (
                          <Link
                            href={`/app/campaigns/${camp.id}`}
                            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-500 hover:underline"
                          >
                            Track Status
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        )}
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
