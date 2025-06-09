
import React from 'react';
import { cn } from '@/lib/utils';

interface OnboardingProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function OnboardingProgressIndicator({
  currentStep,
  totalSteps,
  className,
}: OnboardingProgressIndicatorProps) {
  return (
    <div className={cn("w-full mb-6 p-4 rounded-lg bg-secondary", className)}>
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
