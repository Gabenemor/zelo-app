
'use server';

import { z } from 'zod';
import type { ArtisanProfile, ClientProfile, ServiceExperience } from '@/types';

const MOCK_USER_ID = 'mockUserId123';

const ClientPreferencesSchema = z.object({
  userId: z.string(),
  servicesLookingFor: z.array(z.string()).min(1, "Please select at least one service."),
});

export async function saveClientStep1Preferences(services: string[]) {
  const validation = ClientPreferencesSchema.safeParse({ userId: MOCK_USER_ID, servicesLookingFor: services });
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }
  console.log('[SERVER ACTION] Saving client step 1 preferences:', validation.data);
  return { success: true, data: validation.data };
}

const ClientProfileSetupSchema = z.object({
  userId: z.string(),
  location: z.string().min(1, "Location is required."),
  username: z.string().min(3, "Username must be at least 3 characters.").optional(),
});

export async function saveClientStep2Profile(data: { location: string; username?: string }) {
  const validation = ClientProfileSetupSchema.safeParse({ userId: MOCK_USER_ID, ...data });
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }
  console.log('[SERVER ACTION] Saving client step 2 profile:', validation.data);
  return { success: true, data: validation.data };
}

const ArtisanStep1ServicesSchema = z.object({
  userId: z.string(),
  servicesOffered: z.array(z.string().min(1))
    .length(2, "You must select exactly 2 primary services."),
});

export async function saveArtisanStep1Services(servicesOffered: string[]) {
  try {
    const dataToValidate = {
      userId: MOCK_USER_ID,
      servicesOffered: servicesOffered
    };

    console.log('[SERVER ACTION saveArtisanStep1Services] Data to validate:', JSON.stringify(dataToValidate, null, 2));

    const validation = ArtisanStep1ServicesSchema.safeParse(dataToValidate);
    if (!validation.success) {
      const flattenedErrors = validation.error.flatten();
      console.error("[SERVER ACTION VALIDATION ERROR] Artisan Step 1 Services:", JSON.stringify(flattenedErrors, null, 2));
      
      const clientErrorObject: Record<string, any> = {};
      if (flattenedErrors.formErrors.length > 0) {
        clientErrorObject._form = flattenedErrors.formErrors;
      }
      if (Object.keys(flattenedErrors.fieldErrors).length > 0) {
        clientErrorObject.fields = {};
        for (const key in flattenedErrors.fieldErrors) {
          const fieldKey = key as keyof typeof flattenedErrors.fieldErrors;
          if (flattenedErrors.fieldErrors[fieldKey]) {
             clientErrorObject.fields[fieldKey] = flattenedErrors.fieldErrors[fieldKey];
          }
        }
      }
      
      if (Object.keys(clientErrorObject).length === 0) {
          if (validation.error) { 
              clientErrorObject._server_error = ["Validation failed with a non-specific Zod error on the server."];
          } else { 
              clientErrorObject._server_error = ["Validation failed with an unknown error on the server."];
          }
      }
      console.log('[SERVER ACTION saveArtisanStep1Services] Client error object before return:', JSON.stringify(clientErrorObject, null, 2));
      return { success: false, error: clientErrorObject };
    }
    console.log('[SERVER ACTION] Saving artisan step 1 services:', validation.data);
    return { success: true, data: { userId: validation.data.userId, servicesOffered: validation.data.servicesOffered } };

  } catch (e: any) {
    console.error("[SERVER ACTION UNEXPECTED ERROR] saveArtisanStep1Services:", e);
    const errorPayload: Record<string, any> = { 
      _server_error: ["An unexpected error occurred on the server. Please try again later."] 
    };
    if (e instanceof Error && e.message) {
        (errorPayload._server_error as string[]).push(e.message);
    } else if (typeof e === 'string') {
        (errorPayload._server_error as string[]).push(e);
    } else {
        (errorPayload._server_error as string[]).push("No specific error message available.");
    }

    console.log('[SERVER ACTION saveArtisanStep1Services] Catch block error payload before return:', JSON.stringify(errorPayload, null, 2));
    return { 
      success: false, 
      error: errorPayload 
    };
  }
}

