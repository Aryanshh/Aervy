"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CampaignStatus } from "@prisma/client";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  History,
  AlertCircle,
  XCircle,
  Send,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { CampaignStatusTracker } from "@/components/campaigns/campaign-status-tracker";

import { ZoneMap } from "@/components/maps/zone-map";

interface CampaignDetail {
  id: string;
  name: string;
  brand: string;
  objective: string;
  description: string | null;
  status: CampaignStatus;
  version: number;
  startAt: string | null;
  endAt: string | null;
  flexibility: string | null;
  audienceNotes: string | null;
  ctaText: string | null;
  destinationUrl: string | null;
  createdAt: string;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
    contactEmail: string;
  };
  zone: {
    id: string;
    name: string;
    centerLat: number;
    centerLng: number;
    ratePerHourPaise: number;
    geojson: unknown;
  } | null;
  assets: Array<{
    id: string;
    originalName: string;
    storageKey: string;
    mimeType: string;
    sizeBytes: number;
    width: number | null;
    height: number | null;
    durationSec: number | null;
    validationStatus: string;
  }>;
  quotes: Array<{
    id: string;
    zoneRatePaise: number;
    billableHours: number;
    subtotalPaise: number;
    multiplierBps: number;
    gstPaise: number;
    totalPaise: number;
  }>;
  payments: Array<{
    id: string;
    amountPaise: number;
    provider: string;
    providerOrderId: string;
    providerPaymentId: string | null;
    status: string;
    paidAt: string | null;
    refunds: Array<{
      id: string;
      amountPaise: number;
      reason: string;
      status: string;
      createdAt: string;
    }>;
  }>;
  decisions: Array<{
    id: string;
    decision: string;
    reason: string;
    constraints: string | null;
    createdAt: string;
    reviewer: {
      name: string;
    };
  }>;
  statusEvents: Array<{
    id: string;
    fromStatus: CampaignStatus | null;
    toStatus: CampaignStatus;
    actorType: string;
    reason: string | null;
    createdAt: string;
  }>;
}

