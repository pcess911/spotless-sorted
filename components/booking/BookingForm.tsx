"use client";

import React, { useState, useEffect } from "react";
import BookingDatePicker from "./DatePicker";
import TimePicker from "./TimePicker";
import TimezoneSelect from "./TimezoneSelect";
import { BookingSchema, BookingInput } from "../../lib/utils";
import { z } from "zod";
import { createBrowserSupabaseClient } from "../../lib/supabaseClient";

export type ServiceOption = {
  id: string;
  name: string;
  price?: string | null;
  requires_address?: boolean | null;
  active?: boolean | null;
};

type Props = {
  services?: ServiceOption[]; // optional — will fetch client-side if not provided
};

export default function BookingForm({ services: initialServices }: Props) {
  const [services, setServices] = useState<ServiceOption[]>(initialServices ?? []);
  const [loadingServices, setLoadingServices] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [whatsappAvailable, setWhatsappAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultService = services && services.length > 0 ? services[0] : null;

  const [form, setForm] = useState<BookingInput>({
    fullName: "",
    email: undefined,
    phone: "",
    serviceId: defaultService?.id ?? "",
    date: "",
    time: "",
    timezone: "Africa/Lagos",
    address: "",
    notes: undefined,
  });

  useEffect(() => {
    if (!initialServices || initialServices.length === 0) {
      // fetch active services using the client (anon) key
      setLoadingServices(true);
      try {
        const supabase = createBrowserSupabaseClient();
        supabase
          .from("services")
          .select("id, name, price, requires_address, active")
          .eq("active", true)
          .order("name", { ascending: true })
          .then(({ data, error }) => {
            if (error) {
              console.error("Failed to load services (client):", error);
              setServices([]);
            } else if (Array.isArray(data)) {
              setServices(data as ServiceOption[]);
              // if no service selected yet, pick first
              setForm((s) => ({ ...s, serviceId: (data[0] as any)?.id ?? s.serviceId }));
            }
          })
          .finally(() => setLoadingServices(false));
      } catch (err) {
        console.error("Client supabase error loading services:", err);
        setLoadingServices(false);
      }
    }
  }, [initialServices]);

  const selectedService = services.find((s) => s.id === form.serviceId);
  const addressRequired = !!selectedService?.requires_address;

  function update<K extends keyof BookingInput>(k: K, v: BookingInput[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      BookingSchema.parse(form);
      if (addressRequired && (!form.address || form.address.trim().length < 5)) {
        setError("Address / location is required for the selected service.");
        return;
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.errors.map((e) => e.message).join(", "));
      } else {
        setError("Please check the form fields.");
      }
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.message ?? "Failed to create booking. Please try again later.");
        setLoading(false);
        return;
      }

      setSuccessRef(json.bookingRef);
      setWhatsappAvailable(Boolean(json.whatsappAvailable));

      if (json.whatsappUrl) {
        setTimeout(() => {
          window.location.href = json.whatsappUrl;
        }, 300);
      }
    } catch (err: any) {
      console.error("Booking submit error (client):", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4" aria-live="polite">
      {successRef ? (
        <div className="p-4 rounded-md bg-emerald-50 text-emerald-800">
          Booking received — Ref: <strong>{successRef}</strong>
          {whatsappAvailable === false ? (
            <div className="mt-2 text-sm text-slate-700">WhatsApp Coming Soon — we'll contact you by email or phone.</div>
          ) : (
            <div className="mt-2 text-sm text-slate-700">Redirecting to WhatsApp to confirm…</div>
          )}
        </div>
      ) : null}

      {error ? <div className="p-3 rounded-md bg-red-50 text-red-700">{error}</div> : null}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium">
          Full name
        </label>
        <input id="fullName" name="fullName" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="w-full rounded-md border px-3 py-2" required />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium">
          Phone
        </label>
        <input id="phone" name="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="w-full rounded-md border px-3 py-2" required />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email (optional)
        </label>
        <input id="email" name="email" type="email" value={form.email ?? ""} onChange={(e) => update("email", e.target.value || undefined)} className="w-full rounded-md border px-3 py-2" />
      </div>

      <div>
        <label htmlFor="service" className="block text-sm font-medium">
          Service
        </label>
        <select id="service" name="service" value={form.serviceId} onChange={(e) => update("serviceId", e.target.value)} className="w-full rounded-md border px-3 py-2">
          {loadingServices ? <option>Loading services…</option> : null}
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.price ? `— ${s.price}` : "— Request a Quote"}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium">Date</label>
          <BookingDatePicker selected={form.date ? new Date(form.date) : null} onChange={(d) => update("date", d ? d.toISOString().slice(0, 10) : "")} minDate={new Date()} />
        </div>

        <div>
          <label className="block text-sm font-medium">Preferred time</label>
          <TimePicker value={form.time} onChange={(v) => update("time", v)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Timezone</label>
          <TimezoneSelect value={form.timezone ?? "Africa/Lagos"} onChange={(v) => update("timezone", v)} />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium">
          Address / Location {addressRequired ? <span className="text-red-600">*</span> : <span className="text-sm text-slate-500">(required for some services)</span>}
        </label>
        <input id="address" name="address" value={form.address ?? ""} onChange={(e) => update("address", e.target.value)} className="w-full rounded-md border px-3 py-2" required={addressRequired} />
      </div>

      <div>
        <label className="block text-sm font-medium">Notes (optional)</label>
        <textarea value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value || undefined)} className="w-full rounded-md border px-3 py-2" rows={3} />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="rounded-md bg-brand-500 px-4 py-2 text-white">
          {loading ? "Booking…" : "Confirm Booking"}
        </button>

        <div className="text-sm text-slate-500">No payment required. Booking will be <strong>pending</strong> until confirmed.</div>
      </div>
    </form>
  );
}
