import React from "react";
import { CampaignStatus } from "@prisma/client";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  PauseCircle,
  FileText,
  CreditCard,
  ShieldCheck,
  Plane,
} from "lucide-react";

interface CampaignStatusTrackerProps {
  status: CampaignStatus;
}

export function CampaignStatusTracker({ status }: CampaignStatusTrackerProps) {
  // Determine standard 4-step progress:
  // Step 1: Draft Creation (DRAFT, PENDING_PAYMENT, ...)
  // Step 2: Payment & Reservation (SUBMITTED and later)
  // Step 3: Operations Safety Review (UNDER_REVIEW, APPROVED_FOR_SCHEDULING, ...)
  // Step 4: Scheduled Flight Execution (SCHEDULED, READY_FOR_OPERATIONS, IN_PROGRESS, COMPLETED)

  const isCancelled = status === CampaignStatus.CANCELLED;
  const isRejected = status === CampaignStatus.REJECTED;
  const isOnHold = status === CampaignStatus.ON_HOLD;
  const isChangesRequested = status === CampaignStatus.CHANGES_REQUESTED;

  // Step 1 status
  const step1Done = status !== CampaignStatus.DRAFT;
  const step1Active = status === CampaignStatus.DRAFT;

  // Step 2 status
  const step2Done = !(
    [CampaignStatus.DRAFT, CampaignStatus.PENDING_PAYMENT] as CampaignStatus[]
  ).includes(status);
  const step2Active = status === CampaignStatus.PENDING_PAYMENT;

  // Step 3 status
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

  // Step 4 status
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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Campaign Progression</h2>
          <p className="text-xs text-slate-500">
            Real-time status tracking from digital creation to verified flight completion.
          </p>
        </div>

        {/* Current Status Pill */}
        <div>
          {isRejected ? (
            <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Rejected (Refund Processed)
            </span>
          ) : isChangesRequested ? (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
              <AlertCircle className="mr-1 h-3.5 w-3.5" />
              Action Required: Changes Requested
            </span>
          ) : isOnHold ? (
            <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-200">
              <PauseCircle className="mr-1 h-3.5 w-3.5" />
              Operations Hold (Weather/Airspace)
            </span>
          ) : isCancelled ? (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Cancelled
            </span>
          ) : step4Done ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Mission Completed
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
              <Clock className="mr-1 h-3.5 w-3.5 animate-spin" />
              {status.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>

      {/* 4-Step Stepper */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {/* Step 1 */}
        <div
          className={`flex flex-col rounded-lg border p-4 ${
            step1Done
              ? "border-emerald-200 bg-emerald-50/50"
              : step1Active
              ? "border-blue-300 bg-blue-50/50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Step 1</span>
            {step1Done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <FileText className="h-4 w-4 text-blue-600" />
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">Campaign Setup</p>
          <p className="mt-1 text-xs text-slate-500">
            Creative assets uploaded and flight zone selected.
          </p>
        </div>

        {/* Step 2 */}
        <div
          className={`flex flex-col rounded-lg border p-4 ${
            step2Done
              ? "border-emerald-200 bg-emerald-50/50"
              : step2Active
              ? "border-blue-300 bg-blue-50/50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Step 2</span>
            {step2Done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : step2Active ? (
              <Clock className="h-4 w-4 text-blue-600 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 text-slate-400" />
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">Slot Hold & Payment</p>
          <p className="mt-1 text-xs text-slate-500">
            Airspace slot held and test payment verified.
          </p>
        </div>

        {/* Step 3 */}
        <div
          className={`flex flex-col rounded-lg border p-4 ${
            isRejected
              ? "border-red-200 bg-red-50/50"
              : isChangesRequested
              ? "border-amber-300 bg-amber-50/50"
              : step3Done
              ? "border-emerald-200 bg-emerald-50/50"
              : step3Active
              ? "border-blue-300 bg-blue-50/50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Step 3</span>
            {isRejected ? (
              <XCircle className="h-4 w-4 text-red-600" />
            ) : isChangesRequested ? (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            ) : step3Done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : step3Active ? (
              <Clock className="h-4 w-4 text-blue-600 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-slate-400" />
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">Safety & Airspace Review</p>
          <p className="mt-1 text-xs text-slate-500">
            {isRejected
              ? "Campaign was rejected during operations review."
              : isChangesRequested
              ? "Reviewer requested creative/schedule adjustments."
              : step3Done
              ? "Airspace and safety checks approved by Operations."
              : step3Active
              ? "Human operations team reviewing feasibility."
              : "Pending operations team feasibility sign-off."}
          </p>
        </div>

        {/* Step 4 */}
        <div
          className={`flex flex-col rounded-lg border p-4 ${
            step4Done
              ? "border-emerald-200 bg-emerald-50/50"
              : step4Active
              ? "border-purple-300 bg-purple-50/50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Step 4</span>
            {step4Done ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : step4Active ? (
              <Plane className="h-4 w-4 text-purple-600 animate-bounce" />
            ) : (
              <Plane className="h-4 w-4 text-slate-400" />
            )}
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900">Flight Execution</p>
          <p className="mt-1 text-xs text-slate-500">
            {step4Done
              ? "Campaign completed successfully in flight zone."
              : status === CampaignStatus.IN_PROGRESS
              ? "Simulated flight deployment currently airborne."
              : status === CampaignStatus.READY_FOR_OPERATIONS
              ? "Ground crew and equipment on site, pre-flight check ready."
              : status === CampaignStatus.SCHEDULED
              ? "Confirmed in operational flight queue."
              : "Pending review approval and pilot dispatch."}
          </p>
        </div>
      </div>
    </div>
  );
}
