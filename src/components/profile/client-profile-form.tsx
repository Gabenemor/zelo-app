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
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Phone, Home, Save, User, Mail } from "lucide-react";
import type { ClientProfile } from "@/types";
import Image from "next/image";

const clientProfileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required." }),
  contactEmail: z.string().email({ message: "A valid contact email is required." }),
  contactPhone: z.string().optional().refine(val => !val || /^\+?[0-9]{10,14}$/.test(val), {
    message: "Invalid phone number format."
  }),
  location: z.string().min(3, { message: "Location is required." }).optional(),
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
      // Here you would also handle file upload to a server and get back a URL
      // For now, we just use the preview.
      // form.setValue("avatarUrl", "new_uploaded_url_placeholder"); 
    }
  };

  async function onSubmit(values: ClientProfileFormValues) {
    setIsLoading(true);
    console.log("Client profile submission for user:", userId, { ...values, avatarUrl: avatarPreview });
    // Placeholder for actual backend submission
    // try {
    //   // await db.collection("clientProfiles").doc(userId).set(values, { merge: true });
    //   // await updateUserAuthProfile({displayName: values.fullName, photoURL: avatarPreview});
    //   toast({ title: "Profile Updated", description: "Your client profile has been successfully updated." });
    // } catch (error: any) {
    //   toast({
    //     title: "Update Failed",
    //     description: error.message || "Could not update profile. Please try again.",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setIsLoading(false);
    // }

    // Mock success
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
                    <Edit3Icon className="h-4 w-4" />
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
        
        <Button type="submit" className="w-full md:w-auto font-semibold" disabled={isLoading}>
          {isLoading ? "Saving..." : <> <Save className="mr-2 h-4 w-4" /> Save Profile </>}
        </Button>
      </form>
    </Form>
  );
}

function Edit3Icon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    )
  }
