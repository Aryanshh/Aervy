"use client";

import React, { useState, useEffect } from "react";
import { Clock, CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { step4ScheduleSchema } from "@/lib/validation/campaign";

interface StepScheduleProps {
  zoneId: string;
  initialData: {
    startAt?: string;
    endAt?: string;
    flexibility?: string;
  };
  onBack: () => void;
  onNext: (data: { startAt: string; endAt: string; flexibility: string; billableHours: number }) => void;
}

export function StepSchedule({ zoneId, initialData, onBack, onNext }: StepScheduleProps) {
  // Default to tomorrow 18:00 - 20:00 (standard operational window)
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 1);
  defaultStart.setHours(18, 0, 0, 0);

  const defaultEnd = new Date(defaultStart);
  defaultEnd.setHours(20, 0, 0, 0);

  const formatForInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
      d.getMinutes()
    )}`;
  };

  const [startAt, setStartAt] = useState(
    initialData.startAt ? formatForInput(new Date(initialData.startAt)) : formatForInput(defaultStart)
  );
  const [endAt, setEndAt] = useState(
    initialData.endAt ? formatForInput(new Date(initialData.endAt)) : formatForInput(defaultEnd)
  );
  const [flexibility, setFlexibility] = useState(initialData.flexibility ?? "FIXED");

  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate billable hours
  const startMs = new Date(startAt).getTime();
  const endMs = new Date(endAt).getTime();
  const billableHours = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60)));

  // Live availability check
  useEffect(() => {
    let active = true;

    async function checkAvailability() {
      if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) {
        setIsAvailable(null);
        return;
      }

      setIsChecking(true);
      setConflictMessage(null);

      try {
        const query = new URLSearchParams({
          zoneId,
          startAt: new Date(startAt).toISOString(),
          endAt: new Date(endAt).toISOString(),
        });

        const res = await fetch(`/api/availability?${query.toString()}`);
        if (!res.ok) throw new Error("Availability query failed");

        const data = await res.json();
        if (active) {
          setIsAvailable(data.isAvailable);
          if (!data.isAvailable) {
            setConflictMessage(
              "This flight slot has conflicting active campaigns or active 15-minute checkout holds. Please choose another window."
            );
          }
        }
      } catch {
        if (active) {
          setIsAvailable(true); // Graceful fallback
        }
      } finally {
        if (active) setIsChecking(false);
      }
    }

    const timer = setTimeout(checkAvailability, 400);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [zoneId, startAt, endAt, startMs, endMs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = step4ScheduleSchema.safeParse({
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      flexibility,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    if (isAvailable === false) {
      setErrors({ endAt: "Cannot proceed while the requested slot has booking conflicts." });
      return;
    }

    onNext({
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      flexibility,
      billableHours,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Step 4: Schedule & Operational Duration</h2>
        <p className="text-sm text-slate-500 mt-1">
          Specify your requested flight window. Live availability verifies slot capacity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Start Date & Time */}
        <div>
          <label htmlFor="start-at" className="block text-sm font-medium text-slate-700">
            Requested Start Time (IST) <span className="text-red-500">*</span>
          </label>
          <input
            id="start-at"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.startAt && <p className="mt-1 text-xs text-red-600">{errors.startAt}</p>}
        </div>

        {/* End Date & Time */}
        <div>
          <label htmlFor="end-at" className="block text-sm font-medium text-slate-700">
            Requested End Time (IST) <span className="text-red-500">*</span>
          </label>
          <input
            id="end-at"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.endAt && <p className="mt-1 text-xs text-red-600">{errors.endAt}</p>}
        </div>
      </div>

      {/* Live Availability Status Card */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">
              Total Duration: <strong className="text-slate-900">{billableHours} hour(s)</strong>
            </span>
          </div>

          <div>
            {isChecking ? (
              <div className="flex items-center space-x-1.5 text-xs text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking slot availability...</span>
              </div>
            ) : isAvailable === true ? (
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>Slot Available</span>
              </div>
            ) : isAvailable === false ? (
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span>Slot Unavailable</span>
              </div>
            ) : null}
          </div>
        </div>

        {conflictMessage && (
          <p className="mt-2 text-xs text-red-600 font-medium">{conflictMessage}</p>
        )}
      </div>

      {/* Flexibility Options */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Schedule Flexibility</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            onClick={() => setFlexibility("FIXED")}
            className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
              flexibility === "FIXED"
                ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="font-semibold text-sm text-slate-900">Fixed Time Window</p>
            <p className="text-xs text-slate-500 mt-1">
              Campaign must strictly fly within the exact window specified (e.g. synchronized with an event).
            </p>
          </div>

          <div
            onClick={() => setFlexibility("FLEXIBLE")}
            className={`cursor-pointer rounded-lg border p-3.5 transition-all ${
              flexibility === "FLEXIBLE"
                ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="font-semibold text-sm text-slate-900">Flexible Window</p>
            <p className="text-xs text-slate-500 mt-1">
              Allows Ops to shift flight by ±2 hours in case of transient local weather or wind delays.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back: Location
        </button>

        <button
          type="submit"
          disabled={isAvailable === false || isChecking}
          className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next: Target Audience & Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
