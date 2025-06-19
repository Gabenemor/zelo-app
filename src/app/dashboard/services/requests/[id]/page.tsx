
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
import type { ServiceRequest, ArtisanProposal, UserRole, AuthUser, ClientProfile } from "@/types";
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
} from "@/components/ui/alert-dialog";
import { useAuthContext } from '@/components/providers/auth-provider';
import { ArtisanProposalForm } from '@/components/service-requests/artisan-proposal-form';
import { getProposalsForRequest, getProposalsByArtisan, acceptArtisanProposal } from '@/actions/proposal-actions'; 
import { 
    handleCancelRequestServerAction, 
    handleMarkJobAsCompleteArtisanServerAction,
    handleClientConfirmCompleteAndReleaseFundsServerAction,
    handleFundEscrowServerAction
} from '@/actions/service-request-detail-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getServiceRequest as fetchServiceRequestFromDb, getClientProfile } from '@/lib/firestore';


function ServiceRequestDetailPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user: authUser, loading: authLoading } = useAuthContext();
  
  const [request, setRequest] = useState<ServiceRequest | null | undefined>(undefined); 
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [proposalsForThisRequest, setProposalsForThisRequest] = useState<ArtisanProposal[]>([]);
  const [myProposal, setMyProposal] = useState<ArtisanProposal | null>(null);
  const [isLoadingPageData, setIsLoadingPageData] = useState(true);

  const requestId = typeof params.id === 'string' ? params.id : undefined;
  
  const roleFromQuery = searchParams.get('role') as UserRole | undefined;
  const currentUserRole = authUser?.role || roleFromQuery || 'client';
  const currentUserId = authUser?.uid;

  const fetchData = useCallback(async () => {
    if (!requestId) {
      setRequest(null);
      setIsLoadingPageData(false);
      return;
    }
    setIsLoadingPageData(true);
    try {
      const foundRequest = await fetchServiceRequestFromDb(requestId);
      setRequest(foundRequest || null);

      if (foundRequest) {
        const clientData = await getClientProfile(foundRequest.clientId);
        setClientProfile(clientData);
        
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
  }, [requestId, currentUserRole, currentUserId, toast]);

  useEffect(() => {
    if (!authLoading) { 
        fetchData();
    }
  }, [authLoading, fetchData]);

  const handleProposalSubmissionSuccess = (newProposal: ArtisanProposal) => {
    setMyProposal(newProposal); 
    setProposalsForThisRequest(prev => [...prev.filter(p => p.artisanId !== newProposal.artisanId), newProposal]);
    toast({ title: "Proposal Submitted!", description: "Your proposal has been sent to the client." });
    fetchData(); 
  };
  
  const handleCancelRequest = async () => {
    if (!request) return;
    const result = await handleCancelRequestServerAction(request.id);
    if (result.success) {
        toast({ title: "Request Cancelled", description: result.message });
        fetchData();
    } else {
        toast({ title: "Error", description: result.message || "Could not cancel request.", variant: "destructive" });
    }
  };
  
  const handleArtisanMarkComplete = async () => {
    if (!request || !currentUserId) return;
    const result = await handleMarkJobAsCompleteArtisanServerAction(request.id, currentUserId);
     if (result.success) {
        toast({ title: "Job Marked Complete", description: result.message });
        fetchData();
    } else {
        toast({ title: "Error", description: result.message || "Could not mark job complete.", variant: "destructive" });
    }
  };
  
  const handleClientConfirmComplete = async () => {
    if (!request || !currentUserId) return;
    const result = await handleClientConfirmCompleteAndReleaseFundsServerAction(request.id, currentUserId);
     if (result.success) {
        toast({ title: "Job Confirmed & Funds Released", description: result.message });
        fetchData();
    } else {
        toast({ title: "Error", description: result.message || "Could not confirm completion.", variant: "destructive" });
    }
  };

  const handleAcceptProposal = async (proposal: ArtisanProposal) => {
    if (!request) return;
    const result = await acceptArtisanProposal(proposal.id, request.id, proposal.artisanId, proposal.artisanName);
    if (result.success) {
      toast({ title: "Proposal Accepted!", description: `You've accepted ${proposal.artisanName}'s offer. Please fund escrow.` });
      fetchData(); 
    } else {
      toast({ title: "Error", description: result.error || "Failed to accept proposal.", variant: "destructive" });
    }
  };

  const acceptedClientProposal = (currentUserRole === 'client' && request && request.assignedArtisanId) 
    ? proposalsForThisRequest.find(p => p.status === 'accepted' && p.artisanId === request.assignedArtisanId) 
    : undefined;

  const handleFundEscrow = async () => {
      if (!request || !acceptedClientProposal || !(clientProfile?.contactEmail || clientProfile?.fullName)) {
          toast({title: "Error", description: "Cannot initiate payment. Missing critical client details for payment.", variant: "destructive"});
          return;
      }
      const clientEmailForPayment = clientProfile.contactEmail || `${clientProfile.fullName?.replace(/\s+/g, '.').toLowerCase()}@example.com`; 
      
      const result = await handleFundEscrowServerAction(
          request.id, 
          acceptedClientProposal.proposedAmount, 
          clientEmailForPayment, 
          request.title
      );
      if (result.success && result.redirectUrl) {
          toast({title: "Success", description: result.message});
          const redirectBase = typeof window !== "undefined" ? window.location.origin : "";
          const finalRedirectUrl = result.redirectUrl.startsWith("http") ? result.redirectUrl : `${redirectBase}${result.redirectUrl}`;
          router.push(finalRedirectUrl); 
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
            <PageHeader title={notFoundTitle} description={notFoundDescription} />
            <Button asChild variant="outline"><Link href={backButtonLink}>
                {backButtonText}
            </Link></Button>
        </div>
    );
  }

  const isOwnerClient = currentUserRole === 'client' && request.clientId === currentUserId;
  const isAssignedArtisan = currentUserRole === 'artisan' && request.assignedArtisanId === currentUserId;
  
  const requestClientDetails = request.postedBy || { 
    name: clientProfile?.fullName || "Client", 
    avatarUrl: clientProfile?.avatarUrl,
    memberSince: clientProfile?.createdAt ? format(new Date(clientProfile.createdAt), "MMMM yyyy") : undefined,
    email: clientProfile?.contactEmail
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title={isOwnerClient ? "My Service Request" : "Service Request Details"}
        description={`ID: ${request.id}`}
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

              {isOwnerClient && request.status === 'awarded' && acceptedClientProposal && !request.escrowFunded && ( 
                <Card className="mt-4 bg-primary/5 border-primary/20">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Action: Fund Escrow</CardTitle><CardDescription>Proposal from {request.assignedArtisanName || acceptedClientProposal.artisanName} for ₦{acceptedClientProposal.proposedAmount.toLocaleString()} accepted. Fund escrow to start.</CardDescription></CardHeader>
                  <CardContent><Button onClick={handleFundEscrow} className="w-full sm:w-auto bg-green-600 hover:bg-green-700"><ShieldCheck className="mr-2 h-4 w-4" /> Fund Escrow (₦{acceptedClientProposal.proposedAmount.toLocaleString()})</Button></CardContent>
                </Card>
              )}
               {isOwnerClient && request.status === 'awarded' && acceptedClientProposal && request.escrowFunded && ( 
                <Card className="mt-4 bg-green-500/10 border-green-500/30">
                  <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-600" /> Escrow Funded</CardTitle><CardDescription>Escrow of ₦{acceptedClientProposal.proposedAmount.toLocaleString()} for {request.assignedArtisanName || acceptedClientProposal.artisanName} is funded. Work can begin.</CardDescription></CardHeader>
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

          
          {currentUserRole === 'artisan' && currentUserId && (
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
                                        <Button size="sm" onClick={() => handleAcceptProposal(proposal)}>Accept Proposal</Button>
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
                                <p className="text-xs text-muted-foreground">Accepted on: {format(new Date(acceptedClientProposal.submittedAt), "PPP")}</p> {}
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

          {requestClientDetails && (
            <Card>
              <CardHeader><CardTitle className="font-headline text-lg">About the Client</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Image src={requestClientDetails.avatarUrl || "https://placehold.co/64x64.png?text=Client"} alt={requestClientDetails.name} width={56} height={56} className="rounded-full border object-cover" data-ai-hint="profile avatar"/>
                  <div>
                    <p className="font-semibold text-foreground">{requestClientDetails.name}</p>
                    {requestClientDetails.memberSince && <p className="text-xs text-muted-foreground">Member since {requestClientDetails.memberSince}</p>}
                  </div>
                </div>
                 {currentUserRole === 'artisan' && !isAssignedArtisan && request.status !== 'awarded' && request.status !== 'completed' && request.status !== 'cancelled' && ( 
                     <Button asChild variant="outline" className="w-full">
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
                        <InfoItem label="Status" value={<Badge variant={myProposalDetails.status === 'accepted' ? "default" : myProposalDetails.status === 'rejected' || myProposalDetails.status === 'withdrawn' ? "destructive" : "outline"} className="capitalize">{myProposalDetails.status}</Badge>} icon={Briefcase} />
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
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5 text-green-600" /> Congratulations!</CardTitle><CardDescription>This job has been awarded to you. Coordinate with the client. Work can begin once escrow is funded (if applicable).</CardDescription></CardHeader>
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
        return <Card><CardContent className="p-4 text-sm text-green-600 font-medium">You completed this job.</CardContent></Card>;
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
      <div className="mb-6 flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="space-y-1">
          <Skeleton className="h-8 w-3/4 bg-muted" />
          <Skeleton className="h-5 w-1/2 bg-muted" />
        </div>
        <Skeleton className="h-10 w-32 bg-muted" />
      </div>
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
