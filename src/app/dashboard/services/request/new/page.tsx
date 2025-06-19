
"use client"; 

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestForm } from "@/components/service-requests/service-request-form";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PlusCircle, AlertTriangle, Edit, Loader2 } from "lucide-react";
import { checkClientProfileCompleteness } from '@/actions/onboarding-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthContext } from '@/components/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewServiceRequestPage() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null); 
  const [isLoadingCheck, setIsLoadingCheck] = useState(true);

  useEffect(() => {
    async function checkProfile() {
      if (authLoading) return;

      if (!authUser) {
        toast({title: "Login Required", description: "Please log in to post a service request.", variant: "destructive"});
        router.push('/login?redirect=/dashboard/services/request/new');
        setIsLoadingCheck(false);
        return;
      }
      if (authUser.role !== 'client') {
        toast({title: "Access Denied", description: "Only clients can post service requests.", variant: "destructive"});
        router.replace('/dashboard');
        setIsLoadingCheck(false);
        return;
      }

      setIsLoadingCheck(true);
      const profileStatus = await checkClientProfileCompleteness(authUser.uid);
      setIsProfileComplete(profileStatus.complete);
      setIsLoadingCheck(false);
    }
    checkProfile();
  }, [authUser, authLoading, toast, router]);

  if (authLoading || isLoadingCheck) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Post a New Service Request"
          description="Checking your profile status..."
        />
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full mt-4" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  if (!authUser || authUser.role !== 'client') {
    // This case should be handled by the redirect in useEffect, but as a fallback:
    return <div className="p-6 text-center">Redirecting...</div>;
  }


  if (isProfileComplete === false) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Complete Your Profile"
          description="Please complete your profile before posting a service request."
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
            <Link href={`/dashboard/profile/client/edit?role=client`}> 
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
      />
      <ServiceRequestForm clientId={authUser.uid} />
    </div>
  );
}
