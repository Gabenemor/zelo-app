
"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MailCheck, Loader2 } from 'lucide-react';

export function VerifyEmailClientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = React.useState(false);

  // Extract parameters needed for onboarding
  const userType = searchParams ? searchParams.get('userType') : null;
  const firstName = searchParams ? searchParams.get('firstName') : null;
  const email = searchParams ? searchParams.get('email') : null;
  const uid = searchParams ? searchParams.get('uid') : null;


  const handleContinue = () => {
    setIsLoading(true);
    if (userType && firstName && uid) { // UID is now essential for next steps
      // Pass all necessary info, especially UID, to the onboarding start page.
      const queryParams = new URLSearchParams({
        firstName: firstName,
        // email: email || "", // Email might be useful for display or context
        uid: uid, // Crucial: pass the user's actual ID
      });
      router.push(`/onboarding/${userType}/step-1?${queryParams.toString()}`);
    } else {
      console.error("User type, first name, or UID missing from query params for onboarding.");
      // Fallback, perhaps to login or a generic dashboard if critical info is missing.
      router.push('/login'); 
      setIsLoading(false);
    }
  };

  if (!searchParams) {
    return (
      <div className="text-center space-y-6 flex flex-col items-center justify-center py-10">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading verification details...</p>
      </div>
    );
  }
  
  const displayEmail = email ? `to ${email}` : "to your email address";

  return (
    <div className="text-center space-y-6">
      <MailCheck className="mx-auto h-16 w-16 text-primary" />
      <p className="text-muted-foreground">
        We've sent a verification link {displayEmail}.
        Please click the link in the email to complete your registration.
        If you don&apos;t see the email, please check your spam folder.
      </p>
      <Button onClick={handleContinue} className="w-full" disabled={isLoading || !userType || !firstName || !uid}>
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
        ) : (
          "I've Verified, Continue to Onboarding"
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        (For demo purposes, clicking this button simulates email verification.)
      </p>
      {(!userType || !firstName || !uid) && (
        <p className="text-xs text-destructive">
          Could not retrieve necessary details for onboarding. Please try registering again.
        </p>
      )}
    </div>
  );
}
