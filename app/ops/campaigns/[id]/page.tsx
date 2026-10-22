"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { CampaignStatus } from "@prisma/client";
import {
  ArrowLeft,
  ShieldAlert,
  Calendar,
  MapPin,
  Clock,
  Building2,
  FileText,
  CreditCard,
  History,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { MediaInspector } from "@/components/ops/media-inspector";
import { SafetyChecklist, SafetyChecklistState, ChecklistItemStatus } from "@/components/ops/safety-checklist";
import { ReviewActionPanel } from "@/components/ops/review-action-panel";

// Dynamically import Leaflet ZoneMap with SSR disabled
const ZoneMap = dynamic(
  () => import("@/components/maps/zone-map").then((mod) => mod.ZoneMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-[#ebebeb]/50">
        Loading Airspace Zone Map...
      </div>
    ),
  }
);

interface CampaignDetailData {
  id: string;
  name: string;
  brand: string;
  objective: string;
  description: string | null;
  status: CampaignStatus;
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
    slug: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  zone: {
    id: string;
    name: string;
    description: string | null;
    ratePerHourPaise: number;
    centerLat: number;
    centerLng: number;
    capacity: number;
    geojson: unknown;
  } | null;
  assets: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    width: number | null;
    height: number | null;
    durationSec: number | null;
    storageKey: string;
    validationStatus: string;
    validationNote: string | null;
  }>;
  quotes: Array<{
    id: string;
    totalPaise: number;
    billableHours: number;
    subtotalPaise: number;
    gstPaise: number;
    currency: string;
  }>;
  payments: Array<{
    id: string;
    amountPaise: number;
    currency: string;
    status: string;
    providerOrderId: string;
    providerPaymentId: string | null;
    paidAt: string | null;
    refunds: Array<{
      id: string;
      amountPaise: number;
      reason: string;
      status: string;
    }>;
  }>;
  statusEvents: Array<{
    id: string;
    fromStatus: CampaignStatus | null;
    toStatus: CampaignStatus;
    actorId: string | null;
    actorType: string;
    reason: string | null;
    createdAt: string;
  }>;
  decisions: Array<{
    id: string;
    decision: string;
    reason: string;
    constraints: string | null;
    createdAt: string;
    reviewer: {
      name: string;
      email: string;
    };
  }>;
}

