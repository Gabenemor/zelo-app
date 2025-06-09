
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ServiceSelectionChips } from '@/components/onboarding/service-selection-chips';
import { NIGERIAN_ARTISAN_SERVICES } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Briefcase, Loader2, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveArtisanStep1Details } from '@/actions/onboarding-actions'; // Corrected import
import { OnboardingProgressIndicator } from '@/components/onboarding/onboarding-progress-indicator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceExperienceItem {
  serviceName: string;
  years: string; // Keep as string for input, convert on submit
}

function ArtisanOnboardingStep1Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [selectedPrimaryServices, setSelectedPrimaryServices] = useState<string[]>([]);
  const [serviceExperiences, setServiceExperiences] = useState<ServiceExperienceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const MAX_SERVICES = 2;

  const firstName = searchParams ? searchParams.get('firstName') : null;

  // Sync serviceExperiences state when selectedPrimaryServices changes
  useEffect(() => {
    setServiceExperiences(currentExperiences => {
      const newExperiences: ServiceExperienceItem[] = [];
      // Add or keep existing selected services
      for (const serviceName of selectedPrimaryServices) {
        const existing = currentExperiences.find(exp => exp.serviceName === serviceName);
        newExperiences.push(existing || { serviceName, years: '' });
      }
      // Filter out experiences for services no longer selected
      return newExperiences.filter(exp => selectedPrimaryServices.includes(exp.serviceName));
    });
  }, [selectedPrimaryServices]);

  const handleYearsChange = (serviceName: string, years: string) => {
    setServiceExperiences(prevExperiences =>
      prevExperiences.map(exp =>
        exp.serviceName === serviceName ? { ...exp, years } : exp
      )
    );
  };

  const handleNext = async () => {
    if (selectedPrimaryServices.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one service you offer.",
        variant: "destructive",
      });
      return;
    }
    if (selectedPrimaryServices.length > MAX_SERVICES) {
      toast({
        title: "Too Many Services",
        description: `Please select a maximum of ${MAX_SERVICES} primary services.`,
        variant: "destructive",
      });
      return;
    }

    const experiencesToSave: Array<{ serviceName: string; years: number }> = [];
    for (const serviceName of selectedPrimaryServices) {
      const exp = serviceExperiences.find(e => e.serviceName === serviceName);
      if (!exp || exp.years.trim() === '') {
        toast({
          title: "Missing Experience",
          description: `Please enter years of experience for ${serviceName}.`,
          variant: "destructive",
        });
        return;
      }
      const yearsNum = parseInt(exp.years, 10);
      if (isNaN(yearsNum) || yearsNum < 0) {
        toast({
          title: "Invalid Experience",
          description: `Please enter valid, non-negative years of experience for ${exp.serviceName}.`,
          variant: "destructive",
        });
        return;
      }
      experiencesToSave.push({ serviceName: exp.serviceName, years: yearsNum });
    }
    
    if (experiencesToSave.length !== selectedPrimaryServices.length) {
        toast({
            title: "Data Mismatch",
            description: "Error preparing experience data. Please re-check your inputs.",
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);
    const result = await saveArtisanStep1Details(experiencesToSave);
    setIsLoading(false);

    if (result.success && result.data) {
      toast({ title: "Details Saved", description: "Your primary services and experience have been noted." });
      const queryParams = new URLSearchParams();
      if (firstName) queryParams.append('firstName', firstName);
      // Pass both serviceExperiences (for the profile form data) and servicesOffered (as a simple array for easier access if needed)
      queryParams.append('serviceExperiences', JSON.stringify(result.data.serviceExperiences));
      queryParams.append('servicesOffered', JSON.stringify(result.data.servicesOffered)); // servicesOffered is also part of result.data
      router.push(`/onboarding/artisan/step-2?${queryParams.toString()}`);
    } else {
      toast({
        title: "Error",
        description: result.error?.serviceExperiences?.[0] || result.error?.servicesOffered?.[0] || (typeof result.error === 'string' ? result.error : "Could not save your details. Please try again."),
        variant: "destructive",
      });
      console.error("Error saving artisan step 1 details:", result.error);
    }
  };

  const pageTitle = firstName ? `Welcome to Zelo, ${firstName}!` : "Welcome to Zelo!";
  const pageDescription = `Showcase your skills. Select up to ${MAX_SERVICES} primary services you offer and specify your years of experience for each. You can add more services later from your profile.`;

  return (
    <div className="container mx-auto max-w-2xl py-8 sm:py-12">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        icon={Briefcase}
      />
      <OnboardingProgressIndicator currentStep={1} totalSteps={2} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Your Primary Services</CardTitle>
          <CardDescription>Choose up to {MAX_SERVICES} services you are most skilled in.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceSelectionChips
            availableServices={NIGERIAN_ARTISAN_SERVICES}
            selectedServices={selectedPrimaryServices}
            onSelectedServicesChange={setSelectedPrimaryServices}
            selectionType="multiple"
            maxSelections={MAX_SERVICES}
          />
        </CardContent>
      </Card>

      {selectedPrimaryServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Years of Experience</CardTitle>
            <CardDescription>For each selected service, please enter your years of professional experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceExperiences.filter(exp => selectedPrimaryServices.includes(exp.serviceName)).map((exp) => (
              <div key={exp.serviceName} className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between bg-secondary/30">
                <Label htmlFor={`years-${exp.serviceName}`} className="text-sm font-medium text-foreground sm:w-2/5">
                  {exp.serviceName}
                </Label>
                <div className="relative sm:w-3/5">
                  <Hash className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={`years-${exp.serviceName}`}
                    type="number"
                    min="0"
                    placeholder="e.g., 5"
                    value={exp.years}
                    onChange={(e) => handleYearsChange(exp.serviceName, e.target.value)}
                    className="pl-10 text-sm h-9"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex justify-end">
        <Button onClick={handleNext} disabled={isLoading || selectedPrimaryServices.length === 0}>
          {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : "Next: Complete Your Profile"}
        </Button>
      </div>
    </div>
  );
}

export default function ArtisanOnboardingStep1Page() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading details...</p>
      </div>
    }>
      <ArtisanOnboardingStep1Content />
    </Suspense>
  );
}

    