
'use server';

import type { ArtisanProposal } from '@/types';

// Mock data store for proposals (replace with Firestore in real app)
const mockProposalsStore: ArtisanProposal[] = [];

interface SubmitArtisanProposalData {
  serviceRequestId: string;
  artisanId: string;
  artisanName: string; 
  artisanAvatarUrl?: string;
  proposedAmount: number;
  coverLetter: string;
  portfolioFileNames?: string[];
}

interface SubmitArtisanProposalResult {
  success: boolean;
  proposal?: ArtisanProposal;
  error?: string;
}

export async function submitArtisanProposal(
  data: SubmitArtisanProposalData
): Promise<SubmitArtisanProposalResult> {
  console.log('[ProposalAction] Received proposal submission:', data);

  // Basic validation (more robust validation would use Zod on the server action)
  if (!data.serviceRequestId || !data.artisanId || !data.proposedAmount || !data.coverLetter) {
    return { success: false, error: "Missing required proposal fields." };
  }
  if (data.proposedAmount <= 0) {
    return { success: false, error: "Proposed amount must be positive." };
  }

  // Simulate saving to a database
  try {
    const newProposal: ArtisanProposal = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      serviceRequestId: data.serviceRequestId,
      artisanId: data.artisanId,
      artisanName: data.artisanName, // Added from data
      artisanAvatarUrl: data.artisanAvatarUrl, // Added from data
      proposedAmount: data.proposedAmount,
      coverLetter: data.coverLetter,
      portfolioFileNames: data.portfolioFileNames || [],
      submittedAt: new Date(),
      status: 'pending', // Initial status
    };

    // Add to our mock store
    mockProposalsStore.push(newProposal);
    
    console.log('[ProposalAction] Mock proposal created and stored:', newProposal);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 750));

    return { success: true, proposal: newProposal };

  } catch (error: any) {
    console.error('[ProposalAction] Error simulating proposal submission:', error);
    return { success: false, error: error.message || "Failed to submit proposal." };
  }
}

// Mock function to get proposals for a specific service request
export async function getProposalsForRequest(serviceRequestId: string): Promise<ArtisanProposal[]> {
    console.log(`[ProposalAction] Mock fetching proposals for request ID: ${serviceRequestId}`);
    return mockProposalsStore.filter(p => p.serviceRequestId === serviceRequestId);
}

// Mock function to get proposals submitted by a specific artisan
export async function getProposalsByArtisan(artisanId: string): Promise<ArtisanProposal[]> {
    console.log(`[ProposalAction] Mock fetching proposals by artisan ID: ${artisanId}`);
    return mockProposalsStore.filter(p => p.artisanId === artisanId);
}

