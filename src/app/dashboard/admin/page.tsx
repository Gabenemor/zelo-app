
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Settings, Coins, BarChart3, ShieldAlert } from "lucide-react"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock admin stats
const adminStats = {
  totalUsers: 1250,
  activeArtisans: 350,
  activeClients: 850,
  openServiceRequests: 75,
  completedJobs: 480,
  totalRevenue: 2500000, // Naira
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Oversee and manage the Zelo platform."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={adminStats.totalUsers.toLocaleString()} icon={Users} />
        <StatCard title="Active Artisans" value={adminStats.activeArtisans.toLocaleString()} icon={Briefcase} />
        <StatCard title="Open Service Requests" value={adminStats.openServiceRequests.toLocaleString()} icon={Briefcase} color="text-orange-500" />
        <StatCard title="Total Platform Revenue (₦)" value={`₦${adminStats.totalRevenue.toLocaleString()}`} icon={Coins} color="text-green-500" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <AdminActionLink href="/dashboard/admin/users" icon={Users} label="Manage Users" />
            <AdminActionLink href="/dashboard/admin/jobs" icon={Briefcase} label="Manage Jobs" />
            <AdminActionLink href="/dashboard/admin/disputes" icon={ShieldAlert} label="Resolve Disputes" badgeCount={3} />
            <AdminActionLink href="/dashboard/admin/settings" icon={Settings} label="Platform Settings" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Platform Analytics</CardTitle>
            <CardDescription>Overview of platform activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <img src="https://placehold.co/600x300.png?text=Platform+Activity+Chart" alt="Platform activity chart" className="w-full rounded-md" data-ai-hint="activity chart" />
            <Button variant="outline" className="mt-4 w-full" asChild>
                <Link href="/dashboard/admin/reports"><BarChart3 className="mr-2 h-4 w-4" /> View Detailed Reports</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color?: string;
}

function StatCard({ title, value, icon: Icon, color = "text-primary" }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}


interface AdminActionLinkProps {
    href: string;
    icon: React.ElementType;
    label: string;
    badgeCount?: number;
}

function AdminActionLink({ href, icon: Icon, label, badgeCount }: AdminActionLinkProps) {
    return (
        <Link href={href} className="group relative flex flex-col items-center justify-center rounded-lg border bg-background p-4 text-center shadow-sm transition-all hover:shadow-md hover:border-primary">
            <Icon className="h-8 w-8 text-primary mb-2 transition-transform group-hover:scale-110" />
            <span className="text-sm font-medium text-foreground group-hover:text-primary">{label}</span>
            {badgeCount && badgeCount > 0 && (
                 <span className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
                    {badgeCount}
                </span>
            )}
        </Link>
    )
}
