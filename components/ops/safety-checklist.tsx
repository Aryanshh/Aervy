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
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock className="mr-1 h-3.5 w-3.5 text-amber-600" />
            In Review / Pending
          </span>
        );
      case "NOT_CHECKED":
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
            <AlertCircle className="mr-1 h-3.5 w-3.5 text-slate-400" />
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900">Pre-Flight Feasibility & Safety Checklist</h3>
        </div>
        <div className="text-xs">
          {allVerified ? (
            <span className="font-semibold text-emerald-600 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" /> All Checks Passed
            </span>
          ) : (
            <span className="text-amber-700 font-medium">Verification in progress</span>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Reviewers must inspect each operational prerequisite. Approving a campaign requires
        affirmative verification that airspace, creative, and regulatory conditions are satisfied.
      </p>

      <div className="divide-y divide-slate-100">
        {items.map((item) => {
          const currentStatus = state[item.key];
          return (
            <div key={item.key} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                    {item.regulatoryRef}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{item.description}</p>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-center">
                {readOnly ? (
                  getStatusBadge(currentStatus)
                ) : (
                  <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => onChange(item.key, "NOT_CHECKED")}
                      className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                        currentStatus === "NOT_CHECKED"
                          ? "bg-white text-slate-800 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Unchecked
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(item.key, "PENDING")}
                      className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                        currentStatus === "PENDING"
                          ? "bg-amber-100 text-amber-800 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(item.key, "VERIFIED")}
                      className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                        currentStatus === "VERIFIED"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
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
