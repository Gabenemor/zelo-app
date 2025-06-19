
"use client";

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from "@/components/ui/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, MapPin, Briefcase, CalendarDays, DollarSign, MessageSquare, Star, Info, PlusCircle, Edit, AlertTriangle, Loader2 } from "lucide-react";
import type { ArtisanProfile, ServiceExperience, AuthUser } from "@/types";
import { Separator } from "@/components/ui/separator";
import { getArtisanProfile } from "@/lib/firestore";
import { useAuthContext } from '@/components/providers/auth-provider';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function ArtisanProfilePageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [artisanProfile, setArtisanProfile] = useState<ArtisanProfile | null | undefined>(undefined);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const artisanIdFromUrl = typeof params.id === 'string' ? params.id : undefined;
  const roleFromQuery = searchParams.get('role'); 

  const fetchProfile = useCallback(async () => {
    if (!artisanIdFromUrl) {
      setArtisanProfile(null);
      setIsLoadingProfile(false);
      return;
    }
    setIsLoadingProfile(true);
    try {
      const profile = await getArtisanProfile(artisanIdFromUrl);
      setArtisanProfile(profile);
    } catch (error) {
      console.error("Error fetching artisan profile:", error);
      toast({ title: "Error", description: "Could not load artisan profile.", variant: "destructive" });
      setArtisanProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [artisanIdFromUrl, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (authLoading || isLoadingProfile || artisanProfile === undefined) {
    return <ArtisanProfileSkeleton />;
  }

  if (!artisanProfile) {
    if (authUser && authUser.uid === artisanIdFromUrl && authUser.role === 'artisan') {
      return (
        <div className="container mx-auto py-8 text-center">
          <PageHeader title="Profile Preview Incomplete" description="Your artisan profile setup is not yet complete." />
          <p className="mt-4 text-muted-foreground">
            It looks like you haven't finished setting up your artisan profile.
            Clients won't be able to see your details until it's complete.
          </p>
          <Button asChild className="mt-6">
            <Link href={`/onboarding/artisan/step-2?uid=${authUser.uid}&role=artisan`}>Complete Your Profile Now</Link>
          </Button>
        </div>
      );
    }
    return (
      <div className="container mx-auto py-8 text-center">
        <PageHeader title="Artisan Not Found" description="The requested artisan profile could not be located." />
        <p className="mt-4 text-muted-foreground">Please check the ID or try again later.</p>
        <Button asChild className="mt-6">
          <Link href={`/dashboard/services/browse?role=${roleFromQuery || 'client'}`}>Back to Browse Artisans</Link>
        </Button>
      </div>
    );
  }
  
  const isOwnProfile = authUser && authUser.uid === artisanProfile.userId && authUser.role === 'artisan';

  return (
    <div className="space-y-6">
      <PageHeader
        title={isOwnProfile ? "Your Public Artisan Profile" : (artisanProfile.username || artisanProfile.fullName || `Artisan`)}
        description={isOwnProfile ? "This is how clients will see your profile." : `Public profile for ${artisanProfile.username || artisanProfile.fullName || 'this artisan'}.`}
        action={isOwnProfile && (
            <Button asChild variant="outline">
                <Link href={`/dashboard/profile/artisan/edit?role=artisan`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit My Profile
                </Link>
            </Button>
        )}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-32 w-32 border-4 border-primary mb-4">
                <AvatarImage 
                  src={artisanProfile.profilePhotoUrl || `https://placehold.co/128x128.png?text=${(artisanProfile.username || artisanProfile.fullName || 'A').substring(0,2)}`} 
                  alt={artisanProfile.username || artisanProfile.fullName || 'Artisan'} 
                  data-ai-hint="profile avatar" 
                  className="object-cover"
                />
                <AvatarFallback>{(artisanProfile.username || artisanProfile.fullName || "AR").substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-2xl">{artisanProfile.username || artisanProfile.fullName || `Artisan ${artisanProfile.userId.substring(0,6)}`}</CardTitle>
              {/* Mock rating, replace with real data if available */}
              {/* <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span>4.5 (12 Reviews)</span> 
              </div> */}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {artisanProfile.contactEmail && (
                <InfoItem icon={Mail} label="Email" value={artisanProfile.contactEmail} isLink={`mailto:${artisanProfile.contactEmail}`} />
              )}
              {artisanProfile.contactPhone && (
                <InfoItem icon={Phone} label="Phone" value={artisanProfile.contactPhone} isLink={`tel:${artisanProfile.contactPhone}`} />
              )}
              {artisanProfile.location && (
                <InfoItem icon={MapPin} label="Location" value={artisanProfile.isLocationPublic ? artisanProfile.location : `${artisanProfile.location?.split(',')[0]}, General Area`} />
              )}
              <Separator className="my-3" />
              {!isOwnProfile && authUser && ( // Ensure authUser exists to show contact buttons
                <>
                    <Button className="w-full" asChild>
                        <Link href={`/dashboard/messages?role=${roleFromQuery || authUser.role}&chatWith=${artisanProfile.userId}`}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Contact Artisan
                        </Link>
                    </Button>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={`/dashboard/services/request/new?role=${roleFromQuery || authUser.role}&artisanId=${artisanProfile.userId}`}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Request Service
                        </Link>
                    </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {artisanProfile.headline && (
             <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">"{artisanProfile.headline}"</CardTitle>
              </CardHeader>
            </Card>
          )}
          {artisanProfile.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">About {artisanProfile.username || artisanProfile.fullName || 'Me'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{artisanProfile.bio}</p>
              </CardContent>
            </Card>
          )}

          {artisanProfile.serviceExperiences && artisanProfile.serviceExperiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2"><Briefcase className="text-primary h-5 w-5"/> Services Offered</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {artisanProfile.serviceExperiences.map((exp, index) => (
                  <div key={index} className="p-3 border rounded-md bg-secondary/30">
                    <h4 className="font-semibold text-md mb-2 text-foreground">{exp.serviceName}</h4>
                    <div className="space-y-1.5 text-sm">
                      <InfoItem icon={CalendarDays} label="Experience" value={`${exp.years} years`} />
                      {exp.chargeAmount && (
                         <InfoItem icon={DollarSign} label="Typical Charge" value={`₦${exp.chargeAmount.toLocaleString()} ${exp.chargeDescription || ''}`.trim()} />
                      )}
                       {!exp.chargeAmount && (
                         <InfoItem icon={Info} label="Pricing" value="Available upon request" />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {artisanProfile.portfolioImageUrls && artisanProfile.portfolioImageUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {artisanProfile.portfolioImageUrls.map((url, index) => (
                  <div key={index} className="aspect-video w-full overflow-hidden rounded-lg border shadow-sm">
                    <Image
                      src={url}
                      alt={`Portfolio work ${index + 1} by ${artisanProfile.username || 'artisan'}`}
                      width={300}
                      height={200}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                      data-ai-hint="portfolio work"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    isLink?: string;
}
function InfoItem({ icon: Icon, label, value, isLink }: InfoItemProps) {
    const content = isLink ? (
        <Link href={isLink} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{value}</Link>
    ) : (
        <span className="text-foreground">{value}</span>
    );
    return (
        <div className="flex items-start gap-2">
            <Icon className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                {content}
            </div>
        </div>
    )
}

function ArtisanProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeader title="Loading Artisan Profile..." description="Please wait a moment." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <Skeleton className="h-32 w-32 rounded-full mb-4 bg-muted" />
              <Skeleton className="h-7 w-3/4 mx-auto bg-muted" />
              <Skeleton className="h-5 w-1/2 mx-auto bg-muted mt-1" />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Skeleton className="h-4 w-full bg-muted" />
              <Skeleton className="h-4 w-5/6 bg-muted" />
              <Skeleton className="h-4 w-full bg-muted" />
              <Separator className="my-3 bg-muted" />
              <Skeleton className="h-10 w-full bg-muted rounded-md" />
              <Skeleton className="h-10 w-full bg-muted rounded-md" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card><CardHeader><Skeleton className="h-7 w-1/2 bg-muted" /></CardHeader><CardContent><Skeleton className="h-10 w-full bg-muted" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-7 w-1/2 bg-muted" /></CardHeader><CardContent><Skeleton className="h-20 w-full bg-muted" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-7 w-1/2 bg-muted" /></CardHeader><CardContent className="grid grid-cols-2 gap-4"><Skeleton className="h-24 w-full bg-muted rounded-md" /><Skeleton className="h-24 w-full bg-muted rounded-md" /></CardContent></Card>
        </div>
      </div>
    </div>
  );
}

export default function ArtisanProfilePageWrapper() {
  return (
    <Suspense fallback={<ArtisanProfileSkeleton />}>
      <ArtisanProfilePageContent />
    </Suspense>
  );
}
