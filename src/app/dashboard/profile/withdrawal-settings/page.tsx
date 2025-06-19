import { PageHeader } from "@/components/ui/page-header";
import { WithdrawalSettingsForm } from "@/components/profile/withdrawal-settings-form";
import { CreditCard } from "lucide-react";
import type { WithdrawalAccount } from "@/types";

export default async function WithdrawalSettingsPage() {
  // Placeholder: In a real app, fetch existing withdrawal data for the logged-in artisan
  // const userId = await getCurrentUserId(); // Placeholder
  const userId = "mockArtisanUserId789"; 
  
  const existingData: Partial<WithdrawalAccount> | undefined = {
    bankName: "Guaranty Trust Bank (GTB)",
    accountNumber: "0123456789",
    accountName: "Artisan Full Name Mock",
    isVerified: true, // If previously verified
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Withdrawal Account Settings"
        description="Add or update your bank account details to receive payments for your services. All transactions are in Naira (₦)."
      />
      <WithdrawalSettingsForm userId={userId} initialData={existingData} />
    </div>
  );
}
