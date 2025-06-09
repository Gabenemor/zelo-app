
"use client";

import React from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestCard } from "@/components/service-requests/service-request-card";
import { Briefcase, Search, Send, CheckCircle, XCircle } from "lucide-react";
import type { ServiceRequest, ArtisanProposal } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface ArtisanJob extends ServiceRequest {
  proposalStatus?: ArtisanProposal['status'];
  proposedAmount?: number;
}

const mockArtisanProposals: ArtisanJob[] = [
  { 
    id: "req4", clientId: "clientXYZ", title: "Custom Wardrobe Design & Build", 
    description: "Looking for a carpenter to design and build a custom wardrobe for master bedroom.", 
    category: "Carpentry", location: "Garki, Abuja", budget: 250000, 
    postedAt: new Date(Date.now() - 86400000 * 3), status: "open", // Still open, artisan has bid
    proposalStatus: "pending", proposedAmount: 240000 
  },
  { 
    id: "req_detail_123", clientId: "client_jane_doe", title: "Professional Catering for Corporate Event (100 Guests)",
    description: "Seeking caterer for annual corporate gala. Three-course meal, vegetarian/gluten-free options.",
    category: "Catering", location: "Eko Hotel & Suites, VI, Lagos", budget: 750000,
    postedAt: new Date(Date.now() - 86400000 * 7), status: "awarded", // Client accepted this artisan's bid
    assignedArtisanId: "currentArtisanId", // Assuming current artisan
    proposalStatus: "accepted", proposedAmount: 720000
  },
   { 
    id: "req_paint_job", clientId: "client_painter", title: "Interior House Painting", 
    description: "Need 3 rooms painted in a new apartment.", 
    category: "Painting", location: "Yaba, Lagos", budget: 60000, 
    postedAt: new Date(Date.now() - 86400000 * 4), status: "open",
    proposalStatus: "declined", proposedAmount: 55000
  },
];

const mockArtisanActiveJobs: ArtisanJob[] = [
  { 
    id: "req2", clientId: "clientABC", title: "Catering for Birthday Party (50 guests)", 
    description: "Need catering for a birthday party...", category: "Catering", 
    location: "Lekki Phase 1, Lagos", budget: 150000, 
    postedAt: new Date(Date.now() - 86400000 * 5), status: "in_progress", 
    assignedArtisanId: "currentArtisanId", proposalStatus: "accepted", proposedAmount: 145000
  },
];

const mockArtisanCompletedJobs: ArtisanJob[] = [
  { 
    id: "req5", clientId: "clientDEF", title: "Website for Small Business", 
    description: "Need a simple 5-page website for my new bakery.", category: "Web Development", 
    location: "Online/Remote", postedAt: new Date(Date.now() - 86400000 * 12), 
    status: "completed", assignedArtisanId: "currentArtisanId", 
    proposalStatus: "accepted", proposedAmount: 120000
  },
];

export default function MyJobsAndProposalsPage() {
  // In a real app, filter these based on the logged-in artisan's ID and proposal/job status
  const proposalsSent = mockArtisanProposals;
  const activeJobs = mockArtisanActiveJobs;
  const completedJobs = mockArtisanCompletedJobs;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Jobs & Proposals"
        description="Manage your bids, active jobs, and completed work on Zelo."
        icon={Briefcase}
        action={
            <Button asChild variant="outline">
                <Link href="/dashboard/jobs">
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
                <ProposalCard key={job.id} job={job} />
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
                <ServiceRequestCard key={job.id} request={job} />
              ))}
            </div>
          ) : (
             <EmptyStateTab title="No active jobs." message="Once a client accepts your proposal, the job will appear here." />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedJobs.map(job => (
                <ServiceRequestCard key={job.id} request={job} />
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

function ProposalCard({ job }: { job: ArtisanJob }) {
    const getStatusBadge = (status?: ArtisanProposal['status']) => {
        switch (status) {
            case 'pending': return <Badge variant="outline">Pending Client Review</Badge>;
            case 'accepted': return <Badge className="bg-green-500 text-primary-foreground">Accepted</Badge>;
            case 'declined': return <Badge variant="destructive">Declined by Client</Badge>;
            default: return <Badge variant="secondary">Submitted</Badge>;
        }
    };

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
                        <span className="font-semibold text-foreground">₦{job.proposedAmount?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Client Budget:</span>
                        <span className="font-semibold text-foreground">₦{job.budget?.toLocaleString() || 'N/A'}</span>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Proposal Status:</span>
                        {getStatusBadge(job.proposalStatus)}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div>
                    Job Posted: {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
                </div>
                <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/services/requests/${job.id}`}>
                        <Search className="mr-2 h-3 w-3" /> View Job
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