export async function updateArtisanPrimaryServices(userId: string, servicesOffered: string[]) {
  try {
    const dataToValidate = { userId, servicesOffered };
    console.log('[SERVER ACTION updateArtisanPrimaryServices] Data to validate:', JSON.stringify(dataToValidate, null, 2));

    const validation = ArtisanStep1ServicesSchema.safeParse(dataToValidate); // Re-use the same schema
    if (!validation.success) {
      const flattenedErrors = validation.error.flatten();
      console.error("[SERVER ACTION VALIDATION ERROR] Update Artisan Primary Services:", JSON.stringify(flattenedErrors, null, 2));
      
      // Construct error object similar to saveArtisanStep1Services for consistency
      const clientErrorObject: Record<string, any> = {};
      if (flattenedErrors.formErrors.length > 0) clientErrorObject._form = flattenedErrors.formErrors;
      if (Object.keys(flattenedErrors.fieldErrors).length > 0) {
        clientErrorObject.fields = {};
        for (const key in flattenedErrors.fieldErrors) {
          const fieldKey = key as keyof typeof flattenedErrors.fieldErrors;
          if (flattenedErrors.fieldErrors[fieldKey]) {
             clientErrorObject.fields[fieldKey] = flattenedErrors.fieldErrors[fieldKey];
          }
        }
      }
       if (Object.keys(clientErrorObject).length === 0 && validation.error) {
           clientErrorObject._server_error = ["Validation failed for primary services update."];
       }
      return { success: false, error: clientErrorObject };
    }

    console.log(`[SERVER ACTION MOCK] Updating primary services for user ${userId}:`, validation.data.servicesOffered);
    // In a real app, you would update the database here.
    // For mock purposes, we assume success.
    // You might also need to adjust serviceExperiences if services change.
    return { success: true, data: { userId: validation.data.userId, servicesOffered: validation.data.servicesOffered } };

  } catch (e: any) {
    console.error("[SERVER ACTION UNEXPECTED ERROR] updateArtisanPrimaryServices:", e);
    const errorPayload: Record<string, any> = { 
      _server_error: ["An unexpected error occurred while updating primary services. Please try again later."] 
    };
    if (e instanceof Error && e.message) (errorPayload._server_error as string[]).push(e.message);
    else if (typeof e === 'string') (errorPayload._server_error as string[]).push(e);
    else (errorPayload._server_error as string[]).push("No specific error message available.");
    
    return { success: false, error: errorPayload };
  }
}


const ArtisanOnboardingProfileSchema = z.object({
  userId: z.string(),
  username: z.string().min(3, "Username must be at least 3 characters.").optional().or(z.literal('')),
  profilePhotoUrl: z.string().url("Invalid URL for profile photo").optional().or(z.literal('')),
  headline: z.string().min(5, "Headline should be at least 5 characters.").max(100, "Headline too long.").optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email(),
  location: z.string().min(1),
  bio: z.string().optional().or(z.literal('')),
  serviceExperiences: z.array(z.object({
    serviceName: z.string(),
    years: z.coerce.number().int().min(0),
    chargeAmount: z.coerce.number().positive({ message: "Charge amount must be positive."}).optional(),
    chargeDescription: z.string().optional(),
  })).optional(),
  servicesOffered: z.array(z.string().min(1)).min(1), 
  isLocationPublic: z.boolean().optional(),
  availabilityStatus: z.enum(['available', 'busy', 'unavailable']).optional(),
  onboardingCompleted: z.boolean().optional(),
  profileSetupCompleted: z.boolean().optional(),
});


