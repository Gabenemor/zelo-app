import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestCard } from "@/components/service-requests/service-request-card";
import { FileText, PlusCircle } from "lucide-react";
import type { ServiceRequest } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data for service requests
const mockClientRequests: ServiceRequest[] = [
  { id: "req1", clientId: "client123", title: "Fix Leaky Kitchen Faucet", description: "My kitchen faucet has been dripping for days, need a plumber to fix it urgently. It's a modern mixer tap.", category: "Plumbing", location: "Ikeja, Lagos", budget: 5000, postedAt: new Date(Date.now() - 86400000 * 2), status: "open" },
  { id: "req2", clientId: "client123", title: "Catering for Birthday Party (50 guests)", description: "Need catering for a birthday party, Nigerian Jollof, Fried Rice, Chicken, Small Chops required. Event is next month.", category: "Catering", location: "Lekki Phase 1, Lagos", budget: 150000, postedAt: new Date(Date.now() - 86400000 * 5), status: "in_progress", assignedArtisanId: "artisan456" },
  { id: "req3", clientId: "client123", title: "Repaint Living Room Walls", description: "Living room needs a fresh coat of paint, approx 20sqm. Emulsion paint, light cream color.", category: "Painting", location: "Festac Town, Lagos", postedAt: new Date(Date.now() - 86400000 * 10), status: "completed", assignedArtisanId: "artisan789" },
];


export default async function MyServiceRequestsPage() {
  // Placeholder: In a real app, fetch requests for the logged-in client
  // const clientId = await getCurrentUserId();
  // const requests = await db.collection("serviceRequests").where("clientId", "==", clientId).get();
  const requests = mockClientRequests;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Service Requests"
        description="Track the status of all service requests you've posted on Zelo."
        icon={FileText}
        action={
            <Button asChild>
                <Link href="/dashboard/services/request/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Post New Request
                </Link>
            </Button>
        }
      />

      {requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map(request => (
            <ServiceRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">No service requests yet.</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                When you post a service request, it will appear here.
            </p>
            <Button asChild className="mt-6">
                <Link href="/dashboard/services/request/new">Post Your First Request</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
