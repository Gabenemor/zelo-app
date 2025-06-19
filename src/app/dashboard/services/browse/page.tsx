
import React, { Suspense } from 'react';
import { BrowseServicesClient } from '@/components/dashboard/browse-services-client';
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, ListFilter } from 'lucide-react';

function BrowseServicesLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <PageHeader
        title="Browse Services & Artisans"
        description="Loading available services and artisans..."
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline"><ListFilter className="h-5 w-5 text-primary" /> Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-8 w-1/3 mb-2" /> {/* For "Available Artisans" heading */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Skeleton for two artisan cards */}
            <Card>
              <CardHeader><Skeleton className="h-10 w-10 rounded-full inline-block mr-3" /><div className="inline-block space-y-1"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-1" /></div></CardHeader>
              <CardContent><Skeleton className="h-5 w-full" /><Skeleton className="h-9 w-full mt-3" /></CardContent>
            </Card>
            <Card>
              <CardHeader><Skeleton className="h-10 w-10 rounded-full inline-block mr-3" /><div className="inline-block space-y-1"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-1" /></div></CardHeader>
              <CardContent><Skeleton className="h-5 w-full" /><Skeleton className="h-9 w-full mt-3" /></CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrowseServicesPage() {
  return (
    <Suspense fallback={<BrowseServicesLoadingSkeleton />}>
      <BrowseServicesClient />
    </Suspense>
  );
}

    
