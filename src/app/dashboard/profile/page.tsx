import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserCircle, Edit3, CreditCard, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  // Placeholder: In a real app, fetch user data and role
  const user = {
    name: "Zelo User",
    email: "user@zelo.app",
    role: "artisan", // or 'client' or 'admin'
    avatarUrl: "https://placehold.co/128x128.png",
    memberSince: "January 2024",
    location: "Lagos, Nigeria",
    bio: "A passionate artisan dedicated to quality.",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal information, settings, and Zelo activities."
        icon={UserCircle}
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard/profile/edit"><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="items-center text-center">
            <Image 
              src={user.avatarUrl} 
              alt={user.name} 
              width={128} 
              height={128} 
              className="rounded-full border-4 border-primary mb-4"
              data-ai-hint="profile avatar" 
            />
            <CardTitle className="font-headline text-2xl">{user.name}</CardTitle>
            <CardDescription className="capitalize">{user.role}</CardDescription>
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
              href="/dashboard/profile/edit"
              icon={Edit3}
            />
            {user.role === 'artisan' && (
              <ActionItem
                title="Withdrawal Settings"
                description="Manage your bank account for receiving payments."
                href="/dashboard/profile/withdrawal-settings"
                icon={CreditCard}
              />
            )}
            <ActionItem
              title="Account Security"
              description="Change password and manage security settings."
              href="/dashboard/settings/security" // Example link
              icon={ShieldCheck}
            />
             <ActionItem
              title="View Public Profile"
              description="See how your profile appears to others."
              href={`/users/${user.email.split('@')[0]}`} // Example link
              icon={UserCircle}
            />
          </CardContent>
        </Card>
      </div>
       {/* Placeholder for other profile sections like activity, reviews etc. */}
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
