/* =============================================================================
   analytics.js  —  Vanessa Salonoy portfolio
   -----------------------------------------------------------------------------
   One self-contained analytics + event-tracking layer for a static site.
   Providers: Google Analytics 4 (gtag.js) · Microsoft Clarity · Google Tag Manager.

   HOW IT WORKS
   • Set your IDs in the CONFIG block below and commit. That is the only edit.
   • A provider stays completely OFF until its placeholder is replaced, so the
     file is inert by default: no network calls, no console errors, no page-speed
     cost. Nothing about the site's design, layout, or behaviour is touched.
   • Every tracked action is attached to the site's EXISTING elements through a
     single delegated listener (no markup changes, no duplicate listeners).

   LOADING
   • Loaded once from index.html as:  <script defer src="analytics.js"></script>
     `defer` = non-blocking; runs after HTML is parsed. Provider SDKs are then
     injected asynchronously, so they never block rendering or animations.
   ============================================================================= */
(function () {
  'use strict';

  /* ===========================================================================
     1) CONFIGURATION  —  replace the placeholders below, then commit.
        Leave any value as its placeholder to keep that provider switched OFF.
     ===========================================================================
     -------------------------------------------------
       Google Analytics 4
       Replace  G-XXXXXXXXXX  with your Measurement ID
     -------------------------------------------------
       Microsoft Clarity
       Replace  xxxxxxxxxx    with your Project ID
     -------------------------------------------------
       Google Tag Manager (optional)
       Replace  GTM-XXXXXXX   with your Container ID
     ------------------------------------------------- */
  var CONFIG = {
    GA4_MEASUREMENT_ID: 'G-J00HFQWLBN',   // ← Google Analytics 4
    CLARITY_PROJECT_ID: 'xpwv1mqjgy',      // ← Microsoft Clarity
    GTM_CONTAINER_ID:   'GTM-XXXXXXX',    // ← Google Tag Manager (leave off if unused)

    SCROLL_DEPTHS: [25, 50, 75, 100],     // scroll-depth milestones (%)
    DEBUG: false                          // true → log every event to the console
  };

  /* Placeholder values. A provider is enabled only when its ID differs from these. */
  var PLACEHOLDER = {
    ga4:     'G-XXXXXXXXXX',
    clarity: 'xxxxxxxxxx',
    gtm:     'GTM-XXXXXXX'
  };
  function enabled(id, placeholder) {
    return typeof id === 'string' && id.trim() !== '' && id.trim() !== placeholder;
  }

  var HAS_GA4     = enabled(CONFIG.GA4_MEASUREMENT_ID, PLACEHOLDER.ga4);
  var HAS_CLARITY = enabled(CONFIG.CLARITY_PROJECT_ID, PLACEHOLDER.clarity);
  var HAS_GTM     = enabled(CONFIG.GTM_CONTAINER_ID,   PLACEHOLDER.gtm);

  /* ===========================================================================
     2) PROVIDER BOOTSTRAP
        dataLayer + gtag are always defined (harmless) so the unified track()
        function has a stable target. SDK <script> tags are injected async and
        only when the matching ID is set.
     =========================================================================== */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  function injectScript(src, attrs) {
    var s = document.createElement('script');
    s.async = true;                 // never block rendering
    s.src = src;
    if (attrs) { Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); }); }
    (document.head || document.documentElement).appendChild(s);
    return s;
  }

  /* ---- Google Analytics 4 (gtag.js) ------------------------------------------
     Replace G-XXXXXXXXXX in CONFIG above. Injected only when set. */
  if (HAS_GA4) {
    injectScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.GA4_MEASUREMENT_ID));
    gtag('js', new Date());
    // send_page_view stays true → GA4 records the automatic page_view for us.
    gtag('config', CONFIG.GA4_MEASUREMENT_ID, { anonymize_ip: true });
  }

  /* ---- Google Tag Manager -----------------------------------------------------
     Replace GTM-XXXXXXX in CONFIG above. Optional; events are also pushed to
     dataLayer so GTM can route them. If you configure GA4 INSIDE GTM, leave the
     GA4_MEASUREMENT_ID as its placeholder to avoid double-counting. */
  if (HAS_GTM) {
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    injectScript('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CONFIG.GTM_CONTAINER_ID));
  }

  /* ---- Microsoft Clarity ------------------------------------------------------
     Replace xxxxxxxxxx in CONFIG above. Official async snippet, no duplicate load. */
  if (HAS_CLARITY) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CONFIG.CLARITY_PROJECT_ID);
  }

  /* ===========================================================================
     3) UNIFIED EVENT DISPATCH
        Sends one event to GA4 (gtag) and to dataLayer (GTM/others). Safe to call
        even when every provider is off — it simply queues to dataLayer.
     =========================================================================== */
  function track(eventName, params) {
    params = params || {};
    if (CONFIG.DEBUG) { try { console.log('[analytics]', eventName, params); } catch (e) {} }
    if (HAS_GA4) { window.gtag('event', eventName, params); }
    window.dataLayer.push(Object.assign({ event: eventName }, params));
  }

  /* Small helpers */
  function text(el) { return (el && el.textContent ? el.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 120); }
  function labelFor(el, childSel) {
    var node = childSel ? el.querySelector(childSel) : el;
    return text(node || el);
  }

  /* ===========================================================================
     4) INITIALISE ON READY
        `defer` usually means the DOM is already parsed; guard just in case.
     =========================================================================== */
  function ready(fn) {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', fn, { once: true }); }
    else { fn(); }
  }

  ready(function init() {

    /* --- Page view + visitor context ---------------------------------------- */
    track('portfolio_page_viewed', {
      page_location: location.href,
      page_title: document.title,
      page_referrer: document.referrer || '(direct)'
    });

    /* Returning vs new visitor (first-party localStorage flag). */
    try {
      var KEY = 'va_first_seen';
      var firstSeen = localStorage.getItem(KEY);
      var returning = !!firstSeen;
      if (HAS_GA4) { window.gtag('set', 'user_properties', { visitor_type: returning ? 'returning' : 'new' }); }
      track(returning ? 'returning_visitor' : 'new_visitor', {});
      if (!firstSeen) { localStorage.setItem(KEY, String(Date.now())); }
    } catch (e) { /* storage disabled → skip silently */ }

    /* --- Scroll depth: 25 / 50 / 75 / 100 %, each fired once ----------------- */
    var depths = (CONFIG.SCROLL_DEPTHS || []).slice().sort(function (a, b) { return a - b; });
    var firedDepth = {};
    var ticking = false;
    function measureScroll() {
      ticking = false;
      var docEl = document.documentElement;
      var scrollable = docEl.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      var pct = Math.min(100, Math.round(((window.scrollY || docEl.scrollTop) / scrollable) * 100));
      for (var i = 0; i < depths.length; i++) {
        var d = depths[i];
        if (pct >= d && !firedDepth[d]) {
          firedDepth[d] = true;
          track('scroll_depth', { percent: d });
        }
      }
      if (firedDepth[100]) { window.removeEventListener('scroll', onScroll); }
    }
    function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(measureScroll); } }
    window.addEventListener('scroll', onScroll, { passive: true });

    /* --- Time on page + session engagement ----------------------------------
       Sent when the tab is hidden or the page is unloaded, once per hidden view. */
    var visibleStart = Date.now();
    var timeSent = false;
    function sendTimeOnPage() {
      if (timeSent) return;
      var seconds = Math.round((Date.now() - visibleStart) / 1000);
      if (seconds <= 0) return;
      timeSent = true;
      track('time_on_page', { seconds: seconds, engagement_time_msec: seconds * 1000 });
    }
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') { sendTimeOnPage(); }
      else { visibleStart = Date.now(); timeSent = false; } // reset when the tab is re-focused
    });
    window.addEventListener('pagehide', sendTimeOnPage);

    /* --- Contact form submission --------------------------------------------- */
    var form = document.getElementById('cform');
    if (form) {
      form.addEventListener('submit', function () {
        track('contact_form_submit', { form_id: 'cform' });
      });
    }

    /* --- One delegated click listener for every tracked element --------------
       Using event delegation means exactly one listener, no per-element binding,
       no memory leaks, and it keeps working if the DOM ever changes. */
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;

      /* Links (outbound, email, phone, downloads, nav, hero CTAs) ------------- */
      var a = t.closest('a[href]');
      if (a) {
        var href = a.getAttribute('href') || '';
        var lower = href.toLowerCase();

        // Hero CTAs (Book a discovery call / View case studies / Download résumé)
        if (a.closest('.hero-cta')) {
          var heroLabel = text(a);
          if (/discovery|consult|book/i.test(heroLabel)) { track('book_consultation', { location: 'hero', label: heroLabel }); }
          track('hero_cta_click', { label: heroLabel, href: href });
        }

        // Primary navigation (top menu + nav CTA)
        if (a.closest('.nav-links') || a.classList.contains('nav-cta')) {
          track('nav_menu_click', { label: text(a), href: href });
        }

        // Downloads (résumé / any PDF or download link)
        if (lower.indexOf('.pdf') !== -1 || a.hasAttribute('download')) {
          track('resume_download', { file: href });
          return;
        }
        // Email
        if (lower.indexOf('mailto:') === 0) { track('email_click', { href: href, location: sectionOf(a) }); return; }
        // Phone
        if (lower.indexOf('tel:') === 0) { track('phone_click', { href: href }); return; }
        // Outbound links (LinkedIn / GitHub / everything external)
        var isExternal = false;
        if (/^https?:\/\//i.test(href)) {
          try { isExternal = (new URL(href, location.href)).host !== location.host; }
          catch (e) { isExternal = true; }
        }
        if (isExternal) {
          if (lower.indexOf('linkedin.com') !== -1) { track('linkedin_click', { href: href, location: sectionOf(a) }); }
          else if (lower.indexOf('github.com') !== -1) { track('github_click', { href: href, location: sectionOf(a) }); }
          else { track('outbound_link_click', { href: href }); }
          return;
        }
        return; // internal anchor already handled above where relevant
      }

      /* Buttons / cards / chips (not links) ---------------------------------- */
      var copy = t.closest('#copyEmail');
      if (copy) { track('email_copy', {}); return; }

      var step = t.closest('.step');
      if (step) { track('interactive_workflow', { step: labelFor(step, 'h3'), section: 'consulting_process' }); return; }

      var eng = t.closest('.engcard');
      if (eng) { track('case_study_click', { company: labelFor(eng, '.eg-co') }); return; }

      var svc = t.closest('.svccard');
      if (svc) { track('service_card_click', { service: labelFor(svc, 'h3') }); return; }

      var pkg = t.closest('.pkg');
      if (pkg) { track('engagement_package_click', { package: labelFor(pkg, 'h3') }); return; }

      var wow = t.closest('.wow');
      if (wow) { track('engagement_model_click', { model: labelFor(wow, 'h3') }); return; }

      var cert = t.closest('.cert');
      if (cert) { track('certification_click', { certification: labelFor(cert, 'h3') }); return; }

      var tech = t.closest('.tk');
      if (tech) { track('technology_card_click', { technology: text(tech) }); return; }

      var ind = t.closest('.indchip');
      if (ind) { track('industry_click', { industry: text(ind) }); return; }

      var ins = t.closest('.ins');
      if (ins) { track('insight_click', { insight: labelFor(ins, 'h3') }); return; }
    }, false);

    /* Which section did an element come from (for email/social context). */
    function sectionOf(el) {
      var sec = el.closest('section[id], header[id], footer');
      if (!sec) return '';
      return sec.id || (sec.tagName ? sec.tagName.toLowerCase() : '');
    }
  });
})();
