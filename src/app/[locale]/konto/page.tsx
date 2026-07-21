import { setRequestLocale, getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect, Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-button";

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
  }

  const t = await getTranslations("Account");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {t("welcome", { name: session.user.name ?? "" })}
        </h1>
        <LogoutButton>{t("logout")}</LogoutButton>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-2 font-medium">{t("myBookings")}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{t("noBookings")}</p>
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
