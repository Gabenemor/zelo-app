
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Briefcase, Coins, MapPin, Search, Star, CalendarDays, Users } from 'lucide-react'; // Changed DollarSign to Coins
import type { ServiceRequest, ArtisanProfile } from '@/types'; // Assuming types exist
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import { LocationAutocomplete } from '@/components/location/location-autocomplete';

const NIGERIAN_ARTISAN_SERVICES_PUBLIC = [
  "All Services", "Tailoring/Fashion Design", "Plumbing", "Electrical Services", "Carpentry",
  "Hairdressing/Barbing", "Makeup Artistry", "Catering", "Event Planning",
  "Photography/Videography", "Graphic Design", "Web Development", "Appliance Repair",
  "AC Repair & Installation", "Generator Repair", "Welding/Fabrication", "Painting",
  "Tiling", "POP Ceiling Installation", "Car Mechanic", "Home Cleaning", "Other"
] as const;


const mockServiceRequests: ServiceRequest[] = [
  { id: "pub_req1", clientId: "client_pub_1", title: "Urgent: Fix Leaky Kitchen Faucet in Ikeja", description: "My kitchen faucet is dripping constantly. Need a plumber ASAP.", category: "Plumbing", location: "Ikeja, Lagos", budget: 7000, postedAt: new Date(Date.now() - 86400000 * 1), status: "open" },
  { id: "pub_req2", clientId: "client_pub_2", title: "Birthday Party Catering - 30 Guests", description: "Looking for reliable catering for a small birthday party. Nigerian & continental dishes.", category: "Catering", location: "Lekki Phase 1, Lagos", budget: 120000, postedAt: new Date(Date.now() - 86400000 * 3), status: "open" },
  { id: "pub_req3", clientId: "client_pub_3", title: "Aso Ebi Tailoring for Wedding (10 outfits)", description: "Need an experienced tailor for Aso Ebi (Ankara). Multiple sizes.", category: "Tailoring/Fashion Design", location: "Surulere, Lagos", postedAt: new Date(Date.now() - 86400000 * 2), status: "open" },
  { id: "pub_req4", clientId: "client_pub_4", title: "Professional House Painting (3 Bedroom)", description: "Interior painting needed for a 3-bedroom apartment. Quality finish required.", category: "Painting", location: "Garki, Abuja", budget: 90000, postedAt: new Date(Date.now() - 86400000 * 5), status: "open" },
];

const mockArtisans: (Pick<ArtisanProfile, 'userId' | 'username' | 'profilePhotoUrl' | 'location' | 'servicesOffered'> & { rating: number })[] = [
  { userId: "art_pub_1", username: "Adewale Plumbing Masters", profilePhotoUrl: "https://placehold.co/80x80.png?text=AP", location: "Ikeja, Lagos", servicesOffered: ["Plumbing"], rating: 4.7 },
  { userId: "art_pub_2", username: "Chioma's Exquisite Catering", profilePhotoUrl: "https://placehold.co/80x80.png?text=CC", location: "Lekki, Lagos", servicesOffered: ["Catering"], rating: 4.9 },
  { userId: "art_pub_3", username: "Bola Stitches Fashion House", profilePhotoUrl: "https://placehold.co/80x80.png?text=BS", location: "Surulere, Lagos", servicesOffered: ["Tailoring/Fashion Design"], rating: 4.8 },
  { userId: "art_pub_4", username: "Musa Power Electrics", profilePhotoUrl: "https://placehold.co/80x80.png?text=ME", location: "Wuse, Abuja", servicesOffered: ["Electrical Services"], rating: 4.5 },
];


