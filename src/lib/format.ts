export function formatRappen(rappen: number, locale: string = "de-CH") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "CHF",
  }).format(rappen / 100);
}
