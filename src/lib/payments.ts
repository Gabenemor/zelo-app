import { createEscrowTransaction, updateEscrowTransaction } from './firestore';
import type { EscrowTransaction } from '@/types';

// Paystack integration for Nigerian payments
export class PaymentService {
  private paystackPublicKey: string;
  private paystackSecretKey: string;

  constructor() {
    this.paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';
  }

  async initializePayment(
    email: string,
    amount: number, // Amount in kobo (Nigerian currency)
    serviceRequestId: string,
    clientId: string,
    artisanId: string
  ): Promise<{ authorization_url: string; access_code: string; reference: string }> {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo
        reference: `zelo_${serviceRequestId}_${Date.now()}`,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/callback`,
        metadata: {
          serviceRequestId,
          clientId,
          artisanId,
          custom_fields: [
            {
              display_name: "Service Request ID",
              variable_name: "service_request_id",
              value: serviceRequestId
            }
          ]
        }
      }),
    });

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || 'Payment initialization failed');
    }

    return data.data;
  }

  async verifyPayment(reference: string): Promise<any> {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${this.paystackSecretKey}`,
      },
    });

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || 'Payment verification failed');
    }

    return data.data;
  }

  async createEscrowFromPayment(
    paymentData: any,
    serviceRequestId: string,
    clientId: string,
    artisanId: string
  ): Promise<string> {
    const platformFeePercentage = 0.10; // 10%
    const amount = paymentData.amount / 100; // Convert from kobo to naira
    const platformFee = amount * platformFeePercentage;

    const transactionData: Omit<EscrowTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
      serviceRequestId,
      clientId,
      artisanId,
      amount,
      platformFee,
      status: 'funded',
    };

    return await createEscrowTransaction(transactionData);
  }

  async releasePaymentToArtisan(transactionId: string): Promise<void> {
    // In a real implementation, this would:
    // 1. Update the escrow transaction status
    // 2. Initiate a transfer to the artisan's bank account via Paystack Transfer API
    // 3. Handle any transfer failures

    await updateEscrowTransaction(transactionId, {
      status: 'released_to_artisan',
    });

    // TODO: Implement actual bank transfer using Paystack Transfer API
    console.log(`Payment released for transaction: ${transactionId}`);
  }

  async refundPaymentToClient(transactionId: string): Promise<void> {
    // In a real implementation, this would:
    // 1. Update the escrow transaction status
    // 2. Initiate a refund via Paystack Refund API

    await updateEscrowTransaction(transactionId, {
      status: 'refunded_to_client',
    });

    // TODO: Implement actual refund using Paystack Refund API
    console.log(`Payment refunded for transaction: ${transactionId}`);
  }

  async verifyBankAccount(accountNumber: string, bankCode: string): Promise<any> {
    const response = await fetch('https://api.paystack.co/bank/resolve', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.paystackSecretKey}`,
      },
    });

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || 'Bank account verification failed');
    }

    return data.data;
  }

  async getBanks(): Promise<any[]> {
    const response = await fetch('https://api.paystack.co/bank', {
      headers: {
        'Authorization': `Bearer ${this.paystackSecretKey}`,
      },
    });

    const data = await response.json();
    
    if (!data.status) {
      throw new Error(data.message || 'Failed to fetch banks');
    }

    return data.data;
  }
}

export const paymentService = new PaymentService();