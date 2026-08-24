import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('alert-success');
  const errorBox = document.getElementById('alert-error');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    success.style.display = 'none';
    errorBox.style.display = 'none';

    const enquiry = {
      full_name: document.getElementById('full_name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      message: document.getElementById('message').value.trim()
    };

    if (
      !enquiry.full_name ||
      !enquiry.email ||
      !enquiry.subject ||
      !enquiry.message
    ) {
      errorBox.textContent = 'Please complete all required fields.';
      errorBox.style.display = 'block';
      return;
    }

    try {
      const { error } = await supabase
        .from('enquiries')
        .insert([enquiry]);

      if (error) throw error;

      success.textContent =
        'Your message has been sent. Our customer service team will contact you soon.';
      success.style.display = 'block';

      form.reset();
    } catch (err) {
      console.error(err);

      errorBox.textContent =
        'We could not send your message. Please try again.';
      errorBox.style.display = 'block';
    }
  });
});
