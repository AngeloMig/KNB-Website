/* nav scroll bg */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll); onScroll();

/* reveal — staggered CSS transition (.reveal is only hidden when motion is allowed) */
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (Math.min(i, 6) * 0.06) + 's';
});
(() => {
  let revealed = false;
  const revealAll = () => {
    if (revealed) return; revealed = true;
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  };
  requestAnimationFrame(() => requestAnimationFrame(revealAll));
  setTimeout(revealAll, 500); // rAF is paused in hidden tabs — never leave content invisible
})();

/* magnetic buttons — inline transform smoothed by the buttons' own CSS transition */
if (!matchMedia('(hover: none)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.btn, .nav-cta').forEach((btn) => {
    const strength = 0.32;
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * strength;
      const y = (e.clientY - (r.top + r.height / 2)) * strength;
      btn.style.transform = 'translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) scale(1.04)';
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* particles + grid spotlight: shared implementation in ambient.js */

/* form submit — inline validation + Netlify Forms (AJAX, keeps the inline success state) */
const form = document.getElementById('auditForm');
const nameEl = document.getElementById('name');
const emailEl = document.getElementById('email');
const siteEl = document.getElementById('site');
const serviceEl = document.getElementById('service');
const projectDetails = document.getElementById('projectDetails');
const detailsIntro = document.getElementById('detailsIntro');
const detailPanels = projectDetails ? Array.from(projectDetails.querySelectorAll('.detail-panel')) : [];
const servicePicker = document.getElementById('servicePicker');
const serviceCards = servicePicker ? Array.from(servicePicker.querySelectorAll('.service-card')) : [];
const serviceCardErr = document.getElementById('service-card-err');
const timelineField = document.getElementById('timelineField');
const timelineErr = document.getElementById('timeline-err');
const steps = Array.from(form.querySelectorAll('.form-step'));
const stepTabs = Array.from(form.querySelectorAll('.step-tab'));
const summaryList = document.getElementById('requestSummary');
const summaryHint = document.getElementById('summaryHint');
let currentStep = 0;
const emailOK = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
function normalizedUrl(value) {
  const raw = (value || '').trim();
  if (!raw) return '';
  if (/[\s<>]/.test(raw)) return '';
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : 'https://' + raw;
  try {
    const url = new URL(withProtocol);
    if (!/^https?:$/i.test(url.protocol)) return '';
    if (!url.hostname || !url.hostname.includes('.')) return '';
    return url.href;
  } catch (_) {
    return '';
  }
}

function selectedServiceOption() {
  return serviceEl?.selectedOptions?.[0] || null;
}

function selectServiceByValue(value) {
  if (!serviceEl) return;
  const option = Array.from(serviceEl.options).find((opt) => opt.textContent.trim() === value);
  if (!option) return;
  serviceEl.value = option.value || option.textContent;
  serviceEl.dispatchEvent(new Event('change', { bubbles: true }));
}

function syncProjectDetails() {
  if (!serviceEl || !projectDetails) return;
  const key = selectedServiceOption()?.dataset.detail || '';
  const label = selectedServiceOption()?.textContent.trim() || '';
  projectDetails.hidden = !key;
  servicePicker?.classList.toggle('invalid', false);
  if (serviceCardErr) serviceCardErr.hidden = true;
  serviceCards.forEach((card) => {
    const active = card.dataset.serviceOption === label;
    card.classList.toggle('active', active);
    card.setAttribute('aria-checked', active ? 'true' : 'false');
  });
  detailPanels.forEach((panel) => {
    const active = panel.dataset.detailPanel === key;
    panel.classList.toggle('active', active);
    panel.setAttribute('aria-hidden', active ? 'false' : 'true');
    panel.querySelectorAll('input, select, textarea').forEach((control) => {
      control.disabled = !active;
    });
    if (active && detailsIntro) detailsIntro.textContent = panel.dataset.intro || 'A few focused questions help us prepare a useful first reply.';
  });
  updateSummary();
}
serviceEl?.addEventListener('change', syncProjectDetails);
serviceCards.forEach((card, index) => {
  if (!card.id) card.id = 'service-option-' + index;
  card.setAttribute('role', 'menuitemradio');
  card.setAttribute('tabindex', '-1');
  card.addEventListener('click', () => selectServiceByValue(card.dataset.serviceOption));
});
syncProjectDetails();

// project-type dropdown (custom, card-styled)
(function () {
  const ddWrap = document.getElementById('serviceDD');
  const ddTrigger = document.getElementById('serviceDDTrigger');
  const ddIcon = document.getElementById('ddIcon');
  const ddTitle = document.getElementById('ddTitle');
  const ddSub = document.getElementById('ddSub');
  if (!ddWrap || !ddTrigger) return;
  const activeIndex = () => Math.max(0, serviceCards.findIndex((c) => c.classList.contains('active')));
  const focusCard = (index) => {
    if (!serviceCards.length) return;
    const next = (index + serviceCards.length) % serviceCards.length;
    serviceCards[next].focus();
  };
  const close = (returnFocus) => {
    ddWrap.classList.remove('open');
    ddTrigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) ddTrigger.focus({ preventScroll: true });
  };
  const open = (focus) => {
    ddWrap.classList.add('open');
    ddTrigger.setAttribute('aria-expanded', 'true');
    if (focus) requestAnimationFrame(() => focusCard(activeIndex()));
  };
  const updateTrigger = () => {
    const active = serviceCards.find((c) => c.classList.contains('active'));
    if (active) {
      ddIcon.innerHTML = active.querySelector('.svc-ic').innerHTML;
      ddTitle.textContent = active.querySelector('b').textContent;
      ddSub.textContent = active.querySelector('small').textContent;
      ddTrigger.classList.add('has-value');
      ddTrigger.classList.remove('invalid');
    } else {
      ddTitle.textContent = 'Select a project type';
      ddSub.textContent = 'Pick what you need help with';
      ddTrigger.classList.remove('has-value');
    }
  };
  ddTrigger.addEventListener('click', (e) => { e.stopPropagation(); ddWrap.classList.contains('open') ? close(false) : open(false); });
  ddTrigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      open(true);
    }
  });
  serviceCards.forEach((c) => {
    c.addEventListener('click', () => close(false));
    c.addEventListener('keydown', (e) => {
      const current = serviceCards.indexOf(c);
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); focusCard(current + 1); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); focusCard(current - 1); }
      else if (e.key === 'Home') { e.preventDefault(); focusCard(0); }
      else if (e.key === 'End') { e.preventDefault(); focusCard(serviceCards.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectServiceByValue(c.dataset.serviceOption);
        close(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      } else if (e.key === 'Tab') {
        close(false);
      }
    });
  });
  serviceEl?.addEventListener('change', updateTrigger);
  document.addEventListener('click', (e) => { if (!ddWrap.contains(e.target)) close(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(false); });
  updateTrigger();
})();

