
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import React, { useEffect } from "react";
import { Phone, Mail, Home, Save, Coins, Tag, Image as ImageIcon, Briefcase, User, ArrowLeft, Info, UploadCloud, Camera, Activity, Edit, Loader2 } from "lucide-react"; // Changed DollarSign to Coins
import type { ArtisanProfile, ServiceExperience } from "@/types";
import { saveArtisanOnboardingProfile } from "@/actions/onboarding-actions";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { uploadProfilePhoto, uploadPortfolioImages } from "@/lib/storage";

const serviceExperienceSchema = z.object({
  serviceName: z.string(),
  years: z.coerce.number().int().min(0, "Years must be 0 or positive."),
  chargeAmount: z.coerce.number().positive({ message: "Charge amount must be positive."}).optional(),
  chargeDescription: z.string().max(50, "Basis description too long.").optional(),
});

// Schema for form values, not directly for server action
const artisanProfileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters.").optional().or(z.literal('')),
  // profilePhotoFile: typeof window === 'undefined' ? z.any().optional() : z.instanceof(FileList).optional().nullable(), // For input only
  headline: z.string().min(5, "Headline should be at least 5 characters.").max(100, "Headline too long.").optional().or(z.literal('')),
  contactPhone: z.string().optional().refine(val => !val || /^\+?[0-9]{10,14}$/.test(val), {
    message: "Invalid phone number format."
  }).or(z.literal('')),
  contactEmail: z.string().email({ message: "Invalid email address." }),
  location: z.string().min(3, { message: "Location is required." }),
  isLocationPublic: z.boolean().default(false).optional(),
  bio: z.string().max(500, "Bio should not exceed 500 characters.").optional().or(z.literal('')),
  availabilityStatus: z.enum(['available', 'busy', 'unavailable'], {required_error: "Availability status is required."}).optional(),
  serviceExperiences: z.array(serviceExperienceSchema).optional(),
  // portfolioFiles: typeof window === 'undefined' ? z.any().optional() : z.instanceof(FileList).optional().nullable(), // For input only
});

type ArtisanProfileFormValues = z.infer<typeof artisanProfileFormSchema>;

interface ArtisanProfileFormProps {
  initialData?: Partial<ArtisanProfile>;
  userId: string;
  onSaveSuccess?: () => void;
  submitButtonText?: React.ReactNode;
  backButtonHref?: string;
  backButtonText?: string;
  isOnboarding?: boolean;
}

