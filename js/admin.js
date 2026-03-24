// js/admin.js – Admin Panel Logic

document.addEventListener('DOMContentLoaded', async () => {
  showLoader();
  const user = await requireAdminAuth();
  if (!user) return;

  const nameEl = document.getElementById('nav-username');
  if (nameEl) nameEl.textContent = user.username;

  const [statsData, plansData] = await Promise.all([
    apiFetch('/php/admin/dashboard_stats.php'),
    apiFetch('/php/plans/get_plans.php'),
  ]);

  renderStats(statsData);
  loadUsers(plansData.plans || []);
  hideLoader();
});

function renderStats(data) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('stat-users',   data.total_users);
  set('stat-subs',    data.active_subs);
  set('stat-revenue', formatMoney(data.total_revenue));

  const dist = document.getElementById('plan-dist');
  if (dist && data.plan_dist) {
    dist.innerHTML = data.plan_dist.map(p => {
      const pct = data.active_subs > 0 ? Math.round((p.count / data.active_subs) * 100) : 0;
      return `
        <div style="margin-bottom:.75rem">
          <div class="flex-between mb-1">
            <span style="font-size:.85rem;color:${p.badge_color}">${p.name}</span>
            <span class="small">${p.count} users (${pct}%)</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${p.badge_color}"></div></div>
        </div>`;
    }).join('');
  }
}

let allUsers = [];
let allPlans = [];

async function loadUsers(plans) {
  allPlans = plans;
  try {
    const data = await apiFetch('/php/admin/users.php');
    allUsers = data.users || [];
    renderTable(allUsers);
  } catch {
    showToast('Failed to load users.', 'error');
  }
}

function renderTable(users) {
  const tbody = document.getElementById('users-tbody');
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:2rem">No users found</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(u => {
    const tier   = u.tier || 1;
    const colors = PLAN_COLORS[tier] || PLAN_COLORS[1];
    const planBadge = u.plan_name
      ? `<span class="tag" style="background:${colors.bg};color:${colors.text};border:1px solid ${colors.border}">${u.plan_name}</span>`
      : `<span class="tag tag-gray">None</span>`;
    const expiry = u.expiry_date
      ? (new Date(u.expiry_date) < new Date() ? '<span style="color:var(--neon-pink)">Expired</span>' : u.expiry_date)
      : '<span style="color:var(--text-muted)">—</span>';

    const planOptions = allPlans.map(p =>
      `<option value="${p.id}" ${u.tier == p.tier ? 'selected' : ''}>${p.name}</option>`
    ).join('');

    return `
      <tr>
        <td><strong>#${u.id}</strong></td>
        <td>
          <div style="font-weight:600">${escHtml(u.username)}</div>
          <div class="small">${escHtml(u.email)}</div>
        </td>
        <td>${u.role === 'admin' ? '<span class="tag tag-purple">Admin</span>' : '<span class="tag tag-cyan">User</span>'}</td>
        <td>${planBadge}</td>
        <td>${expiry}</td>
        <td>
          <div style="display:flex;gap:.5rem;align-items:center">
            <select class="form-input" style="padding:.3rem .6rem;font-size:.8rem;border-radius:6px;width:110px" id="plan-sel-${u.id}">${planOptions}</select>
            <button class="btn btn-primary btn-sm" onclick="updateUserPlan(${u.id})">Save</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

async function updateUserPlan(userId) {
  const sel = document.getElementById(`plan-sel-${userId}`);
  if (!sel) return;
  const planId = parseInt(sel.value);

  try {
    const data = await apiFetch('/php/admin/update_plan.php', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, plan_id: planId }),
    });
    if (data.success) {
      showToast(data.message, 'success');
      const statsData = await apiFetch('/php/admin/dashboard_stats.php');
      renderStats(statsData);
      await loadUsers(allPlans);
    } else {
      showToast(data.message, 'error');
    }
  } catch {
    showToast('Failed to update plan.', 'error');
  }
}

// Search filter
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('user-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = allUsers.filter(u =>
        u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
      renderTable(filtered);
    });
  }
});

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
