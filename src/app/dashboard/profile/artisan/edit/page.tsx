
"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation'; 
import { PageHeader } from "@/components/ui/page-header";
import { ArtisanProfileForm } from "@/components/profile/artisan-profile-form";
import { UserCircle2, Loader2, AlertTriangle } from "lucide-react";
import type { ArtisanProfile } from "@/types";
import { useAuthContext } from '@/components/providers/auth-provider';
import { getArtisanProfile } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function EditArtisanProfilePageContent() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();
  const [artisanProfile, setArtisanProfile] = useState<ArtisanProfile | null | undefined>(undefined); 
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return; 
    }

    if (!authUser) {
      toast({ title: "Unauthorized", description: "Please log in to edit your profile.", variant: "destructive" });
      router.replace('/login');
      setIsLoadingProfile(false);
      return;
    }

    if (authUser.role !== 'artisan') {
      toast({ title: "Access Denied", description: "This page is for artisans only.", variant: "destructive" });
      router.replace('/dashboard'); 
      setIsLoadingProfile(false);
      return;
    }

    async function fetchProfile() {
      setIsLoadingProfile(true);
      try {
        const profileData = await getArtisanProfile(authUser!.uid); 
        setArtisanProfile(profileData); 
      } catch (error) {
        console.error("Error fetching artisan profile:", error);
        toast({ title: "Error", description: "Could not load your profile data.", variant: "destructive" });
        setArtisanProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchProfile();

  }, [authUser, authLoading, router, toast]);

  if (authLoading || isLoadingProfile || artisanProfile === undefined) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Artisan Profile"
          description="Loading your profile details..."
          className="animate-pulse"
        />
        <div className="p-0 sm:p-6 border-0 sm:border rounded-lg sm:shadow-sm sm:bg-card animate-pulse">
          <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-x-6 md:space-y-0 mb-8">
            <Skeleton className="rounded-full w-32 h-32 border" />
            <div className="w-full space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-full mb-6" />
          <Skeleton className="h-24 w-full mb-6" />
          <Skeleton className="h-10 w-1/3 ml-auto" />
        </div>
      </div>
    );
  }

  if (artisanProfile === null && !isLoadingProfile) {
    return (
        <div className="space-y-6 text-center py-10">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <PageHeader
                title="Profile Not Found or Error"
                description="We couldn't load your artisan profile. It might not be fully set up yet."
            />
             <p className="text-muted-foreground">If you're new, ensure you've completed the onboarding steps.</p>
        </div>
    );
  }

  const initialFormData = artisanProfile || { userId: authUser!.uid, servicesOffered: [] };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Artisan Profile"
        description="Showcase your skills and services to attract clients on Zelo. All amounts are in Naira (₦)."
      />
      <ArtisanProfileForm
        userId={authUser!.uid} 
        initialData={initialFormData}
        isOnboarding={false}
      />
    </div>
  );
}

export default function EditArtisanProfilePage() {
  return (
    <Suspense fallback={
        <div className="space-y-6">
            <PageHeader title="Edit Profile" description="Loading..." className="animate-pulse"/>
            <Skeleton className="h-96 w-full rounded-lg bg-muted"/>
        </div>
    }>
      <EditArtisanProfilePageContent />
    </Suspense>
  );
}
