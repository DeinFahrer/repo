import { getPricingSettings } from "@/lib/actions/admin";
import { PricingForm } from "@/components/admin/pricing-form";

export default async function AdminPricingPage() {
  const pricing = await getPricingSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Preise</h1>
        <p className="text-sm text-muted-foreground">
          Änderungen gelten sofort für neue Buchungen.
        </p>
      </div>
      <PricingForm
        initialCityHourlyRappen={pricing.cityHourlyRateRappen}
        initialAirportFixedRappen={pricing.airportFixedPriceRappen}
      />
    </div>
  );
}
