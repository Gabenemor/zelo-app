import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const { email, amount, serviceRequestId, clientId, artisanId } = await request.json();

    if (!email || !amount || !serviceRequestId || !clientId || !artisanId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const paymentData = await paymentService.initializePayment(
      email,
      amount,
      serviceRequestId,
      clientId,
      artisanId
    );

    return NextResponse.json(paymentData);
  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}