
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
    contactEmail: "artisan@example.com", // Usually pre-filled from auth
    contactPhone: "+2348012345678",
    location: "Surulere, Lagos",
    servicesOffered: ["Tailoring/Fashion Design", "Plumbing"], // Services offered
    serviceExperiences: [ // Corresponding experiences
      { serviceName: "Tailoring/Fashion Design", years: 10 },
      { serviceName: "Plumbing", years: 5 }
    ],
    bio: "Dedicated artisan with a passion for quality and customer satisfaction.",
    serviceChargeAmount: 15000,
    serviceChargeDescription: "per project, negotiable",
    isLocationPublic: true,
    portfolioImageUrls: ["https://placehold.co/300x200.png", "https://placehold.co/300x200.png"],
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
        onSaveSuccess={() => {
          // Optional: redirect or show specific message after successful save from edit page
          console.log("Profile updated from edit page.");
        }}
      />
    </div>
  );
}
