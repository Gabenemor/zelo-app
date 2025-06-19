
import type { ServiceRequest, UserRole, ArtisanProposal } from "@/types"; // Added ArtisanProposal
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, CalendarDays, Coins, Briefcase, Eye, Send, CheckCircle2 } from "lucide-react"; 
import { formatDistanceToNow } from 'date-fns';

interface ServiceRequestCardProps {
  request: ServiceRequest;
  showViewButton?: boolean;
  currentUserRole?: UserRole;
  applicationStatus?: ArtisanProposal['status']; // For artisan view on jobs page
}

export function ServiceRequestCard({ request, showViewButton = true, currentUserRole, applicationStatus }: ServiceRequestCardProps) {
  const getStatusVariant = (status: ServiceRequest["status"]) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline'; 
      case 'cancelled': return 'destructive';
      case 'awarded': return 'secondary'; 
      default: return 'outline';
    }
  };
  
  const getApplicationStatusBadge = (status?: ArtisanProposal['status']) => {
    if (!status) return null;
    switch (status) {
      case 'pending': return <Badge variant="outline" className="ml-2 border-yellow-400 text-yellow-600">Proposal Pending</Badge>;
      case 'accepted': return <Badge className="ml-2 bg-green-500/20 text-green-700 border-green-400">Proposal Accepted</Badge>;
      case 'rejected': return <Badge variant="destructive" className="ml-2">Proposal Rejected</Badge>;
      default: return null;
    }
  };


  const detailLink = `/dashboard/services/requests/${request.id}${currentUserRole ? `?role=${currentUserRole}` : ''}`;
  
  let buttonText = "View Details";
  let ButtonIcon = Eye;

  if (currentUserRole === 'artisan') {
    if (applicationStatus === 'pending') {
      buttonText = "View My Application";
      ButtonIcon = Send;
    } else if (applicationStatus === 'accepted' || request.assignedArtisanId ) { 
      // If assigned, it implies proposal was accepted
      buttonText = "View Awarded Job";
      ButtonIcon = CheckCircle2;
    } else if (request.status === 'open' && !applicationStatus) {
      buttonText = "View & Apply";
    }
  }


  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline text-lg line-clamp-2">{request.title}</CardTitle>
          <div className="flex items-center gap-1 shrink-0">
            <Badge variant={getStatusVariant(request.status)} className="capitalize">
              {request.status.replace('_', ' ')}
            </Badge>
             {currentUserRole === 'artisan' && applicationStatus && request.status === 'open' && getApplicationStatusBadge(applicationStatus)}
          </div>
        </div>
        <CardDescription className="flex items-center gap-1 text-xs">
          <Briefcase className="h-3 w-3" /> {request.category}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2 text-sm">
        <p className="line-clamp-3 text-muted-foreground">{request.description}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> <span>{request.location}</span>
        </div>
        {request.budget && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Coins className="h-3 w-3" /> <span>Budget: ₦{request.budget.toLocaleString()}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
            Posted {formatDistanceToNow(new Date(request.postedAt), { addSuffix: true })}
        </div>
        {showViewButton && (
            <Button asChild size="sm" variant="outline">
                <Link href={detailLink}>
                    <ButtonIcon className="mr-2 h-3 w-3" /> {buttonText}
                </Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

