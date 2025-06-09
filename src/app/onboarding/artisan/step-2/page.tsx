
"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { ArtisanProfileForm } from '@/components/profile/artisan-profile-form';
import { UserCircle2, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveArtisanOnboardingProfile } from '@/actions/onboarding-actions';
import type { ArtisanProfile } from '@/types'; 
import { OnboardingProgressIndicator } from '@/components/onboarding/onboarding-progress-indicator';
import { Button } from '@/components/ui/button';

function ArtisanOnboardingStep2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const MOCK_USER_ID = "mockArtisanUserIdOnboarding"; 
  const firstName = searchParams ? searchParams.get('firstName') : null;

  // This component will now rely on the ArtisanProfileForm's internal submit.
  // The "Go to Dashboard" button will only navigate after the form's own save is (conceptually) successful.
  const handleGoToDashboard = () => {
    // In a real app, you'd check if the profile form actually saved successfully.
    // For this mock, we assume the ArtisanProfileForm's save was triggered and then this button is clicked.
    toast({ title: "Profile Setup Complete (Mock)", description: "Your artisan profile is set up!" });
    router.push('/dashboard');
  };
  
  const pageTitle = firstName ? `Almost there, ${firstName}!` : "Complete Your Artisan Profile";
  const pageDescription = "This information is vital for clients to find and trust your services. Please fill it out carefully.";

  if (!searchParams) { // Still waiting for searchParams
    return (
      <div className="container mx-auto max-w-3xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading profile editor...</p>
      </div>
    );
  }

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
          // Note: ArtisanProfileForm uses its own mock save and doesn't currently take an onSave prop
          // that integrates with server actions from this parent.
          // A more robust solution would refactor ArtisanProfileForm to use the server action
          // or provide an onSave callback that this page can use with `saveArtisanOnboardingProfile`.
        />
         <div className="mt-8 flex justify-end p-6 sm:p-0">
            <Button 
                onClick={handleGoToDashboard}
                // disabled={isLoading} // isLoading would be tied to ArtisanProfileForm's submission
                className="font-semibold"
            >
                {isLoading ? "Finalizing..." : <><Save className="mr-2 h-4 w-4" /> Go to Dashboard</>}
            </Button>
        </div>
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
