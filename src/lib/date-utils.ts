/**
 * Calendar-day values cross the Server Action network boundary as serialized
 * Date instants. If client and server run in different timezones, extracting
 * the day-of-week from that instant with local getters can land on the wrong
 * calendar day. Anchoring the calendar day to UTC midnight here, and reading
 * it back with UTC getters everywhere else, keeps "the day the user clicked"
 * stable regardless of where the browser or the server happens to run.
 */
export function toUtcDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}
