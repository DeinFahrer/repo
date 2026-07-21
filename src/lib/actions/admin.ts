"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { BookingStatus } from "@/generated/prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Nicht autorisiert.");
  }
  return session;
}

export async function getAllBookings() {
  await requireAdmin();
  return prisma.booking.findMany({
    include: { user: true },
    orderBy: { date: "desc" },
  });
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
) {
  await requireAdmin();
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        cancelledAt: status === "CANCELLED" ? new Date() : null,
      },
    });
    revalidatePath("/admin/buchungen");
    return { success: true as const, error: undefined };
  } catch {
    return { success: false as const, error: "Status konnte nicht geändert werden." };
  }
}

export async function getPricingSettings() {
  await requireAdmin();
  const existing = await prisma.pricingSettings.findFirst();
  if (existing) return existing;
  return prisma.pricingSettings.create({
    data: { cityHourlyRateRappen: 8000, airportFixedPriceRappen: 12000 },
  });
}

export async function updatePricingSettings(input: {
  cityHourlyRateRappen: number;
  airportFixedPriceRappen: number;
}) {
  await requireAdmin();
  if (
    !Number.isFinite(input.cityHourlyRateRappen) ||
    input.cityHourlyRateRappen <= 0 ||
    !Number.isFinite(input.airportFixedPriceRappen) ||
    input.airportFixedPriceRappen <= 0
  ) {
    return { error: "Bitte gültige, positive Preise angeben." };
  }

  const existing = await prisma.pricingSettings.findFirst();
  if (existing) {
    await prisma.pricingSettings.update({
      where: { id: existing.id },
      data: input,
    });
  } else {
    await prisma.pricingSettings.create({ data: input });
  }
  revalidatePath("/admin/preise");
  return { success: true as const, error: undefined };
}

export async function getAvailabilityBlocks() {
  await requireAdmin();
  return prisma.availabilityBlock.findMany({ orderBy: { date: "asc" } });
}

export async function createAvailabilityBlock(input: {
  date: Date;
  startTime?: string;
  endTime?: string;
  reason?: string;
}) {
  await requireAdmin();
  try {
    await prisma.availabilityBlock.create({
      data: {
        date: input.date,
        startTime: input.startTime || null,
        endTime: input.endTime || null,
        reason: input.reason || null,
      },
    });
    revalidatePath("/admin/verfuegbarkeit");
    return { success: true as const, error: undefined };
  } catch {
    return { success: false as const, error: "Termin konnte nicht gesperrt werden." };
  }
}

export async function deleteAvailabilityBlock(id: string) {
  await requireAdmin();
  try {
    await prisma.availabilityBlock.delete({ where: { id } });
    revalidatePath("/admin/verfuegbarkeit");
    return { success: true as const, error: undefined };
  } catch {
    return { success: false as const, error: "Konnte nicht entfernt werden." };
  }
}

export async function getAllReviews() {
  await requireAdmin();
  return prisma.review.findMany({
    include: { user: true, booking: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function setReviewApproval(reviewId: string, approved: boolean) {
  await requireAdmin();
  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: { approved },
    });
    revalidatePath("/admin/bewertungen");
    return { success: true as const, error: undefined };
  } catch {
    return { success: false as const, error: "Konnte nicht gespeichert werden." };
  }
}
