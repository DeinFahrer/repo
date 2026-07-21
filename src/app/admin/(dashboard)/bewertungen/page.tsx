import { getAllReviews } from "@/lib/actions/admin";
import { ReviewsTable } from "@/components/admin/reviews-table";

export default async function AdminReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Bewertungen</h1>
        <p className="text-sm text-muted-foreground">
          Nur freigegebene Bewertungen erscheinen auf der öffentlichen
          Bewertungsseite.
        </p>
      </div>
      <ReviewsTable reviews={reviews} />
    </div>
  );
}
