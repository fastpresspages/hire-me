const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// Sticky header border after a little scroll.
const head = $('.site-head');
const onScroll = () => head?.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

// Mobile nav.
const toggle = $('.nav-toggle');
const nav = $('#site-nav');
function closeNav() {
  if (!nav || !toggle) return;
  nav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
$$('#site-nav a').forEach((a) => a.addEventListener('click', closeNav));
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
addEventListener('click', (e) => {
  if (!nav?.classList.contains('open')) return;
  if (!nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
});

// Copy email without a library. Falls back to a temporary textarea.
$$('[data-email]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const email = btn.getAttribute('data-email');
    const old = btn.textContent;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const t = document.createElement('textarea');
      t.value = email;
      t.style.position = 'fixed';
      t.style.opacity = '0';
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = old; }, 1600);
  });
});

// Footer year.
$$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

// Contact form: one endpoint, no storage, honest success/error states.
const ENDPOINT = 'https://formsubmit.co/ajax/meetcode99@gmail.com';
const emailOK = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function say(el, text, isError = false) {
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('err', isError);
}

async function deliver(payload) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    let data = null;
    try { data = await res.json(); } catch { /* non-JSON response */ }
    if (!res.ok || data?.success === false || data?.success === 'false') {
      throw new Error((data && data.message) || ('endpoint ' + res.status));
    }
  } finally {
    clearTimeout(timer);
  }
}

$$('[data-contact-form]').forEach((form) => {
  const btn = $('button[type=submit]', form);
  const msg = $('[data-form-msg]', form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const honey = $('[name=_honey]', form);
    if (honey?.value) return; // quietly drop bots

    const data = Object.fromEntries(new FormData(form));
    const email = String(data.email || '').trim().toLowerCase();
    const message = String(data.message || '').trim();

    if (!emailOK(email)) {
      say(msg, 'That email looks off. Try again?', true);
      $('[name=email]', form)?.focus();
      return;
    }
    if (message.length < 10) {
      say(msg, 'One useful sentence about the role or project is enough.', true);
      $('[name=message]', form)?.focus();
      return;
    }
    if (location.protocol === 'file:') {
      say(msg, 'The form cannot deliver from a local file. Open the https page or email meetcode99@gmail.com.', true);
      return;
    }

    const old = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    say(msg, '');
    try {
      await deliver({
        email,
        message,
        source: 'hire-me',
        page: location.href,
        date: new Date().toISOString(),
        _subject: `Hire page: ${email}`,
        _template: 'table',
        _captcha: 'false',
      });
      say(msg, `Got it. I read every brief and will reply to ${email}.`);
      form.reset();
    } catch (err) {
      const detail = err?.name === 'AbortError' ? 'The request timed out.' : err.message;
      say(msg, `Could not send (${detail}). Email meetcode99@gmail.com directly.`, true);
    } finally {
      btn.textContent = old;
      btn.disabled = false;
    }
  });
});
