
import { PageHeader } from "@/components/ui/page-header";
import { ClientProfileForm } from "@/components/profile/client-profile-form";
import { UserCog } from "lucide-react";
import type { ClientProfile } from "@/types";

export default async function EditClientProfilePage() {
  const userId = "mockClientUserId456"; 
  
  const existingProfileData: Partial<ClientProfile> | undefined = {
    userId: userId,
    fullName: "Ada Chukwuma",
    contactEmail: "client@example.com", 
    location: "Victoria Island, Lagos",
    avatarUrl: "https://placehold.co/128x128.png?text=Ada",
    servicesLookingFor: ["Plumbing", "Catering", "Electrical Services"], // Mock interested services
    isLocationPublic: true,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Client Profile"
        description="Keep your information up-to-date for a seamless experience on Zelo."
      />
      <ClientProfileForm userId={userId} initialData={existingProfileData} />
    </div>
  );
}
