"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CampaignStatus } from "@prisma/client";
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Eye,
  Loader2,
  MapPin,
  Building2,
  Film,
  Image as ImageIcon,
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
    { id: "ALL", label: "All Campaigns" },
    { id: "SUBMITTED", label: "Submitted", count: counts.submitted, highlight: counts.submitted > 0 },
    { id: "UNDER_REVIEW", label: "Under Review", count: counts.underReview },
    { id: "CHANGES_REQUESTED", label: "Changes Requested", count: counts.changesRequested },
    { id: "APPROVED_FOR_SCHEDULING", label: "Approved", count: counts.approved },
    { id: "SCHEDULED", label: "Scheduled", count: counts.scheduled },
    { id: "READY_FOR_OPERATIONS", label: "Active Deployments", count: counts.activeFlight },
    { id: "COMPLETED", label: "Completed", count: counts.completed },
    { id: "REJECTED", label: "Archived / Rejected", count: counts.archived },
  ];

  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case "SUBMITTED":
        return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">Submitted</span>;
      case "UNDER_REVIEW":
        return <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">Under Review</span>;
      case "CHANGES_REQUESTED":
        return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">Changes Requested</span>;
      case "APPROVED_FOR_SCHEDULING":
        return <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">Approved</span>;
      case "SCHEDULED":
        return <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-800">Scheduled</span>;
      case "READY_FOR_OPERATIONS":
      case "IN_PROGRESS":
        return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 animate-pulse">In Flight</span>;
      case "COMPLETED":
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">Completed</span>;
      case "REJECTED":
        return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Rejected & Refunded</span>;
      case "ON_HOLD":
        return <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-800">On Hold</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link href="/ops/dashboard" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
              Ops Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-base font-bold text-slate-900">Review Queue</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/ops/zones"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md"
            >
              Approved Zones
            </Link>
            <div className="flex items-center space-x-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>Operations Portal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Operations Campaign Review Queue</h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify advertiser creative media, assess DGCA airspace boundaries, and issue flight scheduling decisions.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search campaigns, brands, or advertisers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-slate-300 pl-9 pr-4 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 self-end sm:self-auto">
              <span>Showing <strong>{campaigns.length}</strong> campaigns</span>
            </div>
          </div>

          {/* Status Tabs Bar */}
          <div className="border-b border-slate-200 overflow-x-auto">
            <nav className="flex space-x-2 pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`inline-flex items-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedTab === tab.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] ${
                        selectedTab === tab.id
                          ? "bg-slate-700 text-white"
                          : tab.highlight
                            ? "bg-blue-100 text-blue-700 font-bold"
                            : "bg-slate-200 text-slate-700"
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
            <div className="py-16 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
              <p className="mt-2 text-xs text-slate-500">Loading campaign review queue...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Queue is Clear</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No campaigns currently match the selected filter. Newly submitted campaigns will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Campaign & Brand</th>
                      <th className="py-3 px-4">Organization</th>
                      <th className="py-3 px-4">Airspace Zone</th>
                      <th className="py-3 px-4">Requested Flight Window</th>
                      <th className="py-3 px-4">Asset</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {campaigns.map((camp) => {
                      const asset = camp.assets[0];
                      const isVideo = asset?.mimeType.startsWith("video/");
                      return (
                        <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block truncate max-w-xs">
                              {camp.name}
                            </span>
                            <span className="text-slate-400 text-[11px]">Brand: {camp.brand}</span>
                          </td>

                          <td className="py-3 px-4 text-slate-700">
                            <div className="flex items-center space-x-1.5">
                              <Building2 className="h-3.5 w-3.5 text-slate-400" />
                              <span className="truncate max-w-[150px] font-medium">{camp.organization.name}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-700">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="font-medium">{camp.zone?.name || "TBD"}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-slate-600">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                <span>{camp.startAt ? new Date(camp.startAt).toLocaleDateString() : "TBD"}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {camp.startAt
                                    ? new Date(camp.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                    : ""}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {asset ? (
                              <div className="flex items-center space-x-1.5 text-slate-600">
                                {isVideo ? (
                                  <Film className="h-3.5 w-3.5 text-indigo-600" />
                                ) : (
                                  <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                                )}
                                <span className="truncate max-w-[100px] text-[11px] font-mono">
                                  {asset.mimeType.split("/")[1]?.toUpperCase()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 italic text-[11px]">No asset</span>
                            )}
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap">
                            {getStatusBadge(camp.status)}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <Link
                              href={`/ops/campaigns/${camp.id}`}
                              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
                            >
                              <Eye className="mr-1.5 h-3.5 w-3.5" />
                              Review
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
