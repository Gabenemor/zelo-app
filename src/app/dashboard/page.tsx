
"use client";

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Briefcase, MessageSquare, PlusCircle, LayoutDashboard,
  CreditCard, FileText, Award, CheckCircle2, LucideIcon, Settings,
  Users, MapPin, Search, ClipboardList, UserCog, UserCircle2, Coins, Edit3,
  CalendarDays, Edit, Camera, UploadCloud, Loader2, ListChecks, Activity
} from "lucide-react";
import type { ActivityItem, LucideIconName, ServiceRequest, ArtisanProfile, ClientProfile, UserRole, AuthUser } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { ServiceRequestCard } from "@/components/service-requests/service-request-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from '@/components/providers/auth-provider';
import { getArtisanProfile, getClientProfile, getServiceRequests, getArtisans, getProposals, getEscrowTransactions } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const iconComponentsMap: Record<LucideIconName, LucideIcon> = {
  LayoutDashboard, UserCircle: UserCircle2, Briefcase, MessageSquare, Settings, CreditCard, Users, LogOut: Users, MapPin, PlusCircle, ShieldCheck: Users, FileText, Search, ClipboardList, UserCog, UserCircle2, Award, CheckCircle2, Camera, UploadCloud, Menu: LayoutDashboard, CalendarDays, Edit, Bell: Users, Check:CheckCircle2, Trash2: Users, Coins, Info: Users, ListChecks, Edit3, SlidersHorizontal: ListChecks, AlertTriangle: ListChecks, ShoppingCart: ListChecks, Activity
};