document.querySelectorAll('.check-card input[type="checkbox"]').forEach((box) => {
  const sync = () => box.closest('.check-card')?.classList.toggle('is-checked', box.checked);
  box.addEventListener('change', sync);
  sync();
});

// per-project-type timeline question + options (rendered into #timeList)
const TI = {
  zap: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>',
  cal: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>',
  clock: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  compass: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg>'
};
const LAUNCH = [
  { v: 'As soon as possible', l: 'ASAP', s: 'Ready to start now', i: 'zap' },
  { v: 'Within 1–3 months', l: '1–3 months', s: 'Planning ahead', i: 'cal' },
  { v: 'In 3–6 months', l: '3–6 months', s: 'Mapping it out', i: 'clock' },
  { v: 'Just exploring', l: 'Just exploring', s: 'Gathering ideas', i: 'compass' }
];
const MAINT = [
  { v: 'Right away', l: 'Right away', s: 'Something needs attention now', i: 'zap' },
  { v: 'Within a few days', l: 'Within a few days', s: 'Soon, not an emergency', i: 'cal' },
  { v: 'Ongoing / monthly care', l: 'Ongoing care', s: 'Regular monthly support', i: 'clock' },
  { v: 'Just planning ahead', l: 'Just planning', s: 'Lining up support for later', i: 'compass' }
];
const ADVICE = [
  { v: 'Ready to start soon', l: 'Soon', s: 'Ready to move once I decide', i: 'zap' },
  { v: 'Next few months', l: 'Next few months', s: 'Planning the next step', i: 'cal' },
  { v: 'Later this year', l: 'Later this year', s: 'Further out', i: 'clock' },
  { v: 'Just researching', l: 'Just researching', s: 'Gathering information', i: 'compass' }
];
const TIMING = {
  'shopify-revamp': { q: 'When do you want the revamp live?', o: LAUNCH },
  'new-shopify': { q: 'When do you want to launch the store?', o: LAUNCH },
  'wordpress': { q: 'When do you want the site live?', o: LAUNCH },
  'webflow': { q: 'When do you want the site live?', o: LAUNCH },
  'business': { q: 'When do you want the new site live?', o: LAUNCH },
  'custom-app': { q: 'When do you want to start the build?', o: LAUNCH },
  'maintenance': { q: 'How soon do you need help?', o: MAINT },
  'advice': { q: 'What’s your timeframe?', o: ADVICE },
  '': { q: 'When do you want to launch?', o: LAUNCH }
};
function setTimelineError(show) {
  if (!timelineField) return;
  timelineField.classList.toggle('invalid', show);
  if (timelineErr) timelineErr.hidden = !show;
}
function renderTiming() {
  const list = document.getElementById('timeList');
  const qEl = document.getElementById('timingQ');
  if (!list || !qEl) return;
  const key = selectedServiceOption()?.dataset.detail || '';
  const cfg = TIMING[key] || TIMING[''];
  const prev = form.querySelector('input[name="timeline"]:checked')?.value;
  qEl.textContent = cfg.q;
  list.innerHTML = cfg.o.map((o) =>
    '<label class="time-row"><input type="radio" name="timeline" value="' + o.v + '"' + (o.v === prev ? ' checked' : '') + '>' +
    '<span class="tr-ic">' + TI[o.i] + '</span>' +
    '<span class="tr-t"><b>' + o.l + '</b><small>' + o.s + '</small></span>' +
    '<span class="tr-radio" aria-hidden="true"></span></label>'
  ).join('');
  list.setAttribute('aria-describedby', 'timeline-err');
  list.querySelectorAll('.time-row').forEach((el) => el.classList.toggle('is-checked', !!el.querySelector('input')?.checked));
  setTimelineError(false);
  updateSummary();
}
serviceEl?.addEventListener('change', renderTiming);

