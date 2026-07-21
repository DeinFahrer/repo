import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { getBookingForUser } from "@/lib/actions/booking";
import { formatRappen } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("BookingConfirmation");
  const booking = await getBookingForUser(id);

  if (!booking) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("status")}</span>
            <Badge variant="secondary">{t("statusPending")}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("date")}</span>
            <span>{booking.date.toLocaleDateString(locale)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("time")}</span>
            <span>{booking.startTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("pickup")}</span>
            <span className="text-right">{booking.pickupAddress}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("dropoff")}</span>
            <span className="text-right">{booking.dropoffAddress}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("passengers")}</span>
            <span>{booking.passengerCount}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
            <span>{t("price")}</span>
            <span>{formatRappen(booking.priceRappen, locale)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/konto" className={cn(buttonVariants({ className: "w-full" }))}>
            {t("backToAccount")}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
