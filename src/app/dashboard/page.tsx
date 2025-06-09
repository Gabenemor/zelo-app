
"use client"; // This page now uses client-side hooks

import React, { Suspense } from 'react'; // Added Suspense
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Briefcase, 
  MessageSquare, 
  PlusCircle, 
  UserCircle, 
  LayoutDashboard,
  CreditCard,
  FileText,
  Award,
  CheckCircle2,
  LucideIcon,
  Settings,
  Users, 
  LogOut, 
  MapPin, 
  ShieldCheck, 
  Search, 
  ClipboardList, 
  UserCog,
  UserCircle2,
  DollarSign,
  Edit3,
  TrendingUp,
  CalendarDays, 
  Edit, 
  Camera, 
  UploadCloud,
  Loader2 // Added Loader2 for Suspense fallback
} from "lucide-react";
import type { ActivityItem, LucideIconName, ServiceRequest, ArtisanProfile, ServiceExperience, UserRole } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { ServiceRequestCard } from "@/components/service-requests/service-request-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const mockUserId = "currentArtisanId123"; // Simulate a logged-in artisan user
// userType is now determined by query param

const mockArtisanStats = {
  totalBidsSent: 25,
  activeJobs: 3,
  totalEarned: 175000, // Naira
  completionRate: 95, // Percentage
};

const mockClientStats = {
  activeRequests: 2,
  artisansHired: 5,
  totalSpent: 250000, // Naira
};


const mockArtisanServiceExperiences: ServiceExperience[] = [
  { serviceName: "Tailoring/Fashion Design", years: 10, chargeAmount: 20000, chargeDescription: "per outfit" },
  { serviceName: "Plumbing", years: 5, chargeAmount: 5000, chargeDescription: "call-out fee" }
];

const mockRecentActivitiesArtisan: ActivityItem[] = [
  {
    id: "activity1", type: "new_proposal", icon: "FileText", title: "Proposal submitted for 'Kitchen Renovation'",
    description: "Waiting for client review.", timestamp: new Date(Date.now() - 3600000 * 1), userId: mockUserId, link: "/dashboard/services/my-offers"
  },
  {
    id: "activity3", type: "job_awarded", icon: "Award", title: "Job 'Catering for Event' awarded!",
    description: "Client Chioma accepted your proposal.", timestamp: new Date(Date.now() - 86400000 * 0.5), userId: mockUserId, link: "/dashboard/services/my-offers"
  },
  {
    id: "activity4", type: "payment_processed", icon: "CreditCard", title: "Payment of ₦15,000 received",
    description: "For 'Electrical Wiring Fix' completed.", timestamp: new Date(Date.now() - 86400000 * 3), userId: mockUserId, link: "/dashboard/payments"
  },
  {
    id: "activity5", type: "new_message", icon: "MessageSquare", title: "New message from Client Bola",
    description: "Regarding 'Website Design' project...", timestamp: new Date(Date.now() - 3600000 * 5), userId: mockUserId, link: "/dashboard/messages"
  },
];

const mockRecentActivitiesClient: ActivityItem[] = [
  {
    id: "activity_c1", type: "request_update", icon: "Briefcase", title: "Plumber Adewale sent a proposal for 'Leaky Faucet'",
    description: "Review their offer now.", timestamp: new Date(Date.now() - 3600000 * 2), userId: "mockClientUserId", link: "/dashboard/services/my-requests/req1"
  },
  {
    id: "activity_c2", type: "payment_processed", icon: "CreditCard", title: "Payment of ₦50,000 funded to escrow for 'Event Catering'",
    description: "Artisan Chioma can now begin work.", timestamp: new Date(Date.now() - 86400000 * 1), userId: "mockClientUserId", link: "/dashboard/payments/escrow?transactionId=txn_mock_catering"
  },
   {
    id: "activity_c3", type: "new_message", icon: "MessageSquare", title: "New message from Artisan Bola",
    description: "Regarding your 'Aso Ebi Tailoring' request...", timestamp: new Date(Date.now() - 3600000 * 4), userId: "mockClientUserId", link: "/dashboard/messages"
  },
];


