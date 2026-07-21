import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatRappen } from "@/lib/format";
import { LogoutButton } from "@/components/auth/logout-button";
import { getMyBookings } from "@/lib/actions/booking";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect({ href: "/konto/anmelden", locale });
    return;
  }

  const t = await getTranslations("Account");
  const bookings = await getMyBookings();

  const statusKey = {
    PENDING_PAYMENT: "statusPendingPayment",
    CONFIRMED: "statusConfirmed",
    CANCELLED: "statusCancelled",
    COMPLETED: "statusCompleted",
  } as const;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {t("welcome", { name: session.user.name ?? "" })}
        </h1>
        <LogoutButton>{t("logout")}</LogoutButton>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 font-medium">{t("myBookings")}</h2>

        {bookings.length === 0 ? (
          <p className="mb-4 text-sm text-muted-foreground">
            {t("noBookings")}
          </p>
        ) : (
          <div className="mb-4 flex flex-col gap-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-lg border border-border p-3 text-sm"
              >
                <Link
                  href={`/buchung/${booking.id}`}
                  className="flex items-center justify-between transition-colors hover:text-primary"
                >
                  <div>
                    <p className="font-medium">
                      {booking.serviceType === "CITY"
                        ? t("serviceCity")
                        : t("serviceAirport")}
                    </p>
                    <p className="text-muted-foreground">
                      {booking.date.toLocaleDateString(locale)} · {booking.startTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatRappen(booking.priceRappen, locale)}
                    </p>
                    <Badge variant="secondary">
                      {t(statusKey[booking.status])}
                    </Badge>
                  </div>
                </Link>
                {booking.status === "COMPLETED" && (
                  <div className="mt-2 border-t border-border pt-2">
                    {booking.review ? (
                      <p className="text-xs text-muted-foreground">
                        {t("reviewSubmitted")}
                      </p>
                    ) : (
                      <Link
                        href={`/buchung/${booking.id}/bewerten`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {t("leaveReview")}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/buchen/stadt" className={cn(buttonVariants())}>
            {t("bookCity")}
          </Link>
          <Link
            href="/buchen/flughafen"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {t("bookAirport")}
          </Link>
        </div>
      </div>
    </div>
  );
}
