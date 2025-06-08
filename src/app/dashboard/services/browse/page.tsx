"use client";

import React, { useState } from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { MapView } from "@/components/location/map-view";
import { LocationAutocomplete } from "@/components/location/location-autocomplete";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Briefcase, MapPin, Search, ListFilter, User, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock data
const mockServices = [
  { id: "1", artisanName: "Adewale Plumbing", service: "Plumbing", location: "Ikeja, Lagos", rating: 4.5, priceRange: "₦5,000 - ₦20,000", avatar: "https://placehold.co/80x80.png?text=AP" },
  { id: "2", artisanName: "Chioma's Catering", service: "Catering", location: "Lekki, Lagos", rating: 4.8, priceRange: "₦10,000 per head", avatar: "https://placehold.co/80x80.png?text=CC" },
  { id: "3", artisanName: "Musa Electrics", service: "Electrical Repair", location: "Wuse, Abuja", rating: 4.2, priceRange: "By quote", avatar: "https://placehold.co/80x80.png?text=ME" },
  { id: "4", artisanName: "Bola Fashion House", service: "Tailoring", location: "Surulere, Lagos", rating: 4.9, priceRange: "From ₦15,000", avatar: "https://placehold.co/80x80.png?text=BFH" },
];

const serviceCategories = ["Plumbing", "Catering", "Electrical Repair", "Tailoring", "Carpentry", "Hairdressing"];

export default function BrowseServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]); // Example price range in Naira
  const [currentLocation, setCurrentLocation] = useState<{ address: string; lat?: number; lng?: number } | null>(null);

  const handleLocationSelect = (location: { address: string; lat?: number; lng?: number }) => {
    setCurrentLocation(location);
    console.log("Selected location:", location);
    // Trigger map update or service refetch based on location
  };

  const filteredServices = mockServices.filter(service => 
    (service.artisanName.toLowerCase().includes(searchTerm.toLowerCase()) || service.service.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory ? service.service === selectedCategory : true)
    // Add price range and location filtering here if data supports it
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Browse Services & Artisans"
        description="Find skilled professionals near you for any service you need in Nigeria."
        icon={Briefcase}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Filters Column */}
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
                 <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category" className="w-full mt-1">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {serviceCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="price" className="text-sm font-medium">Price Range (₦)</label>
                <Slider
                  id="price"
                  min={0}
                  max={100000}
                  step={1000}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mt-2"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>₦{priceRange[0].toLocaleString()}</span>
                  <span>₦{priceRange[1].toLocaleString()}</span>
                </div>
              </div>
               <Button className="w-full">Apply Filters</Button>
            </CardContent>
          </Card>
        </div>

        {/* Map and Results Column */}
        <div className="lg:col-span-2 space-y-6">
          <MapView className="h-[300px] md:h-[400px]" />
          
          <h2 className="font-headline text-2xl font-semibold">Available Artisans ({filteredServices.length})</h2>
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredServices.map(service => (
                <Card key={service.id} className="overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-4">
                     <Image src={service.avatar} alt={service.artisanName} width={60} height={60} className="rounded-full border" data-ai-hint="profile avatar" />
                    <div className="grid gap-1">
                      <CardTitle className="font-headline text-lg group-hover:underline">{service.artisanName}</CardTitle>
                      <CardDescription className="text-primary font-semibold">{service.service}</CardDescription>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {service.location}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Rating: {service.rating}/5 ⭐</span>
                        <span className="font-medium text-foreground">{service.priceRange}</span>
                    </div>
                    <Button asChild variant="outline" className="mt-3 w-full">
                        <Link href={`/dashboard/artisans/${service.id}`}>View Profile</Link>
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