export default function OpsCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safety checklist local state
  const [checklist, setChecklist] = useState<SafetyChecklistState>({
    creativeStandards: "NOT_CHECKED",
    airspaceClearance: "NOT_CHECKED",
    venuePolicePermits: "NOT_CHECKED",
    weatherEnvelope: "NOT_CHECKED",
  });

  const handleChecklistChange = (key: keyof SafetyChecklistState, status: ChecklistItemStatus) => {
    setChecklist((prev) => ({ ...prev, [key]: status }));
  };

  const fetchCampaign = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ops/campaigns/${campaignId}`);
      if (!res.ok) {
        throw new Error("Failed to load campaign detail");
      }
      const data = await res.json();
      setCampaign(data.campaign);

      // Auto-set checklist to verified if campaign is already approved or scheduled
      if (
        data.campaign.status === "APPROVED_FOR_SCHEDULING" ||
        data.campaign.status === "SCHEDULED" ||
        data.campaign.status === "READY_FOR_OPERATIONS" ||
        data.campaign.status === "IN_PROGRESS" ||
        data.campaign.status === "COMPLETED"
      ) {
        setChecklist({
          creativeStandards: "VERIFIED",
          airspaceClearance: "VERIFIED",
          venuePolicePermits: "VERIFIED",
          weatherEnvelope: "VERIFIED",
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error fetching campaign");
    } finally {
      setIsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId, fetchCampaign]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#000000] p-8 flex items-center justify-center text-[#ebebeb]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#ccff00] mx-auto" />
          <p className="font-mono text-xs uppercase tracking-wider text-[#ebebeb]/60">Loading Campaign Review Inspection...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen w-full bg-[#000000] p-8 flex items-center justify-center text-[#ebebeb]">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-[#0c0c0c] p-6 text-center space-y-4">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
          <h2 className="font-heading text-lg font-bold text-[#ebebeb]">Campaign Not Found</h2>
          <p className="text-xs text-[#ebebeb]/60">{error || "Could not retrieve campaign details."}</p>
          <button
            onClick={() => router.push("/ops/campaigns")}
            className="inline-flex items-center font-mono text-xs uppercase tracking-wider font-semibold text-[#ccff00] hover:text-white"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Return to Review Queue
          </button>
        </div>
      </div>
    );
  }

  const primaryAsset = campaign.assets[0] || null;
  const quote = campaign.quotes[0] || null;
  const payment = campaign.payments[0] || null;

  const allChecklistVerified =
    checklist.creativeStandards === "VERIFIED" &&
    checklist.airspaceClearance === "VERIFIED" &&
    checklist.venuePolicePermits === "VERIFIED" &&
    checklist.weatherEnvelope === "VERIFIED";

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#ebebeb] flex flex-col relative overflow-x-hidden selection:bg-[#ccff00] selection:text-black font-sans">
      
      <div className="absolute top-0 right-10 w-[600px] h-[600px] glow-sphere-lime pointer-events-none z-0" />

      {/* Standard Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-[#000000]/85 backdrop-blur-[16px] border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link
              href="/ops/campaigns"
              className="inline-flex items-center font-mono text-xs uppercase tracking-wider text-[#ebebeb]/70 hover:text-white rounded-full border border-white/10 bg-white/5 px-3 py-1.5 transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Review Queue
            </Link>
            <span className="text-white/20">|</span>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-heading text-sm sm:text-base font-bold text-[#ebebeb] truncate max-w-xs sm:max-w-md">
                  {campaign.name}
                </h1>
                <span className="font-mono text-[10px] uppercase tracking-wider rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 px-2 py-0.5 text-[#ccff00]">
                  {campaign.status}
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#ebebeb]/40">
                {campaign.organization.name} • Brand: <strong className="text-[#ebebeb]/80">{campaign.brand}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs text-[#ebebeb]/50 hidden sm:inline">
              Submitted: {new Date(campaign.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center space-x-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 font-mono text-xs font-bold text-amber-300 border border-amber-500/30">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>Operations Inspector</span>
            </div>
          </div>
        </div>
      </header>

      {/* Safety Boundary Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-200 relative z-10 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <p className="flex items-center">
            <ShieldAlert className="mr-2 h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Regulatory Boundary:</strong> Review verifies creative standards, airspace clearance,
              and venue permits. Approval constitutes a scheduling clearance, never automated flight authorization.
            </span>
          </p>
          <span className="font-mono text-[10px] text-amber-300/80 uppercase tracking-widest hidden md:inline">DGCA Compliant</span>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Media & Airspace & Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Creative Media Inspector */}
            <MediaInspector asset={primaryAsset} />

            {/* 2. Zone & Airspace Feasibility Map */}
            <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-[#10b981]" />
                  <h3 className="font-heading text-base font-bold text-[#ebebeb] tracking-tight">
                    Airspace Zone: {campaign.zone?.name || "Unassigned"}
                  </h3>
                </div>
                <div className="font-mono text-xs font-semibold text-[#ccff00]">
                  Rate: ₹{((campaign.zone?.ratePerHourPaise || 0) / 100).toLocaleString()}/hr
                </div>
              </div>

              <div className="h-64 w-full rounded-xl overflow-hidden border border-white/10">
                <ZoneMap
                  zones={[
                    {
                      id: campaign.zone?.id || "zone-0",
                      name: campaign.zone?.name || "Requested Zone",
                      description: campaign.zone?.description || null,
                      centerLat: campaign.zone?.centerLat || 12.9716,
                      centerLng: campaign.zone?.centerLng || 77.6412,
                      ratePerHourPaise: campaign.zone?.ratePerHourPaise || 0,
                      capacity: campaign.zone?.capacity || 1,
                      geojson: campaign.zone?.geojson || {},
                      isActive: true,
                      notes: null,
                    },
                  ]}
                  selectedZoneId={campaign.zone?.id || undefined}
                  center={[campaign.zone?.centerLat || 12.9716, campaign.zone?.centerLng || 77.6412]}
                  zoom={14}
                />
              </div>

              {/* Schedule Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 flex items-start space-x-2.5">
                  <Calendar className="h-4 w-4 text-[#ccff00] mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40 block">Flight Start Window</span>
                    <span className="font-mono text-xs text-[#ebebeb]">
                      {campaign.startAt ? new Date(campaign.startAt).toLocaleString() : "TBD"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-3 border border-white/5 flex items-start space-x-2.5">
                  <Clock className="h-4 w-4 text-[#ccff00] mt-0.5" />
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40 block">Flight End Window</span>
                    <span className="font-mono text-xs text-[#ebebeb]">
                      {campaign.endAt ? new Date(campaign.endAt).toLocaleString() : "TBD"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Advertiser Notes & Metadata */}
            <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
                <FileText className="h-5 w-5 text-[#ccff00]" />
                <h3 className="font-heading text-base font-bold text-[#ebebeb] tracking-tight">Campaign Specifications & Intent</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40 block">Objective</span>
                  <span className="font-mono text-[#ebebeb] mt-0.5 block">{campaign.objective}</span>
                </div>
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40 block">Scheduling Flexibility</span>
                  <span className="font-mono text-[#ebebeb] mt-0.5 block">{campaign.flexibility || "Fixed Window"}</span>
                </div>
                {campaign.ctaText && (
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40 block">Call to Action (CTA)</span>
                    <span className="font-mono text-[#ebebeb] mt-0.5 block">{campaign.ctaText}</span>
                  </div>
                )}
                {campaign.destinationUrl && (
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40 block">Destination URL</span>
                    <a
                      href={campaign.destinationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[#ccff00] hover:underline truncate block mt-0.5"
                    >
                      {campaign.destinationUrl}
                    </a>
                  </div>
                )}
                {campaign.audienceNotes && (
                  <div className="sm:col-span-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40 block">Target Context / Audience Notes</span>
                    <p className="text-[#ebebeb]/80 mt-1 bg-white/[0.03] p-3 rounded-xl border border-white/5 text-xs leading-relaxed">
                      {campaign.audienceNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Review Decisions & Audit History */}
            <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
                <History className="h-5 w-5 text-[#10b981]" />
                <h3 className="font-heading text-base font-bold text-[#ebebeb] tracking-tight">Review Decisions & Event Timeline</h3>
              </div>

              {campaign.statusEvents.length === 0 ? (
                <p className="font-mono text-xs text-[#ebebeb]/40 py-4 text-center">No status events recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {campaign.statusEvents.map((evt) => (
                    <div key={evt.id} className="flex items-start space-x-3 text-xs border-l-2 border-[#ccff00] pl-3 py-1">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[#ebebeb]">
                            {evt.fromStatus ? `${evt.fromStatus} → ` : ""}
                            {evt.toStatus}
                          </span>
                          <span className="font-mono text-[10px] text-[#ebebeb]/40">
                            {new Date(evt.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {evt.reason && <p className="text-[#ebebeb]/70 mt-1 italic">&ldquo;{evt.reason}&rdquo;</p>}
                        <span className="text-[10px] font-mono text-[#ebebeb]/40">Actor: {evt.actorType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Review Action Panel & Checklist */}
          <div className="space-y-6">
            {/* 1. Review Decision Actions */}
            <ReviewActionPanel
              campaignId={campaign.id}
              currentStatus={campaign.status}
              allChecklistVerified={allChecklistVerified}
              onDecisionSubmitted={fetchCampaign}
            />

            {/* 2. Pre-Flight Safety Checklist */}
            <SafetyChecklist
              state={checklist}
              onChange={handleChecklistChange}
              readOnly={
                campaign.status === "COMPLETED" ||
                campaign.status === "REJECTED" ||
                campaign.status === "CANCELLED"
              }
            />

            {/* 3. Financial & Payment Summary */}
            <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-[#ccff00]" />
                  <h3 className="font-heading text-base font-bold text-[#ebebeb] tracking-tight">Payment & Pricing Verification</h3>
                </div>
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider rounded-full px-2.5 py-0.5 font-bold ${
                    payment?.status === "PAID"
                      ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {payment?.status || "NO PAYMENT"}
                </span>
              </div>

              {quote ? (
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-[#ebebeb]/60">
                    <span>Billable Duration:</span>
                    <span className="font-mono text-[#ebebeb]">{quote.billableHours} hrs</span>
                  </div>
                  <div className="flex justify-between text-[#ebebeb]/60">
                    <span>Subtotal:</span>
                    <span className="font-mono text-[#ebebeb]">₹{(quote.subtotalPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[#ebebeb]/60">
                    <span>GST (18%):</span>
                    <span className="font-mono text-[#ebebeb]">₹{(quote.gstPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t border-white/10 text-sm">
                    <span className="font-heading font-bold text-[#ebebeb]">Total Paid (Paise):</span>
                    <span className="font-mono text-xl font-bold text-[#ccff00]">
                      ₹{(quote.totalPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {payment?.providerOrderId && (
                    <div className="pt-2 text-[10px] text-[#ebebeb]/40 font-mono">
                      Order: {payment.providerOrderId}
                    </div>
                  )}
                  {payment?.refunds && payment.refunds.length > 0 && (
                    <div className="rounded-xl bg-red-500/10 p-3 text-xs text-red-300 border border-red-500/20 mt-2">
                      <span className="font-mono font-bold block text-red-400">Refund Processed:</span>
                      ₹{(payment.refunds[0]!.amountPaise / 100).toFixed(2)} ({payment.refunds[0]!.reason})
                    </div>
                  )}
                </div>
              ) : (
                <p className="font-mono text-xs text-[#ebebeb]/40">No quote generated yet.</p>
              )}
            </div>

            {/* 4. Advertiser Organization Info */}
            <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl space-y-2.5 text-xs">
              <div className="flex items-center space-x-2 text-[#ebebeb] font-semibold mb-2">
                <Building2 className="h-4 w-4 text-[#ccff00]" />
                <span className="font-mono uppercase tracking-wider text-xs">Account Information</span>
              </div>
              <p className="text-[#ebebeb]/70">
                Organization: <strong className="text-[#ebebeb]">{campaign.organization.name}</strong>
              </p>
              <p className="text-[#ebebeb]/70">
                Contact: <span className="font-mono text-[#ebebeb]/90">{campaign.createdBy.name} ({campaign.createdBy.email})</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
