
'use server';

// Note: These are still MOCK actions. In a real app, they would interact with Firestore,
// payment gateways, and notification services.
// For now, they just log and return a simulated success/failure.

export async function handleCancelRequestServerAction(requestId: string) {
    console.log("[Server Action] Cancelling request:", requestId);
    // Simulate DB update: updateServiceRequest(requestId, { status: 'cancelled' });
    // Simulate notification: createNotification({ ... });
    return { success: true, message: "Request cancelled successfully (mock)." };
}

export async function handleMarkJobAsCompleteArtisanServerAction(requestId: string, artisanId: string) {
    console.log(`[Server Action] Artisan ${artisanId} marking job ${requestId} as complete.`);
    // Simulate DB update: updateServiceRequest(requestId, { status: 'completed_by_artisan' }); // Or 'pending_client_approval'
    // Simulate notification: createNotification({ userId: clientForRequestId, ... });
    return { success: true, message: "Job marked as complete. Client notified (mock)." };
}

export async function handleClientConfirmCompleteAndReleaseFundsServerAction(requestId: string, clientId: string) {
    console.log(`[Server Action] Client ${clientId} marking job ${requestId} as complete & releasing funds.`);
    // Simulate DB update: updateServiceRequest(requestId, { status: 'completed' });
    // Simulate payment release: paymentService.releasePaymentToArtisan(escrowTransactionId);
    // Simulate notifications to both client and artisan.
    return { success: true, message: "Job marked complete. Funds released to artisan (mock)." };
}

export async function handleFundEscrowServerAction(requestId: string, amount: number, clientEmail: string | undefined, serviceTitle: string) {
  if (!clientEmail || amount <= 0) {
    console.error("[Server Action] Fund Escrow Error: Missing proposal or client email for payment.");
    return { success: false, message: "Error: Missing necessary details for payment." };
  }
  console.log(`[Server Action] Mock initiating NGN ${amount.toLocaleString()} payment for service request '${serviceTitle}' (ID: '${requestId}') for client ${clientEmail}.`);
  // In a real app, this would call paymentService.initializePayment(...)
  // and then redirect to paymentData.authorization_url or handle errors.
  // For mock, simulate success and a redirect path.
  return { 
    success: true, 
    message: `Mock: Payment for '${serviceTitle}' initiated.`, 
    // This redirectUrl would typically come from the payment gateway
    redirectUrl: `/dashboard/payments/escrow?transactionId=mock_txn_${requestId}_${Date.now()}&status=funded&amount=${amount}` 
  };
}
