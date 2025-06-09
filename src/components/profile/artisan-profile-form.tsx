
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
import React, { useEffect } from "react";
import { Phone, Mail, Home, Save, DollarSign, Tag, Image as ImageIcon, Briefcase, User, ArrowLeft, Info } from "lucide-react";
import type { ArtisanProfile, ServiceExperience } from "@/types";
import { saveArtisanOnboardingProfile } from "@/actions/onboarding-actions";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const serviceExperienceSchema = z.object({
  serviceName: z.string(),
  years: z.coerce.number().int().min(0, "Years must be 0 or positive."),
  chargeAmount: z.coerce.number().positive({ message: "Charge amount must be positive."}).optional(),
  chargeDescription: z.string().max(50, "Basis description too long.").optional(),
});

const artisanProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters.").optional(),
  contactPhone: z.string().optional().refine(val => !val || /^\+?[0-9]{10,14}$/.test(val), {
    message: "Invalid phone number format."
  }),
  contactEmail: z.string().email({ message: "Invalid email address." }),
  location: z.string().min(3, { message: "Location is required." }),
  isLocationPublic: z.boolean().default(false).optional(),
  bio: z.string().max(500, "Bio should not exceed 500 characters.").optional(),
  serviceExperiences: z.array(serviceExperienceSchema).optional(),
});

type ArtisanProfileFormValues = z.infer<typeof artisanProfileSchema>;

interface ArtisanProfileFormProps {
  initialData?: Partial<ArtisanProfile>;
  userId: string;
  onSaveSuccess?: () => void;
  submitButtonText?: React.ReactNode;
  backButtonHref?: string;
  backButtonText?: string;
}

