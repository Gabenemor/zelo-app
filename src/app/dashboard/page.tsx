
"use client"; 

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Briefcase, MessageSquare, PlusCircle, LayoutDashboard,
  CreditCard, FileText, Award, CheckCircle2, LucideIcon, Settings,
  Users, MapPin, Search, ClipboardList, UserCog, UserCircle2, DollarSign, Edit3,
  CalendarDays, Edit, Camera, UploadCloud, Loader2, ListChecks
} from "lucide-react";
import type { ActivityItem, LucideIconName, ServiceRequest, ArtisanProfile, ClientProfile, ServiceExperience, UserRole, AuthUser } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { ServiceRequestCard } from "@/components/service-requests/service-request-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from '@/components/providers/auth-provider';
import { getArtisanProfile, getClientProfile, getServiceRequests } from '@/lib/firestore'; // Assuming getServiceRequests exists
import { Skeleton } from '@/components/ui/skeleton';

const iconComponentsMap: Record<LucideIconName, LucideIcon> = {
  LayoutDashboard, UserCircle: UserCircle2, Briefcase, MessageSquare, Settings, CreditCard, Users, LogOut: Users, MapPin, PlusCircle, ShieldCheck: Users, FileText, Search, ClipboardList, UserCog, UserCircle2, Award, CheckCircle2, Camera, UploadCloud, Menu: LayoutDashboard, CalendarDays, Edit, Bell: Users, Check:CheckCircle2, Trash2: Users, DollarSign, Info: Users, ListChecks, Edit3, SlidersHorizontal: ListChecks, AlertTriangle: ListChecks, ShoppingCart: ListChecks, Activity: Users
};

