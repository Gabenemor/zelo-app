
"use client"; 

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from '@/components/ui/page-header';
import { Loader2, UserCog } from 'lucide-react';
import type { UserRole } from '@/types';

function EditProfileRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Guaranteed by Suspense
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs once when searchParams becomes available.
    const role = searchParams.get('role') as UserRole | null;
    let targetPath = '/dashboard?role=client'; // Default fallback to client dashboard

    if (role) {
      if (role === 'artisan') {
        targetPath = `/dashboard/profile/artisan/edit?role=artisan`;
      } else if (role === 'client') {
        targetPath = `/dashboard/profile/client/edit?role=client`;
      } else if (role === 'admin') {
        targetPath = '/dashboard/admin/profile/edit'; // Or appropriate admin profile edit
      }
    } else {
      console.warn("Role missing in /dashboard/profile/edit, falling back to client dashboard.");
    }
    
    setRedirectPath(targetPath);

  }, [searchParams]); // Only depends on searchParams object itself

  useEffect(() => {
    // This effect runs when redirectPath is set.
    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [redirectPath, router]);

  // Show loading skeleton UNTIL redirectPath is set and router.replace has been called or is about to be called.
  if (!redirectPath) {
    return (
        <div className="space-y-6">
            <PageHeader 
              title="Edit Profile" 
              description="Loading your profile editor..." 
            />
            <div className="space-y-4 p-4 border rounded-lg bg-card animate-pulse">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <Skeleton className="h-10 w-full mt-4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Determining profile type...</p>
                </div>
            </div>
        </div>
    );
  }

  // This content ideally shouldn't be shown for long as redirection should occur
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to your profile editor...</p>
    </div>
  );
}


export default function EditProfilePage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <PageHeader title="Edit Profile" description="Loading..." className="animate-pulse"/>
        <Skeleton className="h-64 w-full rounded-lg bg-muted"/>
      </div>
    }>
      <EditProfileRedirectContent />
    </Suspense>
  );
}
