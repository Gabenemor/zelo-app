
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ServiceSelectionChips } from '@/components/onboarding/service-selection-chips';
import { NIGERIAN_ARTISAN_SERVICES } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Briefcase, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveArtisanStep1Services } from '@/actions/onboarding-actions';
import { OnboardingProgressIndicator } from '@/components/onboarding/onboarding-progress-indicator';

function ArtisanOnboardingStep1Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const MAX_SERVICES = 2;

  const firstName = searchParams ? searchParams.get('firstName') : null;

  const handleNext = async () => {
    if (selectedServices.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one service you offer.",
        variant: "destructive",
      });
      return;
    }
    if (selectedServices.length > MAX_SERVICES) {
        toast({
            title: "Too Many Services",
            description: `Please select a maximum of ${MAX_SERVICES} services for now. You can add more later from your profile.`,
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);
    const result = await saveArtisanStep1Services(selectedServices);
    setIsLoading(false);

    if (result.success) {
      toast({ title: "Services Selected (Mock)", description: "Your primary services have been noted." });
      router.push(`/onboarding/artisan/step-2${firstName ? `?firstName=${encodeURIComponent(firstName)}` : ''}`);
    } else {
      toast({
        title: "Error",
        description: result.error?.servicesOffered?.[0] || "Could not save your services. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving artisan services:", result.error);
    }
  };

  const pageTitle = firstName ? `Welcome to Zelo, ${firstName}!` : "Welcome to Zelo!";
  const pageDescription = `Showcase your skills. Select up to ${MAX_SERVICES} primary services you offer.`;

  if (!searchParams) { // Still waiting for searchParams
    return (
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 sm:py-12">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        icon={Briefcase}
      />
      <OnboardingProgressIndicator currentStep={1} totalSteps={2} />
      <div className="space-y-6 p-6 border rounded-lg shadow-sm bg-card">
        <ServiceSelectionChips
          availableServices={NIGERIAN_ARTISAN_SERVICES}
          selectedServices={selectedServices}
          onSelectedServicesChange={setSelectedServices}
          selectionType="multiple"
          maxSelections={MAX_SERVICES}
        />
        <div className="flex justify-end">
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? "Saving..." : "Next: Complete Your Profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ArtisanOnboardingStep1() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    }>
      <ArtisanOnboardingStep1Content />
    </Suspense>
  );
}
