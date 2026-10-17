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
        <h2 className="text-xl font-bold text-slate-900">Step 5: Audience Context & Notes</h2>
        <p className="text-sm text-slate-500 mt-1">
          Specify contextual audience relevance to assist Operations in evaluating deployment timing.
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span className="font-semibold">Privacy By Design:</span>
        </div>
        <p className="mt-1">
          Aervy strictly respects public privacy. Targeting is aggregate and location-contextual only.
          We never deploy individual biometric tracking, facial recognition, or personal surveillance.
        </p>
      </div>

      <div className="space-y-4">
        {/* Audience Description */}
        <div>
          <label htmlFor="audience-notes" className="block text-sm font-medium text-slate-700">
            Target Audience Context <span className="text-xs text-slate-400">(optional)</span>
          </label>
          <textarea
            id="audience-notes"
            rows={3}
            value={audienceNotes}
            onChange={(e) => setAudienceNotes(e.target.value)}
            placeholder="e.g. Technology expo attendees, high-footfall evening commuters, festival participants."
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Operational Notes */}
        <div>
          <label htmlFor="op-notes" className="block text-sm font-medium text-slate-700">
            Notes for Operations Reviewer <span className="text-xs text-slate-400">(optional)</span>
          </label>
          <textarea
            id="op-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions or context regarding associated outdoor events or permits."
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back: Schedule
        </button>

        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          Next: Review & Pricing Quote
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
