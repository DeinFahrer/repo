import { setRequestLocale, getTranslations } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal");

  const sections = [
    { title: t("privacyDataTitle"), body: t("privacyDataBody") },
    { title: t("privacyPurposeTitle"), body: t("privacyPurposeBody") },
    { title: t("privacyRightsTitle"), body: t("privacyRightsBody") },
    { title: t("privacyContactTitle"), body: t("privacyContactBody") },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">{t("privacyTitle")}</h1>
      <p className="mb-6 rounded-lg bg-secondary/60 p-3 text-sm text-muted-foreground">
        {t("placeholderNotice")}
      </p>
      <p className="mb-6 text-sm text-muted-foreground">{t("privacyIntro")}</p>
      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="mb-1 font-medium">{section.title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
