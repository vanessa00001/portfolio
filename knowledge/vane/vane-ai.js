/**
 * Vane AI floating assistant. ONE implementation, two hosts.
 *
 * A custom element with shadow DOM, chosen because the parent portfolio has no
 * build step and its own CSS vocabulary (--teal, --paper, --line) while the
 * Knowledge Center uses another (--brand-primary, --bg, --border). Shared plain
 * CSS would collide in both directions; a framework component would force a
 * bundler onto a repository that deliberately has none. Shadow DOM isolates
 * styles both ways, and each host maps its own tokens onto the neutral set below.
 *
 * Usage, identical in both repositories:
 *   <vane-ai data-endpoint="https://worker.example/"></vane-ai>
 *
 * SINGLE-TURN BY DESIGN. The panel keeps displayed messages in memory so the
 * exchange reads as a conversation, but prior turns are never sent back: each
 * question is independently retrieved, classified and grounded by the Worker.
 * There is no session, no history, no server-side storage.
 *
 * The browser calls only the Vane AI Worker. It never contacts a model provider,
 * holds a key, or re-derives trust: the Worker returns a validated response and
 * this renders exactly what it is given.
 */
const CSS = `
:host {
  --v-bg: var(--surface, var(--card, #fff));
  --v-page: var(--bg, var(--paper, #f3f5f4));
  --v-text: var(--text, var(--ink, #14232b));
  --v-muted: var(--text-muted, var(--muted, #5a6b70));
  --v-line: var(--border, var(--line, #cbd6d4));
  --v-brand: var(--brand-primary, var(--teal, #2e6e7e));
  --v-radius: 12px;
  --v-shadow: 0 8px 32px rgba(20, 35, 43, 0.16);
  font-family: var(--sans, system-ui, sans-serif);
  font-size: 15px;
  line-height: 1.55;
}
* { box-sizing: border-box; }

/* Stacking, deliberate rather than arbitrary. The host layers are content 1,
   drawer backdrop 40, drawer 50, header 60, skip link 1000. Vane AI sits above
   navigation so an open panel is usable, and BELOW the skip link so keyboard
   users always reach skip-to-content first. Headroom above 901 is left free for
   a future consent or system modal that should cover the assistant. */
.launcher {
  position: fixed; right: 20px; bottom: 20px; z-index: 900;
  display: inline-flex; align-items: center; gap: 8px;
  min-height: 44px; padding: 0 16px;
  font: inherit; font-weight: 600; color: #fff;
  background: var(--v-brand); border: 1px solid transparent;
  border-radius: 999px; cursor: pointer;
  box-shadow: var(--v-shadow);
  transition: transform 150ms ease, background-color 150ms ease;
}
.launcher:hover { transform: translateY(-1px); }
.launcher:focus-visible { outline: 2px solid var(--v-brand); outline-offset: 3px; }
.launcher[hidden] { display: none; }

.panel {
  position: fixed; right: 20px; bottom: 20px; z-index: 901;
  width: 400px; max-width: calc(100vw - 40px);
  height: 560px; max-height: calc(100vh - 40px);
  display: flex; flex-direction: column;
  background: var(--v-bg); color: var(--v-text);
  border: 1px solid var(--v-line); border-radius: var(--v-radius);
  box-shadow: var(--v-shadow); overflow: hidden;
}
.panel[hidden] { display: none; }

.head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--v-line);
}
.title { font-weight: 700; }
.sub { font-size: 12px; color: var(--v-muted); }
.close {
  min-width: 32px; min-height: 32px; font: inherit; font-size: 18px;
  color: var(--v-muted); background: none; border: 0; cursor: pointer;
  border-radius: 6px;
}
.close:hover { color: var(--v-text); }
.close:focus-visible { outline: 2px solid var(--v-brand); outline-offset: 2px; }

.log { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
.intro { color: var(--v-muted); }
.starters { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.starter {
  font: inherit; font-size: 13px; text-align: left;
  padding: 6px 10px; color: var(--v-text);
  background: var(--v-page); border: 1px solid var(--v-line);
  border-radius: 8px; cursor: pointer;
}
.starter:hover { border-color: var(--v-brand); color: var(--v-brand); }
.starter:focus-visible { outline: 2px solid var(--v-brand); outline-offset: 2px; }

.q { font-size: 13px; color: var(--v-muted); }
.a p { margin: 0 0 10px; }
.a p:last-child { margin-bottom: 0; }

/* Leading the answer, so the border sits below rather than above. */
.sources {
  margin-bottom: 12px; padding: 10px 12px;
  background: var(--v-page); border-left: 2px solid var(--v-brand);
  border-radius: 0 6px 6px 0;
}
.sources-h {
  margin: 0 0 6px; font-size: 11px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--v-muted);
}
.sources ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 5px; }
.sources a { font-size: 13px; color: var(--v-brand); }
.sources a:focus-visible { outline: 2px solid var(--v-brand); outline-offset: 2px; }

.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.action {
  display: inline-flex; align-items: center; min-height: 36px;
  padding: 0 12px; font: inherit; font-size: 13px; font-weight: 600;
  color: var(--v-text); background: transparent;
  border: 1px solid var(--v-line); border-radius: 8px;
  text-decoration: none; cursor: pointer;
}
.action:hover { border-color: var(--v-brand); color: var(--v-brand); }
.action:focus-visible { outline: 2px solid var(--v-brand); outline-offset: 2px; }

.loading { color: var(--v-muted); font-size: 14px; }

.composer {
  display: flex; gap: 8px; padding: 12px 16px;
  border-top: 1px solid var(--v-line); background: var(--v-bg);
}
.composer textarea {
  flex: 1; min-height: 42px; max-height: 120px; padding: 10px 12px;
  font: inherit; font-size: 14px; color: var(--v-text);
  background: var(--v-page); border: 1px solid var(--v-line);
  border-radius: 8px; resize: none;
}
.composer textarea:focus-visible { outline: 2px solid var(--v-brand); outline-offset: -1px; }
.send {
  min-width: 44px; min-height: 42px; font: inherit; font-weight: 600;
  color: #fff; background: var(--v-brand); border: 0;
  border-radius: 8px; cursor: pointer;
}
.send:disabled { opacity: 0.5; cursor: not-allowed; }
.send:focus-visible { outline: 2px solid var(--v-brand); outline-offset: 2px; }

.sr {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .launcher { transition: none; }
}
@media (max-width: 560px) {
  /* Pin all four edges rather than sizing from the right: the desktop rule
     offsets right by 20px, and a 100vw panel offset from the right hangs off
     the left. inset:0 leaves no room for that mistake. */
  .panel {
    inset: 0; width: auto; max-width: none;
    height: auto; max-height: none; border-radius: 0; border: 0;
  }
  .head { padding-top: max(14px, env(safe-area-inset-top, 0)); }
  .composer { padding-bottom: max(12px, env(safe-area-inset-bottom, 0)); }
  .launcher { right: max(20px, env(safe-area-inset-right, 0)); bottom: max(20px, env(safe-area-inset-bottom, 0)); }
}
`;

