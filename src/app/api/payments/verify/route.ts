import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    const paymentData = await paymentService.verifyPayment(reference);

    return NextResponse.json(paymentData);
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}