export default function CampaignTrackerDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resubmission state
  const [resubmitNotes, setResubmitNotes] = useState("");
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitSuccess, setResubmitSuccess] = useState(false);

  // Cancellation state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/campaigns/${campaignId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load campaign");
      }
      setCampaign(data.campaign);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResubmitting(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resubmit",
          notes: resubmitNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to resubmit campaign");
      }
      setResubmitSuccess(true);
      fetchCampaign();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to resubmit");
    } finally {
      setResubmitting(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancel",
          reason: cancelReason || "Cancelled by advertiser",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel campaign");
      }
      setShowCancelModal(false);
      fetchCampaign();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  };

  const formatPaise = (paise?: number) => {
    if (paise === undefined || paise === null) return "—";
    return `₹${(paise / 100).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Clock className="h-4 w-4 animate-spin text-blue-600" />
          <span>Loading campaign details...</span>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <XCircle className="mx-auto h-10 w-10 text-red-500" />
          <h2 className="mt-3 text-base font-semibold text-slate-900">Campaign Not Found</h2>
          <p className="mt-1 text-xs text-slate-500">{error || "Unable to retrieve campaign."}</p>
          <div className="mt-6">
            <Link
              href="/app/campaigns"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Return to Campaign List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestQuote = campaign.quotes[0];
  const latestPayment = campaign.payments[0];
  const latestDecision = campaign.decisions[0];
  const isCancellable = (
    [
      CampaignStatus.DRAFT,
      CampaignStatus.PENDING_PAYMENT,
      CampaignStatus.SUBMITTED,
      CampaignStatus.CHANGES_REQUESTED,
    ] as CampaignStatus[]
  ).includes(campaign.status);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/app/campaigns"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Campaigns
            </Link>
            <span className="text-slate-300">/</span>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-sm">{campaign.name}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                {campaign.id}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isCancellable && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50"
              >
                Cancel Campaign
              </button>
            )}
            <Link
              href="/app/campaigns"
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              All Campaigns
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Safety Boundary Notice */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
          <p className="font-semibold">⚠️ Safety Boundary Reminder:</p>
          <p className="mt-0.5">
            Your campaign submission is an <strong>operational flight request</strong>. All flight executions
            strictly depend on ground operations verification, DGCA Green Zone compliance, weather clearance (&lt;15 knots),
            and remote pilot in command (RPIC) on-site sign-off.
          </p>
        </div>

        {/* 1. Visual Status Tracker */}
        <CampaignStatusTracker status={campaign.status} />

        {/* 2. Feedback & Action Banners */}
        {campaign.status === CampaignStatus.CHANGES_REQUESTED && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-orange-900">
                  Action Required: Operational Changes Requested
                </h3>
                <p className="mt-1 text-xs text-orange-800">
                  Our operations review team reviewed your submission and requested the following modifications:
                </p>

                {latestDecision && (
                  <div className="mt-3 rounded-lg border border-orange-200 bg-white p-4">
                    <p className="text-xs font-semibold text-slate-800">Reviewer Note:</p>
                    <p className="mt-1 text-xs text-slate-700 italic">
                      &quot;{latestDecision.reason}&quot;
                    </p>
                    {latestDecision.constraints && (
                      <p className="mt-2 text-xs text-slate-600">
                        <span className="font-semibold">Constraints:</span> {latestDecision.constraints}
                      </p>
                    )}
                    <p className="mt-2 text-[10px] text-slate-400">
                      Reviewed by {latestDecision.reviewer?.name || "Operations Lead"} on{" "}
                      {new Date(latestDecision.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                )}

                {/* Resubmission Form */}
                <form onSubmit={handleResubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-orange-950">
                      Notes on Updates Made for the Operations Reviewer:
                    </label>
                    <textarea
                      rows={3}
                      value={resubmitNotes}
                      onChange={(e) => setResubmitNotes(e.target.value)}
                      placeholder="e.g. Uploaded revised 1080p creative with higher text contrast and adjusted display safe zones."
                      className="mt-1 w-full rounded-md border border-orange-200 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      disabled={resubmitting}
                      className="inline-flex items-center rounded-md bg-orange-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-500 disabled:opacity-50"
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      {resubmitting ? "Submitting..." : "Resubmit Campaign for Review"}
                    </button>
                    {resubmitSuccess && (
                      <span className="text-xs font-semibold text-emerald-700 flex items-center">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                        Resubmitted successfully!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {campaign.status === CampaignStatus.REJECTED && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-red-900">
                  Campaign Not Feasible — Full Refund Issued
                </h3>
                <p className="mt-1 text-xs text-red-800">
                  This campaign was rejected by Operations due to safety or airspace constraints.
                  In accordance with Aervy policy, a 100% automatic refund has been processed.
                </p>

                {latestDecision && (
                  <div className="mt-3 rounded-lg border border-red-200 bg-white p-4">
                    <p className="text-xs font-semibold text-slate-800">Rejection Reason:</p>
                    <p className="mt-1 text-xs text-slate-700 italic">
                      &quot;{latestDecision.reason}&quot;
                    </p>
                    <p className="mt-2 text-[10px] text-slate-400">
                      Decided on {new Date(latestDecision.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                )}

                {latestPayment?.refunds?.[0] && (
                  <div className="mt-3 flex items-center space-x-2 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>
                      Automatic refund of {formatPaise(latestPayment.refunds[0].amountPaise)} logged to payment{" "}
                      <code className="bg-emerald-100 px-1 py-0.5 rounded text-[11px]">
                        {latestPayment.providerPaymentId || latestPayment.id}
                      </code>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {campaign.status === CampaignStatus.ON_HOLD && (
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-6 shadow-sm">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-purple-900">
                  Operations Hold in Effect
                </h3>
                <p className="mt-1 text-xs text-purple-800">
                  Operations has placed this campaign on temporary hold (e.g. active NOTAM, sudden local weather
                  above 14 knots, or local airspace restriction). The operations lead will resume the schedule once
                  conditions clear.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Detailed Inspection Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column (2 spans): Creative, Map, & Specs */}
          <div className="space-y-6 lg:col-span-2">
            {/* Creative Asset Preview */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Creative Asset</h3>
                </div>
                {campaign.assets[0] && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    {campaign.assets[0].validationStatus}
                  </span>
                )}
              </div>

              {campaign.assets.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
                    <p className="text-lg font-bold tracking-tight text-white">
                      {campaign.name}
                    </p>
                    <p className="mt-1 text-xs text-blue-400 font-semibold uppercase tracking-wider">
                      {campaign.brand}
                    </p>
                    {campaign.ctaText && (
                      <div className="mt-4 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm">
                        {campaign.ctaText}
                      </div>
                    )}
                    <div className="absolute bottom-2 right-3 text-[10px] text-slate-400">
                      Asset: {campaign.assets[0]?.originalName}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Format</span>
                      <span className="font-medium text-slate-800">{campaign.assets[0]?.mimeType}</span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Size</span>
                      <span className="font-medium text-slate-800">
                        {((campaign.assets[0]?.sizeBytes || 0) / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Dimensions</span>
                      <span className="font-medium text-slate-800">
                        {campaign.assets[0]?.width || 1920} × {campaign.assets[0]?.height || 1080}
                      </span>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Duration</span>
                      <span className="font-medium text-slate-800">
                        {campaign.assets[0]?.durationSec ? `${campaign.assets[0].durationSec}s` : "Static Banner"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                  No creative asset uploaded yet.
                </div>
              )}
            </div>

            {/* Flight Zone Map */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Approved Flight Zone & Geofence</h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {campaign.zone?.name || "Unassigned Zone"}
                </span>
              </div>

              {campaign.zone ? (
                <div className="space-y-3">
                  <div className="h-72 w-full overflow-hidden rounded-lg border border-slate-200">
                    <ZoneMap
                      zones={[
                        {
                          id: campaign.zone.id,
                          name: campaign.zone.name,
                          description: null,
                          centerLat: campaign.zone.centerLat,
                          centerLng: campaign.zone.centerLng,
                          ratePerHourPaise: campaign.zone.ratePerHourPaise,
                          capacity: 1,
                          geojson: campaign.zone.geojson,
                          isActive: true,
                          notes: null,
                        },
                      ]}
                      selectedZoneId={campaign.zone.id}
                      center={[campaign.zone.centerLat, campaign.zone.centerLng]}
                      zoom={14}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Center Coordinates: {campaign.zone.centerLat.toFixed(4)}, {campaign.zone.centerLng.toFixed(4)}
                    </span>
                    <span className="font-semibold text-emerald-600">DGCA Green Airspace Verified</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
                  No flight zone assigned to this draft.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (1 span): Schedule, Receipt, & Audit Timeline */}
          <div className="space-y-6">
            {/* Flight Schedule Window */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Schedule Window</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] uppercase font-semibold text-slate-400 block">Flight Date</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {campaign.startAt
                      ? new Date(campaign.startAt).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Unscheduled"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase font-semibold text-slate-400 block">Time Slot</span>
                  <span className="text-sm font-semibold text-slate-800">
                    {campaign.startAt && campaign.endAt
                      ? `${new Date(campaign.startAt).toLocaleTimeString("en-IN", {
                          timeStyle: "short",
                        })} – ${new Date(campaign.endAt).toLocaleTimeString("en-IN", {
                          timeStyle: "short",
                        })}`
                      : "Flexible"}
                  </span>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span className="text-slate-500">Billable Hours</span>
                  <span className="font-semibold text-slate-800">
                    {latestQuote?.billableHours || 2} Hours
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Schedule Flexibility</span>
                  <span className="font-semibold text-slate-800">
                    {campaign.flexibility || "FIXED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Receipt & Payment Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Financial Breakdown</h3>
              </div>

              {latestQuote ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Hourly Rate</span>
                    <span>{formatPaise(latestQuote.zoneRatePaise)}/hr</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({latestQuote.billableHours} hrs)</span>
                    <span>{formatPaise(latestQuote.subtotalPaise)}</span>
                  </div>
                  {latestQuote.multiplierBps !== 10000 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Peak Adjustment</span>
                      <span>{((latestQuote.multiplierBps - 10000) / 100).toFixed(1)}%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%)</span>
                    <span>{formatPaise(latestQuote.gstPaise)}</span>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
                    <span>Total Amount</span>
                    <span className="text-blue-600">{formatPaise(latestQuote.totalPaise)}</span>
                  </div>

                  {latestPayment && (
                    <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Status:</span>
                        <span className="font-semibold text-emerald-600">{latestPayment.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Order ID:</span>
                        <span className="font-mono text-slate-700">{latestPayment.providerOrderId}</span>
                      </div>
                      {latestPayment.providerPaymentId && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Payment ID:</span>
                          <span className="font-mono text-slate-700">{latestPayment.providerPaymentId}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No quote generated yet.</p>
              )}
            </div>

            {/* Status History & Audit Log */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
                <History className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Workflow History</h3>
              </div>

              <div className="space-y-3">
                {campaign.statusEvents.length > 0 ? (
                  campaign.statusEvents.map((evt) => (
                    <div key={evt.id} className="relative pl-4 border-l-2 border-blue-200 pb-2 text-xs">
                      <div className="font-semibold text-slate-800">
                        {evt.toStatus.replace(/_/g, " ")}
                      </div>
                      {evt.reason && (
                        <div className="text-slate-600 text-[11px] mt-0.5">{evt.reason}</div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(evt.createdAt).toLocaleString("en-IN", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No status events recorded yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Cancel Campaign Request</h3>
            <p className="mt-1 text-xs text-slate-500">
              Are you sure you want to cancel this campaign? Any associated slot hold will be released.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700">
                Cancellation Reason:
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Event rescheduling or marketing campaign scope adjustment."
                className="mt-1 w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