export function ArtisanProfileForm({
  initialData,
  userId,
  onSaveSuccess,
  submitButtonText = <> <Save className="mr-2 h-4 w-4" /> Save Profile </>,
  backButtonHref,
  backButtonText = "Back"
}: ArtisanProfileFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ArtisanProfileFormValues>({
    resolver: zodResolver(artisanProfileSchema),
    defaultValues: {
      username: initialData?.username || "",
      contactPhone: initialData?.contactPhone || "",
      contactEmail: initialData?.contactEmail || "",
      location: initialData?.location || "",
      isLocationPublic: initialData?.isLocationPublic || false,
      bio: initialData?.bio || "",
      serviceExperiences: initialData?.servicesOffered
        ?.map(serviceName => {
          const existingExperience = initialData.serviceExperiences?.find(exp => exp.serviceName === serviceName);
          return {
            serviceName: serviceName,
            years: existingExperience?.years ?? 0,
            chargeAmount: existingExperience?.chargeAmount ?? undefined,
            chargeDescription: existingExperience?.chargeDescription ?? '',
          };
        }) || [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "serviceExperiences",
  });

  useEffect(() => {
    if (initialData?.servicesOffered && initialData.servicesOffered.length > 0 && (form.getValues('serviceExperiences') === undefined || form.getValues('serviceExperiences')?.length === 0) ) {
      const experiencesToSet = initialData.servicesOffered.map(serviceName => {
        const existing = initialData.serviceExperiences?.find(exp => exp.serviceName === serviceName);
        return {
            serviceName,
            years: existing?.years ?? 0,
            chargeAmount: existing?.chargeAmount ?? undefined,
            chargeDescription: existing?.chargeDescription ?? '',
        };
      });
      form.setValue('serviceExperiences', experiencesToSet);
    }
  }, [initialData?.servicesOffered, initialData?.serviceExperiences, form]);


  async function onSubmit(values: ArtisanProfileFormValues) {
    setIsLoading(true);
    const submissionData: Partial<ArtisanProfile> = {
      ...values,
      userId,
      servicesOffered: initialData?.servicesOffered || [], // Keep original services offered
      onboardingCompleted: true,
      profileSetupCompleted: true,
    };

    console.log("Artisan profile submission for user:", userId, submissionData);

    const result = await saveArtisanOnboardingProfile(submissionData as Omit<ArtisanProfile, 'onboardingStep1Completed'>);

    setIsLoading(false);

    if (result.success) {
      toast({ title: "Profile Saved", description: "Your artisan profile has been successfully updated." });
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } else {
      let errorMsg = "Could not save profile. Please check your input.";
      if (result.error) {
        const fieldErrors = Object.values(result.error).flat().join(' ');
        if (fieldErrors) errorMsg = fieldErrors;
      }
      toast({ title: "Update Failed", description: errorMsg, variant: "destructive" });
      console.error("Artisan profile save error:", result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
         <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username (Public)</FormLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input placeholder="e.g. ZeloMasterArtisan" {...field} className="pl-10" />
                  </FormControl>
                </div>
                <FormDescription>This will be part of your public profile URL.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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

        {fields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Service Details</CardTitle>
              <CardDescription>
                For each service you offer, specify years of experience and optionally, your typical charge.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-4 rounded-md border bg-secondary/30 p-4">
                <FormField
                  control={form.control}
                  name={`serviceExperiences.${index}.serviceName`}
                  render={({ field: serviceNameField }) => (
                    <FormItem>
                      <FormLabel className="text-md font-semibold text-foreground">
                        Service: {serviceNameField.value}
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <FormField
                    control={form.control}
                    name={`serviceExperiences.${index}.years`}
                    render={({ field: yearsField }) => (
                        <FormItem className="sm:col-span-1">
                        <FormLabel>Years of Experience</FormLabel>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <FormControl>
                            <Input
                                type="number"
                                placeholder="Years"
                                min="0"
                                {...yearsField}
                                className="pl-10 pr-2 text-sm h-9"
                            />
                            </FormControl>
                        </div>
                        <FormMessage className="text-xs"/>
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name={`serviceExperiences.${index}.chargeAmount`}
                    render={({ field: chargeAmountField }) => (
                        <FormItem className="sm:col-span-1">
                        <FormLabel>Charge Amount (₦)</FormLabel>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <FormControl>
                            <Input
                                type="number"
                                placeholder="e.g. 5000"
                                min="0"
                                {...chargeAmountField}
                                className="pl-10 pr-2 text-sm h-9"
                            />
                            </FormControl>
                        </div>
                        <FormMessage className="text-xs"/>
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name={`serviceExperiences.${index}.chargeDescription`}
                    render={({ field: chargeDescField }) => (
                        <FormItem className="sm:col-span-1">
                        <FormLabel>Charge Basis</FormLabel>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <FormControl>
                            <Input
                                placeholder="e.g. per hour"
                                {...chargeDescField}
                                className="pl-10 pr-2 text-sm h-9"
                            />
                            </FormControl>
                        </div>
                        <FormMessage className="text-xs"/>
                        </FormItem>
                    )}
                    />
                </div>
              </div>
            ))}
            </CardContent>
          </Card>
        )}


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
                <FormDescription>Enter your city and state.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="isLocationPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 h-full">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Share Precise Location</FormLabel>
                  <FormDescription>
                    Allow clients to see your more specific location.
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
        </div>


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
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                <img src="https://placehold.co/100x100.png?text=Work+1" alt="portfolio placeholder 1" className="rounded" data-ai-hint="portfolio work" />
                <img src="https://placehold.co/100x100.png?text=Work+2" alt="portfolio placeholder 2" className="rounded" data-ai-hint="portfolio design" />
            </div>
        </FormItem>

        <div className="flex flex-wrap justify-end gap-3 pt-4">
          {backButtonHref && (
            <Button asChild variant="outline" disabled={isLoading}>
              <Link href={backButtonHref}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {backButtonText}
              </Link>
            </Button>
          )}
          <Button type="submit" className="font-semibold" disabled={isLoading}>
            {isLoading ? "Saving..." : submitButtonText}
          </Button>
        </div>
      </form>
    </Form>
  );
}
