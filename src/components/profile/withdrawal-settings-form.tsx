
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Landmark, Hash, UserCheck, Save, Loader2 } from "lucide-react";
import type { WithdrawalAccount } from "@/types";
import { createWithdrawalAccount } from "@/lib/firestore";
import { paymentService } from "@/lib/payments";

const NIGERIAN_BANKS = [
  "Access Bank", "Citibank Nigeria", "Ecobank Nigeria", "Fidelity Bank",
  "First Bank of Nigeria", "First City Monument Bank (FCMB)", "Guaranty Trust Bank (GTB)",
  "Heritage Bank", "Keystone Bank", "Polaris Bank", "Providus Bank", "Stanbic IBTC Bank",
  "Standard Chartered Bank", "Sterling Bank", "SunTrust Bank Nigeria", "Titan Trust Bank",
  "Union Bank of Nigeria", "United Bank for Africa (UBA)", "Unity Bank", "Wema Bank", "Zenith Bank"
];

const withdrawalAccountSchema = z.object({
  bankName: z.string().min(1, { message: "Please select your bank." }),
  accountNumber: z.string()
    .min(10, { message: "Account number must be 10 digits." })
    .max(10, { message: "Account number must be 10 digits." })
    .regex(/^\d+$/, { message: "Account number must contain only digits." }),
  accountName: z.string().min(2, { message: "Account name is required." }),
});

type WithdrawalAccountFormValues = z.infer<typeof withdrawalAccountSchema>;

interface WithdrawalSettingsFormProps {
  initialData?: Partial<WithdrawalAccount>;
  userId: string;
}

export function WithdrawalSettingsForm({ initialData, userId }: WithdrawalSettingsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isVerified, setIsVerified] = React.useState(initialData?.isVerified || false);


  const form = useForm<WithdrawalAccountFormValues>({
    resolver: zodResolver(withdrawalAccountSchema),
    defaultValues: {
      bankName: initialData?.bankName || "",
      accountNumber: initialData?.accountNumber || "",
      accountName: initialData?.accountName || "",
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset({
        bankName: initialData.bankName || "",
        accountNumber: initialData.accountNumber || "",
        accountName: initialData.accountName || "",
      });
      setIsVerified(initialData.isVerified || false);
    }
  }, [initialData, form]);


  const handleVerifyAccount = async () => {
    const { bankName, accountNumber } = form.getValues();
    if (!bankName || !accountNumber || accountNumber.length !== 10) {
        toast({ title: "Verification Error", description: "Please provide a valid bank and 10-digit account number.", variant: "destructive" });
        return;
    }
    setIsVerifying(true);
    try {
      // In a real app, you'd map bankName to bankCode for Paystack
      // This is a simplified mock. A real implementation needs a bank list with codes.
      const bankCode = "058"; // Example: GTB's code
      const verificationResult = await paymentService.verifyBankAccount(accountNumber, bankCode);
      if (verificationResult && verificationResult.account_name) {
        form.setValue("accountName", verificationResult.account_name);
        setIsVerified(true);
        toast({ title: "Account Verified", description: `Account Name: ${verificationResult.account_name}` });
      } else {
        throw new Error("Verification failed or account name not returned.");
      }
    } catch (error: any) {
       toast({ title: "Account Verification Failed", description: "Could not verify account. Please check details or try again.", variant: "destructive" });
       setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  async function onSubmit(values: WithdrawalAccountFormValues) {
    if (!isVerified) {
        toast({ title: "Account Not Verified", description: "Please verify your account details before saving.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
      await createWithdrawalAccount({ ...values, userId, isVerified: true });
      toast({ title: "Withdrawal Account Saved", description: "Your bank details have been successfully updated." });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Could not save bank details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="relative pl-10">
                     <Landmark className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {NIGERIAN_BANKS.map(bank => (
                    <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number (NUBAN)</FormLabel>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input type="text" maxLength={10} placeholder="Your 10-digit account number" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormDescription>Must be a 10-digit NUBAN account number.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="button" variant="outline" onClick={handleVerifyAccount} disabled={isVerifying || isLoading}>
          {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
          {isVerifying ? "Verifying..." : "Verify Account Details"}
        </Button>

        <FormField
          control={form.control}
          name="accountName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="Account holder's name (auto-filled after verification)" {...field} readOnly className="pl-10 bg-secondary/50" />
                </FormControl>
              </div>
              <FormDescription>This will be automatically filled after successful verification. Ensure it matches your registered name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isVerified && (
            <div className="flex items-center space-x-2 rounded-md border border-green-500 bg-green-50 p-3 text-green-700">
                <UserCheck className="h-5 w-5"/>
                <p className="text-sm font-medium">Account details verified successfully!</p>
            </div>
        )}

        <Button type="submit" className="w-full md:w-auto font-semibold" disabled={isLoading || !isVerified}>
           {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" />}
           {isLoading ? "Saving..." : "Save Bank Details"}
        </Button>
      </form>
    </Form>
  );
}
