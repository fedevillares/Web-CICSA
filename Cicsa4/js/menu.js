// Header behaviour: solutions mega-menu (desktop), full-screen nav (mobile),
// and header tone that adapts to the dark/light section underneath it.

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

export function initMenu({ lenis } = {}) {
  const header = document.querySelector('.site-header');
  if (!header) return;
  initMega(header);
  initMobile(header, lenis);
  initTone(header);
}

function initMega(header) {
  const trigger = header.querySelector('[data-mega-trigger]');
  const panel = document.getElementById(trigger?.getAttribute('aria-controls'));
  if (!trigger || !panel) return;
  const item = trigger.closest('li');
  let hoverTimer;

  const isOpen = () => trigger.getAttribute('aria-expanded') === 'true';
  const open = () => {
    clearTimeout(hoverTimer);
    trigger.setAttribute('aria-expanded', 'true');
    panel.classList.add('is-open');
  };
  const close = ({ focus = false } = {}) => {
    clearTimeout(hoverTimer);
    if (!isOpen()) return;
    trigger.setAttribute('aria-expanded', 'false');
    panel.classList.remove('is-open');
    if (focus) trigger.focus();
  };

  trigger.addEventListener('click', () => (isOpen() ? close() : open()));

  // Hover intent for mouse users only; keyboard/touch use the button.
  const enter = () => { if (finePointer.matches) { clearTimeout(hoverTimer); hoverTimer = setTimeout(open, 90); } };
  const leave = () => { if (finePointer.matches) { clearTimeout(hoverTimer); hoverTimer = setTimeout(close, 160); } };
  item.addEventListener('mouseenter', enter);
  item.addEventListener('mouseleave', leave);
  panel.addEventListener('mouseenter', () => clearTimeout(hoverTimer));
  panel.addEventListener('mouseleave', leave);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) close({ focus: panel.contains(document.activeElement) || document.activeElement === trigger });
  });
  document.addEventListener('pointerdown', (e) => {
    if (isOpen() && !panel.contains(e.target) && !item.contains(e.target)) close();
  });
  panel.addEventListener('focusout', (e) => {
    if (e.relatedTarget && !panel.contains(e.relatedTarget) && e.relatedTarget !== trigger) close();
  });
  // Arrow-down from the trigger moves into the panel.
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      open();
      panel.querySelector('a')?.focus();
    }
  });
  window.addEventListener('scroll', () => { if (isOpen() && !finePointer.matches) close(); }, { passive: true });
}

function initMobile(header, lenis) {
  const toggle = header.querySelector('[data-nav-toggle]');
  const nav = document.getElementById(toggle?.getAttribute('aria-controls'));
  if (!toggle || !nav) return;
  const outside = [document.querySelector('main'), document.querySelector('footer')].filter(Boolean);

  const set = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    outside.forEach((el) => (open ? el.setAttribute('inert', '') : el.removeAttribute('inert')));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (lenis) open ? lenis.stop() : lenis.start();
  };

  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { set(false); toggle.focus(); }
  });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) set(false); });

  nav.querySelectorAll('[data-sub-toggle]').forEach((btn) => {
    const sub = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      sub.hidden = !open;
    });
  });
}

// Header reads the tone of whatever section sits under it.
function initTone(header) {
  const darks = document.querySelectorAll('[data-header-tone="dark"]');
  const hero = document.querySelector('[data-header-top]');
  if (!darks.length && !hero) return;
  const active = new Set();
  const band = Math.round(header.offsetHeight / 2);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? active.add(en.target) : active.delete(en.target)));
    header.classList.toggle('is-over-dark', active.size > 0);
  }, { rootMargin: `-${band}px 0px -${Math.max(0, Math.round(window.innerHeight - band - 1))}px 0px` });
  darks.forEach((el) => io.observe(el));

  if (hero) {
    const update = () => header.classList.toggle('is-top', window.scrollY < 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }
}
