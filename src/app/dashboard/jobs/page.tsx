
"use client"; // For filters and potential client-side interactions

import React, { useState } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestCard } from "@/components/service-requests/service-request-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, ListFilter, Briefcase, MapPin } from "lucide-react";
import type { ServiceRequest } from "@/types";
import { LocationAutocomplete } from '@/components/location/location-autocomplete';

// Mock data for service requests (jobs)
const mockServiceRequests: ServiceRequest[] = [
  { id: "req1", clientId: "client123", title: "Fix Leaky Kitchen Faucet", description: "My kitchen faucet has been dripping for days, need a plumber to fix it urgently. It's a modern mixer tap.", category: "Plumbing", location: "Ikeja, Lagos", budget: 5000, postedAt: new Date(Date.now() - 86400000 * 2), status: "open" },
  { id: "req2", clientId: "clientABC", title: "Catering for Birthday Party (50 guests)", description: "Need catering for a birthday party, Nigerian Jollof, Fried Rice, Chicken, Small Chops required. Event is next month.", category: "Catering", location: "Lekki Phase 1, Lagos", budget: 150000, postedAt: new Date(Date.now() - 86400000 * 5), status: "open" },
  { id: "req3", clientId: "clientDEF", title: "Repaint Living Room Walls (Urgent)", description: "Living room needs a fresh coat of paint, approx 20sqm. Emulsion paint, light cream color.", category: "Painting", location: "Festac Town, Lagos", postedAt: new Date(Date.now() - 86400000 * 1), status: "open" },
  { id: "req4", clientId: "clientXYZ", title: "Custom Wardrobe Design & Build", description: "Looking for a carpenter to design and build a custom wardrobe for master bedroom. Dimensions 2.5m x 3m.", category: "Carpentry", location: "Garki, Abuja", budget: 250000, postedAt: new Date(Date.now() - 86400000 * 10), status: "open" },
  { id: "req5", clientId: "clientMNO", title: "Wedding Photography Full Day Coverage", description: "Need a photographer for a full day wedding event, including pre-ceremony, ceremony, and reception. Deliverables: edited high-res photos.", category: "Photography/Videography", location: "Victoria Island, Lagos", budget: 300000, postedAt: new Date(Date.now() - 86400000 * 15), status: "awarded" },
];

const serviceCategories = ["Plumbing", "Catering", "Painting", "Carpentry", "Photography/Videography", "Electrical Services", "Tailoring", "Web Development", "Other"];

const ALL_CATEGORIES_ITEM_VALUE = "_all_";

export default function BrowseJobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [budgetRange, setBudgetRange] = useState([0, 500000]); // Example budget range in Naira
  const [currentLocation, setCurrentLocation] = useState<{ address: string; lat?: number; lng?: number } | null>(null);

  const handleLocationSelect = (location: { address: string; lat?: number; lng?: number }) => {
    setCurrentLocation(location);
  };

  const filteredRequests = mockServiceRequests.filter(request =>
    (request.title.toLowerCase().includes(searchTerm.toLowerCase()) || request.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === "" || selectedCategory === ALL_CATEGORIES_ITEM_VALUE ? true : request.category === selectedCategory) &&
    (request.budget ? request.budget >= budgetRange[0] && request.budget <= budgetRange[1] : true) && // Handle optional budget
    (currentLocation ? request.location.toLowerCase().includes(currentLocation.address.toLowerCase()) : true) &&
    request.status === 'open' // Only show open jobs
  );
  
  const openRequests = filteredRequests.filter(req => req.status === 'open');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find Job Opportunities"
        description="Browse service requests posted by clients across Nigeria and submit your proposals."
        icon={Search}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Filters Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><ListFilter className="h-5 w-5 text-primary" /> Filter Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="search" className="text-sm font-medium">Search by Title/Description</label>
                <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="search" placeholder="e.g., plumbing, catering" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <LocationAutocomplete 
                    onLocationSelect={handleLocationSelect}
                    placeholder="Enter job location (e.g. Ikeja)"
                    initialValue={currentLocation?.address}
                    className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="category" className="text-sm font-medium">Service Category</label>
                 <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category" className="w-full mt-1">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CATEGORIES_ITEM_VALUE}>All Categories</SelectItem>
                    {serviceCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="budget" className="text-sm font-medium">Budget Range (₦)</label>
                <Slider
                  id="budget"
                  min={0}
                  max={1000000}
                  step={10000}
                  value={budgetRange}
                  onValueChange={(value) => setBudgetRange(value as [number, number])}
                  className="mt-2"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>₦{budgetRange[0].toLocaleString()}</span>
                  <span>₦{budgetRange[1].toLocaleString()}</span>
                </div>
              </div>
               <Button className="w-full">Apply Filters</Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="font-headline text-2xl font-semibold">Open Service Requests ({openRequests.length})</h2>
          {openRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {openRequests.map(request => (
                <ServiceRequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
             <div className="py-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No open jobs found.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your filters or check back later for new service requests.
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
