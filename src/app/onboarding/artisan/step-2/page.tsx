
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
  const [uid, setUid] = useState<string | null>(null);
  
  const firstName = searchParams ? searchParams.get('firstName') : null;
  const email = searchParams ? searchParams.get('email') : null;

  useEffect(() => {
    if (searchParams) {
      const userIdFromParams = searchParams.get('uid');
      if (userIdFromParams) {
        setUid(userIdFromParams);
      } else {
        toast({ title: "Error", description: "User ID missing. Cannot complete profile setup.", variant: "destructive" });
        router.replace('/login');
        setIsLoadingPage(false);
        return;
      }

      const servicesOfferedString = searchParams.get('servicesOffered');
      let servicesOffered: string[] = [];
      if (servicesOfferedString) {
        try {
          servicesOffered = JSON.parse(servicesOfferedString);
        } catch (e) {
          console.error("Failed to parse servicesOffered from URL for Step 2:", e);
          toast({ title: "Error", description: "Could not load service details. Please go back to Step 1.", variant: "destructive" });
        }
      }
      
      setInitialFormValues(prev => ({
        ...prev,
        username: firstName || prev.username,
        contactEmail: email || prev.contactEmail,
        servicesOffered, 
        serviceExperiences: servicesOffered.map(serviceName => ({
            serviceName: serviceName,
            years: 0,
            chargeAmount: undefined,
            chargeDescription: '',
        })),
      }));
      setIsLoadingPage(false);
    }
  }, [searchParams, toast, firstName, router, email]);

  const handleFormSaveSuccess = () => {
    toast({ title: "Profile Setup Complete", description: "Your artisan profile is set up!" });
    router.push('/dashboard?role=artisan'); 
  };

  const pageTitle = firstName ? `Almost there, ${firstName}!` : "Complete Your Artisan Profile";
  const pageDescription = "This information is vital for clients to find and trust your services. Your selected services from Step 1 are pre-filled. You can add years of experience for each service here or later from your main profile page.";

  if (isLoadingPage || !searchParams || (!uid && searchParams.get('uid'))) {
    return (
      <div className="container mx-auto max-w-3xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading profile editor...</p>
      </div>
    );
  }

  if (!uid) { // Safeguard if UID wasn't set properly
    return (
      <div className="container mx-auto max-w-3xl py-8 sm:py-12 flex flex-col items-center justify-center">
        <UserCircle2 className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold">Error: User ID is missing.</p>
        <p className="text-muted-foreground">Cannot load profile form without user identification.</p>
      </div>
    );
  }

  const backHrefQuery = new URLSearchParams();
  if (firstName) backHrefQuery.append('firstName', firstName);
  if (uid) backHrefQuery.append('uid', uid);
  if (email) backHrefQuery.append('email', email);
  const backHref = `/onboarding/artisan/step-1?${backHrefQuery.toString()}`;

  return (
    <div className="container mx-auto max-w-3xl py-8 sm:py-12">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
      />
      <OnboardingProgressIndicator currentStep={2} totalSteps={2} />
      <div className="p-0 sm:p-6 border-0 sm:border rounded-lg sm:shadow-sm sm:bg-card">
        <ArtisanProfileForm
          userId={uid} 
          initialData={initialFormValues}
          onSaveSuccess={handleFormSaveSuccess}
          submitButtonText={<><Save className="mr-2 h-4 w-4" /> Save and Go to Dashboard</>}
          backButtonHref={backHref}
          backButtonText="Back to Step 1"
          isOnboarding={true} 
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
