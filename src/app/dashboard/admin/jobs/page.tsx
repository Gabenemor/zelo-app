
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Search, SlidersHorizontal, Eye, Trash2, UserCircle2 } from "lucide-react";
import type { ServiceRequest } from "@/types";
import { format } from 'date-fns';

// Mock service request data (jobs)
const mockJobs: ServiceRequest[] = [
  { id: "job_001", clientId: "client_001", clientName: "Chioma Nwosu", title: "Urgent Plumbing Needed", category: "Plumbing", location: "Ikeja, Lagos", postedAt: new Date(2024, 4, 15), status: "open", budget: 15000 },
  { id: "job_002", clientId: "client_002", clientName: "David Okoro", title: "Catering for Party", category: "Catering", location: "Lekki, Lagos", postedAt: new Date(2024, 4, 10), status: "awarded", assignedArtisanId: "artisan_001", assignedArtisanName: "Babatunde Adekunle", budget: 120000 },
  { id: "job_003", clientId: "client_003", clientName: "Aisha Bello", title: "House Painting (3 Rooms)", category: "Painting", location: "Garki, Abuja", postedAt: new Date(2024, 3, 20), status: "completed", assignedArtisanId: "artisan_003", assignedArtisanName: "Chinedu PaintMasters", budget: 80000 },
  { id: "job_004", clientId: "client_001", clientName: "Chioma Nwosu", title: "Website Design for Bakery", category: "Web Development", location: "Remote", postedAt: new Date(2024, 5, 1), status: "in_progress", assignedArtisanId: "artisan_004", assignedArtisanName: "WebSolutions Ltd", budget: 200000 },
  { id: "job_005", clientId: "client_004", clientName: "Musa Ibrahim", title: "Fashion Design for Wedding", category: "Tailoring/Fashion Design", location: "Kano City", postedAt: new Date(2024, 5, 5), status: "disputed", assignedArtisanId: "artisan_005", assignedArtisanName: "Fatima Stitches", budget: 150000 },
];

const jobStatusOptions: ServiceRequest['status'][] = ["open", "awarded", "in_progress", "completed", "cancelled", "disputed"];

export default function AdminJobManagementPage() {
  // Placeholder for actual filtering logic
  const jobs = mockJobs;

  const getStatusBadgeVariant = (status: ServiceRequest["status"]) => {
    switch (status) {
      case 'open': return 'default';
      case 'awarded': return 'secondary';
      case 'in_progress': return 'outline'; 
      case 'completed': return 'default'; 
      case 'cancelled': return 'destructive';
      case 'disputed': return 'destructive';
      default: return 'outline';
    }
  };
  const getStatusBadgeColor = (status: ServiceRequest["status"]) => {
     switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-700 border-blue-400';
      case 'awarded': return 'bg-yellow-500/20 text-yellow-700 border-yellow-400';
      case 'in_progress': return 'bg-orange-500/20 text-orange-700 border-orange-400';
      case 'completed': return 'bg-green-500/20 text-green-700 border-green-400';
      case 'cancelled': return 'bg-gray-500/20 text-gray-700 border-gray-400';
      case 'disputed': return 'bg-red-500/20 text-red-700 border-red-400';
      default: return '';
    }
  }


  return (
    <div className="space-y-6">
      <PageHeader
        title="Job Management"
        description="Oversee all service requests (jobs) posted on the Zelo platform."
        icon={Briefcase}
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Platform Jobs</CardTitle>
          <CardDescription>Search, filter, and manage job postings.</CardDescription>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by title, client, artisan, or ID..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {jobStatusOptions.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">{status.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Artisan</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium max-w-xs truncate" title={job.title}>{job.title}</TableCell>
                    <TableCell>{job.clientName || job.clientId}</TableCell>
                    <TableCell>{job.assignedArtisanName || job.assignedArtisanId || 'N/A'}</TableCell>
                    <TableCell>{job.category}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(job.status)} 
                        className={`capitalize ${getStatusBadgeColor(job.status)}`}
                      >
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(job.postedAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button asChild variant="ghost" size="icon" title="View Job Details">
                        <Link href={`/dashboard/services/requests/${job.id}?role=admin`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" title="Remove Job (Policy Violation)" onClick={() => console.log(`Mock remove job: ${job.id}`)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="py-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No jobs found.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    There are currently no job postings matching your filters.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
