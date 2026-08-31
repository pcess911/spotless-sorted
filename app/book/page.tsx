import React from "react";
import BookingForm from "../../components/booking/BookingForm";

export default function BookPage() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Book a service</h1>
      {/* BookingForm will load services client-side using the anon key */}
      <BookingForm />
    </main>
  );
}
