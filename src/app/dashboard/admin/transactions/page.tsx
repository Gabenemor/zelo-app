
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Search, SlidersHorizontal, Eye, Download } from "lucide-react";
import type { EscrowTransaction } from "@/types";
import { format } from 'date-fns';

// Mock transaction data (EscrowTransaction type already exists)
const mockTransactions: EscrowTransaction[] = [
  { id: "txn_123abc", serviceRequestId: "job_002", clientId: "client_002", artisanId: "artisan_001", amount: 120000, platformFee: 12000, status: "funded", createdAt: new Date(2024, 4, 11), updatedAt: new Date(2024, 4, 11) },
  { id: "txn_456def", serviceRequestId: "job_003", clientId: "client_003", artisanId: "artisan_003", amount: 80000, platformFee: 8000, status: "released_to_artisan", createdAt: new Date(2024, 3, 22), updatedAt: new Date(2024, 4, 1) },
  { id: "txn_789ghi", serviceRequestId: "job_005", clientId: "client_004", artisanId: "artisan_005", amount: 150000, platformFee: 15000, status: "disputed", createdAt: new Date(2024, 5, 6), updatedAt: new Date(2024, 5, 10) },
  { id: "txn_jklmno", serviceRequestId: "job_008_refund", clientId: "client_005", artisanId: "artisan_006", amount: 25000, platformFee: 2500, status: "refunded_to_client", createdAt: new Date(2024, 2, 15), updatedAt: new Date(2024, 2, 18) },
];

const transactionStatusOptions: EscrowTransaction['status'][] = ["funded", "released_to_artisan", "refunded_to_client", "disputed"];

export default function AdminTransactionLogsPage() {
  const transactions = mockTransactions;

  const getStatusBadgeColor = (status: EscrowTransaction["status"]) => {
     switch (status) {
      case 'funded': return 'bg-blue-500/20 text-blue-700 border-blue-400';
      case 'released_to_artisan': return 'bg-green-500/20 text-green-700 border-green-400';
      case 'refunded_to_client': return 'bg-orange-500/20 text-orange-700 border-orange-400';
      case 'disputed': return 'bg-red-500/20 text-red-700 border-red-400';
      default: return '';
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaction Log"
        description="View a detailed log of all financial transactions on the Zelo platform."
        icon={CreditCard}
        action={
             <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export CSV (Mock)
            </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">All Transactions</CardTitle>
          <CardDescription>Search, filter, and review transaction details.</CardDescription>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by ID, user ID, or amount..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {transactionStatusOptions.map(status => (
                  <SelectItem key={status} value={status} className="capitalize">{status.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             {/* Placeholder for Date Range Picker */}
            <Input type="text" placeholder="Date range (mock)" className="w-full sm:w-[180px]" />
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Service Req. ID</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Artisan ID</TableHead>
                  <TableHead className="text-right">Amount (₦)</TableHead>
                  <TableHead className="text-right">Platform Fee (₦)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{format(new Date(txn.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium truncate max-w-[100px]" title={txn.id}>{txn.id.substring(0,8)}...</TableCell>
                    <TableCell className="truncate max-w-[100px]" title={txn.serviceRequestId}>{txn.serviceRequestId}</TableCell>
                    <TableCell>{txn.clientId}</TableCell>
                    <TableCell>{txn.artisanId}</TableCell>
                    <TableCell className="text-right font-mono">{txn.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{txn.platformFee.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${getStatusBadgeColor(txn.status)}`}>
                        {txn.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="icon" title="View Transaction Details">
                        <Link href={`/dashboard/payments/escrow?transactionId=${txn.id}&role=admin`}>
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
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No transactions found.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    There are currently no transactions matching your filters.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