export function ArtisanProfileForm({
  initialData,
  userId,
  onSaveSuccess,
  submitButtonText = <> <Save className="mr-2 h-4 w-4" /> Save Profile </>,
  backButtonHref,
  backButtonText = "Back",
  isOnboarding = false,
}: ArtisanProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = React.useState<string | null>(initialData?.profilePhotoUrl || null);
  const [portfolioPreviews, setPortfolioPreviews] = React.useState<string[]>(initialData?.portfolioImageUrls || []);

  const [uploadedProfilePhotoUrl, setUploadedProfilePhotoUrl] = React.useState<string | null>(initialData?.profilePhotoUrl || null);
  const [uploadedPortfolioImageUrls, setUploadedPortfolioImageUrls] = React.useState<string[]>(initialData?.portfolioImageUrls || []);

  const [isUploadingProfilePhoto, setIsUploadingProfilePhoto] = React.useState(false);
  const [isUploadingPortfolio, setIsUploadingPortfolio] = React.useState(false);


  const form = useForm<ArtisanProfileFormValues>({
    resolver: zodResolver(artisanProfileFormSchema),
    defaultValues: {
      username: initialData?.username || "",
      headline: initialData?.headline || "",
      contactPhone: initialData?.contactPhone || "",
      contactEmail: initialData?.contactEmail || "",
      location: initialData?.location || "",
      isLocationPublic: initialData?.isLocationPublic || false,
      bio: initialData?.bio || "",
      availabilityStatus: initialData?.availabilityStatus || 'available',
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
    if (initialData?.profilePhotoUrl) {
      setProfilePhotoPreview(initialData.profilePhotoUrl);
      setUploadedProfilePhotoUrl(initialData.profilePhotoUrl);
    }
    if (initialData?.portfolioImageUrls) {
      setPortfolioPreviews(initialData.portfolioImageUrls);
      setUploadedPortfolioImageUrls(initialData.portfolioImageUrls);
    }
  }, [initialData, form]);

  const handleProfilePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && userId) {
      setIsUploadingProfilePhoto(true);
      setProfilePhotoPreview(URL.createObjectURL(file));
      try {
        const downloadURL = await uploadProfilePhoto(userId, file);
        setUploadedProfilePhotoUrl(downloadURL);
        setProfilePhotoPreview(downloadURL);
        toast({ title: "Profile photo uploaded!" });
      } catch (error) {
        console.error("Error uploading profile photo:", error);
        toast({ title: "Upload failed", description: "Could not upload profile photo.", variant: "destructive" });
        setProfilePhotoPreview(uploadedProfilePhotoUrl);
      } finally {
        setIsUploadingProfilePhoto(false);
      }
    }
  };

  const handlePortfolioChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && userId) {
      setIsUploadingPortfolio(true);
      const currentFileArray = Array.from(files);
      const optimisticPreviews = currentFileArray.map(file => URL.createObjectURL(file));

      // Show optimistic previews immediately, respecting the limit
      setPortfolioPreviews(prev =>
        [...prev.filter(url => !url.startsWith('blob:')), ...optimisticPreviews]
        .slice(0, 5)
      );

      try {
        // Limit the number of files to upload based on how many slots are available
        const currentNonBlobUrlsCount = uploadedPortfolioImageUrls.filter(url => !url.startsWith('blob:')).length;
        const filesToUpload = currentFileArray.slice(0, 5 - currentNonBlobUrlsCount);

        if (filesToUpload.length > 0) {
          const newUploadedUrls = await uploadPortfolioImages(userId, filesToUpload);
          setUploadedPortfolioImageUrls(prev => [...prev.filter(url => !url.startsWith('blob:')), ...newUploadedUrls].slice(0,5));
          setPortfolioPreviews(prev => [...prev.filter(url => !url.startsWith('blob:')), ...newUploadedUrls].slice(0,5));
          toast({ title: "Portfolio images uploaded!" });
        } else if (currentNonBlobUrlsCount >= 5) {
            toast({ title: "Portfolio Full", description: "Maximum 5 images allowed.", variant: "default"});
        }
      } catch (error) {
        console.error("Error uploading portfolio images:", error);
        toast({ title: "Portfolio upload failed", description: "Could not upload all portfolio images.", variant: "destructive" });
        // Revert previews to only confirmed URLs
        setPortfolioPreviews(uploadedPortfolioImageUrls);
      } finally {
        setIsUploadingPortfolio(false);
      }
    }
  };


  async function onSubmit(values: ArtisanProfileFormValues) {
    setIsSubmitting(true);

    const submissionData: Partial<ArtisanProfile> = {
      ...values,
      userId,
      profilePhotoUrl: uploadedProfilePhotoUrl || undefined,
      portfolioImageUrls: uploadedPortfolioImageUrls.filter(url => url && !url.startsWith('blob:')), // Ensure only valid, uploaded URLs
      servicesOffered: initialData?.servicesOffered || [],
      onboardingCompleted: true,
      profileSetupCompleted: true,
    };

    console.log("Artisan profile submission for user:", userId, JSON.stringify(submissionData, null, 2));
    const result = await saveArtisanOnboardingProfile(submissionData as Omit<ArtisanProfile, 'onboardingStep1Completed'>);
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Profile Saved", description: "Your artisan profile has been successfully updated." });
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } else {
      let errorMessages: string[] = [];
      if (result.error) {
        if (result.error._form && Array.isArray(result.error._form)) {
          errorMessages = errorMessages.concat(result.error._form);
        }
        if (result.error.fields) {
          Object.entries(result.error.fields).forEach(([key, fieldErrorArray]) => {
            if (Array.isArray(fieldErrorArray)) {
              errorMessages = errorMessages.concat((fieldErrorArray as string[]).map(msg => `${key}: ${msg}`));
            }
          });
        }
         if (result.error._server_error && Array.isArray(result.error._server_error)) {
            errorMessages = errorMessages.concat(result.error._server_error);
        }
      }
      const errorMsg = errorMessages.length > 0 ? errorMessages.join('; ') : "Could not save profile. Please check your input or try again.";

      toast({ title: "Update Failed", description: errorMsg, variant: "destructive" });
      console.error("Artisan profile save error (client error object):", result.error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

        <div className="flex flex-col items-center space-y-4 md:flex-row md:items-start md:space-x-6 md:space-y-0">
          <FormItem className="flex flex-col items-center md:items-start">
            <FormLabel>Profile Photo</FormLabel>
            <Image
              src={profilePhotoPreview || "https://placehold.co/128x128.png?text=Photo"}
              alt="Profile photo preview"
              width={128}
              height={128}
              className="rounded-full object-cover w-32 h-32 border shadow-sm"
              data-ai-hint="profile photo"
            />
            <Button type="button" variant="outline" size="sm" asChild className="mt-2" disabled={isUploadingProfilePhoto || isSubmitting}>
              <label htmlFor="profile-photo-upload" className="cursor-pointer">
                {isUploadingProfilePhoto ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                {isUploadingProfilePhoto ? "Uploading..." : "Upload Photo"}
              </label>
            </Button>
            <Input
              id="profile-photo-upload"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleProfilePhotoChange}
              disabled={isUploadingProfilePhoto || isSubmitting}
            />
            <FormMessage />
          </FormItem>

          <div className="w-full space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username (Public)</FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g. ZeloMasterArtisan" {...field} className="pl-10" disabled={isSubmitting}/>
                    </FormControl>
                  </div>
                  <FormDescription>This will be part of your public profile URL.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline / Tagline</FormLabel>
                  <div className="relative">
                    <Info className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g., Expert Plumber - 10+ Years Experience" {...field} className="pl-10" disabled={isSubmitting}/>
                    </FormControl>
                  </div>
                  <FormDescription>A short, catchy phrase for your profile.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>


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
                    <Input placeholder="e.g. +2348012345678" {...field} className="pl-10" disabled={isSubmitting}/>
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
                    <Input type="email" placeholder="yourpublic@email.com" {...field} className="pl-10" disabled={isSubmitting}/>
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!isOnboarding && initialData?.servicesOffered && (
          <FormItem>
            <FormLabel className="text-md font-semibold">Your Primary Services</FormLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {initialData.servicesOffered.map(service => (
                <Badge key={service} variant="secondary" className="py-1 px-3 text-sm">{service}</Badge>
              ))}
            </div>
            <FormDescription>
              To change your primary services (max 2), please {' '}
              <Link href="/dashboard/profile/artisan/services/edit" className="text-primary underline hover:text-primary/80">
                visit the service management section
              </Link>.
            </FormDescription>
          </FormItem>
        )}


        {fields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Service Details</CardTitle>
              <CardDescription>
                For each of your selected primary services, specify years of experience and optionally, your typical charge.
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
                                disabled={isSubmitting}
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
                            <Coins className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <FormControl>
                            <Input
                                type="number"
                                placeholder="e.g. 5000"
                                min="0"
                                {...chargeAmountField}
                                value={chargeAmountField.value ?? ''}
                                className="pl-10 pr-2 text-sm h-9"
                                disabled={isSubmitting}
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
                                value={chargeDescField.value ?? ''}
                                className="pl-10 pr-2 text-sm h-9"
                                disabled={isSubmitting}
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

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Base Location</FormLabel>
                <div className="relative">
                <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g. Ikeja, Lagos" {...field} className="pl-10" disabled={isSubmitting}/>
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
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availabilityStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger className="relative pl-10">
                    <Activity className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <SelectValue placeholder="Select your availability" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="available">Available for new jobs</SelectItem>
                  <SelectItem value="busy">Currently busy, limited availability</SelectItem>
                  <SelectItem value="unavailable">Not taking new jobs</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Let clients know if you are open to new work.</FormDescription>
              <FormMessage />
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
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>Maximum 500 characters.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" /> Portfolio Images (Optional)
            </CardTitle>
            <CardDescription>Showcase your best work. Upload up to 5 images.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormItem>
               <FormControl>
                <div className="flex items-center justify-center w-full">
                    <label
                        htmlFor="portfolio-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 border-border hover:border-primary/50 transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploadingPortfolio ? <Loader2 className="w-8 h-8 mb-2 text-muted-foreground animate-spin" /> : <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />}
                            <p className="mb-1 text-sm text-muted-foreground">
                                <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">Up to 5 images (JPG, PNG, GIF)</p>
                        </div>
                        <Input
                          id="portfolio-upload"
                          type="file"
                          multiple
                          className="sr-only"
                          accept="image/*"
                          onChange={handlePortfolioChange}
                          disabled={isUploadingPortfolio || isSubmitting || uploadedPortfolioImageUrls.length >=5 }
                        />
                    </label>
                </div>
              </FormControl>
              <FormMessage className="mt-1"/>
            </FormItem>

            {portfolioPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {portfolioPreviews.slice(0,5).map((url, index) => (
                  <div key={index} className="relative aspect-[3/2] w-full overflow-hidden rounded-md border shadow-sm">
                    <Image
                      src={url}
                      alt={`Portfolio image ${index + 1}`}
                      width={300}
                      height={200}
                      className="object-cover w-full h-full"
                      data-ai-hint={url.includes("placehold.co") || url.startsWith("blob:") ? "portfolio work" : undefined}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>


        <div className="flex flex-wrap justify-end gap-3 pt-4">
          {backButtonHref && (
            <Button asChild variant="outline" disabled={isSubmitting || isUploadingProfilePhoto || isUploadingPortfolio}>
              <Link href={backButtonHref}>
                <ArrowLeft className="mr-2 h-4 w-4" /> {backButtonText}
              </Link>
            </Button>
          )}
          <Button type="submit" className="font-semibold" disabled={isSubmitting || isUploadingProfilePhoto || isUploadingPortfolio}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (submitButtonText || <><Save className="mr-2 h-4 w-4"/> Save Profile</>)}
            {isSubmitting && "Saving..."}
          </Button>
        </div>
      </form>
    </Form>
  );
}
