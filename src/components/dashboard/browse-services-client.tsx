
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from "@/components/ui/page-header";
import { LocationAutocomplete } from "@/components/location/location-autocomplete";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Briefcase, MapPin, Search, ListFilter, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils"; 
import type { ArtisanProfile, NigerianArtisanService } from '@/types';
import { getArtisans } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { NIGERIAN_ARTISAN_SERVICES } from '@/types';

const ALL_CATEGORIES_ITEM_VALUE = "_all_";

export function BrowseServicesClient() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const roleFromParams = searchParams.get('role') || 'client';

  const [allArtisans, setAllArtisans] = useState<ArtisanProfile[]>([]);
  const [filteredArtisans, setFilteredArtisans] = useState<ArtisanProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NigerianArtisanService | typeof ALL_CATEGORIES_ITEM_VALUE>(ALL_CATEGORIES_ITEM_VALUE);
  const [priceRange, setPriceRange] = useState([0, 1000000]); // Increased max for realism
  const [currentLocation, setCurrentLocation] = useState<{ address: string; lat?: number; lng?: number } | null>(null);

  const fetchArtisans = useCallback(async () => {
    setIsLoading(true);
    try {
      const artisansFromDb = await getArtisans({ limit: 50 }); // Fetch initial set
      setAllArtisans(artisansFromDb);
      setFilteredArtisans(artisansFromDb); // Initially show all fetched
    } catch (error) {
      console.error("Error fetching artisans:", error);
      toast({ title: "Error", description: "Could not load artisans.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchArtisans();
  }, [fetchArtisans]);

  useEffect(() => {
    let tempArtisans = allArtisans;

    if (searchTerm) {
      tempArtisans = tempArtisans.filter(artisan =>
        (artisan.username?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        (artisan.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || "") ||
        (artisan.servicesOffered.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    if (selectedCategory !== ALL_CATEGORIES_ITEM_VALUE) {
      tempArtisans = tempArtisans.filter(artisan => artisan.servicesOffered.includes(selectedCategory));
    }
    
    if (currentLocation?.address) {
        // Basic location filter (can be improved with geo-queries if lat/lng are reliably available)
        tempArtisans = tempArtisans.filter(artisan => artisan.location?.toLowerCase().includes(currentLocation.address.split(',')[0].trim().toLowerCase()));
    }
    
    // Placeholder for price range filter if artisan profiles store typical charges
    // tempArtisans = tempArtisans.filter(artisan => {
    //    const avgCharge = artisan.serviceExperiences?.[0]?.chargeAmount; // Example
    //    return avgCharge ? avgCharge >= priceRange[0] && avgCharge <= priceRange[1] : true;
    // });

    setFilteredArtisans(tempArtisans);
  }, [searchTerm, selectedCategory, currentLocation, priceRange, allArtisans]);


  const handleLocationSelect = (location: { address: string; lat?: number; lng?: number }) => {
    setCurrentLocation(location);
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Services & Artisans"
        description="Find skilled professionals near you for any service you need in Nigeria."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline"><ListFilter className="h-5 w-5 text-primary" /> Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="search" className="text-sm font-medium">Search by Name/Service</label>
                <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="search" placeholder="e.g., Plumber, Adewale" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div>
                <label htmlFor="location" className="text-sm font-medium">Location</label>
                <LocationAutocomplete
                  onLocationSelect={handleLocationSelect}
                  placeholder="Enter your area in Nigeria"
                  initialValue={currentLocation?.address}
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="category" className="text-sm font-medium">Service Category</label>
                 <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as NigerianArtisanService | typeof ALL_CATEGORIES_ITEM_VALUE)}>
                  <SelectTrigger id="category" className="w-full mt-1">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_CATEGORIES_ITEM_VALUE}>All Categories</SelectItem>
                    {NIGERIAN_ARTISAN_SERVICES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="price" className="text-sm font-medium">Price Range (₦)</label>
                <Slider
                  id="price"
                  min={0}
                  max={1000000}
                  step={10000}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mt-2"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>₦{priceRange[0].toLocaleString()}</span>
                  <span>₦{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-headline text-2xl font-semibold">Available Artisans ({isLoading ? "..." : filteredArtisans.length})</h2>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredArtisans.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredArtisans.map(artisan => (
                <Card key={artisan.userId} className="overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
                     <Image 
                        src={artisan.profilePhotoUrl || "https://placehold.co/80x80.png?text=AR"} 
                        alt={artisan.username || artisan.fullName || "Artisan"} 
                        width={60} 
                        height={60} 
                        className="rounded-full border object-cover" 
                        data-ai-hint="profile avatar"
                     />
                    <div className="grid gap-1">
                      <CardTitle className="font-headline text-lg group-hover:underline">{artisan.username || artisan.fullName}</CardTitle>
                      <CardDescription className="text-primary font-semibold">{artisan.servicesOffered.join(', ')}</CardDescription>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {artisan.location || "Nigeria"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        {/* Placeholder for rating and price if available */}
                        {/* <span>Rating: {artisan.rating || 'N/A'}/5 ⭐</span> */}
                        {/* <span className="font-medium text-foreground">{artisan.priceRange || "By Quote"}</span> */}
                    </div>
                     <p className="text-xs text-muted-foreground line-clamp-2 h-8 mb-2">{artisan.headline || "Skilled professional ready to serve."}</p>
                    <Button asChild variant="outline" className="mt-3 w-full">
                        <Link href={`/dashboard/artisans/${artisan.userId}?role=${roleFromParams}`}>View Profile</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No artisans found matching your criteria. Try adjusting your filters.</p>
          )}
        </div>
      </div>
    </div>
  );
}
