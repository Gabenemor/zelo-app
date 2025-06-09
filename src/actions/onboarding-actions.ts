
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
  // e.g., await db.collection('clientProfiles').doc(validation.data.userId).set({ servicesLookingFor: validation.data.servicesLookingFor }, { merge: true });
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
  // e.g., await db.collection('clientProfiles').doc(validation.data.userId).set({ location: validation.data.location, username: validation.data.username, profileSetupCompleted: true }, { merge: true });
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
  // e.g., await db.collection('artisanProfiles').doc(validation.data.userId).set({ servicesOfferedOnboarding: validation.data.servicesOffered }, { merge: true });
  return { success: true, data: validation.data };
}

// Using a simplified schema for artisan profile for onboarding step 2
// The full ArtisanProfileForm has its own more complex schema
const ArtisanOnboardingProfileSchema = z.object({
  userId: z.string(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email(),
  servicesOffered: z.array(z.string()).min(1),
  location: z.string().min(1),
  bio: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters.").optional(),
  // Add other fields from ArtisanProfileFormValues as needed for the specific save action
});

export async function saveArtisanOnboardingProfile(profileData: Partial<ArtisanProfile> & { username?: string }) {
  const dataToValidate = {
    userId: MOCK_USER_ID,
    contactEmail: profileData.contactEmail,
    servicesOffered: profileData.servicesOffered,
    location: profileData.location,
    contactPhone: profileData.contactPhone,
    bio: profileData.bio,
    username: profileData.username,
  };

  const validation = ArtisanOnboardingProfileSchema.safeParse(dataToValidate);

  if (!validation.success) {
    console.error("Artisan onboarding profile validation error:", validation.error.flatten());
    return { success: false, error: validation.error.flatten().fieldErrors };
  }

  console.log('[SERVER ACTION] Saving artisan onboarding profile (step 2):', validation.data);
  // TODO: Implement actual database write using all fields from ArtisanProfileForm
  // This would likely update or create the full artisan profile document.
  // e.g., await db.collection('artisanProfiles').doc(validation.data.userId).set({ ...profileData, profileSetupCompleted: true }, { merge: true });
  return { success: true, data: validation.data };
}

// --- Mock function to check profile completeness ---
// In a real app, this would fetch from DB based on current user ID
export async function checkClientProfileCompleteness(userId: string): Promise<{ complete: boolean; missingFields?: string[] }> {
  console.log('[SERVER ACTION] Checking client profile completeness for userId (mock):', userId);
  // Mock logic: Fetch user's clientProfile from DB
  // For demo, assume it's incomplete if certain fields are missing
  // const clientProfile = await db.collection('clientProfiles').doc(userId).get();
  // if (!clientProfile.exists || !clientProfile.data()?.location || !clientProfile.data()?.username) {
  //   return { complete: false, missingFields: ['location', 'username'] };
  // }
  // This is a mock, returning false to trigger the UI prompt
  return { complete: false, missingFields: ['location', 'username'] }; 
}
