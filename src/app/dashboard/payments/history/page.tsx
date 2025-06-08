import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Eye, Download } from "lucide-react";
import type { EscrowTransaction } from "@/types";
import { format } from 'date-fns';

// Mock transaction data
const mockTransactions: EscrowTransaction[] = [
  { id: "txn_123abc", serviceRequestId: "req_catering_xyz", clientId: "client_jane_doe", artisanId: "artisan_john_bull", amount: 50000, platformFee: 5000, status: "funded", createdAt: new Date(2024, 5, 10), updatedAt: new Date(2024, 5, 12) },
  { id: "txn_456def", serviceRequestId: "req_plumbing_uvw", clientId: "client_john_doe", artisanId: "artisan_ada_eze", amount: 15000, platformFee: 1500, status: "released_to_artisan", createdAt: new Date(2024, 5, 1), updatedAt: new Date(2024, 5, 5) },
  { id: "txn_789ghi", serviceRequestId: "req_design_rst", clientId: "client_ada_obi", artisanId: "artisan_musa_ali", amount: 75000, platformFee: 7500, status: "disputed", createdAt: new Date(2024, 4, 20), updatedAt: new Date(2024, 4, 25) },
  { id: "txn_jklmno", serviceRequestId: "req_repair_qpr", clientId: "client_foo_bar", artisanId: "artisan_baz_qux", amount: 5000, platformFee: 500, status: "refunded_to_client", createdAt: new Date(2024, 4, 15), updatedAt: new Date(2024, 4, 18) },
];

export default async function TransactionHistoryPage() {
  // Placeholder: In a real app, fetch transactions for the logged-in user
  // const userId = await getCurrentUserId();
  // const transactions = await db.collection("escrowTransactions").where("clientId", "==", userId).orWhere("artisanId", "==", userId).orderBy("createdAt", "desc").get();
  const transactions = mockTransactions;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction History"
        description="View all your past and ongoing payment transactions on Zelo."
        icon={FileText}
        action={
            <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download Statement
            </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Transactions</CardTitle>
          <CardDescription>A log of all payments, fees, and payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Service Request ID</TableHead>
                  <TableHead className="text-right">Amount (₦)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{format(new Date(txn.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium truncate max-w-xs" title={txn.id}>{txn.id.substring(0,8)}...</TableCell>
                    <TableCell className="truncate max-w-xs" title={txn.serviceRequestId}>{txn.serviceRequestId.substring(0,10)}...</TableCell>
                    <TableCell className="text-right font-mono">{txn.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        txn.status === 'funded' ? 'default' :
                        txn.status === 'released_to_artisan' ? 'secondary' : // 'success' if available
                        txn.status === 'disputed' ? 'destructive' :
                        'outline'
                      } className="capitalize">{txn.status.replace('_', ' ')}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/payments/escrow?transactionId=${txn.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No transactions yet.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Your payment activities will appear here once you start using Zelo services.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