export async function saveArtisanOnboardingProfile(
  profileData: Partial<Omit<ArtisanProfile, 'userId' | 'onboardingStep1Completed'>>
) {
  try {
    const dataToValidate = {
      userId: MOCK_USER_ID, 
      username: profileData.username,
      profilePhotoUrl: profileData.profilePhotoUrl,
      headline: profileData.headline,
      contactEmail: profileData.contactEmail,
      location: profileData.location,
      contactPhone: profileData.contactPhone,
      bio: profileData.bio,
      serviceExperiences: profileData.serviceExperiences,
      servicesOffered: profileData.servicesOffered || [],
      isLocationPublic: profileData.isLocationPublic,
      availabilityStatus: profileData.availabilityStatus,
      onboardingCompleted: true,
      profileSetupCompleted: true,
    };
    console.log('[SERVER ACTION saveArtisanOnboardingProfile] Data to validate:', JSON.stringify(dataToValidate, null, 2));

    const validation = ArtisanOnboardingProfileSchema.safeParse(dataToValidate);

    if (!validation.success) {
      const flattenedErrors = validation.error.flatten();
      console.error("[SERVER ACTION VALIDATION ERROR] Artisan Onboarding Profile:", JSON.stringify(flattenedErrors, null, 2));
      
      const clientErrorObject: Record<string, any> = {};
      if (flattenedErrors.formErrors.length > 0) {
        clientErrorObject._form = flattenedErrors.formErrors;
      }
      if (Object.keys(flattenedErrors.fieldErrors).length > 0) {
        clientErrorObject.fields = {};
        for (const key in flattenedErrors.fieldErrors) {
          const fieldKey = key as keyof typeof flattenedErrors.fieldErrors;
          if (flattenedErrors.fieldErrors[fieldKey]) {
             clientErrorObject.fields[fieldKey] = flattenedErrors.fieldErrors[fieldKey];
          }
        }
      }
      
      if (Object.keys(clientErrorObject).length === 0) {
          if (validation.error) { 
              clientErrorObject._server_error = ["Validation failed with a non-specific Zod error on the server for profile."];
          } else { 
              clientErrorObject._server_error = ["Validation failed with an unknown error on the server for profile."];
          }
      }
      console.log('[SERVER ACTION saveArtisanOnboardingProfile] Client error object before return:', JSON.stringify(clientErrorObject, null, 2));
      return { success: false, error: clientErrorObject };
    }

    console.log('[SERVER ACTION] Saving artisan onboarding profile (step 2):', validation.data);
    // Mock database save
    return { success: true, data: validation.data as ArtisanProfile };

  } catch (e: any) {
    console.error("[SERVER ACTION UNEXPECTED ERROR] saveArtisanOnboardingProfile:", e);
    const errorPayload: Record<string, any> = { 
      _server_error: ["An unexpected error occurred on the server while saving the profile. Please try again later."] 
    };
    if (e instanceof Error && e.message) {
        (errorPayload._server_error as string[]).push(e.message);
    } else if (typeof e === 'string') {
        (errorPayload._server_error as string[]).push(e);
    } else {
        (errorPayload._server_error as string[]).push("No specific error message available.");
    }
    console.log('[SERVER ACTION saveArtisanOnboardingProfile] Catch block error payload before return:', JSON.stringify(errorPayload, null, 2));
    return { 
      success: false, 
      error: errorPayload 
    };
  }
}

export async function checkClientProfileCompleteness(userId: string): Promise<{ complete: boolean; missingFields?: string[] }> {
  console.log('[SERVER ACTION] Checking client profile completeness for userId (mock):', userId);
  // Mock: Assume profile is incomplete if certain fields are missing in a hypothetical DB record
  // For this demo, let's always return incomplete if not specifically 'completed'
  // const userProfile = await db.collection('clientProfiles').doc(userId).get();
  // if (!userProfile.exists || !userProfile.data()?.location || !userProfile.data()?.username) {
  //    return { complete: false, missingFields: ['location', 'username'] };
  // }
  return { complete: false, missingFields: ['location', 'username'] }; // Default to incomplete for demo
}
    
