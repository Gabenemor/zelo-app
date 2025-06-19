
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestCard } from "@/components/service-requests/service-request-card";
import { Briefcase, Search, Send, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { ServiceRequest, ArtisanProposal, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useAuthContext } from '@/components/providers/auth-provider';
import { getProposalsByArtisan } from '@/actions/proposal-actions';
import { getServiceRequest, getServiceRequests } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';


interface ArtisanJobWithProposal extends ServiceRequest {
  proposalDetails?: ArtisanProposal; // Entire proposal object
}

export default function MyJobsAndProposalsPage() {
  const { user: authUser, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const [proposalsSent, setProposalsSent] = useState<ArtisanJobWithProposal[]>([]);
  const [activeJobs, setActiveJobs] = useState<ArtisanJobWithProposal[]>([]);
  const [completedJobs, setCompletedJobs] = useState<ArtisanJobWithProposal[]>([]);
  
  const currentUserRole: UserRole = "artisan";

  const fetchData = useCallback(async (artisanId: string) => {
    setIsLoading(true);
    try {
      const userProposals = await getProposalsByArtisan(artisanId);
      const serviceRequestIds = Array.from(new Set(userProposals.map(p => p.serviceRequestId)));
      
      const serviceRequestDetailsPromises = serviceRequestIds.map(id => getServiceRequest(id));
      const serviceRequestDetailsArray = (await Promise.all(serviceRequestDetailsPromises)).filter(Boolean) as ServiceRequest[];
      const serviceRequestsMap = new Map(serviceRequestDetailsArray.map(sr => [sr.id, sr]));

      const jobsWithProposals: ArtisanJobWithProposal[] = userProposals.map(proposal => {
        const serviceRequest = serviceRequestsMap.get(proposal.serviceRequestId);
        return serviceRequest ? { ...serviceRequest, proposalDetails: proposal } : null;
      }).filter(Boolean) as ArtisanJobWithProposal[];

      // Now, categorize them
      const sent: ArtisanJobWithProposal[] = [];
      const active: ArtisanJobWithProposal[] = [];
      const completed: ArtisanJobWithProposal[] = [];

      for (const job of jobsWithProposals) {
        if (job.status === 'completed' && job.assignedArtisanId === artisanId) {
          completed.push(job);
        } else if ((job.status === 'in_progress' || job.status === 'awarded') && job.assignedArtisanId === artisanId) {
          active.push(job);
        } else if (job.proposalDetails?.status && job.status === 'open') { // Only show proposals for open jobs
          sent.push(job);
        }
      }
      
      // Also fetch jobs directly assigned to artisan but for which they might not have a "proposal" (e.g. admin assigned)
      // This might overlap with above logic, ensure no duplicates if that's the case.
      const directlyAssignedJobs = await getServiceRequests({ artisanId, status: ['in_progress', 'awarded'] });
      directlyAssignedJobs.forEach(job => {
        if (!active.find(aj => aj.id === job.id) && !completed.find(cj => cj.id === job.id)) {
          active.push(job); // Add to active if not already there
        }
      });
      const directlyCompletedJobs = await getServiceRequests({ artisanId, status: 'completed' });
       directlyCompletedJobs.forEach(job => {
        if (!completed.find(cj => cj.id === job.id)) {
          completed.push(job); 
        }
      });


      setProposalsSent(sent.sort((a,b) => new Date(b.proposalDetails!.submittedAt).getTime() - new Date(a.proposalDetails!.submittedAt).getTime() ));
      setActiveJobs(active.sort((a,b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime() ));
      setCompletedJobs(completed.sort((a,b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime() ));

    } catch (error) {
      console.error("Error fetching artisan's jobs and proposals:", error);
      toast({ title: "Error", description: "Could not load your jobs and proposals.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authUser?.uid && authUser.role === 'artisan') {
      fetchData(authUser.uid);
    } else if (!authLoading && authUser?.role !== 'artisan') {
      setIsLoading(false); // Not an artisan or no authUser
    }
  }, [authUser, authLoading, fetchData]);

  if (authLoading || (!authUser && !authLoading)) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading user data...</p>
        </div>
    );
  }
  
  if (!authUser || authUser.role !== 'artisan') {
     return (
        <div className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">Access Denied</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                This page is for artisans. Please log in as an artisan.
            </p>
             <Button asChild className="mt-6">
                <Link href={`/login?redirect=/dashboard/services/my-offers`}>Login as Artisan</Link>
            </Button>
        </div>
     );
  }

  if (isLoading) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Fetching your jobs and proposals...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Jobs & Proposals"
        description="Manage your bids, active jobs, and completed work on Zelo."
        action={
            <Button asChild variant="outline">
                <Link href={`/dashboard/jobs?role=${currentUserRole}`}>
                    <Search className="mr-2 h-4 w-4" /> Find New Jobs
                </Link>
            </Button>
        }
      />

      <Tabs defaultValue="proposals" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
          <TabsTrigger value="proposals">Proposals ({proposalsSent.length})</TabsTrigger>
          <TabsTrigger value="active">Active Jobs ({activeJobs.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedJobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="mt-6">
          {proposalsSent.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {proposalsSent.map(job => (
                <ProposalCard key={job.id} job={job} currentUserRole={currentUserRole} />
              ))}
            </div>
          ) : (
            <EmptyStateTab title="No proposals sent yet." message="Find jobs and submit proposals to get started." />
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {activeJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeJobs.map(job => (
                <ServiceRequestCard key={job.id} request={job} currentUserRole={currentUserRole} applicationStatus={job.proposalDetails?.status || 'accepted'} />
              ))}
            </div>
          ) : (
             <EmptyStateTab title="No active jobs." message="Once a client accepts your proposal and funds escrow, the job will appear here." />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedJobs.map(job => (
                <ServiceRequestCard key={job.id} request={job} currentUserRole={currentUserRole} applicationStatus="accepted" />
              ))}
            </div>
          ) : (
            <EmptyStateTab title="No completed jobs yet." message="Your finished projects will be listed here." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProposalCard({ job, currentUserRole }: { job: ArtisanJobWithProposal, currentUserRole: UserRole }) {
    const getStatusBadge = (status?: ArtisanProposal['status']) => {
        if (!status) return <Badge variant="secondary">Unknown Status</Badge>;
        switch (status) {
            case 'pending': return <Badge variant="outline">Pending Client Review</Badge>;
            case 'accepted': return <Badge className="bg-green-500 text-primary-foreground">Accepted</Badge>;
            case 'rejected': return <Badge variant="destructive">Declined by Client</Badge>;
            case 'withdrawn': return <Badge variant="destructive">Withdrawn</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const detailLink = `/dashboard/services/requests/${job.id}?role=${currentUserRole}`;

    return (
        <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-md">
            <CardHeader>
                <CardTitle className="font-headline text-lg line-clamp-2">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                    <Briefcase className="h-3 w-3" /> {job.category}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3 text-sm">
                <p className="line-clamp-3 text-muted-foreground">{job.description}</p>
                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Your Bid:</span>
                        <span className="font-semibold text-foreground">₦{job.proposalDetails?.proposedAmount?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Client Budget:</span>
                        <span className="font-semibold text-foreground">₦{job.budget?.toLocaleString() || 'N/A'}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Proposal Status:</span>
                        {getStatusBadge(job.proposalDetails?.status)}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div>
                    Job Posted: {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                </div>
                <Button asChild size="sm" variant="outline">
                    <Link href={detailLink}>
                        <Search className="mr-2 h-3 w-3" /> View Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

function EmptyStateTab({ title, message }: { title: string; message: string; }) {
    return (
        <div className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
    );
}
