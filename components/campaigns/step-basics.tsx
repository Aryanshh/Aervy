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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Step 1: Campaign Basics</h2>
        <p className="text-sm text-slate-500 mt-1">
          Provide primary campaign identification and marketing objectives.
        </p>
      </div>

      <div className="space-y-4">
        {/* Campaign Name */}
        <div>
          <label htmlFor="campaign-name" className="block text-sm font-medium text-slate-700">
            Campaign Name <span className="text-red-500">*</span>
          </label>
          <input
            id="campaign-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Summer Festival Brand Activation 2026"
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500 bg-red-50" : "border-slate-300"
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        {/* Brand Name */}
        <div>
          <label htmlFor="brand-name" className="block text-sm font-medium text-slate-700">
            Brand / Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            id="brand-name"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="e.g. Acme Corporation"
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.brand ? "border-red-500 bg-red-50" : "border-slate-300"
            }`}
          />
          {errors.brand && <p className="mt-1 text-xs text-red-600">{errors.brand}</p>}
        </div>

        {/* Objective */}
        <div>
          <label htmlFor="objective" className="block text-sm font-medium text-slate-700">
            Primary Campaign Objective <span className="text-red-500">*</span>
          </label>
          <select
            id="objective"
            value={objective}
            onChange={(e) => setObjective(e.target.value as (typeof CAMPAIGN_OBJECTIVES)[number])}
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CAMPAIGN_OBJECTIVES.map((obj) => (
              <option key={obj} value={obj}>
                {obj}
              </option>
            ))}
          </select>
          {errors.objective && <p className="mt-1 text-xs text-red-600">{errors.objective}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Campaign Summary / Notes <span className="text-xs text-slate-400">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe the theme or key visual messaging of your campaign."
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Next: Creative Upload
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
