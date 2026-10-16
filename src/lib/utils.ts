import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fullName(p: { first_name: string; last_name: string | null }) {
  return [p.first_name, p.last_name].filter(Boolean).join(" ");
}

export function initials(p: { first_name: string; last_name: string | null }) {
  return `${p.first_name[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase();
}
