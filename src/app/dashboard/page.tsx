
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
  Settings, // Added Settings here
  Users, 
  LogOut, 
  MapPin, 
  ShieldCheck, 
  Search, 
  ClipboardList, 
  UserCog,
  UserCircle2
} from "lucide-react";
import type { ActivityItem, ActivityType, LucideIconName } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

// Mock data for recent activities
const mockUserId = "currentUser123"; // Simulate a logged-in user

const mockRecentActivities: ActivityItem[] = [
  {
    id: "activity1",
    type: "new_message",
    icon: "MessageSquare",
    title: "New message from Adewale ThePlumber",
    description: "Regarding your kitchen sink repair...",
    timestamp: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    link: "/dashboard/messages?chatId=conv1", // Example link
    userId: mockUserId,
  },
  {
    id: "activity2",
    type: "request_update",
    icon: "FileText",
    title: "Service request 'Garden Landscaping' updated",
    description: "Status changed to 'In Progress'.",
    timestamp: new Date(Date.now() - 86400000 * 1), // 1 day ago
    link: "/dashboard/services/requests/req_garden_xyz", // Example link
    userId: mockUserId,
  },
  {
    id: "activity3",
    type: "job_awarded",
    icon: "Award",
    title: "You've been awarded the 'Catering for Event' job!",
    description: "Client Chioma has accepted your proposal.",
    timestamp: new Date(Date.now() - 86400000 * 0.5), // 12 hours ago for an artisan
    link: "/dashboard/services/my-offers/req_catering_abc", 
    userId: mockUserId, // Assuming this is an artisan
  },
  {
    id: "activity4",
    type: "payment_processed",
    icon: "CreditCard",
    title: "Payment of ₦15,000 released",
    description: "For 'Electrical Wiring Fix' completed.",
    timestamp: new Date(Date.now() - 86400000 * 3), // 3 days ago
    link: "/dashboard/payments/history?txnId=txn_payment_123",
    userId: mockUserId,
  },
  {
    id: "activity5",
    type: "job_completed",
    icon: "CheckCircle2",
    title: "Marked 'Website Design' as completed",
    description: "Client Bola confirmed completion.",
    timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
    link: "/dashboard/services/my-requests/req_website_456",
    userId: mockUserId,
  },
];

// Map of icon names to actual Lucide components
const iconComponentsMap: Record<LucideIconName, LucideIcon> = {
  LayoutDashboard, UserCircle, Briefcase, MessageSquare, Settings, CreditCard, Users, LogOut, MapPin, PlusCircle, ShieldCheck, FileText, Search, ClipboardList, UserCog, UserCircle2, Award, CheckCircle2
  // Add other icons used in nav items if not covered by the list above
};


export default function DashboardHomePage() {
  // Placeholder data - in a real app, this would be dynamic
  const userType: 'client' | 'artisan' = 'artisan'; // or 'client'

  // Filter activities for the current mock user
  const userActivities = mockRecentActivities.filter(activity => activity.userId === mockUserId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort by most recent
    .slice(0, 5); // Show top 5


  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome to your Dashboard"
        description="Manage your activities, services, and profile all in one place."
        icon={LayoutDashboard}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="My Profile"
          description="View and update your personal information and settings."
          icon={UserCircle}
          actionHref="/dashboard/profile"
          actionText="View Profile"
        />
        
        {userType === 'client' && (
          <DashboardCard
            title="Post a New Service Request"
            description="Need something done? Let skilled artisans know."
            icon={PlusCircle}
            actionHref="/dashboard/services/request/new"
            actionText="Post Request"
          />
        )}

        {userType === 'artisan' && (
           <DashboardCard
            title="Browse Service Requests"
            description="Find new job opportunities posted by clients."
            icon={Briefcase}
            actionHref="/dashboard/jobs" // Updated to point to the new browse jobs page for artisans
            actionText="Browse Requests"
          />
        )}
       
        <DashboardCard
          title="My Services"
          description={userType === 'client' ? "Track your ongoing and past service requests." : "Manage your offered services and job applications."}
          icon={Briefcase}
          actionHref={userType === 'client' ? "/dashboard/services/my-requests" : "/dashboard/services/my-offers"}
          actionText="View Services"
        />
        
        <DashboardCard
          title="Messages"
          description="Communicate with clients or artisans directly."
          icon={MessageSquare}
          actionHref="/dashboard/messages"
          actionText="Open Messages"
        />

        {userType === 'artisan' && (
          <DashboardCard
            title="Withdrawal Settings"
            description="Manage your bank account details for payments."
            icon={CreditCard} 
            actionHref="/dashboard/profile/withdrawal-settings"
            actionText="Setup Account"
          />
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Recent Activity</CardTitle>
          <CardDescription>Overview of your latest interactions on Zelo.</CardDescription>
        </CardHeader>
        <CardContent>
          {userActivities.length > 0 ? (
            <ul className="space-y-4">
              {userActivities.map((activity) => {
                const IconComponent = iconComponentsMap[activity.icon];
                const activityContent = (
                  <div className="flex items-start gap-3">
                    {IconComponent && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-1">
                        <IconComponent className="h-4 w-4" />
                      </div>
                    )}
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
  );
}

interface DashboardCardProps {
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
