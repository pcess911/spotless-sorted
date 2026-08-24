import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('booking-form');
  const success = document.getElementById('alert-success');
  const errorBox = document.getElementById('alert-error');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    success.style.display = 'none';
    errorBox.style.display = 'none';

    const booking = {
      full_name: document.getElementById('full_name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      service_type: document.getElementById('service_type').value,
      preferred_date: document.getElementById('preferred_date').value,
      preferred_time: document.getElementById('preferred_time').value,
      location: document.getElementById('location').value.trim(),
      special_instructions:
        document.getElementById('special_instructions').value.trim()
    };

    if (
      !booking.full_name ||
      !booking.phone ||
      !booking.email ||
      !booking.service_type ||
      !booking.preferred_date ||
      !booking.preferred_time ||
      !booking.location
    ) {
      errorBox.textContent = 'Please complete all required fields.';
      errorBox.style.display = 'block';
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .insert([booking]);

      if (error) throw error;

      success.textContent =
        'Thank you. Your booking request has been received. We will contact you shortly.';
      success.style.display = 'block';

      form.reset();
    } catch (err) {
      console.error(err);

      errorBox.textContent =
        'We could not submit your booking. Please try again.';
      errorBox.style.display = 'block';
    }
  });
});
