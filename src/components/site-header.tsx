import { getTranslations } from "next-intl/server";
import { Menu, Car } from "lucide-react";
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function SiteHeader() {
  const t = await getTranslations("Nav");
  const session = await auth();

  const navItems = [
    { href: "/buchen/stadt", label: t("bookCity") },
    { href: "/buchen/flughafen", label: t("bookAirport") },
    { href: "/bewertungen", label: t("reviews") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Car className="h-5 w-5" />
          </span>
          <span className="text-lg">Dein Fahrer</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          {session?.user ? (
            <Link
              href="/konto"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              {t("account")}
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/konto/anmelden"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                {t("login")}
              </Link>
              <Link
                href="/konto/registrieren"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                {t("register")}
              </Link>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" />
              }
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menü</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navItems.map((item) => (
                <DropdownMenuItem
                  key={item.href}
                  render={<Link href={item.href} />}
                >
                  {item.label}
                </DropdownMenuItem>
              ))}
              {!session?.user && (
                <>
                  <DropdownMenuItem render={<Link href="/konto/anmelden" />}>
                    {t("login")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href="/konto/registrieren" />}
                  >
                    {t("register")}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
