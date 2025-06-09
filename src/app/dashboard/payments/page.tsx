
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard, DollarSign, List, TrendingUp, Download } from "lucide-react";

// Mock payment summary data for an artisan
const mockPaymentSummary = {
  availableForWithdrawal: 125000, // Naira
  pendingPayouts: 45000, // Naira
  totalEarnedLifetime: 850000, // Naira
};

export default function PaymentsOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments Overview"
        description="Track your earnings, manage withdrawals, and view transaction history."
        icon={CreditCard}
        action={
            <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download Statement
            </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Available for Withdrawal" 
          value={`₦${mockPaymentSummary.availableForWithdrawal.toLocaleString()}`} 
          icon={DollarSign}
          color="text-green-500"
        />
        <StatCard 
          title="Pending Payouts" 
          value={`₦${mockPaymentSummary.pendingPayouts.toLocaleString()}`} 
          icon={DollarSign}
          color="text-yellow-500"
          description="From recently completed jobs"
        />
        <StatCard 
          title="Lifetime Earnings" 
          value={`₦${mockPaymentSummary.totalEarnedLifetime.toLocaleString()}`} 
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Payment Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Button asChild variant="default" className="w-full">
            <Link href="/dashboard/profile/withdrawal-settings">
              Manage Withdrawal Account
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/payments/history">
              <List className="mr-2 h-4 w-4" /> View Transaction History
            </Link>
          </Button>
          {/* Future: Request Withdrawal Button */}
          {/* <Button className="w-full sm:col-span-2" disabled>Request Withdrawal (Coming Soon)</Button> */}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline">Understanding Your Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Available for Withdrawal:</strong> Funds from completed jobs that are ready to be transferred to your bank account.</p>
            <p><strong>Pending Payouts:</strong> Earnings from jobs marked as complete by clients, currently undergoing processing before becoming available for withdrawal. This usually takes a few business days.</p>
            <p><strong>Platform Fee:</strong> Zelo charges a 10% service fee on completed jobs, which is automatically deducted before payouts.</p>
             <Button asChild variant="link" className="p-0 h-auto text-sm">
                <Link href="/dashboard/payments/escrow">Learn more about Zelo Secure Escrow</Link>
            </Button>
        </CardContent>
      </Card>


    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color?: string;
  description?: string;
}

function StatCard({ title, value, icon: Icon, color = "text-primary", description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
}