const mockNewJobsForArtisan: ServiceRequest[] = [
  { id: "job1", clientId: "clientNew1", title: "Urgent Plumbing for Bathroom Leak", description: "Main bathroom pipe burst, need immediate plumbing assistance in Ikeja.", category: "Plumbing", location: "Ikeja, Lagos", budget: 15000, postedAt: new Date(Date.now() - 3600000 * 3), status: "open" },
  { id: "job2", clientId: "clientNew2", title: "Custom Bookshelf Carpentry", description: "Looking for a skilled carpenter to build a floor-to-ceiling bookshelf. Materials provided.", category: "Carpentry", location: "Lekki Phase 1, Lagos", budget: 80000, postedAt: new Date(Date.now() - 86400000 * 1), status: "open" },
  { id: "job3", clientId: "clientNew3", title: "House Painting - Exterior", description: "Need exterior painting for a 3-bedroom bungalow in Surulere.", category: "Painting", location: "Surulere, Lagos", postedAt: new Date(Date.now() - 86400000 * 2), status: "open" },
];

// Mock suggestions for clients
const mockSuggestedArtisansForClient: (Pick<ArtisanProfile, 'userId' | 'username' | 'profilePhotoUrl' | 'location' | 'servicesOffered' | 'headline'> & { rating?: number })[] = [
  { userId: "art_pub_1", username: "Adewale Plumbing Masters", profilePhotoUrl: "https://placehold.co/80x80.png?text=AP", location: "Ikeja, Lagos", servicesOffered: ["Plumbing"], headline: "Your Go-To for Quick Plumbing Fixes!", rating: 4.7 },
  { userId: "art_pub_2", username: "Chioma's Exquisite Catering", profilePhotoUrl: "https://placehold.co/80x80.png?text=CC", location: "Lekki, Lagos", servicesOffered: ["Catering"], headline: "Delicious Meals for Memorable Events.", rating: 4.9 },
];


const iconComponentsMap: Record<LucideIconName, LucideIcon> = {
  LayoutDashboard, UserCircle, Briefcase, MessageSquare, Settings, CreditCard, Users, LogOut, MapPin, PlusCircle, ShieldCheck, FileText, Search, ClipboardList, UserCog, UserCircle2, Award, CheckCircle2, Camera, UploadCloud, Menu: LayoutDashboard, CalendarDays, Edit, Bell: Users, Check:CheckCircle2, Trash2: Users, DollarSign, Info: Users
};

