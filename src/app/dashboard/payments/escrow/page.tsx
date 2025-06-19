
import { PageHeader } from "@/components/ui/page-header";
import { EscrowInfo } from "@/components/payments/escrow-info";
import { ShieldCheck } from "lucide-react";
import type { EscrowTransaction, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { List } from "lucide-react";

// Mock transaction data for demonstration
const mockEscrowTransactions: EscrowTransaction[] = [
  {
    id: "txn_123abc",
    serviceRequestId: "req_catering_xyz",
    clientId: "client_jane_doe",
    artisanId: "artisan_john_bull",
    amount: 50000, // Total amount paid by client
    platformFee: 5000, // 10% of 50000
    status: "funded",
    createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
    updatedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
  },
  {
    id: "txn_456def",
    serviceRequestId: "req_plumbing_uvw",
    clientId: "client_john_doe",
    artisanId: "artisan_ada_eze",
    amount: 15000,
    platformFee: 1500,
    status: "released_to_artisan",
    createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
    updatedAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
  },
];

// Simulate fetching current user type (replace with actual auth logic)
const getCurrentUserRole = async (): Promise<UserRole> => {
  // Change this to 'client' or 'admin' to test different views
  return 'artisan'; 
};


export default async function EscrowPage({ searchParams }: { searchParams?: { transactionId?: string }}) {
  const transactionId = searchParams?.transactionId;
  let specificTransaction: EscrowTransaction | undefined = undefined;
  const currentUserRole = await getCurrentUserRole();

  if (transactionId) {
    // In a real app, fetch the specific transaction by ID
    specificTransaction = mockEscrowTransactions.find(t => t.id === transactionId);
  }
  // For now, let's pick the first one if no ID is passed but to demonstrate the single view
  // specificTransaction = mockEscrowTransactions[0]; 


  return (
    <div className="space-y-6">
      <PageHeader
        title={specificTransaction ? "Escrow Transaction Details" : "Zelo Secure Escrow"}
        description={specificTransaction ? `Details for transaction ID: ${specificTransaction.id}` : "Understand how Zelo protects your payments."}
        action={!specificTransaction && (
            <Button asChild variant="outline">
                <Link href="/dashboard/payments/history">
                    <List className="mr-2 h-4 w-4" /> View All Transactions
                </Link>
            </Button>
        )}
      />
      <EscrowInfo transaction={specificTransaction} currentUserRole={currentUserRole} />

      {!specificTransaction && (
        <div className="mt-8 text-center">
            <p className="text-muted-foreground">To view details of a specific transaction, please go to your transaction history.</p>
        </div>
      )}
    </div>
  );
}