// is-checked toggle for timeline rows + contact pills (delegated, survives re-render)
form.addEventListener('change', (e) => {
  if (e.target && e.target.matches && e.target.matches('.time-row input[type="radio"], .time-seg input[type="radio"]')) {
    document.querySelectorAll('.time-row, .time-seg').forEach((el) => {
      el.classList.toggle('is-checked', !!el.querySelector('input')?.checked);
    });
    if (e.target.matches('.time-row input[type="radio"]')) setTimelineError(false);
  }
});
document.querySelectorAll('.time-row, .time-seg').forEach((el) => {
  el.classList.toggle('is-checked', !!el.querySelector('input')?.checked);
});
renderTiming();

form.addEventListener('input', updateSummary);
form.addEventListener('change', updateSummary);

function showStep(index) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, i) => step.classList.toggle('active', i === currentStep));
  stepTabs.forEach((tab, i) => {
    tab.classList.toggle('active', i === currentStep);
    tab.setAttribute('aria-current', i === currentStep ? 'step' : 'false');
  });
  updateSummary();
}

function validStep(index) {
  if (index === 0) return validate();
  if (index === 1 && !selectedServiceOption()?.dataset.detail) {
    servicePicker?.classList.add('invalid');
    document.getElementById('serviceDDTrigger')?.classList.add('invalid');
    if (serviceCardErr) serviceCardErr.hidden = false;
    document.getElementById('serviceDD')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return false;
  }
  if (index === 2 && !form.querySelector('input[name="timeline"]:checked')) {
    setTimelineError(true);
    timelineField?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return false;
  }
  return true;
}

