
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { Toaster } from "@/components/ui/toaster"; // Assuming Toaster might be used in dashboard pages

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-4 sm:p-6 bg-background max-w-7xl mx-auto w-full">
        {children}
      </main>
      <Toaster /> {/* Ensure Toaster is available if sub-components use toasts */}
    </div>
  );
}
