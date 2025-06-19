
'use server';

import { updateServiceRequest } from '@/lib/firestore';
// import type { ServiceRequest } from '@/types'; // Not directly used here
import { revalidatePath } from 'next/cache';

export async function handleCancelRequestServerAction(requestId: string) {
    console.log("[Server Action] Cancelling request (live):", requestId);
    try {
        await updateServiceRequest(requestId, { status: 'cancelled' });
        revalidatePath(`/dashboard/services/requests/${requestId}`);
        revalidatePath('/dashboard/services/my-requests');
        revalidatePath('/dashboard/jobs'); // For artisans browsing jobs
        return { success: true, message: "Request cancelled successfully." };
    } catch (error: any) {
        console.error("Error cancelling request:", error);
        return { success: false, message: error.message || "Failed to cancel request." };
    }
}

export async function handleMarkJobAsCompleteArtisanServerAction(requestId: string, artisanId: string) {
    console.log(`[Server Action] Artisan ${artisanId} marking job ${requestId} as complete (live).`);
    try {
        // Update status to 'completed' or 'pending_client_approval'
        // For simplicity, using 'completed'. A two-step approval is also common.
        await updateServiceRequest(requestId, { status: 'completed' }); 
        revalidatePath(`/dashboard/services/requests/${requestId}`);
        revalidatePath('/dashboard/services/my-offers');
        // TODO: Create notification for client
        return { success: true, message: "Job marked as complete. Client will be notified." };
    } catch (error: any) {
        console.error("Error marking job as complete by artisan:", error);
        return { success: false, message: error.message || "Failed to mark job as complete." };
    }
}

export async function handleClientConfirmCompleteAndReleaseFundsServerAction(requestId: string, clientId: string) {
    console.log(`[Server Action] Client ${clientId} marking job ${requestId} as complete & releasing funds (live).`);
    try {
        // First, ensure the job status reflects client confirmation.
        await updateServiceRequest(requestId, { status: 'completed' });
        
        // TODO: Trigger payment release logic here (e.g., via Paystack)
        // This would involve getting the escrow transaction ID for this service request
        // and then calling a payment service method.
        // For now, this part is simulated.
        console.log(`[Server Action Simulated] Funds release process for request ${requestId} initiated.`);

        revalidatePath(`/dashboard/services/requests/${requestId}`);
        revalidatePath('/dashboard/services/my-requests');
        revalidatePath('/dashboard/payments/history');
        // TODO: Create notifications for both client and artisan.
        return { success: true, message: "Job marked complete. Funds released to artisan (simulated)." };
    } catch (error: any) {
        console.error("Error confirming job completion by client:", error);
        return { success: false, message: error.message || "Failed to confirm job completion." };
    }
}

export async function handleFundEscrowServerAction(requestId: string, amount: number, clientEmail: string | undefined, serviceTitle: string) {
  if (!clientEmail || amount <= 0) {
    console.error("[Server Action] Fund Escrow Error (live): Missing details for payment.");
    return { success: false, message: "Error: Missing necessary details for payment." };
  }
  console.log(`[Server Action] Initiating NGN ${amount.toLocaleString()} payment for service request '${serviceTitle}' (ID: '${requestId}') for client ${clientEmail} (live).`);
  
  // After successful Paystack payment (usually via webhook), update service request.
  // For now, this action simulates the Paystack part and prepares a redirect.
  // The actual `updateServiceRequest(requestId, { status: 'in_progress', escrowFunded: true });` 
  // should happen in the Paystack webhook handler or payment callback.
  // Revalidation of paths should also occur there.

  return { 
    success: true, 
    message: `Mock Paystack: Payment for '${serviceTitle}' initiated. Redirecting...`, 
    // This redirectUrl would typically come from Paystack and include transaction reference
    redirectUrl: `/dashboard/payments/escrow?transactionId=live_mock_txn_${requestId}_${Date.now()}&status=funded&amount=${amount}&serviceRequestId=${requestId}` 
  };
}
