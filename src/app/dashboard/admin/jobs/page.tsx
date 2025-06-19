
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
import { Briefcase, Search, SlidersHorizontal, Eye, Trash2, Loader2 } from "lucide-react";
import type { ServiceRequest } from "@/types";
import { format } from 'date-fns';
import { getServiceRequests, updateServiceRequest } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';

const jobStatusOptions: ServiceRequest['status'][] = ["open", "awarded", "in_progress", "completed", "cancelled", "disputed"];

export default function AdminJobManagementPage() {
  const [allJobs, setAllJobs] = useState<ServiceRequest[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceRequest['status'] | "all">("all");
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const jobsFromDb = await getServiceRequests({orderByField: 'createdAt'}); 
      setAllJobs(jobsFromDb);
      setFilteredJobs(jobsFromDb);
    } catch (error) {
      console.error("Error fetching jobs for admin panel:", error);
      toast({ title: "Error", description: "Could not load jobs.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    let tempJobs = allJobs;
    if (searchTerm) {
      tempJobs = tempJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        (job.assignedArtisanName?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        job.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      tempJobs = tempJobs.filter(job => job.status === statusFilter);
    }
    setFilteredJobs(tempJobs);
  }, [searchTerm, statusFilter, allJobs]);

  const handleRemoveJob = async (jobId: string) => {
    console.log(`Admin: Flagging job ${jobId} for review/removal.`);
    try {
        await updateServiceRequest(jobId, { status: 'cancelled', adminNotes: 'Removed by admin action.' } as any);
        toast({ title: "Job Cancelled", description: `Job ${jobId} has been cancelled.` });
        fetchJobs(); 
    } catch (error) {
        toast({ title: "Error", description: "Could not cancel job.", variant: "destructive" });
    }
  };

  const getStatusBadgeVariant = (status: ServiceRequest["status"]) => {
      switch (status) {
        case 'open': return 'default';
        case 'awarded': return 'secondary';
        case 'in_progress': return 'secondary';
        case 'completed': return 'default'; 
        case 'cancelled': return 'destructive';
        case 'disputed': return 'destructive';
        default: return 'outline';
    }
  };
  const getStatusBadgeColor = (status: ServiceRequest["status"]) => {
     switch (status) {
        case 'open': return 'bg-blue-500/20 text-blue-700 border-blue-400';
        case 'awarded': return 'bg-purple-500/20 text-purple-700 border-purple-400';
        case 'in_progress': return 'bg-yellow-500/20 text-yellow-700 border-yellow-400';
        case 'completed': return 'bg-green-500/20 text-green-700 border-green-400';
        case 'cancelled': return 'bg-gray-500/20 text-gray-700 border-gray-400';
        case 'disputed': return 'bg-red-500/20 text-red-700 border-red-400';
        default: return '';
    }
  };


  if (isLoading) {
    return (
        <div className="space-y-6">
            <PageHeader title="Job Management" description="Loading jobs..." />
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
      <PageHeader title="Job Management" description="Oversee all service requests (jobs) posted on the Zelo platform." />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Platform Jobs</CardTitle>
          <CardDescription>Search, filter, and manage job postings.</CardDescription>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by title, client, artisan, or ID..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ServiceRequest['status'] | "all")}>
              <SelectTrigger className="w-full sm:w-[180px]"><SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem>{jobStatusOptions.map(status => (<SelectItem key={status} value={status} className="capitalize">{status.replace('_', ' ')}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredJobs.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Job Title</TableHead><TableHead>Client</TableHead><TableHead>Artisan</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Posted</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={job.title}>{job.title}</TableCell>
                    <TableCell>{job.clientName || job.clientId}</TableCell>
                    <TableCell>{job.assignedArtisanName || job.assignedArtisanId || 'N/A'}</TableCell>
                    <TableCell>{job.category}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(job.status)} className={`capitalize ${getStatusBadgeColor(job.status)}`}>{job.status.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>{job.postedAt ? format(new Date(job.postedAt), "MMM d, yyyy") : 'N/A'}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button asChild variant="ghost" size="icon" title="View Job Details"><Link href={`/dashboard/services/requests/${job.id}?role=admin`}><Eye className="h-4 w-4" /></Link></Button>
                      <Button variant="ghost" size="icon" title="Remove Job (Policy Violation)" onClick={() => handleRemoveJob(job.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="py-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" /><h3 className="mt-2 text-lg font-medium text-foreground">No jobs found.</h3>
                <p className="mt-1 text-sm text-muted-foreground">There are currently no job postings matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const Skeleton = ({ className }: { className: string }) => <div className={`bg-muted animate-pulse rounded ${className}`} />;
