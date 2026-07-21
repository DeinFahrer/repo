"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  cityBookingSchema,
  airportBookingSchema,
} from "@/lib/validation/booking";

const DEFAULT_CITY_HOURLY_RAPPEN = 8000;
const DEFAULT_AIRPORT_FIXED_RAPPEN = 12000;
const MIN_LEAD_MS = 24 * 60 * 60 * 1000;
const AIRPORT_LABEL = "Flughafen Zürich (ZRH)";

export async function getPricing() {
  const existing = await prisma.pricingSettings.findFirst();
  if (existing) return existing;
  return prisma.pricingSettings.create({
    data: {
      cityHourlyRateRappen: DEFAULT_CITY_HOURLY_RAPPEN,
      airportFixedPriceRappen: DEFAULT_AIRPORT_FIXED_RAPPEN,
    },
  });
}

function combineDateTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

async function hasBlockingConflict(date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);
  const block = await prisma.availabilityBlock.findFirst({
    where: { date: { gte: dayStart, lte: dayEnd } },
  });
  return !!block;
}

export async function createCityBooking(input: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Bitte melde dich zuerst an." };
  }

  const parsed = cityBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }
  const data = parsed.data;

  const pickupDateTime = combineDateTime(data.date, data.startTime);
  const day = pickupDateTime.getDay();
  if (day !== 0 && day !== 6) {
    return { error: "Stadtfahrten sind nur am Wochenende (Sa/So) buchbar." };
  }
  if (pickupDateTime.getTime() - Date.now() < MIN_LEAD_MS) {
    return { error: "Bitte mindestens 24 Stunden im Voraus buchen." };
  }
  if (await hasBlockingConflict(pickupDateTime)) {
    return { error: "An diesem Tag sind leider keine Fahrten verfügbar." };
  }

  const pricing = await getPricing();
  const priceRappen = pricing.cityHourlyRateRappen * data.durationHours;

  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      serviceType: "CITY",
      date: pickupDateTime,
      startTime: data.startTime,
      durationHours: data.durationHours,
      pickupAddress: data.pickupAddress,
      dropoffAddress: data.dropoffAddress,
      passengerCount: data.passengerCount,
      needsCargoMode: data.needsCargoMode,
      notes: data.notes || null,
      priceRappen,
    },
  });

  return { success: true as const, bookingId: booking.id };
}

export async function createAirportBooking(input: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Bitte melde dich zuerst an." };
  }

  const parsed = airportBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }
  const data = parsed.data;

  const pickupDateTime = combineDateTime(data.date, data.startTime);
  const [hours] = data.startTime.split(":").map(Number);
  if (hours < 17) {
    return { error: "Flughafentransfers sind erst ab 17:00 Uhr buchbar." };
  }
  if (pickupDateTime.getTime() - Date.now() < MIN_LEAD_MS) {
    return { error: "Bitte mindestens 24 Stunden im Voraus buchen." };
  }
  if (await hasBlockingConflict(pickupDateTime)) {
    return { error: "Zu diesem Zeitpunkt sind leider keine Fahrten verfügbar." };
  }

  const pricing = await getPricing();
  const priceRappen = pricing.airportFixedPriceRappen;

  const pickupAddress =
    data.direction === "TO_AIRPORT" ? data.address : AIRPORT_LABEL;
  const dropoffAddress =
    data.direction === "TO_AIRPORT" ? AIRPORT_LABEL : data.address;
  const notes =
    [
      data.flightNumber ? `Flugnummer: ${data.flightNumber}` : null,
      data.notes || null,
    ]
      .filter(Boolean)
      .join(" — ") || null;

  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      serviceType: "AIRPORT",
      date: pickupDateTime,
      startTime: data.startTime,
      direction: data.direction,
      pickupAddress,
      dropoffAddress,
      passengerCount: data.passengerCount,
      needsCargoMode: data.needsCargoMode,
      notes,
      priceRappen,
    },
  });

  return { success: true as const, bookingId: booking.id };
}

export async function getBookingForUser(bookingId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking || booking.userId !== session.user.id) return null;
  return booking;
}

export async function getMyBookings() {
  const session = await auth();
  if (!session?.user) return [];

  return prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });
}
