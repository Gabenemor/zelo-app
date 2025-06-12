
'use server';

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Briefcase, CalendarDays, Coins, FileText, MapPin, MessageCircle, Send, UserCircle, Edit, Users, CreditCard, Trash2, CheckCircle2, CheckSquare, ShieldCheck } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { ServiceRequest, ArtisanProposal, UserRole } from "@/types";
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

// Mock data for a single service request
const mockServiceRequest: ServiceRequest = {
  id: "req_detail_123",
  clientId: "client_jane_doe",
  postedBy: {
    name: "Jane Doe",
    avatarUrl: "https://placehold.co/80x80.png?text=JD",
    memberSince: "March 2023",
    email: "jane.doe@example.com",
  },
  title: "Professional Catering for Corporate Event (100 Guests)",
  description: "We are seeking a highly skilled and experienced caterer for our annual corporate gala dinner. The event will host approximately 100 executives. We require a three-course meal (appetizer, main course, dessert) with options for vegetarian and gluten-free diets. Service staff, cutlery, and crockery should be included. Please provide sample menus and references if available. The event theme is 'Modern Elegance'.",
  category: "Catering",
  location: "Eko Hotel & Suites, Victoria Island, Lagos",
  budget: 750000,
  postedAt: new Date(Date.now() - 86400000 * 7), // 7 days ago
  status: "awarded", // Client awarded to artisan_john_bull
  assignedArtisanId: "artisan_john_bull", // This artisan has been awarded the job
  attachments: [
    { name: "Event_Layout.pdf", url: "#", type: 'document' },
    { name: "Sample_Menu_Inspiration.jpg", url: "https://placehold.co/300x200.png?text=Menu+Idea", type: 'image', "data-ai-hint": "event layout" }
  ]
};

// Simulate another request that is in_progress for client to mark complete
const mockServiceRequestInProgress: ServiceRequest = {
  id: "req_in_progress_456",
  clientId: "client_jane_doe",
  postedBy: { name: "Jane Doe", avatarUrl: "https://placehold.co/80x80.png?text=JD", memberSince: "March 2023", email: "jane.doe@example.com" },
  title: "Garden Landscaping Project",
  description: "Full garden redesign and landscaping for a residential property. Includes new lawn, flower beds, and a small patio.",
  category: "Gardening/Landscaping",
  location: "Banana Island, Lagos",
  budget: 1200000,
  postedAt: new Date(Date.now() - 86400000 * 15), // 15 days ago
  status: "in_progress",
  assignedArtisanId: "artisan_musa_ali",
};


const mockProposalsReceived: ArtisanProposal[] = [
    { id: "prop1", serviceRequestId: "req_detail_123", artisanId: "artisan_john_bull", artisanName: "John Bull Catering", artisanAvatarUrl: "https://placehold.co/40x40.png?text=JB", proposedAmount: 720000, coverLetter: "We specialize in corporate events and can provide an exquisite menu tailored to your 'Modern Elegance' theme. Our team is highly professional. References available upon request.", submittedAt: new Date(Date.now() - 86400000 * 2), status: "accepted" },
    { id: "prop2", serviceRequestId: "req_detail_123", artisanId: "artisan_ada_eze", artisanName: "Ada's Kitchen Deluxe", artisanAvatarUrl: "https://placehold.co/40x40.png?text=AKD", proposedAmount: 700000, coverLetter: "With 10 years of experience in high-end catering, we are confident we can exceed your expectations. Our package includes everything you need.", submittedAt: new Date(Date.now() - 86400000 * 1), status: "pending" },
    { id: "prop_rejected", serviceRequestId: "req_detail_123", artisanId: "artisan_some_other", artisanName: "Foodies R Us", artisanAvatarUrl: "https://placehold.co/40x40.png?text=FRU", proposedAmount: 710000, coverLetter: "We can do this.", submittedAt: new Date(Date.now() - 86400000 * 1.5), status: "rejected" },
    // Proposal for the in_progress job
    { id: "prop3", serviceRequestId: "req_in_progress_456", artisanId: "artisan_musa_ali", artisanName: "Musa Landscaping", artisanAvatarUrl: "https://placehold.co/40x40.png?text=ML", proposedAmount: 1150000, coverLetter: "Expert landscaping services, ready to transform your garden.", submittedAt: new Date(Date.now() - 86400000 * 10), status: "accepted" },
];

async function handleCancelRequest(requestId: string) {
    'use server';
    console.log("Cancelling request:", requestId);
    // Add logic to update request status to 'cancelled' in the database
    return { success: true, message: "Request cancelled (mock)." };
}

