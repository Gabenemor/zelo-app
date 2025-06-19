
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { WithdrawalSettingsForm } from "@/components/profile/withdrawal-settings-form";
import { CreditCard, Loader2 } from "lucide-react";
import type { WithdrawalAccount } from "@/types";
import { useAuthContext } from '@/components/providers/auth-provider';
import { getWithdrawalAccount } from '@/lib/firestore'; 
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function WithdrawalSettingsPage() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const router = useRouter();
  const [initialData, setInitialData] = useState<Partial<WithdrawalAccount> | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const fetchAccountData = useCallback(async (userId: string) => {
    setIsLoadingData(true);
    try {
      const accountData = await getWithdrawalAccount(userId);
      setInitialData(accountData || {}); // Set to empty object if null
    } catch (error) {
      console.error("Error fetching withdrawal account:", error);
      toast({ title: "Error", description: "Could not load withdrawal account details.", variant: "destructive" });
      setInitialData({}); // Set to empty object on error
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      toast({ title: "Unauthorized", description: "Please log in.", variant: "destructive" });
      router.replace('/login');
      setIsLoadingData(false);
      return;
    }
    if (authUser.role !== 'artisan') {
      toast({ title: "Access Denied", description: "This page is for artisans only.", variant: "destructive" });
      router.replace('/dashboard');
      setIsLoadingData(false);
      return;
    }
    fetchAccountData(authUser.uid);
  }, [authUser, authLoading, fetchAccountData, router, toast]);

  if (authLoading || isLoadingData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Withdrawal Account Settings" description="Loading your settings..." className="animate-pulse" />
        <Skeleton className="h-64 w-full rounded-lg bg-muted" />
      </div>
    );
  }
  
  if (!authUser || authUser.role !== 'artisan') {
    return null; // Redirects handled in useEffect
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdrawal Account Settings"
        description="Add or update your bank account details to receive payments for your services. All transactions are in Naira (₦)."
      />
      <WithdrawalSettingsForm userId={authUser.uid} initialData={initialData} />
    </div>
  );
}
