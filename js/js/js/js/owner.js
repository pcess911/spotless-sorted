import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', async () => {
  const authSection = document.getElementById('auth-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const authError = document.getElementById('auth-error');

  const showLogin = () => {
    if (authSection) authSection.style.display = 'block';
    if (dashboardSection) dashboardSection.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  };

  const showDashboard = () => {
    if (authSection) authSection.style.display = 'none';
    if (dashboardSection) dashboardSection.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';

    loadBookings();
    loadQuotes();
    loadEnquiries();
  };

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session) {
    showDashboard();
  } else {
    showLogin();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      authError.style.display = 'none';

      const email = document
        .getElementById('owner-email')
        .value
        .trim();

      const password = document.getElementById('owner-password').value;

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        showDashboard();
      } catch (err) {
        console.error(err);

        authError.textContent =
          'Login failed. Please check your email and password.';
        authError.style.display = 'block';
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabase.auth.signOut();
      showLogin();
    });
  }

  const tabs = document.querySelectorAll('.tab-btn');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((button) => {
        button.classList.remove('active');
      });

      document.querySelectorAll('.tab-content').forEach((content) => {
        content.style.display = 'none';
      });

      tab.classList.add('active');

      const target = document.getElementById(tab.dataset.tab);

      if (target) {
        target.style.display = 'block';
      }
    });
  });

  async function loadBookings() {
    const container = document.getElementById('bookings-list');

    if (!container) return;

    container.innerHTML =
      '<tr><td colspan="9">Loading bookings...</td></tr>';

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      container.innerHTML =
        `<tr><td colspan="9">Unable to load bookings.</td></tr>`;
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML =
        '<tr><td colspan="9">No bookings yet.</td></tr>';
      return;
    }

    container.innerHTML = data
      .map(
        (item) => `
        <tr>
          <td>${formatDate(item.created_at)}</td>
          <td>${escapeHtml(item.full_name)}</td>
          <td>
            ${escapeHtml(item.phone)}<br>
            ${escapeHtml(item.email)}
          </td>
          <td>${escapeHtml(item.service_type)}</td>
          <td>
            ${escapeHtml(item.preferred_date)}<br>
            ${escapeHtml(item.preferred_time)}
          </td>
          <td>${escapeHtml(item.location)}</td>
          <td>${escapeHtml(item.special_instructions || 'N/A')}</td>
          <td>
            <span class="status-badge status-${escapeHtml(item.status)}">
              ${escapeHtml(item.status)}
            </span>
          </td>
          <td>
            <select
              onchange="updateBookingStatus('${item.id}', this.value)"
            >
              <option value="New" ${
                item.status === 'New' ? 'selected' : ''
              }>New</option>

              <option value="Confirmed" ${
                item.status === 'Confirmed' ? 'selected' : ''
              }>Confirmed</option>

              <option value="Completed" ${
                item.status === 'Completed' ? 'selected' : ''
              }>Completed</option>

              <option value="Cancelled" ${
                item.status === 'Cancelled' ? 'selected' : ''
              }>Cancelled</option>
            </select>
          </td>
        </tr>
      `
      )
      .join('');
  }

  async function loadQuotes() {
    const container = document.getElementById('quotes-list');

    if (!container) return;

    container.innerHTML =
      '<tr><td colspan="7">Loading quotes...</td></tr>';

    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      container.innerHTML =
        '<tr><td colspan="7">Unable to load quotes.</td></tr>';
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML =
        '<tr><td colspan="7">No quote requests yet.</td></tr>';
      return;
    }

    container.innerHTML = data
      .map(
        (item) => `
        <tr>
          <td>${formatDate(item.created_at)}</td>
          <td>${escapeHtml(item.full_name)}</td>
          <td>
            ${escapeHtml(item.phone)}<br>
            ${escapeHtml(item.email)}
          </td>
          <td>${escapeHtml(item.service_type)}</td>
          <td>${escapeHtml(item.description)}</td>
          <td>${escapeHtml(item.additional_details || 'N/A')}</td>
          <td>
            <span class="status-badge">
              ${escapeHtml(item.status)}
            </span>
          </td>
        </tr>
      `
      )
      .join('');
  }

  async function loadEnquiries() {
    const container = document.getElementById('enquiries-list');

    if (!container) return;

    container.innerHTML =
      '<tr><td colspan="5">Loading enquiries...</td></tr>';

    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      container.innerHTML =
        '<tr><td colspan="5">Unable to load enquiries.</td></tr>';
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML =
        '<tr><td colspan="5">No enquiries yet.</td></tr>';
      return;
    }

    container.innerHTML = data
      .map(
        (item) => `
        <tr>
          <td>${formatDate(item.created_at)}</td>
          <td>
            ${escapeHtml(item.full_name)}<br>
            ${escapeHtml(item.email)}
          </td>
          <td>${escapeHtml(item.subject)}</td>
          <td>${escapeHtml(item.message)}</td>
          <td>
            <span class="status-badge">
              ${escapeHtml(item.status)}
            </span>
          </td>
        </tr>
      `
      )
      .join('');
  }

  window.updateBookingStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Unable to update booking status.');
      return;
    }

    loadBookings();
  };

  function formatDate(value) {
    return new Date(value).toLocaleDateString();
  }

  function escapeHtml(value) {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).replace(/[&<>"']/g, (character) => {
      const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };

      return entities[character];
    });
  }
});
