// Smooth scroll — Lenis driven by the GSAP ticker so ScrollTrigger stays in sync.
// Disabled entirely under prefers-reduced-motion (native scroll).

export function initLenis({ reduced }) {
  const { Lenis, gsap, ScrollTrigger } = window;
  if (reduced || !Lenis || !gsap || !ScrollTrigger) return null;

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page anchors (incl. skip link): smooth scroll + move focus for AT users.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = document.getElementById(decodeURIComponent(id.slice(1)));
    if (!target) return;
    e.preventDefault();
    const offset = -(document.querySelector('.site-header')?.offsetHeight || 0) - 16;
    lenis.scrollTo(target, { offset: target.id === 'main' ? 0 : offset });
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', id);
  });

  return lenis;
}
