"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Inbox,
  Clock,
  Calendar,
  MapPin,
  ArrowRight,
  Plane,
  Eye,
  Building2,
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <span className="text-lg font-bold text-slate-900">Aervy Operations</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Control Center
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/ops/campaigns"
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200"
            >
              Open Review Queue
            </Link>
            <Link
              href="/ops/zones"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md"
            >
              Airspace Zones
            </Link>
            <div className="flex items-center space-x-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>Operations Portal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Safety Notice Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <p className="flex items-center">
            <ShieldAlert className="mr-1.5 h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Operations Safety Gate:</strong> Reviewers must verify airspace no-fly zones, DGCA rules,
              and creative strobe guidelines before scheduling flights.
            </span>
          </p>
          <Link href="/ops/campaigns" className="text-amber-800 hover:underline font-semibold hidden md:inline">
            Review Queue →
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Operations Overview</h1>
            <p className="text-sm text-slate-500 mt-1">
              Active campaign requests, regulatory review queue, and scheduled drone deployment pipeline.
            </p>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Pending Review */}
            <Link
              href="/ops/campaigns?status=SUBMITTED"
              className="rounded-xl border border-blue-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Awaiting Review</span>
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 group-hover:scale-110 transition-transform">
                  <Inbox className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  {isLoading ? "..." : data?.counts.submitted ?? 0}
                </span>
                <span className="text-xs text-blue-600 font-semibold ml-2">Needs Action</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">New campaigns paid and submitted</p>
            </Link>

            {/* Card 2: In Review */}
            <Link
              href="/ops/campaigns?status=UNDER_REVIEW"
              className="rounded-xl border border-purple-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Under Review</span>
                <div className="rounded-lg bg-purple-50 p-2 text-purple-600 group-hover:scale-110 transition-transform">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  {isLoading ? "..." : data?.counts.underReview ?? 0}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Feasibility & checklist checks underway</p>
            </Link>

            {/* Card 3: Approved / Scheduled */}
            <Link
              href="/ops/campaigns?status=SCHEDULED"
              className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Scheduled Flights</span>
                <div className="rounded-lg bg-teal-50 p-2 text-teal-600 group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  {isLoading ? "..." : (data?.counts.approved ?? 0) + (data?.counts.scheduled ?? 0)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Approved & confirmed operational slots</p>
            </Link>

            {/* Card 4: Active Flights */}
            <Link
              href="/ops/campaigns?status=READY_FOR_OPERATIONS"
              className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">Active Flights</span>
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 group-hover:scale-110 transition-transform">
                  <Plane className="h-5 w-5 animate-pulse" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-extrabold text-slate-900">
                  {isLoading ? "..." : data?.counts.activeFlight ?? 0}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Airborne or ready for field deployment</p>
            </Link>
          </div>

          {/* Quick Actions & Recent Queue Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Recent Submissions */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Inbox className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">Recent Queue Items</h2>
                </div>
                <Link
                  href="/ops/campaigns"
                  className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-500"
                >
                  View All ({isLoading ? 0 : data?.recentCampaigns.length}) <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                  <p className="text-xs text-slate-400 mt-1">Loading queue items...</p>
                </div>
              ) : data?.recentCampaigns.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No campaigns submitted for review yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data?.recentCampaigns.map((camp) => (
                    <div key={camp.id} className="py-3 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-900 text-sm block truncate max-w-sm">
                          {camp.name}
                        </span>
                        <div className="flex items-center space-x-3 text-xs text-slate-500">
                          <span className="flex items-center">
                            <Building2 className="mr-1 h-3.5 w-3.5 text-slate-400" />
                            {camp.organization.name}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                            {camp.zone?.name || "Zone TBD"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {camp.status}
                        </span>
                        <Link
                          href={`/ops/campaigns/${camp.id}`}
                          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          Inspect
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Shortcuts & Operations Links */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Operations Shortcuts
                </h3>
                <div className="space-y-2 text-xs">
                  <Link
                    href="/ops/campaigns?status=SUBMITTED"
                    className="flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 border border-slate-100 text-slate-700 transition-colors"
                  >
                    <span className="font-semibold">Review Pending Submissions</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/ops/zones"
                    className="flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 border border-slate-100 text-slate-700 transition-colors"
                  >
                    <span className="font-semibold">Manage Airspace Zones</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/app/dashboard"
                    className="flex items-center justify-between rounded-lg p-2.5 hover:bg-slate-50 border border-slate-100 text-slate-700 transition-colors"
                  >
                    <span className="font-semibold">Switch to Advertiser Portal</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* Pilot Reference Card */}
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-xs text-amber-900 space-y-2">
                <span className="font-bold flex items-center">
                  <ShieldAlert className="mr-1 h-4 w-4 text-amber-700" />
                  Safety Protocol Checklist
                </span>
                <p className="text-amber-800">
                  Every deployment must satisfy the 4 pre-flight pillars: Creative Standards, Airspace Green Zone,
                  Venue NOC, and Wind Envelope under 15 knots.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
