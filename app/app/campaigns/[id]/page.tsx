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
      <div className="flex min-h-screen items-center justify-center bg-white text-xs text-slate-400">
        <Clock className="mr-2 h-4 w-4 animate-spin text-slate-400" />
        Loading campaign...
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <XCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
        <h2 className="text-sm font-bold text-slate-900">Campaign not found</h2>
        <p className="mt-1 text-xs text-slate-400">{error || "Unable to retrieve details."}</p>
        <Link
          href="/app/campaigns"
          className="mt-4 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
        >
          Return to campaigns
        </Link>
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
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-900 pb-16">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <Link
              href="/app/campaigns"
              className="inline-flex items-center text-xs font-medium text-slate-400 hover:text-slate-900"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Campaigns
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-900">{campaign.name}</span>
          </div>

          <div className="flex items-center space-x-3">
            {isCancellable && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Cancel
              </button>
            )}
            <Link
              href="/app/campaigns"
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              All Campaigns
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* Status Tracker */}
        <CampaignStatusTracker status={campaign.status} />

        {/* Feedback / Alert Banners */}
        {campaign.status === CampaignStatus.CHANGES_REQUESTED && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-orange-950">
                    Reviewer Feedback
                  </h3>
                  {latestDecision && (
                    <p className="mt-1 text-xs text-orange-900 font-medium italic">
                      &quot;{latestDecision.reason}&quot;
                    </p>
                  )}
                </div>

                <form onSubmit={handleResubmit} className="space-y-3 pt-2">
                  <input
                    type="text"
                    value={resubmitNotes}
                    onChange={(e) => setResubmitNotes(e.target.value)}
                    placeholder="Briefly describe updates made for the reviewer..."
                    className="w-full rounded-xl border border-orange-200 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      disabled={resubmitting}
                      className="rounded-full bg-orange-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-500 disabled:opacity-50"
                    >
                      <Send className="inline mr-1 h-3 w-3" />
                      {resubmitting ? "Submitting..." : "Resubmit for Review"}
                    </button>
                    {resubmitSuccess && (
                      <span className="text-xs font-medium text-emerald-700 flex items-center">
                        <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-600" />
                        Resubmitted!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {campaign.status === CampaignStatus.REJECTED && (
          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-6 text-xs text-red-900">
            <h3 className="font-bold text-sm">Campaign Not Approved</h3>
            {latestDecision && (
              <p className="mt-1 text-red-800 italic">&quot;{latestDecision.reason}&quot;</p>
            )}
            {latestPayment?.refunds?.[0] && (
              <div className="mt-3 flex items-center space-x-1.5 text-emerald-800 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Full refund of {formatPaise(latestPayment.refunds[0].amountPaise)} processed.</span>
              </div>
            )}
          </div>
        )}

        {/* 2-Column Clean Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 spans): Creative & Zone */}
          <div className="space-y-6 lg:col-span-2">
            {/* Creative Card */}
            <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Creative Asset
                  </h3>
                </div>
                {campaign.assets[0] && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                    {campaign.assets[0].validationStatus}
                  </span>
                )}
              </div>

              {campaign.assets.length > 0 ? (
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-xl bg-slate-950 p-6 text-white flex flex-col justify-center items-center text-center">
                    <p className="text-lg font-bold">{campaign.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{campaign.brand}</p>
                    {campaign.ctaText && (
                      <span className="mt-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium">
                        {campaign.ctaText}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>{campaign.assets[0]?.originalName}</span>
                    <span>
                      {campaign.assets[0]?.width || 1920} × {campaign.assets[0]?.height || 1080}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No creative asset uploaded.</p>
              )}
            </div>

            {/* Flight Zone Map */}
            <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Flight Zone
                  </h3>
                </div>
                <span className="text-xs font-medium text-slate-700">
                  {campaign.zone?.name || "Unassigned"}
                </span>
              </div>

              {campaign.zone ? (
                <div className="space-y-3">
                  <div className="h-64 w-full overflow-hidden rounded-xl border border-slate-100">
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
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>DGCA Green Airspace Verified</span>
                    <span>Max 400 ft AGL</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No zone selected.</p>
              )}
            </div>
          </div>

          {/* Right Column (1 span): Schedule, Receipt, Timeline */}
          <div className="space-y-6">
            {/* Schedule Card */}
            <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
                <Calendar className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Window
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Date</span>
                  <span className="font-semibold text-slate-800">
                    {campaign.startAt
                      ? new Date(campaign.startAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Unset"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hours</span>
                  <span className="font-medium text-slate-800">
                    {latestQuote?.billableHours || 2} Hours
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Card */}
            <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
                <CreditCard className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Quote
                </h3>
              </div>

              {latestQuote ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Base rate</span>
                    <span>{formatPaise(latestQuote.zoneRatePaise)}/hr</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatPaise(latestQuote.subtotalPaise)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (18%)</span>
                    <span>{formatPaise(latestQuote.gstPaise)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
                    <span>Total</span>
                    <span className="text-blue-600">{formatPaise(latestQuote.totalPaise)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Quote pending.</p>
              )}
            </div>

            {/* Timeline History Card */}
            <div className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
                <History className="h-4 w-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Timeline
                </h3>
              </div>

              <div className="space-y-3">
                {campaign.statusEvents.length > 0 ? (
                  campaign.statusEvents.slice(0, 4).map((evt) => (
                    <div key={evt.id} className="text-xs border-l-2 border-slate-200 pl-3 py-0.5">
                      <div className="font-semibold text-slate-800">
                        {evt.toStatus.replace(/_/g, " ")}
                      </div>
                      {evt.reason && <div className="text-[11px] text-slate-500">{evt.reason}</div>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No events.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Cancel Campaign</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to cancel this request? Any slot hold will be released.
            </p>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Go back
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
              >
                {cancelling ? "Cancelling..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
