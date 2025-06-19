
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/ui/page-header";
import { ClientProfileForm } from "@/components/profile/client-profile-form";
import { UserCog, Loader2, AlertTriangle } from "lucide-react";
import type { ClientProfile } from "@/types";
import { useAuthContext } from '@/components/providers/auth-provider';
import { getClientProfile } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function EditClientProfilePageContent() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  const [clientProfile, setClientProfile] = useState<Partial<ClientProfile> | null | undefined>(undefined);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      toast({ title: "Unauthorized", description: "Please log in to edit your profile.", variant: "destructive" });
      router.replace('/login');
      setIsLoadingProfile(false);
      return;
    }

    if (authUser.role !== 'client') {
      toast({ title: "Access Denied", description: "This page is for clients only.", variant: "destructive" });
      router.replace('/dashboard');
      setIsLoadingProfile(false);
      return;
    }

    async function fetchProfile() {
      setIsLoadingProfile(true);
      try {
        const profileData = await getClientProfile(authUser!.uid);
        setClientProfile(profileData || { userId: authUser!.uid }); // If no profile, provide userId for form
      } catch (error) {
        console.error("Error fetching client profile:", error);
        toast({ title: "Error", description: "Could not load your profile data.", variant: "destructive" });
        setClientProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [authUser, authLoading, router, toast]);

  if (authLoading || isLoadingProfile || clientProfile === undefined) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Client Profile" description="Loading your profile..." className="animate-pulse" />
        <Skeleton className="h-96 w-full bg-muted rounded-lg" />
      </div>
    );
  }

  if (clientProfile === null) {
     return (
        <div className="space-y-6 text-center py-10">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <PageHeader
                title="Profile Not Found or Error"
                description="We couldn't load your client profile. It might not be fully set up yet."
            />
             <p className="text-muted-foreground">If you're new, ensure you've completed the onboarding steps.</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Client Profile"
        description="Keep your information up-to-date for a seamless experience on Zelo."
      />
      <ClientProfileForm userId={authUser!.uid} initialData={clientProfile} />
    </div>
  );
}

export default function EditClientProfilePage() {
    return (
      <Suspense fallback={
        <div className="space-y-6">
          <PageHeader title="Edit Profile" description="Loading..." className="animate-pulse"/>
          <Skeleton className="h-96 w-full rounded-lg bg-muted"/>
        </div>
      }>
        <EditClientProfilePageContent />
      </Suspense>
    );
}
