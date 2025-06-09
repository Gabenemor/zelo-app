
// src/app/dashboard/artisans/[id]/page.tsx
import { PageHeader } from "@/components/ui/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { UserCircle2, Mail, Phone, MapPin, Briefcase, CalendarDays, DollarSign, MessageSquare, Star, Info, PlusCircle } from "lucide-react";
import type { ArtisanProfile, ServiceExperience } from "@/types";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Mock data for artisan profiles - in a real app, fetch this from your backend
const mockArtisanProfiles: ArtisanProfile[] = [
  {
    userId: "1", // Corresponds to Adewale Plumbing id in browse page
    username: "AdewaleThePlumber",
    contactEmail: "adewale.plumbing@example.com",
    contactPhone: "+2348012345001",
    location: "Ikeja, Lagos",
    bio: "Your reliable and experienced plumber for all residential and commercial needs in Lagos. No job too small, no leak too stubborn!",
    servicesOffered: ["Plumbing"],
    serviceExperiences: [
      { serviceName: "Plumbing", years: 12, chargeAmount: 5000, chargeDescription: "per call-out" },
    ],
    portfolioImageUrls: [
      "https://placehold.co/400x300.png?text=Plumbing+Work+1",
      "https://placehold.co/400x300.png?text=Plumbing+Work+2",
    ],
    isLocationPublic: true,
  },
  {
    userId: "2", // Corresponds to Chioma's Catering
    username: "ChiomasKitchen",
    contactEmail: "chioma.catering@example.com",
    contactPhone: "+2348012345002",
    location: "Lekki, Lagos",
    bio: "Delicious homemade meals for your events. Specializing in Nigerian cuisine, small chops, and custom cakes. Let's make your event memorable!",
    servicesOffered: ["Catering"],
    serviceExperiences: [
      { serviceName: "Catering", years: 8, chargeAmount: 10000, chargeDescription: "per head (min 20)" },
    ],
    portfolioImageUrls: [
      "https://placehold.co/400x300.png?text=Catering+Dish+1",
      "https://placehold.co/400x300.png?text=Event+Setup",
      "https://placehold.co/400x300.png?text=Delicious+Cake",
    ],
    isLocationPublic: false,
  },
  {
    userId: "3", // Corresponds to Musa Electrics
    username: "MusaSpark",
    contactEmail: "musa.electrics@example.com",
    location: "Wuse, Abuja",
    bio: "Certified electrician providing safe and reliable electrical installation, repair, and maintenance services in Abuja and environs.",
    servicesOffered: ["Electrical Services"], // Changed from "Electrical Repair" to match NIGERIAN_ARTISAN_SERVICES
    serviceExperiences: [
      { serviceName: "Electrical Services", years: 15, chargeAmount: 7500, chargeDescription: "inspection fee" },
    ],
    isLocationPublic: true,
  },
   {
    userId: "4", // Corresponds to Bola Fashion House
    username: "BolaStitches",
    contactEmail: "bola.fashion@example.com",
    contactPhone: "+2348012345004",
    location: "Surulere, Lagos",
    bio: "Exquisite tailoring and fashion design services. From traditional attires to modern chic outfits, we bring your style to life.",
    servicesOffered: ["Tailoring/Fashion Design"], // Changed from "Tailoring"
    serviceExperiences: [
      { serviceName: "Tailoring/Fashion Design", years: 10, chargeAmount: 25000, chargeDescription: "per outfit (avg.)" },
    ],
    portfolioImageUrls: [
      "https://placehold.co/400x300.png?text=Fashion+Design+1",
      "https://placehold.co/400x300.png?text=Tailored+Outfit",
    ],
    isLocationPublic: true,
  },
];

// Helper function to get artisan (replace with actual data fetching)
async function getArtisanById(id: string): Promise<ArtisanProfile | undefined> {
  return mockArtisanProfiles.find(artisan => artisan.userId === id);
}

