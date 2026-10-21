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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Campaign Status</h2>
          <p className="text-xs text-slate-400 mt-0.5">Live progression tracker</p>
        </div>

        {/* Status Badge */}
        <div>
          {isRejected ? (
            <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
              <XCircle className="mr-1.5 h-3.5 w-3.5 text-red-600" />
              Rejected (Refund Processed)
            </span>
          ) : isChangesRequested ? (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <AlertCircle className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
              Changes Requested
            </span>
          ) : isOnHold ? (
            <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700">
              <PauseCircle className="mr-1.5 h-3.5 w-3.5 text-purple-600" />
              On Operational Hold
            </span>
          ) : isCancelled ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              Cancelled
            </span>
          ) : step4Done ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
              Mission Completed
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Clock className="mr-1.5 h-3.5 w-3.5 animate-spin text-blue-600" />
              {status.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* 4 Clean Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
        <div
          className={`rounded-xl p-3 border text-xs transition-all ${
            step1Done
              ? "border-emerald-200 bg-emerald-50/40 text-emerald-900"
              : "border-slate-200 bg-slate-50/50 text-slate-500"
          }`}
        >
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Step 1
          </span>
          <span className="font-bold block mt-1">Creative Setup</span>
          <span className="text-[11px] opacity-75">Assets configured</span>
        </div>

        <div
          className={`rounded-xl p-3 border text-xs transition-all ${
            step2Done
              ? "border-emerald-200 bg-emerald-50/40 text-emerald-900"
              : step2Active
              ? "border-blue-300 bg-blue-50/40 text-blue-900"
              : "border-slate-200 bg-slate-50/50 text-slate-500"
          }`}
        >
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Step 2
          </span>
          <span className="font-bold block mt-1">Slot & Payment</span>
          <span className="text-[11px] opacity-75">Airspace slot held</span>
        </div>

        <div
          className={`rounded-xl p-3 border text-xs transition-all ${
            isRejected
              ? "border-red-200 bg-red-50/40 text-red-900"
              : isChangesRequested
              ? "border-amber-200 bg-amber-50/40 text-amber-900"
              : step3Done
              ? "border-emerald-200 bg-emerald-50/40 text-emerald-900"
              : step3Active
              ? "border-blue-300 bg-blue-50/40 text-blue-900"
              : "border-slate-200 bg-slate-50/50 text-slate-500"
          }`}
        >
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Step 3
          </span>
          <span className="font-bold block mt-1">Safety Review</span>
          <span className="text-[11px] opacity-75">
            {isRejected ? "Rejected" : isChangesRequested ? "Feedback" : "Airspace check"}
          </span>
        </div>

        <div
          className={`rounded-xl p-3 border text-xs transition-all ${
            step4Done
              ? "border-emerald-200 bg-emerald-50/40 text-emerald-900"
              : step4Active
              ? "border-purple-300 bg-purple-50/40 text-purple-900"
              : "border-slate-200 bg-slate-50/50 text-slate-500"
          }`}
        >
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Step 4
          </span>
          <span className="font-bold block mt-1">Flight Execution</span>
          <span className="text-[11px] opacity-75">
            {step4Done ? "Completed" : "Scheduled corridor"}
          </span>
        </div>
      </div>
    </div>
  );
}
