// js/dashboard.js – User Dashboard Logic

document.addEventListener('DOMContentLoaded', async () => {
  showLoader();
  const user = await requireAuth();
  if (!user) return;

  // Set username in navbar
  const nameEl = document.getElementById('nav-username');
  if (nameEl) nameEl.textContent = user.username;

  await loadSubscription(user);
  hideLoader();
});

async function loadSubscription(user) {
  try {
    const data = await apiFetch('/php/subscription/my_subscription.php');
    const sub = data.subscription;

    renderWelcome(user, sub);
    renderSubBanner(sub);
    renderTierContent(sub ? sub.tier : 1);
    renderCountdown(sub);
  } catch {
    showToast('Failed to load subscription data.', 'error');
  }
}

function renderWelcome(user, sub) {
  const el = document.getElementById('welcome-text');
  if (!el) return;
  const tier = sub ? sub.tier : 1;
  const planName = sub ? sub.plan_name : 'Free';
  el.innerHTML = `Welcome back, <span class="neon-text">${user.username}</span>!
    You are on the <span style="color:${PLAN_COLORS[tier]?.text}">${planName}</span> plan.`;
}

function renderSubBanner(sub) {
  const el = document.getElementById('sub-banner');
  if (!el) return;

  if (!sub) {
    el.innerHTML = `<div class="sub-plan-badge tag-gray">No Active Plan</div>
      <div class="expiry-text">You have no active subscription. <a href="plans.html">Browse plans →</a></div>`;
    return;
  }

  const tier = sub.tier;
  const colors = PLAN_COLORS[tier] || PLAN_COLORS[1];
  const days = daysRemaining(sub.expiry_date);
  const expiryText = sub.expiry_date
    ? `Expires in <strong>${days > 0 ? days + ' days' : 'Today'}</strong> (${sub.expiry_date})`
    : 'Lifetime access — never expires';

  el.innerHTML = `
    <div class="sub-plan-badge" style="background:${colors.bg};color:${colors.text};border:1px solid ${colors.border}">
      ✦ ${sub.plan_name}
    </div>
    <div>
      <div class="expiry-text">${expiryText}</div>
      <div class="small mt-1">Member since ${sub.start_date}</div>
    </div>
    ${tier < 4 ? `<a href="plans.html" class="btn btn-outline btn-sm" style="margin-left:auto">⬆ Upgrade Plan</a>` : ''}
  `;
}

function renderCountdown(sub) {
  if (!sub || !sub.expiry_date) return;
  const el = document.getElementById('expiry-countdown');
  if (!el) return;

  const now = new Date();
  const exp = new Date(sub.expiry_date + 'T23:59:59');

  function tick() {
    const diff = exp - new Date();
    if (diff <= 0) { el.innerHTML = '<span class="neon-pink">Subscription expired!</span>'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `
      <div class="countdown">
        ${[['Days',d],['Hours',h],['Mins',m],['Secs',s]].map(([l,v]) =>
          `<div class="countdown-unit"><span class="countdown-val">${String(v).padStart(2,'0')}</span><span class="countdown-label">${l}</span></div>`
        ).join('')}
      </div>`;
  }
  tick();
  setInterval(tick, 1000);
}

function renderTierContent(userTier) {
  const contents = [
    {
      tier: 1, id: 'content-free',
      icon: '📖', title: 'Public Articles',
      body: `<p style="color:var(--text-muted);line-height:1.7">Access our growing library of public articles covering web development, design systems, and technology trends. Updated weekly.</p>
             <div class="grid-2 mt-2">
              ${['Getting Started with APIs','CSS Grid Masterclass','Intro to Databases','JS ES6 Deep Dive'].map(t=>`<div class="glass p-3" style="border-radius:var(--radius-sm);font-size:.88rem">${t}</div>`).join('')}
             </div>`
    },
    {
      tier: 2, id: 'content-silver',
      icon: '💬', title: 'Community Forum & Newsletter',
      body: `<p style="color:var(--text-muted);line-height:1.7">Join 5,000+ members in our private community forum. Get the monthly insider newsletter with curated resources, job boards, and industry insights.</p>
             <div class="grid-2 mt-2">
              ${['Forum Access','Monthly Newsletter','Discord Server','Peer Reviews'].map(t=>`<div class="glass p-3" style="border-radius:var(--radius-sm);font-size:.88rem;color:var(--neon-silver)">✔ ${t}</div>`).join('')}
             </div>`
    },
    {
      tier: 3, id: 'content-gold',
      icon: '🎓', title: 'Premium Tutorials & Priority Support',
      body: `<p style="color:var(--text-muted);line-height:1.7">Dive into 200+ premium video tutorials, advanced workshops, and get priority support with 24-hour guaranteed response times.</p>
             <div class="grid-2 mt-2">
              ${['200+ Tutorials','Priority Support','Advanced Workshops','Certificate of Completion'].map(t=>`<div class="glass p-3" style="border-radius:var(--radius-sm);font-size:.88rem;color:var(--neon-gold)">⭐ ${t}</div>`).join('')}
             </div>`
    },
    {
      tier: 4, id: 'content-premium',
      icon: '🔮', title: 'Exclusive Vault & 1-on-1 Sessions',
      body: `<p style="color:var(--text-muted);line-height:1.7">Unlock the full vault — exclusive frameworks, source-code libraries, monthly 1-on-1 mentoring sessions, a personal API key, and lifetime content updates.</p>
             <div class="grid-2 mt-2">
              ${['Vault Content Library','1-on-1 Mentoring','Personal API Key','Lifetime Updates'].map(t=>`<div class="glass p-3" style="border-radius:var(--radius-sm);font-size:.88rem;color:var(--neon-purple)">🔮 ${t}</div>`).join('')}
             </div>`
    },
  ];

  const container = document.getElementById('tier-content');
  if (!container) return;
  container.innerHTML = '';

  contents.forEach(c => {
    const unlocked = userTier >= c.tier;
    const colors = PLAN_COLORS[c.tier];
    const div = document.createElement('div');
    div.className = `tier-section ${unlocked ? 'unlocked' : 'locked'}`;
    div.id = c.id;
    div.innerHTML = `
      <div class="tier-section-head">
        <span style="font-size:1.5rem">${c.icon}</span>
        <h3 style="color:${colors.text}">${c.title}</h3>
        <span class="tag tag-${['','gray','cyan','gold','purple'][c.tier]} " style="margin-left:auto">${PLAN_COLORS[c.tier].label}</span>
        ${!unlocked ? '<span class="tier-lock-icon">🔒</span>' : '<span class="tier-lock-icon">✅</span>'}
      </div>
      <div>${c.body}</div>
      ${!unlocked ? `<div style="margin-top:1rem;text-align:center">
        <a href="plans.html" class="btn btn-outline btn-sm">Upgrade to unlock this content</a>
      </div>` : ''}
    `;
    container.appendChild(div);
  });
}
