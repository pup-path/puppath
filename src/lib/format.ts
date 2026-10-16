import { format, formatDistanceToNowStrict, differenceInCalendarDays, parseISO } from "date-fns";

export function fmtDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return "";
  return format(parseISO(iso), withTime ? "d MMM yyyy, h:mm a" : "d MMM yyyy");
}

export function ago(iso: string | null | undefined) {
  if (!iso) return "";
  return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
}

export function daysSince(iso: string | null | undefined) {
  if (!iso) return null;
  return differenceInCalendarDays(new Date(), parseISO(iso));
}

export function aud(n: number | null | undefined) {
  if (n == null) return "";
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n);
}
