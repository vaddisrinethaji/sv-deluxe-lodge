/* ===== app.js — SV New Deluxe Lodge ===== */

// --- Sticky bar on scroll ---
(function () {
  const bar = document.getElementById('stickyBar');
  const hero = document.querySelector('.hero');
  if (!bar || !hero) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      bar.classList.toggle('visible', !entry.isIntersecting);
    },
    { threshold: 0.15 }
  );
  observer.observe(hero);
})();

// --- Scroll-triggered fade-in for sections ---
(function () {
  const targets = document.querySelectorAll(
    '.advantage-card, .persona-card, .trust-quote, .section-title, .section-desc, .section-label'
  );
  targets.forEach(el => el.classList.add('fade-in'));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  targets.forEach(el => io.observe(el));
})();

// --- Staggered animation for location pills ---
(function () {
  const pills = document.querySelectorAll('.location-pill');
  pills.forEach((pill, i) => {
    pill.style.animationDelay = `${0.3 + i * 0.1}s`;
    pill.style.opacity = '0';
    pill.style.animation = `fadeSlideUp 0.5s ease ${0.3 + i * 0.1}s both`;
  });
})();

// --- Smooth anchor scroll for nav links ---
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 60;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// --- Floating call button: hide when CTA section is visible ---
(function () {
  const floatBtn = document.getElementById('floatCallBtn');
  const ctaSection = document.getElementById('contact');
  if (!floatBtn || !ctaSection) return;

  const io = new IntersectionObserver(
    ([entry]) => {
      floatBtn.style.opacity = entry.isIntersecting ? '0' : '1';
      floatBtn.style.pointerEvents = entry.isIntersecting ? 'none' : 'auto';
    },
    { threshold: 0.3 }
  );
  io.observe(ctaSection);
})();

// --- Add subtle tap feedback on CTA buttons ---
document.querySelectorAll('.btn-call, .btn-call-lg, .btn-dir-lg, .btn-call-sm, .btn-directions, .btn-book-hero, .btn-book-sm').forEach(btn => {
  btn.addEventListener('touchstart', function () {
    this.style.transform = 'scale(0.96)';
  }, { passive: true });
  btn.addEventListener('touchend', function () {
    this.style.transform = '';
  }, { passive: true });
});

// ============================================
// LIGHTBOX
// ============================================
function openLightbox(src, caption) {
  const lb = document.getElementById('lightbox');
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxCaption').textContent = caption || '';
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  if (!document.getElementById('bookingModal').classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

// ============================================
// BOOKING MODAL
// ============================================

function openBooking(roomType = '') {
  const modal = document.getElementById('bookingModal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Set min check-in to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('checkIn').min = today;
  document.getElementById('checkOut').min = today;
  
  // Set room type if passed
  if (roomType) {
    const select = document.getElementById('roomType');
    if (select) select.value = roomType;
  }
  
  // Reset to form view
  document.getElementById('bookingForm').style.display = 'flex';
  document.getElementById('bookingSuccess').classList.remove('show');
  setTimeout(() => document.getElementById('guestName').focus(), 300);
}

function closeBooking() {
  const modal = document.getElementById('bookingModal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  resetForm();
}

function handleOverlayClick(e) {
  if (e.target === document.getElementById('bookingModal')) closeBooking();
}

// Close on Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeBooking();
});

// Auto-update checkout min when checkin changes + phone digit filter
document.addEventListener('DOMContentLoaded', function () {
  const checkIn  = document.getElementById('checkIn');
  const checkOut = document.getElementById('checkOut');
  if (checkIn && checkOut) {
    checkIn.addEventListener('change', function () {
      checkOut.min = this.value;
      if (checkOut.value && checkOut.value < this.value) checkOut.value = '';
    });
  }

  // Phone: block all non-digit input in real time
  const phoneInput = document.getElementById('guestPhone');
  if (phoneInput) {
    phoneInput.addEventListener('keydown', function (e) {
      const allowed = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'];
      if (allowed.includes(e.key)) return;
      if (!/^\d$/.test(e.key)) e.preventDefault();
    });
    phoneInput.addEventListener('input', function () {
      // Strip any non-digit that somehow slipped in (paste, autofill, etc.)
      const pos = this.selectionStart;
      const cleaned = this.value.replace(/\D/g, '').slice(0, 10);
      if (this.value !== cleaned) {
        this.value = cleaned;
        this.setSelectionRange(pos - 1, pos - 1);
      }
    });
    phoneInput.addEventListener('paste', function (e) {
      e.preventDefault();
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      const digitsOnly = pasted.replace(/\D/g, '').slice(0, 10);
      this.value = digitsOnly;
    });
  }
});

function resetForm() {
  const form = document.getElementById('bookingForm');
  if (form) form.reset();
  ['guestName','guestPhone','checkIn','checkOut','guests'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });
  ['errName','errPhone','errCheckIn','errCheckOut','errGuests'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function setError(inputId, errId, msg) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  if (input) input.classList.add('error');
  if (err)   err.textContent = msg;
}

function clearError(inputId, errId) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errId);
  if (input) input.classList.remove('error');
  if (err)   err.textContent = '';
}

