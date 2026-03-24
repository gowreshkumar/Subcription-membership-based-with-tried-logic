// js/main.js – Global utilities for Member Vaults

const BASE_URL = '/subscriptionmembership';

/* ── API Fetch Helper ── */
async function apiFetch(url, options = {}) {
  const defaults = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };
  const res = await fetch(BASE_URL + url, { ...defaults, ...options });
  const data = await res.json();
  return data;
}

/* ── Toast Notifications ── */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: '💡' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || '🔔'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── Auth Guard (redirect if not logged in) ── */
async function requireAuth(redirectTo = '/login.html') {
  const data = await apiFetch('/php/auth/check_session.php');
  if (!data.logged_in) {
    window.location.href = BASE_URL + redirectTo;
  }
  return data.user;
}

/* ── Admin Guard ── */
async function requireAdminAuth() {
  const data = await apiFetch('/php/auth/check_session.php');
  if (!data.logged_in) {
    window.location.href = BASE_URL + '/login.html';
    return null;
  }
  if (data.user.role !== 'admin') {
    window.location.href = BASE_URL + '/dashboard.html';
    return null;
  }
  return data.user;
}

/* ── Loading Overlay ── */
function showLoader() {
  let el = document.getElementById('global-loader');
  if (!el) {
    el = document.createElement('div');
    el.id = 'global-loader';
    el.className = 'loading-overlay';
    el.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(el);
  }
  el.style.display = 'flex';
}

function hideLoader() {
  const el = document.getElementById('global-loader');
  if (el) el.style.display = 'none';
}

/* ── Navbar Active Link ── */
function setNavActive() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && path.endsWith(href.replace(/^.*\//, ''))) {
      a.classList.add('active');
    }
  });
}

/* ── Hamburger Menu ── */
function initHamburger() {
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (ham && links) {
    ham.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }
}

/* ── Logout ── */
async function logout() {
  await apiFetch('/php/auth/logout.php');
  window.location.href = BASE_URL + '/login.html';
}

/* ── Plan tier badge color ── */
const PLAN_COLORS = {
  1: { text: '#6b7280', bg: 'rgba(107,114,128,.15)', border: 'rgba(107,114,128,.4)', label: 'Free' },
  2: { text: '#94a3b8', bg: 'rgba(148,163,184,.15)', border: 'rgba(148,163,184,.4)', label: 'Silver' },
  3: { text: '#f59e0b', bg: 'rgba(245,158,11,.15)',  border: 'rgba(245,158,11,.4)',  label: 'Gold' },
  4: { text: '#a855f7', bg: 'rgba(168,85,247,.15)',  border: 'rgba(168,85,247,.4)',  label: 'Premium' },
};

/* ── Days remaining countdown ── */
function daysRemaining(expiryDate) {
  if (!expiryDate) return null;
  const now = new Date();
  const exp = new Date(expiryDate);
  const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  return diff;
}

/* ── Format currency ── */
function formatMoney(n) {
  return '$' + parseFloat(n).toFixed(2);
}

/* ── Init on DOM ready ── */
document.addEventListener('DOMContentLoaded', () => {
  setNavActive();
  initHamburger();
});
