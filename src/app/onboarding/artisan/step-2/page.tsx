
"use client";

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { ArtisanProfileForm } from '@/components/profile/artisan-profile-form';
import { UserCircle2, Save, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ArtisanProfile } from '@/types';
import { OnboardingProgressIndicator } from '@/components/onboarding/onboarding-progress-indicator';

function ArtisanOnboardingStep2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [initialFormValues, setInitialFormValues] = useState<Partial<ArtisanProfile>>({});
  const [isLoadingPage, setIsLoadingPage] = useState(true);


  const MOCK_USER_ID = "mockArtisanUserIdOnboarding"; 
  const firstName = searchParams ? searchParams.get('firstName') : null;

  useEffect(() => {
    if (searchParams) {
      const servicesOfferedString = searchParams.get('servicesOffered');
      let servicesOffered: string[] = [];
      if (servicesOfferedString) {
        try {
          servicesOffered = JSON.parse(servicesOfferedString);
        } catch (e) {
          console.error("Failed to parse servicesOffered from URL:", e);
          toast({ title: "Error", description: "Could not load selected services. Please go back and try again.", variant: "destructive" });
        }
      }
      // Ensure username is set from firstName if available, otherwise from existing profile username
      setInitialFormValues(prev => ({ 
        ...prev, 
        servicesOffered, 
        username: firstName || prev.username 
      }));
      setIsLoadingPage(false);
    }
  }, [searchParams, toast, firstName]);


  const handleFormSaveSuccess = () => {
    toast({ title: "Profile Setup Complete", description: "Your artisan profile is set up!" });
    router.push('/dashboard'); 
  };

  const pageTitle = firstName ? `Almost there, ${firstName}!` : "Complete Your Artisan Profile";
  const pageDescription = "This information is vital for clients to find and trust your services. Please fill it out carefully.";

  if (isLoadingPage || !searchParams || initialFormValues.servicesOffered === undefined) {
    return (
      <div className="container mx-auto max-w-3xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading profile editor...</p>
      </div>
    );
  }

  const backHref = `/onboarding/artisan/step-1${firstName ? `?firstName=${encodeURIComponent(firstName)}` : ''}`;

  return (
    <div className="container mx-auto max-w-3xl py-8 sm:py-12">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        icon={UserCircle2}
      />
      <OnboardingProgressIndicator currentStep={2} totalSteps={2} />
      <div className="p-0 sm:p-6 border-0 sm:border rounded-lg sm:shadow-sm sm:bg-card">
        <ArtisanProfileForm
          userId={MOCK_USER_ID}
          initialData={initialFormValues}
          onSaveSuccess={handleFormSaveSuccess}
          submitButtonText={<><Save className="mr-2 h-4 w-4" /> Save and Go to Dashboard</>}
          backButtonHref={backHref}
          backButtonText="Back to Step 1"
        />
      </div>
    </div>
  );
}

export default function ArtisanOnboardingStep2Page() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-3xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    }>
      <ArtisanOnboardingStep2Content />
    </Suspense>
  );
}
