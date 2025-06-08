
import type { ServiceRequest } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, CalendarDays, DollarSign, Briefcase, Eye } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface ServiceRequestCardProps {
  request: ServiceRequest;
  showViewButton?: boolean;
}

export function ServiceRequestCard({ request, showViewButton = true }: ServiceRequestCardProps) {
  const getStatusVariant = (status: ServiceRequest["status"]) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'secondary';
      case 'completed': return 'outline'; // Or a success-like variant if you have one
      case 'cancelled': return 'destructive';
      case 'awarded': return 'secondary'; // A distinct variant for awarded
      default: return 'outline';
    }
  };
  
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-headline text-lg line-clamp-2">{request.title}</CardTitle>
          <Badge variant={getStatusVariant(request.status)} className="capitalize">
            {request.status.replace('_', ' ')}
          </Badge>
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
            <DollarSign className="h-3 w-3" /> <span>Budget: ₦{request.budget.toLocaleString()}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
            Posted {formatDistanceToNow(new Date(request.postedAt), { addSuffix: true })}
        </div>
        {showViewButton && (
            <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/services/requests/${request.id}`}>
                    <Eye className="mr-2 h-3 w-3" /> View Details
                </Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}

