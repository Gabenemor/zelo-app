
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCircle, Edit3, CreditCard, ShieldCheck, Settings } from "lucide-react"; // Added Settings
import Image from "next/image";
import type { UserRole } from "@/types"; // Added UserRole type

// Simulate fetching current user details including role
// In a real app, this would come from an auth context or server session
async function getCurrentUser(): Promise<{
  id: string;
  name: string;
  email: string;
  role: UserRole; // 'client' | 'artisan' | 'admin'
  avatarUrl: string;
  memberSince: string;
  location: string;
  bio?: string; // Optional, more relevant for artisans
}> {
  // For demonstration, let's assume we can get role from searchParams
  // This is a simplification; in a real app, role comes from session.
  // const roleFromQuery = (new URL(request.url).searchParams.get('role') || 'client') as UserRole;
  // For a server component, we'd need to pass searchParams or get role differently.
  // Let's mock it for now, assuming a function that can determine role.
  // This page component itself might receive searchParams if we make it dynamic.
  
  // Hardcoding for example based on common user flow, but needs proper implementation.
  // This page needs to be dynamic or receive role prop to show correct user info.
  // For now, let's make it generic and let links decide context.
  // Defaulting to a generic user for now, actual user specific data fetch is needed.
  return {
    id: "mockUser123", // Placeholder ID
    name: "Zelo User", 
    email: "user@zelo.app",
    role: "client", // <<-- This needs to be dynamic. For now, assume 'client' for testing this view
    avatarUrl: "https://placehold.co/128x128.png",
    memberSince: "January 2024",
    location: "Lagos, Nigeria",
    bio: "A dedicated Zelo user.", // Generic bio
  };
}


export default async function ProfilePage({ searchParams }: { searchParams?: { role?: UserRole }}) {
  // In a real app, fetch user data based on authenticated user, not a generic mock.
  // The role should ideally come from the user's session, not query params for *this* page.
  // Query params are more for maintaining context *to* other pages.
  const actualRole = searchParams?.role || 'client'; // Default for safety
  
  const user = { // Mock user data for display
    id: "user_generic_id", 
    name: "Zelo User", // This should be fetched based on logged-in user
    email: `${actualRole}@zelo.app`, // Display dynamic email based on role context
    role: actualRole,
    avatarUrl: `https://placehold.co/128x128.png?text=${actualRole.charAt(0).toUpperCase()}`,
    memberSince: "February 2024",
    location: "Nigeria",
    bio: actualRole === 'artisan' ? "A passionate artisan dedicated to quality." : undefined, // Only show bio for artisans
  };

  const editProfileLink = `/dashboard/profile/edit?role=${user.role}`;
  const settingsLink = `/dashboard/settings?role=${user.role}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal information, settings, and Zelo activities."
        icon={UserCircle}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="items-center text-center">
            <Image 
              src={user.avatarUrl} 
              alt={user.name} 
              width={128} 
              height={128} 
              className="rounded-full border-4 border-primary mb-4 object-cover"
              data-ai-hint="profile avatar" 
            />
            <CardTitle className="font-headline text-2xl">{user.name}</CardTitle>
            <CardDescription className="capitalize">{user.role} Account</CardDescription>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong>Member Since:</strong> {user.memberSince}</p>
            <p><strong>Location:</strong> {user.location}</p>
            {user.role === 'artisan' && user.bio && <p className="pt-2 italic">"{user.bio}"</p>}
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
            {user.role === 'artisan' && (
              <>
                <ActionItem
                  title="Withdrawal Settings"
                  description="Manage your bank account for receiving payments."
                  href={`/dashboard/profile/withdrawal-settings?role=${user.role}`}
                  icon={CreditCard}
                />
                {/* Artisans view their own profile through a public-facing link if needed,
                    but for context consistency, the role param is key.
                    The ID here should be the artisan's actual ID.
                */}
                <ActionItem
                  title="View My Artisan Profile"
                  description="See how your profile appears to clients."
                  href={`/dashboard/artisans/${user.id}?role=${user.role}`} 
                  icon={UserCircle}
                />
              </>
            )}
            <ActionItem
              title="Account Settings"
              description="Change password and manage security settings."
              href={settingsLink} 
              icon={Settings} // Changed from ShieldCheck for clarity
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
