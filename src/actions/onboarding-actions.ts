
'use server';

import { z } from 'zod';
import type { ArtisanProfile, ClientProfile, ServiceExperience } from '@/types';

// Mock user ID - in a real app, this would come from authentication context
const MOCK_USER_ID = 'mockUserId123';

// --- Client Onboarding Actions ---

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
  // TODO: Implement actual database write to Firestore or other DB
  // e.g., await db.collection('clientProfiles').doc(validation.data.userId).set({ servicesLookingFor: validation.data.servicesLookingFor, onboardingStep1Completed: true }, { merge: true });
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
  // TODO: Implement actual database write
  // e.g., await db.collection('clientProfiles').doc(validation.data.userId).set({ location: validation.data.location, username: validation.data.username, profileSetupCompleted: true, onboardingCompleted: true }, { merge: true });
  return { success: true, data: validation.data };
}


// --- Artisan Onboarding Actions ---

const ArtisanServiceExperienceSchema = z.object({
  serviceName: z.string().min(1, "Service name cannot be empty."),
  years: z.coerce.number().int().min(0, "Years of experience must be a non-negative number."),
});

const ArtisanStep1ServicesSchema = z.object({
  userId: z.string(),
  serviceExperiences: z.array(ArtisanServiceExperienceSchema)
    .min(1, "Select at least one service and provide experience.")
    .max(2, "You can select a maximum of 2 services during onboarding."),
  servicesOffered: z.array(z.string().min(1)).min(1, "At least one service offered is required."),
});


export async function saveArtisanStep1Services(experiences: Array<{ serviceName: string; years: number }>) {
  try {
    const servicesOffered = experiences.map(exp => exp.serviceName);
    const dataToValidate = {
      userId: MOCK_USER_ID,
      serviceExperiences: experiences,
      servicesOffered: servicesOffered
    };

    const validation = ArtisanStep1ServicesSchema.safeParse(dataToValidate);
    if (!validation.success) {
      const flattenedErrors = validation.error.flatten();
      console.error("[SERVER ACTION VALIDATION ERROR] Artisan Step 1 Services:", flattenedErrors);
      
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
          if (validation.error) { // If Zod error exists but couldn't be parsed into form/field errors
              clientErrorObject._server_error = ["Validation failed with a non-specific Zod error on the server."];
          } else { // Should not happen if !validation.success is true and validation.error is null
              clientErrorObject._server_error = ["Validation failed with an unknown error on the server."];
          }
      }

      return { success: false, error: clientErrorObject };
    }
    console.log('[SERVER ACTION] Saving artisan step 1 services & experience:', validation.data);
    // TODO: Implement actual database write
    // e.g., await db.collection('artisanProfiles').doc(validation.data.userId).set({ servicesOffered: validation.data.servicesOffered, serviceExperiences: validation.data.serviceExperiences, onboardingStep1Completed: true }, { merge: true });
    return { success: true, data: validation.data };

  } catch (e: any) {
    console.error("[SERVER ACTION UNEXPECTED ERROR] saveArtisanStep1Services:", e);
    return { 
      success: false, 
      error: { _server_error: ["An unexpected error occurred on the server. Please try again later.", e.message || "No specific error message."] } 
    };
  }
}


const ArtisanOnboardingProfileSchema = z.object({
  userId: z.string(),
  username: z.string().min(3, "Username must be at least 3 characters.").optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email(),
  location: z.string().min(1),
  bio: z.string().optional(),
  serviceExperiences: z.array(ArtisanServiceExperienceSchema).optional(), 
  servicesOffered: z.array(z.string().min(1)).min(1), 
  serviceChargeAmount: z.coerce.number().positive().optional(),
  serviceChargeDescription: z.string().optional(),
  isLocationPublic: z.boolean().optional(),
  onboardingCompleted: z.boolean().optional(),
  profileSetupCompleted: z.boolean().optional(),
});


export async function saveArtisanOnboardingProfile(
  profileData: Partial<Omit<ArtisanProfile, 'userId' | 'onboardingStep1Completed'>>
) {
  const dataToValidate = {
    userId: MOCK_USER_ID, 
    username: profileData.username,
    contactEmail: profileData.contactEmail,
    location: profileData.location,
    contactPhone: profileData.contactPhone,
    bio: profileData.bio,
    serviceExperiences: profileData.serviceExperiences, 
    servicesOffered: profileData.servicesOffered || [], 
    serviceChargeAmount: profileData.serviceChargeAmount,
    serviceChargeDescription: profileData.serviceChargeDescription,
    isLocationPublic: profileData.isLocationPublic,
    onboardingCompleted: true,
    profileSetupCompleted: true,
  };

  const validation = ArtisanOnboardingProfileSchema.safeParse(dataToValidate);

  if (!validation.success) {
    console.error("Artisan onboarding profile validation error:", validation.error.flatten());
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  console.log('[SERVER ACTION] Saving artisan onboarding profile (step 2):', validation.data);
  // TODO: Implement actual database write using all fields from ArtisanProfile.
  // This would likely update the artisan profile document.
  // e.g., await db.collection('artisanProfiles').doc(validation.data.userId).set(validation.data, { merge: true });
  return { success: true, data: validation.data };
}

// --- Mock function to check profile completeness ---
export async function checkClientProfileCompleteness(userId: string): Promise<{ complete: boolean; missingFields?: string[] }> {
  console.log('[SERVER ACTION] Checking client profile completeness for userId (mock):', userId);
  // Mock logic: Fetch user's clientProfile from DB
  // const clientProfileDoc = await db.collection('clientProfiles').doc(userId).get();
  // if (!clientProfileDoc.exists) return { complete: false, missingFields: ['profile_does_not_exist'] };
  // const clientProfile = clientProfileDoc.data() as ClientProfile;
  // const isComplete = !!(clientProfile.location && clientProfile.username && clientProfile.onboardingCompleted);
  // if (isComplete) return { complete: true };
  // const missing: string[] = [];
  // if (!clientProfile.location) missing.push('location');
  // if (!clientProfile.username) missing.push('username');
  // return { complete: false, missingFields: missing.length > 0 ? missing : ['onboarding_not_marked_complete'] };

  // This is a mock, returning false to trigger the UI prompt for demo purposes
  return { complete: false, missingFields: ['location', 'username'] };
}
