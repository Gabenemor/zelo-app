
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
  DollarSign, // For Total Earned
  Edit3, // For Bids Made
  TrendingUp // For Completion Rate (example)
} from "lucide-react";
import type { ActivityItem, LucideIconName, ServiceRequest } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { ServiceRequestCard } from "@/components/service-requests/service-request-card";

const mockUserId = "currentArtisanId123"; // Simulate a logged-in artisan user
const userType: 'client' | 'artisan' = 'artisan'; // Hardcode for artisan view

const mockArtisanStats = {
  totalBidsSent: 25,
  activeJobs: 3,
  totalEarned: 175000, // Naira
  completionRate: 95, // Percentage
};

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

const mockNewJobsForArtisan: ServiceRequest[] = [
  { id: "job1", clientId: "clientNew1", title: "Urgent Plumbing for Bathroom Leak", description: "Main bathroom pipe burst, need immediate plumbing assistance in Ikeja.", category: "Plumbing", location: "Ikeja, Lagos", budget: 15000, postedAt: new Date(Date.now() - 3600000 * 3), status: "open" },
  { id: "job2", clientId: "clientNew2", title: "Custom Bookshelf Carpentry", description: "Looking for a skilled carpenter to build a floor-to-ceiling bookshelf. Materials provided.", category: "Carpentry", location: "Lekki Phase 1, Lagos", budget: 80000, postedAt: new Date(Date.now() - 86400000 * 1), status: "open" },
  { id: "job3", clientId: "clientNew3", title: "House Painting - Exterior", description: "Need exterior painting for a 3-bedroom bungalow in Surulere.", category: "Painting", location: "Surulere, Lagos", postedAt: new Date(Date.now() - 86400000 * 2), status: "open" },
];

const iconComponentsMap: Record<LucideIconName, LucideIcon> = {
  LayoutDashboard, UserCircle, Briefcase, MessageSquare, Settings, CreditCard, Users, LogOut, MapPin, PlusCircle, ShieldCheck, FileText, Search, ClipboardList, UserCog, UserCircle2, Award, CheckCircle2, Camera: UserCircle, UploadCloud: UserCircle, Menu: LayoutDashboard, // Add Menu if used
};

export default function DashboardHomePage() {
  const userActivities = mockRecentActivitiesArtisan.filter(activity => activity.userId === mockUserId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={userType === 'artisan' ? "Artisan Dashboard" : "Welcome to your Dashboard"}
        description="Oversee your jobs, proposals, and earnings."
        icon={LayoutDashboard}
      />

      {/* KPI Cards for Artisan */}
      {userType === 'artisan' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Bids Sent" value={mockArtisanStats.totalBidsSent.toString()} icon={Edit3} />
          <StatCard title="Active Jobs" value={mockArtisanStats.activeJobs.toString()} icon={Briefcase} />
          <StatCard title="Total Earned (₦)" value={`₦${mockArtisanStats.totalEarned.toLocaleString()}`} icon={DollarSign} />
          {/* Optional: <StatCard title="Completion Rate" value={`${mockArtisanStats.completionRate}%`} icon={TrendingUp} /> */}
        </div>
      )}

      {/* Main content area with feeds */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* New Jobs For You - Artisan */}
          {userType === 'artisan' && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Search className="text-primary h-5 w-5"/> New Jobs For You</CardTitle>
                <CardDescription>Opportunities matching your skills. (Mocked data based on 'Plumbing', 'Carpentry')</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockNewJobsForArtisan.length > 0 ? (
                  mockNewJobsForArtisan.slice(0,3).map(job => ( // Show a few
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
        </div>
        
        {/* Recent Activity Feed - Common or Artisan-specific */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Recent Activity</CardTitle>
                <CardDescription>Your latest interactions on Zelo.</CardDescription>
                </CardHeader>
                <CardContent>
                {userActivities.length > 0 ? (
                    <ul className="space-y-4">
                    {userActivities.map((activity) => {
                        const IconComponent = iconComponentsMap[activity.icon] || LayoutDashboard; // Fallback icon
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

      {/* Generic Links - kept for now, might be less relevant for focused artisan dash */}
      {userType === 'client' && ( // Conditional rendering if needed for client later
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="My Profile"
            description="View and update your personal information and settings."
            icon={UserCircle}
            actionHref="/dashboard/profile"
            actionText="View Profile"
          />
          <DashboardCard
            title="Post a New Service Request"
            description="Need something done? Let skilled artisans know."
            icon={PlusCircle}
            actionHref="/dashboard/services/request/new"
            actionText="Post Request"
          />
          <DashboardCard
            title="My Services"
            description="Track your ongoing and past service requests."
            icon={Briefcase}
            actionHref="/dashboard/services/my-requests"
            actionText="View Services"
          />
        </div>
      )}
    </div>
  );
}

interface DashboardCardProps { // For the generic cards if still used
  title: string;
  description: string;
  icon: React.ElementType;
  actionHref: string;
  actionText: string;
}

function DashboardCard({ title, description, icon: Icon, actionHref, actionText }: DashboardCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium font-headline">{title}</CardTitle>
        <Icon className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <div className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={actionHref}>{actionText}</Link>
        </Button>
      </div>
    </Card>
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
