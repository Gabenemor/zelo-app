import { DashboardHeader } from "@/components/shared/dashboard-header";
import { DashboardSidebarNav } from "@/components/shared/dashboard-sidebar-nav";
import { Logo } from "@/components/shared/logo";
import { dashboardNavItems } from "@/config/site";
import type { UserRole } from "@/types";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarRail, // Added for completeness, might not be used directly
} from "@/components/ui/sidebar"; // Make sure this path is correct
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Placeholder for fetching user role. In a real app, this would come from auth context or session.
  const userRole: UserRole = "artisan"; // Example: 'client', 'artisan', 'admin'

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <Logo size="md" className="px-2 py-1" />
        </SidebarHeader>
        <ScrollArea className="flex-1">
          <SidebarContent>
            <DashboardSidebarNav items={dashboardNavItems} userRole={userRole} />
          </SidebarContent>
        </ScrollArea>
        <SidebarFooter>
           <Link href="/api/auth/logout" className="w-full">
            <Button variant="ghost" className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
            </Button>
           </Link>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
