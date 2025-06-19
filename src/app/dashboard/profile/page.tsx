
"use client"; 

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from "next/navigation"; 
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCircle, Edit3, CreditCard, Settings, Loader2 } from "lucide-react";
import Image from "next/image";
import type { UserRole, ClientProfile, ArtisanProfile, AuthUser } from "@/types";
import { useAuthContext } from '@/components/providers/auth-provider';
import { getClientProfile, getArtisanProfile } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

function ProfilePageContent() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const searchParams = useSearchParams();
  const [profileData, setProfileData] = useState<Partial<ClientProfile & ArtisanProfile> | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const role: UserRole = authUser?.role || (searchParams.get('role') as UserRole) || 'client';

  useEffect(() => {
    async function fetchProfile() {
      if (authUser?.uid) {
        setIsLoadingProfile(true);
        try {
          if (authUser.role === 'client') {
            const clientData = await getClientProfile(authUser.uid);
            setProfileData(clientData);
          } else if (authUser.role === 'artisan') {
            const artisanData = await getArtisanProfile(authUser.uid);
            setProfileData(artisanData);
          } else {
            setProfileData({ 
                fullName: authUser.displayName,
                contactEmail: authUser.email,
            });
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
          setProfileData(null); 
        } finally {
          setIsLoadingProfile(false);
        }
      } else if (!authLoading) { 
        setIsLoadingProfile(false); 
      }
    }
    fetchProfile();
  }, [authUser, authLoading, role]); 

  if (authLoading || isLoadingProfile) {
    return <ProfileLoadingSkeleton />;
  }

  if (!authUser) {
    return (
      <div className="space-y-6 text-center py-10">
        <UserCircle className="mx-auto h-16 w-16 text-muted-foreground" />
        <p className="text-lg font-medium">Please log in to view your profile.</p>
        <Button asChild><Link href="/login">Login</Link></Button>
      </div>
    );
  }
  
  const displayName = profileData?.fullName || authUser.displayName || "Zelo User";
  const displayEmail = profileData?.contactEmail || authUser.email;
  const displayAvatar = (profileData as ArtisanProfile)?.profilePhotoUrl || (profileData as ClientProfile)?.avatarUrl || `https://placehold.co/128x128.png?text=${displayName.charAt(0).toUpperCase()}`;
  const memberSince = profileData?.createdAt ? format(new Date(profileData.createdAt), "MMMM yyyy") : "N/A";
  const location = profileData?.location || "Nigeria";
  const bio = (profileData as ArtisanProfile)?.bio;


  const editProfileLink = `/dashboard/profile/edit?role=${role}`;
  const settingsLink = `/dashboard/settings?role=${role}`;
  const withdrawalSettingsLink = `/dashboard/profile/withdrawal-settings?role=${role}`;
  const viewArtisanProfileLink = `/dashboard/artisans/${authUser.uid}?role=${role}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal information, settings, and Zelo activities."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="items-center text-center">
            <Image 
              src={displayAvatar} 
              alt={displayName} 
              width={128} 
              height={128} 
              className="w-32 h-32 rounded-full border-4 border-primary mb-4 object-cover"
              data-ai-hint="profile avatar" 
            />
            <CardTitle className="font-headline text-2xl">{displayName}</CardTitle>
            <CardDescription className="capitalize">{role} Account</CardDescription>
            {displayEmail && <CardDescription>{displayEmail}</CardDescription>}
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong>Member Since:</strong> {memberSince}</p>
            <p><strong>Location:</strong> {location}</p>
            {role === 'artisan' && bio && <p className="pt-2 italic">"{bio}"</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Profile Actions</CardTitle>
            <CardDescription>Quick links to manage different aspects of your profile.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <ActionItem
              title="Edit Profile Details"
              description="Update your name, contact, and other personal info."
              href={editProfileLink}
              icon={Edit3}
            />
            {role === 'artisan' && (
              <>
                <ActionItem
                  title="Withdrawal Settings"
                  description="Manage your bank account for receiving payments."
                  href={withdrawalSettingsLink}
                  icon={CreditCard}
                />
                <ActionItem
                  title="View My Artisan Profile"
                  description="See how your profile appears to clients."
                  href={viewArtisanProfileLink} 
                  icon={UserCircle} 
                />
              </>
            )}
            <ActionItem
              title="Account Settings"
              description="Change password and manage security settings."
              href={settingsLink} 
              icon={Settings}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface ActionItemProps {
    title: string;
    description: string;
    href: string;
    icon: React.ElementType;
}

function ActionItem({ title, description, href, icon: Icon }: ActionItemProps) {
    return (
        <Link href={href} className="block rounded-lg border bg-background p-4 shadow-sm transition-all hover:shadow-md hover:border-primary">
            <div className="flex items-center gap-3 mb-1">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">{title}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </Link>
    )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileLoadingSkeleton />}>
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfileLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeader title="My Profile" description="Loading..." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="items-center text-center">
            <Skeleton className="h-32 w-32 rounded-full mb-4 bg-muted" />
            <Skeleton className="h-7 w-3/4 mx-auto bg-muted" />
            <Skeleton className="h-5 w-1/2 mx-auto bg-muted mt-1" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-5/6 bg-muted" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-7 w-1/3 bg-muted" />
            <Skeleton className="h-5 w-2/3 bg-muted mt-1" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full bg-muted rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
