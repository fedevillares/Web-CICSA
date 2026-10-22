// Scroll choreography — GSAP + ScrollTrigger.
// Only transform / opacity (and clip-path for image reveals) are animated.
// Reduced motion: no parallax, no pinning motion, no split text; fades only.

const EASE = 'expo.out'; // closest GSAP preset to cubic-bezier(0.23, 1, 0.32, 1)

export function initAnimations({ reduced }) {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) {
    // CDN unavailable: never leave content hidden.
    document.documentElement.classList.remove('js');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: EASE });

  splitHeadlines(reduced);
  reveals(reduced);
  drawLines(reduced);
  method();
  if (!reduced) {
    parallax();
    counters();
    magnetic();
  }

  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

/* Headlines: words rise from a mask, subtle stagger. */
function splitHeadlines(reduced) {
  const { gsap } = window;
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (reduced) {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power1.out', delay: el.dataset.split === 'load' ? 0.1 : 0,
        scrollTrigger: el.dataset.split === 'load' ? undefined : { trigger: el, start: 'top 88%', once: true } });
      return;
    }
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    wrapWords(el);
    el.setAttribute('aria-label', label);
    el.querySelectorAll('.split-line').forEach((s) => s.setAttribute('aria-hidden', 'true'));
    const words = el.querySelectorAll('.split-word');
    const tween = { yPercent: 0, y: 0, duration: 1.15, stagger: 0.045 };
    if (el.dataset.split === 'load') {
      gsap.fromTo(words, { yPercent: 105, y: 0 }, { ...tween, delay: 0.15 });
    } else {
      gsap.fromTo(words, { yPercent: 105, y: 0 }, { ...tween, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    }
  });
}

function wrapWords(node) {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const parts = child.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((p) => {
        if (!p) return;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
        const line = document.createElement('span');
        line.className = 'split-line';
        const word = document.createElement('span');
        word.className = 'split-word';
        word.textContent = p;
        line.appendChild(word);
        frag.appendChild(line);
      });
      child.replaceWith(frag);
    } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
      wrapWords(child);
    }
  });
}

/* Generic reveals, batched so siblings stagger together. */
function reveals(reduced) {
  const { gsap, ScrollTrigger } = window;
  const items = gsap.utils.toArray('[data-reveal]:not([data-reveal="clip"])');
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      opacity: 1,
      y: 0,
      duration: reduced ? 0.6 : 0.9,
      ease: reduced ? 'power1.out' : EASE,
      stagger: 0.06,
      overwrite: true,
      onComplete: () => batch.forEach(done),
    }),
  });

  gsap.utils.toArray('[data-reveal="clip"]').forEach((el) => {
    if (reduced) { gsap.set(el, { clipPath: 'none' }); gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, onComplete: () => done(el), scrollTrigger: { trigger: el, start: 'top 90%', once: true } }); return; }
    gsap.to(el, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 1.3,
      ease: 'expo.inOut',
      onComplete: () => done(el),
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });
}

// Hand the element back to CSS once revealed (so :active/:hover transforms work).
function done(el) {
  el.classList.add('is-in');
  window.gsap.set(el, { clearProps: 'opacity,transform,clipPath' });
}

/* Hairlines that draw themselves in. */
function drawLines(reduced) {
  const { gsap } = window;
  gsap.utils.toArray('[data-draw]').forEach((el) => {
    if (reduced) { gsap.set(el, { scaleX: 1 }); return; }
    gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
}

/* Parallax: images drift inside their frames. */
function parallax() {
  const { gsap } = window;
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax) || 10;
    const trigger = el.closest('[data-parallax-root]') || el.parentElement;
    const fromTop = el.hasAttribute('data-parallax-top');
    gsap.fromTo(el, { yPercent: fromTop ? 0 : -amount }, {
      yPercent: amount,
      ease: 'none',
      scrollTrigger: { trigger, start: fromTop ? 'top top' : 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* Counters: numbers count up once, tabular so nothing shifts. */
function counters() {
  const { gsap } = window;
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const from = parseInt(el.dataset.countFrom || '0', 10);
    const obj = { v: from };
    el.textContent = String(from);
    gsap.to(obj, {
      v: target,
      duration: 1.8,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => { el.textContent = String(Math.round(obj.v)); },
    });
  });
}

/* Method: one idea per scroll. CSS sticky does the pinning; ScrollTrigger maps progress → step. */
function method() {
  const { gsap, ScrollTrigger } = window;
  const section = document.querySelector('.method--pinned');
  if (!section) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const steps = [...section.querySelectorAll('.step')];
    const index = [...section.querySelectorAll('.method__index li')];
    const bar = section.querySelector('.method__progress span');
    let current = -1;
    const setStep = (i) => {
      if (i === current) return;
      current = i;
      steps.forEach((s, n) => {
        s.classList.toggle('is-active', n === i);
        s.classList.toggle('is-past', n < i);
        s.setAttribute('aria-hidden', String(n !== i));
      });
      index.forEach((li, n) => li.classList.toggle('is-active', n === i));
    };
    setStep(0);
    const st = ScrollTrigger.create({
      trigger: section.querySelector('.method__track'),
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        setStep(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999)));
        if (bar) bar.style.transform = `scaleX(${self.progress})`;
      },
    });
    return () => {
      st.kill();
      steps.forEach((s) => { s.classList.remove('is-active', 'is-past'); s.removeAttribute('aria-hidden'); });
    };
  });
}

/* Magnetic CTA — fine pointers only, small travel. */
function magnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const { gsap } = window;
  document.querySelectorAll('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.22);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}
