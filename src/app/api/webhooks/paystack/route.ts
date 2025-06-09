import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments';
import { updateServiceRequest } from '@/lib/firestore';
import { createNotification } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature (implement this based on Paystack docs)
    // const isValid = verifyPaystackSignature(body, signature);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    // }

    const { event, data } = body;

    switch (event) {
      case 'charge.success':
        await handleSuccessfulPayment(data);
        break;
      
      case 'transfer.success':
        await handleSuccessfulTransfer(data);
        break;
      
      case 'transfer.failed':
        await handleFailedTransfer(data);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSuccessfulPayment(data: any) {
  const { reference, metadata } = data;
  const { serviceRequestId, clientId, artisanId } = metadata;

  try {
    // Create escrow transaction
    const transactionId = await paymentService.createEscrowFromPayment(
      data,
      serviceRequestId,
      clientId,
      artisanId
    );

    // Update service request status
    await updateServiceRequest(serviceRequestId, {
      status: 'in_progress',
    });

    // Create notifications
    await createNotification({
      userId: artisanId,
      type: 'payment_received',
      icon: 'DollarSign',
      title: 'Payment Received',
      description: 'The client has funded the escrow. You can now start working on the project.',
      read: false,
      link: `/dashboard/services/requests/${serviceRequestId}`,
    });

    await createNotification({
      userId: clientId,
      type: 'payment_received',
      icon: 'DollarSign',
      title: 'Payment Confirmed',
      description: 'Your payment has been secured in escrow. The artisan can now begin work.',
      read: false,
      link: `/dashboard/services/requests/${serviceRequestId}`,
    });

    console.log(`Payment processed successfully for service request: ${serviceRequestId}`);
  } catch (error) {
    console.error('Error processing successful payment:', error);
  }
}

async function handleSuccessfulTransfer(data: any) {
  // Handle successful transfer to artisan
  console.log('Transfer successful:', data);
}

async function handleFailedTransfer(data: any) {
  // Handle failed transfer to artisan
  console.log('Transfer failed:', data);
}