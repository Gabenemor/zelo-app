
"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Eye, Download, Loader2 } from "lucide-react";
import type { EscrowTransaction } from "@/types";
import { format } from 'date-fns';
import { useAuthContext } from '@/components/providers/auth-provider';
import { getEscrowTransactions } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

export default function TransactionHistoryPage() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<EscrowTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = useCallback(async (userId: string, userRole: string) => {
    setIsLoading(true);
    try {
      let userTransactions: EscrowTransaction[] = [];
      if (userRole === 'client') {
        userTransactions = await getEscrowTransactions({ clientId: userId });
      } else if (userRole === 'artisan') {
        userTransactions = await getEscrowTransactions({ artisanId: userId });
      } else if (userRole === 'admin') {
        userTransactions = await getEscrowTransactions(); // Admin sees all
      }
      setTransactions(userTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({ title: "Error", description: "Could not load transaction history.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authUser?.uid && authUser.role) {
      fetchTransactions(authUser.uid, authUser.role);
    } else if (!authLoading && !authUser) {
      setIsLoading(false); // No user, nothing to load
    }
  }, [authUser, authLoading, fetchTransactions]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }
  if (!authUser) {
     return (
        <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">Please log in</h3>
            <p className="mt-1 text-sm text-muted-foreground">Log in to view your transaction history.</p>
             <Button asChild className="mt-6">
                <Link href={`/login?redirect=/dashboard/payments/history`}>Login</Link>
            </Button>
        </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Fetching your transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction History"
        description="View all your past and ongoing payment transactions on Zelo."
        action={
            <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download Statement
            </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Transactions</CardTitle>
          <CardDescription>A log of all payments, fees, and payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Service Request ID</TableHead>
                  <TableHead className="text-right">Amount (₦)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{format(new Date(txn.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium truncate max-w-xs" title={txn.id}>{txn.id.substring(0,8)}...</TableCell>
                    <TableCell className="truncate max-w-xs" title={txn.serviceRequestId}>{txn.serviceRequestId.substring(0,10)}...</TableCell>
                    <TableCell className="text-right font-mono">{txn.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        txn.status === 'funded' ? 'default' :
                        txn.status === 'released_to_artisan' ? 'secondary' : 
                        txn.status === 'disputed' ? 'destructive' :
                        'outline'
                      } className="capitalize">{txn.status.replace(/_/g, ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/payments/escrow?transactionId=${txn.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No transactions yet.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Your payment activities will appear here once you start using Zelo services.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
