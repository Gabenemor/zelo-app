
"use client"; // Make it a client component to use useSearchParams

import { Suspense } from 'react';
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCircle, Edit3, CreditCard, Settings, Loader2 } from "lucide-react";
import Image from "next/image";
import type { UserRole } from "@/types";

function ProfilePageContent() {
  const searchParams = useSearchParams();
  const actualRole = (searchParams.get('role') as UserRole) || 'client'; // Default for safety if param is missing

  const user = { 
    id: `user_mock_${actualRole}_id`, 
    name: `${actualRole.charAt(0).toUpperCase() + actualRole.slice(1)} User`,
    email: `${actualRole}@zelo.app`,
    role: actualRole,
    avatarUrl: `https://placehold.co/128x128.png?text=${actualRole.charAt(0).toUpperCase()}`,
    memberSince: "February 2024",
    location: "Nigeria",
    bio: actualRole === 'artisan' ? "A passionate artisan dedicated to quality." : undefined,
  };

  const editProfileLink = `/dashboard/profile/edit?role=${user.role}`;
  const settingsLink = `/dashboard/settings?role=${user.role}`;
  const withdrawalSettingsLink = `/dashboard/profile/withdrawal-settings?role=${user.role}`;
  const viewArtisanProfileLink = `/dashboard/artisans/${user.id}?role=${user.role}`;


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
                  href={withdrawalSettingsLink}
                  icon={CreditCard}
                />
                <ActionItem
                  title="View My Artisan Profile"
                  description="See how your profile appears to clients."
                  href={viewArtisanProfileLink} 
                  icon={UserCircle}
                />
              </>
            )}
            <ActionItem
              title="Account Settings"
              description="Change password and manage security settings."
              href={settingsLink} 
              icon={Settings}
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

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
}
