
'use server'; 

import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Briefcase, CalendarDays, DollarSign, FileText, MapPin, MessageCircle, Send, UserCircle, Edit, Users, CreditCard, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { ServiceRequest, ArtisanProposal } from "@/types";
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
  clientId: "client_jane_doe", // This would be the current logged-in user's ID for "isOwner" to be true
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
  status: "open", 
  assignedArtisanId: "artisan_john_bull", 
  attachments: [
    { name: "Event_Layout.pdf", url: "#", type: 'document' },
    { name: "Sample_Menu_Inspiration.jpg", url: "https://placehold.co/300x200.png?text=Menu+Idea", type: 'image' }
  ]
};

const mockProposalsReceived: ArtisanProposal[] = [
    { id: "prop1", serviceRequestId: "req_detail_123", artisanId: "artisan_john_bull", artisanName: "John Bull Catering", artisanAvatarUrl: "https://placehold.co/40x40.png?text=JB", proposedAmount: 720000, coverLetter: "We specialize in corporate events and can provide an exquisite menu tailored to your 'Modern Elegance' theme. Our team is highly professional. References available upon request.", submittedAt: new Date(Date.now() - 86400000 * 2), status: "accepted" }, 
    { id: "prop2", serviceRequestId: "req_detail_123", artisanId: "artisan_ada_eze", artisanName: "Ada's Kitchen Deluxe", artisanAvatarUrl: "https://placehold.co/40x40.png?text=AKD", proposedAmount: 700000, coverLetter: "With 10 years of experience in high-end catering, we are confident we can exceed your expectations. Our package includes everything you need.", submittedAt: new Date(Date.now() - 86400000 * 1), status: "pending" },
];


// Simulate fetching current user type (replace with actual auth logic)
const getCurrentUserRole = async (): Promise<'client' | 'artisan'> => {
  return 'client'; 
};

// Simulate fetching current user ID (replace with actual auth logic)
const getCurrentUserId = async (): Promise<string> => {
    return 'client_jane_doe'; 
}


async function initiatePaystackPayment(requestId: string, amount: number, email: string, artisanId: string) {
  console.log("Initiating Paystack payment for request:", requestId, "Amount:", amount, "Email:", email);
  if (amount > 0) {
    return { success: true, message: "Redirecting to Paystack...", authorization_url: `https://checkout.paystack.com/mock_payment_url_for_${requestId}` };
  } else {
    return { success: false, message: "Invalid amount for payment." };
  }
}

async function handleCancelRequest(requestId: string) {
    'use server';
    console.log("Cancelling request:", requestId);
    // Add logic to update request status to 'cancelled' in the database
    // For demo:
    // revalidatePath(`/dashboard/services/requests/${requestId}`);
    // redirect('/dashboard/services/my-requests');
    return { success: true, message: "Request cancelled (mock)." };
}