function DashboardHomePageContent() {
  const searchParams = useSearchParams();
  const roleFromQuery = searchParams.get("role") as UserRole | null;
  const userType: UserRole = roleFromQuery && ["client", "artisan", "admin"].includes(roleFromQuery) ? roleFromQuery : "artisan"; // Default to artisan

  const userActivities = (userType === 'client' ? mockRecentActivitiesClient : mockRecentActivitiesArtisan)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={userType === 'artisan' ? "Artisan Dashboard" : "Client Dashboard"}
        description={userType === 'artisan' ? "Oversee your jobs, proposals, and earnings." : "Manage your service requests and connect with artisans."}
        icon={LayoutDashboard}
      />

      {/* KPI Cards */}
      {userType === 'artisan' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Bids Sent" value={mockArtisanStats.totalBidsSent.toString()} icon={Edit3} />
          <StatCard title="Active Jobs" value={mockArtisanStats.activeJobs.toString()} icon={Briefcase} />
          <StatCard title="Total Earned (₦)" value={`₦${mockArtisanStats.totalEarned.toLocaleString()}`} icon={DollarSign} />
        </div>
      )}
      {userType === 'client' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Active Requests" value={mockClientStats.activeRequests.toString()} icon={ClipboardList} />
          <StatCard title="Artisans Hired" value={mockClientStats.artisansHired.toString()} icon={Users} />
          <StatCard title="Total Spent (₦)" value={`₦${mockClientStats.totalSpent.toLocaleString()}`} icon={DollarSign} />
        </div>
      )}


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {userType === 'artisan' && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Search className="text-primary h-5 w-5"/> New Jobs For You</CardTitle>
                <CardDescription>Opportunities matching your skills. (Mocked data based on your primary services)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockNewJobsForArtisan.length > 0 ? (
                  mockNewJobsForArtisan.slice(0,3).map(job => (
                    <ServiceRequestCard key={job.id} request={job} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No new jobs matching your services right now. Check back later!</p>
                )}
                {mockNewJobsForArtisan.length > 3 && (
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard/jobs">View All Matching Jobs</Link>
                    </Button>
                )}
              </CardContent>
            </Card>
          )}

          {userType === 'client' && (
             <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Search className="text-primary h-5 w-5"/> Find Artisans</CardTitle>
                <CardDescription>Discover skilled professionals for your needs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {mockSuggestedArtisansForClient.length > 0 ? (
                  mockSuggestedArtisansForClient.slice(0,2).map(artisan => (
                    <ArtisanSuggestionCard key={artisan.userId} artisan={artisan} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Could not find artisan suggestions at this time.</p>
                )}
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/services/browse">Browse All Artisans</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="lg:col-span-1 space-y-6">
           {userType === 'artisan' && mockArtisanServiceExperiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Briefcase className="text-primary h-5 w-5"/> Your Services</CardTitle>
                <CardDescription>Overview of your offered services and pricing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockArtisanServiceExperiences.map((exp, index) => (
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
                    {index < mockArtisanServiceExperiences.length - 1 && <Separator className="my-3"/>}
                  </div>
                ))}
                 <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                    <Link href="/dashboard/profile/artisan/edit"><Edit className="mr-2 h-4 w-4" /> Edit Services & Profile</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {userType === 'client' && (
             <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-3">
                    <Button asChild className="w-full justify-start text-base py-6">
                        <Link href="/dashboard/services/request/new"><PlusCircle className="mr-2 h-5 w-5" /> Post New Service Request</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start text-base py-6">
                        <Link href="/dashboard/services/my-requests"><ClipboardList className="mr-2 h-5 w-5" /> My Service Requests</Link>
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
              {userActivities.length > 0 ? (
                  <ul className="space-y-4">
                  {userActivities.map((activity) => {
                      const IconComponent = iconComponentsMap[activity.icon] || LayoutDashboard;
                      const activityContent = (
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
                          <Link href={activity.link} className="block">
                              {activityContent}
                          </Link>
                          ) : (
                          activityContent
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

// Simplified card for artisan suggestions on client dashboard
interface ArtisanSuggestionCardProps {
  artisan: Pick<ArtisanProfile, 'userId' | 'username' | 'profilePhotoUrl' | 'location' | 'servicesOffered'| 'headline'> & { rating?: number };
}
function ArtisanSuggestionCard({ artisan }: ArtisanSuggestionCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-4 flex items-start gap-4">
        <Image
          src={artisan.profilePhotoUrl || `https://placehold.co/64x64.png`}
          alt={artisan.username || 'Artisan'}
          width={64}
          height={64}
          className="rounded-lg border object-cover"
          data-ai-hint="profile avatar"
        />
        <div className="flex-1">
          <Link href={`/dashboard/artisans/${artisan.userId}`}>
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
            <Link href={`/dashboard/artisans/${artisan.userId}`}>View</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    // Suspense boundary is important because useSearchParams can only be used in Client Components
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
            <div className="h-8 w-8 rounded-md bg-muted"></div>
            <div className="h-8 w-48 rounded-md bg-muted"></div>
          </div>
          <div className="h-4 w-64 rounded-md bg-muted"></div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader><div className="h-5 w-2/3 rounded-md bg-muted"></div></CardHeader><CardContent><div className="h-8 w-1/3 rounded-md bg-muted"></div></CardContent></Card>
        <Card><CardHeader><div className="h-5 w-2/3 rounded-md bg-muted"></div></CardHeader><CardContent><div className="h-8 w-1/3 rounded-md bg-muted"></div></CardContent></Card>
        <Card><CardHeader><div className="h-5 w-2/3 rounded-md bg-muted"></div></CardHeader><CardContent><div className="h-8 w-1/3 rounded-md bg-muted"></div></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card><CardHeader><div className="h-6 w-1/2 rounded-md bg-muted mb-2"></div><div className="h-4 w-3/4 rounded-md bg-muted"></div></CardHeader><CardContent><div className="h-24 w-full rounded-md bg-muted"></div></CardContent></Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card><CardHeader><div className="h-6 w-1/2 rounded-md bg-muted mb-2"></div><div className="h-4 w-3/4 rounded-md bg-muted"></div></CardHeader><CardContent><div className="h-32 w-full rounded-md bg-muted"></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
