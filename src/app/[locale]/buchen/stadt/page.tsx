import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getPricing } from "@/lib/actions/booking";
import { CityBookingForm } from "@/components/booking/city-booking-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function CityBookingPage({
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
          <CardTitle>{t("cityTitle")}</CardTitle>
          <CardDescription>{t("citySubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <CityBookingForm
            isLoggedIn={!!session?.user}
            hourlyRateRappen={pricing.cityHourlyRateRappen}
          />
        </CardContent>
      </Card>
    </div>
  );
}
