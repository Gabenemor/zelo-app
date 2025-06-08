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
    contactEmail: "artisan@example.com", // Usually pre-filled from auth
    location: "Surulere, Lagos",
    servicesOffered: ["Tailoring/Fashion Design", "Plumbing"],
    // ... other fields
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Artisan Profile"
        description="Showcase your skills and services to attract clients on Zelo. All amounts are in Naira (₦)."
        icon={UserCircle2}
      />
      <ArtisanProfileForm userId={userId} initialData={existingProfileData} />
    </div>
  );
}
