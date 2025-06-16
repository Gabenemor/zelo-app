
"use client"; // This layout now uses client-side hooks and components

import React from 'react';
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { Toaster } from "@/components/ui/toaster"; 
import { AuthProvider } from "@/components/providers/auth-provider";
// import { VerifyEmailBanner } from "@/components/auth/verify-email-banner"; // Banner removed

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 bg-background w-full lg:w-[90%] mx-auto">
          {/* <VerifyEmailBanner /> */} {/* Banner removed */}
          {children}
        </main>
        <Toaster /> 
      </div>
    </AuthProvider>
  );
}
