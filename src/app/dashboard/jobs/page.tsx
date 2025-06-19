
"use client"; 

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestCard } from "@/components/service-requests/service-request-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, ListFilter, Briefcase, MapPin, Navigation, Loader2 } from "lucide-react";
import type { ServiceRequest, ArtisanProposal, UserRole } from "@/types";
import { LocationAutocomplete } from '@/components/location/location-autocomplete';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/components/providers/auth-provider'; 
import { getProposalsByArtisan } from '@/actions/proposal-actions'; 
import { getServiceRequests } from '@/lib/firestore'; 
import { FormDescription } from '@/components/ui/form';

const serviceCategories = ["Plumbing", "Catering", "Painting", "Carpentry", "Photography/Videography", "Electrical Services", "Tailoring", "Web Development", "Other"];
const ALL_CATEGORIES_ITEM_VALUE = "_all_";

export default function BrowseJobsPage() {
  const { user: authUser, loading: authLoading } = useAuthContext(); 
  const { toast } = useToast();

  const [allOpenServiceRequests, setAllOpenServiceRequests] = useState<ServiceRequest[]>([]);
  const [artisanProposals, setArtisanProposals] = useState<ArtisanProposal[]>([]);
  
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingProposals, setIsLoadingProposals] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_ITEM_VALUE);
  const [budgetRange, setBudgetRange] = useState([0, 1000000]);
  const [currentLocation, setCurrentLocation] = useState<{ address: string; lat?: number; lng?: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(25); 
  const [isUsingGeoLocation, setIsUsingGeoLocation] = useState(false);

  const currentArtisanId = authUser?.uid;
  const currentUserRole: UserRole = "artisan";

  const fetchJobs = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const requests = await getServiceRequests({ status: 'open' });
      setAllOpenServiceRequests(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      toast({ title: "Error", description: "Could not load job opportunities.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);

  const fetchProposals = useCallback(async () => {
    if (currentArtisanId) {
      setIsLoadingProposals(true);
      try {
        const proposals = await getProposalsByArtisan(currentArtisanId); 
        setArtisanProposals(proposals);
      } catch (error) {
        console.error("Error fetching artisan proposals:", error);
        toast({title: "Error", description: "Could not load your application history.", variant: "destructive"});
      } finally {
        setIsLoadingProposals(false);
      }
    } else {
        setIsLoadingProposals(false); 
    }
  }, [currentArtisanId, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchJobs();
      fetchProposals();
    }
  }, [authLoading, fetchJobs, fetchProposals]);


  const handleLocationSelect = (location: { address: string; lat?: number; lng?: number }) => {
    setCurrentLocation(location);
    if (isUsingGeoLocation) {
        setIsUsingGeoLocation(false); 
    }
  };

  const handleFindNearMe = () => {
    if (isUsingGeoLocation) { 
      setIsUsingGeoLocation(false);
      setCurrentLocation(null); 
      toast({ title: "Location Cleared", description: "No longer searching near your current location." });
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const geoAddress = `Your Current Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
          setCurrentLocation({ address: geoAddress, lat: latitude, lng: longitude });
          setIsUsingGeoLocation(true);
          toast({ title: "Location Found", description: "Searching for jobs near your current location." });
        },
        (error) => {
          setIsUsingGeoLocation(false);
          toast({ title: "Location Error", description: `Could not get your location: ${error.message}`, variant: "destructive" });
        }
      );
    } else {
      setIsUsingGeoLocation(false);
      toast({ title: "Location Not Supported", description: "Geolocation is not supported by your browser.", variant: "destructive" });
    }
  };

  const filteredAndAugmentedRequests = allOpenServiceRequests.filter(request =>
    (request.title.toLowerCase().includes(searchTerm.toLowerCase()) || request.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === ALL_CATEGORIES_ITEM_VALUE ? true : request.category === selectedCategory) &&
    (request.budget ? request.budget >= budgetRange[0] && request.budget <= budgetRange[1] : true) && 
    (currentLocation ? request.location.toLowerCase().includes(currentLocation.address.split('(')[0].trim().toLowerCase()) : true)
  ).map(request => {
    const proposal = artisanProposals.find(p => p.serviceRequestId === request.id);
    return {
      ...request,
      currentUserApplicationStatus: proposal?.status,
    };
  });
  
  if (authLoading || (!currentArtisanId && !authLoading)) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Loading user data...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find Job Opportunities"
        description="Browse service requests posted by clients across Nigeria and submit your proposals."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><ListFilter className="h-5 w-5 text-primary" /> Filter Jobs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="search" className="text-sm font-medium">Search by Title/Description</label>
                <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="search" placeholder="e.g., plumbing, catering" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              
              <div>
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                 <Button 
                    className={cn(
                        "w-full mt-1 justify-start text-left font-normal", 
                        {
                            "bg-primary/10 text-primary border border-primary hover:bg-primary/20 hover:text-foreground": isUsingGeoLocation,
                            "border border-input bg-background text-muted-foreground hover:bg-primary/10 hover:text-primary": !isUsingGeoLocation,
                        }
                    )} 
                    onClick={handleFindNearMe}
                >
                    <Navigation className="mr-2 h-4 w-4" /> 
                    {isUsingGeoLocation ? "Using Current Location" : "Find Jobs Near Me"}
                </Button>
                <LocationAutocomplete 
                    onLocationSelect={handleLocationSelect}
                    placeholder="Or type specific area (e.g. Ikeja)"
                    initialValue={currentLocation?.address.startsWith("Your Current Location") ? "" : currentLocation?.address}
                    className="mt-2"
                />
              </div>

              {isUsingGeoLocation && (
                <div>
                  <label htmlFor="radius" className="text-sm font-medium">Search Radius (km)</label>
                  <Slider
                    id="radius"
                    min={5}
                    max={100}
                    step={5}
                    value={[searchRadius]}
                    onValueChange={(value) => setSearchRadius(value[0])}
                    className="mt-2"
                    disabled={!currentLocation || !currentLocation.lat} 
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{searchRadius} km</span>
                  </div>
                  <FormDescription className="text-xs">Effective when "Find Jobs Near Me" is used.</FormDescription>
                </div>
              )}

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
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <h2 className="font-headline text-2xl font-semibold">Available Jobs ({isLoadingData ? '...' : filteredAndAugmentedRequests.length})</h2>
          {isLoadingData || isLoadingProposals ? (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="ml-3 text-muted-foreground">Loading jobs and your applications...</p>
            </div>
          ) : filteredAndAugmentedRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredAndAugmentedRequests.map(request => (
                <ServiceRequestCard 
                  key={request.id} 
                  request={request} 
                  currentUserRole={currentUserRole}
                  applicationStatus={request.currentUserApplicationStatus}
                />
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
