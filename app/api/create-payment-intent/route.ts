// app/api/create-payment-intent/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';


export async function POST(request: NextRequest) {

   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); 


  try {
    const { amount, projectId} = await request.json();

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount < 500) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum donation is $5.' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent for embedded payment form
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        type: 'donation',
        organization: 'EmpowerDreamz',
        projectId: projectId || 'drops-of-hope',
      },
    });

    // IMPORTANT: Return clientSecret, not url
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);

    // Better error logging
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
      });
      return NextResponse.json(
        { error: error.message || 'Payment setup failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}