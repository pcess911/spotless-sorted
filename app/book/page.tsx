"use client";

import React, { Suspense } from "react";
import BookingForm from "../../components/booking/BookingForm";
import { createServerSupabaseClient } from "../../lib/supabaseClient";

export default async function BookPage() {
  // Fetch active services server-side using service role key
  const supabase = createServerSupabaseClient();
  const { data: servicesData, error } = await supabase
    .from("services")
    .select("id, name, price, requires_address, active")
    .eq("active", true)
    .order("name", { ascending: true });

  const services = Array.isArray(servicesData) ? servicesData : [];

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Book a service</h1>
      <Suspense fallback={<div>Loading booking form…</div>}>
        <BookingForm services={services} />
      </Suspense>
    </main>
  );
}
