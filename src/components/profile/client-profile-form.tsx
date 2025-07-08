
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
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
import React, { useEffect, useState } from "react";
import { Phone, Home, Save, User, Mail, Edit3, Camera, Search, Loader2 } from "lucide-react";
import type { ClientProfile, NigerianArtisanService } from "@/types";
import { NIGERIAN_ARTISAN_SERVICES } from "@/types";
import Image from "next/image";
import { ServiceSelectionChips } from "@/components/onboarding/service-selection-chips";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { uploadClientAvatar } from "@/lib/storage";
import { saveClientStep2Profile } from "@/actions/onboarding-actions";
import { useRouter } from "next/navigation";
import { LocationAutocomplete } from "@/components/location/location-autocomplete";

const clientProfileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  contactEmail: z.string().email({ message: "A valid contact email is required." }),
  contactPhone: z.string().optional().refine(val => !val || /^\+?[0-9]{10,14}$/.test(val), {
    message: "Invalid phone number format."
  }).or(z.literal('')),
  location: z.string().min(3, { message: "Location is required." }).optional(),
  isLocationPublic: z.boolean().default(false).optional(),
  servicesLookingFor: z.array(z.string()).min(1, "Please select at least one service you're interested in.").optional(),
});

type ClientProfileFormValues = z.infer<typeof clientProfileSchema>;

interface ClientProfileFormProps {
  initialData?: Partial<ClientProfile>;
  userId: string;
}

export function ClientProfileForm({ initialData, userId }: ClientProfileFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(initialData?.avatarUrl || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const form = useForm<ClientProfileFormValues>({
    resolver: zodResolver(clientProfileSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      contactEmail: initialData?.contactEmail || "",
      contactPhone: initialData?.contactPhone || "",
      location: initialData?.location || "",
      isLocationPublic: initialData?.isLocationPublic || false,
      servicesLookingFor: initialData?.servicesLookingFor || [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
      if (initialData.avatarUrl) {
        setAvatarPreview(initialData.avatarUrl);
        setUploadedAvatarUrl(initialData.avatarUrl);
      }
    }
  }, [initialData, form]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userId) {
      setIsUploadingAvatar(true);
      setAvatarPreview(URL.createObjectURL(file)); 
      try {
        const downloadURL = await uploadClientAvatar(userId, file);
        setUploadedAvatarUrl(downloadURL);
        setAvatarPreview(downloadURL);
        toast({ title: "Avatar uploaded!" });
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast({ title: "Upload failed", description: "Could not upload avatar.", variant: "destructive" });
        setAvatarPreview(uploadedAvatarUrl);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  async function onSubmit(values: ClientProfileFormValues) {
    setIsSubmitting(true);
    const result = await saveClientStep2Profile({
      userId,
      location: values.location || "",
      fullName: values.fullName,
      contactEmail: values.contactEmail,
      avatarUrl: uploadedAvatarUrl || undefined,
      isLocationPublic: values.isLocationPublic,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Profile Updated", description: "Your client profile has been saved." });
      router.refresh(); // Refresh the page to show new data
    } else {
      let errorMsg = "Could not save your profile. Please try again.";
      if (result.error) {
        const fieldErrors = Object.values(result.error).flat().join(" ");
        if (fieldErrors) errorMsg = fieldErrors;
        else if (result.error._form && Array.isArray(result.error._form)) errorMsg = result.error._form.join(" ");
      }
      toast({ title: "Error Saving Profile", description: errorMsg, variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-6">
            <FormItem className="flex flex-col items-center md:items-start">
              <FormLabel>Profile Photo</FormLabel>
              <Image 
                  src={avatarPreview || "https://placehold.co/128x128.png?text=Avatar"} 
                  alt="Profile Avatar" 
                  width={128}
                  height={128}
                  className="object-cover w-32 h-32 rounded-full border-2 border-muted"
                  data-ai-hint="profile avatar"
              />
              <Button asChild variant="outline" size="sm" className="mt-2" disabled={isUploadingAvatar || isSubmitting}>
                  <label htmlFor="avatarUpload" className="cursor-pointer">
                      {isUploadingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                      {isUploadingAvatar ? "Uploading..." : "Change Photo"}
                  </label>
              </Button>
              <input id="avatarUpload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploadingAvatar || isSubmitting} />
            </FormItem>
            <div className="flex-grow w-full">
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
              <Controller
                name="location"
                control={form.control}
                render={({ field: locField }) => (
                  <LocationAutocomplete
                    onLocationSelect={(loc) => form.setValue("location", loc.address, { shouldValidate: true })}
                    initialValue={locField.value || ''}
                    placeholder="Enter your city or area"
                  />
                )}
              />
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

        <Card>
          <CardHeader>
            <CardTitle>Services You're Interested In</CardTitle>
            <CardDescription>Select the types of services you typically look for. This helps us recommend relevant artisans.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="servicesLookingFor"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ServiceSelectionChips
                      availableServices={NIGERIAN_ARTISAN_SERVICES.filter(s => s !== "Other") as NigerianArtisanService[]}
                      selectedServices={field.value || []}
                      onSelectedServicesChange={field.onChange}
                      selectionType="multiple"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Button type="submit" className="w-full md:w-auto font-semibold" disabled={isSubmitting || isUploadingAvatar}>
          {isSubmitting || isUploadingAvatar ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Save Profile</>
          )}
        </Button>
      </form>
    </Form>
  );
}
