import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "../../../lib/supabaseClient";
import { BookingSchema, BookingInput, generateBookingRef, whatsappRedirectUrl } from "../../../lib/utils";
import { sendMail } from "../../../lib/mail";

/**
 * POST /api/book
 * - Validates input
 * - Ensures ADMIN_EMAIL is configured (server-side recipient)
 * - Inserts booking with status 'pending'
 * - Looks up service name from services table
 * - Sends notification to ADMIN_EMAIL (business)
 * - Optionally notifies customer if email provided
 * - Returns bookingRef and whatsappUrl (if configured)
 */

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed: BookingInput = BookingSchema.parse(body);

    // Server-side required envs
    const adminEmail = process.env.ADMIN_EMAIL;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? "https://example.com";

    if (!adminEmail) {
      // Log server-side for operator
      console.error("ADMIN_EMAIL is not configured");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    const bookingRef = generateBookingRef();

    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();

    // Insert booking row with status pending
    const { data: bookingData, error: insertError } = await supabase
      .from("bookings")
      .insert([
        {
          full_name: parsed.fullName,
          email: parsed.email ?? null,
          phone: parsed.phone,
          service_id: parsed.serviceId,
          date: parsed.date,
          time: parsed.time,
          timezone: parsed.timezone,
          address: parsed.address,
          notes: parsed.notes ?? null,
          booking_ref: bookingRef,
          status: "pending",
          created_at: now,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error (bookings):", insertError.message ?? insertError);
      return NextResponse.json({ message: "Unable to create booking" }, { status: 500 });
    }

    // Fetch service name from services table (server-side)
    let serviceName = parsed.serviceId;
    try {
      const { data: svcRows, error: svcErr } = await supabase
        .from("services")
        .select("name")
        .eq("id", parsed.serviceId)
        .limit(1)
        .single();

      if (!svcErr && svcRows && (svcRows as any).name) {
        serviceName = (svcRows as any).name;
      }
    } catch (svcFetchErr) {
      console.error("Error fetching service name:", svcFetchErr);
    }

    // Compose emails. Use EMAIL_FROM as sender; recipient is ADMIN_EMAIL (business)
    const businessRecipient = adminEmail; // MUST be ADMIN_EMAIL
    const sender = process.env.EMAIL_FROM ?? "no-reply@spotless-sorted.local";

    const mailHtml = `
      <h2>New booking: ${bookingRef}</h2>
      <p><strong>Name:</strong> ${parsed.fullName}</p>
      <p><strong>Phone:</strong> ${parsed.phone}</p>
      <p><strong>Email:</strong> ${parsed.email ?? "—"}</p>
      <p><strong>Service:</strong> ${serviceName} (${parsed.serviceId})</p>
      <p><strong>Address / Location:</strong> ${parsed.address}</p>
      <p><strong>Date & Time:</strong> ${parsed.date} ${parsed.time} (${parsed.timezone})</p>
      <p><strong>Notes:</strong> ${parsed.notes ?? "—"}</p>
      <p>Manage bookings: ${siteUrl}/admin (login required)</p>
    `;

    try {
      await sendMail({
        to: businessRecipient,
        subject: `New booking — ${bookingRef}`,
        html: mailHtml,
        from: sender,
      });
    } catch (mailErr) {
      console.error("Error sending notification email to admin:", mailErr);
      // Do not expose email error details to client
    }

    // Optionally notify customer (do not treat failure as fatal)
    if (parsed.email) {
      try {
        await sendMail({
          to: parsed.email,
          subject: `Booking received — ${bookingRef}`,
          html: `
            <p>Hi ${parsed.fullName},</p>
            <p>We received your booking request (Ref: <strong>${bookingRef}</strong>). Status: <strong>pending</strong>. We will contact you to confirm the booking.</p>
            <p>Service: ${serviceName}</p>
          `,
          from: sender,
        });
      } catch (custMailErr) {
        console.error("Error sending confirmation to customer:", custMailErr);
      }
    }

    // WhatsApp redirect (server-configured number only)
    const waNumber = process.env.WHATSAPP_NUMBER ?? "";
    const waMessage = `Hi, I submitted a booking (Ref: ${bookingRef}) for ${serviceName} on ${parsed.date} at ${parsed.time} (${parsed.timezone}). Name: ${parsed.fullName}, Phone: ${parsed.phone}. Address: ${parsed.address}.`;
    const whatsappUrl = waNumber ? whatsappRedirectUrl(waNumber, waMessage) : null;

    return NextResponse.json(
      {
        bookingRef,
        whatsappUrl,
        whatsappAvailable: Boolean(whatsappUrl),
        booking: { id: bookingData?.id ?? null, status: "pending" },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Booking API error:", err?.message ?? err);

    if (err instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid booking data", errors: err.errors }, { status: 400 });
    }

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
