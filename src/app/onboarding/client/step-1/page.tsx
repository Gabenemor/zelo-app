
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ServiceSelectionChips } from '@/components/onboarding/service-selection-chips';
import { NIGERIAN_ARTISAN_SERVICES } from '@/types'; // Assuming this list is suitable
import { PageHeader } from '@/components/ui/page-header';
import { HeartHandshake } from 'lucide-react'; // Or another relevant icon
import { useToast } from '@/hooks/use-toast';
import { saveClientStep1Preferences } from '@/actions/onboarding-actions';
import { OnboardingProgressIndicator } from '@/components/onboarding/onboarding-progress-indicator';

export default function ClientOnboardingStep1() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one service you're interested in.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const result = await saveClientStep1Preferences(selectedServices);
    setIsLoading(false);

    if (result.success) {
      toast({ title: "Preferences Saved (Mock)", description: "Your service preferences have been noted." });
      router.push('/onboarding/client/step-2');
    } else {
      toast({
        title: "Error",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving client preferences:", result.error);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 sm:py-12">
      <PageHeader
        title="Welcome to Zelo!"
        description="Let's get you started. What services are you looking for?"
        icon={HeartHandshake}
      />
      <OnboardingProgressIndicator currentStep={1} totalSteps={2} />
      <div className="space-y-6 p-6 border rounded-lg shadow-sm bg-card">
        <ServiceSelectionChips
          availableServices={NIGERIAN_ARTISAN_SERVICES.filter(s => s !== "Other")} // Exclude "Other" for now or handle separately
          selectedServices={selectedServices}
          onSelectedServicesChange={setSelectedServices}
          selectionType="multiple"
        />
        <div className="flex justify-end">
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? "Saving..." : "Next: Setup Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
