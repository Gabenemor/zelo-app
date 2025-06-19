
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestForm } from "@/components/service-requests/service-request-form";
import { Edit, Loader2 } from "lucide-react";
import type { ServiceRequest } from "@/types";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { getServiceRequest } from '@/lib/firestore';
import { useAuthContext } from '@/components/providers/auth-provider';

export default function EditServiceRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuthContext();
  const [request, setRequest] = useState<ServiceRequest | null | undefined>(undefined); 
  const [isLoadingPage, setIsLoadingPage] = useState(true); 

  const requestId = typeof params.id === 'string' ? params.id : undefined;

  const fetchRequestData = useCallback(async () => {
    if (!requestId) {
      setRequest(null);
      setIsLoadingPage(false);
      return;
    }
    if (!authUser?.uid) { 
        setIsLoadingPage(false);
        return;
    }
    setIsLoadingPage(true);
    try {
      const data = await getServiceRequest(requestId);
      if (data && data.clientId === authUser.uid) { // Ensure current user owns the request
        setRequest(data);
      } else {
        setRequest(null);
        if (data) { // Request exists but doesn't belong to user
            toast({ title: "Access Denied", description: "You can only edit your own service requests.", variant: "destructive"});
            router.replace('/dashboard/services/my-requests');
        }
      }
    } catch (err) {
      console.error("Failed to fetch service request:", err);
      setRequest(null);
      toast({ title: "Error", description: "Could not load service request details.", variant: "destructive"});
    } finally {
      setIsLoadingPage(false);
    }
  }, [requestId, authUser, toast, router]);

  useEffect(() => {
    if (!authLoading) {
      fetchRequestData();
    }
  }, [authLoading, fetchRequestData]);

  if (authLoading || isLoadingPage || request === undefined) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Service Request"
          description="Loading request details..."
          className="animate-pulse"
        />
        <Skeleton className="h-10 w-1/3 mb-4" /> 
        <Skeleton className="h-8 w-1/2 mb-2" /> 
        <Skeleton className="h-24 w-full mb-4" /> 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full mb-4" /> 
        <Skeleton className="h-10 w-full mb-4" /> 
        <Skeleton className="h-10 w-32 ml-auto" /> 
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Service Request Not Found"
          description="The service request you are trying to edit could not be found or you do not have permission to edit it."
        />
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Your Service Request"
        description={`Modifying request: "${request.title}"`}
      />
      <ServiceRequestForm 
        clientId={request.clientId} 
        initialData={request}
        isEditing={true} 
      />
    </div>
  );
}
