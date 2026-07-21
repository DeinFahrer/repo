import { setRequestLocale, getTranslations } from "next-intl/server";

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">{t("imprintTitle")}</h1>
      <p className="mb-6 rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
        {t("placeholderNotice")}
      </p>
      <p className="whitespace-pre-line text-sm leading-relaxed">
        {t("imprintBody")}
      </p>
    </div>
  );
}
