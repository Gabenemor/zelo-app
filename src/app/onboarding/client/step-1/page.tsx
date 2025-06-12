
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function ClientOnboardingStep1Content() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  const firstName = searchParams ? searchParams.get('firstName') : null;

  useEffect(() => {
    if (searchParams) {
      const userIdFromParams = searchParams.get('uid');
      if (userIdFromParams) {
        setUid(userIdFromParams);
      } else {
        toast({ title: "Error", description: "User ID missing. Cannot proceed.", variant: "destructive" });
        router.replace('/login'); // Or a generic error page
      }
    }
  }, [searchParams, router, toast]);

  const handleNext = async () => {
    if (!uid) {
      toast({ title: "Error", description: "User ID missing. Cannot proceed.", variant: "destructive" });
      return;
    }
    if (selectedServices.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one service you're interested in.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const result = await saveClientStep1Preferences(uid, selectedServices);
    setIsLoading(false);

    if (result.success) {
      toast({ title: "Preferences Saved", description: "Your service preferences have been noted." });
      const queryParams = new URLSearchParams();
      if (firstName) queryParams.append('firstName', firstName);
      if (uid) queryParams.append('uid', uid); // Pass UID to step 2
      router.push(`/onboarding/client/step-2?${queryParams.toString()}`);
    } else {
      let errorMsg = "Could not save your preferences. Please try again.";
       if (result.error) {
            if (result.error._form && Array.isArray(result.error._form)) {
                errorMsg = result.error._form.join(' ');
            } else if (typeof result.error.servicesLookingFor === 'string') {
                errorMsg = result.error.servicesLookingFor;
            } else if (Array.isArray(result.error.servicesLookingFor)) {
                errorMsg = result.error.servicesLookingFor.join(' ');
            }
        }
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error saving client preferences:", result.error);
    }
  };

  const pageTitle = firstName ? `Welcome to Zelo, ${firstName}!` : "Welcome to Zelo!";
  const pageDescription = "Let's get you started. What services are you looking for?";

  if (!searchParams || !uid && searchParams.get('uid')) { // Show loader if searchParams not ready or UID is expected but not set
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
        icon={Users}
      />
      <OnboardingProgressIndicator currentStep={1} totalSteps={2} />
      <Card className="mb-6">
        <CardHeader>
            <CardTitle>Services You're Interested In</CardTitle>
            <CardDescription>Select the types of services you typically look for. This helps us tailor your experience.</CardDescription>
        </CardHeader>
        <CardContent>
            <ServiceSelectionChips
                availableServices={NIGERIAN_ARTISAN_SERVICES.filter(s => s !== "Other")}
                selectedServices={selectedServices}
                onSelectedServicesChange={setSelectedServices}
                selectionType="multiple"
            />
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={isLoading || !uid}>
          {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : "Next: Setup Profile"}
        </Button>
      </div>
    </div>
  );
}

export default function ClientOnboardingStep1Page() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    }>
      <ClientOnboardingStep1Content />
    </Suspense>
  );
}
