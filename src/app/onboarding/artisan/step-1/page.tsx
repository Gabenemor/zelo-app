
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function ArtisanOnboardingStep1Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [selectedPrimaryServices, setSelectedPrimaryServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const REQUIRED_SERVICES_COUNT = 2;

  const firstName = searchParams ? searchParams.get('firstName') : null;

  useEffect(() => {
    if (searchParams) {
      const userIdFromParams = searchParams.get('uid');
      const emailFromParams = searchParams.get('email');
      if (userIdFromParams) {
        setUid(userIdFromParams);
      } else {
        toast({ title: "Error", description: "User ID missing. Cannot proceed with onboarding.", variant: "destructive" });
        router.replace('/login'); 
      }
      if (emailFromParams) {
        setEmail(emailFromParams);
      }
    }
  }, [searchParams, router, toast]);

  const handleNext = async () => {
    if (!uid) {
      toast({ title: "Error", description: "User ID missing. Cannot save services.", variant: "destructive" });
      return;
    }
    if (selectedPrimaryServices.length !== REQUIRED_SERVICES_COUNT) {
      toast({
        title: "Selection Required",
        description: `Please select exactly ${REQUIRED_SERVICES_COUNT} primary services you offer.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await saveArtisanStep1Services(uid, selectedPrimaryServices);
    setIsLoading(false);

    if (result.success && result.data) {
      toast({ title: "Services Saved", description: "Your primary services have been noted." });
      const queryParams = new URLSearchParams();
      if (firstName) queryParams.append('firstName', firstName);
      if (uid) queryParams.append('uid', uid);
      if (email) queryParams.append('email', email);
      queryParams.append('servicesOffered', JSON.stringify(result.data.servicesOffered));
      router.push(`/onboarding/artisan/step-2?${queryParams.toString()}`);
    } else {
      let errorMessages: string[] = [];
      if (result.error) {
        if (result.error._form && Array.isArray(result.error._form)) {
          errorMessages = errorMessages.concat(result.error._form);
        }
        if (result.error.fields) {
          Object.values(result.error.fields).forEach(fieldErrorArray => {
            if (Array.isArray(fieldErrorArray)) {
              errorMessages = errorMessages.concat(fieldErrorArray as string[]);
            }
          });
        }
         if (result.error._server_error && Array.isArray(result.error._server_error)) {
            errorMessages = errorMessages.concat(result.error._server_error);
        }
      }

      const description = errorMessages.length > 0 ? errorMessages.join(' ') : "Could not save your details. Please try again.";
      
      toast({
        title: "Error",
        description: description,
        variant: "destructive",
      });
      console.error("Error saving artisan services (raw API response):", result);
      if (result.error) {
        console.error("Error saving artisan services (parsed error object):", result.error);
      }
    }
  };

  const pageTitle = firstName ? `Welcome to Zelo, ${firstName}!` : "Welcome to Zelo!";
  const pageDescription = `Showcase your skills. Select exactly ${REQUIRED_SERVICES_COUNT} primary services you offer. You can add more details like years of experience later.`;
  
  if (!searchParams || !uid && searchParams.get('uid')) { 
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
      />
      <OnboardingProgressIndicator currentStep={1} totalSteps={2} />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Your Primary Services</CardTitle>
          <CardDescription>Choose exactly {REQUIRED_SERVICES_COUNT} services you are most skilled in.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceSelectionChips
            availableServices={NIGERIAN_ARTISAN_SERVICES}
            selectedServices={selectedPrimaryServices}
            onSelectedServicesChange={setSelectedPrimaryServices}
            selectionType="multiple"
            maxSelections={REQUIRED_SERVICES_COUNT} 
          />
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleNext} disabled={isLoading || !uid || selectedPrimaryServices.length !== REQUIRED_SERVICES_COUNT}>
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
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    }>
      <ArtisanOnboardingStep1Content />
    </Suspense>
  );
}
