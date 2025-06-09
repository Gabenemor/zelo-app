
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Phone, Mail, Briefcase, Home, Save, DollarSign, Tag, Image as ImageIcon } from "lucide-react";
import type { ArtisanProfile } from "@/types"; 

const artisanProfileSchema = z.object({
  contactPhone: z.string().optional().refine(val => !val || /^\+?[0-9]{10,14}$/.test(val), {
    message: "Invalid phone number format."
  }),
  contactEmail: z.string().email({ message: "Invalid email address." }),
  serviceChargeDescription: z.string().optional(),
  serviceChargeAmount: z.coerce.number().positive({ message: "Service charge must be positive."}).optional(),
  location: z.string().min(3, { message: "Location is required." }),
  isLocationPublic: z.boolean().default(false).optional(),
  bio: z.string().max(500, "Bio should not exceed 500 characters.").optional(),
  yearsOfExperience: z.coerce.number().int().min(0).optional(),
});

type ArtisanProfileFormValues = z.infer<typeof artisanProfileSchema>;

interface ArtisanProfileFormProps {
  initialData?: Partial<ArtisanProfile>; 
  userId: string; 
}

export function ArtisanProfileForm({ initialData, userId }: ArtisanProfileFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ArtisanProfileFormValues>({
    resolver: zodResolver(artisanProfileSchema),
    defaultValues: {
      contactPhone: initialData?.contactPhone || "",
      contactEmail: initialData?.contactEmail || "", 
      serviceChargeDescription: initialData?.serviceChargeDescription || "",
      serviceChargeAmount: initialData?.serviceChargeAmount || undefined,
      location: initialData?.location || "",
      isLocationPublic: initialData?.isLocationPublic || false,
      bio: initialData?.bio || "",
      yearsOfExperience: initialData?.yearsOfExperience || 0,
    },
  });

  async function onSubmit(values: ArtisanProfileFormValues) {
    setIsLoading(true);
    // In a real app, derive locationCoordinates from 'location' string using a geocoding service
    const submissionData = { ...values, locationCoordinates: initialData?.locationCoordinates /* or derived */ };
    console.log("Artisan profile submission for user:", userId, submissionData);
    
    // This is where you would call your actual server action to save the profile.
    // For example:
    // const result = await saveArtisanOnboardingProfile(submissionData);
    // if (result.success) {
    //   toast({ title: "Profile Updated", description: "Your artisan profile has been saved." });
    //   // Potentially redirect or perform other actions
    // } else {
    //   toast({ title: "Update Failed", description: result.error || "Could not save profile."});
    // }

    setTimeout(() => {
      toast({ title: "Profile Updated (Mock)", description: "Your artisan profile has been saved." });
      setIsLoading(false);
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="e.g. +2348012345678" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email (Public)</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input type="email" placeholder="yourpublic@email.com" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
           <FormField
            control={form.control}
            name="serviceChargeAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Typical Service Charge (Naira)</FormLabel>
                 <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input type="number" placeholder="e.g. 5000" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="serviceChargeDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Charge Basis</FormLabel>
                 <div className="relative">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="e.g., per hour, per item, negotiable" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormDescription>How do you typically charge? (e.g., per hour, per project)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Base Location</FormLabel>
                 <div className="relative">
                  <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="e.g. Ikeja, Lagos" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormDescription>Enter your city and state. This helps clients find you.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                 <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input type="number" placeholder="e.g. 5" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isLocationPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Share Precise Location</FormLabel>
                <FormDescription>
                  Allow clients to see your more specific location for services. If off, only your general area is shown.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Toggle precise location sharing"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Short Bio / About Your Services</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell clients about yourself, your skills, and what makes your service stand out..."
                  className="resize-y min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Maximum 500 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
            <FormLabel>Portfolio Images (Optional)</FormLabel>
            <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                    <Input type="file" multiple className="pl-10 pt-[0.375rem]" />
                </FormControl>
            </div>
            <FormDescription>Upload images of your past work. Max 5 images.</FormDescription>
            {/* Placeholder for image previews */}
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                <img src="https://placehold.co/100x100.png?text=Work+1" alt="portfolio placeholder 1" className="rounded" data-ai-hint="portfolio work" />
                <img src="https://placehold.co/100x100.png?text=Work+2" alt="portfolio placeholder 2" className="rounded" data-ai-hint="portfolio design" />
            </div>
        </FormItem>


        <Button type="submit" className="w-full md:w-auto font-semibold" disabled={isLoading}>
          {isLoading ? "Saving..." : <> <Save className="mr-2 h-4 w-4" /> Save Profile </>}
        </Button>
      </form>
    </Form>
  );
}

    