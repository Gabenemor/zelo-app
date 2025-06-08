import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, MessageSquare, PlusCircle, UserCircle, LayoutDashboard } from "lucide-react";

export default function DashboardHomePage() {
  // Placeholder data - in a real app, this would be dynamic
  const userType: 'client' | 'artisan' = 'artisan'; // or 'client'

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
            actionHref="/dashboard/services/browse"
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
            icon={UserCircle} // Icon can be CreditCard
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
          {/* Placeholder for recent activity feed */}
          <p className="text-sm text-muted-foreground">No recent activity to display yet.</p>
          <img src="https://placehold.co/600x200.png" alt="Placeholder activity graph" className="mt-4 w-full rounded-md" data-ai-hint="activity graph" />
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
