
"use client";

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard, Coins, List, Download, FileText, ShoppingCart, CheckCircle2, Loader2 } from "lucide-react"; 
import type { UserRole, EscrowTransaction } from '@/types';
import { useAuthContext } from '@/components/providers/auth-provider';
import { getEscrowTransactions } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';


interface PaymentSummary {
  availableForWithdrawal?: number;
  pendingPayouts?: number;
  totalEarnedLifetime?: number;
  totalSpent?: number;
  activeJobsFunded?: number;
  requestsAwaitingFunding?: number;
}

function PaymentsOverviewPageContent() {
  const searchParams = useSearchParams();
  const { user: authUser, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  const roleFromQuery = searchParams.get("role") as UserRole | null;
  const userRole: UserRole = authUser?.role || roleFromQuery || 'client'; 

  const fetchPaymentSummary = useCallback(async () => {
    if (!authUser?.uid) {
      setIsLoadingSummary(false);
      return;
    }
    setIsLoadingSummary(true);
    try {
      let userTransactions = await getEscrowTransactions(
        userRole === 'client' ? { clientId: authUser.uid } : { artisanId: authUser.uid }
      );

      let calculatedSummary: PaymentSummary = {};
      if (userRole === 'client') {
        calculatedSummary.totalSpent = userTransactions
          .filter(t => t.status === 'funded' || t.status === 'released_to_artisan')
          .reduce((sum, t) => sum + t.amount, 0);
        // Placeholder logic for active/awaiting funding - needs ServiceRequest data
        calculatedSummary.activeJobsFunded = 0; 
        calculatedSummary.requestsAwaitingFunding = 0; 
      } else if (userRole === 'artisan') {
        calculatedSummary.totalEarnedLifetime = userTransactions
          .filter(t => t.status === 'released_to_artisan')
          .reduce((sum, t) => sum + (t.amount - t.platformFee), 0);
        // Placeholder logic for withdrawal/pending
        calculatedSummary.availableForWithdrawal = 0; 
        calculatedSummary.pendingPayouts = 0; 
      }
      setSummary(calculatedSummary);
    } catch (error) {
      console.error("Error fetching payment summary:", error);
      toast({ title: "Error", description: "Could not load payment summary.", variant: "destructive" });
    } finally {
      setIsLoadingSummary(false);
    }
  }, [authUser, userRole, toast]);

  useEffect(() => {
    if (!authLoading && authUser) {
      fetchPaymentSummary();
    } else if (!authLoading && !authUser) {
        setIsLoadingSummary(false);
    }
  }, [authLoading, authUser, fetchPaymentSummary]);


  if (authLoading || isLoadingSummary) {
    return <PaymentsLoadingSkeleton />;
  }

  if (!authUser) {
     return (
        <div className="py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">Please log in</h3>
            <p className="mt-1 text-sm text-muted-foreground">Log in to view your payment information.</p>
             <Button asChild className="mt-6">
                <Link href={`/login?redirect=/dashboard/payments`}>Login</Link>
            </Button>
        </div>
    );
  }


  const addRoleToHref = (href: string, currentRole: UserRole): string => {
    if (href.includes('?')) {
      return `${href}&role=${currentRole}`;
    }
    return `${href}?role=${currentRole}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={userRole === 'client' ? "Client Payments" : "Artisan Payments Overview"}
        description={
          userRole === 'client'
          ? "Manage your service payments, view transaction history, and track job funding."
          : "Track your earnings, manage withdrawals, and view transaction history."
        }
        action={
            <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download Statement
            </Button>
        }
      />

      {userRole === 'artisan' && summary && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Available for Withdrawal"
            value={`₦${(summary.availableForWithdrawal || 0).toLocaleString()}`}
            icon={Coins}
            color="text-green-500"
          />
          <StatCard
            title="Pending Payouts"
            value={`₦${(summary.pendingPayouts || 0).toLocaleString()}`}
            icon={Coins}
            color="text-yellow-500"
            description="From recently completed jobs"
          />
          <StatCard
            title="Lifetime Earnings"
            value={`₦${(summary.totalEarnedLifetime || 0).toLocaleString()}`}
            icon={CreditCard}
          />
        </div>
      )}

      {userRole === 'client' && summary && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Spent on Zelo"
            value={`₦${(summary.totalSpent || 0).toLocaleString()}`}
            icon={ShoppingCart}
          />
          <StatCard
            title="Active Jobs Funded"
            value={`${summary.activeJobsFunded || 0}`}
            icon={CheckCircle2}
            color="text-green-500"
            description="Services currently in progress"
          />
          <StatCard
            title="Requests Awaiting Funding"
            value={`${summary.requestsAwaitingFunding || 0}`}
            icon={CreditCard}
            color="text-orange-500"
            description="Awarded jobs that need escrow funding"
          />
        </div>
      )}


      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Payment Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {userRole === 'artisan' && (
            <Button asChild variant="default" className="w-full">
              <Link href={addRoleToHref('/dashboard/profile/withdrawal-settings', userRole)}>
                Manage Withdrawal Account
              </Link>
            </Button>
          )}
           <Button asChild variant="outline" className="w-full">
            <Link href={addRoleToHref('/dashboard/payments/history', userRole)}>
              <List className="mr-2 h-4 w-4" /> View Transaction History
            </Link>
          </Button>
          {userRole === 'client' && (
             <Button asChild variant="default" className="w-full">
                <Link href={addRoleToHref('/dashboard/services/my-requests', userRole)}>
                    <FileText className="mr-2 h-4 w-4" /> Fund a Job / View Requests
                </Link>
            </Button>
          )}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Understanding Your Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
            {userRole === 'artisan' ? (
              <>
                <p><strong>Available for Withdrawal:</strong> Funds from completed jobs that are ready to be transferred to your bank account.</p>
                <p><strong>Pending Payouts:</strong> Earnings from jobs marked as complete by clients, currently undergoing processing before becoming available for withdrawal. This usually takes a few business days.</p>
                <p><strong>Platform Fee:</strong> Zelo charges a 10% service fee on completed jobs, which is automatically deducted before payouts.</p>
              </>
            ) : (
              <>
                <p><strong>Funding Jobs:</strong> When you accept an artisan's proposal, you'll need to fund the agreed amount into Zelo's secure escrow. This protects both you and the artisan.</p>
                <p><strong>Releasing Payments:</strong> Only release payment from escrow once the service has been completed to your satisfaction.</p>
                <p><strong>Platform Fee:</strong> Artisans are charged a 10% service fee. This is deducted from their earnings, not an extra charge to you.</p>
              </>
            )}
             <Button asChild variant="link" className="p-0 h-auto text-sm">
                <Link href={addRoleToHref('/dashboard/payments/escrow', userRole)}>Learn more about Zelo Secure Escrow</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color?: string;
  description?: string;
}

function StatCard({ title, value, icon: Icon, color = "text-primary", description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function PaymentsOverviewPage() {
  return (
    <Suspense fallback={<PaymentsLoadingSkeleton />}>
      <PaymentsOverviewPageContent />
    </Suspense>
  );
}

function PaymentsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-1">
          
          <div className="h-8 w-48 rounded-md bg-muted"></div>
          <div className="h-4 w-64 rounded-md bg-muted"></div>
        </div>
        <div className="h-9 w-32 rounded-md bg-muted"></div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader><div className="h-5 w-2/3 rounded-md bg-muted"></div></CardHeader><CardContent><div className="h-8 w-1/3 rounded-md bg-muted"></div></CardContent></Card>
        <Card><CardHeader><div className="h-5 w-2/3 rounded-md bg-muted"></div></CardHeader><CardContent><div className="h-8 w-1/3 rounded-md bg-muted"></div></CardContent></Card>
        <Card><CardHeader><div className="h-5 w-2/3 rounded-md bg-muted"></div></CardHeader><CardContent><div className="h-8 w-1/3 rounded-md bg-muted"></div></CardContent></Card>
      </div>
      <Card><CardHeader><div className="h-6 w-1/2 rounded-md bg-muted"></div></CardHeader><CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="h-10 w-full rounded-md bg-muted"></div><div className="h-10 w-full rounded-md bg-muted"></div></CardContent></Card>
      <Card><CardHeader><div className="h-6 w-1/2 rounded-md bg-muted"></div></CardHeader><CardContent className="space-y-2"><div className="h-4 w-full rounded-md bg-muted"></div><div className="h-4 w-full rounded-md bg-muted"></div><div className="h-4 w-3/4 rounded-md bg-muted"></div></CardContent></Card>
    </div>
  );
}
