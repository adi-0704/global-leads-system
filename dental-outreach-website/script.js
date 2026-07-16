/* ================================================================
   DentalReach — script.js
   Industry-level interactions, animations, and logic
   ================================================================ */

'use strict';

// ── Nav: sticky scroll effect ─────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Hamburger mobile menu ─────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', isOpen);
  hamburger.textContent = isOpen ? '✕' : '☰';
});

function closeMobile() {
  mobileNav.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.textContent = '☰';
}

// ── Feature Tabs ──────────────────────────────────────────────────
function switchTab(idx) {
  document.querySelectorAll('.feat-tab').forEach((t, i) => {
    t.classList.toggle('active', i === idx);
    t.setAttribute('aria-selected', i === idx);
  });
  document.querySelectorAll('.feat-panel').forEach((p, i) => {
    p.classList.toggle('active', i === idx);
  });
  // Re-trigger reveals inside newly active panel
  document.querySelectorAll(`#tab${idx} .reveal-left, #tab${idx} .reveal-right`).forEach(el => {
    el.classList.remove('visible');
    setTimeout(() => el.classList.add('visible'), 50);
  });
}

// ── FAQ Accordion ─────────────────────────────────────────────────
function toggleFaq(item) {
  const isOpen = item.classList.contains('open');
  // Close all
  document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
  // Toggle clicked
  if (!isOpen) item.classList.add('open');
}

// ── Counter animation ─────────────────────────────────────────────
function animateCounter(el, target, duration = 1800) {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';
  const start = performance.now();
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const val = Math.round(easeOut(progress) * target);
    el.textContent = target === 4 ? val : val.toLocaleString('en-IN');
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target === 4 ? target : target.toLocaleString('en-IN');
  };
  requestAnimationFrame(tick);
}

// ── Intersection Observer for reveals & counters ──────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('visible');

    // Counter
    if (el.classList.contains('stat-block')) {
      const numEl = el.querySelector('.stat-n');
      if (numEl) animateCounter(numEl, parseInt(numEl.dataset.target));
    }
    revealObs.unobserve(el);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

// Observe all reveal elements
document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stat-block').forEach((el, i) => {
  // Stagger delays for grid children
  if (el.closest('.problem-grid, .cases-grid, .testi-grid, .plans-grid, .faq-grid')) {
    const siblings = [...el.parentElement.children];
    const idx = siblings.indexOf(el);
    el.style.transitionDelay = `${idx * 0.1}s`;
  }
  revealObs.observe(el);
});

// ── Smooth scroll ────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = navbar.offsetHeight + 16;
    window.scrollTo({ top: target.offsetTop - navH, behavior: 'smooth' });
    closeMobile();
  });
});

// ── ROI Calculator ────────────────────────────────────────────────
const PLAN_FEE = 17999;

function fmtINR(n) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

function updateROI() {
  const patients = parseInt(document.getElementById('patsRange').value);
  const revenue  = parseInt(document.getElementById('revRange').value);
  const reviews  = parseInt(document.getElementById('reviewRange').value);
  const rank     = parseInt(document.getElementById('rankRange').value);

  // Update display labels
  document.getElementById('patsDisplay').textContent = `${patients} patients`;
  document.getElementById('revDisplay').textContent  = `₹${revenue.toLocaleString('en-IN')}`;
  document.getElementById('reviewDisplay').textContent = `${reviews} reviews`;
  document.getElementById('rankDisplay').textContent = `Position #${rank}`;

  // Growth model
  // More patients if low reviews or bad rank
  const reviewBoost  = reviews < 30 ? 0.45 : reviews < 80 ? 0.30 : 0.20;
  const rankBoost    = rank > 5 ? 0.35 : rank > 3 ? 0.20 : 0.12;
  const growthFactor = reviewBoost + rankBoost + 0.05; // outreach base
  const addPatients  = Math.round(patients * growthFactor);
  const addRevenue   = (addPatients * revenue) - PLAN_FEE;
  const roi          = Math.round(((addPatients * revenue) / PLAN_FEE - 1) * 100);

  document.getElementById('addRevOutput').textContent = fmtINR(Math.max(addRevenue, 0));
  document.getElementById('addPatsOutput').textContent = `+${addPatients} patients`;
  document.getElementById('roiOutput').textContent = `${Math.max(roi, 0)}%`;
}

// ── Billing toggle ────────────────────────────────────────────────
function toggleBilling() {
  const annual = document.getElementById('billingToggle').checked;
  const prices = {
    starter: { monthly: '7,999', annual: '6,399' },
    growth:  { monthly: '17,999', annual: '14,399' },
  };
  const k = annual ? 'annual' : 'monthly';
  const sp = document.getElementById('starterPrice');
  const gp = document.getElementById('growthPrice');
  if (sp) sp.textContent = prices.starter[k];
  if (gp) gp.textContent = prices.growth[k];
}

// ── Form submissions ──────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  const btn  = document.getElementById('mainFormBtn');
  const txt  = document.getElementById('mainFormTxt');
  const form = document.getElementById('mainForm');
  const succ = document.getElementById('mainFormSuccess');

  btn.disabled = true;
  txt.textContent = 'Submitting…';

  // Simulate API delay
  setTimeout(() => {
    form.classList.add('hidden');
    succ.classList.remove('hidden');
  }, 1600);
}

// ── Active nav highlighting on scroll ────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObs.observe(s));

// ── Chart bars animate in on scroll ──────────────────────────────
const chartObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.cb-bar').forEach((bar, i) => {
        bar.style.animation = `none`;
        bar.style.height = '0%';
        setTimeout(() => {
          const targetH = bar.style.getPropertyValue('height') || bar.getAttribute('style')?.match(/height:\s*([\d.]+%)/)?.[1] || '50%';
          bar.style.transition = `height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s`;
          bar.style.height = targetH;
        }, 100);
      });
      chartObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.chart-bars').forEach(c => chartObs.observe(c));

// Fix: store original bar heights before zeroing them
document.querySelectorAll('.cb-bar').forEach(bar => {
  const computedH = bar.style.height;
  bar.dataset.targetH = computedH;
  bar.style.height = '0%';
  bar.style.transition = 'none';
});

const chartObs2 = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.cb-bar').forEach((bar, i) => {
        setTimeout(() => {
          bar.style.transition = `height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)`;
          bar.style.height = bar.dataset.targetH;
        }, i * 100 + 200);
      });
      chartObs2.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.dash-chart-area, .chart-bars').forEach(c => chartObs2.observe(c));

// ── Keyboard accessibility for tabs ──────────────────────────────
document.querySelectorAll('.feat-tab').forEach((tab, idx, tabs) => {
  tab.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') switchTab((idx + 1) % tabs.length);
    if (e.key === 'ArrowLeft')  switchTab((idx - 1 + tabs.length) % tabs.length);
  });
});

// ── Init ──────────────────────────────────────────────────────────
updateROI();
// Auto-rotate feature tabs every 8 seconds
let tabIdx = 0;
setInterval(() => {
  tabIdx = (tabIdx + 1) % 4;
  switchTab(tabIdx);
}, 8000);
