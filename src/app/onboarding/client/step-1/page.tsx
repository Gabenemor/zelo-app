
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ServiceSelectionChips } from '@/components/onboarding/service-selection-chips';
import { NIGERIAN_ARTISAN_SERVICES } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveClientStep1Preferences } from '@/actions/onboarding-actions';
import { OnboardingProgressIndicator } from '@/components/onboarding/onboarding-progress-indicator';

function ClientOnboardingStep1Content() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Guaranteed to be non-null here by Suspense
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const firstName = searchParams.get('firstName');

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
      router.push(`/onboarding/client/step-2${firstName ? `?firstName=${encodeURIComponent(firstName)}` : ''}`);
    } else {
      toast({
        title: "Error",
        description: result.error?.servicesLookingFor?.[0] || "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving client preferences:", result.error);
    }
  };

  const pageTitle = firstName ? `Welcome to Zelo, ${firstName}!` : "Welcome to Zelo!";
  const pageDescription = "Let's get you started. What services are you looking for?";

  return (
    <div className="container mx-auto max-w-2xl py-8 sm:py-12">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        icon={Users}
      />
      <OnboardingProgressIndicator currentStep={1} totalSteps={2} />
      <div className="space-y-6 p-6 border rounded-lg shadow-sm bg-card">
        <ServiceSelectionChips
          availableServices={NIGERIAN_ARTISAN_SERVICES.filter(s => s !== "Other")}
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

export default function ClientOnboardingStep1Page() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading details...</p>
      </div>
    }>
      <ClientOnboardingStep1Content />
    </Suspense>
  );
}
