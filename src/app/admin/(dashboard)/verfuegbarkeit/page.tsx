import { getAvailabilityBlocks } from "@/lib/actions/admin";
import { AvailabilityManager } from "@/components/admin/availability-manager";

export default async function AdminAvailabilityPage() {
  const blocks = await getAvailabilityBlocks();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Verfügbarkeit</h1>
        <p className="text-sm text-muted-foreground">
          Sperre einzelne Tage oder Zeitfenster — z.B. für Ferien. Kunden
          können für gesperrte Tage keine neue Buchung anfragen.
        </p>
      </div>
      <AvailabilityManager initialBlocks={blocks} />
    </div>
  );
}
