
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ServiceSelectionChips } from '@/components/onboarding/service-selection-chips';
import { NIGERIAN_ARTISAN_SERVICES } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Briefcase, Loader2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateArtisanPrimaryServices } from '@/actions/onboarding-actions'; // Assuming action is here
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Mock user ID - in a real app, this would come from authentication context
const MOCK_ARTISAN_ID = "mockUserId123"; // Same as used in onboarding-actions
const REQUIRED_SERVICES_COUNT = 2;

// Mock function to get current artisan services - replace with actual data fetching
async function getArtisanCurrentServices(userId: string): Promise<string[]> {
  console.log("Fetching current services for (mock)", userId);
  // Simulate fetching, return a default or previously saved set
  return ["Plumbing", "Tailoring/Fashion Design"]; // Example
}


function EditArtisanServicesContent() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPrimaryServices, setSelectedPrimaryServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);

  useEffect(() => {
    async function fetchInitialServices() {
      setIsFetchingInitial(true);
      const currentServices = await getArtisanCurrentServices(MOCK_ARTISAN_ID);
      setSelectedPrimaryServices(currentServices);
      setIsFetchingInitial(false);
    }
    fetchInitialServices();
  }, []);

  const handleSaveChanges = async () => {
    if (selectedPrimaryServices.length !== REQUIRED_SERVICES_COUNT) {
      toast({
        title: "Selection Required",
        description: `Please select exactly ${REQUIRED_SERVICES_COUNT} primary services.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await updateArtisanPrimaryServices(MOCK_ARTISAN_ID, selectedPrimaryServices);
    setIsLoading(false);

    if (result.success && result.data) {
      toast({ title: "Services Updated", description: "Your primary services have been updated." });
      // Optionally redirect or offer to go back
      router.push('/dashboard/profile/artisan/edit'); // Back to main profile edit
    } else {
      let errorMessages: string[] = [];
      if (result.error) {
        if (result.error._form && Array.isArray(result.error._form)) {
          errorMessages = errorMessages.concat(result.error._form);
        }
        if (result.error.fields) {
          Object.values(result.error.fields).forEach(fieldErrorArray => {
            if (Array.isArray(fieldErrorArray)) {
              errorMessages = errorMessages.concat(fieldErrorArray as string[]);
            }
          });
        }
         if (result.error._server_error && Array.isArray(result.error._server_error)) {
            errorMessages = errorMessages.concat(result.error._server_error);
        }
      }
      const description = errorMessages.length > 0 ? errorMessages.join(' ') : "Could not update your services. Please try again.";
      
      toast({
        title: "Update Failed",
        description: description,
        variant: "destructive",
      });
      console.error("Error updating artisan services (raw API response):", result);
      if (result.error) console.error("Error updating artisan services (parsed error object):", result.error);
    }
  };

  if (isFetchingInitial) {
     return (
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading your services...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 sm:py-12">
      <PageHeader
        title="Edit Your Primary Services"
        description={`Update the two primary services you offer. This helps clients find you for the right jobs.`}
        icon={Briefcase}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Primary Services</CardTitle>
          <CardDescription>Choose exactly {REQUIRED_SERVICES_COUNT} services you are most skilled in. Details like experience and pricing for these can be managed on your main profile page.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceSelectionChips
            availableServices={NIGERIAN_ARTISAN_SERVICES}
            selectedServices={selectedPrimaryServices}
            onSelectedServicesChange={setSelectedPrimaryServices}
            selectionType="multiple"
            maxSelections={REQUIRED_SERVICES_COUNT}
          />
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/profile/artisan/edit">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile Edit
          </Link>
        </Button>
        <Button onClick={handleSaveChanges} disabled={isLoading || selectedPrimaryServices.length !== REQUIRED_SERVICES_COUNT}>
          {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
        </Button>
      </div>
    </div>
  );
}

export default function EditArtisanServicesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading page...</p>
      </div>
    }>
      <EditArtisanServicesContent />
    </Suspense>
  );
}