export default async function ArtisanProfilePage({ params }: { params: { id: string } }) {
  const artisan = await getArtisanById(params.id);

  if (!artisan) {
    return (
      <div className="container mx-auto py-8 text-center">
        <PageHeader title="Artisan Not Found" description="The requested artisan profile could not be located." icon={UserCircle2} />
        <p className="mt-4 text-muted-foreground">Please check the ID or try again later.</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard/services/browse">Back to Browse Artisans</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={artisan.username || `Artisan ${artisan.userId}`}
        description={`Public profile for ${artisan.username || 'this artisan'}.`}
        icon={UserCircle2}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Avatar, Contact, Location */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-32 w-32 border-4 border-primary mb-4">
                <AvatarImage src={artisan.portfolioImageUrls?.[0] || `https://placehold.co/128x128.png?text=${artisan.username?.substring(0,2) || 'A'}`} alt={artisan.username || 'Artisan'} data-ai-hint="profile avatar" />
                <AvatarFallback>{artisan.username ? artisan.username.substring(0, 2).toUpperCase() : "AR"}</AvatarFallback>
              </Avatar>
              <CardTitle className="font-headline text-2xl">{artisan.username || `Artisan ${artisan.userId}`}</CardTitle>
              {/* Placeholder for rating */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span>4.5 (12 Reviews)</span> {/* Mock rating */}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {artisan.contactEmail && (
                <InfoItem icon={Mail} label="Email" value={artisan.contactEmail} isLink={`mailto:${artisan.contactEmail}`} />
              )}
              {artisan.contactPhone && (
                <InfoItem icon={Phone} label="Phone" value={artisan.contactPhone} isLink={`tel:${artisan.contactPhone}`} />
              )}
              {artisan.location && (
                <InfoItem icon={MapPin} label="Location" value={artisan.isLocationPublic ? artisan.location : `${artisan.location?.split(',')[0]}, General Area`} />
              )}
              <Separator className="my-3" />
              <Button className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" /> Contact Artisan
              </Button>
               <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Request Service
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Bio, Services, Portfolio */}
        <div className="lg:col-span-2 space-y-6">
          {artisan.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">About {artisan.username || 'Me'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{artisan.bio}</p>
              </CardContent>
            </Card>
          )}

          {artisan.serviceExperiences && artisan.serviceExperiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl flex items-center gap-2"><Briefcase className="text-primary h-5 w-5"/> Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {artisan.serviceExperiences.map((exp, index) => (
                    <AccordionItem value={`service-${index}`} key={index}>
                      <AccordionTrigger className="font-semibold text-md hover:no-underline">
                        {exp.serviceName}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2 pt-2 text-sm">
                        <InfoItem icon={CalendarDays} label="Experience" value={`${exp.years} years`} />
                        {exp.chargeAmount && (
                           <InfoItem icon={DollarSign} label="Typical Charge" value={`₦${exp.chargeAmount.toLocaleString()} ${exp.chargeDescription || ''}`.trim()} />
                        )}
                         {!exp.chargeAmount && (
                           <InfoItem icon={Info} label="Pricing" value="Available upon request" />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {artisan.portfolioImageUrls && artisan.portfolioImageUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-xl">Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {artisan.portfolioImageUrls.map((url, index) => (
                  <div key={index} className="aspect-video w-full overflow-hidden rounded-lg border shadow-sm">
                    <Image
                      src={url}
                      alt={`Portfolio work ${index + 1} by ${artisan.username || 'artisan'}`}
                      width={300}
                      height={200}
                      className="object-cover w-full h-full transition-transform hover:scale-105"
                      data-ai-hint="portfolio work"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
    isLink?: string;
}
function InfoItem({ icon: Icon, label, value, isLink }: InfoItemProps) {
    const content = isLink ? (
        <Link href={isLink} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{value}</Link>
    ) : (
        <span className="text-foreground">{value}</span>
    );
    return (
        <div className="flex items-start gap-2">
            <Icon className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                {content}
            </div>
        </div>
    )
}
