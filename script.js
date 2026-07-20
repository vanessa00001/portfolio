(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- footer year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
  function openMenu() {
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      if (menu.classList.contains('open')) closeMenu(); else openMenu();
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  /* ---------- scroll progress ---------- */
  var bar = document.getElementById('progress');
  var totop = document.getElementById('totop');
  function onScroll() {
    var st = window.pageYOffset || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    if (totop) totop.classList.toggle('show', st > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (totop) {
    totop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- active nav ---------- */
  var navLinks = [].slice.call(document.querySelectorAll('.nav-links a'));
  var byId = {};
  navLinks.forEach(function (a) {
    var id = a.getAttribute('href').replace('#', '');
    byId[id] = a;
  });
  var sections = Object.keys(byId).map(function (id) { return document.getElementById(id); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('active'); });
          var link = byId[en.target.id];
          if (link) link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById('cform');
  var msg = document.getElementById('cmsg');
  function setErr(name, text) {
    var field = form.querySelector('[name="' + name + '"]');
    var slot = form.querySelector('.ferr[data-for="' + name + '"]');
    if (slot) slot.textContent = text || '';
    if (field) {
      if (text) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function showMsg(kind, text) {
    if (!msg) return;
    msg.className = 'cmsg ' + kind;
    msg.textContent = text;
  }
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();
      var ok = true;
      setErr('name', ''); setErr('email', ''); setErr('message', '');
      if (!name) { setErr('name', 'Please add your name.'); ok = false; }
      if (!email) { setErr('email', 'Please add your email.'); ok = false; }
      else if (!validEmail(email)) { setErr('email', 'That email does not look right.'); ok = false; }
      if (!message) { setErr('message', 'Add a line about what you need.'); ok = false; }
      if (!ok) { showMsg('err', 'Please fix the highlighted fields and try again.'); return; }

      var btn = form.querySelector('button[type=submit]');
      var label = btn.textContent;
      btn.textContent = 'Sending...'; btn.disabled = true;
      if (msg) { msg.className = 'cmsg'; msg.textContent = ''; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (r) {
        if (r.ok) {
          form.reset();
          form.style.display = 'none';
          showMsg('ok', 'Thanks, your message is on its way. I will reply to the email you provided.');
        } else {
          btn.textContent = label; btn.disabled = false;
          showMsg('err', 'Something went wrong sending that. Please email nesxia0494@gmail.com directly.');
        }
      }).catch(function () {
        btn.textContent = label; btn.disabled = false;
        showMsg('err', 'Something went wrong sending that. Please email nesxia0494@gmail.com directly.');
      });
    });
    ['name', 'email', 'message'].forEach(function (n) {
      var f = form.querySelector('[name="' + n + '"]');
      if (f) f.addEventListener('input', function () { setErr(n, ''); });
    });
  }

  /* ---------- copy email ---------- */
  var cp = document.getElementById('copyEmail');
  if (cp) {
    cp.addEventListener('click', function () {
      var email = 'nesxia0494@gmail.com';
      function done() {
        var t = cp.textContent; cp.textContent = 'Copied';
        setTimeout(function () { cp.textContent = t; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () { window.prompt('Copy this email:', email); });
      } else { window.prompt('Copy this email:', email); }
    });
  }

  /* ---------- interactive automation demo ---------- */
  var DEMO = [
    {
      title: 'Manual order processing',
      now: 'Orders arrive by email, storefront, EDI, and portal, and someone re-keys each one across CRM, ERP, inventory, and fulfillment. It runs 10 to 15 minutes per order, with entry errors and delays.',
      opp: 'Read every order automatically, validate it, and let the systems create and track it end to end. People step in only for the exceptions.',
      systems: 'n8n, Workato, CRM, ERP, inventory, fulfillment',
      benefits: 'Faster processing, fewer entry errors, real-time visibility, team focused on exceptions',
      steps: [
        ['Order received', 'auto', 'A new order lands from any channel, email, storefront, EDI, or portal, and the workflow picks it up automatically, with nobody re-keying it.'],
        ['Read + validate', 'auto', 'AI reads the order and extracts customer, SKUs, quantities, and terms, then confirms the data is complete and not a duplicate before anything moves downstream.'],
        ['Update CRM', 'auto', 'The customer record is created or updated in the CRM, so contact, account, and order history stay accurate and in one place.'],
        ['Create ERP order', 'auto', 'A sales order is created in the ERP with the validated line items, pricing, and terms, ready for finance and fulfillment.'],
        ['Check inventory', 'auto', 'Stock is checked and reserved against the order, so you commit only what you can actually ship.'],
        ['Trigger fulfillment', 'auto', 'The warehouse or 3PL is triggered to pick, pack, and ship, and tracking flows back onto the order automatically.'],
        ['Notify customer', 'auto', 'The customer receives an automatic confirmation and shipping update, so nobody sends status emails by hand.'],
        ['Review stock / pricing exception', 'human', 'When stock is short or pricing does not match, the order is routed to a person with full context to decide, instead of failing silently.']
      ]
    },
    {
      title: 'Repetitive customer inquiries',
      now: 'The same questions come in across email, chat, and social. Agents answer them by hand, and coverage stops outside business hours.',
      opp: 'Classify each inquiry, answer common ones from a trusted knowledge source, and escalate only the genuinely complex cases.',
      systems: 'AI classifier, knowledge base, CRM, helpdesk',
      benefits: '24/7 coverage, faster replies, agents freed for high-value cases',
      steps: [
        ['Inquiry received', 'auto', 'A message arrives through email, chat, or social, and the workflow captures it the moment it comes in, day or night.'],
        ['Classify intent', 'auto', 'AI reads the message and identifies what the customer actually wants, so it can be handled the right way from the start.'],
        ['Match knowledge + CRM', 'auto', 'The request is matched against your knowledge base and the customer CRM record for accurate, personalized context.'],
        ['Answer if confident', 'auto', 'When the answer is clear and confidence is high, the customer gets a correct reply straight away, with no wait.'],
        ['Create ticket / lead', 'auto', 'If it needs tracking or it is a sales opportunity, a ticket or lead is created automatically and routed to the right queue.'],
        ['Escalate complex case', 'human', 'Genuinely complex or sensitive cases go to a person, with the full conversation and context attached so they can pick up fast.']
      ]
    },
    {
      title: 'Slow invoice approvals',
      now: 'Finance opens each invoice, keys the data, checks the PO, chases approvals by email, and tracks status in spreadsheets.',
      opp: 'Read each invoice, match it to the purchase order and receipt, and route only the exceptions for a human decision.',
      systems: 'n8n, Workato, ERP, approval workflow',
      benefits: 'Faster approvals, fewer duplicate payments, fewer late fees, clean audit trail',
      steps: [
        ['Invoice received', 'auto', 'An invoice arrives by email, shared folder, or vendor portal, and the workflow ingests it automatically.'],
        ['Extract data', 'auto', 'AI pulls the vendor, invoice and PO numbers, dates, line items, tax, and total, flagging anything missing, duplicated, or unusual.'],
        ['Validate supplier', 'auto', 'The supplier is checked against the ERP to confirm it is a known, approved vendor before the invoice moves forward.'],
        ['Match PO + receipt', 'auto', 'The invoice is matched to its purchase order and goods receipt, so you only pay for what was ordered and received.'],
        ['Approve or route exception', 'human', 'Clean invoices continue automatically; anything outside the rules is routed to the right approver with the detail they need to decide.'],
        ['Post to ERP', 'auto', 'Once cleared, the invoice record is created in the ERP and queued for payment, with no manual entry.'],
        ['Update status + notify', 'auto', 'Payment status is updated and finance or the supplier is notified, so nobody chases the invoice by email.']
      ]
    },
    {
      title: 'Disconnected executive reporting',
      now: 'Someone pulls numbers from several systems by hand each week and rebuilds the same dashboards and summaries.',
      opp: 'Consolidate the data on a schedule, refresh dashboards automatically, and summarize what changed in plain language.',
      systems: 'ERP, CRM, ops data, BI dashboard, AI summary',
      benefits: 'Current numbers with no analyst effort, exceptions surfaced early',
      steps: [
        ['Pull from source systems', 'auto', 'On a schedule, the workflow pulls the latest numbers from ERP, CRM, operations, and finance, so nobody exports spreadsheets by hand.'],
        ['Validate + transform', 'auto', 'The data is cleaned, reconciled, and shaped into consistent metrics you can trust across systems.'],
        ['Refresh dashboard', 'auto', 'The live dashboard refreshes automatically, so leadership always sees the current picture rather than last week.'],
        ['Write AI summary', 'auto', 'AI writes a short plain-language summary of what changed and why it matters, not just charts.'],
        ['Send to leadership', 'auto', 'The summary and dashboard link go to leadership on a set cadence, by email or Teams.'],
        ['Review flagged breach', 'human', 'When a metric crosses a threshold, it is flagged for a person to review and act on before it becomes a problem.']
      ]
    },
    {
      title: 'Manual lead follow-up',
      now: 'Leads arrive from forms, email, and events, and follow-up depends on someone remembering to act in time.',
      opp: 'Capture, qualify, and route every lead automatically, with timely follow-up that never gets missed.',
      systems: 'Web forms, CRM, enrichment, email sequencing',
      benefits: 'No missed leads, consistent follow-up, faster response, better conversion',
      steps: [
        ['Lead received', 'auto', 'A new lead arrives from a form, email, or event, and the workflow captures it instantly so nothing slips through.'],
        ['Enrich + score', 'auto', 'The lead is enriched with firmographic detail and scored against your criteria, so the best-fit ones surface first.'],
        ['Create CRM record', 'auto', 'A clean CRM record is created with all the context attached, ready for the owner to work.'],
        ['Assign owner', 'auto', 'The lead is routed to the right owner by territory, product, or round-robin, with no manual triage.'],
        ['Send timely follow-up', 'auto', 'A timely first touch goes out automatically, so leads are engaged while they are still warm.'],
        ['Review high-value lead', 'human', 'High-value or complex leads are flagged for a person to step in and personalize the approach.']
      ]
    },
    {
      title: 'Manual employee onboarding',
      now: 'A new hire means someone manually creating accounts, granting access, ordering equipment, and scheduling training across HR, IT, and finance systems, often inconsistently and late.',
      opp: 'Trigger the whole onboarding sequence from a single approved hire: provision accounts and access automatically, and route only sensitive decisions to a person.',
      systems: 'HRIS, ERP, identity and access, IT service desk',
      benefits: 'Productive from day one, consistent access, less IT effort, nothing missed',
      steps: [
        ['Hire approved', 'auto', 'An approved hire in the HRIS kicks off the whole sequence, with no manual ticket to raise.'],
        ['Create records', 'auto', 'The employee record is created across HRIS and ERP so payroll, org, and reporting stay consistent from day one.'],
        ['Provision accounts', 'auto', 'Email, accounts, and core tools are set up automatically to a standard template for the role.'],
        ['Grant role-based access', 'auto', 'Access is granted by role, so the new hire gets exactly what the role needs and nothing more.'],
        ['Order equipment', 'auto', 'Laptop and equipment requests are raised to IT and procurement automatically.'],
        ['Schedule onboarding', 'auto', 'Orientation, training, and the first-week schedule are booked and shared with the hire and manager.'],
        ['Review elevated access', 'human', 'Requests for sensitive or elevated access are routed to a person to approve, so security stays deliberate.']
      ]
    }
  ];

  var pick = document.getElementById('demoPick');
  var panel = document.getElementById('demoPanel');
  var currentSteps = [];

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function renderDemo(i) {
    var c = DEMO[i];
    currentSteps = c.steps;
    var flow = c.steps.map(function (s, idx) {
      var last = idx === c.steps.length - 1;
      var label = s[1] === 'human' ? 'human review' : 'automated';
      var conn = last ? '' : '<span class="fconn" aria-hidden="true"></span>';
      return '<span class="fgroup">' +
               '<button type="button" class="fstep ' + s[1] + '" data-i="' + idx + '" aria-expanded="false" aria-controls="flowDetail">' +
                 '<span class="dot" aria-hidden="true"></span>' +
                 '<span class="ftext">' + esc(s[0]) + '</span>' +
                 '<span class="sr-only"> (' + label + ', show explanation)</span>' +
               '</button>' + conn +
             '</span>';
    }).join('');
    panel.innerHTML =
      '<h3 class="demo-panel-title">' + esc(c.title) + '</h3>' +
      '<div class="demo-card now"><div class="dc-k">Current process</div><p>' + esc(c.now) + '</p></div>' +
      '<div class="demo-card"><div class="dc-k">Automation opportunity</div><p>' + esc(c.opp) + '</p></div>' +
      '<div class="demo-flow"><div class="dc-k">Proposed workflow</div>' +
        '<p class="flow-hint">Click any step to see what happens.</p>' +
        '<div class="flow-steps">' + flow + '</div>' +
        '<div class="flow-detail empty" id="flowDetail" role="region" aria-live="polite">Select a step above to see a short explanation of what happens there.</div>' +
        '<div class="demo-legend"><span><span class="dot auto"></span>Automated</span><span><span class="dot human"></span>Human review</span></div>' +
      '</div>' +
      '<div class="demo-meta">' +
        '<div class="m"><b>Systems involved</b>' + esc(c.systems) + '</div>' +
        '<div class="m"><b>Expected operational benefit</b>' + esc(c.benefits) + '</div>' +
      '</div>';
    [].slice.call(pick.children).forEach(function (b, bi) {
      b.setAttribute('aria-selected', bi === i ? 'true' : 'false');
      b.tabIndex = bi === i ? 0 : -1;
    });
    startSweep();
  }

  function selectStep(idx) {
    stopSweep();
    var steps = [].slice.call(panel.querySelectorAll('.fstep'));
    steps.forEach(function (s) {
      var on = +s.getAttribute('data-i') === idx;
      s.classList.toggle('selected', on);
      s.classList.remove('active');
      s.setAttribute('aria-expanded', on ? 'true' : 'false');
    });
    var st = currentSteps[idx];
    var detail = document.getElementById('flowDetail');
    if (!st || !detail) return;
    var kind = st[1] === 'human' ? 'human' : 'auto';
    var badge = st[1] === 'human' ? 'Human review' : 'Automated';
    detail.classList.remove('empty');
    detail.innerHTML =
      '<div class="fd-head"><span class="fd-badge ' + kind + '">' + badge + '</span>' +
      '<span class="fd-title">' + esc(st[0]) + '</span></div>' +
      '<p class="fd-text">' + esc(st[2] || '') + '</p>';
  }

  var sweepTimer = null;
  function startSweep() {
    if (sweepTimer) { clearInterval(sweepTimer); sweepTimer = null; }
    if (reduce) return;
    var steps = [].slice.call(panel.querySelectorAll('.fstep'));
    if (!steps.length) return;
    var i = 0;
    function tick() {
      steps.forEach(function (s) { if (!s.classList.contains('selected')) s.classList.remove('active'); });
      if (!steps[i].classList.contains('selected')) steps[i].classList.add('active');
      i = (i + 1) % steps.length;
    }
    tick();
    sweepTimer = setInterval(tick, 480);
  }
  function stopSweep() {
    if (sweepTimer) { clearInterval(sweepTimer); sweepTimer = null; }
    [].slice.call(panel.querySelectorAll('.fstep.active')).forEach(function (s) { s.classList.remove('active'); });
  }

  if (pick && panel) {
    panel.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.fstep') : null;
      if (btn && panel.contains(btn)) selectStep(+btn.getAttribute('data-i'));
    });
    DEMO.forEach(function (c, i) {
      var b = document.createElement('button');
      b.className = 'demo-chip';
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.tabIndex = i === 0 ? 0 : -1;
      b.textContent = c.title;
      b.addEventListener('click', function () { renderDemo(i); });
      b.addEventListener('keydown', function (e) {
        var n;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % DEMO.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + DEMO.length) % DEMO.length;
        if (n != null) { e.preventDefault(); pick.children[n].focus(); renderDemo(n); }
      });
      pick.appendChild(b);
    });
    renderDemo(0);
  }

  /* ---------- How I Work: click a step to expand ---------- */
  [].slice.call(document.querySelectorAll('.steps .step')).forEach(function (step) {
    function toggle() {
      var open = step.classList.toggle('open');
      step.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    step.addEventListener('click', toggle);
    step.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  /* ---------- Problems: click a card to flip to its business impact ---------- */
  [].slice.call(document.querySelectorAll('.prob')).forEach(function (card) {
    function flip() {
      var f = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', f ? 'true' : 'false');
    }
    card.addEventListener('click', flip);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });

  /* ---------- interactive diagrams: click a box to light it up ---------- */
  var NODE_RE = /(^|\s)(node|inp|call|gov|lead|ai)-[a-z0-9]+/;
  [].slice.call(document.querySelectorAll('.diagram svg')).forEach(function (svg) {
    var diag = svg.closest('.diagram');
    if (diag) diag.classList.add('interactive');
    [].slice.call(svg.querySelectorAll('rect')).forEach(function (r) {
      var c = r.getAttribute('class') || '';
      if (!NODE_RE.test(c)) return;
      r.classList.add('hit');
      r.setAttribute('tabindex', '0');
      r.setAttribute('role', 'button');
      function toggle() { r.classList.toggle('lit'); }
      r.addEventListener('click', toggle);
      r.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  });
})();
