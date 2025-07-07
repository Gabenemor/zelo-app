
"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Users, Briefcase, Loader2, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/types';
import { completeGoogleSignInWithRole } from '@/actions/auth-actions';
import { AuthLayout } from '@/components/auth/auth-layout';

function ChooseRoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const uid = searchParams.get('uid');
  const email = searchParams.get('email');
  const displayName = searchParams.get('displayName');

  useEffect(() => {
    if (!uid || !email || !displayName) {
      toast({
        title: "Error",
        description: "Missing required information to complete registration. Please try signing up again.",
        variant: "destructive",
      });
      router.replace('/register');
    }
  }, [uid, email, displayName, router, toast]);

  const handleRoleSelection = async (role: UserRole) => {
    if (!uid || !email || !displayName) {
      toast({ title: "Error", description: "Cannot proceed without user details.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const result = await completeGoogleSignInWithRole({ uid, email, displayName, role });
    setIsLoading(false);

    if (result.success && result.role) {
      toast({ title: "Role Selected!", description: `You've registered as a ${result.role}. Let's get you set up.` });
      const queryParams = new URLSearchParams({
        firstName: displayName.split(' ')[0] || "User",
        uid: uid, // Pass UID for onboarding context
      });
      if (email) {
        queryParams.append('email', email);
      }
      router.push(`/onboarding/${result.role}/step-1?${queryParams.toString()}`);
    } else {
      toast({
        title: "Error Completing Registration",
        description: result.error || "Could not save your role. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!uid || !email || !displayName) {
    // This will be shown briefly if redirect in useEffect is triggered or if params are truly missing
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading user details or redirecting...</p>
        </div>
    );
  }

  return (
    <AuthLayout
        title={`Welcome, ${displayName}!`}
        description="One last step: tell us how you'll be using Zelo."
    >
        <div className="space-y-6">
            <p className="text-center text-muted-foreground">Are you here to find services or offer your skills?</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button
                    variant="outline"
                    size="lg"
                    className="h-auto py-6 flex flex-col items-center justify-center space-y-2 text-base hover:border-primary hover:bg-primary/5 group"
                    onClick={() => handleRoleSelection('client')}
                    disabled={isLoading}
                >
                    <Users className="h-8 w-8 mb-2 text-primary transition-transform group-hover:scale-110" />
                    <span>I&apos;m a Client</span>
                    <span className="text-xs text-muted-foreground font-normal group-hover:text-primary">Looking for services</span>
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="h-auto py-6 flex flex-col items-center justify-center space-y-2 text-base hover:border-primary hover:bg-primary/5 group"
                    onClick={() => handleRoleSelection('artisan')}
                    disabled={isLoading}
                >
                    <Briefcase className="h-8 w-8 mb-2 text-primary transition-transform group-hover:scale-110" />
                    <span>I&apos;m an Artisan</span>
                    <span className="text-xs text-muted-foreground font-normal group-hover:text-primary">Offering my skills</span>
                </Button>
            </div>
            {isLoading && (
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finalizing your registration...
                </div>
            )}
        </div>
    </AuthLayout>
  );
}


export default function ChooseRolePage() {
  return (
    // Suspense is crucial because useSearchParams() is used in the child component
    <Suspense fallback={
        <AuthLayout title="Loading..." description="Please wait while we prepare your account options.">
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        </AuthLayout>
    }>
      <ChooseRoleContent />
    </Suspense>
  );
}