form.querySelectorAll('[data-next-step]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (!validStep(currentStep)) return;
    showStep(currentStep + 1);
  });
});
form.querySelectorAll('[data-prev-step]').forEach((btn) => {
  btn.addEventListener('click', () => showStep(currentStep - 1));
});
stepTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = Number(tab.dataset.stepTarget || 0);
    if (target > currentStep) {
      for (let i = currentStep; i < target; i += 1) {
        if (!validStep(i)) { showStep(i); return; }
      }
    }
    showStep(target);
  });
});

function readActiveDetails() {
  const panel = document.querySelector('.detail-panel.active');
  if (!panel) return 'Not selected yet';
  const values = [];
  panel.querySelectorAll('input, select, textarea').forEach((el) => {
    if (el.disabled) return;
    if (el.type === 'checkbox') {
      if (el.checked) values.push(el.value);
      return;
    }
    if (el.tagName === 'SELECT') {
      const text = el.selectedOptions[0]?.textContent.trim();
      if (text && text !== 'Select one…') values.push(text);
      return;
    }
    if (el.value.trim()) values.push(el.value.trim());
  });
  return values.slice(0, 4).join(', ') || 'Details pending';
}

function updateSummary() {
  if (!summaryList) return;
  const service = selectedServiceOption()?.dataset.detail ? selectedServiceOption().textContent.trim() : 'Not selected yet';
  const timeline = form.querySelector('input[name="timeline"]:checked')?.value || 'Not selected yet';
  const contact = form.querySelector('input[name="preferred_contact"]:checked')?.value;
  const site = document.getElementById('site')?.value.trim() || 'No URL added';
  const notes = document.getElementById('message')?.value.trim();
  const rows = [
    ['Service', service],
    ['Current URL', site],
    ['Details', readActiveDetails()],
    ['Timeline', timeline]
  ];
  if (contact) rows.push(['Preferred contact', contact]);
  if (notes) rows.push(['Extra notes', notes]);
  const esc = (s) => s.replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
  const PENDING = ['Not selected yet', 'No URL added', 'Details pending', ''];
  summaryList.innerHTML = rows.map(([k, v]) => {
    const pend = PENDING.indexOf(v) !== -1;
    return '<li class="' + (pend ? 'is-pending' : 'is-filled') + '"><span class="sl-k"><i class="sl-dot"></i>' + k + '</span><b>' + esc(v) + '</b></li>';
  }).join('');
  // live readiness badge — reflects whether the form can actually be sent
  const isAudit = form.classList.contains('mode-audit');
  const siteValue = siteEl ? siteEl.value.trim() : '';
  const siteReady = !!siteValue && !!normalizedUrl(siteValue);
  const optionalSiteOk = !siteValue || !!normalizedUrl(siteValue);
  const core = isAudit ? [
    !!(nameEl && nameEl.value.trim()),
    emailOK(emailEl ? emailEl.value.trim() : ''),
    siteReady
  ] : [
    !!(nameEl && nameEl.value.trim()),
    emailOK(emailEl ? emailEl.value.trim() : ''),
    !!selectedServiceOption()?.dataset.detail,
    !!form.querySelector('input[name="timeline"]:checked')
  ];
  const done = core.filter(Boolean).length;
  const ready = done === core.length && optionalSiteOk;
  const badge = document.getElementById('summaryReady');
  if (badge) {
    badge.classList.toggle('is-ready', ready);
    badge.textContent = !optionalSiteOk ? 'Fix URL' : (ready ? 'Ready to send' : (done + ' of ' + core.length + ' ready'));
  }
  summaryList.closest('.request-summary')?.classList.toggle('is-ready', ready);
  if (summaryHint) {
    summaryHint.textContent = !optionalSiteOk
      ? 'The URL looks off. Use a full website address, or a simple domain like yourstore.com.'
      : (ready
        ? 'Quick review: make sure these details are right, then send. We will reply with the clearest next step.'
        : 'Complete the required details, then quickly review everything before sending.');
  }
}
showStep(0);

