
"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { AuthProvider, useAuthContext } from "@/components/providers/auth-provider";
import { Loader2 } from "lucide-react";
import type { UserRole } from '@/types';

function LoginPageContent() {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (!loading && user) {
      // User is already logged in, redirect them
      let redirectPath = "/dashboard";
      const userRole: UserRole = user.role;

      if (userRole === "admin") {
        redirectPath = "/dashboard/admin";
      } else if (userRole) {
        redirectPath = `/dashboard?role=${userRole}`;
      }
      router.replace(redirectPath);
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    // Show a loader while checking auth status or if user is found (and will be redirected)
    return (
      <AuthLayout title="Loading..." description="Checking your session...">
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  // If not loading and no user, show the login form
  return (
    <AuthLayout
      title="Welcome Back to Zelo!"
      description="Login to access your account and continue managing your services."
    >
      <LoginForm />
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <AuthLayout title="Loading..." description="Preparing your login experience...">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </AuthLayout>
      }>
        <LoginPageContent />
      </Suspense>
    </AuthProvider>
  );
}
