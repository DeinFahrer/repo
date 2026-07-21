"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateBookingStatus } from "@/lib/actions/admin";
import { formatRappen } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { Booking, BookingStatus, User } from "@/generated/prisma/client";

type BookingWithUser = Booking & { user: User };

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Zahlung ausstehend",
  CONFIRMED: "Bestätigt",
  CANCELLED: "Storniert",
  COMPLETED: "Abgeschlossen",
};

const STATUS_OPTIONS: BookingStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

function statusVariant(status: BookingStatus) {
  if (status === "CONFIRMED" || status === "COMPLETED") return "secondary" as const;
  if (status === "CANCELLED") return "destructive" as const;
  return "outline" as const;
}

export function BookingsTable({ bookings }: { bookings: BookingWithUser[] }) {
  const [items, setItems] = useState(bookings);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (id: string, status: BookingStatus) => {
    const previous = items;
    setItems((cur) => cur.map((b) => (b.id === id ? { ...b, status } : b)));
    startTransition(async () => {
      const result = await updateBookingStatus(id, status);
      if (result.error) {
        setItems(previous);
        toast.error("Status konnte nicht geändert werden.");
      } else {
        toast.success("Status aktualisiert.");
      }
    });
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Es sind noch keine Buchungen vorhanden.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Datum</TableHead>
            <TableHead>Kunde</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Route</TableHead>
            <TableHead>Preis</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="whitespace-nowrap">
                {new Date(booking.date).toLocaleDateString("de-CH")}
                <br />
                <span className="text-muted-foreground">
                  {booking.startTime}
                </span>
              </TableCell>
              <TableCell>
                <div className="font-medium">{booking.user.name}</div>
                <div className="text-muted-foreground">
                  {booking.user.email}
                </div>
              </TableCell>
              <TableCell>
                {booking.serviceType === "CITY" ? (
                  <Badge variant="secondary">Stadt</Badge>
                ) : (
                  <Badge variant="secondary">Flughafen</Badge>
                )}
                {booking.needsCargoMode && (
                  <div className="mt-1">
                    <Badge variant="outline">Transporter</Badge>
                  </div>
                )}
              </TableCell>
              <TableCell className="max-w-[220px]">
                <div className="truncate">{booking.pickupAddress}</div>
                <div className="truncate text-muted-foreground">
                  → {booking.dropoffAddress}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatRappen(booking.priceRappen)}
              </TableCell>
              <TableCell>
                <Select
                  value={booking.status}
                  onValueChange={(v) =>
                    handleStatusChange(booking.id, v as BookingStatus)
                  }
                  disabled={isPending}
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue>
                      {(value: BookingStatus) => (
                        <Badge variant={statusVariant(value)}>
                          {STATUS_LABELS[value]}
                        </Badge>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