// Replace this URL with your generated Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';

async function submitBooking(e) {
  e.preventDefault();
  let valid = true;

  const name     = document.getElementById('guestName').value.trim();
  const phone    = document.getElementById('guestPhone').value.trim();
  const checkIn  = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;
  const roomType = document.getElementById('roomType').value;
  const purpose  = document.getElementById('purpose').value;
  const message  = document.getElementById('message').value.trim();

  // Validate name
  if (!name) { setError('guestName','errName','Please enter your full name'); valid = false; }
  else clearError('guestName','errName');

  // Validate phone
  const phoneClean = phone.replace(/\s|-/g,'');
  if (!phone) { setError('guestPhone','errPhone','Please enter your phone number'); valid = false; }
  else if (!/^[6-9]\d{9}$/.test(phoneClean)) { setError('guestPhone','errPhone','Enter a valid 10-digit mobile number'); valid = false; }
  else clearError('guestPhone','errPhone');

  // Validate check-in
  if (!checkIn) { setError('checkIn','errCheckIn','Please select a check-in date'); valid = false; }
  else clearError('checkIn','errCheckIn');

  // Validate check-out
  if (!checkOut) { setError('checkOut','errCheckOut','Please select a check-out date'); valid = false; }
  else if (checkIn && checkOut <= checkIn) { setError('checkOut','errCheckOut','Check-out must be after check-in'); valid = false; }
  else clearError('checkOut','errCheckOut');

  // Validate roomType
  if (!roomType) { setError('roomType','errRoomType','Please select a room type'); valid = false; }
  else clearError('roomType','errRoomType');

  if (!valid) return;

  // Show loading state
  const submitBtn = document.getElementById('submitBtn');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML = 'Booking...';
  submitBtn.disabled = true;

  const submittedAt = new Date().toLocaleString('en-IN');

  // 1. Save to Local Storage (Fallback/Admin view if on same device)
  const booking  = { id: Date.now(), submittedAt, name, phone, checkIn, checkOut, roomType, purpose, message };
  const existing = JSON.parse(localStorage.getItem('sv_bookings') || '[]');
  existing.push(booking);
  localStorage.setItem('sv_bookings', JSON.stringify(existing));

  // 2. Send to Backend API
  try {
    await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
  } catch (error) {
    console.error("Error saving to local server:", error);
  }

  // 3. Send to Google Sheets
  try {
    if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
      const formData = new FormData();
      formData.append('submittedAt', submittedAt);
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('checkIn', checkIn);
      formData.append('checkOut', checkOut);
      formData.append('roomType', roomType);
      formData.append('purpose', purpose);
      formData.append('message', message);

      await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData });
    }
  } catch (error) {
    console.error("Error sending to Google Sheets:", error);
    // Continue anyway to show success to user
  }

  // Restore button state
  submitBtn.innerHTML = originalBtnText;
  submitBtn.disabled = false;

  // Show success
  const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  document.getElementById('successName').textContent     = name;
  document.getElementById('successPhone').textContent    = phone;
  document.getElementById('successCheckIn').textContent  = fmt(checkIn);
  document.getElementById('successCheckOut').textContent = fmt(checkOut);
  document.getElementById('successRoomType').textContent = roomType;

  document.getElementById('bookingForm').style.display = 'none';
  document.getElementById('bookingSuccess').classList.add('show');
}


