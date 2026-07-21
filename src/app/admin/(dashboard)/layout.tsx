import Link from "next/link";
import { CalendarOff, ClipboardList, LogOut, Star, Tag } from "lucide-react";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";

const NAV_ITEMS = [
  { href: "/admin/buchungen", label: "Buchungen", icon: ClipboardList },
  { href: "/admin/verfuegbarkeit", label: "Verfügbarkeit", icon: CalendarOff },
  { href: "/admin/preise", label: "Preise", icon: Tag },
  { href: "/admin/bewertungen", label: "Bewertungen", icon: Star },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/admin" className="font-semibold">
            Dein Fahrer — Admin
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {session?.user?.name}
            </span>
            <LogoutButton>
              <LogOut className="h-4 w-4" />
            </LogoutButton>
          </div>
        </div>
        <nav className="flex items-center gap-4 overflow-x-auto border-t border-border px-4 py-2 text-sm font-medium md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
