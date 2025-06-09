
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ServiceSelectionChips } from '@/components/onboarding/service-selection-chips';
import { NIGERIAN_ARTISAN_SERVICES } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Briefcase } from 'lucide-react'; // Changed from Wrench to Briefcase
import { useToast } from '@/hooks/use-toast';
import { saveArtisanStep1Services } from '@/actions/onboarding-actions';
import { OnboardingProgressIndicator } from '@/components/onboarding/onboarding-progress-indicator';

export default function ArtisanOnboardingStep1() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const MAX_SERVICES = 2;

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
      router.push('/onboarding/artisan/step-2');
    } else {
      toast({
        title: "Error",
        description: result.error?.servicesOffered?.[0] || "Could not save your services. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving artisan services:", result.error);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8 sm:py-12">
      <PageHeader
        title="Welcome, Artisan!"
        description={`Showcase your skills. Select up to ${MAX_SERVICES} primary services you offer.`}
        icon={Briefcase} // Changed from Wrench
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
