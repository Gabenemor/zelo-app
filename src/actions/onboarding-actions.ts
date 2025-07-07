
'use server';

import { z } from 'zod';
import type { ArtisanProfile, ClientProfile, ServiceExperience } from '@/types';
import { db } from '@/lib/firebase-server-init'; 
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const ClientPreferencesSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  servicesLookingFor: z.array(z.string()).min(1, "Please select at least one service."),
});

export async function saveClientStep1Preferences(userId: string, services: string[]) {
  if (!userId) {
    console.error("[SERVER ACTION ERROR] saveClientStep1Preferences: userId is missing.");
    return { success: false, error: { _form: ["User identification failed. Please try again."] } };
  }
  const validation = ClientPreferencesSchema.safeParse({ userId, servicesLookingFor: services });
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  try {
    if (!db || Object.keys(db).length === 0) {
      console.error("Firestore not initialized. Cannot save client preferences.");
      return { success: false, error: { _form: ["Server error: Database not configured."] } };
    }
    const clientProfileRef = doc(db, 'clientProfiles', userId); // Use provided userId
    await setDoc(clientProfileRef, {
      userId: userId, 
      servicesLookingFor: validation.data.servicesLookingFor,
      updatedAt: serverTimestamp(),
      onboardingStep1Completed: true, // Mark step 1 as complete
    }, { merge: true });
    console.log(`[SERVER ACTION] Client step 1 preferences saved to Firestore for user ${userId}:`, validation.data);
    return { success: true, data: validation.data };

  } catch (error: any) {
    console.error(`[SERVER ACTION ERROR] Failed to save client step 1 preferences to Firestore for user ${userId}:`, error);
    return { success: false, error: { _form: ["Failed to save preferences to database.", error.message] } };
  }
}

const ClientProfileSetupSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  fullName: z.string().min(2, { message: "Full name is required." }).optional().or(z.literal('')),
  contactEmail: z.string().email({ message: "A valid contact email is required." }).optional().or(z.literal('')),
  location: z.string().min(1, "Location is required."),
  username: z.string().min(3, "Username must be at least 3 characters.").optional().or(z.literal('')),
  avatarUrl: z.string().url("Invalid URL for avatar.").optional().or(z.literal('')),
  isLocationPublic: z.boolean().optional(),
});

export async function saveClientStep2Profile(data: {
  userId: string; 
  location: string;
  username?: string;
  fullName?: string;
  contactEmail?: string;
  avatarUrl?: string;
  isLocationPublic?: boolean;
}) {
   if (!data.userId) {
    console.error("[SERVER ACTION ERROR] saveClientStep2Profile: userId is missing from input data.");
    return { success: false, error: { _form: ["User identification failed. Cannot save profile."] } };
  }
  const validation = ClientProfileSetupSchema.safeParse(data); 
  if (!validation.success) {
    console.error("[SERVER ACTION VALIDATION ERROR] Client Step 2 Profile:", JSON.stringify(validation.error.flatten(), null, 2));
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  try {
    if (!db || Object.keys(db).length === 0) {
      console.error("Firestore not initialized. Cannot save client profile.");
      return { success: false, error: { _form: ["Server error: Database not configured."] } };
    }
    const clientProfileRef = doc(db, 'clientProfiles', validation.data.userId); 
    
    const profileDataToSave: Partial<ClientProfile> = {
      userId: validation.data.userId, 
      location: validation.data.location,
      username: validation.data.username || undefined, 
      fullName: validation.data.fullName || undefined,
      contactEmail: validation.data.contactEmail || undefined,
      avatarUrl: validation.data.avatarUrl || undefined,
      isLocationPublic: validation.data.isLocationPublic === undefined ? false : validation.data.isLocationPublic,
      onboardingCompleted: true,
      profileSetupCompleted: true,
      updatedAt: serverTimestamp(),
    };
    
    // Ensure createdAt is set only once
    const profileSnap = await getDoc(clientProfileRef);
    if (!profileSnap.exists()) {
      (profileDataToSave as ClientProfile).createdAt = serverTimestamp() as any;
    }

    await setDoc(clientProfileRef, profileDataToSave, { merge: true });

    console.log(`[SERVER ACTION] Client step 2 profile saved to Firestore for user ${validation.data.userId}:`, validation.data);
    return { success: true, data: validation.data };
  } catch (error: any) {
    console.error(`[SERVER ACTION ERROR] Failed to save client step 2 profile to Firestore for user ${validation.data.userId}:`, error);
    return { success: false, error: { _form: ["Failed to save profile to database.", error.message] } };
  }
}

const ArtisanStep1ServicesSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  servicesOffered: z.array(z.string().min(1))
    .length(2, "You must select exactly 2 primary services."),
});