export default async function ServiceRequestDetailPage({ params }: { params: { id: string } }) {
  const request = mockServiceRequest; 
  const currentUserRole = await getCurrentUserRole();
  const currentUserId = await getCurrentUserId();
  const isOwner = currentUserRole === 'client' && request.clientId === currentUserId;
  const isAssignedArtisan = currentUserRole === 'artisan' && request.assignedArtisanId === currentUserId;

  if (!request) {
    return <div className="p-8 text-center">Service request not found.</div>;
  }

  const acceptedProposal = mockProposalsReceived.find(p => p.status === 'accepted' && p.artisanId === request.assignedArtisanId);

  const handleFundEscrow = async () => {
    if (!acceptedProposal || !request.postedBy?.email) { 
      console.error("Cannot initiate payment: Missing proposal or client email.");
      return;
    }
    alert(`Mock: Initiating payment of NGN ${acceptedProposal.proposedAmount.toLocaleString()} for request '${request.title}' via Paystack.`);
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title={isOwner ? "My Service Request" : "Service Request Details"}
        description={`ID: ${request.id}`}
        icon={FileText}
        action={isOwner && request.status === 'open' && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link href={`/dashboard/services/request/edit/${request.id}`}> {/* Conceptual edit link */}
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
                  <form action={async () => {
                      const result = await handleCancelRequest(request.id);
                      // Handle result, e.g. show toast
                      alert(result.message); // Placeholder for toast
                  }}>
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
              <p className="text-foreground leading-relaxed">{request.description}</p>
              
              {request.attachments && request.attachments.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-md">Attachments:</h3>
                  <ul className="space-y-2">
                    {request.attachments.map((file, index) => (
                      <li key={index} className="flex items-center gap-2">
                        {file.type === 'image' ? 
                           <Image src={file.url} alt={file.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint="attachment image" /> :
                           <FileText className="h-6 w-6 text-primary" />
                        }
                        <Link href={file.url} target="_blank" className="text-sm text-primary hover:underline">{file.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              Posted {formatDistanceToNow(new Date(request.postedAt), { addSuffix: true })}
            </CardFooter>
          </Card>

          {currentUserRole === 'artisan' && request.status === 'open' && !isAssignedArtisan && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Send className="h-5 w-5 text-primary"/> Submit Your Proposal</CardTitle>
                <CardDescription>Let the client know why you're the best fit for this job.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form action="#"> 
                  <div>
                    <Label htmlFor="proposedAmount">Your Proposed Amount (₦)</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

          {isOwner && mockProposalsReceived.length > 0 && request.status !== 'completed' && (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users className="h-5 w-5 text-primary"/> Proposals Received ({mockProposalsReceived.length})</CardTitle>
                    <CardDescription>Review offers from interested artisans.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockProposalsReceived.map(proposal => (
                        <Card key={proposal.id} className="bg-secondary/30">
                            <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
                                <Image src={proposal.artisanAvatarUrl || "https://placehold.co/40x40.png"} alt={proposal.artisanName} width={40} height={40} className="rounded-full" data-ai-hint="profile avatar" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <Link href={`/dashboard/artisans/${proposal.artisanId}`} className="font-semibold text-primary hover:underline">{proposal.artisanName}</Link>
                                        <div className="text-right">
                                            <Badge variant="outline" className="font-mono">₦{proposal.proposedAmount.toLocaleString()}</Badge>
                                            {proposal.status === 'accepted' && <Badge className="mt-1 bg-green-500 text-white">Accepted</Badge>}
                                             {proposal.status === 'pending' && <Badge className="mt-1">Pending</Badge>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Submitted: {formatDistanceToNow(new Date(proposal.submittedAt), { addSuffix: true })}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-sm text-foreground line-clamp-3 mb-2">{proposal.coverLetter}</p>
                                <div className="flex gap-2 flex-wrap">
                                    <Button size="sm" variant="outline"><MessageCircle className="mr-2 h-4 w-4"/> Message Artisan</Button>
                                    {request.status === 'open' && proposal.status === 'pending' && (
                                        <Button size="sm" 
                                        >Accept Proposal
                                        </Button>
                                    )}
                                    {isOwner && request.status === 'awarded' && proposal.status === 'accepted' && request.assignedArtisanId === proposal.artisanId && (
                                       <form action={handleFundEscrow}>
                                            <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                                <CreditCard className="mr-2 h-4 w-4" /> Fund Escrow via Paystack (₦{proposal.proposedAmount.toLocaleString()})
                                            </Button>
                                       </form>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
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
              {request.budget && <InfoItem icon={DollarSign} label="Client's Budget" value={`₦${request.budget.toLocaleString()}`} />}
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
                  <Image src={request.postedBy.avatarUrl || "https://placehold.co/64x64.png?text=Client"} alt={request.postedBy.name} width={56} height={56} className="rounded-full border" data-ai-hint="profile avatar"/>
                  <div>
                    <p className="font-semibold text-foreground">{request.postedBy.name}</p>
                    {request.postedBy.memberSince && <p className="text-xs text-muted-foreground">Member since {request.postedBy.memberSince}</p>}
                  </div>
                </div>
                {!isOwner && (
                    <Button variant="outline" className="w-full"><MessageCircle className="mr-2 h-4 w-4" /> Contact Client</Button>
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
