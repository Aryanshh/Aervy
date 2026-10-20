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
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
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
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading Campaign Review Inspection...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-md mx-auto rounded-xl border border-red-200 bg-white p-6 text-center space-y-4">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h2 className="text-base font-bold text-slate-900">Campaign Not Found</h2>
          <p className="text-xs text-slate-600">{error || "Could not retrieve campaign details."}</p>
          <button
            onClick={() => router.push("/ops/campaigns")}
            className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Return to Review Queue
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link
              href="/ops/campaigns"
              className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Review Queue
            </Link>
            <span className="text-slate-300">|</span>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                  {campaign.name}
                </h1>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
                  {campaign.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {campaign.organization.name} • Brand: <strong>{campaign.brand}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Submitted: {new Date(campaign.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center space-x-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-200">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>Operations Inspector</span>
            </div>
          </div>
        </div>
      </header>

      {/* Safety Boundary Banner */}
      <div className="bg-amber-600/10 border-b border-amber-200 px-4 py-2 text-xs text-amber-900">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <p className="flex items-center">
            <ShieldAlert className="mr-1.5 h-4 w-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Regulatory Boundary:</strong> Review verifies creative standards, airspace clearance,
              and venue permits. Approval constitutes a scheduling clearance, never automated flight authorization.
            </span>
          </p>
          <span className="font-mono text-[10px] text-amber-800 uppercase hidden md:inline">DGCA Compliant</span>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Media & Airspace & Campaign Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Creative Media Inspector */}
            <MediaInspector asset={primaryAsset} />

            {/* 2. Zone & Airspace Feasibility Map */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Airspace Zone: {campaign.zone?.name || "Unassigned"}
                  </h3>
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  Rate: ₹{((campaign.zone?.ratePerHourPaise || 0) / 100).toLocaleString()}/hr
                </div>
              </div>

              <div className="h-64 w-full rounded-lg overflow-hidden border border-slate-200">
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
                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 block">Flight Start Window</span>
                    <span className="text-slate-900">
                      {campaign.startAt ? new Date(campaign.startAt).toLocaleString() : "TBD"}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 block">Flight End Window</span>
                    <span className="text-slate-900">
                      {campaign.endAt ? new Date(campaign.endAt).toLocaleString() : "TBD"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Advertiser Notes & Metadata */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Campaign Specifications & Intent</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Objective</span>
                  <span className="font-semibold text-slate-800">{campaign.objective}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Scheduling Flexibility</span>
                  <span className="font-semibold text-slate-800">{campaign.flexibility || "Fixed Window"}</span>
                </div>
                {campaign.ctaText && (
                  <div>
                    <span className="text-slate-400 block font-medium">Call to Action (CTA)</span>
                    <span className="font-semibold text-slate-800">{campaign.ctaText}</span>
                  </div>
                )}
                {campaign.destinationUrl && (
                  <div>
                    <span className="text-slate-400 block font-medium">Destination URL</span>
                    <a
                      href={campaign.destinationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 font-semibold hover:underline truncate block"
                    >
                      {campaign.destinationUrl}
                    </a>
                  </div>
                )}
                {campaign.audienceNotes && (
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block font-medium">Target Context / Audience Notes</span>
                    <p className="text-slate-700 mt-0.5 bg-slate-50 p-2.5 rounded-md border border-slate-100">
                      {campaign.audienceNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Review Decisions & Audit History */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <History className="h-5 w-5 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">Review Decisions & Event Timeline</h3>
              </div>

              {campaign.statusEvents.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">No status events recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {campaign.statusEvents.map((evt) => (
                    <div key={evt.id} className="flex items-start space-x-3 text-xs border-l-2 border-blue-500 pl-3 py-1">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">
                            {evt.fromStatus ? `${evt.fromStatus} → ` : ""}
                            {evt.toStatus}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(evt.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {evt.reason && <p className="text-slate-600 mt-1 italic">&ldquo;{evt.reason}&rdquo;</p>}
                        <span className="text-[10px] font-mono text-slate-400">Actor: {evt.actorType}</span>
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
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Payment & Pricing Verification</h3>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    payment?.status === "PAID"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {payment?.status || "NO PAYMENT"}
                </span>
              </div>

              {quote ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Billable Duration:</span>
                    <span className="font-semibold text-slate-900">{quote.billableHours} hrs</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{(quote.subtotalPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%):</span>
                    <span>₹{(quote.gstPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-sm">
                    <span>Total Paid (Paise):</span>
                    <span className="text-blue-600">
                      ₹{(quote.totalPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {payment?.providerOrderId && (
                    <div className="pt-2 text-[10px] text-slate-400 font-mono">
                      Order: {payment.providerOrderId}
                    </div>
                  )}
                  {payment?.refunds && payment.refunds.length > 0 && (
                    <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-700 border border-red-200 mt-2">
                      <span className="font-bold block">Refund Processed:</span>
                      ₹{(payment.refunds[0]!.amountPaise / 100).toFixed(2)} ({payment.refunds[0]!.reason})
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No quote generated yet.</p>
              )}
            </div>

            {/* 4. Advertiser Organization Info */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 font-semibold mb-1">
                <Building2 className="h-4 w-4 text-slate-500" />
                <span>Account Information</span>
              </div>
              <p className="text-slate-600">
                Organization: <strong>{campaign.organization.name}</strong>
              </p>
              <p className="text-slate-600">
                Contact: {campaign.createdBy.name} ({campaign.createdBy.email})
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
