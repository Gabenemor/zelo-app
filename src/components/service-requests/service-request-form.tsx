
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
import { Briefcase, Edit, DollarSign, CalendarDays, MapPin, Send, UploadCloud } from "lucide-react";
import type { ServiceRequest } from "@/types";
import { LocationAutocomplete } from "@/components/location/location-autocomplete";
import { useRouter } from "next/navigation"; // For redirecting after edit

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
  preferredDate: z.string().optional(), // Could use a date picker
  // attachments: typeof window === 'undefined' ? z.any().optional() : z.instanceof(FileList).optional().nullable(),
});

type ServiceRequestFormValues = z.infer<typeof serviceRequestSchema>;

interface ServiceRequestFormProps {
  clientId: string; // Logged-in client's ID
  initialData?: Partial<ServiceRequest>; // For editing
  isEditing?: boolean; // New prop
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
      preferredDate: initialData?.postedAt ? new Date(initialData.postedAt).toISOString().split('T')[0] : "",
      // attachments: null,
    },
  });

  const handleLocationSelect = (location: { address: string; lat?: number; lng?: number }) => {
    form.setValue("location", location.address, { shouldValidate: true });
  };

  // const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = event.target.files;
  //   if (files) {
  //     form.setValue("attachments", files);
  //     // Handle previews if needed
  //   }
  // };

  async function onSubmit(values: ServiceRequestFormValues) {
    setIsLoading(true);
    // In a real app, handle file uploads for 'attachments' first, get URLs, then include in submissionData.
    // For mock, we're not processing actual files.
    const submissionData = { 
      ...values, 
      clientId, 
      postedAt: initialData?.postedAt ? new Date(initialData.postedAt) : new Date(), 
      status: initialData?.status || ("open" as const),
      id: initialData?.id, // Include ID if editing
      // attachmentUrls: [] // Placeholder for uploaded file URLs
    };
    console.log("Service request submission (isEditing:", isEditing, "):", submissionData);
    
    // Placeholder for actual backend submission logic
    // if (isEditing && initialData?.id) {
    //   // Call update action: await updateServiceRequest(initialData.id, submissionData);
    // } else {
    //   // Call create action: await createServiceRequest(submissionData);
    // }

    // Mock success
    setTimeout(() => {
      if (isEditing) {
        toast({ title: "Service Request Updated (Mock)", description: "Your changes have been saved." });
        // Optionally redirect to the detail page after edit
        if (initialData?.id) {
          router.push(`/dashboard/services/requests/${initialData.id}`);
        } else {
           router.push('/dashboard/services/my-requests'); // Fallback
        }
      } else {
        toast({ title: "Service Request Submitted (Mock)", description: "Your request is now live." });
        form.reset(); // Only reset for new submissions
        router.push('/dashboard/services/my-requests');
      }
      setIsLoading(false);
    }, 1000);
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
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <FormControl>
                    <Input type="number" placeholder="e.g., 10000" {...field} className="pl-10" />
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
        
        {/* <FormField
            control={form.control}
            name="attachments"
            render={({ field }) => ( // `field` contains onChange, onBlur, value, name, ref
            <FormItem>
                <FormLabel>Attach Files (Optional)</FormLabel>
                <FormControl>
                    <div className="flex items-center justify-center w-full">
                        <label
                            htmlFor="attachments-upload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary/50 border-border hover:border-primary/50 transition-colors"
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-1 text-sm text-muted-foreground">
                                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">Images or Documents (PDF, DOCX)</p>
                            </div>
                            <Input 
                              id="attachments-upload" 
                              type="file" 
                              multiple 
                              className="sr-only" 
                              accept="image/*,application/pdf,.doc,.docx" 
                              onChange={(e) => {
                                field.onChange(e.target.files); 
                                // handleAttachmentChange(e); // You might need a separate handler for previews
                              }} 
                              disabled={isLoading} 
                            />
                        </label>
                    </div>
                </FormControl>
                <FormDescription>You can attach images or documents relevant to your request.</FormDescription>
                <FormMessage />
            </FormItem>
            )}
        /> */}


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
