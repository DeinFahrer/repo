"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/lib/actions/payment";
import { Button } from "@/components/ui/button";

export function PayButton({ bookingId }: { bookingId: string }) {
  const t = useTranslations("BookingConfirmation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setError(null);
    setLoading(true);
    const result = await createCheckoutSession(bookingId);
    if (result.error || !result.url) {
      setLoading(false);
      setError(result.error ?? t("paymentError"));
      return;
    }
    window.location.href = result.url;
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={onClick} disabled={loading} className="w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? t("payProcessing") : t("payNow")}
      </Button>
    </div>
  );
}
