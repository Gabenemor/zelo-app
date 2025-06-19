
'use client'; 

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Briefcase, CalendarDays, Coins, FileText, MapPin, MessageCircle, Users, CreditCard, Trash2, CheckCircle2, CheckSquare, ShieldCheck, Loader2, Edit, AlertTriangle, Send, Award } from "lucide-react"; 
import { Separator } from "@/components/ui/separator";
import type { ServiceRequest, ArtisanProposal, UserRole, AuthUser } from "@/types";
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthContext } from '@/components/providers/auth-provider';
import { ArtisanProposalForm } from '@/components/service-requests/artisan-proposal-form';
import { getProposalsForRequest, getProposalsByArtisan } from '@/actions/proposal-actions'; 
import { 
    handleCancelRequestServerAction, 
    handleMarkJobAsCompleteArtisanServerAction,
    handleClientConfirmCompleteAndReleaseFundsServerAction,
    handleFundEscrowServerAction
} from '@/actions/service-request-detail-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';


const MOCK_ARTISAN_ACTIVE_USER_ID = "artisan_active_user"; 

// Mock data from requests/[id]/page.tsx (original)
const mockServiceRequestDetailSpecific: ServiceRequest = {
  id: "req_detail_123",
  clientId: "client_jane_doe",
  clientName: "Jane Doe", // Added for consistency
  postedBy: { name: "Jane Doe", avatarUrl: "https://placehold.co/80x80.png?text=JD", memberSince: "March 2023", email: "jane.doe@example.com" },
  title: "Professional Catering for Corporate Event (100 Guests)",
  description: "We are seeking a highly skilled and experienced caterer for our annual corporate gala dinner. The event will host approximately 100 executives. We require a three-course meal (appetizer, main course, dessert) with options for vegetarian and gluten-free diets. Service staff, cutlery, and crockery should be included. Please provide sample menus and references if available. The event theme is 'Modern Elegance'.",
  category: "Catering", location: "Eko Hotel & Suites, Victoria Island, Lagos", budget: 750000,
  postedAt: new Date(Date.now() - 86400000 * 7), status: "awarded", assignedArtisanId: "artisan_john_bull", assignedArtisanName: "John Bull Catering",
  attachments: [{ name: "Event_Layout.pdf", url: "#", type: 'document' }, { name: "Sample_Menu_Inspiration.jpg", url: "https://placehold.co/400x300.png?text=Menu+Idea", type: 'image', "data-ai-hint": "event layout" }]
};
const mockServiceRequestInProgressDetailSpecific: ServiceRequest = {
  id: "req_in_progress_456", clientId: "client_jane_doe", clientName: "Jane Doe", // Added
  title: "Garden Landscaping Project", description: "Full garden redesign...", category: "Gardening/Landscaping",
  location: "Banana Island, Lagos", budget: 1200000, postedAt: new Date(Date.now() - 86400000 * 15),
  status: "in_progress", assignedArtisanId: "artisan_musa_ali", assignedArtisanName: "Musa Landscaping",
  postedBy: { name: "Jane Doe", avatarUrl: "https://placehold.co/80x80.png?text=JD" } // Added basic postedBy
};
const mockOpenServiceRequestDetailSpecific: ServiceRequest = {
  id: "req_open_789", clientId: "client_open_job", clientName: "Open Job Client", // Added
  title: "Urgent Website Design Task", description: "Need a landing page designed by next week.", category: "Web Development",
  location: "Remote", budget: 100000, postedAt: new Date(Date.now() - 86400000 * 2), status: "open",
  postedBy: { name: "Open Job Client", avatarUrl: "https://placehold.co/80x80.png?text=OC" } // Added basic postedBy
};

