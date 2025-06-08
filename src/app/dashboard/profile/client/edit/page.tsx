import { PageHeader } from "@/components/ui/page-header";
import { ClientProfileForm } from "@/components/profile/client-profile-form";
import { UserCog } from "lucide-react";
import type { ClientProfile } from "@/types";

export default async function EditClientProfilePage() {
  // Placeholder: In a real app, fetch existing profile data for the logged-in user
  // const userId = await getCurrentUserId(); // Placeholder
  const userId = "mockClientUserId456"; 
  
  const existingProfileData: Partial<ClientProfile & { fullName?: string, contactEmail?: string, avatarUrl?: string }> | undefined = {
    fullName: "Ada Chukwuma",
    contactEmail: "client@example.com", // Usually pre-filled from auth
    location: "Victoria Island, Lagos",
    avatarUrl: "https://placehold.co/128x128.png?text=Ada",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Client Profile"
        description="Keep your information up-to-date for a seamless experience on Zelo."
        icon={UserCog}
      />
      <ClientProfileForm userId={userId} initialData={existingProfileData} />
    </div>
  );
}
