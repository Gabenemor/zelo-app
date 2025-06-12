
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, User, MapPin, Camera, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocationAutocomplete } from '@/components/location/location-autocomplete';
import { saveClientStep2Profile } from '@/actions/onboarding-actions';
import Image from 'next/image';
import { uploadClientAvatar } from '@/lib/storage'; // Import upload function


// This schema is now for the form, server action will use its own
const clientProfileSetupFormSchema = z.object({
  location: z.string().min(3, { message: 'Location is required.' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).optional().or(z.literal('')),
  fullName: z.string().min(2, "Full name is required").optional().or(z.literal('')),
  contactEmail: z.string().email("Valid email required").optional().or(z.literal('')),
  // avatarFile: typeof window === 'undefined' ? z.any().optional() : z.instanceof(FileList).optional(),
});

type ProfileSetupFormValues = z.infer<typeof clientProfileSetupFormSchema>;

export function ClientProfileSetupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Mock User ID - in a real app, get this from auth context or props
  const MOCK_CLIENT_ID = "mockClientUserOnboarding123"; 

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(clientProfileSetupFormSchema),
    defaultValues: {
      location: '',
      username: '',
      fullName: '',
      contactEmail: '',
    },
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && MOCK_CLIENT_ID) {
      setIsUploadingAvatar(true);
      setAvatarPreview(URL.createObjectURL(file)); // Optimistic preview
      try {
        const downloadURL = await uploadClientAvatar(MOCK_CLIENT_ID, file);
        setUploadedAvatarUrl(downloadURL);
        setAvatarPreview(downloadURL); // Update preview with actual URL
        toast({ title: "Avatar uploaded!" });
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast({ title: "Upload failed", description: "Could not upload avatar.", variant: "destructive" });
        setAvatarPreview(uploadedAvatarUrl); // Revert to old/null on failure
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const onSubmit = async (data: ProfileSetupFormValues) => {
    setIsSubmitting(true);
    
    const result = await saveClientStep2Profile({ 
      userId: MOCK_CLIENT_ID, // Pass the client ID
      location: data.location, 
      username: data.username,
      fullName: data.fullName,
      contactEmail: data.contactEmail,
      avatarUrl: uploadedAvatarUrl || undefined, // Send the uploaded avatar URL
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Profile Setup Complete", description: "Your profile information has been saved." });
      router.push('/dashboard?role=client');
    } else {
        let errorMsg = "Could not save your profile. Please try again.";
        if (result.error) {
            const fieldErrors = Object.values(result.error).flat().join(" ");
            if (fieldErrors) errorMsg = fieldErrors;
        }
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
      console.error("Error saving client profile:", result.error);
    }
  };

  const handleSkip = () => {
    toast({ title: "Skipped for Now", description: "You can complete your profile later from the dashboard." });
    router.push('/dashboard?role=client');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="avatarUpload" className="block text-sm font-medium mb-2">Profile Photo (Optional)</Label>
        <div className="flex items-center gap-4">
          <Image
            src={avatarPreview || "https://placehold.co/100x100.png?text=Avatar"}
            alt="Avatar Preview"
            width={100}
            height={100}
            className="rounded-full object-cover border"
            data-ai-hint="profile avatar"
          />
          <Button type="button" variant="outline" size="sm" asChild disabled={isUploadingAvatar || isSubmitting}>
            <label htmlFor="avatarUpload" className="cursor-pointer">
              {isUploadingAvatar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
              {isUploadingAvatar ? "Uploading..." : "Upload Photo"}
            </label>
          </Button>
          <input id="avatarUpload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isUploadingAvatar || isSubmitting} />
        </div>
      </div>

      <Controller
        name="fullName"
        control={control}
        render={({ field }) => (
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="fullName" placeholder="e.g., Ada Obi" {...field} className="pl-10" disabled={isSubmitting} />
            </div>
            {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
          </div>
        )}
      />
      
      <Controller
        name="contactEmail"
        control={control}
        render={({ field }) => (
          <div>
            <Label htmlFor="contactEmail">Contact Email</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="contactEmail" type="email" placeholder="e.g., ada@example.com" {...field} className="pl-10" disabled={isSubmitting}/>
            </div>
            {errors.contactEmail && <p className="text-sm text-destructive mt-1">{errors.contactEmail.message}</p>}
          </div>
        )}
      />

      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <div>
            <Label htmlFor="username">Choose a Username (Optional)</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="username" placeholder="e.g., ZeloClient123" {...field} className="pl-10" disabled={isSubmitting}/>
            </div>
            {errors.username && <p className="text-sm text-destructive mt-1">{errors.username.message}</p>}
          </div>
        )}
      />

      <div>
        <Label htmlFor="location">Your Location</Label>
        <Controller
            name="location"
            control={control}
            render={({ field }) => (
                 <LocationAutocomplete
                    onLocationSelect={(loc) => setValue('location', loc.address, { shouldValidate: true })}
                    initialValue={field.value}
                    placeholder="Enter your city or area"
                    className="mt-1"
                    
                />
            )}
        />
        {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
      </div>
      

      <div>
        <Label>Currency</Label>
        <div className="mt-1 flex items-center gap-2 rounded-md border border-input bg-secondary/30 p-2.5 text-sm">
          <span>NGN (Nigerian Naira)</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="p-0.5"><Info className="h-4 w-4 text-muted-foreground" /></button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Currency is currently fixed to NGN for all transactions on Zelo.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={handleSkip} disabled={isSubmitting || isUploadingAvatar}>
          Skip for Now
        </Button>
        <Button type="submit" disabled={isSubmitting || isUploadingAvatar}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isSubmitting ? "Saving..." : "Save and Go to Dashboard"}
        </Button>
      </div>
    </form>
  );
}