export async function saveArtisanStep1Services(userId: string, servicesOffered: string[]) {
  if (!userId) {
    console.error("[SERVER ACTION ERROR] saveArtisanStep1Services: userId is missing.");
    return { success: false, error: { _form: ["User identification failed. Please try again."] } };
  }
  try {
    const dataToValidate = { userId, servicesOffered };

    const validation = ArtisanStep1ServicesSchema.safeParse(dataToValidate);
    if (!validation.success) {
      const flattenedErrors = validation.error.flatten();
      console.error("[SERVER ACTION VALIDATION ERROR] Artisan Step 1 Services:", JSON.stringify(flattenedErrors, null, 2));
      const clientErrorObject: Record<string, any> = {};
      if (flattenedErrors.formErrors.length > 0) {
        clientErrorObject._form = flattenedErrors.formErrors;
      }
      if (Object.keys(flattenedErrors.fieldErrors).length > 0) {
        clientErrorObject.fields = flattenedErrors.fieldErrors;
      }
      if (Object.keys(clientErrorObject).length === 0 && validation.error) {
        clientErrorObject._form = ["Validation failed. Please check your inputs."];
      }
      return { success: false, error: clientErrorObject };
    }

    if (!db || Object.keys(db).length === 0) {
      console.error("Firestore not initialized. Cannot save artisan services.");
      return { success: false, error: { _form: ["Server error: Database not configured."] } };
    }
    const artisanProfileRef = doc(db, 'artisanProfiles', userId); // Use provided userId
    await setDoc(artisanProfileRef, {
      userId: userId, 
      servicesOffered: validation.data.servicesOffered,
      onboardingStep1Completed: true,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    console.log(`[SERVER ACTION] Artisan step 1 services saved to Firestore for user ${userId}:`, validation.data);
    return { success: true, data: { userId: validation.data.userId, servicesOffered: validation.data.servicesOffered } };

  } catch (e: any) {
    console.error(`[SERVER ACTION UNEXPECTED ERROR] saveArtisanStep1Services for user ${userId}:`, e);
    const errorPayload: Record<string, any> = { 
      _server_error: ["An unexpected error occurred."] 
    };
    if (e instanceof Error && e.message) (errorPayload._server_error as string[]).push(e.message);
    return { success: false, error: errorPayload };
  }
}

export async function updateArtisanPrimaryServices(userId: string, servicesOffered: string[]) {
  if (!userId) {
    console.error("[SERVER ACTION ERROR] updateArtisanPrimaryServices: userId is missing.");
    return { success: false, error: { _form: ["User identification failed. Please try again."] } };
  }
  try {
    const dataToValidate = { userId, servicesOffered };
    const validation = ArtisanStep1ServicesSchema.safeParse(dataToValidate); 
    if (!validation.success) {
      const flattenedErrors = validation.error.flatten();
      console.error("[SERVER ACTION VALIDATION ERROR] Update Artisan Primary Services:", JSON.stringify(flattenedErrors, null, 2));
      const clientErrorObject: Record<string, any> = {};
      if (flattenedErrors.formErrors.length > 0) {
        clientErrorObject._form = flattenedErrors.formErrors;
      }
      if (Object.keys(flattenedErrors.fieldErrors).length > 0) {
        clientErrorObject.fields = flattenedErrors.fieldErrors;
      }
      if (Object.keys(clientErrorObject).length === 0 && validation.error) {
        clientErrorObject._form = ["Validation failed. Please check your inputs."];
      }
      return { success: false, error: clientErrorObject };
    }

    if (!db || Object.keys(db).length === 0) {
      console.error("Firestore not initialized. Cannot update artisan primary services.");
      return { success: false, error: { _form: ["Server error: Database not configured."] } };
    }
    const artisanProfileRef = doc(db, 'artisanProfiles', userId);
    await setDoc(artisanProfileRef, {
      servicesOffered: validation.data.servicesOffered,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    console.log(`[SERVER ACTION] Updated primary services for user ${userId} in Firestore:`, validation.data.servicesOffered);
    return { success: true, data: { userId: validation.data.userId, servicesOffered: validation.data.servicesOffered } };

  } catch (e: any) {
    console.error(`[SERVER ACTION UNEXPECTED ERROR] updateArtisanPrimaryServices for user ${userId}:`, e);
    const errorPayload: Record<string, any> = { _server_error: ["An unexpected error occurred."] };
    if (e instanceof Error && e.message) (errorPayload._server_error as string[]).push(e.message);
    return { success: false, error: errorPayload };
  }
}

const ArtisanOnboardingProfileSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  username: z.string().min(3, "Username must be at least 3 characters.").optional().or(z.literal('')),
  profilePhotoUrl: z.string().url("Invalid URL for profile photo").optional().or(z.literal('')),
  headline: z.string().min(5, "Headline should be at least 5 characters.").max(100, "Headline too long.").optional().or(z.literal('')),
  contactPhone: z.string().optional().refine(val => !val || /^\+?[0-9]{10,14}$/.test(val), { message: "Invalid phone number format."}).or(z.literal('')),
  contactEmail: z.string().email({ message: "Invalid email address." }),
  location: z.string().min(1, "Location is required."),
  bio: z.string().max(500, "Bio is too long.").optional().or(z.literal('')),
  serviceExperiences: z.array(z.object({
    serviceName: z.string(),
    years: z.coerce.number().int().min(0),
    chargeAmount: z.coerce.number().positive({ message: "Charge amount must be positive."}).optional(),
    chargeDescription: z.string().max(50, "Basis description too long.").optional(),
  })).optional(),
  servicesOffered: z.array(z.string().min(1)).min(1, "At least one service must be offered."), 
  isLocationPublic: z.boolean().optional(),
  availabilityStatus: z.enum(['available', 'busy', 'unavailable']).optional(),
  portfolioImageUrls: z.array(z.string().url()).optional(),
  onboardingCompleted: z.boolean().optional(),
  profileSetupCompleted: z.boolean().optional(),
});


export async function saveArtisanOnboardingProfile(
  profileData: Partial<Omit<ArtisanProfile, 'onboardingStep1Completed'>> & { userId: string }
) {
  if (!profileData.userId) {
    console.error("[SERVER ACTION ERROR] saveArtisanOnboardingProfile: userId is missing from input data.");
    return { success: false, error: { _form: ["User identification failed. Cannot save profile."] } };
  }
  try {
    const dataToValidate = {
      userId: profileData.userId, 
      username: profileData.username,
      profilePhotoUrl: profileData.profilePhotoUrl,
      headline: profileData.headline,
      contactEmail: profileData.contactEmail, 
      location: profileData.location,
      contactPhone: profileData.contactPhone,
      bio: profileData.bio,
      serviceExperiences: profileData.serviceExperiences || [],
      servicesOffered: profileData.servicesOffered || [],
      isLocationPublic: profileData.isLocationPublic,
      availabilityStatus: profileData.availabilityStatus,
      portfolioImageUrls: profileData.portfolioImageUrls || [],
      onboardingCompleted: true,
      profileSetupCompleted: true,
    };
    
    const validation = ArtisanOnboardingProfileSchema.safeParse(dataToValidate);

    if (!validation.success) {
      const flattenedErrors = validation.error.flatten();
      console.error("[SERVER ACTION VALIDATION ERROR] Artisan Onboarding Profile:", JSON.stringify(flattenedErrors, null, 2));
      const clientErrorObject: Record<string, any> = {};
      if (flattenedErrors.formErrors.length > 0) {
        clientErrorObject._form = flattenedErrors.formErrors;
      }
      if (Object.keys(flattenedErrors.fieldErrors).length > 0) {
        clientErrorObject.fields = flattenedErrors.fieldErrors;
      }
      if (Object.keys(clientErrorObject).length === 0 && validation.error) {
        clientErrorObject._form = ["Validation failed. Please check your inputs."];
      }
      return { success: false, error: clientErrorObject };
    }

    if (!db || Object.keys(db).length === 0) {
      console.error("Firestore not initialized. Cannot save artisan profile.");
      return { success: false, error: { _form: ["Server error: Database not configured."] } };
    }

    const artisanProfileRef = doc(db, 'artisanProfiles', validation.data.userId);
    
    const dataToSave: Partial<ArtisanProfile> = { 
      userId: validation.data.userId,
      username: validation.data.username || undefined,
      profilePhotoUrl: validation.data.profilePhotoUrl || undefined,
      headline: validation.data.headline || undefined,
      contactEmail: validation.data.contactEmail, 
      contactPhone: validation.data.contactPhone || undefined,
      location: validation.data.location,
      bio: validation.data.bio || undefined,
      servicesOffered: validation.data.servicesOffered,
      serviceExperiences: validation.data.serviceExperiences,
      isLocationPublic: validation.data.isLocationPublic === undefined ? false : validation.data.isLocationPublic,
      availabilityStatus: validation.data.availabilityStatus || undefined,
      portfolioImageUrls: validation.data.portfolioImageUrls,
      onboardingCompleted: true,
      profileSetupCompleted: true,
      updatedAt: serverTimestamp(),
    };
    
    const userProfileSnap = await getDoc(artisanProfileRef);
    if (!userProfileSnap.exists()) {
      (dataToSave as ArtisanProfile).createdAt = serverTimestamp() as any; 
    }
    
    await setDoc(artisanProfileRef, dataToSave, { merge: true });

    console.log(`[SERVER ACTION] Artisan onboarding profile saved to Firestore for user ${validation.data.userId}:`, validation.data);
    return { success: true, data: validation.data as ArtisanProfile };

  } catch (e: any) {
    console.error(`[SERVER ACTION UNEXPECTED ERROR] saveArtisanOnboardingProfile for user ${profileData.userId}:`, e);
    const errorPayload: Record<string, any> = { 
      _server_error: ["An unexpected error occurred on the server while saving the profile. Please try again later."] 
    };
    if (e instanceof Error && e.message) (errorPayload._server_error as string[]).push(e.message);
    else if (typeof e === 'string') (errorPayload._server_error as string[]).push(e);
    else (errorPayload._server_error as string[]).push("No specific error message available.");
    return { success: false, error: errorPayload };
  }
}

export async function checkClientProfileCompleteness(userId: string): Promise<{ complete: boolean; missingFields?: string[] }> {
  if (!userId) {
    console.warn("checkClientProfileCompleteness called without userId.");
    return { complete: false, missingFields: ['User ID missing'] };
  }
  try {
    if (!db || Object.keys(db).length === 0) {
      console.warn("Firestore not initialized during checkClientProfileCompleteness. Defaulting to incomplete.");
      return { complete: false, missingFields: ['N/A - DB Error'] };
    }
    const clientProfileRef = doc(db, 'clientProfiles', userId);
    const profileSnap = await getDoc(clientProfileRef);
    if (profileSnap.exists()) {
      const data = profileSnap.data() as ClientProfile;
      
      // Define required fields for a client to be considered "complete"
      const requiredFields: (keyof ClientProfile)[] = ['location', 'fullName', 'contactEmail'];
      const missing: string[] = [];
      
      requiredFields.forEach(field => {
        if (!data[field]) {
          missing.push(field);
        }
      });
      
      if (missing.length === 0 && data.profileSetupCompleted) {
        return { complete: true };
      }
      return { complete: false, missingFields: missing.length > 0 ? missing : ['profileSetupNotMarkedComplete'] };
    }
    return { complete: false, missingFields: ['profile not found'] }; 
  } catch (error) {
    console.error("Error checking client profile completeness:", error);
    return { complete: false, missingFields: ['N/A - Check Error'] };
  }
}
