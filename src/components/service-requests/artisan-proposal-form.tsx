
"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Coins, Send, UploadCloud, Paperclip, Loader2 } from 'lucide-react';
import type { ArtisanProposal, AuthUser } from '@/types'; // Assuming AuthUser is available for artisanName/avatar
import { submitArtisanProposal } from '@/actions/proposal-actions'; // Ensure this path is correct
import { useAuthContext } from '@/components/providers/auth-provider';

const proposalFormSchema = z.object({
  proposedAmount: z.coerce.number().positive({ message: "Proposed amount must be positive." }),
  coverLetter: z.string().min(50, { message: "Cover letter must be at least 50 characters." }).max(1500, "Cover letter too long."),
  portfolioFiles: z.custom<FileList | null>(
        (val) => val === null || val instanceof FileList, // Allow FileList or null
        "Invalid file list"
    ).optional().nullable()
    .refine(
        (files) => files === null || files === undefined || files.length <= 5,
        `Maximum 5 portfolio files allowed.`
    ),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

interface ArtisanProposalFormProps {
  serviceRequestId: string;
  currentBudget?: number;
  onSubmitSuccess: (proposal: ArtisanProposal) => void;
}

export function ArtisanProposalForm({
  serviceRequestId,
  currentBudget,
  onSubmitSuccess,
}: ArtisanProposalFormProps) {
  const { toast } = useToast();
  const { user: artisanUser, loading: authLoading } = useAuthContext(); // Get current artisan details
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState<string[]>([]);

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      proposedAmount: currentBudget || undefined,
      coverLetter: '',
      portfolioFiles: null,
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      form.setValue('portfolioFiles', files, { shouldValidate: true });
      setSelectedFileNames(Array.from(files).map(file => file.name).slice(0, 5));
    } else {
      form.setValue('portfolioFiles', null);
      setSelectedFileNames([]);
    }
  };

  const onSubmit = async (values: ProposalFormValues) => {
    if (!artisanUser || !artisanUser.uid) {
        toast({ title: "Error", description: "You must be logged in to submit a proposal.", variant: "destructive" });
        return;
    }
    if (authLoading) {
        toast({ title: "Please wait", description: "Authentication is still loading.", variant: "default" });
        return;
    }

    setIsSubmitting(true);
    const result = await submitArtisanProposal({
      serviceRequestId,
      artisanId: artisanUser.uid,
      artisanName: artisanUser.displayName || "Artisan", // Use display name from auth
      artisanAvatarUrl: artisanUser.avatarUrl, // Use avatar from auth if available
      proposedAmount: values.proposedAmount,
      coverLetter: values.coverLetter,
      portfolioFileNames: selectedFileNames, // Send file names
    });
    setIsSubmitting(false);

    if (result.success && result.proposal) {
      toast({ title: "Proposal Submitted!", description: "Your proposal has been sent to the client." });
      onSubmitSuccess(result.proposal);
      form.reset();
      setSelectedFileNames([]);
    } else {
      toast({
        title: "Submission Failed",
        description: result.error || "Could not submit your proposal. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="ml-2">Loading user details...</span></div>;
  }
  if (!artisanUser) {
    return <p className="text-destructive text-center p-4">Please log in as an artisan to submit a proposal.</p>;
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="proposedAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Proposed Amount (₦)</FormLabel>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input type="number" placeholder="e.g., 700000" {...field} value={field.value ?? ''} className="pl-10" />
                </FormControl>
              </div>
              {currentBudget && <FormDescription>Client's budget is approx. ₦{currentBudget.toLocaleString()}.</FormDescription>}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="coverLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Message to the Client (Cover Letter)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain your approach, relevant experience, and why you're a good fit. Be clear and concise."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="portfolioFiles"
            render={({ field }) => ( // field.onChange is for FileList
            <FormItem>
                <FormLabel>Attach Portfolio Images (Optional, Max 5)</FormLabel>
                <FormControl>
                     <label
                        htmlFor="portfolio-upload-proposal"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 border-border hover:border-primary/50 transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground">
                                <span className="font-semibold text-primary">Click to upload</span> or drag & drop
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF (Max 5 files)</p>
                        </div>
                        <Input
                            id="portfolio-upload-proposal"
                            type="file"
                            multiple
                            className="sr-only"
                            accept="image/png, image/jpeg, image/gif"
                            onChange={handleFileChange} 
                            disabled={isSubmitting}
                        />
                    </label>
                </FormControl>
                {selectedFileNames.length > 0 && (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">Selected files:</p>
                        <ul className="list-disc pl-5">
                            {selectedFileNames.map((name, index) => (
                                <li key={index} className="truncate">{name}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <FormMessage />
            </FormItem>
            )}
        />
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || authLoading}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {isSubmitting ? "Submitting..." : "Send Proposal"}
        </Button>
      </form>
    </Form>
  );
}
