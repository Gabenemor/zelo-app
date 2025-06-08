"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Info, DollarSign, Users, Clock } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { EscrowTransaction } from '@/types';
import { format } from 'date-fns';

interface EscrowInfoProps {
  transaction?: EscrowTransaction; // Optional: if displaying a specific transaction
}

export function EscrowInfo({ transaction }: EscrowInfoProps) {
  
  const platformFeePercentage = 10;

  if (transaction) {
    const amountPaidByClient = transaction.amount;
    const feeAmount = transaction.platformFee;
    const amountToArtisan = amountPaidByClient - feeAmount;

    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl">Escrow Transaction Details</CardTitle>
              <CardDescription>ID: {transaction.id}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoItem label="Service Request ID" value={<Link href={`/dashboard/services/requests/${transaction.serviceRequestId}`} className="text-primary underline hover:opacity-80">{transaction.serviceRequestId}</Link>} />
          <InfoItem label="Client ID" value={transaction.clientId} />
          <InfoItem label="Artisan ID" value={transaction.artisanId} />
          <InfoItem label="Status" value={<Badge variant={transaction.status === 'funded' ? 'default' : 'secondary'} className="capitalize">{transaction.status}</Badge>} />
          <SeparatorLine />
          <InfoItem label="Total Amount Funded by Client" value={`₦${amountPaidByClient.toLocaleString()}`} isCurrency />
          <InfoItem label={`Platform Service Fee (${platformFeePercentage}%)`} value={`- ₦${feeAmount.toLocaleString()}`} isCurrency isMuted />
          <InfoItem label="Amount Due to Artisan (upon completion)" value={`₦${amountToArtisan.toLocaleString()}`} isCurrency isBold />
          <SeparatorLine />
          <InfoItem label="Created At" value={format(new Date(transaction.createdAt), "PPP p")} icon={Clock} />
          <InfoItem label="Last Updated" value={format(new Date(transaction.updatedAt), "PPP p")} icon={Clock} />
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            Funds are held securely until the service is marked complete.
          </p>
          {transaction.status === 'funded' && (
             <Button variant="outline" size="sm">Release Funds (Admin/Client Action)</Button>
          )}
          {transaction.status === 'disputed' && (
             <Button variant="destructive" size="sm">Resolve Dispute</Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // General Escrow Information if no specific transaction is passed
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <CardTitle className="font-headline text-xl">Zelo Secure Escrow System</CardTitle>
        </div>
        <CardDescription>How our 10% service fee and secure payment works.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex items-start gap-3 p-3 rounded-md border bg-secondary/30">
          <DollarSign className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h4 className="font-semibold">Client Payment</h4>
            <p className="text-muted-foreground">When a client hires an artisan, the agreed service amount is paid into Zelo's secure escrow account. This ensures the artisan that funds are available.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-md border bg-secondary/30">
          <Users className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h4 className="font-semibold">Service Completion</h4>
            <p className="text-muted-foreground">The artisan completes the service as agreed. The client then confirms satisfactory completion of the job through the Zelo platform.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-md border bg-secondary/30">
          <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
          <div>
            <h4 className="font-semibold">Payment Release & Platform Fee</h4>
            <p className="text-muted-foreground">Once the client confirms completion, Zelo releases the payment to the artisan, after deducting a {platformFeePercentage}% platform service fee. This fee helps us maintain and improve the Zelo platform, provide customer support, and ensure a secure environment for everyone.</p>
            <p className="mt-2 text-xs text-muted-foreground">Example: If service cost is ₦10,000, Zelo fee is ₦1,000. Artisan receives ₦9,000.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Our escrow system is designed to protect both clients and artisans, fostering trust and ensuring fair transactions.
        </p>
      </CardFooter>
    </Card>
  );
}

interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  isCurrency?: boolean;
  isBold?: boolean;
  isMuted?: boolean;
}

const InfoItem = ({ label, value, icon: Icon, isCurrency, isBold, isMuted }: InfoItemProps) => (
  <div className="flex justify-between items-center text-sm">
    <p className="flex items-center gap-2 text-muted-foreground">
      {Icon && <Icon className="h-4 w-4" />}
      {label}:
    </p>
    <p className={`
      ${isCurrency ? 'font-mono' : ''} 
      ${isBold ? 'font-semibold text-foreground' : ''}
      ${isMuted ? 'text-muted-foreground' : 'text-foreground'}
    `}>
      {value}
    </p>
  </div>
);

const SeparatorLine = () => <div className="border-b border-dashed my-2"></div>;

