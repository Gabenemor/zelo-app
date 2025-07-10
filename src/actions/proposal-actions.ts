
'use server';

import { getProposals, updateProposal, createProposal, updateServiceRequest } from '@/lib/firestore';
import type { ArtisanProposal, ServiceRequest } from '@/types';
import { revalidatePath } from 'next/cache';

// This server action is no longer needed as the form can call the firestore function directly.
// Keeping the file but removing the submitArtisanProposal function to avoid confusion.

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

export async function acceptArtisanProposal(proposalId: string, serviceRequestId: string, artisanId: string, artisanName: string): Promise<{success: boolean, error?: string}> {
    try {
        await updateProposal(proposalId, { status: 'accepted' });
        await updateServiceRequest(serviceRequestId, { status: 'awarded', assignedArtisanId: artisanId, assignedArtisanName: artisanName });
        
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
