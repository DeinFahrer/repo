import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ShieldCheck, Users, Tag, ArrowRight, Plane, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const hero = await getTranslations("Hero");
  const services = await getTranslations("Services");
  const trust = await getTranslations("Trust");

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-accent/40 via-background to-background" />
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:py-28">
          <Badge className="bg-primary/10 text-primary" variant="secondary">
            Bern · Zürich Flughafen
          </Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {hero("title")}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-balance">
            {hero("subtitle")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/buchen/stadt"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              {hero("ctaCity")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/buchen/flughafen"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              {hero("ctaAirport")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-12 md:grid-cols-2">
        <Card className="border-border/80 [--card-spacing:--spacing(7)] shadow-sm transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <MapPin className="h-7 w-7" />
              </span>
              <Badge variant="secondary">{services("cityBadge")}</Badge>
            </div>
            <CardTitle className="text-2xl">{services("cityTitle")}</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {services("cityDescription")}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/buchen/stadt"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg", className: "w-full" }),
              )}
            >
              {services("learnMore")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-border/80 [--card-spacing:--spacing(7)] shadow-sm transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Plane className="h-7 w-7" />
              </span>
              <Badge variant="secondary">{services("airportBadge")}</Badge>
            </div>
            <CardTitle className="text-2xl">{services("airportTitle")}</CardTitle>
            <CardDescription className="text-base leading-relaxed">
              {services("airportDescription")}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/buchen/flughafen"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg", className: "w-full" }),
              )}
            >
              {services("learnMore")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardFooter>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          {trust("title")}
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center text-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h3 className="font-medium">{trust("licensedTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {trust("licensedText")}
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Users className="h-6 w-6" />
            </span>
            <h3 className="font-medium">{trust("vehicleTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {trust("vehicleText")}
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Tag className="h-6 w-6" />
            </span>
            <h3 className="font-medium">{trust("priceTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {trust("priceText")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
