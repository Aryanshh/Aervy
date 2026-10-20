"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Clock, ShieldCheck, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
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
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            Draft
          </span>
        );
      case CampaignStatus.PENDING_PAYMENT:
        return (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            Payment Pending
          </span>
        );
      case CampaignStatus.SUBMITTED:
        return (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
            Submitted for Review
          </span>
        );
      case CampaignStatus.UNDER_REVIEW:
        return (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            Under Review
          </span>
        );
      case CampaignStatus.CHANGES_REQUESTED:
        return (
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700 border border-orange-200">
            Changes Requested
          </span>
        );
      case CampaignStatus.APPROVED_FOR_SCHEDULING:
      case CampaignStatus.SCHEDULED:
        return (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            Approved & Scheduled
          </span>
        );
      case CampaignStatus.READY_FOR_OPERATIONS:
      case CampaignStatus.IN_PROGRESS:
        return (
          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
            Active Flight
          </span>
        );
      case CampaignStatus.COMPLETED:
        return (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            Completed
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Aervy
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-semibold text-slate-700">Advertiser Dashboard</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/app/campaigns"
              className="text-xs font-medium text-slate-600 hover:text-blue-600"
            >
              All Campaigns
            </Link>
            <Link
              href="/app/campaigns/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Campaign Request
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Safety Disclaimer Banner */}
        <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
          <p className="font-semibold">⚠️ Safety Boundary Reminder:</p>
          <p className="mt-0.5">
            Campaign submissions on Aervy represent <strong>operational requests</strong> for review.
            All flight operations require separate day-of-ops pilot approval, ATC airspace clearance, and weather validation (&lt;15 knots wind).
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Total Campaigns</span>
              <FileText className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{counts.all}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Drafts in Progress</span>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{counts.draft}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Under Review</span>
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-blue-600">{counts.review}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-500">Scheduled / Active</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-emerald-600">{counts.active}</p>
          </div>
        </div>

        {/* Campaigns Directory Preview */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Campaigns</h2>
              <p className="text-xs text-slate-500">
                Track draft creation, operations review, and scheduled flight windows.
              </p>
            </div>
            <Link
              href="/app/campaigns"
              className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-500"
            >
              View Full Directory
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="flex h-36 items-center justify-center text-xs text-slate-500">
              <Clock className="mr-2 h-4 w-4 animate-spin text-blue-600" />
              Loading campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No campaigns found. Start by creating your first campaign request.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Campaign</th>
                    <th className="px-6 py-3">Flight Zone</th>
                    <th className="px-6 py-3">Requested Window</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/app/campaigns/${camp.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 hover:underline block"
                        >
                          {camp.name}
                        </Link>
                        <div className="text-[11px] text-slate-500">{camp.brand}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {camp.zone?.name || "Zone Unassigned"}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {camp.startAt
                          ? new Date(camp.startAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Flexible / Unset"}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(camp.status)}</td>
                      <td className="px-6 py-4 text-right">
                        {camp.status === CampaignStatus.DRAFT ? (
                          <Link
                            href="/app/campaigns/new"
                            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Continue Draft
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <Link
                            href={`/app/campaigns/${camp.id}`}
                            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Track Live Status
                            <ArrowRight className="ml-1 h-3.5 w-3.5" />
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
