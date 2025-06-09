
"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { ClientProfileSetupForm } from '@/components/onboarding/client-profile-setup-form';
import { UserCog, Loader2 } from 'lucide-react';
import { OnboardingProgressIndicator } from '@/components/onboarding/onboarding-progress-indicator';

function ClientOnboardingStep2Content() {
  const searchParams = useSearchParams();
  const firstName = searchParams ? searchParams.get('firstName') : null;

  const pageTitle = firstName ? `Set up your profile, ${firstName}!` : "Complete Your Profile";
  const pageDescription = "Tell us a bit more about yourself to enhance your Zelo experience.";
  
  if (!searchParams) { // Still waiting for searchParams
    return (
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading profile setup...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 sm:py-12">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        icon={UserCog}
      />
      <OnboardingProgressIndicator currentStep={2} totalSteps={2} />
      <div className="p-6 border rounded-lg shadow-sm bg-card">
        <ClientProfileSetupForm />
      </div>
    </div>
  );
}

export default function ClientOnboardingStep2Page() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading...</p>
      </div>
    }>
      <ClientOnboardingStep2Content />
    </Suspense>
  );
}
