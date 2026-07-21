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

export async function createCheckoutSession(bookingId: string) {
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
    automatic_payment_methods: { enabled: true },
    success_url: `${origin}/buchung/${booking.id}?checkout=success`,
    cancel_url: `${origin}/buchung/${booking.id}?checkout=cancelled`,
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
