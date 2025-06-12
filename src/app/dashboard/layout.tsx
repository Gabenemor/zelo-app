
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { Toaster } from "@/components/ui/toaster"; 
import { AuthProvider } from "@/components/providers/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6 bg-background w-full lg:w-[90%] mx-auto">
          {children}
        </main>
        <Toaster /> 
      </div>
    </AuthProvider>
  );
}
