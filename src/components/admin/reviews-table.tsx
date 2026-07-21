"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { setReviewApproval } from "@/lib/actions/admin";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import type { Review, User, Booking } from "@/generated/prisma/client";

type ReviewWithRelations = Review & { user: User; booking: Booking };

export function ReviewsTable({
  reviews,
}: {
  reviews: ReviewWithRelations[];
}) {
  const [items, setItems] = useState(reviews);

  const handleToggle = async (id: string, approved: boolean) => {
    const previous = items;
    setItems((cur) =>
      cur.map((r) => (r.id === id ? { ...r, approved } : r)),
    );
    const result = await setReviewApproval(id, approved);
    if (result.error) {
      setItems(previous);
      toast.error("Konnte nicht gespeichert werden.");
    } else {
      toast.success(approved ? "Bewertung freigegeben." : "Freigabe entfernt.");
    }
  };

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Es sind noch keine Bewertungen vorhanden.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((review) => (
        <li
          key={review.id}
          className="flex flex-col gap-2 rounded-xl border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <div className="mb-1 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={
                      i < review.rating
                        ? "h-4 w-4 fill-primary text-primary"
                        : "h-4 w-4 text-muted-foreground"
                    }
                  />
                ))}
              </div>
              <span className="font-medium">{review.user.name}</span>
              <Badge variant="outline">
                {review.booking.serviceType === "CITY" ? "Stadt" : "Flughafen"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm text-muted-foreground">
              {review.approved ? "Sichtbar" : "Ausgeblendet"}
            </span>
            <Switch
              checked={review.approved}
              onCheckedChange={(checked) => handleToggle(review.id, checked)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
