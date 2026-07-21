import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>
          © {year} Dein Fahrer — {t("rights")}
        </p>
        <div className="flex items-center gap-4">
          <Link href="/impressum" className="hover:text-foreground">
            {t("imprint")}
          </Link>
          <Link href="/agb" className="hover:text-foreground">
            {t("terms")}
          </Link>
          <Link href="/datenschutz" className="hover:text-foreground">
            {t("privacy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
