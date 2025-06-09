
import { PageHeader } from "@/components/ui/page-header";
import { ArtisanProfileForm } from "@/components/profile/artisan-profile-form";
import { UserCircle2 } from "lucide-react";
import type { ArtisanProfile } from "@/types";

export default async function EditArtisanProfilePage() {
  // Placeholder: In a real app, fetch existing profile data for the logged-in user
  // const userId = await getCurrentUserId(); // Placeholder for getting current user's ID
  const userId = "mockUserId123";

  // Placeholder for fetching existing data
  const existingProfileData: Partial<ArtisanProfile> | undefined = {
    userId: userId,
    username: "MasterCraftsman",
    profilePhotoUrl: "https://placehold.co/128x128.png?text=MC",
    headline: "Top-tier solutions for your home and business needs!",
    contactEmail: "artisan@example.com", // Usually pre-filled from auth
    contactPhone: "+2348012345678",
    location: "Surulere, Lagos",
    servicesOffered: ["Tailoring/Fashion Design", "Plumbing"], // Services offered
    serviceExperiences: [ // Corresponding experiences
      { serviceName: "Tailoring/Fashion Design", years: 10, chargeAmount: 20000, chargeDescription: "per outfit" },
      { serviceName: "Plumbing", years: 5, chargeAmount: 5000, chargeDescription: "call-out fee" }
    ],
    bio: "Dedicated artisan with a passion for quality and customer satisfaction. Over 10 years in tailoring and 5 in plumbing, bringing reliability to every job.",
    isLocationPublic: true,
    availabilityStatus: 'available',
    portfolioImageUrls: [
      "https://placehold.co/300x200.png?text=Work+1",
      "https://placehold.co/300x200.png?text=Work+2"
    ],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Artisan Profile"
        description="Showcase your skills and services to attract clients on Zelo. All amounts are in Naira (₦)."
        icon={UserCircle2}
      />
      <ArtisanProfileForm
        userId={userId}
        initialData={existingProfileData}
        isOnboarding={false} // Explicitly set for clarity when editing vs onboarding
      />
    </div>
  );
}
