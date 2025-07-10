
import { PageHeader } from "@/components/ui/page-header";
import { EscrowInfo } from "@/components/payments/escrow-info";
import { ShieldCheck } from "lucide-react";
import type { EscrowTransaction, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { List } from "lucide-react";
import { getEscrowTransaction } from "@/lib/firestore"; 
import { getCurrentUser } from "@/lib/auth";


export default async function EscrowPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined }}) {
  const transactionId = typeof searchParams.transactionId === 'string' ? searchParams.transactionId : undefined;
  let specificTransaction: EscrowTransaction | null = null;
  
  const currentUser = await getCurrentUser();
  const currentUserRole = currentUser?.role || 'client';


  if (transactionId) {
    specificTransaction = await getEscrowTransaction(transactionId);
  }

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
      <EscrowInfo transaction={specificTransaction || undefined} currentUserRole={currentUserRole} />

      {!specificTransaction && (
        <div className="mt-8 text-center">
            <p className="text-muted-foreground">To view details of a specific transaction, please go to your transaction history.</p>
        </div>
      )}
    </div>
  );
}
