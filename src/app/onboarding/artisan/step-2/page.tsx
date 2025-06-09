
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
      // serviceExperiencesString is no longer expected from step 1
      
      let servicesOffered: string[] = [];

      if (servicesOfferedString) {
        try {
          servicesOffered = JSON.parse(servicesOfferedString);
        } catch (e) {
          console.error("Failed to parse servicesOffered from URL for Step 2:", e);
          toast({ title: "Error", description: "Could not load service details. Please go back to Step 1.", variant: "destructive" });
          // Potentially redirect or handle error state
        }
      }
      
      setInitialFormValues(prev => ({
        ...prev,
        username: firstName || prev.username,
        servicesOffered, // Pass this to pre-fill the form's understanding of services
        serviceExperiences: [], // Initialize as empty or undefined, as it's not collected in step 1
      }));
      setIsLoadingPage(false);
    }
  }, [searchParams, toast, firstName]);

  const handleFormSaveSuccess = () => {
    toast({ title: "Profile Setup Complete", description: "Your artisan profile is set up!" });
    router.push('/dashboard');
  };

  const pageTitle = firstName ? `Almost there, ${firstName}!` : "Complete Your Artisan Profile";
  const pageDescription = "This information is vital for clients to find and trust your services. Your selected services from Step 1 are pre-filled. You can add years of experience for each service here or later from your main profile page.";

  if (isLoadingPage || !searchParams) {
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
          backButtonText={<><ArrowLeft className="mr-2 h-4 w-4" /> Back to Step 1</>}
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
