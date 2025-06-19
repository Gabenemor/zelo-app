
"use client"; 

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Search, SlidersHorizontal, Eye, Download, Loader2 } from "lucide-react";
import type { EscrowTransaction } from "@/types";
import { format } from 'date-fns';
import { getEscrowTransactions } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

const transactionStatusOptions: EscrowTransaction['status'][] = ["funded", "released_to_artisan", "refunded_to_client", "disputed"];

export default function AdminTransactionLogsPage() {
  const [allTransactions, setAllTransactions] = useState<EscrowTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<EscrowTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<EscrowTransaction['status'] | "all">("all");
  const { toast } = useToast();

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const transactionsFromDb = await getEscrowTransactions(); // Fetch all
      setAllTransactions(transactionsFromDb);
      setFilteredTransactions(transactionsFromDb);
    } catch (error) {
      console.error("Error fetching transactions for admin panel:", error);
      toast({ title: "Error", description: "Could not load transactions.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    let tempTransactions = allTransactions;
    if (searchTerm) {
      tempTransactions = tempTransactions.filter(txn =>
        txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.artisanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.serviceRequestId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      tempTransactions = tempTransactions.filter(txn => txn.status === statusFilter);
    }
    setFilteredTransactions(tempTransactions);
  }, [searchTerm, statusFilter, allTransactions]);
  
  const getStatusBadgeColor = (status: EscrowTransaction["status"]) => {
     switch (status) {
      case 'funded': return 'bg-blue-500/20 text-blue-700 border-blue-400';
      case 'released_to_artisan': return 'bg-green-500/20 text-green-700 border-green-400';
      case 'refunded_to_client': return 'bg-orange-500/20 text-orange-700 border-orange-400';
      case 'disputed': return 'bg-red-500/20 text-red-700 border-red-400';
      default: return '';
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
            <PageHeader title="Transaction Log" description="Loading transactions..." />
            <Card><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Transaction Log" description="View a detailed log of all financial transactions on the Zelo platform." action={
            <Button variant="outline" onClick={() => console.log('Live: Exporting CSV...')}>
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Transactions</CardTitle>
          <CardDescription>Search, filter, and review transaction details.</CardDescription>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by ID, user ID, or amount..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as EscrowTransaction['status'] | "all")}>
              <SelectTrigger className="w-full sm:w-[180px]"><SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem>{transactionStatusOptions.map(status => (<SelectItem key={status} value={status} className="capitalize">{status.replace(/_/g, ' ')}</SelectItem>))}</SelectContent>
            </Select>
            {/* <Input type="text" placeholder="Date range (mock)" className="w-full sm:w-[180px]" /> */}
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Transaction ID</TableHead><TableHead>Service Req. ID</TableHead><TableHead>Client ID</TableHead><TableHead>Artisan ID</TableHead><TableHead className="text-right">Amount (₦)</TableHead><TableHead className="text-right">Platform Fee (₦)</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{txn.createdAt ? format(new Date(txn.createdAt), "MMM d, yyyy") : 'N/A'}</TableCell>
                    <TableCell className="font-medium truncate max-w-[100px]" title={txn.id}>{txn.id.substring(0,8)}...</TableCell>
                    <TableCell className="truncate max-w-[100px]" title={txn.serviceRequestId}>{txn.serviceRequestId}</TableCell>
                    <TableCell>{txn.clientId}</TableCell>
                    <TableCell>{txn.artisanId}</TableCell>
                    <TableCell className="text-right font-mono">{txn.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{txn.platformFee.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className={`capitalize ${getStatusBadgeColor(txn.status)}`}>{txn.status.replace(/_/g, ' ')}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="icon" title="View Transaction Details">
                        <Link href={`/dashboard/payments/escrow?transactionId=${txn.id}&role=admin`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="py-12 text-center">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-2 text-lg font-medium text-foreground">No transactions found.</h3>
                <p className="mt-1 text-sm text-muted-foreground">There are currently no transactions matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton component for loading state
const Skeleton = ({ className }: { className: string }) => <div className={`bg-muted animate-pulse rounded ${className}`} />;