async function handleMarkJobAsCompleteArtisan(requestId: string, artisanId: string) {
    'use server';
    console.log(`Artisan ${artisanId} is marking job ${requestId} as complete.`);
    // Logic to: Update serviceRequest status to 'pending_client_approval' or similar & Notify client
    return { success: true, message: "Job marked as complete by artisan. Client will be notified. (Mock)" };
}

async function handleClientMarkCompleteAndReleaseFunds(requestId: string, clientId: string) {
    'use server';
    console.log(`Client ${clientId} is marking job ${requestId} as complete and releasing funds.`);
    // Logic to:
    // 1. Update serviceRequest status to 'completed'
    // 2. Initiate fund release from escrow to artisan (e.g., via Paystack payout API)
    // 3. Notify artisan
    return { success: true, message: "Job marked complete by client. Funds released to artisan. (Mock)" };
}

async function handleFundEscrowServerAction(requestId: string, amount: number, clientEmail: string | undefined) {
  'use server';
  if (!clientEmail || amount <= 0) {
    console.error("Server Action: Cannot initiate payment: Missing proposal or client email.");
    return { success: false, message: "Error: Missing proposal or client email for payment." };
  }
  console.log(`Server Action: Mock initiating payment of NGN ${amount.toLocaleString()} for request '${requestId}' via Paystack for email ${clientEmail}.`);
  // Actual redirect would happen here, or return URL for client-side redirect
  // For mock, just log and simulate success. A real app would redirect to payment page or Paystack.
  // redirect(`/dashboard/payments/escrow?transactionId=mock_txn_for_${requestId}&status=funded`);
  return { success: true, message: `Mock server action: Payment initiation for ${requestId} successful. Redirecting to escrow... (mock)`, redirectUrl: `/dashboard/payments/escrow?transactionId=mock_txn_for_${requestId}&status=funded` };
}


