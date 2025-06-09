
"use client"; // Required for useEffect and useState, and client-side checks

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestForm } from "@/components/service-requests/service-request-form";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlusCircle, AlertTriangle, Edit } from "lucide-react";
import { checkClientProfileCompleteness } from '@/actions/onboarding-actions';
import { Skeleton } from '@/components/ui/skeleton';

// Mock user ID - in a real app, this would come from authentication context
const MOCK_CLIENT_ID = "mockClientUser456"; 

export default function NewServiceRequestPage() {
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null); // null for loading state
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      setIsLoadingCheck(true);
      // In a real app, get current user's ID from auth context
      const profileStatus = await checkClientProfileCompleteness(MOCK_CLIENT_ID);
      setIsProfileComplete(profileStatus.complete);
      setIsLoadingCheck(false);
    }
    checkProfile();
  }, []);

  if (isLoadingCheck) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Post a New Service Request"
          description="Clearly describe the service you need..."
          icon={PlusCircle}
        />
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full mt-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isProfileComplete === false) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Complete Your Profile"
          description="Please complete your profile before posting a service request."
          icon={AlertTriangle}
        />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Profile Incomplete</AlertTitle>
          <AlertDescription>
            To ensure artisans have the necessary information, please complete your profile setup.
            This helps in providing accurate quotes and service.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex justify-start">
          <Button asChild>
            {/* Link to client onboarding step 2 or a dedicated profile edit page */}
            <Link href="/onboarding/client/step-2"> 
              <Edit className="mr-2 h-4 w-4" /> Complete Profile Now
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post a New Service Request"
        description="Clearly describe the service you need, and let skilled Zelo artisans find you. All amounts are in Naira (₦)."
        icon={PlusCircle}
      />
      <ServiceRequestForm clientId={MOCK_CLIENT_ID} />
    </div>
  );
}