/** Application-owned starters, verified against the current corpus. PT-01 and
 *  PK-01 are deliberately absent while their retrieval findings stand: known
 *  weak cases should not be promoted as onboarding prompts. */
const STARTERS = [
  'Who is Vanessa Salonoy?',
  'What consulting services does Vanessa offer?',
  'What case studies has Vanessa published?',
  'What is the RDR Model?',
];

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const el = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

class VaneAI extends HTMLElement {
  connectedCallback() {
    if (this.shadowRoot) return;
    const root = this.attachShadow({ mode: 'open' });
    this.endpoint = this.dataset.endpoint || 'http://localhost:8787/';
    this.busy = false;
    root.innerHTML = `<style>${CSS}</style>` + this.markup();
    this.launcher = root.querySelector('.launcher');
    this.panel = root.querySelector('.panel');
    this.log = root.querySelector('.log');
    this.status = root.querySelector('.sr[role="status"]');
    this.input = root.querySelector('textarea');
    this.sendBtn = root.querySelector('.send');
    this.wire(root);
  }

  markup() {
    return `
      <button class="launcher" aria-haspopup="dialog" aria-expanded="false">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>
        </svg>
        Vane AI
      </button>
      <div class="panel" role="dialog" aria-label="Vane AI assistant" hidden>
        <div class="head">
          <div>
            <div class="title">Vane AI</div>
            <div class="sub">Portfolio &amp; Knowledge Assistant</div>
          </div>
          <button class="close" aria-label="Close Vane AI">&#215;</button>
        </div>
        <div class="log" tabindex="-1">
          <div class="intro">
            <p>Hi, I am Vane AI. Ask about Vanessa's experience, consulting capabilities,
            case studies, frameworks and Knowledge Center.</p>
            <div class="starters">
              ${STARTERS.map((q) => `<button class="starter" type="button">${esc(q)}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="sr" role="status" aria-live="polite"></div>
        <form class="composer">
          <label class="sr" for="v-q">Your question</label>
          <textarea id="v-q" rows="1" maxlength="500" placeholder="Ask a question..."></textarea>
          <button class="send" type="submit" aria-label="Send question">&#8593;</button>
        </form>
      </div>`;
  }

  wire(root) {
    this.launcher.addEventListener('click', () => this.open());
    root.querySelector('.close').addEventListener('click', () => this.close());
    root.querySelectorAll('.starter').forEach((b) =>
      b.addEventListener('click', () => { this.input.value = b.textContent.trim(); this.ask(); }));
    root.querySelector('.composer').addEventListener('submit', (e) => { e.preventDefault(); this.ask(); });
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.ask(); }
    });
    root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !this.panel.hidden) this.close(); });
  }

  async ask() {
    const q = this.input.value.trim();
    if (!q || this.busy) return;
    this.busy = true;
    this.sendBtn.disabled = true;
    this.input.value = '';
    this.log.querySelector('.intro')?.remove();
    this.log.appendChild(el(`<div class="q">${esc(q)}</div>`));
    const pending = el('<div class="loading">Reviewing Vanessa\'s Portfolio and Knowledge Center...</div>');
    this.log.appendChild(pending);
    this.status.textContent = 'Reviewing evidence';
    this.settle();
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      pending.remove();
      if (res.status === 429) return this.renderError('busy');
      if (!res.ok) return this.renderError('fail');
      this.renderAnswer(await res.json());
    } catch {
      pending.remove();
      this.renderError('fail');
    } finally {
      this.busy = false;
      this.sendBtn.disabled = false;
      this.settle();
      this.input.focus();
    }
  }

  /** Renders only trusted Worker fields. Internal state names never surface,
   *  and citation URLs come from the response, never from answer prose. */
  renderAnswer(d) {
    const cites = (d.citations || []).map((c) =>
      `<li><a href="${esc(c.path)}">${esc(c.title)}</a></li>`).join('');
    const n = (d.citations || []).length;
    const sources = cites
      ? `<div class="sources"><p class="sources-h">${n === 1 ? 'Source' : 'Sources'}</p>`
        + `<ul>${cites}</ul></div>`
      : '';
    const acts = (d.contactActions || []).map((a) =>
      `<a class="action" href="${esc(a.href)}" data-type="${esc(a.type)}">${esc(a.label)}</a>`).join('');
    const body = esc(d.answer || '').split(/\n\n+/).map((p) => `<p>${p}</p>`).join('');
    // Sources above the answer: a visitor should see where this came from before
    // reading what it says, not scroll past a claim to find its basis.
    const node = el(
      `<div class="a">${sources}${body}${acts ? `<div class="actions">${acts}</div>` : ''}</div>`);
    node.querySelectorAll('.action[data-type="message"]').forEach((a) => {
      a.addEventListener('click', (e) => this.toContactForm(e, a.getAttribute('href')));
    });
    this.log.appendChild(node);
    this.status.textContent = 'Answer ready';
  }

  renderError(kind) {
    const msg = kind === 'busy'
      ? 'Vane AI has received several questions in a short period. Please try again in a moment.'
      : 'Vane AI could not complete that request just now.';
    const node = el(`<div class="a"><p>${msg}</p>
      <div class="actions"><button class="action" type="button">Try again</button></div></div>`);
    node.querySelector('button').addEventListener('click', () => this.ask());
    this.log.appendChild(node);
    this.status.textContent = msg;
  }

  /** The message action reaches the same destination two ways, depending on
   *  whether this host actually renders the contact form. On the portfolio the
   *  form is on the page, so following the link would scroll it behind an open
   *  panel and look like nothing happened: close first, then scroll and focus.
   *  On the Knowledge Center there is no form, so the link navigates normally.
   *  The test is capability, not hostname, so any future host with a contact
   *  form gets the better behaviour without being named here. The destination
   *  itself stays application-owned; this only chooses how to reach it. */
  toContactForm(event, href) {
    const anchor = (href || '').split('#')[1];
    const target = anchor && document.getElementById(anchor);
    const field = target && target.querySelector('input, textarea, select');
    if (!target || !field) return;            // no form here: let the link navigate
    event.preventDefault();
    this.close();
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => field.focus({ preventScroll: true }), reduce ? 0 : 420);
  }

  /** Scroll to newest content after the browser has laid out the response,
   *  including its sources and actions. Scrolling inside the render pass lands
   *  short because those nodes have no height yet. One frame, not a loop. */
  settle() {
    requestAnimationFrame(() => {
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.log.scrollTo({ top: this.log.scrollHeight, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  open() {
    this.panel.hidden = false;
    this.launcher.hidden = true;
    this.launcher.setAttribute('aria-expanded', 'true');
    this.input.focus();
  }

  close() {
    this.panel.hidden = true;
    this.launcher.hidden = false;
    this.launcher.setAttribute('aria-expanded', 'false');
    this.launcher.focus();
  }
}

if (!customElements.get('vane-ai')) customElements.define('vane-ai', VaneAI);