export default async function ServiceRequestDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Simulate fetching request based on ID
  const requestToDisplay = params.id === "req_in_progress_456" ? mockServiceRequestInProgress : mockServiceRequest;
  const request = requestToDisplay;

  const roleFromParams = searchParams?.role as UserRole | undefined || 'client';
  // Simulate getting user ID based on role. In real app, this comes from auth.
  const simulatedUserId = roleFromParams === 'client' ? request.clientId : (request.assignedArtisanId || "artisan_some_id");

  const currentUserRole = roleFromParams;
  const currentUserId = simulatedUserId;

  const isOwner = currentUserRole === 'client' && request.clientId === currentUserId;

  const currentArtisanProposalForThisRequest = currentUserRole === 'artisan'
    ? mockProposalsReceived.find(p => p.artisanId === currentUserId && p.serviceRequestId === request.id)
    : undefined;

  const isAssignedArtisan = currentUserRole === 'artisan' && request.assignedArtisanId === currentUserId;

  if (!request) {
    return <div className="p-8 text-center">Service request not found.</div>;
  }

  const acceptedClientProposal = isOwner ? mockProposalsReceived.find(p => p.status === 'accepted' && p.artisanId === request.assignedArtisanId && p.serviceRequestId === request.id) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isOwner ? "My Service Request" : "Service Request Details"}
        description={`ID: ${request.id}`}
        icon={FileText}
        action={isOwner && request.status === 'open' && (
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
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to cancel this request?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Cancelling will remove this request from being visible to artisans.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Request</AlertDialogCancel>
                  <form action={handleCancelRequest.bind(null, request.id)}>
                    <AlertDialogAction type="submit" className="bg-destructive hover:bg-destructive/90">Yes, Cancel Request</AlertDialogAction>
                  </form>
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

              {/* Client Actions: Fund Escrow or Mark Complete */}
              {isOwner && request.status === 'awarded' && acceptedClientProposal && (
                <Card className="mt-4 bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Action Required: Fund Escrow</CardTitle>
                    <CardDescription>Your proposal from {acceptedClientProposal.artisanName} for ₦{acceptedClientProposal.proposedAmount.toLocaleString()} has been accepted. Please fund the escrow to start the service.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form action={handleFundEscrowServerAction.bind(null, request.id, acceptedClientProposal.proposedAmount, request.postedBy?.email )}>
                      <Button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Fund Escrow Securely (₦{acceptedClientProposal.proposedAmount.toLocaleString()})
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {isOwner && request.status === 'in_progress' && (
                <Card className="mt-4 bg-green-500/10 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><CheckSquare className="h-5 w-5 text-green-600" /> Action: Confirm Completion</CardTitle>
                    <CardDescription>If the artisan has completed the service to your satisfaction, please mark it as complete to release payment.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <form action={handleClientMarkCompleteAndReleaseFunds.bind(null, request.id, currentUserId)}>
                        <Button type="submit" className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Complete & Release Funds
                        </Button>
                     </form>
                  </CardContent>
                </Card>
              )}

            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Posted {formatDistanceToNow(new Date(request.postedAt), { addSuffix: true })}
            </CardFooter>
          </Card>

          {/* Artisan's View: Proposal Submission or Status */}
          {currentUserRole === 'artisan' && (
            <>
              {!currentArtisanProposalForThisRequest && request.status === 'open' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Send className="h-5 w-5 text-primary"/> Submit Your Proposal</CardTitle>
                    <CardDescription>Let the client know why you're the best fit for this job.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form action="#"> {/* Replace # with actual server action for submitting proposal */}
                      <div>
                        <Label htmlFor="proposedAmount">Your Proposed Amount (₦)</Label>
                        <div className="relative mt-1">
                          <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input id="proposedAmount" type="number" placeholder="e.g. 700000" className="pl-10" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="coverLetter">Your Message to the Client</Label>
                        <Textarea
                          id="coverLetter"
                          placeholder="Explain your approach, experience, and why your quote is competitive. Be clear and concise."
                          className="mt-1 min-h-[120px]"
                        />
                      </div>
                      <div>
                          <Label htmlFor="attachments_proposal">Attach Supporting Documents (Optional)</Label>
                          <Input id="attachments_proposal" type="file" multiple className="mt-1"/>
                          <p className="text-xs text-muted-foreground mt-1">E.g., portfolio samples, detailed quote breakdown.</p>
                      </div>
                      <Button className="w-full sm:w-auto mt-4"><Send className="mr-2 h-4 w-4" /> Send Proposal</Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {currentArtisanProposalForThisRequest && (
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Your Proposal Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p>You proposed: <span className="font-semibold font-mono">₦{currentArtisanProposalForThisRequest.proposedAmount.toLocaleString()}</span></p>
                    <p>Status:
                      <Badge
                        variant={
                          currentArtisanProposalForThisRequest.status === 'accepted' ? 'default' :
                          currentArtisanProposalForThisRequest.status === 'rejected' ? 'destructive' :
                          'outline'
                        }
                        className="ml-2 capitalize"
                      >
                        {currentArtisanProposalForThisRequest.status}
                      </Badge>
                    </p>
                    {currentArtisanProposalForThisRequest.status === 'accepted' && isAssignedArtisan && (request.status === 'awarded' || request.status === 'in_progress') && (
                        <form action={handleMarkJobAsCompleteArtisan.bind(null, request.id, currentUserId)}>
                            <Button type="submit" className="w-full mt-2 bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Job as Complete (Artisan)
                            </Button>
                        </form>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}


          {/* Client's View: Proposals Received (if owner and job is not completed/cancelled) */}
          {isOwner && request.status === 'open' && mockProposalsReceived.filter(p => p.serviceRequestId === request.id).length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Proposals Received ({mockProposalsReceived.filter(p => p.serviceRequestId === request.id).length})</CardTitle>
                    <CardDescription>Review offers from interested artisans. Only one proposal can be accepted.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockProposalsReceived.filter(p => p.serviceRequestId === request.id).map(proposal => (
                        <Card key={proposal.id} className="bg-secondary/30">
                            <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
                                <Image src={proposal.artisanAvatarUrl || "https://placehold.co/40x40.png"} alt={proposal.artisanName} width={40} height={40} className="rounded-full object-cover" data-ai-hint="profile avatar" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <Link href={`/dashboard/artisans/${proposal.artisanId}?role=${currentUserRole}`} className="font-semibold text-primary hover:underline">{proposal.artisanName}</Link>
                                        <div className="text-right">
                                            <Badge variant="outline" className="font-mono">₦{proposal.proposedAmount.toLocaleString()}</Badge>
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
                                    <Button asChild size="sm" variant="outline">
                                        <Link href={`/dashboard/messages?role=${currentUserRole}&chatWith=${proposal.artisanId}`}>
                                            <MessageCircle className="mr-2 h-4 w-4"/> Message Artisan
                                        </Link>
                                    </Button>
                                    {request.status === 'open' && proposal.status === 'pending' && (
                                        <Button size="sm" onClick={() => console.log(`Mock: Accepting proposal from ${proposal.artisanName}`)}
                                        >Accept Proposal
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
          )}
          {isOwner && (request.status === 'awarded' || request.status === 'in_progress') && acceptedClientProposal && (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Accepted Proposal</CardTitle>
                </CardHeader>
                <CardContent>
                     <Card className="bg-secondary/30">
                        <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
                            <Image src={acceptedClientProposal.artisanAvatarUrl || "https://placehold.co/40x40.png"} alt={acceptedClientProposal.artisanName} width={40} height={40} className="rounded-full object-cover" data-ai-hint="profile avatar" />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <Link href={`/dashboard/artisans/${acceptedClientProposal.artisanId}?role=${currentUserRole}`} className="font-semibold text-primary hover:underline">{acceptedClientProposal.artisanName}</Link>
                                    <div className="text-right">
                                        <Badge variant="outline" className="font-mono">₦{acceptedClientProposal.proposedAmount.toLocaleString()}</Badge>
                                        <Badge className="mt-1 bg-green-500 text-white">Accepted</Badge>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground">Submitted: {formatDistanceToNow(new Date(acceptedClientProposal.submittedAt), { addSuffix: true })}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-sm text-foreground line-clamp-3 mb-2">{acceptedClientProposal.coverLetter}</p>
                            <Button asChild size="sm" variant="outline">
                                <Link href={`/dashboard/messages?role=${currentUserRole}&chatWith=${acceptedClientProposal.artisanId}`}>
                                    <MessageCircle className="mr-2 h-4 w-4"/> Message {acceptedClientProposal.artisanName}
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoItem icon={MapPin} label="Location" value={request.location} />
              <InfoItem icon={Briefcase} label="Category" value={request.category} />
              {request.budget && <InfoItem icon={Coins} label="Client's Budget" value={`₦${request.budget.toLocaleString()}`} />}
              <InfoItem icon={CalendarDays} label="Posted" value={format(new Date(request.postedAt), "PPP")} />
            </CardContent>
          </Card>

          {request.postedBy && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg">About the Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Image src={request.postedBy.avatarUrl || "https://placehold.co/64x64.png?text=Client"} alt={request.postedBy.name} width={56} height={56} className="rounded-full border object-cover" data-ai-hint="profile avatar"/>
                  <div>
                    <p className="font-semibold text-foreground">{request.postedBy.name}</p>
                    {request.postedBy.memberSince && <p className="text-xs text-muted-foreground">Member since {request.postedBy.memberSince}</p>}
                  </div>
                </div>
                {/* Message button conditional logic */}
                {isOwner && request.assignedArtisanId && (request.status === 'awarded' || request.status === 'in_progress' || request.status === 'completed') && (
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/dashboard/messages?role=${currentUserRole}&chatWith=${request.assignedArtisanId}`}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message Assigned Artisan
                      </Link>
                    </Button>
                )}
                {currentUserRole === 'artisan' && (
                  <>
                    {isAssignedArtisan && (request.status === 'awarded' || request.status === 'in_progress' || request.status === 'completed') ? (
                      // Artisan IS ASSIGNED: ALLOW MESSAGING
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/dashboard/messages?role=${currentUserRole}&chatWith=${request.clientId}`}>
                          <MessageCircle className="mr-2 h-4 w-4" /> Message Client
                        </Link>
                      </Button>
                    ) : currentArtisanProposalForThisRequest ? (
                      // Artisan has submitted a proposal but is NOT yet assigned
                      <>
                        {currentArtisanProposalForThisRequest.status === 'pending' && (
                          <Button variant="outline" className="w-full" disabled title="Client needs to review your proposal first.">
                            <MessageCircle className="mr-2 h-4 w-4" /> Message Client (Proposal Pending)
                          </Button>
                        )}
                        {currentArtisanProposalForThisRequest.status === 'rejected' && (
                          <Button variant="outline" className="w-full" disabled title="Your proposal was not selected.">
                            <MessageCircle className="mr-2 h-4 w-4" /> Message Client (Proposal Rejected)
                          </Button>
                        )}
                        {/* No 'accepted' case here if !isAssignedArtisan, as acceptance implies assignment */}
                      </>
                    ) : (
                      // Artisan has NOT submitted a proposal for this open request
                      request.status === 'open' && (
                        <Button variant="outline" className="w-full" disabled title="Submit a proposal to enable messaging.">
                          <MessageCircle className="mr-2 h-4 w-4" /> Submit Proposal to Message Client
                        </Button>
                      )
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
}
function InfoItem({ icon: Icon, label, value}: InfoItemProps) {
    return (
        <div className="flex items-start">
            <Icon className="h-4 w-4 text-muted-foreground mr-2 mt-0.5 shrink-0" />
            <div>
                <span className="font-medium text-foreground">{value}</span>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    )
}

