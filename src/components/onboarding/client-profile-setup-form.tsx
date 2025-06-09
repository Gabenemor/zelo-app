
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
import { Info, User, MapPin, Camera, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LocationAutocomplete } from '@/components/location/location-autocomplete';
import { saveClientStep2Profile } from '@/actions/onboarding-actions';
import Image from 'next/image';

const profileSetupSchema = z.object({
  location: z.string().min(3, { message: 'Location is required.' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }).optional(),
  // avatarFile: typeof window === 'undefined' ? z.any().optional() : z.instanceof(FileList).optional(), // For file upload
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

export function ClientProfileSetupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      location: '',
      username: '',
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
      // For actual upload, you'd handle the file object here
    }
  };

  const onSubmit = async (data: ProfileSetupFormValues) => {
    setIsLoading(true);
    // In a real app, handle avatarFile upload here, get URL, then save with other data
    const result = await saveClientStep2Profile({ location: data.location, username: data.username });
    setIsLoading(false);

    if (result.success) {
      toast({ title: "Profile Setup Complete (Mock)", description: "Your profile information has been saved." });
      router.push('/dashboard');
    } else {
      toast({
        title: "Error",
        description: "Could not save your profile. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving client profile:", result.error);
    }
  };

  const handleSkip = () => {
    // Optionally save a flag indicating skip, or just navigate
    toast({ title: "Skipped for Now", description: "You can complete your profile later from the dashboard." });
    router.push('/dashboard');
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
          <Button type="button" variant="outline" size="sm" asChild>
            <label htmlFor="avatarUpload" className="cursor-pointer">
              <Camera className="mr-2 h-4 w-4" /> Upload Photo
            </label>
          </Button>
          <input id="avatarUpload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} />
        </div>
      </div>

      <Controller
        name="username"
        control={control}
        render={({ field }) => (
          <div>
            <Label htmlFor="username">Choose a Username (Optional)</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="username" placeholder="e.g., ZeloUser123" {...field} className="pl-10" />
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
        <Button type="button" variant="outline" onClick={handleSkip} disabled={isLoading}>
          Skip for Now
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save and Go to Dashboard</>}
        </Button>
      </div>
    </form>
  );
}