function DashboardHomePageContent() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const [profile, setProfile] = useState<Partial<ArtisanProfile & ClientProfile> | null>(null);
  const [dashboardData, setDashboardData] = useState<any>({ // Replace 'any' with more specific types
    stats: {},
    recentActivities: [],
    relevantItems: [], // e.g., new jobs for artisan, client's open requests
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  const userRole = authUser?.role || 'client'; // Default to client if role not yet available

  useEffect(() => {
    async function fetchData() {
      if (!authUser?.uid) return;

      setIsLoadingData(true);
      try {
        let userProfile: Partial<ArtisanProfile & ClientProfile> | null = null;
        let fetchedStats: any = {};
        let fetchedRelevantItems: ServiceRequest[] = [];
        // Mock activities for now, can be replaced with real Firestore queries
        let fetchedRecentActivities: ActivityItem[] = userRole === 'artisan' 
            ? mockRecentActivitiesArtisan.map(a => ({...a, userId: authUser.uid}))
            : mockRecentActivitiesClient.map(a => ({...a, userId: authUser.uid}));

        if (userRole === 'artisan') {
          userProfile = await getArtisanProfile(authUser.uid);
          // Mock stats for artisan
          fetchedStats = { totalBidsSent: 25, activeJobs: 3, totalEarned: 175000 };
          // Fetch jobs matching artisan's primary services (mocked here)
          fetchedRelevantItems = mockNewJobsForArtisan.filter(job => 
            (userProfile as ArtisanProfile)?.servicesOffered?.some(s => job.category === s)
          ).slice(0,3);
        } else if (userRole === 'client') {
          userProfile = await getClientProfile(authUser.uid);
          // Mock stats for client
           const clientRequests = await getServiceRequests({ clientId: authUser.uid, limit: 100 }); // Fetch all for accurate stats
           fetchedStats = { 
             activeRequests: clientRequests.filter(r => r.status === 'open' || r.status === 'awarded').length, 
             artisansHired: clientRequests.filter(r => r.status === 'awarded' || r.status === 'in_progress' || r.status === 'completed').length, 
             totalSpent: 250000 // Still mock, real calculation needed
           };
          fetchedRelevantItems = clientRequests.sort((a,b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()).slice(0,3);
        }
        setProfile(userProfile);
        setDashboardData({
          stats: fetchedStats,
          recentActivities: fetchedRecentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5),
          relevantItems: fetchedRelevantItems,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Handle error state if necessary
      } finally {
        setIsLoadingData(false);
      }
    }

    if (!authLoading && authUser) {
      fetchData();
    } else if (!authLoading && !authUser) {
        setIsLoadingData(false); // No user, nothing to load
    }
  }, [authUser, authLoading, userRole]);

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
            <StatCard title="Total Bids Sent (Mock)" value={dashboardData.stats.totalBidsSent?.toString() || '0'} icon={Edit3} />
            <StatCard title="Active Jobs (Mock)" value={dashboardData.stats.activeJobs?.toString() || '0'} icon={Briefcase} />
            <StatCard title="Total Earned (₦, Mock)" value={`₦${(dashboardData.stats.totalEarned || 0).toLocaleString()}`} icon={DollarSign} />
          </>
        )}
        {userRole === 'client' && (
          <>
            <StatCard title="Active Requests" value={dashboardData.stats.activeRequests?.toString() || '0'} icon={ClipboardList} />
            <StatCard title="Artisans Hired" value={dashboardData.stats.artisansHired?.toString() || '0'} icon={Users} />
            <StatCard title="Total Spent (₦, Mock)" value={`₦${(dashboardData.stats.totalSpent || 0).toLocaleString()}`} icon={DollarSign} />
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
                {dashboardData.relevantItems.length > 0 ? (
                  dashboardData.relevantItems.map((job: ServiceRequest) => (
                    <ServiceRequestCard key={job.id} request={job} currentUserRole={userRole} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No new jobs matching your services right now. Check back later!</p>
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
                 {dashboardData.relevantItems.length > 0 ? (
                  dashboardData.relevantItems.map((request: ServiceRequest) => (
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
                {dashboardData.relevantItems.length > 0 && (
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
                          <DollarSign className="h-3.5 w-3.5" />
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
                  <CardTitle className="font-headline flex items-center gap-2"><Search className="text-primary h-5 w-5"/> Discover Artisans (Mock)</CardTitle>
                  <CardDescription>Find skilled professionals for your needs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockSuggestedArtisansForClient.length > 0 ? (
                    mockSuggestedArtisansForClient.slice(0,2).map(artisan => (
                      <ArtisanSuggestionCard key={artisan.userId} artisan={artisan} userRole={userRole} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Could not find artisan suggestions at this time.</p>
                  )}
                  <Button variant="outline" className="w-full" asChild>
                      <Link href={`/dashboard/services/browse?role=${userRole}`}>Browse All Artisans</Link>
                  </Button>
                </CardContent>
            </Card>
          )}

          <Card>
              <CardHeader>
              <CardTitle className="font-headline">Recent Activity</CardTitle>
              <CardDescription>Your latest interactions on Zelo.</CardDescription>
              </CardHeader>
              <CardContent>
              {dashboardData.recentActivities.length > 0 ? (
                  <ul className="space-y-4">
                  {dashboardData.recentActivities.map((activity: ActivityItem) => {
                      const IconComponent = iconComponentsMap[activity.icon] || LayoutDashboard;
                      const activityLink = activity.link?.includes("?") ? `${activity.link}&role=${userRole}` : `${activity.link}?role=${userRole}`;
                      const content = (
                      <div className="flex items-start gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-1">
                          <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{activity.title}</p>
                          {activity.description && <p className="text-xs text-muted-foreground">{activity.description}</p>}
                          <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                          </p>
                          </div>
                      </div>
                      );
                      
                      return (
                        <li key={activity.id} className="rounded-md border p-3 hover:bg-secondary/50 transition-colors">
                          {activity.link ? (
                            <Link href={activityLink} className="block">
                              {content}
                            </Link>
                          ) : (
                            content
                          )}
                        </li>
                      );
                  })}
                  </ul>
              ) : (
                  <div className="py-8 text-center">
                  <LayoutDashboard className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                      No recent activity to display yet.
                  </p>
                  </div>
              )}
              </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
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
          src={artisan.profilePhotoUrl || `https://placehold.co/64x64.png`}
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

// Mock data that might still be needed if API calls aren't fully implemented yet
const mockRecentActivitiesArtisan: ActivityItem[] = [
  { id: "activity1", type: "new_proposal", icon: "FileText", title: "Proposal submitted for 'Kitchen Renovation'", description: "Waiting for client review.", timestamp: new Date(Date.now() - 3600000 * 1), userId: "mockArtisanId", link: "/dashboard/services/my-offers" },
  { id: "activity3", type: "job_awarded", icon: "Award", title: "Job 'Catering for Event' awarded!", description: "Client Chioma accepted your proposal.", timestamp: new Date(Date.now() - 86400000 * 0.5), userId: "mockArtisanId", link: "/dashboard/services/my-offers" },
];
const mockRecentActivitiesClient: ActivityItem[] = [
  { id: "activity_c1", type: "request_update", icon: "Briefcase", title: "Plumber Adewale sent a proposal for 'Leaky Faucet'", description: "Review their offer now.", timestamp: new Date(Date.now() - 3600000 * 2), userId: "mockClientId", link: "/dashboard/services/my-requests/req1" },
];
const mockNewJobsForArtisan: ServiceRequest[] = [
  { id: "job1", clientId: "clientNew1", title: "Urgent Plumbing for Bathroom Leak", description: "Main bathroom pipe burst...", category: "Plumbing", location: "Ikeja, Lagos", budget: 15000, postedAt: new Date(Date.now() - 3600000 * 3), status: "open" },
  { id: "job2", clientId: "clientNew2", title: "Custom Bookshelf Carpentry", description: "Looking for a skilled carpenter...", category: "Carpentry", location: "Lekki Phase 1, Lagos", budget: 80000, postedAt: new Date(Date.now() - 86400000 * 1), status: "open" },
];
const mockSuggestedArtisansForClient: (Pick<ArtisanProfile, 'userId' | 'username' | 'profilePhotoUrl' | 'location' | 'servicesOffered' | 'headline'> & { rating?: number })[] = [
  { userId: "art_pub_1", username: "Adewale Plumbing Masters", profilePhotoUrl: "https://placehold.co/80x80.png?text=AP", location: "Ikeja, Lagos", servicesOffered: ["Plumbing"], headline: "Your Go-To for Quick Plumbing Fixes!", rating: 4.7 },
  { userId: "art_pub_2", username: "Chioma's Exquisite Catering", profilePhotoUrl: "https://placehold.co/80x80.png?text=CC", location: "Lekki, Lagos", servicesOffered: ["Catering"], headline: "Delicious Meals for Memorable Events.", rating: 4.9 },
];


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
          <Card><CardHeader><Skeleton className="h-6 w-1/2 rounded-md bg-muted mb-2" /><Skeleton className="h-4 w-3/4 rounded-md bg-muted" /></CardHeader><CardContent><Skeleton className="h-48 w-full rounded-md bg-muted" /></CardContent></Card>
        </div>
      </div>
    </div>
  );
}