function DashboardHomePageContent() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Partial<ArtisanProfile & ClientProfile> | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>({});
  const [relevantItems, setRelevantItems] = useState<ServiceRequest[]>([]);
  const [suggestedArtisans, setSuggestedArtisans] = useState<ArtisanProfile[]>([]);
  // Removed recentActivities as it requires a dedicated system
  const [isLoadingData, setIsLoadingData] = useState(true);

  const userRole = authUser?.role;

  const fetchDashboardData = useCallback(async () => {
    if (!authUser?.uid || !userRole) return;

    setIsLoadingData(true);
    try {
      let userProfile: Partial<ArtisanProfile & ClientProfile> | null = null;
      let fetchedStats: any = {};
      let fetchedRelevantItems: ServiceRequest[] = [];
      let fetchedSuggestedArtisans: ArtisanProfile[] = [];

      if (userRole === 'artisan') {
        userProfile = await getArtisanProfile(authUser.uid);
        const artisanProposals = await getProposals({ artisanId: authUser.uid });
        const artisanJobs = await getServiceRequests({ artisanId: authUser.uid, status: ['awarded', 'in_progress'] });
        // For "Total Earned", sum of 'released_to_artisan' transactions. Requires fetching EscrowTransactions. More complex.
        fetchedStats = { totalBidsSent: artisanProposals.length, activeJobs: artisanJobs.length, totalEarned: 0 /* Placeholder */ };
        
        const openJobs = await getServiceRequests({ status: 'open', limit: 3 });
        // Basic filtering for relevant jobs (can be more sophisticated)
        fetchedRelevantItems = openJobs.filter(job => 
            (userProfile as ArtisanProfile)?.servicesOffered?.some(s => job.category.toLowerCase().includes(s.toLowerCase()))
        ).slice(0,3);
        if(fetchedRelevantItems.length === 0 && openJobs.length > 0) fetchedRelevantItems = openJobs.slice(0,3);


      } else if (userRole === 'client') {
        userProfile = await getClientProfile(authUser.uid);
        const clientRequests = await getServiceRequests({ clientId: authUser.uid });
        fetchedStats = {
          activeRequests: clientRequests.filter(r => r.status === 'open' || r.status === 'awarded' || r.status === 'in_progress').length,
          artisansHired: clientRequests.filter(r => r.status === 'awarded' || r.status === 'in_progress' || r.status === 'completed').length,
          totalSpent: 0, // Placeholder, sum of client's funded/released escrow transactions
        };
        fetchedRelevantItems = clientRequests
          .filter(r => r.status === 'open' || r.status === 'awarded' || r.status === 'in_progress')
          .sort((a,b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()).slice(0,3);
        
        fetchedSuggestedArtisans = await getArtisans({ limit: 2 }); // Simple fetch for suggestions
      }
      setProfile(userProfile);
      setDashboardStats(fetchedStats);
      setRelevantItems(fetchedRelevantItems);
      setSuggestedArtisans(fetchedSuggestedArtisans);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  }, [authUser, userRole, toast]);

  useEffect(() => {
    if (!authLoading && authUser) {
      fetchDashboardData();
    } else if (!authLoading && !authUser) {
        setIsLoadingData(false); 
    }
  }, [authUser, authLoading, fetchDashboardData]);

  if (authLoading || isLoadingData) {
    return <DashboardLoadingSkeleton />;
  }

  if (!authUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <p className="text-lg text-muted-foreground">Please log in to view your dashboard.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  const pageTitleText = userRole === 'artisan' ? "Artisan Dashboard" : "Client Dashboard";
  const pageDescriptionText = userRole === 'artisan' ? "Oversee your jobs, proposals, and earnings." : "Manage your service requests and connect with artisans.";

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageTitleText}
        description={pageDescriptionText}
        icon={LayoutDashboard}
        action={userRole === 'client' && (
          <Button asChild size="lg">
            <Link href={`/dashboard/services/request/new?role=${userRole}`}>
              <PlusCircle className="mr-2 h-5 w-5" /> Post New Service Request
            </Link>
          </Button>
        )}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userRole === 'artisan' && (
          <>
            <StatCard title="Total Bids Sent" value={dashboardStats.totalBidsSent?.toString() || '0'} icon={Edit3} />
            <StatCard title="Active Jobs" value={dashboardStats.activeJobs?.toString() || '0'} icon={Briefcase} />
            <StatCard title="Total Earned (₦)" value={`₦${(dashboardStats.totalEarned || 0).toLocaleString()}`} description="Placeholder"/>
          </>
        )}
        {userRole === 'client' && (
          <>
            <StatCard title="Active Requests" value={dashboardStats.activeRequests?.toString() || '0'} icon={ClipboardList} />
            <StatCard title="Artisans Hired" value={dashboardStats.artisansHired?.toString() || '0'} icon={Users} />
            <StatCard title="Total Spent (₦)" value={`₦${(dashboardStats.totalSpent || 0).toLocaleString()}`} description="Placeholder"/>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {userRole === 'artisan' && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Search className="text-primary h-5 w-5"/> New Jobs For You</CardTitle>
                <CardDescription>Opportunities matching your skills.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {relevantItems.length > 0 ? (
                  relevantItems.map((job: ServiceRequest) => (
                    <ServiceRequestCard key={job.id} request={job} currentUserRole={userRole} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-4 text-center">No new jobs matching your services right now. Check back later!</p>
                )}
                <Button variant="outline" className="w-full" asChild>
                    <Link href={`/dashboard/jobs?role=${userRole}`}>View All Matching Jobs</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {userRole === 'client' && (
             <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><ListChecks className="text-primary h-5 w-5"/> My Service Requests</CardTitle>
                <CardDescription>Track and manage the jobs you've posted.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {relevantItems.length > 0 ? (
                  relevantItems.map((request: ServiceRequest) => (
                    <ServiceRequestCard key={request.id} request={request} currentUserRole={userRole} />
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Briefcase className="mx-auto h-12 w-12 mb-4" />
                    <p>You haven't posted any service requests yet.</p>
                    <Button asChild className="mt-4">
                      <Link href={`/dashboard/services/request/new?role=${userRole}`}>Post Your First Request</Link>
                    </Button>
                  </div>
                )}
                {relevantItems.length > 0 && (
                    <Button variant="outline" className="w-full" asChild>
                        <Link href={`/dashboard/services/my-requests?role=${userRole}`}>View All My Requests</Link>
                    </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
           {userRole === 'artisan' && (profile as ArtisanProfile)?.serviceExperiences && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Briefcase className="text-primary h-5 w-5"/> Your Services</CardTitle>
                <CardDescription>Overview of your offered services and pricing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(profile as ArtisanProfile).serviceExperiences!.map((exp, index) => (
                  <div key={index}>
                    <h4 className="font-semibold text-md text-foreground">{exp.serviceName}</h4>
                    <div className="text-sm text-muted-foreground space-y-1 mt-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{exp.years} years experience</span>
                      </div>
                      {exp.chargeAmount && (
                        <div className="flex items-center gap-1.5">
                          <Coins className="h-3.5 w-3.5" />
                          <span>₦{exp.chargeAmount.toLocaleString()} {exp.chargeDescription || ''}</span>
                        </div>
                      )}
                    </div>
                    {index < ((profile as ArtisanProfile).serviceExperiences!.length - 1) && <Separator className="my-3"/>}
                  </div>
                ))}
                 <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                    <Link href={`/dashboard/profile/artisan/edit?role=${userRole}`}><Edit className="mr-2 h-4 w-4" /> Edit Services & Profile</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {userRole === 'client' && (
             <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2"><Search className="text-primary h-5 w-5"/> Discover Artisans</CardTitle>
                  <CardDescription>Find skilled professionals for your needs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestedArtisans.length > 0 ? (
                    suggestedArtisans.map(artisan => (
                      <ArtisanSuggestionCard key={artisan.userId} artisan={artisan} userRole={userRole!} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 text-center">Could not find artisan suggestions at this time.</p>
                  )}
                  <Button variant="outline" className="w-full" asChild>
                      <Link href={`/dashboard/services/browse?role=${userRole}`}>Browse All Artisans</Link>
                  </Button>
                </CardContent>
            </Card>
          )}
          {/* Removed Recent Activity Card as it requires complex backend logging */}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ElementType; // Make icon optional
  description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-5 w-5 text-primary" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );
}

interface ArtisanSuggestionCardProps {
  artisan: Pick<ArtisanProfile, 'userId' | 'username' | 'profilePhotoUrl' | 'location' | 'servicesOffered'| 'headline'> & { rating?: number };
  userRole: UserRole;
}
function ArtisanSuggestionCard({ artisan, userRole }: ArtisanSuggestionCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-4 flex items-start gap-4">
        <Image
          src={artisan.profilePhotoUrl || `https://placehold.co/64x64.png?text=${artisan.username?.charAt(0) || 'A'}`}
          alt={artisan.username || 'Artisan'}
          width={64}
          height={64}
          className="w-16 h-16 rounded-full border object-cover"
          data-ai-hint="profile avatar"
        />
        <div className="flex-1">
          <Link href={`/dashboard/artisans/${artisan.userId}?role=${userRole}`}>
            <h3 className="font-headline text-md font-semibold text-primary hover:underline mb-0.5 line-clamp-1">
              {artisan.username || 'Skilled Artisan'}
            </h3>
          </Link>
          <p className="text-xs text-muted-foreground font-medium mb-1 line-clamp-1">{artisan.servicesOffered.join(', ')}</p>
          <p className="text-xs text-muted-foreground mb-1.5 line-clamp-2">{artisan.headline || 'Top-rated professional.'}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {artisan.location || 'Nigeria'}
          </div>
        </div>
         <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/artisans/${artisan.userId}?role=${userRole}`}>View</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
      <DashboardHomePageContent />
    </Suspense>
  );
}

function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-md bg-muted" />
            <Skeleton className="h-8 w-48 rounded-md bg-muted" />
          </div>
          <Skeleton className="h-4 w-64 rounded-md bg-muted" />
        </div>
        <Skeleton className="h-10 w-48 rounded-md bg-muted sm:h-12" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader><Skeleton className="h-5 w-2/3 rounded-md bg-muted" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3 rounded-md bg-muted" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-2/3 rounded-md bg-muted" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3 rounded-md bg-muted" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-5 w-2/3 rounded-md bg-muted" /></CardHeader><CardContent><Skeleton className="h-8 w-1/3 rounded-md bg-muted" /></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card><CardHeader><Skeleton className="h-6 w-1/2 rounded-md bg-muted mb-2" /><Skeleton className="h-4 w-3/4 rounded-md bg-muted" /></CardHeader><CardContent><Skeleton className="h-32 w-full rounded-md bg-muted" /><Skeleton className="h-10 w-full rounded-md bg-muted mt-4" /></CardContent></Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card><CardHeader><Skeleton className="h-6 w-1/2 rounded-md bg-muted mb-2" /><Skeleton className="h-4 w-3/4 rounded-md bg-muted" /></CardHeader><CardContent><Skeleton className="h-40 w-full rounded-md bg-muted" /></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
