"use client";

import React, { useState } from "react";
import { CampaignStatus } from "@prisma/client";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  PauseCircle,
  Loader2,
  Send,
  CalendarCheck,
  Plane,
} from "lucide-react";
import { ReviewDecisionType } from "@/lib/ops/review";

interface ReviewActionPanelProps {
  campaignId: string;
  currentStatus: CampaignStatus;
  allChecklistVerified: boolean;
  onDecisionSubmitted: () => void;
}

export function ReviewActionPanel({
  campaignId,
  currentStatus,
  allChecklistVerified,
  onDecisionSubmitted,
}: ReviewActionPanelProps) {
  const [activeModal, setActiveModal] = useState<ReviewDecisionType | "MILESTONE" | null>(null);
  const [targetMilestone, setTargetMilestone] = useState<CampaignStatus | null>(null);
  const [reason, setReason] = useState("");
  const [constraints, setConstraints] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDecision = async (decision: ReviewDecisionType) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/ops/campaigns/${campaignId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          reason,
          constraints,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit decision");
      }

      setActiveModal(null);
      setReason("");
      setConstraints("");
      onDecisionSubmitted();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error submitting decision");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMilestone = async (toStatus: CampaignStatus) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/ops/campaigns/${campaignId}/milestone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus,
          note: reason,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update deployment milestone");
      }

      setActiveModal(null);
      setReason("");
      onDecisionSubmitted();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error updating milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold text-slate-900">Operations Control Actions</h3>
        <span className="text-xs font-mono font-medium text-slate-500">
          Status: <strong className="text-slate-800">{currentStatus}</strong>
        </span>
      </div>

      {errorMessage && (
        <div className="rounded-md bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
          {errorMessage}
        </div>
      )}

      {/* State-Specific Action Bars */}
      {currentStatus === CampaignStatus.SUBMITTED && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            This campaign has been submitted by the advertiser with verified payment and is awaiting review.
          </p>
          <button
            onClick={() => handleDecision("PICK_UP")}
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Pick Up for Operations Review
          </button>
        </div>
      )}

      {currentStatus === CampaignStatus.UNDER_REVIEW && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => {
                setActiveModal("APPROVE");
                setReason("All pre-flight creative and airspace checks verified.");
              }}
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Approve for Scheduling
            </button>

            <button
              onClick={() => {
                setActiveModal("REQUEST_CHANGES");
                setReason("");
              }}
              className="inline-flex items-center justify-center rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-500"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Request Creative Edits
            </button>

            <button
              onClick={() => {
                setActiveModal("PUT_ON_HOLD");
                setReason("Holding due to pending airspace advisory / weather alert.");
              }}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <PauseCircle className="mr-1.5 h-4 w-4 text-slate-500" />
              Put on Operational Hold
            </button>

            <button
              onClick={() => {
                setActiveModal("REJECT");
                setReason("");
              }}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-red-500"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Reject & Refund
            </button>
          </div>
        </div>
      )}

      {currentStatus === CampaignStatus.APPROVED_FOR_SCHEDULING && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Campaign has cleared feasibility review. Confirm the operational flight schedule with the drone operator.
          </p>
          <button
            onClick={() => {
              setActiveModal("MILESTONE");
              setTargetMilestone(CampaignStatus.SCHEDULED);
              setReason("Flight window confirmed with drone operations team.");
            }}
            className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            Confirm Operational Schedule
          </button>
        </div>
      )}

      {currentStatus === CampaignStatus.SCHEDULED && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Scheduled deployment pending site readiness and final field crew check-in.
          </p>
          <button
            onClick={() => {
              setActiveModal("MILESTONE");
              setTargetMilestone(CampaignStatus.READY_FOR_OPERATIONS);
              setReason("Equipment, battery banks, and LED panels verified ready on site.");
            }}
            className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Plane className="mr-2 h-4 w-4" />
            Mark Ready for Operations
          </button>
        </div>
      )}

      {currentStatus === CampaignStatus.READY_FOR_OPERATIONS && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Field team ready. Initiate simulated drone deployment broadcast.
          </p>
          <button
            onClick={() => {
              setActiveModal("MILESTONE");
              setTargetMilestone(CampaignStatus.IN_PROGRESS);
              setReason("Drone advertising flight active over zone polygon.");
            }}
            className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
          >
            <Plane className="mr-2 h-4 w-4 animate-pulse" />
            Simulate Flight Start (IN_PROGRESS)
          </button>
        </div>
      )}

      {currentStatus === CampaignStatus.IN_PROGRESS && (
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Advertising broadcast is currently in flight. Conclude flight once schedule duration completes.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setActiveModal("MILESTONE");
                setTargetMilestone(CampaignStatus.COMPLETED);
                setReason("Scheduled flight hours completed successfully without incidents.");
              }}
              className="flex-1 inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Campaign
            </button>
            <button
              onClick={() => {
                setActiveModal("MILESTONE");
                setTargetMilestone(CampaignStatus.FAILED);
                setReason("Severe weather forced flight cancellation.");
              }}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
            >
              Mark Failed
            </button>
          </div>
        </div>
      )}

      {currentStatus === CampaignStatus.ON_HOLD && (
        <div className="space-y-3">
          <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
            This campaign is temporarily on hold. Resume review once constraints are cleared.
          </p>
          <button
            onClick={() => handleDecision("RESUME")}
            className="w-full inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Play className="mr-2 h-4 w-4" />
            Resume Under Review
          </button>
        </div>
      )}

      {/* Decision Modal / Drawer */}
      {activeModal && activeModal !== "MILESTONE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-900">
                {activeModal === "APPROVE" && "Approve Campaign for Scheduling"}
                {activeModal === "REQUEST_CHANGES" && "Request Creative / Schedule Changes"}
                {activeModal === "REJECT" && "Reject Campaign & Process Refund"}
                {activeModal === "PUT_ON_HOLD" && "Put Campaign on Operational Hold"}
              </h4>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {activeModal === "REJECT" && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-800 border border-red-200 flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Attention:</strong> Rejecting will mark the campaign terminal and automatically
                  initiate a 100% refund of all paid amounts to the advertiser.
                </p>
              </div>
            )}

            {activeModal === "APPROVE" && !allChecklistVerified && (
              <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Notice:</strong> One or more items on the safety checklist are not marked
                  &ldquo;VERIFIED&rdquo;. Approving implies manual reviewer verification of feasibility.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Reviewer Rationale & Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Enter detailed feedback or justification for this decision..."
                className="w-full rounded-md border border-slate-300 p-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {activeModal === "APPROVE" && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Operational Constraints / Flight Conditions (Optional)
                </label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g. Ground winds strictly below 12 knots; deploy after 6:30 PM only"
                  className="w-full rounded-md border border-slate-300 p-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reason.trim() || isSubmitting}
                onClick={() => handleDecision(activeModal)}
                className={`inline-flex items-center rounded-md px-4 py-1.5 text-xs font-semibold text-white shadow-sm disabled:opacity-50 ${
                  activeModal === "REJECT"
                    ? "bg-red-600 hover:bg-red-500"
                    : activeModal === "APPROVE"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {isSubmitting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {activeModal === "MILESTONE" && targetMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <h4 className="text-base font-bold text-slate-900">
              Advance Operational Milestone: {targetMilestone.replace(/_/g, " ")}
            </h4>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Operational Log Note
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Log note for field deployment logs..."
                className="w-full rounded-md border border-slate-300 p-2 text-xs"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleMilestone(targetMilestone)}
                className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white"
              >
                {isSubmitting ? "Updating..." : "Update Milestone"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
