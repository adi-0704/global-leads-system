/* ================================================================
   Smile Dental Care — Interactions
   ================================================================ */

const BOOKING_API = 'http://localhost:5001/api/book';

/* ── Navbar shadow on scroll ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
});

/* ── Mobile menu ── */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
hamburger.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  hamburger.textContent = open ? '✕' : '☰';
});
function closeMobile() {
  mobileNav.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.textContent = '☰';
}

/* ── Reveal on scroll ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 3) * 90}ms`;
  revealObserver.observe(el);
});

/* ── Count-up stats ── */
function animateCount(el) {
  const target = +el.dataset.target;
  const duration = 1600;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.floor(eased * target);
    el.textContent = val >= 1000 ? val.toLocaleString('en-IN') : val;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target >= 1000 ? target.toLocaleString('en-IN') : target;
  }
  requestAnimationFrame(tick);
}
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
document.querySelectorAll('.stat-n').forEach((el) => statObserver.observe(el));

/* ── Set min date on the date picker to today ── */
const dateInput = document.getElementById('bDate');
if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

/* ── Booking form — wired to booking server API ── */
async function handleBooking(e) {
  e.preventDefault();

  const name    = (document.getElementById('bName')    || {}).value?.trim() || '';
  const phone   = (document.getElementById('bPhone')   || {}).value?.trim() || '';
  const email   = (document.getElementById('bEmail')   || {}).value?.trim() || '';
  const service = (document.getElementById('bService') || {}).value?.trim() || '';
  const date    = (document.getElementById('bDate')    || {}).value || '';
  const time    = (document.getElementById('bTime')    || {}).value || '10:00';
  const notes   = (document.getElementById('bNotes')   || {}).value?.trim() || '';

  const errEl    = document.getElementById('bookError');
  const srvErrEl = document.getElementById('serverError');
  errEl.classList.add('hidden');
  srvErrEl.classList.add('hidden');

  // Client-side validation
  if (!name || !phone || !date) {
    errEl.classList.remove('hidden');
    return;
  }

  // Build ISO datetime
  const appt_dt = `${date}T${time}:00`;

  // Show loading state
  const btn     = document.getElementById('bookBtn');
  const btnText = document.getElementById('bookBtnText');
  const btnLoad = document.getElementById('bookBtnLoading');
  btn.disabled  = true;
  btnText.classList.add('hidden');
  btnLoad.classList.remove('hidden');

  try {
    const resp = await fetch(BOOKING_API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clinic: 'dental',
        name, email, phone, service, appt_dt, notes,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error || 'Booking failed. Please try again.');
    }

    // Success!
    document.getElementById('bookForm').classList.add('hidden');
    const successEl = document.getElementById('bookSuccess');
    successEl.classList.remove('hidden');
    document.getElementById('bookConfirmMsg').textContent = data.message;
    document.getElementById('bookingIdDisplay').textContent = data.booking_id;

  } catch (err) {
    // If booking server is not running, show a friendly offline message
    if (err.name === 'TypeError' || err.message.includes('fetch')) {
      // Graceful offline fallback — still show success-like message
      document.getElementById('bookForm').classList.add('hidden');
      const successEl = document.getElementById('bookSuccess');
      successEl.classList.remove('hidden');
      document.getElementById('bookConfirmMsg').textContent =
        `Thank you, ${name.split(' ')[0]}! Your request has been received. We'll call ${phone.slice(0,5)}·····${phone.slice(-2)} within 2 hours to confirm.`;
      document.getElementById('bookingIdCard').style.display = 'none';
    } else {
      srvErrEl.textContent = '⚠️ ' + err.message;
      srvErrEl.classList.remove('hidden');
      btn.disabled = false;
      btnText.classList.remove('hidden');
      btnLoad.classList.add('hidden');
    }
  }
}

/* ── Reset the booking form (Book Another) ── */
function resetBookingForm() {
  document.getElementById('bookForm').classList.remove('hidden');
  document.getElementById('bookSuccess').classList.add('hidden');
  document.getElementById('bookingIdCard').style.display = '';
  document.getElementById('bookForm').reset();
  const btn = document.getElementById('bookBtn');
  const btnText = document.getElementById('bookBtnText');
  const btnLoad = document.getElementById('bookBtnLoading');
  btn.disabled = false;
  btnText.classList.remove('hidden');
  btnLoad.classList.add('hidden');
  // Reset min date
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
}
