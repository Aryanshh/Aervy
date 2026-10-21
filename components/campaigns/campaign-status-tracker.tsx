import React from "react";
import { CampaignStatus } from "@prisma/client";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  PauseCircle,
} from "lucide-react";

interface CampaignStatusTrackerProps {
  status: CampaignStatus;
}

export function CampaignStatusTracker({ status }: CampaignStatusTrackerProps) {
  const isCancelled = status === CampaignStatus.CANCELLED;
  const isRejected = status === CampaignStatus.REJECTED;
  const isOnHold = status === CampaignStatus.ON_HOLD;
  const isChangesRequested = status === CampaignStatus.CHANGES_REQUESTED;

  // Step 1: Campaign Setup
  const step1Done = status !== CampaignStatus.DRAFT;

  // Step 2: Slot & Payment
  const step2Done = !(
    [CampaignStatus.DRAFT, CampaignStatus.PENDING_PAYMENT] as CampaignStatus[]
  ).includes(status);
  const step2Active = status === CampaignStatus.PENDING_PAYMENT;

  // Step 3: Safety & Airspace Review
  const step3Done = (
    [
      CampaignStatus.APPROVED_FOR_SCHEDULING,
      CampaignStatus.SCHEDULED,
      CampaignStatus.READY_FOR_OPERATIONS,
      CampaignStatus.IN_PROGRESS,
      CampaignStatus.COMPLETED,
    ] as CampaignStatus[]
  ).includes(status);

  const step3Active = (
    [
      CampaignStatus.SUBMITTED,
      CampaignStatus.UNDER_REVIEW,
      CampaignStatus.CHANGES_REQUESTED,
    ] as CampaignStatus[]
  ).includes(status);

  // Step 4: Flight Execution
  const step4Done = status === CampaignStatus.COMPLETED;
  const step4Active = (
    [
      CampaignStatus.APPROVED_FOR_SCHEDULING,
      CampaignStatus.SCHEDULED,
      CampaignStatus.READY_FOR_OPERATIONS,
      CampaignStatus.IN_PROGRESS,
    ] as CampaignStatus[]
  ).includes(status);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-[16px] p-6 shadow-xl">
      <div className="flex items-center justify-between pb-5 border-b border-white/10">
        <div>
          <h2 className="text-base font-heading font-bold text-[#ebebeb]">
            Campaign Status
          </h2>
          <p className="text-xs font-mono text-[#ebebeb]/50 mt-0.5">
            Live progression & telemetry tracker
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {isRejected ? (
            <span className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/30 px-3 py-1 text-xs font-mono font-bold text-red-400">
              <XCircle className="mr-1.5 h-3.5 w-3.5 text-red-400" />
              Rejected (Refund Processed)
            </span>
          ) : isChangesRequested ? (
            <span className="inline-flex items-center rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-mono font-bold text-amber-400">
              <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
              Changes Requested
            </span>
          ) : isOnHold ? (
            <span className="inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-mono font-bold text-purple-400">
              <PauseCircle className="mr-1.5 h-3.5 w-3.5 text-purple-400" />
              On Operational Hold
            </span>
          ) : isCancelled ? (
            <span className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-[#ebebeb]/60">
              Cancelled
            </span>
          ) : step4Done ? (
            <span className="inline-flex items-center rounded-full bg-[#10b981]/15 border border-[#10b981]/30 px-3 py-1 text-xs font-mono font-bold text-[#10b981]">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-[#10b981]" />
              Mission Completed
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 px-3 py-1 text-xs font-mono font-bold text-[#ccff00]">
              <Clock className="mr-1.5 h-3.5 w-3.5 animate-spin text-[#ccff00]" />
              {status.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* 4 Clean Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 font-mono">
        <div
          className={`rounded-2xl p-4 border text-xs transition-all ${
            step1Done
              ? "border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]"
              : "border-white/10 bg-black/40 text-[#ebebeb]/40"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Step 1
          </span>
          <span className="font-heading font-bold text-sm block mt-1 text-[#ebebeb]">
            Creative Setup
          </span>
          <span className="text-[11px] opacity-75">Assets configured</span>
        </div>

        <div
          className={`rounded-2xl p-4 border text-xs transition-all ${
            step2Done
              ? "border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]"
              : step2Active
              ? "border-[#ccff00]/40 bg-[#ccff00]/10 text-[#ccff00]"
              : "border-white/10 bg-black/40 text-[#ebebeb]/40"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Step 2
          </span>
          <span className="font-heading font-bold text-sm block mt-1 text-[#ebebeb]">
            Slot & Payment
          </span>
          <span className="text-[11px] opacity-75">Airspace slot held</span>
        </div>

        <div
          className={`rounded-2xl p-4 border text-xs transition-all ${
            isRejected
              ? "border-red-500/40 bg-red-500/10 text-red-400"
              : isChangesRequested
              ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
              : step3Done
              ? "border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]"
              : step3Active
              ? "border-[#ccff00]/40 bg-[#ccff00]/10 text-[#ccff00]"
              : "border-white/10 bg-black/40 text-[#ebebeb]/40"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Step 3
          </span>
          <span className="font-heading font-bold text-sm block mt-1 text-[#ebebeb]">
            Safety Review
          </span>
          <span className="text-[11px] opacity-75">
            {isRejected ? "Rejected" : isChangesRequested ? "Feedback" : "Airspace check"}
          </span>
        </div>

        <div
          className={`rounded-2xl p-4 border text-xs transition-all ${
            step4Done
              ? "border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]"
              : step4Active
              ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
              : "border-white/10 bg-black/40 text-[#ebebeb]/40"
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
            Step 4
          </span>
          <span className="font-heading font-bold text-sm block mt-1 text-[#ebebeb]">
            Flight Execution
          </span>
          <span className="text-[11px] opacity-75">
            {step4Done ? "Completed" : "Scheduled corridor"}
          </span>
        </div>
      </div>
    </div>
  );
}