export default function BrowseServicesPublicPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredRequests = mockServiceRequests.filter(req =>
    (req.title.toLowerCase().includes(searchTerm.toLowerCase()) || req.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedCategory === "All Services" || req.category === selectedCategory) &&
    (req.location.toLowerCase().includes(locationFilter.toLowerCase()))
  );

  const filteredArtisans = mockArtisans.filter(artisan =>
    (artisan.username?.toLowerCase().includes(searchTerm.toLowerCase()) || artisan.servicesOffered.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (selectedCategory === "All Services" || artisan.servicesOffered.includes(selectedCategory)) &&
    (artisan.location?.toLowerCase().includes(locationFilter.toLowerCase()))
  );


  return (
    <div className="flex min-h-screen flex-col bg-background lg:px-[5%]">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign Up <ArrowRight className="ml-2 h-4 w-4 hidden sm:inline-block" /></Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <PageHeader
          title="Explore Services & Artisans"
          description="Find job opportunities or skilled professionals across Nigeria."
        />

        <Card className="mb-8 shadow-md">
          <CardContent className="p-4 sm:p-6 space-y-4 md:flex md:items-end md:gap-4 md:space-y-0">
            <div className="flex-grow md:w-1/3">
              <label htmlFor="category-filter" className="text-sm font-medium text-muted-foreground">Service Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category-filter" className="w-full mt-1">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIAN_ARTISAN_SERVICES_PUBLIC.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="flex-grow md:w-1/3">
              <label htmlFor="search-term" className="text-sm font-medium text-muted-foreground">Search by Keyword</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="search-term" placeholder="e.g., plumbing, catering, Adewale" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="flex-grow md:w-1/3">
              <label htmlFor="location-filter" className="text-sm font-medium text-muted-foreground">Location</label>
               <LocationAutocomplete
                onLocationSelect={(loc) => setLocationFilter(loc.address)}
                initialValue={locationFilter}
                placeholder="e.g., Lagos, Abuja"
                className="mt-1"
              />
            </div>
            {/* <Button className="w-full md:w-auto md:self-end">Apply Filters</Button> */}
          </CardContent>
        </Card>

        <section className="mb-12">
          <h2 className="font-headline text-2xl font-semibold mb-6 text-foreground">Open Job Requests ({filteredRequests.length})</h2>
          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.map(request => (
                <PublicServiceRequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Briefcase className="mx-auto h-12 w-12 mb-4" />
              <p>No open job requests match your current filters. Try adjusting your search!</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="font-headline text-2xl font-semibold mb-6 text-foreground">Featured Artisans ({filteredArtisans.length})</h2>
          {filteredArtisans.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredArtisans.map(artisan => (
                <PublicArtisanCard key={artisan.userId} artisan={artisan} />
              ))}
            </div>
          ) : (
             <div className="text-center py-10 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <p>No artisans match your current filters. Try a broader search!</p>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t bg-background py-8 mt-12">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Zelo. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


interface PublicServiceRequestCardProps {
  request: ServiceRequest;
}

function PublicServiceRequestCard({ request }: PublicServiceRequestCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-lg line-clamp-2">{request.title}</CardTitle>
         <div className="flex items-center justify-between text-xs">
            <Badge variant="secondary" className="capitalize">{request.category}</Badge>
             {request.budget && (
                <span className="font-semibold text-primary flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5" />
                    ₦{request.budget.toLocaleString()}
                </span>
            )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{request.description}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {request.location}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground pt-0">
         <CalendarDays className="h-3.5 w-3.5 mr-1.5" /> Posted {formatDistanceToNow(new Date(request.postedAt), { addSuffix: true })}
      </CardFooter>
    </Card>
  );
}

interface PublicArtisanCardProps {
  artisan: Pick<ArtisanProfile, 'userId' | 'username' | 'profilePhotoUrl' | 'location' | 'servicesOffered'> & { rating: number };
}

function PublicArtisanCard({ artisan }: PublicArtisanCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
      <CardContent className="p-4 flex flex-col items-center text-center flex-grow">
        <Avatar className="h-20 w-20 mb-3 border-2 border-primary">
          <AvatarImage
            src={artisan.profilePhotoUrl || `https://placehold.co/80x80.png`}
            alt={artisan.username || 'Artisan'}
            data-ai-hint="profile avatar"
            className="object-cover"
          />
          <AvatarFallback>{artisan.username ? artisan.username.substring(0, 2).toUpperCase() : "AR"}</AvatarFallback>
        </Avatar>
        <h3 className="font-headline text-md font-semibold text-foreground mb-1 line-clamp-2">{artisan.username || 'Skilled Artisan'}</h3>
        <p className="text-xs text-primary font-medium mb-1 line-clamp-1">{artisan.servicesOffered.join(', ')}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <MapPin className="h-3 w-3" /> {artisan.location || 'Nigeria'}
        </div>
        <div className="flex items-center gap-0.5 text-yellow-500">
          {[...Array(Math.floor(artisan.rating))].map((_, i) => <Star key={`full-${i}`} className="h-3.5 w-3.5 fill-current" />)}
          {artisan.rating % 1 >= 0.5 && <Star key="half" className="h-3.5 w-3.5 fill-current opacity-50" />}
          {[...Array(5 - Math.ceil(artisan.rating))].map((_, i) => <Star key={`empty-${i}`} className="h-3.5 w-3.5 text-muted-foreground/50" />)}
          <span className="text-xs text-muted-foreground ml-1">({artisan.rating.toFixed(1)})</span>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
         <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/register?intent=contact&artisanId=${artisan.userId}`}>View Profile & Contact</Link>
          </Button>
      </CardFooter>
    </Card>
  );
}
