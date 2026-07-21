"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updatePricingSettings } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";

export function PricingForm({
  initialCityHourlyRappen,
  initialAirportFixedRappen,
}: {
  initialCityHourlyRappen: number;
  initialAirportFixedRappen: number;
}) {
  const [cityChf, setCityChf] = useState(
    (initialCityHourlyRappen / 100).toFixed(2),
  );
  const [airportChf, setAirportChf] = useState(
    (initialAirportFixedRappen / 100).toFixed(2),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await updatePricingSettings({
      cityHourlyRateRappen: Math.round(Number(cityChf) * 100),
      airportFixedPriceRappen: Math.round(Number(airportChf) * 100),
    });

    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast.success("Preise gespeichert.");
  };

  return (
    <form onSubmit={onSubmit} className="max-w-md">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="cityChf">
            Stundenpreis Stadtfahrt (CHF)
          </FieldLabel>
          <Input
            id="cityChf"
            type="number"
            step="0.05"
            min="0"
            value={cityChf}
            onChange={(e) => setCityChf(e.target.value)}
          />
          <FieldDescription>
            Wird mit der gebuchten Stundenzahl multipliziert.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="airportChf">
            Fixpreis Flughafentransfer (CHF)
          </FieldLabel>
          <Input
            id="airportChf"
            type="number"
            step="0.05"
            min="0"
            value={airportChf}
            onChange={(e) => setAirportChf(e.target.value)}
          />
          <FieldDescription>
            Gilt pro Fahrt, unabhängig von der Richtung.
          </FieldDescription>
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={submitting} className="w-fit">
          Speichern
        </Button>
      </FieldGroup>
    </form>
  );
}
