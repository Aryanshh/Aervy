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
      <div className="flex min-h-screen items-center justify-center bg-[#000000] font-mono text-xs text-[#ebebeb]/50">
        <Clock className="mr-2 h-4 w-4 animate-spin text-[#ccff00]" />
        Loading campaign telemetry...
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#000000] p-6 text-center text-[#ebebeb]">
        <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
        <h2 className="text-sm font-heading font-bold text-[#ebebeb]">Campaign not found</h2>
        <p className="mt-1 text-xs font-mono text-[#ebebeb]/40">{error || "Unable to retrieve details."}</p>
        <Link
          href="/app/campaigns"
          className="mt-4 rounded-full bg-[#ccff00] px-5 py-2 text-xs font-mono font-bold text-black hover:bg-white transition-colors"
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
    <div className="min-h-screen bg-[#000000] p-2 sm:p-5 lg:p-8 flex justify-center text-[#ebebeb] selection:bg-[#ccff00] selection:text-black font-sans pb-16">
      {/* Floating Shell Container */}
      <div className="w-full max-w-[1600px] rounded-[2.5rem] ring-1 ring-white/10 shadow-2xl bg-[#0c0c0c] overflow-hidden relative flex flex-col justify-between">
        
        {/* Background Grid & Noise */}
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-80" />
        <div className="absolute inset-0 bg-noise pointer-events-none mix-blend-overlay" />
        <div className="absolute top-0 right-10 w-[500px] h-[500px] glow-sphere-lime pointer-events-none" />

        {/* Header */}
        <header className="relative z-30 px-6 sm:px-10 py-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <Link
              href="/app/campaigns"
              className="inline-flex items-center text-xs font-mono text-[#ebebeb]/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Campaigns
            </Link>
            <span className="text-white/20">/</span>
            <span className="font-heading font-bold text-sm text-[#ebebeb]">{campaign.name}</span>
          </div>

          <div className="flex items-center gap-3">
            {isCancellable && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-mono font-bold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Cancel
              </button>
            )}
            <Link
              href="/app/campaigns"
              className="text-xs font-mono text-[#ebebeb]/50 hover:text-white px-3 py-1.5 transition-colors"
            >
              All Campaigns
            </Link>
          </div>
        </header>

        {/* Main Container */}
        <main className="relative z-20 flex-1 px-6 sm:px-12 py-8 space-y-6">
          
          {/* Status Tracker */}
          <CampaignStatusTracker status={campaign.status} />

          {/* Feedback / Alert Banners */}
          {campaign.status === CampaignStatus.CHANGES_REQUESTED && (
            <div className="rounded-[2rem] border border-orange-500/30 bg-orange-500/10 backdrop-blur-[16px] p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-3 font-mono">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-300">
                      Reviewer Feedback
                    </h3>
                    {latestDecision && (
                      <p className="mt-1 text-xs text-orange-200 font-medium italic">
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
                      className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-xs text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:outline-none"
                    />
                    <div className="flex items-center space-x-3">
                      <button
                        type="submit"
                        disabled={resubmitting}
                        className="rounded-full bg-orange-500 px-5 py-2 text-xs font-bold text-black hover:bg-white transition-all disabled:opacity-50"
                      >
                        <Send className="inline mr-1.5 h-3 w-3" />
                        {resubmitting ? "Submitting..." : "Resubmit for Review"}
                      </button>
                      {resubmitSuccess && (
                        <span className="text-xs font-medium text-[#10b981] flex items-center">
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-[#10b981]" />
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
            <div className="rounded-[2rem] border border-red-500/30 bg-red-500/10 backdrop-blur-[16px] p-6 text-xs font-mono text-red-200">
              <h3 className="font-heading font-bold text-sm text-red-400">Campaign Not Approved</h3>
              {latestDecision && (
                <p className="mt-1 text-red-300 italic">&quot;{latestDecision.reason}&quot;</p>
              )}
              {latestPayment?.refunds?.[0] && (
                <div className="mt-3 flex items-center space-x-1.5 text-[#10b981] font-bold">
                  <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                  <span>Full refund of {formatPaise(latestPayment.refunds[0].amountPaise)} processed.</span>
                </div>
              )}
            </div>
          )}

          {/* 2-Column Details Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column (2 spans): Creative & Zone */}
            <div className="space-y-6 lg:col-span-2">
              
              {/* Creative Card */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 font-mono">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-[#ccff00]" />
                    <h3 className="text-xs font-bold text-[#ebebeb] uppercase tracking-wider">
                      Creative Asset
                    </h3>
                  </div>
                  {campaign.assets[0] && (
                    <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] text-[#ebebeb]/70">
                      {campaign.assets[0].validationStatus}
                    </span>
                  )}
                </div>

                {campaign.assets.length > 0 ? (
                  <div className="space-y-3 font-mono">
                    <div className="aspect-video w-full rounded-2xl bg-black border border-white/10 p-6 text-[#ebebeb] flex flex-col justify-center items-center text-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
                      <p className="text-xl font-heading font-bold text-[#ebebeb] relative z-10">{campaign.name}</p>
                      <p className="text-xs text-[#ebebeb]/50 mt-1 relative z-10">{campaign.brand}</p>
                      {campaign.ctaText && (
                        <span className="mt-4 rounded-full bg-[#ccff00] text-black px-4 py-1.5 text-xs font-bold relative z-10 font-mono shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                          {campaign.ctaText}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-[11px] text-[#ebebeb]/40 pt-1">
                      <span>{campaign.assets[0]?.originalName}</span>
                      <span>
                        {campaign.assets[0]?.width || 1920} × {campaign.assets[0]?.height || 1080}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-mono text-[#ebebeb]/40 py-6 text-center">No creative asset uploaded.</p>
                )}
              </div>

              {/* Flight Zone Map */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 font-mono">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-[#ccff00]" />
                    <h3 className="text-xs font-bold text-[#ebebeb] uppercase tracking-wider">
                      Flight Zone
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#ccff00]">
                    {campaign.zone?.name || "Unassigned"}
                  </span>
                </div>

                {campaign.zone ? (
                  <div className="space-y-3 font-mono">
                    <div className="h-64 w-full overflow-hidden rounded-2xl border border-white/10">
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
                    <div className="flex justify-between text-[11px] text-[#ebebeb]/40">
                      <span>DGCA Green Airspace Verified</span>
                      <span className="text-[#10b981]">Max 400 ft AGL</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-mono text-[#ebebeb]/40 py-6 text-center">No zone selected.</p>
                )}
              </div>
            </div>

            {/* Right Column (1 span): Schedule, Receipt, Timeline */}
            <div className="space-y-6">
              
              {/* Schedule Card */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-6 shadow-xl font-mono">
                <div className="flex items-center space-x-2 pb-3 border-b border-white/10 mb-4">
                  <Calendar className="h-4 w-4 text-[#ccff00]" />
                  <h3 className="text-xs font-bold text-[#ebebeb] uppercase tracking-wider">
                    Window
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#ebebeb]/40">Date</span>
                    <span className="font-bold text-[#ebebeb]">
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
                    <span className="text-[#ebebeb]/40">Hours</span>
                    <span className="font-bold text-[#ccff00]">
                      {latestQuote?.billableHours || 2} Hours
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Card */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-6 shadow-xl font-mono">
                <div className="flex items-center space-x-2 pb-3 border-b border-white/10 mb-4">
                  <CreditCard className="h-4 w-4 text-[#ccff00]" />
                  <h3 className="text-xs font-bold text-[#ebebeb] uppercase tracking-wider">
                    Quote
                  </h3>
                </div>

                {latestQuote ? (
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-[#ebebeb]/60">
                      <span>Base rate</span>
                      <span>{formatPaise(latestQuote.zoneRatePaise)}/hr</span>
                    </div>
                    <div className="flex justify-between text-[#ebebeb]/60">
                      <span>Subtotal</span>
                      <span>{formatPaise(latestQuote.subtotalPaise)}</span>
                    </div>
                    <div className="flex justify-between text-[#ebebeb]/60">
                      <span>GST (18%)</span>
                      <span>{formatPaise(latestQuote.gstPaise)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-white/10 font-bold text-[#ebebeb] text-sm">
                      <span>Total</span>
                      <span className="text-[#ccff00]">{formatPaise(latestQuote.totalPaise)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#ebebeb]/40">Quote pending.</p>
                )}
              </div>

              {/* Timeline History Card */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-6 shadow-xl font-mono">
                <div className="flex items-center space-x-2 pb-3 border-b border-white/10 mb-4">
                  <History className="h-4 w-4 text-[#ccff00]" />
                  <h3 className="text-xs font-bold text-[#ebebeb] uppercase tracking-wider">
                    Timeline
                  </h3>
                </div>

                <div className="space-y-3">
                  {campaign.statusEvents.length > 0 ? (
                    campaign.statusEvents.slice(0, 4).map((evt) => (
                      <div key={evt.id} className="text-xs border-l-2 border-[#ccff00]/40 pl-3 py-1">
                        <div className="font-bold text-[#ebebeb]">
                          {evt.toStatus.replace(/_/g, " ")}
                        </div>
                        {evt.reason && <div className="text-[11px] text-[#ebebeb]/50 mt-0.5">{evt.reason}</div>}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#ebebeb]/40">No events.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-30 px-6 sm:px-10 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#ebebeb]/40">
          <div>© 2026 AERVY TECHNOLOGIES INC.</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/safety" className="hover:text-white">Safety</Link>
            <Link href="/app/campaigns" className="hover:text-white">Campaigns</Link>
          </div>
        </footer>

      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-heading font-bold text-[#ebebeb]">Cancel Campaign</h3>
            <p className="text-xs text-[#ebebeb]/60">
              Are you sure you want to cancel this request? Any slot hold will be released.
            </p>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full rounded-xl border border-white/10 bg-black/60 p-2.5 text-xs text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:outline-none"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="rounded-full px-4 py-1.5 text-xs font-medium text-[#ebebeb]/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Go back
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-full bg-red-500 px-5 py-1.5 text-xs font-bold text-white hover:bg-red-400 transition-colors"
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
