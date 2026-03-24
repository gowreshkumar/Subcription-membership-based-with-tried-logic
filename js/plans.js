// js/plans.js – Plans Page Logic

document.addEventListener('DOMContentLoaded', async () => {
  showLoader();
  const user = await requireAuth();
  if (!user) return;

  const nameEl = document.getElementById('nav-username');
  if (nameEl) nameEl.textContent = user.username;

  const [plansData, subData] = await Promise.all([
    apiFetch('/php/plans/get_plans.php'),
    apiFetch('/php/subscription/my_subscription.php'),
  ]);

  const currentPlanId = subData.subscription ? parseInt(subData.subscription.plan_id) : 1;
  renderPlanCards(plansData.plans || [], currentPlanId);
  hideLoader();
});

function renderPlanCards(plans, currentPlanId) {
  const container = document.getElementById('plans-container');
  if (!container) return;
  container.innerHTML = '';

  plans.forEach(plan => {
    const colors   = PLAN_COLORS[plan.tier] || PLAN_COLORS[1];
    const isCurrent= parseInt(plan.id) === currentPlanId;
    const isPopular= parseInt(plan.tier) === 3;

    const card = document.createElement('div');
    card.className = `plan-card ${isPopular ? 'popular' : ''}`;
    card.style.setProperty('--plan-color', colors.text);

    const priceHtml = parseFloat(plan.price) === 0
      ? `<span class="amount neon-text">Free</span>`
      : `<span class="amount" style="color:${colors.text}">$${parseFloat(plan.price).toFixed(2)}</span><span class="period">/month</span>`;

    const featuresHtml = (plan.features || []).map(f =>
      `<div class="plan-feature"><span class="icon">✦</span><span>${f}</span></div>`
    ).join('');

    let btnHtml;
    if (isCurrent) {
      btnHtml = `<button class="btn btn-ghost btn-full" disabled>✅ Current Plan</button>`;
    } else if (plan.tier > (PLAN_COLORS[currentPlanId] ? currentPlanId : 1)) {
      btnHtml = `<button class="btn btn-primary btn-full" onclick="subscribePlan(${plan.id}, '${plan.name}')">⬆ Upgrade to ${plan.name}</button>`;
    } else {
      btnHtml = `<button class="btn btn-outline btn-full" onclick="subscribePlan(${plan.id}, '${plan.name}')">Switch to ${plan.name}</button>`;
    }

    card.innerHTML = `
      ${isPopular ? '<div class="popular-ribbon">Popular</div>' : ''}
      <div class="plan-header">
        <span class="plan-name" style="color:${colors.text}">${plan.name}</span>
        <span class="plan-badge" style="background:${colors.bg};color:${colors.text};border:1px solid ${colors.border}">
          Tier ${plan.tier}
        </span>
      </div>
      <div class="plan-price">${priceHtml}</div>
      <div class="divider"></div>
      <div class="plan-features">${featuresHtml}</div>
      <div class="plan-cta">${btnHtml}</div>
    `;
    container.appendChild(card);
  });
}

async function subscribePlan(planId, planName) {
  if (!confirm(`Switch to the ${planName} plan?`)) return;
  showLoader();
  try {
    const data = await apiFetch('/php/subscription/subscribe.php', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    });
    if (data.success) {
      showToast(data.message, 'success');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      showToast(data.message, 'error');
    }
  } catch {
    showToast('Failed to update plan. Try again.', 'error');
  }
  hideLoader();
}
