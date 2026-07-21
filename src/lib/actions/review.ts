"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation/review";

export async function getReviewableBooking(bookingId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });
  if (!booking || booking.userId !== session.user.id) return null;
  if (booking.status !== "COMPLETED") return null;
  if (booking.review) return null;

  return booking;
}

export async function createReview(bookingId: string, input: unknown) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Bitte melde dich zuerst an." };
  }

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { review: true },
  });
  if (!booking || booking.userId !== session.user.id) {
    return { error: "Buchung wurde nicht gefunden." };
  }
  if (booking.status !== "COMPLETED") {
    return { error: "Bewertungen sind erst nach der Fahrt möglich." };
  }
  if (booking.review) {
    return { error: "Du hast diese Fahrt bereits bewertet." };
  }

  await prisma.review.create({
    data: {
      bookingId: booking.id,
      userId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      approved: false,
    },
  });

  revalidatePath("/konto");
  return { success: true as const };
}

export async function getApprovedReviews() {
  return prisma.review.findMany({
    where: { approved: true },
    include: { user: true, booking: true },
    orderBy: { createdAt: "desc" },
  });
}
