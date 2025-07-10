
"use client"; 

import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestForm } from "@/components/service-requests/service-request-form";
import { Loader2 } from "lucide-react";
import { useAuthContext } from '@/components/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewServiceRequestPage() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      toast({title: "Login Required", description: "Please log in to post a service request.", variant: "destructive"});
      router.push('/login?redirect=/dashboard/services/request/new');
      return;
    }
    if (authUser.role !== 'client') {
      toast({title: "Access Denied", description: "Only clients can post service requests.", variant: "destructive"});
      router.replace('/dashboard');
      return;
    }
  }, [authUser, authLoading, toast, router]);

  if (authLoading || !authUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }
  
  if (authUser.role !== 'client') {
    // This case should be handled by the redirect in useEffect, but as a fallback:
    return <div className="p-6 text-center">Redirecting...</div>;
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
