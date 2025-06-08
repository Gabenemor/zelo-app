import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestCard } from "@/components/service-requests/service-request-card"; // Can be reused or a new "JobCard" created
import { Briefcase, Search } from "lucide-react";
import type { ServiceRequest } from "@/types"; // Assuming an offer might be linked to a ServiceRequest
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Mock data for artisan's offers/jobs
const mockArtisanJobs: ServiceRequest[] = [
  // These would be service requests that this artisan has bid on or is assigned to
  { id: "req2", clientId: "clientABC", title: "Catering for Birthday Party (50 guests)", description: "Need catering for a birthday party...", category: "Catering", location: "Lekki Phase 1, Lagos", budget: 150000, postedAt: new Date(Date.now() - 86400000 * 5), status: "in_progress", assignedArtisanId: "currentArtisanId" },
  { id: "req4", clientId: "clientXYZ", title: "Custom Wardrobe Design & Build", description: "Looking for a carpenter to design and build a custom wardrobe for master bedroom.", category: "Carpentry", location: "Garki, Abuja", budget: 250000, postedAt: new Date(Date.now() - 86400000 * 3), status: "open" /* Artisan has bid */ },
  { id: "req5", clientId: "clientDEF", title: "Website for Small Business", description: "Need a simple 5-page website for my new bakery.", category: "Web Development", location: "Online/Remote", postedAt: new Date(Date.now() - 86400000 * 12), status: "completed", assignedArtisanId: "currentArtisanId"},
];


export default async function MyOfferedServicesPage() {
  // Placeholder: In a real app, fetch jobs/offers for the logged-in artisan
  // const artisanId = await getCurrentUserId();
  // const jobs = await db.collection("serviceRequests").where("assignedArtisanId", "==", artisanId).orWhere("bids", "array-contains", artisanId).get();
  const jobs = mockArtisanJobs;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Jobs & Offers"
        description="Manage your active jobs, bids, and service offers on Zelo."
        icon={Briefcase}
        action={
            <Button asChild variant="outline">
                <Link href="/dashboard/services/browse">
                    <Search className="mr-2 h-4 w-4" /> Find New Jobs
                </Link>
            </Button>
        }
      />

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => (
            // Reusing ServiceRequestCard, but you might want a specific "JobCard" or "OfferCard"
            <ServiceRequestCard key={job.id} request={job} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium text-foreground">No active jobs or offers yet.</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Browse service requests and make offers to get started.
            </p>
            <Button asChild className="mt-6">
                <Link href="/dashboard/services/browse">Browse Service Requests</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
