// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export async function POST(request: NextRequest) {
  const body = await request.text();
  
  // Get signature from request headers directly
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('❌ No signature found in request');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log(`📨 Webhook received: ${event.type}`);
  } catch (err) {
    const error = err as Error;
    console.error(`❌ Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  // Handle successful payment (INCOME)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    const amountInDollars = paymentIntent.amount / 100;
    
    try {
      // Get the active project
      const projectsRef = db.collection('projects');
      const snapshot = await projectsRef.where('isActive', '==', true).limit(1).get();
      
      if (!snapshot.empty) {
        const projectDoc = snapshot.docs[0];
        const projectData = projectDoc.data();
        
        // Update raised amount and supporter count
        await projectDoc.ref.update({
          raised: (projectData.raised || 0) + amountInDollars,
          supporters: (projectData.supporters || 0) + 1,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Store individual donation record (shows as INCOME on ledger)
        const donationRef = await db.collection('donations').add({
          projectId: projectDoc.id,
          amount: amountInDollars,
          paymentIntentId: paymentIntent.id,
          donorEmail: paymentIntent.receipt_email || 'anonymous',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`✅ INCOME: Donation of $${amountInDollars} saved with ID: ${donationRef.id}`);
      } else {
        console.warn('⚠️ No active project found for donation');
      }
    } catch (error) {
      console.error('❌ Error updating Firestore:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  // Handle payout to bank account (EXPENSE - money leaving Stripe)
  if (event.type === 'payout.paid') {
    const payout = event.data.object as Stripe.Payout;
    
    const amountInDollars = payout.amount / 100;
    
    console.log(`💸 Processing payout: $${amountInDollars} to ${payout.destination || 'default bank'}`);
    
    try {
      // Record this as an EXPENSE since money is leaving Stripe
      const expenseData = {
        category: 'bank-transfer',
        description: `Payout to bank account (${payout.destination || 'default bank'})`,
        amount: amountInDollars,
        project: 'General',
        payoutId: payout.id,
        arrivalDate: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null,
        bankAccount: payout.destination || 'default',
        status: payout.status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const expenseRef = await db.collection('expenses').add(expenseData);

      console.log(`✅ EXPENSE: Payout of $${amountInDollars} saved with ID: ${expenseRef.id}`);
      console.log(`📋 Expense data:`, JSON.stringify(expenseData, null, 2));
    } catch (error) {
      console.error('❌ Error recording payout:', error);
      console.error('Error details:', error);
      return NextResponse.json({ error: 'Payout recording failed' }, { status: 500 });
    }
  }

  // Handle refunds (EXPENSE - money going back to donor)
  if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    
    // Get the refund amount (could be partial refund)
    const refund = charge.refunds?.data[0];
    const amountInDollars = refund ? refund.amount / 100 : charge.amount_refunded / 100;
    
    console.log(`🔄 Processing refund: $${amountInDollars}`);
    
    try {
      // Record this as an EXPENSE since money is leaving
      const expenseRef = await db.collection('expenses').add({
        category: 'refund',
        description: `Refund to ${charge.billing_details?.email || 'donor'} - ${refund?.reason || 'requested_by_customer'}`,
        amount: amountInDollars,
        project: 'General',
        chargeId: charge.id,
        refundId: refund?.id,
        refundReason: refund?.reason || 'requested_by_customer',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ EXPENSE: Refund of $${amountInDollars} saved with ID: ${expenseRef.id}`);

      // Also reduce the raised amount from the project if we can identify it
      // Try to find the original donation
      const donationsRef = db.collection('donations');
      const donationSnapshot = await donationsRef
        .where('paymentIntentId', '==', charge.payment_intent)
        .limit(1)
        .get();

      if (!donationSnapshot.empty) {
        const donationDoc = donationSnapshot.docs[0];
        const donationData = donationDoc.data();
        
        // Update the project to reduce raised amount
        const projectRef = db.collection('projects').doc(donationData.projectId);
        const projectDoc = await projectRef.get();
        
        if (projectDoc.exists) {
          const projectData = projectDoc.data();
          await projectRef.update({
            raised: Math.max(0, (projectData?.raised || 0) - amountInDollars),
            supporters: Math.max(0, (projectData?.supporters || 1) - 1),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`✅ Project updated after refund`);
        }
      }
    } catch (error) {
      console.error('❌ Error recording refund:', error);
      return NextResponse.json({ error: 'Refund recording failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}