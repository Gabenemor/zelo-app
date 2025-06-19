
'use server';

import { createProposal, getProposals, updateProposal } from '@/lib/firestore';
import type { ArtisanProposal, ServiceRequest } from '@/types';
import { revalidatePath } from 'next/cache';

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
  console.log('[ProposalAction] Received live proposal submission:', data);

  if (!data.serviceRequestId || !data.artisanId || !data.proposedAmount || !data.coverLetter) {
    return { success: false, error: "Missing required proposal fields." };
  }
  if (data.proposedAmount <= 0) {
    return { success: false, error: "Proposed amount must be positive." };
  }

  try {
    const proposalData: Omit<ArtisanProposal, 'id' | 'submittedAt'> = {
      serviceRequestId: data.serviceRequestId,
      artisanId: data.artisanId,
      artisanName: data.artisanName,
      artisanAvatarUrl: data.artisanAvatarUrl,
      proposedAmount: data.proposedAmount,
      coverLetter: data.coverLetter,
      portfolioFileNames: data.portfolioFileNames || [],
      status: 'pending', // Initial status
    };

    const proposalId = await createProposal(proposalData);
    
    const newProposal: ArtisanProposal = {
      ...proposalData,
      id: proposalId,
      // Firestore serverTimestamp will handle actual value, this is for immediate client-side feedback
      submittedAt: new Date(), 
    };
    
    console.log('[ProposalAction] Live proposal created with ID:', proposalId);
    revalidatePath(`/dashboard/services/requests/${data.serviceRequestId}`);
    revalidatePath('/dashboard/services/my-offers');
    return { success: true, proposal: newProposal };

  } catch (error: any) {
    console.error('[ProposalAction] Error submitting live proposal:', error);
    return { success: false, error: error.message || "Failed to submit proposal." };
  }
}

export async function getProposalsForRequest(serviceRequestId: string): Promise<ArtisanProposal[]> {
    console.log(`[ProposalAction] Fetching live proposals for request ID: ${serviceRequestId}`);
    try {
        return await getProposals({ serviceRequestId });
    } catch (error) {
        console.error(`Error fetching proposals for request ${serviceRequestId}:`, error);
        return [];
    }
}

export async function getProposalsByArtisan(artisanId: string): Promise<ArtisanProposal[]> {
    console.log(`[ProposalAction] Fetching live proposals by artisan ID: ${artisanId}`);
     try {
        return await getProposals({ artisanId });
    } catch (error) {
        console.error(`Error fetching proposals for artisan ${artisanId}:`, error);
        return [];
    }
}

// Need updateServiceRequest for the below action
// Import it properly. Assuming it's from a common place or defined in this scope.
// This function is a local helper if updateServiceRequest from firestore.ts is not directly used or needs adaptation.
async function updateServiceRequestHelper(requestId: string, updates: Partial<ServiceRequest>): Promise<void> {
  const { updateServiceRequest: firestoreUpdateServiceRequest } = await import('@/lib/firestore');
  await firestoreUpdateServiceRequest(requestId, updates);
}


export async function acceptArtisanProposal(proposalId: string, serviceRequestId: string, artisanId: string, artisanName: string): Promise<{success: boolean, error?: string}> {
    try {
        await updateProposal(proposalId, { status: 'accepted' });
        await updateServiceRequestHelper(serviceRequestId, { status: 'awarded', assignedArtisanId: artisanId, assignedArtisanName: artisanName });
        
        const otherProposals = await getProposals({serviceRequestId, status: 'pending'});
        for (const p of otherProposals) {
            if (p.id !== proposalId) {
                await updateProposal(p.id, {status: 'rejected'});
            }
        }
        revalidatePath(`/dashboard/services/requests/${serviceRequestId}`);
        revalidatePath('/dashboard/services/my-offers');
        revalidatePath('/dashboard/services/my-requests'); // Client's view also changes
        return { success: true };
    } catch (error: any) {
        console.error('Error accepting proposal:', error);
        return { success: false, error: error.message || "Failed to accept proposal." };
    }
}
