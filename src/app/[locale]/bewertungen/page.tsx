import { setRequestLocale, getTranslations } from "next-intl/server";
import { Star } from "lucide-react";
import { getApprovedReviews } from "@/lib/actions/review";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function displayName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Reviews");
  const serviceT = await getTranslations("Account");
  const reviews = await getApprovedReviews();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold">{t("pageTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("pageSubtitle")}</p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < review.rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                  <Badge variant="secondary">
                    {review.booking.serviceType === "CITY"
                      ? serviceT("serviceCity")
                      : serviceT("serviceAirport")}
                  </Badge>
                </div>
                <p className="text-sm">{review.comment}</p>
                <p className="text-sm font-medium text-muted-foreground">
                  {displayName(review.user.name)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
