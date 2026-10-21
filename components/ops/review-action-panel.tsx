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
    <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <h3 className="font-heading text-base font-bold text-[#ebebeb] tracking-tight">Operations Control Actions</h3>
        <span className="font-mono text-xs text-[#ebebeb]/50">
          Status: <strong className="text-[#ccff00]">{currentStatus}</strong>
        </span>
      </div>

      {errorMessage && (
        <div className="rounded-xl bg-red-500/10 p-3 text-xs font-mono font-semibold text-red-400 border border-red-500/20">
          {errorMessage}
        </div>
      )}

      {/* State-Specific Action Bars */}
      {currentStatus === CampaignStatus.SUBMITTED && (
        <div className="space-y-3">
          <p className="font-mono text-xs text-[#ebebeb]/60">
            This campaign has been submitted by the advertiser with verified payment and is awaiting review.
          </p>
          <button
            onClick={() => handleDecision("PICK_UP")}
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center rounded-full bg-[#ccff00] px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] disabled:opacity-50"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                setActiveModal("APPROVE");
                setReason("All pre-flight creative and airspace checks verified.");
              }}
              className="inline-flex items-center justify-center rounded-xl bg-[#10b981] px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold text-black hover:bg-white transition-colors"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4" />
              Approve for Scheduling
            </button>

            <button
              onClick={() => {
                setActiveModal("REQUEST_CHANGES");
                setReason("");
              }}
              className="inline-flex items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold text-amber-300 hover:bg-amber-500/25 transition-colors"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Request Creative Edits
            </button>

            <button
              onClick={() => {
                setActiveModal("PUT_ON_HOLD");
                setReason("Holding due to pending airspace advisory / weather alert.");
              }}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold text-[#ebebeb] hover:bg-white/10 transition-colors"
            >
              <PauseCircle className="mr-1.5 h-4 w-4 text-[#ebebeb]/50" />
              Put on Operational Hold
            </button>

            <button
              onClick={() => {
                setActiveModal("REJECT");
                setReason("");
              }}
              className="inline-flex items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30 px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-semibold text-red-400 hover:bg-red-500/25 transition-colors"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Reject & Refund
            </button>
          </div>
        </div>
      )}

      {currentStatus === CampaignStatus.APPROVED_FOR_SCHEDULING && (
        <div className="space-y-3">
          <p className="font-mono text-xs text-[#ebebeb]/60">
            Campaign has cleared feasibility review. Confirm the operational flight schedule with the drone operator.
          </p>
          <button
            onClick={() => {
              setActiveModal("MILESTONE");
              setTargetMilestone(CampaignStatus.SCHEDULED);
              setReason("Flight window confirmed with drone operations team.");
            }}
            className="w-full inline-flex items-center justify-center rounded-full bg-[#ccff00] px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)]"
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            Confirm Operational Schedule
          </button>
        </div>
      )}

      {currentStatus === CampaignStatus.SCHEDULED && (
        <div className="space-y-3">
          <p className="font-mono text-xs text-[#ebebeb]/60">
            Scheduled deployment pending site readiness and final field crew check-in.
          </p>
          <button
            onClick={() => {
              setActiveModal("MILESTONE");
              setTargetMilestone(CampaignStatus.READY_FOR_OPERATIONS);
              setReason("Equipment, battery banks, and LED panels verified ready on site.");
            }}
            className="w-full inline-flex items-center justify-center rounded-full bg-[#ccff00] px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)]"
          >
            <Plane className="mr-2 h-4 w-4" />
            Mark Ready for Operations
          </button>
        </div>
      )}

      {currentStatus === CampaignStatus.READY_FOR_OPERATIONS && (
        <div className="space-y-3">
          <p className="font-mono text-xs text-[#ebebeb]/60">
            Field team ready. Initiate simulated drone deployment broadcast.
          </p>
          <button
            onClick={() => {
              setActiveModal("MILESTONE");
              setTargetMilestone(CampaignStatus.IN_PROGRESS);
              setReason("Drone advertising flight active over zone polygon.");
            }}
            className="w-full inline-flex items-center justify-center rounded-full bg-[#10b981] px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Plane className="mr-2 h-4 w-4 animate-pulse" />
            Simulate Flight Start (IN_PROGRESS)
          </button>
        </div>
      )}

      {currentStatus === CampaignStatus.IN_PROGRESS && (
        <div className="space-y-3">
          <p className="font-mono text-xs text-[#ebebeb]/60">
            Advertising broadcast is currently in flight. Conclude flight once schedule duration completes.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setActiveModal("MILESTONE");
                setTargetMilestone(CampaignStatus.COMPLETED);
                setReason("Scheduled flight hours completed successfully without incidents.");
              }}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-[#10b981] px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold text-black hover:bg-white transition-colors"
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
              className="inline-flex items-center justify-center rounded-full bg-red-500/20 border border-red-500/30 px-5 py-3 font-mono text-xs uppercase tracking-wider font-semibold text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Mark Failed
            </button>
          </div>
        </div>
      )}

      {currentStatus === CampaignStatus.ON_HOLD && (
        <div className="space-y-3">
          <p className="font-mono text-xs text-amber-300 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            This campaign is temporarily on hold. Resume review once constraints are cleared.
          </p>
          <button
            onClick={() => handleDecision("RESUME")}
            className="w-full inline-flex items-center justify-center rounded-full bg-[#ccff00] px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold text-black hover:bg-white transition-all"
          >
            <Play className="mr-2 h-4 w-4" />
            Resume Under Review
          </button>
        </div>
      )}

      {/* Decision Modal / Drawer */}
      {activeModal && activeModal !== "MILESTONE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[16px] p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0c0c0c] p-6 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h4 className="font-heading text-base font-bold text-[#ebebeb]">
                {activeModal === "APPROVE" && "Approve Campaign for Scheduling"}
                {activeModal === "REQUEST_CHANGES" && "Request Creative / Schedule Changes"}
                {activeModal === "REJECT" && "Reject Campaign & Process Refund"}
                {activeModal === "PUT_ON_HOLD" && "Put Campaign on Operational Hold"}
              </h4>
              <button
                onClick={() => setActiveModal(null)}
                className="text-[#ebebeb]/50 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {activeModal === "REJECT" && (
              <div className="rounded-xl bg-red-500/10 p-3 text-xs text-red-300 border border-red-500/20 flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Attention:</strong> Rejecting will mark the campaign terminal and automatically
                  initiate a 100% refund of all paid amounts to the advertiser.
                </p>
              </div>
            )}

            {activeModal === "APPROVE" && !allChecklistVerified && (
              <div className="rounded-xl bg-amber-500/10 p-3 text-xs text-amber-300 border border-amber-500/20 flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Notice:</strong> One or more items on the safety checklist are not marked
                  &ldquo;VERIFIED&rdquo;. Approving implies manual reviewer verification of feasibility.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider text-[#ebebeb]/70">
                Reviewer Rationale & Feedback <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Enter detailed feedback or justification for this decision..."
                className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-xs text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none"
              />
            </div>

            {activeModal === "APPROVE" && (
              <div className="space-y-1.5">
                <label className="block font-mono text-xs uppercase tracking-wider text-[#ebebeb]/70">
                  Operational Constraints / Flight Conditions (Optional)
                </label>
                <input
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="e.g. Ground winds strictly below 12 knots; deploy after 6:30 PM only"
                  className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-xs text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#ebebeb]/70 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reason.trim() || isSubmitting}
                onClick={() => handleDecision(activeModal)}
                className={`inline-flex items-center rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider font-bold shadow-sm transition-all disabled:opacity-50 ${
                  activeModal === "REJECT"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    : activeModal === "APPROVE"
                      ? "bg-[#10b981] text-black hover:bg-white"
                      : "bg-[#ccff00] text-black hover:bg-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-[16px] p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0c0c0c] p-6 shadow-2xl border border-white/10 space-y-4">
            <h4 className="font-heading text-base font-bold text-[#ebebeb]">
              Advance Operational Milestone: {targetMilestone.replace(/_/g, " ")}
            </h4>
            <div className="space-y-1.5">
              <label className="block font-mono text-xs uppercase tracking-wider text-[#ebebeb]/70">
                Operational Log Note
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Log note for field deployment logs..."
                className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-xs text-[#ebebeb] placeholder-[#ebebeb]/30 focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] outline-none"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#ebebeb]/70 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleMilestone(targetMilestone)}
                className="rounded-full bg-[#ccff00] px-5 py-2 font-mono text-xs uppercase tracking-wider font-bold text-black hover:bg-white transition-all"
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
