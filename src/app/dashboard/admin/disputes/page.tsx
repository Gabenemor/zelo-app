
"use client";

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Search, SlidersHorizontal, Eye, MessageSquare } from "lucide-react";
import type { DisputeItem } from "@/types";
import { format } from 'date-fns';

// Mock dispute data
const mockDisputes: DisputeItem[] = [
  { id: "disp_001", serviceRequestId: "job_005", jobTitle: "Fashion Design for Wedding", clientName: "Musa Ibrahim", artisanName: "Fatima Stitches", reason: "Item not as described, poor quality stitching.", status: "open", createdAt: new Date(2024, 5, 10), lastUpdatedAt: new Date(2024, 5, 11) },
  { id: "disp_002", serviceRequestId: "job_007", jobTitle: "AC Repair not working", clientName: "Aisha Bello", artisanName: "Cool Breeze Repairs", reason: "AC unit stopped working 2 days after repair.", status: "reviewing", createdAt: new Date(2024, 5, 1), lastUpdatedAt: new Date(2024, 5, 5) },
  { id: "disp_003", serviceRequestId: "job_009", jobTitle: "Incomplete Catering Service", clientName: "David Okoro", artisanName: "Chioma's Exquisite Catering", reason: "Not all agreed menu items were provided.", status: "resolved_client", createdAt: new Date(2024, 4, 20), lastUpdatedAt: new Date(2024, 4, 28) },
];

const disputeStatusOptions: DisputeItem['status'][] = ["open", "reviewing", "resolved_client", "resolved_artisan", "resolved_compromise"];

export default function AdminDisputeCenterPage() {
  const disputes = mockDisputes;

  const getStatusBadgeColor = (status: DisputeItem["status"]) => {
     switch (status) {
      case 'open': return 'bg-red-500/20 text-red-700 border-red-400'; // High priority
      case 'reviewing': return 'bg-yellow-500/20 text-yellow-700 border-yellow-400';
      case 'resolved_client':
      case 'resolved_artisan':
      case 'resolved_compromise':
        return 'bg-green-500/20 text-green-700 border-green-400';
      default: return '';
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dispute Resolution Center"
        description="Mediate and resolve disputes between clients and artisans."
        icon={ShieldAlert}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Active & Recent Disputes</CardTitle>
          <CardDescription>Review cases and facilitate resolutions.</CardDescription>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by ID, user names, or job title..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                 {disputeStatusOptions.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">{status.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {disputes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute ID</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Artisan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reported On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((dispute) => (
                  <TableRow key={dispute.id}>
                    <TableCell className="font-medium">{dispute.id}</TableCell>
                    <TableCell className="max-w-xs truncate" title={dispute.jobTitle}>{dispute.jobTitle}</TableCell>
                    <TableCell>{dispute.clientName}</TableCell>
                    <TableCell>{dispute.artisanName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${getStatusBadgeColor(dispute.status)}`}>
                        {dispute.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(dispute.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button asChild variant="ghost" size="icon" title="View Dispute Details">
                        {/* Link to a future detailed dispute page: /dashboard/admin/disputes/[disputeId] */}
                        <Link href={`/dashboard/services/requests/${dispute.serviceRequestId}?role=admin&disputeId=${dispute.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                       <Button variant="ghost" size="icon" title="View Chat History (Mock)" onClick={() => console.log(`Mock: Open chat for dispute ${dispute.id}`)}>
                          <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="py-12 text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No disputes found.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    There are currently no disputes matching your filters.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
