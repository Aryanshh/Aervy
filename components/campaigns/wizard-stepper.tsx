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
    <div className="w-full border-b border-slate-200 bg-white py-4 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
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
                    className="group flex flex-col items-center w-full focus:outline-none"
                  >
                    <div className="flex items-center w-full">
                      {index > 0 && (
                        <div
                          className={`h-0.5 flex-1 transition-colors ${
                            stepNumber <= currentStep ? "bg-blue-600" : "bg-slate-200"
                          }`}
                        />
                      )}

                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                          isCompleted
                            ? "bg-blue-600 text-white"
                            : isCurrent
                            ? "border-2 border-blue-600 bg-white text-blue-600 shadow-sm"
                            : "border-2 border-slate-200 bg-white text-slate-400"
                        }`}
                      >
                        {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                      </div>

                      {index < steps.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 transition-colors ${
                            stepNumber < currentStep ? "bg-blue-600" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium text-center hidden sm:block ${
                        isCurrent
                          ? "text-blue-600 font-semibold"
                          : isCompleted
                          ? "text-slate-700"
                          : "text-slate-400"
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
