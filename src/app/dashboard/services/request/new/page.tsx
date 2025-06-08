import { PageHeader } from "@/components/ui/page-header";
import { ServiceRequestForm } from "@/components/service-requests/service-request-form";
import { PlusCircle } from "lucide-react";

export default async function NewServiceRequestPage() {
  // Placeholder: In a real app, get the logged-in client's ID
  // const clientId = await getCurrentUserId(); // Placeholder
  const clientId = "mockClientUser456"; 

  return (
    <div className="space-y-6">
      <PageHeader
        title="Post a New Service Request"
        description="Clearly describe the service you need, and let skilled Zelo artisans find you. All amounts are in Naira (₦)."
        icon={PlusCircle}
      />
      <ServiceRequestForm clientId={clientId} />
    </div>
  );
}
