"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function createCheckoutSession(bookingId: string, locale: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Bitte melde dich zuerst an." };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking || booking.userId !== session.user.id) {
    return { error: "Buchung wurde nicht gefunden." };
  }
  if (booking.status !== "PENDING_PAYMENT") {
    return { error: "Diese Buchung wartet nicht mehr auf eine Zahlung." };
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return {
      error:
        "Zahlungsanbieter noch nicht konfiguriert. Bitte wende dich an Dein Fahrer.",
    };
  }

  const origin = await getOrigin();
  const productName =
    booking.serviceType === "CITY"
      ? `Stadtfahrt Bern — ${booking.durationHours}h`
      : "Flughafentransfer Bern ↔ Zürich";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: session.user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "chf",
          unit_amount: booking.priceRappen,
          product_data: { name: productName },
        },
      },
    ],
    success_url: `${origin}/${locale}/buchung/${booking.id}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/${locale}/buchung/${booking.id}?checkout=cancelled`,
    metadata: { bookingId: booking.id },
  });

  if (!checkoutSession.url) {
    return { error: "Zahlung konnte nicht gestartet werden." };
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { stripeCheckoutSessionId: checkoutSession.id },
  });

  return { url: checkoutSession.url };
}

export async function confirmCheckoutSession(
  bookingId: string,
  sessionId: string,
) {
  const session = await auth();
  if (!session?.user) return;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking || booking.userId !== session.user.id) return;
  if (booking.status !== "PENDING_PAYMENT") return;
  if (booking.stripeCheckoutSessionId !== sessionId) return;

  const stripe = getStripeClient();
  if (!stripe) return;

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  if (checkoutSession.payment_status === "paid") {
    await prisma.booking.update({
      where: { id: booking.id },
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