// Mock data from jobs/page.tsx
const mockServiceRequestsFromJobsPage: ServiceRequest[] = [
  { id: "req1", clientId: "client123", clientName: "Client for Faucet", title: "Fix Leaky Kitchen Faucet", description: "My kitchen faucet has been dripping for days, need a plumber to fix it urgently. It's a modern mixer tap.", category: "Plumbing", location: "Ikeja, Lagos", budget: 5000, postedAt: new Date(Date.now() - 86400000 * 2), status: "open", postedBy: {name: "Client for Faucet"} },
  { id: "req2", clientId: "clientABC", clientName: "Client for Party", title: "Catering for Birthday Party (50 guests)", description: "Need catering for a birthday party, Nigerian Jollof, Fried Rice, Chicken, Small Chops required. Event is next month.", category: "Catering", location: "Lekki Phase 1, Lagos", budget: 150000, postedAt: new Date(Date.now() - 86400000 * 5), status: "open", postedBy: {name: "Client for Party"} },
  { id: "req3", clientId: "clientDEF", clientName: "Client for Painting", title: "Repaint Living Room Walls (Urgent)", description: "Living room needs a fresh coat of paint, approx 20sqm. Emulsion paint, light cream color.", category: "Painting", location: "Festac Town, Lagos", postedAt: new Date(Date.now() - 86400000 * 1), status: "open", postedBy: {name: "Client for Painting"} },
  { id: "req4", clientId: "clientXYZ", clientName: "Client for Wardrobe", title: "Custom Wardrobe Design & Build", description: "Looking for a carpenter to design and build a custom wardrobe for master bedroom. Dimensions 2.5m x 3m.", category: "Carpentry", location: "Garki, Abuja", budget: 250000, postedAt: new Date(Date.now() - 86400000 * 10), status: "open", postedBy: {name: "Client for Wardrobe"} },
  { id: "req5", clientId: "clientMNO", clientName: "Client for Wedding Photos", title: "Wedding Photography Full Day Coverage", description: "Need a photographer for a full day wedding event, including pre-ceremony, ceremony, and reception. Deliverables: edited high-res photos.", category: "Photography/Videography", location: "Victoria Island, Lagos", budget: 300000, postedAt: new Date(Date.now() - 86400000 * 15), status: "awarded", assignedArtisanId: "artisan_photo_pro", assignedArtisanName: "PhotoPro Studios", postedBy: {name: "Client for Wedding Photos"} },
];

// Mock data from my-requests/page.tsx (some overlap with jobs page, status might differ)
// For simplicity, the IDs from jobs page cover these scenarios. We ensure all IDs are unique or consolidated.
// This array will combine and deduplicate.
const allMockRequestsMap = new Map<string, ServiceRequest>();

[
    ...mockServiceRequestsFromJobsPage, // Add requests from jobs page first
    mockServiceRequestDetailSpecific,
    mockServiceRequestInProgressDetailSpecific,
    mockOpenServiceRequestDetailSpecific
].forEach(req => {
    if (!allMockRequestsMap.has(req.id)) {
        // Add clientName if only postedBy is present and vice-versa for simpler access
        if (req.postedBy && !req.clientName) req.clientName = req.postedBy.name;
        if (req.clientName && !req.postedBy) req.postedBy = { name: req.clientName };
        allMockRequestsMap.set(req.id, req);
    } else {
        // If ID exists, potentially merge or prioritize (e.g., prefer jobs page status if it's 'open')
        // For now, simple priority to first-seen (which is jobs page then detail page specific)
    }
});

const allMockRequests = Array.from(allMockRequestsMap.values());


function ServiceRequestDetailPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuthContext();
  
  const [request, setRequest] = useState<ServiceRequest | null | undefined>(undefined); 
  const [proposalsForThisRequest, setProposalsForThisRequest] = useState<ArtisanProposal[]>([]);
  const [myProposal, setMyProposal] = useState<ArtisanProposal | null>(null);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);

  const requestId = typeof params.id === 'string' ? params.id : undefined;
  
  const roleFromQuery = searchParams.get('role') as UserRole | undefined;
  const currentUserRole = authUser?.role || roleFromQuery || 'client';
  const currentUserId = authUser?.uid || (currentUserRole === 'artisan' ? MOCK_ARTISAN_ACTIVE_USER_ID : "mock_client_id");

  useEffect(() => {
    async function fetchData() {
      if (!requestId) {
        setRequest(null);
        setIsLoadingPageData(false);
        return;
      }
      setIsLoadingPageData(true);
      try {
        // Find the request from the consolidated mock data
        const foundRequest = allMockRequests.find(r => r.id === requestId);
        setRequest(foundRequest || null);

        if (foundRequest) {
          const allProposals = await getProposalsForRequest(foundRequest.id); 
          setProposalsForThisRequest(allProposals);

          if (currentUserRole === 'artisan' && currentUserId) {
            const artisanSpecificProposals = await getProposalsByArtisan(currentUserId); 
            const specificProposal = artisanSpecificProposals.find(p => p.serviceRequestId === foundRequest.id);
            setMyProposal(specificProposal || null);
          }
        }
      } catch (error) {
        console.error("Error fetching page data:", error);
        toast({title: "Error", description: "Could not load service request details.", variant: "destructive"});
        setRequest(null);
      } finally {
        setIsLoadingPageData(false);
      }
    }
    if (!authLoading) { 
        fetchData();
    }
  }, [requestId, authLoading, currentUserId, currentUserRole, toast]);

  const handleProposalSubmissionSuccess = (newProposal: ArtisanProposal) => {
    setMyProposal(newProposal); 
    setProposalsForThisRequest(prev => [...prev.filter(p => p.artisanId !== newProposal.artisanId), newProposal]);
    toast({ title: "Proposal Submitted!", description: "Your proposal has been sent to the client." });
  };
  
  const handleCancelRequest = async () => {
    if (!request) return;
    const result = await handleCancelRequestServerAction(request.id);
    if (result.success) {
        toast({ title: "Request Cancelled", description: result.message });
        setRequest(prev => prev ? { ...prev, status: 'cancelled' } : null);
    } else {
        toast({ title: "Error", description: result.message || "Could not cancel request.", variant: "destructive" });
    }
  };
  
  const handleArtisanMarkComplete = async () => {
    if (!request || !currentUserId) return;
    const result = await handleMarkJobAsCompleteArtisanServerAction(request.id, currentUserId);
     if (result.success) {
        toast({ title: "Job Marked Complete", description: result.message });
        setRequest(prev => prev ? { ...prev, status: 'completed' } : null); // Simplified status update
    } else {
        toast({ title: "Error", description: result.message || "Could not mark job complete.", variant: "destructive" });
    }
  };
  
  const handleClientConfirmComplete = async () => {
    if (!request || !currentUserId) return;
    const result = await handleClientConfirmCompleteAndReleaseFundsServerAction(request.id, currentUserId);
     if (result.success) {
        toast({ title: "Job Confirmed & Funds Released", description: result.message });
        setRequest(prev => prev ? { ...prev, status: 'completed' } : null);
    } else {
        toast({ title: "Error", description: result.message || "Could not confirm completion.", variant: "destructive" });
    }
  };

  const acceptedClientProposal = (currentUserRole === 'client' && request && request.assignedArtisanId) 
    ? proposalsForThisRequest.find(p => p.status === 'accepted' && p.artisanId === request.assignedArtisanId) 
    : undefined;

  const handleFundEscrow = async () => {
      if (!request || !acceptedClientProposal || !(request.postedBy?.email || request.clientName)) { // Check either for funding
          toast({title: "Error", description: "Cannot initiate payment. Missing critical details.", variant: "destructive"});
          return;
      }
      const clientEmailForPayment = request.postedBy?.email || `${request.clientName?.replace(/\s+/g, '.').toLowerCase()}@example.com`; // Construct a mock email if only name
      
      const result = await handleFundEscrowServerAction(
          request.id, 
          acceptedClientProposal.proposedAmount, 
          clientEmailForPayment, 
          request.title
      );
      if (result.success && result.redirectUrl) {
          toast({title: "Success", description: result.message});
          router.push(result.redirectUrl); 
      } else {
          toast({title: "Payment Error", description: result.message, variant: "destructive"});
      }
  };


  if (authLoading || isLoadingPageData || request === undefined) {
    return <ServiceRequestDetailSkeleton />;
  }

  if (!request) {
    const notFoundTitle = "Service Request Not Found";
    let notFoundDescription = "The requested service could not be located or you do not have permission to view it.";
    let backButtonText = "Go to Dashboard";
    let backButtonLink = `/dashboard?role=${currentUserRole || 'client'}`;

    if (currentUserRole === 'artisan') {
      notFoundDescription = "This job post could not be found. It may have been removed, the link is incorrect, or you may not have the necessary permissions to view it. You cannot apply to this job.";
      backButtonText = "Back to Find Jobs";
      backButtonLink = `/dashboard/jobs?role=artisan`;
    } else if (currentUserRole === 'client') {
      notFoundDescription = "This service request could not be found. It might have been removed or the link is incorrect.";
      backButtonText = "Back to My Requests";
      backButtonLink = `/dashboard/services/my-requests?role=client`;
    }
    
    return (
        <div className="space-y-6 text-center py-10">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <PageHeader title={notFoundTitle} description={notFoundDescription} icon={FileText} />
            <Button asChild variant="outline"><Link href={backButtonLink}>
                {backButtonText}
            </Link></Button>
        </div>
    );
  }

  const isOwnerClient = currentUserRole === 'client' && request.clientId === currentUserId;
  const isAssignedArtisan = currentUserRole === 'artisan' && request.assignedArtisanId === currentUserId;
  

  return (
    <div className="space-y-6">
      <PageHeader
        title={isOwnerClient ? "My Service Request" : "Service Request Details"}
        description={`ID: ${request.id}`}
        icon={FileText}
        action={isOwnerClient && request.status === 'open' && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/services/request/edit/${request.id}?role=${currentUserRole}`}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Request
                </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" >
                    <Trash2 className="mr-2 h-4 w-4" /> Cancel Request
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will cancel your service request. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Request</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelRequest} className="bg-destructive hover:bg-destructive/90">Yes, Cancel</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{request.title}</CardTitle>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Category: <Badge variant="secondary">{request.category}</Badge></span>
                <span>Status: <Badge className="capitalize">{request.status.replace('_', ' ')}</Badge></span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground leading-relaxed whitespace-pre-line">{request.description}</p>
              {request.attachments && request.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-md">Attachments:</h3>
                  <ul className="space-y-2">
                    {request.attachments.map((file, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {file.type === 'image' ?
                           <Image src={file.url} alt={file.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={file['data-ai-hint'] || 'attachment image'} /> :
                           <FileText className="h-6 w-6 text-primary" />
                        }
                        <Link href={file.url} target="_blank" className="text-sm text-primary hover:underline">{file.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isOwnerClient && request.status === 'awarded' && acceptedClientProposal && (
                <Card className="mt-4 bg-primary/5 border-primary/20">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Action: Fund Escrow</CardTitle><CardDescription>Proposal from {request.assignedArtisanName || acceptedClientProposal.artisanName} for ₦{acceptedClientProposal.proposedAmount.toLocaleString()} accepted. Fund escrow to start.</CardDescription></CardHeader>
                  <CardContent><Button onClick={handleFundEscrow} className="w-full sm:w-auto bg-green-600 hover:bg-green-700"><ShieldCheck className="mr-2 h-4 w-4" /> Fund Escrow (₦{acceptedClientProposal.proposedAmount.toLocaleString()})</Button></CardContent>
                </Card>
              )}

              {isOwnerClient && request.status === 'in_progress' && (
                <Card className="mt-4 bg-green-500/10 border-green-500/30">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckSquare className="h-5 w-5 text-green-600" /> Action: Confirm Completion</CardTitle><CardDescription>If service is complete, confirm to release payment.</CardDescription></CardHeader>
                  <CardContent><Button onClick={handleClientConfirmComplete} className="w-full sm:w-auto bg-green-600 hover:bg-green-700"><CheckCircle2 className="mr-2 h-4 w-4" /> Mark Complete & Release Funds</Button></CardContent>
                </Card>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">Posted {formatDistanceToNow(new Date(request.postedAt), { addSuffix: true })}</CardFooter>
          </Card>

          
          {currentUserRole === 'artisan' && (
             <ArtisanInteractionDisplay request={request} currentArtisanId={currentUserId} initialProposals={proposalsForThisRequest} myInitialProposal={myProposal} onMarkComplete={handleArtisanMarkComplete} onProposalSubmitSuccess={handleProposalSubmissionSuccess} />
          )}


          
          {isOwnerClient && request.status === 'open' && proposalsForThisRequest.length > 0 && (
            <Card>
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Proposals Received ({proposalsForThisRequest.length})</CardTitle><CardDescription>Review offers from interested artisans.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    {proposalsForThisRequest.map(proposal => (
                        <Card key={proposal.id} className="bg-secondary/30">
                            <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
                                <Image src={proposal.artisanAvatarUrl || "https://placehold.co/40x40.png?text=AR"} alt={proposal.artisanName} width={40} height={40} className="rounded-full object-cover" data-ai-hint="profile avatar" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <Link href={`/dashboard/artisans/${proposal.artisanId}?role=${currentUserRole}`} className="font-semibold text-primary hover:underline">{proposal.artisanName}</Link>
                                        <div className="text-right"><Badge variant="outline" className="font-mono">₦{proposal.proposedAmount.toLocaleString()}</Badge>
                                            {proposal.status === 'accepted' && <Badge className="mt-1 bg-green-500 text-white">Accepted</Badge>}
                                            {proposal.status === 'pending' && <Badge className="mt-1">Pending</Badge>}
                                            {proposal.status === 'rejected' && <Badge variant="destructive" className="mt-1">Rejected</Badge>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Submitted: {formatDistanceToNow(new Date(proposal.submittedAt), { addSuffix: true })}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm text-foreground line-clamp-3 mb-2">{proposal.coverLetter}</p>
                                <div className="flex gap-2 flex-wrap">
                                    <Button asChild size="sm" variant="outline"><Link href={`/dashboard/messages?role=${currentUserRole}&chatWith=${proposal.artisanId}`}><MessageCircle className="mr-2 h-4 w-4"/> Message</Link></Button>
                                    {request.status === 'open' && proposal.status === 'pending' && (
                                        <Button size="sm" onClick={() => {
                                            console.log(`Client mock: Accepting proposal ${proposal.id} from ${proposal.artisanName}`);
                                            setRequest(prev => prev ? {...prev, status: 'awarded', assignedArtisanId: proposal.artisanId, assignedArtisanName: proposal.artisanName} : null);
                                            setProposalsForThisRequest(prev => prev.map(p => p.id === proposal.id ? {...p, status: 'accepted'} : {...p, status: p.status === 'accepted' ? 'pending' : p.status} ));
                                            toast({title: "Proposal Accepted (Mock)", description: `You've accepted ${proposal.artisanName}'s offer. Please fund escrow.`});
                                        }}>Accept Proposal</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
          )}
          {isOwnerClient && (request.status === 'awarded' || request.status === 'in_progress') && acceptedClientProposal && (
             <Card>
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Award className="h-5 w-5 text-green-600"/> Accepted Proposal</CardTitle></CardHeader>
                <CardContent> 
                    <Card className="bg-green-500/5">
                        <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
                             <Image src={acceptedClientProposal.artisanAvatarUrl || "https://placehold.co/40x40.png?text=AR"} alt={acceptedClientProposal.artisanName} width={40} height={40} className="rounded-full object-cover" data-ai-hint="profile avatar" />
                             <div>
                                <Link href={`/dashboard/artisans/${acceptedClientProposal.artisanId}?role=${currentUserRole}`} className="font-semibold text-primary hover:underline">{request.assignedArtisanName || acceptedClientProposal.artisanName}</Link>
                                <p className="text-xs text-muted-foreground">Accepted on: {format(new Date(acceptedClientProposal.submittedAt), "PPP")}</p>
                             </div>
                             <div className="ml-auto text-right"><Badge variant="default" className="font-mono bg-green-600">₦{acceptedClientProposal.proposedAmount.toLocaleString()}</Badge></div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0"><p className="text-sm text-foreground">{acceptedClientProposal.coverLetter}</p></CardContent>
                         <CardFooter className="p-4 pt-0">
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/dashboard/messages?role=${currentUserRole}&chatWith=${acceptedClientProposal.artisanId}`}>
                                    <MessageCircle className="mr-2 h-4 w-4"/> Message {request.assignedArtisanName || acceptedClientProposal.artisanName}
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </CardContent>
            </Card>
          )}


        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle className="font-headline text-lg">Job Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoItem icon={MapPin} label="Location" value={request.location} />
              <InfoItem icon={Briefcase} label="Category" value={request.category} />
              {request.budget && <InfoItem icon={Coins} label="Client's Budget" value={`₦${request.budget.toLocaleString()}`} />}
              <InfoItem icon={CalendarDays} label="Posted" value={format(new Date(request.postedAt), "PPP")} />
            </CardContent>
          </Card>

          {request.postedBy && (
            <Card>
              <CardHeader><CardTitle className="font-headline text-lg">About the Client</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Image src={request.postedBy.avatarUrl || "https://placehold.co/64x64.png?text=Client"} alt={request.postedBy.name} width={56} height={56} className="rounded-full border object-cover" data-ai-hint="profile avatar"/>
                  <div>
                    <p className="font-semibold text-foreground">{request.postedBy.name}</p>
                    {request.postedBy.memberSince && <p className="text-xs text-muted-foreground">Member since {request.postedBy.memberSince}</p>}
                  </div>
                </div>
                 {currentUserRole === 'artisan' && !isAssignedArtisan && request.status !== 'awarded' && (
                     <Button asChild variant="outline" className="w-full" disabled={!myProposal || myProposal.status !== 'accepted'}>
                        <Link href={`/dashboard/messages?role=${currentUserRole}&chatWith=${request.clientId}`}>
                            <MessageCircle className="mr-2 h-4 w-4" /> Message Client
                        </Link>
                    </Button>
                 )}
                 {isAssignedArtisan && ( 
                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/dashboard/messages?role=${currentUserRole}&chatWith=${request.clientId}`}>
                            <MessageCircle className="mr-2 h-4 w-4" /> Message Client
                        </Link>
                    </Button>
                 )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface ArtisanInteractionDisplayProps {
    request: ServiceRequest;
    currentArtisanId: string;
    initialProposals: ArtisanProposal[]; 
    myInitialProposal: ArtisanProposal | null; 
    onMarkComplete: () => Promise<void>;
    onProposalSubmitSuccess: (proposal: ArtisanProposal) => void;
}

function ArtisanInteractionDisplay({ request, currentArtisanId, myInitialProposal, onMarkComplete, onProposalSubmitSuccess }: ArtisanInteractionDisplayProps) {
    const [myProposalDetails, setMyProposalDetails] = useState<ArtisanProposal | null>(myInitialProposal);
    const { user: authUser } = useAuthContext();

    useEffect(() => { 
        setMyProposalDetails(myInitialProposal);
    }, [myInitialProposal]);
    
    const isJobAwardedToMe = request.status === 'awarded' && request.assignedArtisanId === currentArtisanId;
    const isJobInProgressByMe = request.status === 'in_progress' && request.assignedArtisanId === currentArtisanId;

    const handleInternalSubmitSuccess = (submittedProposal: ArtisanProposal) => {
        setMyProposalDetails(submittedProposal);
        onProposalSubmitSuccess(submittedProposal); 
    };

    if (request.status === 'open') {
        if (myProposalDetails) {
            return (
                <Card>
                    <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Send className="h-5 w-5 text-primary" /> Your Proposal Submitted</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <InfoItem label="Proposed Amount" value={`₦${myProposalDetails.proposedAmount.toLocaleString()}`} icon={Coins} />
                        <InfoItem label="Submitted" value={formatDistanceToNow(new Date(myProposalDetails.submittedAt), { addSuffix: true })} icon={CalendarDays} />
                        <InfoItem label="Status" value={<Badge variant={myProposalDetails.status === 'accepted' ? "default" : myProposalDetails.status === 'rejected' ? "destructive" : "outline"} className="capitalize">{myProposalDetails.status}</Badge>} icon={Briefcase} />
                        <p className="text-sm text-muted-foreground pt-2 border-t mt-3">Cover Letter: <span className="text-foreground whitespace-pre-line">{myProposalDetails.coverLetter}</span></p>
                        {myProposalDetails.portfolioFileNames && myProposalDetails.portfolioFileNames.length > 0 && (
                            <div className="pt-2">
                                <p className="text-sm font-medium text-muted-foreground">Attached portfolio files:</p>
                                <ul className="list-disc list-inside text-sm text-foreground">
                                    {myProposalDetails.portfolioFileNames.map(name => <li key={name}>{name}</li>)}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            );
        }
        const artisanIdForForm = authUser?.uid || currentArtisanId; 
        return (
            <Card>
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Send className="h-5 w-5 text-primary"/> Submit Your Proposal</CardTitle><CardDescription>Let the client know why you're the best fit.</CardDescription></CardHeader>
                <CardContent>
                    <ArtisanProposalForm
                        serviceRequestId={request.id}
                        currentBudget={request.budget}
                        onSubmitSuccess={handleInternalSubmitSuccess}
                    />
                </CardContent>
            </Card>
        );
    }

    if (isJobAwardedToMe) {
         return (
            <Card className="bg-green-500/10 border-green-500/30">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5 text-green-600" /> Congratulations!</CardTitle><CardDescription>This job has been awarded to you. Please coordinate with the client to start the work. You can begin once the client funds the escrow.</CardDescription></CardHeader>
            </Card>
        );
    }
    
    if (isJobInProgressByMe) {
        return (
            <Card className="bg-yellow-500/10 border-yellow-500/30">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Briefcase className="h-5 w-5 text-yellow-600" /> Job In Progress</CardTitle><CardDescription>Once you've completed the service, mark it as complete to notify the client.</CardDescription></CardHeader>
                <CardContent>
                    <Button onClick={onMarkComplete} className="w-full sm:w-auto bg-green-600 hover:bg-green-700"><CheckCircle2 className="mr-2 h-4 w-4" /> Mark Job as Complete</Button>
                </CardContent>
            </Card>
        );
    }
    
     if (request.status === 'awarded' && request.assignedArtisanId && request.assignedArtisanId !== currentArtisanId) {
        return <Card><CardContent className="p-4 text-sm text-muted-foreground">This job has been awarded to another artisan.</CardContent></Card>;
    }
    
    if (request.status === 'completed' && isAssignedArtisan) {
        return <Card><CardContent className="p-4 text-sm text-green-600 font-medium">This job was completed by you.</CardContent></Card>;
    }
    if (request.status === 'cancelled') {
         return <Card><CardContent className="p-4 text-sm text-destructive">This service request has been cancelled by the client.</CardContent></Card>;
    }


    return null; 
}


interface InfoItemProps { icon: React.ElementType; label: string; value: React.ReactNode; }
function InfoItem({ icon: Icon, label, value}: InfoItemProps) {
    return (
        <div className="flex items-start"><Icon className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 shrink-0" /><div><span className="font-medium text-foreground">{value}</span><p className="text-xs text-muted-foreground">{label}</p></div></div>
    )
}

function ServiceRequestDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeader title="Loading Service Request..." description="Please wait..." icon={Loader2} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card><CardHeader><Skeleton className="h-8 w-3/4 bg-muted" /><Skeleton className="h-5 w-1/2 bg-muted mt-2" /></CardHeader><CardContent><Skeleton className="h-24 w-full bg-muted" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-7 w-1/2 bg-muted" /></CardHeader><CardContent><Skeleton className="h-40 w-full bg-muted" /></CardContent></Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card><CardHeader><Skeleton className="h-6 w-2/3 bg-muted" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-4 w-full bg-muted" /><Skeleton className="h-4 w-full bg-muted" /><Skeleton className="h-4 w-5/6 bg-muted" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-2/3 bg-muted" /></CardHeader><CardContent className="flex items-center gap-3"><Skeleton className="h-14 w-14 rounded-full bg-muted" /><div className="space-y-1 flex-1"><Skeleton className="h-5 w-3/4 bg-muted" /><Skeleton className="h-4 w-1/2 bg-muted" /></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}


export default function ServiceRequestDetailPageWrapper() {
  return (
    <Suspense fallback={<ServiceRequestDetailSkeleton />}>
      <ServiceRequestDetailPageContent />
    </Suspense>
  );
}

