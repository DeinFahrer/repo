import { z } from "zod";

export const cityBookingSchema = z.object({
  date: z.date({ error: "Bitte wähle ein Datum." }),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Bitte wähle eine Uhrzeit."),
  durationHours: z.coerce.number().int().min(1).max(8),
  pickupAddress: z.string().trim().min(3, "Bitte gib eine Abholadresse an."),
  dropoffAddress: z.string().trim().min(3, "Bitte gib eine Zieladresse an."),
  passengerCount: z.coerce.number().int().min(1).max(7),
  needsCargoMode: z.boolean().default(false),
  notes: z.string().trim().max(500).optional(),
});

export type CityBookingInput = z.infer<typeof cityBookingSchema>;

export const airportBookingSchema = z.object({
  date: z.date({ error: "Bitte wähle ein Datum." }),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Bitte wähle eine Uhrzeit."),
  direction: z.enum(["TO_AIRPORT", "FROM_AIRPORT"]),
  address: z.string().trim().min(3, "Bitte gib eine Adresse in Bern an."),
  flightNumber: z.string().trim().max(20).optional(),
  passengerCount: z.coerce.number().int().min(1).max(7),
  needsCargoMode: z.boolean().default(false),
  notes: z.string().trim().max(500).optional(),
});

export type AirportBookingInput = z.infer<typeof airportBookingSchema>;
