// CICSA — entry module (loaded deferred, after GSAP / ScrollTrigger / Lenis).
import { initLenis } from './lenis.js';
import { initMenu } from './menu.js';
import { initAnimations } from './animations.js';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const lenis = initLenis({ reduced });
initMenu({ lenis });
initAnimations({ reduced });
initLiteYouTube();
initProjectFilters();
initContactForm();
initToc();

/* ---------- Lite YouTube: poster first, iframe only on demand ---------- */
function initLiteYouTube() {
  document.querySelectorAll('.lite-yt').forEach((box) => {
    const btn = box.querySelector('button');
    btn?.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${box.dataset.id}?autoplay=1&rel=0`;
      iframe.title = box.dataset.title || 'Video de YouTube';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      box.replaceChildren(iframe);
      iframe.focus();
    });
  });
}

/* ---------- Projects: filter by solution + sector (URL-synced) ---------- */
function initProjectFilters() {
  const root = document.querySelector('[data-filters]');
  if (!root) return;
  const cards = [...document.querySelectorAll('[data-project]')];
  const chips = [...root.querySelectorAll('[data-sol-chip]')];
  const sector = root.querySelector('[data-sector-select]');
  const count = document.querySelector('[data-results-count]');
  const empty = document.querySelector('[data-empty]');
  const params = new URLSearchParams(location.search);
  let sol = params.get('sol') || '';
  let sec = params.get('sector') || '';
  if (!chips.some((c) => c.dataset.solChip === sol)) sol = '';
  if (sector && ![...sector.options].some((o) => o.value === sec)) sec = '';

  const apply = (push) => {
    let n = 0;
    cards.forEach((card) => {
      const okSol = !sol || card.dataset.sol.split(' ').includes(sol);
      const okSec = !sec || card.dataset.sector === sec;
      const show = okSol && okSec;
      card.hidden = !show;
      if (show) n++;
    });
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.solChip === sol)));
    if (sector) sector.value = sec;
    if (count) count.textContent = `${n} ${n === 1 ? 'proyecto' : 'proyectos'}`;
    if (empty) empty.hidden = n !== 0;
    if (push) {
      const p = new URLSearchParams();
      if (sol) p.set('sol', sol);
      if (sec) p.set('sector', sec);
      history.replaceState(null, '', `${location.pathname}${p.toString() ? `?${p}` : ''}`);
    }
    window.ScrollTrigger?.refresh();
  };

  chips.forEach((c) => c.addEventListener('click', () => { sol = c.dataset.solChip; apply(true); }));
  sector?.addEventListener('change', () => { sec = sector.value; apply(true); });
  apply(false);
}

/* ---------- Contact form: accessible validation + success / error states ---------- */
function initContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const ok = form.querySelector('[data-status="success"]');
  const err = form.querySelector('[data-status="error"]');
  const submit = form.querySelector('[type="submit"]');

  const messages = {
    valueMissing: 'Este campo es obligatorio.',
    typeMismatch: 'Ingresá un correo electrónico válido.',
  };
  const check = (field) => {
    const box = form.querySelector(`#${field.id}-error`);
    let msg = '';
    if (field.validity.valueMissing) msg = messages.valueMissing;
    else if (field.validity.typeMismatch) msg = messages.typeMismatch;
    field.setAttribute('aria-invalid', String(Boolean(msg)));
    if (box) box.textContent = msg;
    return !msg;
  };
  const fields = [...form.querySelectorAll('input, textarea')].filter((f) => f.name && f.type !== 'hidden');
  fields.forEach((f) => {
    f.addEventListener('blur', () => { if (f.value || f.getAttribute('aria-invalid') === 'true') check(f); });
    f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') check(f); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    ok.hidden = true; err.hidden = true;
    const invalid = fields.filter((f) => !check(f));
    if (invalid.length) { invalid[0].focus(); return; }
    if (form.querySelector('[name="website"]')?.value) return; // honeypot

    const data = new FormData(form);
    const endpoint = form.dataset.endpoint;
    submit.setAttribute('aria-busy', 'true');
    try {
      if (endpoint) {
        const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
      } else {
        // Sin endpoint configurado: se abre el cliente de correo con el mensaje armado.
        const body = `Nombre y Apellido: ${data.get('nombre')}\nEmpresa: ${data.get('empresa')}\nEmail: ${data.get('email')}\n\n${data.get('mensaje')}`;
        window.location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(`Consulta web — ${data.get('empresa')}`)}&body=${encodeURIComponent(body)}`;
        ok.querySelector('[data-status-text]').textContent = 'Abrimos su cliente de correo con el mensaje listo para enviar.';
      }
      form.reset();
      fields.forEach((f) => f.removeAttribute('aria-invalid'));
      ok.hidden = false;
      ok.focus();
    } catch {
      err.hidden = false;
      err.focus();
    } finally {
      submit.removeAttribute('aria-busy');
    }
  });
}

/* ---------- Table of contents: highlight the section in view ---------- */
function initToc() {
  const toc = document.querySelector('.toc');
  if (!toc) return;
  const links = new Map([...toc.querySelectorAll('a')].map((a) => [a.getAttribute('href').slice(1), a]));
  const targets = [...links.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        links.forEach((a) => a.classList.remove('is-active'));
        links.get(en.target.id)?.classList.add('is-active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  targets.forEach((t) => io.observe(t));
}
