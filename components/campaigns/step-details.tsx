"use client";

import React, { useState } from "react";
import { ShieldAlert, ArrowLeft, ArrowRight } from "lucide-react";
import { step5DetailsSchema } from "@/lib/validation/campaign";

interface StepDetailsProps {
  initialData: {
    audienceNotes?: string;
    notes?: string;
  };
  onBack: () => void;
  onNext: (data: { audienceNotes?: string; notes?: string }) => void;
}

export function StepDetails({ initialData, onBack, onNext }: StepDetailsProps) {
  const [audienceNotes, setAudienceNotes] = useState(initialData.audienceNotes ?? "");
  const [notes, setNotes] = useState(initialData.notes ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = step5DetailsSchema.parse({
      audienceNotes,
      notes,
    });
    onNext(result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#ebebeb] tracking-tight">
          Step 5: Audience Context & Notes
        </h2>
        <p className="text-sm text-[#ebebeb]/60 mt-1">
          Specify contextual audience relevance to assist Operations in evaluating deployment timing.
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-[16px] p-5 text-xs text-[#ebebeb]/80">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-[#ccff00] flex-shrink-0" />
          <span className="font-mono uppercase tracking-wider text-[#ccff00] font-bold">Privacy By Design:</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#ebebeb]/70">
          Aervy strictly respects public privacy. Targeting is aggregate and location-contextual only.
          We never deploy individual biometric tracking, facial recognition, or personal surveillance.
        </p>
      </div>

      <div className="space-y-5">
        {/* Audience Description */}
        <div className="space-y-2">
          <label htmlFor="audience-notes" className="block font-mono text-xs uppercase tracking-wider text-[#ebebeb]/70">
            Target Audience Context <span className="text-[10px] text-[#ebebeb]/40 lowercase">(optional)</span>
          </label>
          <textarea
            id="audience-notes"
            rows={3}
            value={audienceNotes}
            onChange={(e) => setAudienceNotes(e.target.value)}
            placeholder="e.g. Technology expo attendees, high-footfall evening commuters, festival participants."
            className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-[#ebebeb] placeholder-[#ebebeb]/30 transition-all focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
          />
        </div>

        {/* Operational Notes */}
        <div className="space-y-2">
          <label htmlFor="op-notes" className="block font-mono text-xs uppercase tracking-wider text-[#ebebeb]/70">
            Notes for Operations Reviewer <span className="text-[10px] text-[#ebebeb]/40 lowercase">(optional)</span>
          </label>
          <textarea
            id="op-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions or context regarding associated outdoor events or permits."
            className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-[#ebebeb] placeholder-[#ebebeb]/30 transition-all focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold text-[#ebebeb] hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back: Schedule
        </button>

        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-[#ccff00] px-6 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)]"
        >
          Next: Review & Pricing Quote
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
