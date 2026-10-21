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
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#ebebeb] tracking-tight">
          Step 6: Review Summary & Server Quote
        </h2>
        <p className="text-sm text-[#ebebeb]/60 mt-1">
          Review your campaign details and verify the server-computed price breakdown.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Campaign Basics */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-5 shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#ccff00] mb-3">
            <FileText className="h-4 w-4" />
            <span>Campaign Details</span>
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40">Name</dt>
              <dd className="font-heading font-semibold text-[#ebebeb]">{data.name}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40">Brand</dt>
              <dd className="text-[#ebebeb]/80">{data.brand}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40">Objective</dt>
              <dd className="text-[#ebebeb]/80">{data.objective}</dd>
            </div>
            {data.description && (
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40">Notes</dt>
                <dd className="text-xs text-[#ebebeb]/60">{data.description}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Location & Schedule */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-5 shadow-xl">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#10b981] mb-3">
            <ShieldCheck className="h-4 w-4" />
            <span>Flight Location & Timing</span>
          </div>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40">Flight Zone</dt>
              <dd className="font-heading font-semibold text-[#ebebeb]">{data.zoneName}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40">Start (IST)</dt>
              <dd className="text-[#ebebeb]/80">{new Date(data.startAt).toLocaleString("en-IN")}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40">End (IST)</dt>
              <dd className="text-[#ebebeb]/80">{new Date(data.endAt).toLocaleString("en-IN")}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-[#ebebeb]/40">Duration</dt>
              <dd className="font-mono font-bold text-[#ccff00]">{data.billableHours} billable hour(s)</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Verified Price Quote Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-[#ebebeb] tracking-tight">Verified Pricing Breakdown</h3>
            <p className="font-mono text-xs text-[#ebebeb]/50 mt-0.5">
              Computed strictly server-side in integer paise (INR).
            </p>
          </div>
          {quote && (
            <span className="inline-flex items-center rounded-full bg-[#10b981]/10 px-3 py-1 font-mono text-[11px] font-bold text-[#10b981] border border-[#10b981]/30">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              Verified Quote
            </span>
          )}
        </div>

        {isLoadingQuote ? (
          <div className="flex items-center justify-center py-8 text-[#ebebeb]/50">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-[#ccff00]" />
            <span className="font-mono text-xs uppercase tracking-wider">Calculating server quote...</span>
          </div>
        ) : quoteError ? (
          <div className="p-4 text-xs font-mono text-red-400 bg-red-500/10 rounded-xl border border-red-500/20">
            {quoteError}
          </div>
        ) : quote ? (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-[#ebebeb]/70">
              <span>
                Zone Hourly Rate ({data.billableHours} hr @ ₹
                {formatPaiseToRupees(quote.zoneRatePaise)}/hr)
              </span>
              <span className="font-mono text-[#ebebeb]">₹{formatPaiseToRupees(quote.subtotalPaise)}</span>
            </div>

            {quote.discountPaise > 0 && (
              <div className="flex justify-between text-sm text-[#10b981]">
                <span>Promotional Discount</span>
                <span className="font-mono">-₹{formatPaiseToRupees(quote.discountPaise)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm text-[#ebebeb]/70">
              <span>GST ({quote.gstBps / 100}%)</span>
              <span className="font-mono text-[#ebebeb]">₹{formatPaiseToRupees(quote.gstPaise)}</span>
            </div>

            <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
              <span className="font-heading font-bold text-[#ebebeb] text-base">Total Payable</span>
              <div className="text-right">
                <span className="font-heading font-extrabold text-3xl text-[#ccff00] tracking-tight">
                  ₹{formatPaiseToRupees(quote.totalPaise)}
                </span>
                <span className="block text-[11px] text-[#ebebeb]/40 font-mono mt-0.5">
                  {quote.totalPaise} paise (INR)
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#ebebeb]/40 font-mono">
              <span className="uppercase tracking-wider">Quote Hash:</span>
              <span className="truncate max-w-xs">{quote.inputsHash}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Mandatory Safety Acknowledgement */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            id="acknowledge-safety"
            type="checkbox"
            checked={acknowledgedSafety}
            onChange={(e) => setAcknowledgedSafety(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-amber-400/40 bg-black/60 text-[#ccff00] focus:ring-[#ccff00]"
          />
          <div className="text-xs text-amber-200">
            <span className="font-heading font-bold block text-sm text-amber-300">
              I acknowledge: Submitting a campaign is a REQUEST, never a flight authorization.
            </span>
            <span className="mt-1 block text-amber-200/80 leading-relaxed">
              Flight deployment is subject to trained human operator review, airspace authorizations,
              weather clearance, and local police/venue permissions.
            </span>
          </div>
        </label>
        {validationError && (
          <p className="mt-3 text-xs font-mono font-semibold text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
            {validationError}
          </p>
        )}
      </div>

      {/* Wizard Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold text-[#ebebeb] hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back: Details
        </button>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleDraftSave}
            disabled={isSavingDraft}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold text-[#ebebeb] hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {isSavingDraft ? "Saving Draft..." : "Save Draft"}
          </button>

          <button
            type="submit"
            disabled={!acknowledgedSafety || !quote || isSubmitting}
            className="inline-flex items-center rounded-full bg-[#ccff00] px-6 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
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
