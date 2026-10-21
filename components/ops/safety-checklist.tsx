"use client";

import React from "react";
import { CheckCircle2, Clock, AlertCircle, ShieldAlert } from "lucide-react";

export type ChecklistItemStatus = "NOT_CHECKED" | "PENDING" | "VERIFIED";

export interface SafetyChecklistState {
  creativeStandards: ChecklistItemStatus;
  airspaceClearance: ChecklistItemStatus;
  venuePolicePermits: ChecklistItemStatus;
  weatherEnvelope: ChecklistItemStatus;
}

interface SafetyChecklistProps {
  state: SafetyChecklistState;
  onChange: (key: keyof SafetyChecklistState, status: ChecklistItemStatus) => void;
  readOnly?: boolean;
}

export function SafetyChecklist({ state, onChange, readOnly = false }: SafetyChecklistProps) {
  const items: Array<{
    key: keyof SafetyChecklistState;
    title: string;
    description: string;
    regulatoryRef: string;
  }> = [
    {
      key: "creativeStandards",
      title: "1. Creative Quality & Safety Standards",
      description:
        "Contrast meets safety readability; no disorienting strobe frequencies (>3Hz) or hazardous content.",
      regulatoryRef: "ASCI / DGCA Display Code §4.1",
    },
    {
      key: "airspaceClearance",
      title: "2. Airspace & Digital Sky Clearance",
      description:
        "Zone is verified Green Zone under DGCA rules; maximum flight altitude below 120m (400ft) AGL.",
      regulatoryRef: "DGCA Drone Rules 2021 / DigitalSky",
    },
    {
      key: "venuePolicePermits",
      title: "3. Local Venue & Police Permissions",
      description:
        "Local municipal or ground property owner NOC verified on record; police notification completed.",
      regulatoryRef: "Municipal Outdoor Advertising Regs",
    },
    {
      key: "weatherEnvelope",
      title: "4. Weather & Wind Safety Envelope",
      description:
        "Forecasted surface wind speeds < 15 knots (28 km/h); ground visibility > 3km; zero precipitation.",
      regulatoryRef: "Standard Operating Flight Envelope V1",
    },
  ];

  const getStatusBadge = (status: ChecklistItemStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center rounded-full bg-[#10b981]/10 px-3 py-1 font-mono text-[11px] font-bold text-[#10b981] border border-[#10b981]/30">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            Verified
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-bold text-amber-400 border border-amber-500/30">
            <Clock className="mr-1 h-3.5 w-3.5" />
            In Review / Pending
          </span>
        );
      case "NOT_CHECKED":
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 font-mono text-[11px] font-bold text-[#ebebeb]/50 border border-white/10">
            <AlertCircle className="mr-1 h-3.5 w-3.5" />
            Not Checked
          </span>
        );
    }
  };

  const allVerified =
    state.creativeStandards === "VERIFIED" &&
    state.airspaceClearance === "VERIFIED" &&
    state.venuePolicePermits === "VERIFIED" &&
    state.weatherEnvelope === "VERIFIED";

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-[#ccff00]" />
          <h3 className="font-heading text-base font-bold text-[#ebebeb] tracking-tight">Pre-Flight Safety Checklist</h3>
        </div>
        <div>
          {allVerified ? (
            <span className="font-mono text-xs font-bold text-[#10b981] flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> All Checks Passed
            </span>
          ) : (
            <span className="font-mono text-xs text-amber-400">Verification in progress</span>
          )}
        </div>
      </div>

      <p className="font-mono text-xs text-[#ebebeb]/50 leading-relaxed">
        Reviewers must inspect each operational prerequisite. Approving a campaign requires
        affirmative verification that airspace, creative, and regulatory conditions are satisfied.
      </p>

      <div className="divide-y divide-white/5">
        {items.map((item) => {
          const currentStatus = state[item.key];
          return (
            <div key={item.key} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="font-heading text-sm font-semibold text-[#ebebeb]">{item.title}</span>
                  <span className="font-mono text-[10px] text-[#ccff00] bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                    {item.regulatoryRef}
                  </span>
                </div>
                <p className="text-xs text-[#ebebeb]/60">{item.description}</p>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-center">
                {readOnly ? (
                  getStatusBadge(currentStatus)
                ) : (
                  <div className="flex items-center space-x-1 bg-black/60 p-1 rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => onChange(item.key, "NOT_CHECKED")}
                      className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium transition-colors ${
                        currentStatus === "NOT_CHECKED"
                          ? "bg-white/15 text-white shadow-sm"
                          : "text-[#ebebeb]/40 hover:text-white"
                      }`}
                    >
                      Unchecked
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(item.key, "PENDING")}
                      className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium transition-colors ${
                        currentStatus === "PENDING"
                          ? "bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30"
                          : "text-[#ebebeb]/40 hover:text-white"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(item.key, "VERIFIED")}
                      className={`px-2.5 py-1 text-xs rounded-lg font-mono font-bold transition-colors ${
                        currentStatus === "VERIFIED"
                          ? "bg-[#10b981] text-black shadow-sm"
                          : "text-[#ebebeb]/40 hover:text-white"
                      }`}
                    >
                      Verified
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
