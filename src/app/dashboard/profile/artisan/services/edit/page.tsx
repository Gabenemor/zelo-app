
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ServiceSelectionChips } from '@/components/onboarding/service-selection-chips';
import { NIGERIAN_ARTISAN_SERVICES, type ArtisanProfile } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Briefcase, Loader2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateArtisanPrimaryServices } from '@/actions/onboarding-actions';
import { getArtisanProfile } from '@/lib/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAuthContext } from '@/components/providers/auth-provider';

const REQUIRED_SERVICES_COUNT = 2;

function EditArtisanServicesContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuthContext();
  const [selectedPrimaryServices, setSelectedPrimaryServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingInitial, setIsFetchingInitial] = useState(true);

  useEffect(() => {
    async function fetchInitialServices() {
      if (authLoading || !authUser || authUser.role !== 'artisan') {
        if (!authLoading && !authUser) {
          toast({ title: "Unauthorized", description: "Please log in as an artisan.", variant: "destructive" });
          router.replace('/login');
        } else if (!authLoading && authUser && authUser.role !== 'artisan') {
          toast({ title: "Access Denied", description: "This page is for artisans only.", variant: "destructive" });
          router.replace('/dashboard');
        }
        setIsFetchingInitial(false);
        return;
      }
      setIsFetchingInitial(true);
      try {
        const profile = await getArtisanProfile(authUser.uid);
        if (profile?.servicesOffered) {
            setSelectedPrimaryServices(profile.servicesOffered);
        } else {
            // If no profile or services, default to empty or guide to full profile setup
            toast({ title: "Profile Incomplete", description: "Please complete your main profile first.", variant: "default"});
        }
      } catch (error) {
        toast({title: "Error", description: "Could not load your current services.", variant: "destructive"});
        console.error("Error fetching artisan services:", error);
      } finally {
        setIsFetchingInitial(false);
      }
    }
    fetchInitialServices();
  }, [authUser, authLoading, router, toast]);

  const handleSaveChanges = async () => {
    if (!authUser?.uid) {
        toast({title: "Error", description: "User not identified.", variant: "destructive"});
        return;
    }
    if (selectedPrimaryServices.length !== REQUIRED_SERVICES_COUNT) {
      toast({
        title: "Selection Required",
        description: `Please select exactly ${REQUIRED_SERVICES_COUNT} primary services.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await updateArtisanPrimaryServices(authUser.uid, selectedPrimaryServices);
    setIsLoading(false);

    if (result.success && result.data) {
      toast({ title: "Services Updated", description: "Your primary services have been updated." });
      router.push('/dashboard/profile/artisan/edit'); 
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

  if (authLoading || isFetchingInitial) {
     return (
      <div className="container mx-auto max-w-2xl py-8 sm:py-12 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading your services...</p>
      </div>
    );
  }
  
  if (!authUser || authUser.role !== 'artisan') {
      return <div className="container mx-auto max-w-2xl py-8 sm:py-12 text-center"><p>Please log in as an artisan.</p></div>
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 sm:py-12">
      <PageHeader
        title="Edit Your Primary Services"
        description={`Update the two primary services you offer. This helps clients find you for the right jobs.`}
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
