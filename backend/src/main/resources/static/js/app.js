const API_BASE = (window.location.protocol === 'file:') ? 'http://localhost:8080/api' : '/api';
const views = ['role-view', 'login-form', 'register-form', 'otp-form'];
let selectedRole = '';
let pendingEmail = '';

const $ = id => document.getElementById(id);
const show = id => views.forEach(view => $(view).classList.toggle('hidden', view !== id));
const status = message => { $('status').textContent = message || ''; };

async function callApi(path, options) {
  const response = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'The server could not complete the request.');
  return data;
}

document.querySelectorAll('[data-role]').forEach(button => button.addEventListener('click', () => {
  selectedRole = button.dataset.role;
  $('role-label').textContent = `${selectedRole.toLowerCase()} portal`;
  $('register-button').classList.toggle('hidden', selectedRole !== 'STUDENT');
  show('login-form');
  status('');
}));

document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => {
  show(button.closest('form').id === 'register-form' ? 'login-form' : 'role-view');
  status('');
}));

$('register-button').addEventListener('click', () => { show('register-form'); status(''); });

$('login-form').addEventListener('submit', async event => {
  event.preventDefault();
  status('');
  try {
    const result = await callApi('/auth/login', { method: 'POST', body: JSON.stringify({ role: selectedRole, identifier: $('login-identifier').value.trim(), password: $('login-password').value }) });
    status(`Welcome, ${result.name}.`);
  } catch (error) { status(error.message); }
});

$('register-form').addEventListener('submit', async event => {
  event.preventDefault();
  status('');
  pendingEmail = $('register-email').value.trim().toLowerCase();
  try {
    const result = await callApi('/auth/register', { method: 'POST', body: JSON.stringify({ name: $('register-name').value.trim(), studentId: $('register-id').value.trim(), email: pendingEmail, password: $('register-password').value }) });
    $('otp-message').textContent = result.message;
    show('otp-form');
  } catch (error) { status(error.message); }
});

$('otp-form').addEventListener('submit', async event => {
  event.preventDefault();
  status('');
  try {
    await callApi('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email: pendingEmail, otp: $('otp-code').value.trim() }) });
    show('login-form');
    status('Email verified. You can now log in.');
  } catch (error) { status(error.message); }
});

$('resend-button').addEventListener('click', async () => {
  try {
    const result = await callApi('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email: pendingEmail }) });
    $('otp-message').textContent = result.message;
  } catch (error) { status(error.message); }
});
