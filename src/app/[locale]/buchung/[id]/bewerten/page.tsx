import { setRequestLocale, getTranslations } from "next-intl/server";
import { getReviewableBooking } from "@/lib/actions/review";
import { ReviewForm } from "@/components/booking/review-form";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Reviews");
  const booking = await getReviewableBooking(id);

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card>
        {booking ? (
          <>
            <CardHeader>
              <CardTitle>{t("formTitle")}</CardTitle>
              <CardDescription>{t("formSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewForm bookingId={booking.id} />
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{t("notAllowedTitle")}</CardTitle>
              <CardDescription>{t("notAllowedSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/konto" className={cn(buttonVariants({ className: "w-full" }))}>
                {t("backToAccount")}
              </Link>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
