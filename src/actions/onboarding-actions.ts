
'use server';

import { z } from 'zod';
import type { ArtisanProfile, ClientProfile } from '@/types';

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
  // avatarFile would be handled differently, e.g. uploaded to storage and URL saved
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

const ArtisanServicesSchema = z.object({
  userId: z.string(),
  servicesOffered: z.array(z.string()).min(1, "Select at least one service.").max(2, "You can select a maximum of 2 services during onboarding."),
});

export async function saveArtisanStep1Services(services: string[]) {
   const validation = ArtisanServicesSchema.safeParse({ userId: MOCK_USER_ID, servicesOffered: services });
  if (!validation.success) {
    return { success: false, error: validation.error.flatten().fieldErrors };
  }
  console.log('[SERVER ACTION] Saving artisan step 1 services:', validation.data);
  // TODO: Implement actual database write
  // e.g., await db.collection('artisanProfiles').doc(validation.data.userId).set({ servicesOffered: validation.data.servicesOffered, onboardingStep1Completed: true }, { merge: true });
  return { success: true, data: validation.data };
}

const ArtisanOnboardingProfileSchema = z.object({
  userId: z.string(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email(),
  // servicesOffered: z.array(z.string()).min(1), // Removed as it's handled in step 1
  location: z.string().min(1),
  bio: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters.").optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  serviceChargeAmount: z.number().positive().optional(),
  serviceChargeDescription: z.string().optional(),
  isLocationPublic: z.boolean().optional(),
});

// The ArtisanProfile type includes servicesOffered, but the form for step 2 won't submit it.
// The profileData passed here will be Partial<ArtisanProfile> from the form,
// which after our changes, won't include servicesOffered.
export async function saveArtisanOnboardingProfile(
  profileData: Omit<Partial<ArtisanProfile>, 'servicesOffered'> & { username?: string }
) {
  const dataToValidate = {
    userId: MOCK_USER_ID, // In a real app, derive from auth context
    contactEmail: profileData.contactEmail,
    // servicesOffered: profileData.servicesOffered, // This is no longer passed from step 2 form
    location: profileData.location,
    contactPhone: profileData.contactPhone,
    bio: profileData.bio,
    username: profileData.username,
    yearsOfExperience: profileData.yearsOfExperience,
    serviceChargeAmount: profileData.serviceChargeAmount,
    serviceChargeDescription: profileData.serviceChargeDescription,
    isLocationPublic: profileData.isLocationPublic,
  };

  const validation = ArtisanOnboardingProfileSchema.safeParse(dataToValidate);

  if (!validation.success) {
    console.error("Artisan onboarding profile validation error:", validation.error.flatten());
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  console.log('[SERVER ACTION] Saving artisan onboarding profile (step 2):', validation.data);
  // TODO: Implement actual database write using all fields from ArtisanProfile.
  // This would likely update the artisan profile document, adding these details and setting onboardingCompleted to true.
  // The servicesOffered would have been set in step 1.
  // e.g., await db.collection('artisanProfiles').doc(validation.data.userId).set({ ...validation.data, profileSetupCompleted: true, onboardingCompleted: true }, { merge: true });
  return { success: true, data: validation.data };
}

// --- Mock function to check profile completeness ---
// In a real app, this would fetch from DB based on current user ID
export async function checkClientProfileCompleteness(userId: string): Promise<{ complete: boolean; missingFields?: string[] }> {
  console.log('[SERVER ACTION] Checking client profile completeness for userId (mock):', userId);
  // Mock logic: Fetch user's clientProfile from DB
  // For demo, assume it's incomplete if certain fields are missing (e.g., location or username if they were part of onboarding)
  // const clientProfileDoc = await db.collection('clientProfiles').doc(userId).get();
  // if (!clientProfileDoc.exists) return { complete: false, missingFields: ['profile_does_not_exist'] };
  // const clientProfile = clientProfileDoc.data() as ClientProfile; // Cast to your type
  // if (!clientProfile.location || !clientProfile.username) { // Adjust based on your actual required fields
  //   const missing: string[] = [];
  //   if (!clientProfile.location) missing.push('location');
  //   if (!clientProfile.username) missing.push('username');
  //   return { complete: false, missingFields: missing };
  // }
  // This is a mock, returning false to trigger the UI prompt
  return { complete: false, missingFields: ['location', 'username'] }; 
}

    