
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { ArtisanProfileForm } from '@/components/profile/artisan-profile-form';
import { UserCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveArtisanOnboardingProfile } from '@/actions/onboarding-actions';
import type { ArtisanProfile } from '@/types'; // Ensure ArtisanProfile is correctly typed
import { OnboardingProgressIndicator } from '@/components/onboarding/onboarding-progress-indicator';
import { Button } from '@/components/ui/button'; // Import Button
import { Save } from 'lucide-react'; // Import Save icon

// This is a workaround for the ArtisanProfileForm's internal submit handling
// In a more refactored scenario, ArtisanProfileForm might accept an onSave prop.
// For now, we replicate parts of its structure for the Zod schema within the server action.

export default function ArtisanOnboardingStep2() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock user ID - in a real app, this would come from authentication context
  const MOCK_USER_ID = "mockArtisanUserIdOnboarding"; 

  // The ArtisanProfileForm handles its own state and submission internally.
  // We will provide a function to ArtisanProfileForm to call upon its successful submission.
  // However, ArtisanProfileForm doesn't currently support an onSave callback prop.
  // So, we'll use a separate button here to trigger saving the data from ArtisanProfileForm.
  // This is not ideal, but a simpler change for now.
  // A better way would be to lift the form state or pass an onSave handler to ArtisanProfileForm.

  // For now, ArtisanProfileForm will use its own mock save.
  // This page's "Save and Go to Dashboard" button below the form will be a conceptual final step.
  // We'll modify the ArtisanProfileForm slightly to accept an onFormSubmit prop
  // or just add a button here that conceptually does the save.

  const handleSaveAndContinue = async (data: Partial<ArtisanProfile>) => {
    setIsLoading(true);
    
    // Ensure essential fields for the server action are present
    const profileDataToSave: Partial<ArtisanProfile> & { username?: string, contactEmail: string, servicesOffered: string[], location: string } = {
      contactEmail: data.contactEmail || "", // Assuming email is always present or handled by form
      servicesOffered: data.servicesOffered || [], // Assuming services are from previous step or form
      location: data.location || "", // Assuming location is always present or handled by form
      ...data, // Spread the rest of the data
    };


    // A quick check, ideally Zod schema in server action handles this better
    if (!profileDataToSave.contactEmail || !profileDataToSave.servicesOffered.length || !profileDataToSave.location) {
         toast({
            title: "Missing Information",
            description: "Please ensure email, services, and location are filled in the profile form.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }
    
    const result = await saveArtisanOnboardingProfile(profileDataToSave);
    setIsLoading(false);

    if (result.success) {
      toast({ title: "Profile Complete (Mock)", description: "Your artisan profile is set up!" });
      router.push('/dashboard');
    } else {
      toast({
        title: "Error Saving Profile",
        description: "Could not save your profile. Please check the details and try again.",
        variant: "destructive",
      });
      console.error("Artisan onboarding save error:", result.error);
    }
  };


  return (
    <div className="container mx-auto max-w-3xl py-8 sm:py-12">
      <PageHeader
        title="Complete Your Artisan Profile"
        description="This information is vital for clients to find and trust your services. Please fill it out carefully."
        icon={UserCircle2}
      />
      <OnboardingProgressIndicator currentStep={2} totalSteps={2} />
      <div className="p-0 sm:p-6 border-0 sm:border rounded-lg sm:shadow-sm sm:bg-card">
        {/* 
          The ArtisanProfileForm's own "Save Profile" button will perform its internal mock save.
          We are adding a conceptual "Save and Go to Dashboard" below it to simulate the final step.
          To make this work cleanly with Server Actions, ArtisanProfileForm would need refactoring
          to either take an onSave prop or for its Zod schema and save logic to be fully externalized.
        */}
        <ArtisanProfileForm 
          userId={MOCK_USER_ID} 
          // We can pass an onSave prop if ArtisanProfileForm is modified to accept it
          // onSave={(data) => handleSaveAndContinue(data)} 
        />
        {/* 
          Since ArtisanProfileForm has its own submit button which we are not overriding for now,
          this button is a bit redundant IF the form's button also navigates.
          If ArtisanProfileForm's button ONLY saves but doesn't navigate, then this button is the final step.
          For the current structure of ArtisanProfileForm (mock save, no navigation), we'll keep this button.
        */}
         <div className="mt-8 flex justify-end p-6 sm:p-0">
            <Button 
                onClick={() => {
                    // To make this button truly work, we'd need to get the form data from ArtisanProfileForm
                    // This typically involves using react-hook-form's `control` and `getValues` or submitting the form programmatically.
                    // For now, this is a placeholder that shows intent.
                    // A real implementation would call:
                    // const formData = artisanFormRef.current.getValues(); (if using a ref to form instance)
                    // handleSaveAndContinue(formData);
                    toast({ title: "Action Required", description: "Please use the 'Save Profile' button within the form above, then this button will take you to the dashboard (conceptual). In a real app, this would be one step."});
                    // Simulate a conceptual save and redirect
                    // handleSaveAndContinue({}); // Pass empty or retrieved data
                    // For now, let's just navigate to simulate flow completion after form save
                    // router.push('/dashboard');
                }}
                disabled={isLoading}
                className="font-semibold"
            >
                {isLoading ? "Finalizing..." : <><Save className="mr-2 h-4 w-4" /> Go to Dashboard</>}
            </Button>
        </div>
      </div>
    </div>
  );
}
