
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestCard } from "@/components/service-requests/service-request-card";
import { FileText, PlusCircle, Loader2 } from "lucide-react";
import type { ServiceRequest, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthContext } from '@/components/providers/auth-provider';
import { getServiceRequests } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

export default function MyServiceRequestsPage() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentUserRole: UserRole = "client"; 

  const fetchRequests = useCallback(async (clientId: string) => {
    setIsLoading(true);
    try {
      const clientRequests = await getServiceRequests({ clientId });
      setRequests(clientRequests);
    } catch (error) {
      console.error("Error fetching client service requests:", error);
      toast({ title: "Error", description: "Could not load your service requests.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authUser?.uid && authUser.role === 'client') {
      fetchRequests(authUser.uid);
    } else if (!authLoading && authUser?.role !== 'client') {
        setIsLoading(false); 
        setRequests([]);
    }
  }, [authUser, authLoading, fetchRequests]);

  if (authLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading your requests...</p>
        </div>
    );
  }

  if (!authUser || authUser.role !== 'client') {
     return (
        <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">Access Denied</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                This page is for clients. Please log in as a client to view your service requests.
            </p>
             <Button asChild className="mt-6">
                <Link href={`/login?redirect=/dashboard/services/my-requests`}>Login as Client</Link>
            </Button>
        </div>
     );
  }
  
  if (isLoading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Fetching your service requests...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Service Requests"
        description="Track the status of all service requests you've posted on Zelo."
        action={
            <Button asChild>
                <Link href={`/dashboard/services/request/new?role=${currentUserRole}`}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Post New Request
                </Link>
            </Button>
        }
      />

      {requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map(request => (
            <ServiceRequestCard key={request.id} request={request} currentUserRole={currentUserRole} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">No service requests yet.</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                When you post a service request, it will appear here.
            </p>
            <Button asChild className="mt-6">
                <Link href={`/dashboard/services/request/new?role=${currentUserRole}`}>Post Your First Request</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
