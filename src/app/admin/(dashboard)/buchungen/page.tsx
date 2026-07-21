import { getAllBookings } from "@/lib/actions/admin";
import { BookingsTable } from "@/components/admin/bookings-table";

export default async function AdminBookingsPage() {
  const bookings = await getAllBookings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Buchungen</h1>
        <p className="text-sm text-muted-foreground">
          Alle Buchungen im Überblick. Status ändert sich sofort für den
          Kunden sichtbar.
        </p>
      </div>
      <BookingsTable bookings={bookings} />
    </div>
  );
}
