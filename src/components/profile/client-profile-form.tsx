
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Phone, Home, Save, User, Mail, Edit3 } from "lucide-react";
import type { ClientProfile } from "@/types";
import Image from "next/image";

const clientProfileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  contactEmail: z.string().email({ message: "A valid contact email is required." }),
  contactPhone: z.string().optional().refine(val => !val || /^\+?[0-9]{10,14}$/.test(val), {
    message: "Invalid phone number format."
  }),
  location: z.string().min(3, { message: "Location is required." }).optional(),
  isLocationPublic: z.boolean().default(false).optional(),
  // avatarUrl: z.string().url().optional(), // For actual file uploads, this would be different
});

type ClientProfileFormValues = z.infer<typeof clientProfileSchema>;

interface ClientProfileFormProps {
  initialData?: Partial<ClientProfile & { fullName?: string, contactEmail?: string, avatarUrl?: string }>;
  userId: string;
}

export function ClientProfileForm({ initialData, userId }: ClientProfileFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(initialData?.avatarUrl || null);

  const form = useForm<ClientProfileFormValues>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      contactEmail: initialData?.contactEmail || "",
      contactPhone: initialData?.contactPhone || "",
      location: initialData?.location || "",
      isLocationPublic: initialData?.isLocationPublic || false,
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: ClientProfileFormValues) {
    setIsLoading(true);
    // In a real app, derive locationCoordinates from 'location' string using a geocoding service
    const submissionData = { ...values, avatarUrl: avatarPreview, locationCoordinates: initialData?.locationCoordinates /* or derived */ };
    console.log("Client profile submission for user:", userId, submissionData);
    
    setTimeout(() => {
      toast({ title: "Profile Updated (Mock)", description: "Your client profile has been saved." });
      setIsLoading(false);
    }, 1000);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
            <div className="relative">
                <Image 
                    src={avatarPreview || "https://placehold.co/128x128.png?text=Avatar"} 
                    alt="Profile Avatar" 
                    width={128} 
                    height={128} 
                    className="rounded-full border-2 border-muted object-cover"
                    data-ai-hint="profile avatar"
                />
                <label htmlFor="avatarUpload" className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                    <Edit3 className="h-4 w-4" />
                    <input id="avatarUpload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} />
                </label>
            </div>
            <div className="flex-grow">
                <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <FormControl>
                        <Input placeholder="e.g. Adaobi Chukwuma" {...field} className="pl-10" />
                        </FormControl>
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
        </div>


        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormDescription>This email will be used for communication.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone (Optional)</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your General Location (Optional)</FormLabel>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g. Ikeja, Lagos" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormDescription>This helps artisans understand your general area for service delivery.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isLocationPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Share Precise Location</FormLabel>
                <FormDescription>
                  Allow your precise location to be used for job postings to help artisans. If off, only your general area is used.
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
        
        <Button type="submit" className="w-full md:w-auto font-semibold" disabled={isLoading}>
          {isLoading ? "Saving..." : <> <Save className="mr-2 h-4 w-4" /> Save Profile </>}
        </Button>
      </form>
    </Form>
  );
}
