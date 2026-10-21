"use client";

import React, { useState } from "react";
import { CAMPAIGN_OBJECTIVES, step1BasicsSchema } from "@/lib/validation/campaign";
import { ArrowRight } from "lucide-react";

interface StepBasicsProps {
  initialData: {
    name?: string;
    brand?: string;
    objective?: string;
    description?: string;
  };
  onNext: (data: { name: string; brand: string; objective: string; description?: string }) => void;
}

export function StepBasics({ initialData, onNext }: StepBasicsProps) {
  const [name, setName] = useState(initialData.name ?? "");
  const [brand, setBrand] = useState(initialData.brand ?? "");
  const [objective, setObjective] = useState(
    initialData.objective ?? CAMPAIGN_OBJECTIVES[0]
  );
  const [description, setDescription] = useState(initialData.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = step1BasicsSchema.safeParse({
      name,
      brand,
      objective,
      description,
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

    onNext(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
      <div>
        <h2 className="text-xl font-heading font-bold text-[#ebebeb]">Step 1: Campaign Setup</h2>
        <p className="text-xs text-[#ebebeb]/50 mt-1">
          Provide primary campaign identification and marketing objectives.
        </p>
      </div>

      <div className="space-y-4">
        {/* Campaign Name */}
        <div>
          <label htmlFor="campaign-name" className="block text-xs uppercase tracking-wider text-[#ebebeb]/70 mb-1.5">
            Campaign Name <span className="text-[#ccff00]">*</span>
          </label>
          <input
            id="campaign-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Summer Festival Brand Activation 2026"
            className={`block w-full rounded-xl border bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-white/30 focus:border-[#ccff00] focus:outline-none transition-colors ${
              errors.name ? "border-red-500 bg-red-950/20" : "border-white/10"
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>

        {/* Brand Name */}
        <div>
          <label htmlFor="brand-name" className="block text-xs uppercase tracking-wider text-[#ebebeb]/70 mb-1.5">
            Brand / Organization Name <span className="text-[#ccff00]">*</span>
          </label>
          <input
            id="brand-name"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Acme Corporation"
            className={`block w-full rounded-xl border bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-white/30 focus:border-[#ccff00] focus:outline-none transition-colors ${
              errors.brand ? "border-red-500 bg-red-950/20" : "border-white/10"
            }`}
          />
          {errors.brand && <p className="mt-1 text-xs text-red-400">{errors.brand}</p>}
        </div>

        {/* Objective */}
        <div>
          <label htmlFor="objective" className="block text-xs uppercase tracking-wider text-[#ebebeb]/70 mb-1.5">
            Primary Campaign Objective <span className="text-[#ccff00]">*</span>
          </label>
          <select
            id="objective"
            value={objective}
            onChange={(e) => setObjective(e.target.value as (typeof CAMPAIGN_OBJECTIVES)[number])}
            className="block w-full rounded-xl border border-white/10 bg-black/60 px-3.5 py-2.5 text-xs text-[#ebebeb] focus:border-[#ccff00] focus:outline-none transition-colors"
          >
            {CAMPAIGN_OBJECTIVES.map((obj) => (
              <option key={obj} value={obj} className="bg-[#0c0c0c] text-[#ebebeb]">
                {obj}
              </option>
            ))}
          </select>
          {errors.objective && <p className="mt-1 text-xs text-red-400">{errors.objective}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs uppercase tracking-wider text-[#ebebeb]/70 mb-1.5">
            Campaign Summary / Notes <span className="text-xs text-[#ebebeb]/40">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe the theme or key visual messaging of your campaign."
            className="block w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-xs text-[#ebebeb] placeholder-white/30 focus:border-[#ccff00] focus:outline-none transition-colors"
          />
          {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-white/10">
        <button
          type="submit"
          className="inline-flex items-center rounded-full bg-[#ccff00] px-6 py-2.5 text-xs font-bold text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.25)]"
        >
          Next: Creative Upload
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
