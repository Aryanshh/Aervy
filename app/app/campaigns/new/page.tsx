"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WizardStepper } from "@/components/campaigns/wizard-stepper";
import { StepBasics } from "@/components/campaigns/step-basics";
import { StepCreative } from "@/components/campaigns/step-creative";
import { StepLocation } from "@/components/campaigns/step-location";
import { StepSchedule } from "@/components/campaigns/step-schedule";
import { StepDetails } from "@/components/campaigns/step-details";
import { StepReview } from "@/components/campaigns/step-review";
import { QuoteBreakdown } from "@/lib/pricing/types";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

const STEPS = ["Basics", "Creative", "Location", "Schedule", "Details", "Review & Pay"];

interface CampaignFormData {
  id?: string;
  name: string;
  brand: string;
  objective: string;
  description?: string;
  storageKey: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  title?: string;
  altText?: string;
  ctaText?: string;
  destinationUrl?: string;
  zoneId: string;
  zoneName: string;
  zoneRatePaise: number;
  startAt: string;
  endAt: string;
  billableHours: number;
  flexibility: string;
  audienceNotes?: string;
  notes?: string;
}

export default function NewCampaignWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    brand: "",
    objective: "Brand Awareness",
    description: "",
    storageKey: "",
    originalName: "",
    mimeType: "image/jpeg",
    sizeBytes: 0,
    title: "",
    altText: "",
    ctaText: "",
    destinationUrl: "",
    zoneId: "",
    zoneName: "",
    zoneRatePaise: 0,
    startAt: "",
    endAt: "",
    billableHours: 1,
    flexibility: "FIXED",
    audienceNotes: "",
    notes: "",
  });

  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [draftSaveStatus, setDraftSaveStatus] = useState<string | null>(null);

  // Auto-save draft helper
  const autoSaveDraft = async (updatedData: Partial<CampaignFormData>) => {
    try {
      const merged = { ...formData, ...updatedData };
      const res = await fetch("/api/campaigns/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: campaignId || undefined,
          ...merged,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setCampaignId(result.campaignId);
        setDraftSaveStatus("Draft auto-saved");
        setTimeout(() => setDraftSaveStatus(null), 3000);
      }
    } catch {
      // Non-blocking draft save failure
    }
  };

  // Step 1 -> 2
  const handleBasicsNext = (data: { name: string; brand: string; objective: string; description?: string }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    autoSaveDraft(data);
    setCurrentStep(2);
  };

  // Step 2 -> 3
  const handleCreativeNext = (data: {
    storageKey: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    title?: string;
    altText?: string;
    ctaText?: string;
    destinationUrl?: string;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    autoSaveDraft(data);
    setCurrentStep(3);
  };

  // Step 3 -> 4
  const handleLocationNext = (data: { zoneId: string; zoneRatePaise: number; zoneName: string }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    autoSaveDraft(data);
    setCurrentStep(4);
  };

  // Step 4 -> 5
  const handleScheduleNext = (data: {
    startAt: string;
    endAt: string;
    flexibility: string;
    billableHours: number;
  }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    autoSaveDraft(data);
    setCurrentStep(5);
  };

  // Step 5 -> 6
  const handleDetailsNext = (data: { audienceNotes?: string; notes?: string }) => {
    setFormData((prev) => ({ ...prev, ...data }));
    autoSaveDraft(data);
    setCurrentStep(6);
  };

  // Step 6: Submit Campaign Request
  const handleSubmitCampaign = async (_quote: QuoteBreakdown) => {
    setIsSubmitting(true);
    try {
      // 1. Save finalized draft
      const draftRes = await fetch("/api/campaigns/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: campaignId || undefined,
          ...formData,
          acknowledgedSafety: true,
        }),
      });

      if (!draftRes.ok) {
        throw new Error("Failed to save campaign submission");
      }

      const draftResult = await draftRes.json();
      setCampaignId(draftResult.campaignId);
      setIsSubmittedSuccess(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to submit campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link
              href="/app/dashboard"
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Dashboard
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-lg font-bold text-blue-600">Aervy Campaign Creator</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {draftSaveStatus && (
              <span className="text-slate-500 font-medium italic">{draftSaveStatus}</span>
            )}
            <div className="flex items-center space-x-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Safety Verified Flow</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <WizardStepper
        currentStep={currentStep}
        totalSteps={6}
        steps={STEPS}
        onSelectStep={(step) => step < currentStep && setCurrentStep(step)}
      />

      {/* Main Container */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {isSubmittedSuccess ? (
            <div className="rounded-xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Campaign Request Submitted for Review
              </h2>
              <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                Your campaign <strong>&ldquo;{formData.name}&rdquo;</strong> has been saved and queued for
                operational review.
              </p>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-900 max-w-lg mx-auto">
                <p className="font-semibold">⚠️ Operational Next Steps:</p>
                <p className="mt-1">
                  Submission of this request does not authorize flight. Aervy operations staff will inspect
                  the creative asset, verify airspace permissions, and confirm weather feasibility.
                </p>
              </div>

              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={() => router.push("/app/dashboard")}
                  className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  Go to Advertiser Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              {currentStep === 1 && (
                <StepBasics initialData={formData} onNext={handleBasicsNext} />
              )}
              {currentStep === 2 && (
                <StepCreative
                  initialData={formData}
                  onBack={() => setCurrentStep(1)}
                  onNext={handleCreativeNext}
                />
              )}
              {currentStep === 3 && (
                <StepLocation
                  initialData={formData}
                  onBack={() => setCurrentStep(2)}
                  onNext={handleLocationNext}
                />
              )}
              {currentStep === 4 && (
                <StepSchedule
                  zoneId={formData.zoneId}
                  initialData={formData}
                  onBack={() => setCurrentStep(3)}
                  onNext={handleScheduleNext}
                />
              )}
              {currentStep === 5 && (
                <StepDetails
                  initialData={formData}
                  onBack={() => setCurrentStep(4)}
                  onNext={handleDetailsNext}
                />
              )}
              {currentStep === 6 && (
                <StepReview
                  data={formData}
                  onBack={() => setCurrentStep(5)}
                  onSaveDraft={() => autoSaveDraft(formData)}
                  onSubmitCampaign={handleSubmitCampaign}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