/* Mode toggle — Free website review (short) vs Start a project (full multi-step) */
(function () {
  const formMode = document.getElementById('formMode');
  const requestType = document.getElementById('requestType');
  const step0 = form.querySelector('.form-step[data-step="0"]');
  const step2 = form.querySelector('.form-step[data-step="2"]');
  const formActions = step2 ? step2.querySelector('.form-actions') : null;
  const submitBtn = formActions ? formActions.querySelector('button[type="submit"]') : null;
  const heading = document.querySelector('.contact h1');
  const lead = document.querySelector('.contact .lead');
  if (!formMode || !formActions || !step0 || !step2) return;

  const COPY = {
    audit: {
      h: 'Get a free website review.',
      lead: "Send us your current site and we'll take a quick look — then reply with the clearest next step. No pressure, no cost.",
      btn: 'Send my free review request',
      type: 'Free website review'
    },
    project: {
      h: heading ? heading.textContent : "Let's build something that works.",
      lead: lead ? lead.textContent : '',
      btn: 'Start my project',
      type: 'Project enquiry'
    }
  };

  function setMode(mode, focus) {
    const audit = mode === 'audit';
    form.classList.toggle('mode-audit', audit);
    // relocate the shared reCAPTCHA + submit block so it's reachable in both modes
    if (audit) { step0.appendChild(formActions); } else if (formActions.parentElement !== step2) { step2.appendChild(formActions); }
    if (submitBtn) submitBtn.innerHTML = '<span class="dot"></span>' + (audit ? COPY.audit.btn : COPY.project.btn);
    if (requestType) requestType.value = audit ? COPY.audit.type : COPY.project.type;
    formMode.querySelectorAll('.fm-btn').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === mode ? 'true' : 'false'));
    if (heading) heading.textContent = audit ? COPY.audit.h : COPY.project.h;
    if (lead) lead.textContent = audit ? COPY.audit.lead : COPY.project.lead;
    const siteLabel = document.querySelector('[data-audit-label]');
    if (siteLabel) siteLabel.textContent = audit ? '(required)' : '(optional)';
    if (siteEl) siteEl.setAttribute('aria-required', audit ? 'true' : 'false');
    showStep(0);
    if (focus) { const f = document.getElementById('name'); if (f) f.focus({ preventScroll: true }); }
  }

  formMode.querySelectorAll('.fm-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      setMode(mode, true);
      // keep other params (e.g. ?addons= carried from pricing) intact
      const params = new URLSearchParams(location.search);
      if (mode === 'audit') params.set('type', 'audit'); else params.delete('type');
      const qs = params.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    });
  });

  const param = (new URLSearchParams(location.search).get('type') || '').toLowerCase();
  setMode(param === 'audit' ? 'audit' : 'project', false);
})();

function setError(el, show) {
  const field = el.closest('.field');
  field.classList.toggle('invalid', show);
  const err = field.querySelector('.field-error');
  if (err) err.hidden = !show;
  el.setAttribute('aria-invalid', show ? 'true' : 'false');
}
// clear an error as soon as the user fixes the field
nameEl.addEventListener('input', () => { if (nameEl.value.trim()) setError(nameEl, false); });
emailEl.addEventListener('input', () => { if (emailOK(emailEl.value.trim())) setError(emailEl, false); });
siteEl?.addEventListener('input', () => { if (normalizedUrl(siteEl.value)) setError(siteEl, false); updateSummary(); });
siteEl?.addEventListener('blur', () => {
  const url = normalizedUrl(siteEl.value);
  if (url) siteEl.value = url;
  updateSummary();
});

