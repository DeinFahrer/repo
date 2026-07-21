"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarIcon, Trash2 } from "lucide-react";
import {
  createAvailabilityBlock,
  deleteAvailabilityBlock,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import type { AvailabilityBlock } from "@/generated/prisma/client";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function AvailabilityManager({
  initialBlocks,
}: {
  initialBlocks: AvailabilityBlock[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!date) {
      setError("Bitte ein Datum wählen.");
      return;
    }
    setSubmitting(true);
    const result = await createAvailabilityBlock({
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      reason: reason || undefined,
    });
    setSubmitting(false);

    if ("error" in result && result.error) {
      setError("Der Termin konnte nicht gesperrt werden.");
      return;
    }

    setBlocks((cur) => [
      ...cur,
      {
        id: `temp-${Date.now()}`,
        date,
        startTime: startTime || null,
        endTime: endTime || null,
        reason: reason || null,
        createdAt: new Date(),
      },
    ]);
    setDate(undefined);
    setStartTime("");
    setEndTime("");
    setReason("");
    toast.success("Termin gesperrt.");
  };

  const onDelete = async (id: string) => {
    const previous = blocks;
    setBlocks((cur) => cur.filter((b) => b.id !== id));
    const result = await deleteAvailabilityBlock(id);
    if (result.error) {
      setBlocks(previous);
      toast.error("Konnte nicht entfernt werden.");
    } else {
      toast.success("Sperrung entfernt.");
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={onSubmit} className="max-w-md">
        <FieldGroup>
          <Field>
            <FieldLabel>Datum</FieldLabel>
            <Popover>
              <PopoverTrigger
                render={
                  <Button variant="outline" className="justify-start font-normal" />
                }
              >
                <CalendarIcon className="h-4 w-4" />
                {date ? date.toLocaleDateString("de-CH") : "Datum wählen"}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < startOfToday()}
                />
              </PopoverContent>
            </Popover>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="startTime">Von (optional)</FieldLabel>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="endTime">Bis (optional)</FieldLabel>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </Field>
          </div>
          <FieldDescription>
            Ohne Uhrzeit wird der ganze Tag gesperrt.
          </FieldDescription>

          <Field>
            <FieldLabel htmlFor="reason">Grund (optional)</FieldLabel>
            <Input
              id="reason"
              placeholder="z.B. Ferien"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-fit">
            Sperren
          </Button>
        </FieldGroup>
      </form>

      <div>
        <h2 className="mb-3 font-medium">Gesperrte Termine</h2>
        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine Sperrungen vorhanden.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {blocks
              .slice()
              .sort((a, b) => a.date.getTime() - b.date.getTime())
              .map((block) => (
                <li
                  key={block.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {new Date(block.date).toLocaleDateString("de-CH")}
                      {block.startTime &&
                        ` · ${block.startTime}${block.endTime ? `–${block.endTime}` : ""}`}
                    </p>
                    {block.reason && (
                      <p className="text-muted-foreground">{block.reason}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(block.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
