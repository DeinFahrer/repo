"use client";

import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import {
  cityBookingSchema,
  type CityBookingInput,
} from "@/lib/validation/booking";
import { createCityBooking } from "@/lib/actions/booking";
import { formatRappen } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";

const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => {
  const hour = 8 + i;
  return `${String(hour).padStart(2, "0")}:00`;
});

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function CityBookingForm({
  isLoggedIn,
  hourlyRateRappen,
}: {
  isLoggedIn: boolean;
  hourlyRateRappen: number;
}) {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CityBookingInput>({
    resolver: zodResolver(cityBookingSchema),
    defaultValues: {
      startTime: "",
      durationHours: 2,
      passengerCount: 1,
      needsCargoMode: false,
    },
  });

  const durationHours = watch("durationHours") || 0;
  const priceRappen = useMemo(
    () => hourlyRateRappen * durationHours,
    [hourlyRateRappen, durationHours],
  );

  const onSubmit = async (data: CityBookingInput) => {
    setServerError(null);
    setSubmitting(true);
    const result = await createCityBooking(data);
    setSubmitting(false);
    if (result.error) {
      setServerError(result.error);
      return;
    }
    router.push(`/buchung/${result.bookingId}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.date}>
          <FieldLabel>{t("date")}</FieldLabel>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger
                  render={
                    <Button variant="outline" className="justify-start font-normal" />
                  }
                >
                  <CalendarIcon className="h-4 w-4" />
                  {field.value
                    ? field.value.toLocaleDateString(locale)
                    : t("pickDate")}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => !isWeekend(date) || date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <FieldError errors={[errors.date]} />
          <FieldDescription>{t("weekendOnlyHint")}</FieldDescription>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!errors.startTime}>
            <FieldLabel>{t("startTime")}</FieldLabel>
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("startTime")} />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.startTime]} />
          </Field>

          <Field data-invalid={!!errors.durationHours}>
            <FieldLabel>{t("duration")}</FieldLabel>
            <Controller
              control={control}
              name="durationHours"
              render={({ field }) => (
                <Select
                  value={String(field.value)}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {(value: string) =>
                        `${value} ${Number(value) === 1 ? t("hour") : t("hours")}`
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => i + 1).map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h} {h === 1 ? t("hour") : t("hours")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[errors.durationHours]} />
          </Field>
        </div>

        <Field data-invalid={!!errors.pickupAddress}>
          <FieldLabel htmlFor="pickupAddress">{t("pickupAddress")}</FieldLabel>
          <Input id="pickupAddress" {...register("pickupAddress")} />
          <FieldError errors={[errors.pickupAddress]} />
        </Field>

        <Field data-invalid={!!errors.dropoffAddress}>
          <FieldLabel htmlFor="dropoffAddress">{t("dropoffAddress")}</FieldLabel>
          <Input id="dropoffAddress" {...register("dropoffAddress")} />
          <FieldError errors={[errors.dropoffAddress]} />
        </Field>

        <Field data-invalid={!!errors.passengerCount}>
          <FieldLabel>{t("passengerCount")}</FieldLabel>
          <Controller
            control={control}
            name="passengerCount"
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(v) => field.onChange(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      `${value} ${Number(value) === 1 ? t("person") : t("persons")}`
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }, (_, i) => i + 1).map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {p} {p === 1 ? t("person") : t("persons")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.passengerCount]} />
        </Field>

        <Field orientation="horizontal">
          <FieldLabel htmlFor="needsCargoMode">{t("cargoMode")}</FieldLabel>
          <Controller
            control={control}
            name="needsCargoMode"
            render={({ field }) => (
              <Switch
                id="needsCargoMode"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="notes">{t("notes")}</FieldLabel>
          <Textarea id="notes" rows={3} {...register("notes")} />
        </Field>

        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("priceLabel")}</p>
            <p className="text-xl font-semibold">
              {formatRappen(priceRappen, locale)}
            </p>
          </div>
          <p className="max-w-[50%] text-right text-xs text-muted-foreground">
            {t("leadTimeHint")}
          </p>
        </div>

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        {isLoggedIn ? (
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("submit")}
          </Button>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              {t("loginRequired")}
            </p>
            <Button
              type="button"
              onClick={() => router.push("/konto/anmelden")}
            >
              {t("loginRequiredCta")}
            </Button>
          </div>
        )}
      </FieldGroup>
    </form>
  );
}