function validate() {
  const isAudit = form.classList.contains('mode-audit');
  const nameBad = !nameEl.value.trim();
  const emailBad = !emailOK(emailEl.value.trim());
  const siteValue = siteEl ? siteEl.value.trim() : '';
  const siteUrl = normalizedUrl(siteValue);
  const siteBad = (isAudit && !siteValue) || (!!siteValue && !siteUrl);
  setError(nameEl, nameBad);
  setError(emailEl, emailBad);
  setError(siteEl, siteBad);
  if (!siteBad && siteUrl) siteEl.value = siteUrl;
  const firstBad = nameBad ? nameEl : (emailBad ? emailEl : (siteBad ? siteEl : null));
  if (firstBad) firstBad.focus();
  return !nameBad && !emailBad && !siteBad;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const isAudit = form.classList.contains('mode-audit');
  if (!validate()) { if (!isAudit) showStep(0); return; }
  if (!isAudit && !selectedServiceOption()?.dataset.detail) { showStep(1); validStep(1); return; }
  if (!isAudit && !form.querySelector('input[name="timeline"]:checked')) { showStep(2); validStep(2); return; }
  // require reCAPTCHA when Netlify has rendered it (only renders on the deployed Netlify site)
  const rc = document.getElementById('recaptcha-err');
  if (window.grecaptcha && typeof grecaptcha.getResponse === 'function') {
    if (!grecaptcha.getResponse()) { if (rc) { rc.hidden = false; rc.scrollIntoView({ block: 'center', behavior: 'smooth' }); } return; }
    if (rc) rc.hidden = true;
  }
  const btn = form.querySelector('button[type="submit"]');
  const sendErr = document.getElementById('sendError');
  if (sendErr) sendErr.hidden = true;
  if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }
  let settled = false;
  const showSuccess = () => {
    if (settled) return; settled = true;
    form.style.display = 'none';
    const s = document.getElementById('formSuccess');
    s.classList.add('show');
    s.focus();
  };
  // only claim "sent" when the POST actually succeeded — otherwise re-enable
  // the button and offer the direct email fallback so the lead isn't lost
  const showError = () => {
    if (settled) return; settled = true;
    if (btn) { btn.disabled = false; btn.style.opacity = ''; }
    if (sendErr) { sendErr.hidden = false; sendErr.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  };
  const hangTimer = setTimeout(showError, 10000); // network hang → let the user retry
  // send to Netlify Forms (URL-encoded POST to the current page)
  fetch(location.pathname || '/contact.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
    .then((res) => { clearTimeout(hangTimer); if (res.ok) showSuccess(); else showError(); })
    .catch(() => { clearTimeout(hangTimer); showError(); });
});

/* footer "Back to top" (href="#top" is the no-JS fallback) */
(function () {
  var up = document.querySelector('.foot-up');
  if (!up) return;
  up.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
})();

// Carry selected add-ons from the pricing popup (?addons=A, B, C) into the form.
(function () {
  var raw = new URLSearchParams(location.search).get('addons');
  if (!raw) { return; }
  var items = raw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
  if (!items.length) { return; }
  var field = document.getElementById('addonsField');
  if (field) { field.value = items.join(', '); }
  var box = document.getElementById('addonsSummary');
  var chips = document.getElementById('addonsChips');
  if (box && chips) {
    items.forEach(function (x) {
      var c = document.createElement('span');
      c.className = 'as-chip';
      c.textContent = x;
      chips.appendChild(c);
    });
    box.hidden = false;
  }
})();
