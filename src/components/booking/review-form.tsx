"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";
import { createReview } from "@/lib/actions/review";
import { reviewSchema, type ReviewInput } from "@/lib/validation/review";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5"
        >
          <Star
            className={cn(
              "h-8 w-8 transition-colors",
              (hovered || value) >= star
                ? "fill-primary text-primary"
                : "text-muted-foreground",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const t = useTranslations("Reviews");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const onSubmit = async (data: ReviewInput) => {
    setServerError(null);
    setSubmitting(true);
    const result = await createReview(bookingId, data);
    if (result.error) {
      setSubmitting(false);
      setServerError(result.error);
      return;
    }
    toast.success(t("successTitle"), { description: t("successSubtitle") });
    router.push("/konto");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.rating}>
          <FieldLabel>{t("ratingLabel")}</FieldLabel>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <StarRatingInput value={field.value} onChange={field.onChange} />
            )}
          />
          <FieldError errors={[errors.rating]} />
        </Field>

        <Field data-invalid={!!errors.comment}>
          <FieldLabel htmlFor="comment">{t("commentLabel")}</FieldLabel>
          <Textarea
            id="comment"
            rows={4}
            placeholder={t("commentPlaceholder")}
            {...register("comment")}
          />
          <FieldError errors={[errors.comment]} />
        </Field>

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("submit")}
        </Button>
      </FieldGroup>
    </form>
  );
}
