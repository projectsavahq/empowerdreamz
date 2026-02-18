import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// This will read from .env.local

export async function POST(request: NextRequest) {

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // ✅ moved inside


  try {
    const { amount } = await request.json();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card',],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation',
              description: 'Support our cause',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}`, // Goes back to homepage when user clicks back
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}