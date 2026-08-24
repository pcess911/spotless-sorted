import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quote-form');
  const success = document.getElementById('alert-success');
  const errorBox = document.getElementById('alert-error');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    success.style.display = 'none';
    errorBox.style.display = 'none';

    const quote = {
      full_name: document.getElementById('full_name').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      email: document.getElementById('email').value.trim(),
      service_type: document.getElementById('service_type').value,
      description: document.getElementById('description').value.trim(),
      additional_details:
        document.getElementById('additional_details').value.trim()
    };

    if (
      !quote.full_name ||
      !quote.phone ||
      !quote.email ||
      !quote.service_type ||
      !quote.description
    ) {
      errorBox.textContent = 'Please complete all required fields.';
      errorBox.style.display = 'block';
      return;
    }

    try {
      const { error } = await supabase
        .from('quotes')
        .insert([quote]);

      if (error) throw error;

      success.textContent =
        'Your quote request has been received. We will contact you shortly.';
      success.style.display = 'block';

      form.reset();
    } catch (err) {
      console.error(err);

      errorBox.textContent =
        'We could not submit your quote request. Please try again.';
      errorBox.style.display = 'block';
    }
  });
});
