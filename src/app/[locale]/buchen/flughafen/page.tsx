import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getPricing } from "@/lib/actions/booking";
import { AirportBookingForm } from "@/components/booking/airport-booking-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function AirportBookingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Booking");
  const session = await auth();
  const pricing = await getPricing();

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>{t("airportTitle")}</CardTitle>
          <CardDescription>{t("airportSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <AirportBookingForm
            isLoggedIn={!!session?.user}
            fixedPriceRappen={pricing.airportFixedPriceRappen}
          />
        </CardContent>
      </Card>
    </div>
  );
}
