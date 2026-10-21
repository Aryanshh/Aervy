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
import { ArrowLeft, CheckCircle2, ShieldCheck, Shield } from "lucide-react";

const STEPS = ["Campaign Setup", "Creative", "Flight Zone", "Date & Time", "Details", "Review & Pay"];

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

  const handleBasicsNext = (data: { name: string; brand: string; objective: string; description?: string }) => {
    const updated = { ...formData, ...data };
    setFormData(updated);
    autoSaveDraft(data);
    setCurrentStep(2);
  };

  const handleCreativeNext = (data: {
    storageKey: string;
    originalName: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp" | "video/mp4";
    sizeBytes: number;
    title?: string;
    altText?: string;
    ctaText?: string;
    destinationUrl?: string;
  }) => {
    const updated = { ...formData, ...data };
    setFormData(updated);
    autoSaveDraft(data);
    setCurrentStep(3);
  };

  const handleLocationNext = (data: { zoneId: string; zoneName: string; zoneRatePaise: number }) => {
    const updated = { ...formData, ...data };
    setFormData(updated);
    autoSaveDraft(data);
    setCurrentStep(4);
  };

  const handleScheduleNext = (data: {
    startAt: string;
    endAt: string;
    billableHours: number;
    flexibility: string;
  }) => {
    const updated = { ...formData, ...data };
    setFormData(updated);
    autoSaveDraft(data);
    setCurrentStep(5);
  };

  const handleDetailsNext = (data: { audienceNotes?: string; notes?: string }) => {
    const updated = { ...formData, ...data };
    setFormData(updated);
    autoSaveDraft(data);
    setCurrentStep(6);
  };

  const handleSubmitCampaign = async (_quote: QuoteBreakdown) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId: campaignId || undefined,
          zoneId: formData.zoneId,
          startAt: formData.startAt,
          endAt: formData.endAt,
          assets: [
            {
              storageKey: formData.storageKey,
              originalName: formData.originalName,
              mimeType: formData.mimeType,
              sizeBytes: formData.sizeBytes,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit campaign");
      }

      setIsSubmittedSuccess(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error submitting campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#ebebeb] flex flex-col relative overflow-x-hidden selection:bg-[#ccff00] selection:text-black font-sans pb-16">
      
      {/* Background Grid & Noise */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-80 z-0" />
      <div className="fixed inset-0 bg-noise pointer-events-none mix-blend-overlay z-0" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] glow-sphere-lime pointer-events-none z-0" />

      {/* Standard Sticky Header */}
      <header className="sticky top-0 z-50 w-full bg-[#000000]/85 backdrop-blur-[16px] border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center space-x-3">
            <Link
              href="/app/campaigns"
              className="inline-flex items-center text-xs font-mono text-[#ebebeb]/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Campaigns
            </Link>
            <span className="text-white/20">|</span>
            <span className="font-heading font-bold text-base text-[#ebebeb]">Campaign Setup Wizard</span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            {draftSaveStatus && (
              <span className="text-[#ccff00] font-medium italic">{draftSaveStatus}</span>
            )}
            <div className="flex items-center space-x-1.5 text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-full border border-[#10b981]/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Safety Verified Flow</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stepper Navigation */}
      <WizardStepper
        currentStep={currentStep}
        totalSteps={6}
        steps={STEPS}
        onSelectStep={(step) => step < currentStep && setCurrentStep(step)}
      />

      {/* Main Container */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        
        {/* Safety Notice Banner */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-4 text-xs font-mono text-[#ebebeb]/70 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#ccff00] shrink-0" />
            <span>
              Submitting a campaign is an operational request, not an automatic flight clearance. All flights operate strictly within DGCA Green Zones.
            </span>
          </div>
        </div>

        {isSubmittedSuccess ? (
          <div className="rounded-[2.5rem] border border-[#10b981]/40 bg-[#0c0c0c] p-10 text-center shadow-2xl font-mono">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10b981]/20 text-[#10b981] mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-[#ebebeb]">
              Campaign Request Submitted for Review
            </h2>
            <p className="mt-2 text-sm text-[#ebebeb]/60 max-w-md mx-auto">
              Your campaign <strong>&ldquo;{formData.name}&rdquo;</strong> has been saved and queued for
              operational safety review.
            </p>

            <div className="mt-6 rounded-2xl border border-[#ccff00]/30 bg-[#ccff00]/10 p-5 text-left text-xs text-[#ccff00] max-w-lg mx-auto">
              <p className="font-bold uppercase tracking-wider">⚠️ Operational Next Steps:</p>
              <p className="mt-1 text-[#ebebeb]/80 leading-relaxed">
                Submission of this request does not authorize flight. Aervy operations staff will inspect
                the creative asset, verify airspace permissions, and confirm weather feasibility.
              </p>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => router.push("/app/dashboard")}
                className="rounded-full bg-[#ccff00] px-8 py-3 text-sm font-bold font-sans text-black hover:bg-white transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)] uppercase tracking-wider"
              >
                Go to Advertiser Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-[2.5rem] border border-white/10 bg-[#0c0c0c] backdrop-blur-[16px] p-6 sm:p-10 shadow-2xl">
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
      </main>

      {/* Footer */}
      <footer className="w-full relative z-30 bg-[#000000] border-t border-white/10 px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#ebebeb]/40">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between">
          <div>© 2026 AERVY TECHNOLOGIES INC.</div>
          <div className="flex gap-6 mt-3 sm:mt-0">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/safety" className="hover:text-white transition-colors">Safety</Link>
            <Link href="/app/campaigns" className="hover:text-white transition-colors">Campaigns</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
