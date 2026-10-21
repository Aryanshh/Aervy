import React from "react";
import { Check } from "lucide-react";

interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  onSelectStep?: (step: number) => void;
}

export function WizardStepper({ currentStep, steps, onSelectStep }: WizardStepperProps) {
  return (
    <div className="w-full border-b border-white/10 bg-[#0c0c0c]/80 backdrop-blur-[16px] py-5 px-4 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((stepName, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;

              return (
                <li key={stepName} className="relative flex-1">
                  <button
                    type="button"
                    disabled={stepNumber > currentStep}
                    onClick={() => onSelectStep?.(stepNumber)}
                    className="group flex flex-col items-center w-full focus:outline-none cursor-pointer"
                  >
                    <div className="flex items-center w-full">
                      {index > 0 && (
                        <div
                          className={`h-0.5 flex-1 transition-colors ${
                            stepNumber <= currentStep ? "bg-[#ccff00]" : "bg-white/10"
                          }`}
                        />
                      )}

                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-mono font-bold transition-all ${
                          isCompleted
                            ? "bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]"
                            : isCurrent
                            ? "border-2 border-[#ccff00] bg-black text-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)] scale-110"
                            : "border border-white/20 bg-black/60 text-[#ebebeb]/40"
                        }`}
                      >
                        {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : stepNumber}
                      </div>

                      {index < steps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 transition-colors ${
                            stepNumber < currentStep ? "bg-[#ccff00]" : "bg-white/10"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2.5 text-xs font-mono text-center hidden sm:block ${
                        isCurrent
                          ? "text-[#ccff00] font-bold"
                          : isCompleted
                          ? "text-[#ebebeb]/80"
                          : "text-[#ebebeb]/40"
                      }`}
                    >
                      {stepName}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
