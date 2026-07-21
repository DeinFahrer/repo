"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import {
  airportBookingSchema,
  type AirportBookingInput,
} from "@/lib/validation/booking";
import { createAirportBooking } from "@/lib/actions/booking";
import { formatRappen } from "@/lib/format";
import { toUtcDateOnly } from "@/lib/date-utils";
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

const WEEKDAY_EVENING_SLOTS = Array.from({ length: 7 }, (_, i) => {
  const hour = 17 + i;
  return `${String(hour).padStart(2, "0")}:00`;
});

const FULL_DAY_SLOTS = Array.from({ length: 24 }, (_, hour) => {
  return `${String(hour).padStart(2, "0")}:00`;
});

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isWeekendDate(date?: Date) {
  if (!date) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function AirportBookingForm({
  isLoggedIn,
  fixedPriceRappen,
}: {
  isLoggedIn: boolean;
  fixedPriceRappen: number;
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
    setValue,
    formState: { errors },
  } = useForm<AirportBookingInput>({
    resolver: zodResolver(airportBookingSchema),
    defaultValues: {
      direction: "TO_AIRPORT",
      startTime: "",
      passengerCount: 1,
      needsCargoMode: false,
    },
  });

  const selectedDate = watch("date");
  const selectedStartTime = watch("startTime");
  const isWeekend = isWeekendDate(selectedDate);
  const timeSlots = useMemo(
    () => (isWeekend ? FULL_DAY_SLOTS : WEEKDAY_EVENING_SLOTS),
    [isWeekend],
  );

  useEffect(() => {
    if (selectedStartTime && !timeSlots.includes(selectedStartTime)) {
      setValue("startTime", "");
    }
  }, [timeSlots, selectedStartTime, setValue]);

  const startTimeHint = !selectedDate
    ? t("fromFivePmHint")
    : isWeekend
      ? t("weekendAnytimeHint")
      : t("weekdayFromFivePmHint");

  const onSubmit = async (data: AirportBookingInput) => {
    setServerError(null);
    setSubmitting(true);
    const result = await createAirportBooking({
      ...data,
      date: toUtcDateOnly(data.date),
    });
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
        <Field data-invalid={!!errors.direction}>
          <FieldLabel>{t("direction")}</FieldLabel>
          <Controller
            control={control}
            name="direction"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === "TO_AIRPORT" ? t("toAirport") : t("fromAirport")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TO_AIRPORT">{t("toAirport")}</SelectItem>
                  <SelectItem value="FROM_AIRPORT">
                    {t("fromAirport")}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

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
                    disabled={(date) => date < startOfToday()}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <FieldError errors={[errors.date]} />
        </Field>

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
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.startTime]} />
          <FieldDescription>{startTimeHint}</FieldDescription>
        </Field>

        <Field data-invalid={!!errors.address}>
          <FieldLabel htmlFor="address">{t("address")}</FieldLabel>
          <Input id="address" {...register("address")} />
          <FieldError errors={[errors.address]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="flightNumber">{t("flightNumber")}</FieldLabel>
          <Input id="flightNumber" {...register("flightNumber")} />
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
          <FieldLabel htmlFor="needsCargoModeAirport">
            {t("cargoMode")}
          </FieldLabel>
          <Controller
            control={control}
            name="needsCargoMode"
            render={({ field }) => (
              <Switch
                id="needsCargoModeAirport"
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
              {formatRappen(fixedPriceRappen, locale)}
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
