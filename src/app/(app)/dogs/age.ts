import { differenceInMonths, parseISO } from "date-fns";

export function ageFrom(dob: string | null | undefined) {
  if (!dob) return null;
  const months = differenceInMonths(new Date(), parseISO(dob));
  if (months < 0) return null;
  if (months < 12) return `${months} mo`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y}y ${m}m` : `${y}y`;
}
