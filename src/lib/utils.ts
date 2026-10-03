import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const LAST_UPDATED = "3 October 2026";
export const APP_NAME = "House Price Prediction";

export function formatINR(value: number): string {
  const rounded = Math.round(value);
  const negative = rounded < 0;
  const str = Math.abs(rounded).toString();
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  const body = rest ? `${grouped},${last3}` : last3;
  return `${negative ? "-" : ""}₹ ${body}`;
}

export function formatLakhs(value: number): string {
  const lakhs = value / 100_000;
  if (lakhs >= 100) {
    const cr = lakhs / 100;
    const digits = cr >= 10 ? 1 : 2;
    const trimmed = Number(cr.toFixed(digits));
    return `${trimmed} Cr`;
  }
  const trimmed = Number(lakhs.toFixed(lakhs >= 10 ? 1 : 2));
  return `${trimmed} Lakhs`;
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(`hpp.v1:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
