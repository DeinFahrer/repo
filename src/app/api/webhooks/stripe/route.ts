import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const bookingId = checkoutSession.metadata?.bookingId;

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          stripePaymentIntentId:
            typeof checkoutSession.payment_intent === "string"
              ? checkoutSession.payment_intent
              : (checkoutSession.payment_intent?.id ?? null),
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
