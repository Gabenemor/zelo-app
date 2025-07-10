
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { Briefcase, Edit, Coins, CalendarDays, MapPin, Send, UploadCloud } from "lucide-react";
import type { ServiceRequest } from "@/types";
import { LocationAutocomplete } from "@/components/location/location-autocomplete";
import { useRouter } from "next/navigation";
import { createServiceRequest, updateServiceRequest } from "@/lib/firestore";

// Mock service categories - align with artisan services
const SERVICE_CATEGORIES = [
  "Tailoring/Fashion Design", "Plumbing", "Electrical Services", "Carpentry",
  "Hairdressing/Barbing", "Makeup Artistry", "Catering", "Event Planning",
  "Photography/Videography", "Graphic Design", "Web Development", "Appliance Repair",
  "AC Repair & Installation", "Generator Repair", "Welding/Fabrication", "Painting",
  "Tiling", "POP Ceiling Installation", "Car Mechanic", "Home Cleaning", "Other"
];

const serviceRequestSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(100, "Title too long."),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }).max(1000, "Description too long."),
  category: z.string().min(1, { message: "Please select a service category." }),
  location: z.string().min(3, { message: "Location is required." }),
  budget: z.coerce.number().positive({ message: "Budget must be a positive number."}).optional(),
  preferredDate: z.string().optional(),
});

type ServiceRequestFormValues = z.infer<typeof serviceRequestSchema>;

interface ServiceRequestFormProps {
  clientId: string;
  initialData?: Partial<ServiceRequest>;
  isEditing?: boolean;
}

export function ServiceRequestForm({ clientId, initialData, isEditing = false }: ServiceRequestFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      location: initialData?.location || "",
      budget: initialData?.budget || undefined,
      preferredDate: (initialData?.postedAt && typeof initialData.postedAt.getMonth === 'function')
        ? new Date(initialData.postedAt).toISOString().split('T')[0]
        : "",
    },
  });

  const handleLocationSelect = (location: { address: string; lat?: number; lng?: number }) => {
    form.setValue("location", location.address, { shouldValidate: true });
  };

  async function onSubmit(values: ServiceRequestFormValues) {
    setIsLoading(true);
    try {
      if (isEditing && initialData?.id) {
        const updateData: Partial<ServiceRequest> = {
          ...values,
          budget: values.budget || undefined,
        };
        await updateServiceRequest(initialData.id, updateData);
        toast({ title: "Service Request Updated", description: "Your changes have been saved." });
        router.push(`/dashboard/services/requests/${initialData.id}?role=client`);
      } else {
        const submissionData: Omit<ServiceRequest, 'id' | 'postedAt' | 'status'> = {
          ...values,
          clientId,
          budget: values.budget || undefined,
          // `postedAt` and `status` will be set by the backend function
        };
        const newRequestId = await createServiceRequest(submissionData);
        toast({ title: "Service Request Submitted", description: "Your request is now live." });
        router.push(`/dashboard/services/requests/${newRequestId}?role=client`);
      }
      form.reset();
    } catch (error: any) {
      console.error("Failed to submit service request:", error);
      toast({ title: "Submission Failed", description: error.message || "An unexpected error occurred.", variant: "destructive"});
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-0 sm:p-6 border-0 sm:border rounded-lg sm:shadow-sm sm:bg-card">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Title</FormLabel>
              <div className="relative">
                <Edit className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., Leaky Pipe Repair, Wedding Cake Needed" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the service you need in detail. Include specifics like size, quantity, materials (if known), urgency, etc."
                  className="resize-y min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="relative pl-10">
                       <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SERVICE_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (Optional, in Naira ₦)</FormLabel>
                 <div className="relative">
                  <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10000" {...field} value={field.value ?? ''} className="pl-10" />
                  </FormControl>
                </div>
                <FormDescription>Enter your estimated budget for this service.</FormDescription>
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
              <FormLabel>Service Location</FormLabel>
              <FormControl>
                 <LocationAutocomplete
                    onLocationSelect={handleLocationSelect}
                    initialValue={field.value}
                    placeholder="Enter the specific address or area for the service"
                 />
              </FormControl>
              <FormDescription>Where is the service needed? Be as specific as possible.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Date/Time (Optional)</FormLabel>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <FormControl>
                  <Input type="date" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormDescription>When would you like this service to be done?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto font-semibold" disabled={isLoading}>
          {isLoading
            ? (isEditing ? "Updating..." : "Submitting...")
            : (
              <>
                <Send className="mr-2 h-4 w-4" />
                {isEditing ? "Update Request" : "Submit Service Request"}
              </>
            )
          }
        </Button>
      </form>
    </Form>
  );
}
