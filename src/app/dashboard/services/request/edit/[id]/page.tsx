
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestForm } from "@/components/service-requests/service-request-form";
import { Edit, Loader2 } from "lucide-react";
import type { ServiceRequest } from "@/types";
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

// Mock function to get a service request by ID
// In a real app, this would be an API call or server action
async function getServiceRequestById(id: string): Promise<ServiceRequest | undefined> {
  // Using the same mock data structure from requests/[id]/page.tsx for consistency
  const mockExistingRequest: ServiceRequest = {
    id: "req_detail_123", // This should match the ID for testing
    clientId: "client_jane_doe",
    postedBy: { name: "Jane Doe", avatarUrl: "https://placehold.co/80x80.png?text=JD", memberSince: "March 2023", email: "jane.doe@example.com" },
    title: "Professional Catering for Corporate Event (100 Guests)",
    description: "We are seeking a highly skilled and experienced caterer for our annual corporate gala dinner. The event will host approximately 100 executives. We require a three-course meal (appetizer, main course, dessert) with options for vegetarian and gluten-free diets. Service staff, cutlery, and crockery should be included. Please provide sample menus and references if available. The event theme is 'Modern Elegance'.",
    category: "Catering",
    location: "Eko Hotel & Suites, Victoria Island, Lagos",
    budget: 750000,
    postedAt: new Date(Date.now() - 86400000 * 7),
    status: "open",
    attachments: [
      { name: "Event_Layout.pdf", url: "#", type: 'document' },
      { name: "Sample_Menu_Inspiration.jpg", url: "https://placehold.co/300x200.png?text=Menu+Idea", type: 'image' }
    ]
  };
  if (id === mockExistingRequest.id) {
    return mockExistingRequest;
  }
  // Simulate another request for different ID
  const mockAnotherRequest: ServiceRequest = {
    id: "req1", clientId: "client123", title: "Fix Leaky Kitchen Faucet", description: "My kitchen faucet has been dripping for days, need a plumber to fix it urgently. It's a modern mixer tap.", category: "Plumbing", location: "Ikeja, Lagos", budget: 5000, postedAt: new Date(Date.now() - 86400000 * 2), status: "open"
  };
  if (id === mockAnotherRequest.id) {
    return mockAnotherRequest;
  }
   // Add more mock requests as needed from other pages for testing edit
  const mockCateringRequest: ServiceRequest = {
    id: "req2", clientId: "clientABC", title: "Catering for Birthday Party (50 guests)", description: "Need catering for a birthday party...", category: "Catering", location: "Lekki Phase 1, Lagos", budget: 150000, postedAt: new Date(Date.now() - 86400000 * 5), status: "open"
  };
   if (id === mockCateringRequest.id) {
    return mockCateringRequest;
  }
  return undefined;
}


export default function EditServiceRequestPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [request, setRequest] = useState<ServiceRequest | null | undefined>(undefined); // undefined for loading, null for not found
  const [isLoadingPage, setIsLoadingPage] = useState(true); // Changed variable name for clarity

  const requestId = typeof params.id === 'string' ? params.id : undefined;

  useEffect(() => {
    if (requestId) {
      setIsLoadingPage(true);
      getServiceRequestById(requestId)
        .then(data => {
          setRequest(data);
        })
        .catch(err => {
          console.error("Failed to fetch service request:", err);
          setRequest(null);
          toast({ title: "Error", description: "Could not load service request details.", variant: "destructive"});
        })
        .finally(() => setIsLoadingPage(false));
    } else {
      setRequest(null); // No ID, so not found
      setIsLoadingPage(false);
    }
  }, [requestId, toast]);

  if (isLoadingPage || request === undefined) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Service Request"
          description="Loading request details..."
          icon={Loader2}
          className="animate-pulse"
        />
        <Skeleton className="h-10 w-1/3 mb-4" /> {/* Skeleton for title */}
        <Skeleton className="h-8 w-1/2 mb-2" /> {/* Skeleton for description in form */}
        <Skeleton className="h-24 w-full mb-4" /> {/* Skeleton for textarea */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full mb-4" /> {/* Skeleton for location */}
        <Skeleton className="h-10 w-full mb-4" /> {/* Skeleton for date */}
        <Skeleton className="h-10 w-32 ml-auto" /> {/* Skeleton for button */}
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Service Request Not Found"
          description="The service request you are trying to edit could not be found or you do not have permission to edit it."
          icon={Edit}
        />
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }
  
  // In a real app, you would verify if the current user is the owner of this request.
  // For this mock, we assume if data is found, they can edit.
  // const MOCK_CURRENT_USER_ID = "client_jane_doe"; // Or get from auth context
  // if (request.clientId !== MOCK_CURRENT_USER_ID) { /* Handle unauthorized */ }


  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Your Service Request"
        description={`Modifying request: "${request.title}"`}
        icon={Edit}
      />
      <ServiceRequestForm 
        clientId={request.clientId} // Use actual clientId from the request
        initialData={request}
        isEditing={true} 
      />
    </div>
  );
}
