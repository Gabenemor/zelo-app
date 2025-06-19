
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { ClientProfileSetupForm } from '@/components/onboarding/client-profile-setup-form';
import { UserCog, Loader2 } from 'lucide-react';
import { OnboardingProgressIndicator } from '@/components/onboarding/onboarding-progress-indicator';
import { useToast } from '@/hooks/use-toast';

function ClientOnboardingStep2Content() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null); // State for email
  const [isLoadingParams, setIsLoadingParams] = useState(true);


  useEffect(() => {
    if (searchParams) {
      setFirstName(searchParams.get('firstName'));
      const userIdFromParams = searchParams.get('uid');
      const emailFromParams = searchParams.get('email'); // Read email from params

      if (userIdFromParams) {
        setUid(userIdFromParams);
      } else {
        toast({ title: "Error", description: "User ID missing. Cannot proceed.", variant: "destructive" });
        router.replace('/login'); 
      }
      setEmail(emailFromParams); // Set email state
      setIsLoadingParams(false);
    }
  }, [searchParams, router, toast]);

  const pageTitle = firstName ? `Set up your profile, ${firstName}!` : "Complete Your Profile";
  const pageDescription = "Tell us a bit more about yourself to enhance your Zelo experience.";
  
  if (isLoadingParams || !searchParams || (!uid && searchParams.get('uid'))) { 
    return (
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading profile setup...</p>
      </div>
    );
  }
  
  if (!uid) { 
    return (
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center">
        <UserCog className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-semibold">Error: User ID is missing.</p>
        <p className="text-muted-foreground">Cannot complete profile setup without user identification.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 sm:py-12">
      <PageHeader
        title={pageTitle}
        description={pageDescription}
      />
      <OnboardingProgressIndicator currentStep={2} totalSteps={2} />
      <div className="p-6 border rounded-lg shadow-sm bg-card">
        <ClientProfileSetupForm 
            userId={uid} 
            initialFullName={firstName} 
            initialContactEmail={email} 
        />
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
