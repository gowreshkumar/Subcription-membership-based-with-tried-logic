// js/auth.js – Login & Register page logic

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
  loadPlansForRegister();
});

/* ── LOGIN ── */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing in…';

    const email    = form.email.value.trim();
    const password = form.password.value;

    try {
      const data = await apiFetch('/php/auth/login.php', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        showToast('Welcome back! Redirecting…', 'success');
        setTimeout(() => {
          if (data.user.role === 'admin') {
            window.location.href = BASE_URL + '/admin.html';
          } else {
            window.location.href = BASE_URL + '/dashboard.html';
          }
        }, 800);
      } else {
        showToast(data.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    } catch {
      showToast('Connection error. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}

/* ── REGISTER ── */
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);
    const btn = form.querySelector('[type="submit"]');

    const username = form.username.value.trim();
    const email    = form.email.value.trim();
    const password = form.password.value;
    const confirm  = form.confirm_password.value;
    const plan_id  = parseInt(form.plan_id?.value || '1');

    // Client-side validation
    let valid = true;
    if (!username || username.length < 3) {
      showFieldError('username', 'Username must be at least 3 characters'); valid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError('email', 'Enter a valid email address'); valid = false;
    }
    if (password.length < 6) {
      showFieldError('password', 'Password must be at least 6 characters'); valid = false;
    }
    if (password !== confirm) {
      showFieldError('confirm_password', 'Passwords do not match'); valid = false;
    }
    if (!valid) return;

    btn.disabled = true;
    btn.textContent = 'Creating account…';

    try {
      const data = await apiFetch('/php/auth/register.php', {
        method: 'POST',
        body: JSON.stringify({ username, email, password, plan_id }),
      });

      if (data.success) {
        showToast(data.message, 'success', 4000);
        setTimeout(() => { window.location.href = BASE_URL + '/login.html'; }, 1200);
      } else {
        showToast(data.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    } catch {
      showToast('Connection error. Please try again.', 'error');
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  });
}

/* ── Load plans into register select ── */
async function loadPlansForRegister() {
  const sel = document.getElementById('plan-select');
  if (!sel) return;
  try {
    const data = await apiFetch('/php/plans/get_plans.php');
    if (!data.success) return;
    sel.innerHTML = '';
    data.plans.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} — ${p.price > 0 ? '$' + parseFloat(p.price).toFixed(2) + '/mo' : 'Free'}`;
      sel.appendChild(opt);
    });
  } catch {/* silently ignore */}
}

/* ── Field error helpers ── */
function showFieldError(name, msg) {
  const input = document.querySelector(`[name="${name}"]`);
  if (!input) return;
  input.classList.add('error');
  const err = document.createElement('small');
  err.className = 'field-error';
  err.style.cssText = 'color:#f72585;font-size:.78rem;margin-top:.2rem;display:block;';
  err.textContent = msg;
  input.parentElement.appendChild(err);
}

function clearErrors(form) {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  form.querySelectorAll('.field-error').forEach(el => el.remove());
}
