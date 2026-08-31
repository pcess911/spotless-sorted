import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

/** Simple booking reference generator */
export function generateBookingRef() {
  const now = new Date();
  const y = now.getFullYear().toString();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  const hh = `${now.getHours()}`.padStart(2, "0");
  const mm = `${now.getMinutes()}`.padStart(2, "0");
  const short = uuidv4().split("-")[0].toUpperCase();
  return `SS-${y}${m}${d}-${hh}${mm}-${short}`;
}

export const COMMON_TIMEZONES = [
  "Africa/Lagos",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "America/Toronto",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
];

export function whatsappRedirectUrl(number: string, text?: string) {
  const encoded = encodeURIComponent(text ?? "");
  const sanitized = number.replace(/[^+\d]/g, "");
  return `https://wa.me/${sanitized.replace(/^\+/, "")}?text=${encoded}`;
}

export const BookingSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(6),
  serviceId: z.string().min(1),
  date: z.string().min(8),
  time: z.string().min(4),
  timezone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type BookingInput = z.infer<typeof BookingSchema>;
