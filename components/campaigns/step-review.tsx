"use client";

import React, { useState, useEffect } from "react";
import { QuoteBreakdown } from "@/lib/pricing/types";
import { ShieldCheck, ArrowLeft, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { step6ReviewSchema } from "@/lib/validation/campaign";

interface CampaignReviewData {
  name: string;
  brand: string;
  objective: string;
  description?: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  title?: string;
  ctaText?: string;
  destinationUrl?: string;
  zoneId: string;
  zoneName: string;
  zoneRatePaise: number;
  startAt: string;
  endAt: string;
  billableHours: number;
  audienceNotes?: string;
}

interface StepReviewProps {
  data: CampaignReviewData;
  onBack: () => void;
  onSaveDraft: () => Promise<void>;
  onSubmitCampaign: (quote: QuoteBreakdown) => Promise<void>;
  isSubmitting?: boolean;
}

export function StepReview({
  data,
  onBack,
  onSaveDraft,
  onSubmitCampaign,
  isSubmitting = false,
}: StepReviewProps) {
  const [quote, setQuote] = useState<QuoteBreakdown | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [acknowledgedSafety, setAcknowledgedSafety] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Fetch verified server quote
  useEffect(() => {
    let active = true;

    async function fetchQuote() {
      setIsLoadingQuote(true);
      setQuoteError(null);

      try {
        const res = await fetch("/api/pricing/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zoneId: data.zoneId,
            startAt: data.startAt,
            endAt: data.endAt,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch quote");
        }

        const quoteData = await res.json();
        if (active) {
          setQuote(quoteData);
        }
      } catch (err: unknown) {
        if (active) {
          setQuoteError(err instanceof Error ? err.message : "Failed to compute quote");
        }
      } finally {
        if (active) setIsLoadingQuote(false);
      }
    }

    fetchQuote();
    return () => {
      active = false;
    };
  }, [data.zoneId, data.startAt, data.endAt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const validation = step6ReviewSchema.safeParse({ acknowledgedSafety });
    if (!validation.success) {
      setValidationError(
        "You must acknowledge that this submission is a request for review, not a flight authorization."
      );
      return;
    }

    if (!quote) {
      setValidationError("Cannot submit without a verified server quote.");
      return;
    }

    await onSubmitCampaign(quote);
  };

  const handleDraftSave = async () => {
    setIsSavingDraft(true);
    try {
      await onSaveDraft();
    } finally {
      setIsSavingDraft(false);
    }
  };

  const formatPaiseToRupees = (paise: number) => {
    return (paise / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Step 6: Review Summary & Server Quote</h2>
        <p className="text-sm text-slate-500 mt-1">
          Review your campaign details and verify the server-computed price breakdown.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Campaign Basics */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-slate-500 mb-3">
            <FileText className="h-4 w-4 text-blue-600" />
            <span>Campaign Details</span>
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-slate-400">Name</dt>
              <dd className="font-semibold text-slate-900">{data.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Brand</dt>
              <dd className="text-slate-800">{data.brand}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Objective</dt>
              <dd className="text-slate-800">{data.objective}</dd>
            </div>
            {data.description && (
              <div>
                <dt className="text-xs text-slate-400">Notes</dt>
                <dd className="text-xs text-slate-600">{data.description}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Location & Schedule */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase text-slate-500 mb-3">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Flight Location & Timing</span>
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-slate-400">Flight Zone</dt>
              <dd className="font-semibold text-slate-900">{data.zoneName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Start (IST)</dt>
              <dd className="text-slate-800">{new Date(data.startAt).toLocaleString("en-IN")}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">End (IST)</dt>
              <dd className="text-slate-800">{new Date(data.endAt).toLocaleString("en-IN")}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400">Duration</dt>
              <dd className="font-semibold text-blue-600">{data.billableHours} billable hour(s)</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Verified Price Quote Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-900">Verified Pricing Breakdown</h3>
            <p className="text-xs text-slate-500">
              Computed strictly server-side in integer paise (INR).
            </p>
          </div>
          {quote && (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Verified Quote
            </span>
          )}
        </div>

        {isLoadingQuote ? (
          <div className="flex items-center justify-center py-6 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-600" />
            <span className="text-sm">Calculating server quote...</span>
          </div>
        ) : quoteError ? (
          <div className="p-3 text-xs text-red-600 bg-red-50 rounded-lg border border-red-200">
            {quoteError}
          </div>
        ) : quote ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>
                Zone Hourly Rate ({data.billableHours} hr @ ₹
                {formatPaiseToRupees(quote.zoneRatePaise)}/hr)
              </span>
              <span>₹{formatPaiseToRupees(quote.subtotalPaise)}</span>
            </div>

            {quote.discountPaise > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Promotional Discount</span>
                <span>-₹{formatPaiseToRupees(quote.discountPaise)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm text-slate-600">
              <span>GST ({quote.gstBps / 100}%)</span>
              <span>₹{formatPaiseToRupees(quote.gstPaise)}</span>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="font-bold text-slate-900 text-base">Total Payable</span>
              <div className="text-right">
                <span className="font-extrabold text-2xl text-blue-600">
                  ₹{formatPaiseToRupees(quote.totalPaise)}
                </span>
                <span className="block text-[11px] text-slate-400 font-mono">
                  {quote.totalPaise} paise (INR)
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Quote Hash:</span>
              <span className="truncate max-w-xs">{quote.inputsHash}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Mandatory Safety Acknowledgement */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            id="acknowledge-safety"
            type="checkbox"
            checked={acknowledgedSafety}
            onChange={(e) => setAcknowledgedSafety(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-amber-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="text-xs text-amber-900">
            <span className="font-bold block">
              I acknowledge: Submitting a campaign is a REQUEST, never a flight authorization.
            </span>
            <span className="mt-1 block text-amber-800">
              Flight deployment is subject to trained human operator review, airspace authorizations,
              weather clearance, and local police/venue permissions.
            </span>
          </div>
        </label>
        {validationError && (
          <p className="mt-2 text-xs font-semibold text-red-600">{validationError}</p>
        )}
      </div>

      {/* Wizard Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back: Details
        </button>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleDraftSave}
            disabled={isSavingDraft}
            className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {isSavingDraft ? "Saving Draft..." : "Save Draft"}
          </button>

          <button
            type="submit"
            disabled={!acknowledgedSafety || !quote || isSubmitting}
            className="inline-flex items-center rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Submit Campaign Request"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
