
"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MailCheck, Loader2 } from 'lucide-react';

export function VerifyEmailClientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);

  // It's good practice to ensure searchParams is available before trying to get values
  const userType = searchParams ? searchParams.get('userType') : null;

  const handleContinue = () => {
    setIsLoading(true);
    if (userType) {
      // In a real app, you might want to check if the email is actually verified
      // with Firebase Auth before redirecting.
      // For now, we directly go to onboarding.
      router.push(`/onboarding/${userType}/step-1`);
    } else {
      console.error("User type missing from query params for onboarding.");
      // Fallback to dashboard or an error page if userType is somehow lost
      router.push('/dashboard'); 
      setIsLoading(false);
    }
    // No need to setIsLoading(false) here if router.push navigates away
  };

  if (!searchParams) {
    // This can happen during the initial render before Suspense resolves searchParams
    return (
      <div className="text-center space-y-6 flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading verification details...</p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <MailCheck className="mx-auto h-16 w-16 text-primary" />
      <p className="text-muted-foreground">
        Please click the link in the email we sent you to complete your registration.
        If you don&apos;t see the email, please check your spam folder.
      </p>
      <Button onClick={handleContinue} className="w-full" disabled={isLoading || !userType}>
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
        ) : (
          "I've Verified, Continue to Onboarding"
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        (For demo purposes, clicking this button simulates email verification.)
      </p>
      {!userType && (
        <p className="text-xs text-destructive">
          Could not determine account type for onboarding. Please try registering again.
        </p>
      )}
    </div>
  );
}
