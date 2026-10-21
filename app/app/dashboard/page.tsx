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
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            Draft
          </span>
        );
      case CampaignStatus.SUBMITTED:
      case CampaignStatus.UNDER_REVIEW:
        return (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700">
            In Review
          </span>
        );
      case CampaignStatus.CHANGES_REQUESTED:
        return (
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-medium text-orange-700">
            Action Needed
          </span>
        );
      case CampaignStatus.SCHEDULED:
      case CampaignStatus.APPROVED_FOR_SCHEDULING:
        return (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            Scheduled
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
            {status}
          </span>
        );
    }
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
            <span className="text-xs font-medium text-slate-500">Overview</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/app/campaigns"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 px-3 py-1.5"
            >
              All Campaigns
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
      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Total</span>
            <p className="mt-2 text-2xl font-bold text-slate-900">{counts.all}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Drafts</span>
            <p className="mt-2 text-2xl font-bold text-slate-900">{counts.draft}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Under Review</span>
            <p className="mt-2 text-2xl font-bold text-blue-600">{counts.review}</p>
          </div>
          <div className="rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <span className="text-[11px] font-medium text-slate-400 block">Scheduled</span>
            <p className="mt-2 text-2xl font-bold text-emerald-600">{counts.active}</p>
          </div>
        </div>

        {/* Recent Campaigns Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Campaigns</h2>
            </div>
            <Link
              href="/app/campaigns"
              className="text-xs font-medium text-blue-600 hover:text-blue-500 flex items-center"
            >
              View directory <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="p-10 text-center text-xs text-slate-400">Loading...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">No campaigns yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                    <th className="px-6 py-3.5">Campaign</th>
                    <th className="px-6 py-3.5">Corridor</th>
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
                        {camp.zone?.name || "Unassigned"}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(camp.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/app/campaigns/${camp.id}`}
                          className="text-xs font-medium text-blue-600 hover:text-blue-500"
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
    </div>
  );
}
