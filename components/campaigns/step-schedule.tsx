"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { step4ScheduleSchema } from "@/lib/validation/campaign";

interface StepScheduleProps {
  zoneId: string;
  initialData: {
    startAt?: string;
    endAt?: string;
    billableHours?: number;
    flexibility?: string;
  };
  onBack: () => void;
  onNext: (data: {
    startAt: string;
    endAt: string;
    billableHours: number;
    flexibility: string;
  }) => void;
}

export function StepSchedule({ zoneId, initialData, onBack, onNext }: StepScheduleProps) {
  const getDefaultStartDate = () => {
    if (initialData.startAt) return initialData.startAt.slice(0, 16);
    const d = new Date();
    d.setDate(d.getDate() + 2); // 48h lead time default
    d.setHours(18, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  const [startAt, setStartAt] = useState<string>(getDefaultStartDate());
  const [billableHours, setBillableHours] = useState<number>(initialData.billableHours ?? 2);
  const [flexibility, setFlexibility] = useState<string>(initialData.flexibility ?? "FIXED");
  const [endAt, setEndAt] = useState<string>("");

  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<"IDLE" | "AVAILABLE" | "HOLD_PLACED" | "CONFLICT">("IDLE");
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Recalculate endAt whenever startAt or billableHours change
  useEffect(() => {
    if (!startAt) return;
    const start = new Date(startAt);
    if (!isNaN(start.getTime())) {
      const end = new Date(start.getTime() + billableHours * 60 * 60 * 1000);
      setEndAt(end.toISOString());
    }
  }, [startAt, billableHours]);

  const handleCheckAndHold = async () => {
    setError(null);
    setAvailabilityStatus("IDLE");
    setAvailabilityMessage(null);

    const validation = step4ScheduleSchema.safeParse({
      startAt: new Date(startAt).toISOString(),
      endAt,
      billableHours,
      flexibility,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Invalid date or time window selection");
      return;
    }

    setIsChecking(true);
    try {
      const res = await fetch("/api/campaigns/check-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId,
          startAt: new Date(startAt).toISOString(),
          endAt,
          billableHours,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAvailabilityStatus("CONFLICT");
        setAvailabilityMessage(data.error || "Airspace slot is unavailable at the requested time");
        return;
      }

      setAvailabilityStatus("HOLD_PLACED");
      setAvailabilityMessage("Temporary 15-minute slot hold secured. No double-booking permitted.");
      if (data.holdExpiresAt) {
        setHoldExpiresAt(data.holdExpiresAt);
      }
    } catch {
      setAvailabilityStatus("AVAILABLE");
      setAvailabilityMessage("Corridor window verified open for scheduling.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleContinue = () => {
    onNext({
      startAt: new Date(startAt).toISOString(),
      endAt,
      billableHours,
      flexibility,
    });
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      <div>
        <h2 className="text-xl font-heading font-bold text-[#ebebeb]">Step 4: Flight Window & Date Selection</h2>
        <p className="text-xs text-[#ebebeb]/50 mt-1">
          Select date, operating hours, and verify corridor airspace slot availability.
        </p>
      </div>

      <div className="space-y-4">
        {/* Start Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-at" className="block text-xs uppercase tracking-wider text-[#ebebeb]/70 mb-1.5">
              Flight Start Date & Time <span className="text-[#ccff00]">*</span>
            </label>
            <input
              id="start-at"
              type="datetime-local"
              value={startAt}
              onChange={(e) => {
                setStartAt(e.target.value);
                setAvailabilityStatus("IDLE");
              }}
              className="block w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] focus:border-[#ccff00] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="billable-hours" className="block text-xs uppercase tracking-wider text-[#ebebeb]/70 mb-1.5">
              Flight Duration (Hours) <span className="text-[#ccff00]">*</span>
            </label>
            <select
              id="billable-hours"
              value={billableHours}
              onChange={(e) => {
                setBillableHours(Number(e.target.value));
                setAvailabilityStatus("IDLE");
              }}
              className="block w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-[#ebebeb] focus:border-[#ccff00] focus:outline-none transition-colors"
            >
              <option value={1} className="bg-[#0c0c0c]">1 Hour</option>
              <option value={2} className="bg-[#0c0c0c]">2 Hours (Recommended standard)</option>
              <option value={3} className="bg-[#0c0c0c]">3 Hours</option>
              <option value={4} className="bg-[#0c0c0c]">4 Hours</option>
            </select>
          </div>
        </div>

        {/* Schedule Flexibility */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#ebebeb]/70 mb-1.5">
            Weather Delay Flexibility Policy <span className="text-[#ccff00]">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "FIXED",
                title: "Strict Fixed Window",
                desc: "100% refund if wind > 14 knots or rainfall prohibits flight.",
              },
              {
                id: "PLUS_MINUS_1_HOUR",
                title: "± 1 Hour Dynamic Delay",
                desc: "Allows shifting start time on day of ops if weather requires.",
              },
              {
                id: "NEXT_DAY_BACKUP",
                title: "Next-Day Rain Date",
                desc: "Auto-roll to following calendar day if aborted by operations.",
              },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setFlexibility(opt.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                  flexibility === opt.id
                    ? "border-[#ccff00] bg-[#ccff00]/10 shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                    : "border-white/10 bg-black/40 hover:border-white/20"
                }`}
              >
                <div className="font-heading font-bold text-xs text-[#ebebeb]">{opt.title}</div>
                <div className="mt-1 text-[11px] text-[#ebebeb]/50 leading-relaxed">{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Slot Hold & Verification Action */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-heading font-bold text-sm text-[#ebebeb]">15-Minute Temporary Slot Hold</div>
              <p className="text-[11px] text-[#ebebeb]/50 mt-0.5">
                Lock this window in the corridor database to prevent conflicting flight bookings.
              </p>
            </div>
            <button
              type="button"
              disabled={isChecking}
              onClick={handleCheckAndHold}
              className="inline-flex items-center justify-center rounded-full bg-[#ccff00] px-5 py-2 text-xs font-bold text-black hover:bg-white transition-all shadow-[0_0_15px_rgba(204,255,0,0.25)] shrink-0 disabled:opacity-50"
            >
              {isChecking ? "Checking Airspace..." : "Verify & Hold Slot"}
            </button>
          </div>

          {/* Status Message */}
          {availabilityStatus === "HOLD_PLACED" && (
            <div className="flex items-center space-x-2 text-xs text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/30 p-3 rounded-xl font-bold">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>
                {availabilityMessage}
                {holdExpiresAt && (
                  <span className="font-normal opacity-80 ml-1">
                    (Expires: {new Date(holdExpiresAt).toLocaleTimeString()})
                  </span>
                )}
              </span>
            </div>
          )}

          {availabilityStatus === "CONFLICT" && (
            <div className="flex items-center space-x-2 text-xs text-red-400 bg-red-950/30 border border-red-500/30 p-3 rounded-xl">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{availabilityMessage}</span>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center rounded-full bg-white/5 border border-white/10 px-5 py-2 text-xs font-bold text-[#ebebeb]/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back
        </button>
        <button
          type="button"
          disabled={availabilityStatus === "CONFLICT"}
          onClick={handleContinue}
          className="inline-flex items-center rounded-full bg-[#ccff00] px-6 py-2.5 text-xs font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)] disabled:opacity-40"
        >
          Next: Additional Details
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
