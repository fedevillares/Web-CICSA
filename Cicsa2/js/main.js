(() => {
  'use strict';

  // ---- Data (same info as original site) ----
  const soluciones = [
    { title: 'Corrosión', img: 'assets/img/corrosion.jpg', sub: 134 },
    { title: 'Viales', img: 'assets/img/viales.jpg', sub: 135 },
    { title: 'Filtraciones', img: 'assets/img/filtraciones.jpg', sub: 136 },
    { title: 'Desgaste, abrasión y Cavitación', img: 'assets/img/desgaste.jpg', sub: 137 },
    { title: 'Control de Temperatura', img: 'assets/img/temperatura.jpg', sub: 138 },
    { title: 'Impermeabilización', img: 'assets/img/impermeabilizacion.jpg', sub: 139 },
    { title: 'Refuerzo Estructural', img: 'assets/img/refuerzo-estructural.jpg', sub: 140 },
    { title: 'Movimiento Estructural', img: 'assets/img/movimiento-estructural.jpg', sub: 141 },
    { title: 'Restauracion y Puesta en Valor', img: 'assets/img/restauracion.jpg', sub: 142 },
    { title: 'Protección ignífuga', img: 'assets/img/proteccion-ignifuga.png', sub: 145 },
    { title: 'Juntas de dilatación y construcción', img: 'assets/img/juntas-dilatacion.jpg', sub: 146 },
    { title: 'Defensas para puertos', img: 'assets/img/defensas-puertos.jpg', sub: 147 },
    { title: 'Tecnología renovable', img: 'assets/img/tecnologia-renovable.jpg', sub: 148 },
  ];

  const heroHeadlines = [
    'Soluciones para problemas de<br>corrosión',
    'Soluciones<br>viales',
    'Soluciones para control de<br>filtraciones',
    'Soluciones para problemas de desgaste,<br>erosión, cavitación y ataque químico',
    'Soluciones para control de<br>temperatura',
    'Soluciones para<br>impermeabilización',
    'Soluciones para refuerzo<br>estructural',
    'Soluciones para restauración y<br>puesta en valor',
  ];

  const noticias = [
    {
      title: 'Seminario de Mangueras compuestas, juntas y sellos',
      img: 'assets/img/news-1.png',
      href: 'https://www.cicsaingenieria.com/index.php?pagina=detalle&id=167',
    },
    {
      title: 'Seminario juntas, apoyos y mantenimiento de puentes',
      img: 'assets/img/news-2.jpg',
      href: 'https://www.cicsaingenieria.com/index.php?pagina=detalle&id=54',
    },
    {
      title: 'CICSA Ingeniería participó del CILA XXI, uno de los congresos más importantes del mundo en lo referido al asfalto',
      img: 'assets/img/news-3.jpg',
      href: 'https://www.cicsaingenieria.com/index.php?pagina=detalle&id=53',
    },
    {
      title: 'Con participantes de Argentina, Paraguay y Ecuador, CICSA sumó otra webinar a su ciclo de difusión tecnológica: soluciones a las problemáticas típicas de la industria pesquera y naviera',
      img: 'assets/img/news-4.jpg',
      href: 'https://www.cicsaingenieria.com/index.php?pagina=detalle&id=52',
    },
    {
      title: 'CICSA lo invita a participar del Seminario Intensivo: Introducción a la Gestión, Inspección y Conservación de Puentes Carreteros',
      img: 'assets/img/news-5.png',
      href: 'https://www.cicsaingenieria.com/index.php?pagina=detalle&id=51',
    },
    {
      title: 'CICSA sumó otra webinar a su ciclo de difusión tecnológica: soluciones para problemáticas típicas del sector Oil & Gas',
      img: 'assets/img/news-6.jpg',
      href: 'https://www.cicsaingenieria.com/index.php?pagina=detalle&id=50',
    },
  ];

  const arrowIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // ---- Render: Soluciones dropdown ----
  const solucionesMenu = document.getElementById('solucionesMenu');
  solucionesMenu.innerHTML = soluciones.map(s =>
    `<a href="https://www.cicsaingenieria.com/index.php?pagina=lista&sec=129&subsec=${s.sub}" target="_blank" rel="noopener">${s.title}</a>`
  ).join('');

  // ---- Render: Catálogo grid ----
  const catalogoGrid = document.getElementById('catalogoGrid');
  catalogoGrid.innerHTML = soluciones.map(s => `
    <a class="cat-tile reveal" href="https://www.cicsaingenieria.com/index.php?pagina=lista&sec=129&subsec=${s.sub}" target="_blank" rel="noopener">
      <img src="${s.img}" alt="${s.title}" loading="lazy">
      <div class="cat-tile-label">
        <h3>${s.title}</h3>
        ${arrowIcon}
      </div>
    </a>
  `).join('');

  // ---- Render: Noticias grid ----
  const noticiasGrid = document.getElementById('noticiasGrid');
  noticiasGrid.innerHTML = noticias.map(n => `
    <article class="news-card reveal">
      <a class="news-card-media" href="${n.href}" target="_blank" rel="noopener">
        <img src="${n.img}" alt="${n.title}" loading="lazy">
      </a>
      <div class="news-card-body">
        <h3>${n.title}</h3>
        <a href="${n.href}" target="_blank" rel="noopener">Ver más...</a>
      </div>
    </article>
  `).join('');

  // ---- Render: Footer quick links ----
  const footerLinks = document.getElementById('footerLinks');
  const quickLinks = ['Corrosión','Viales','Filtraciones','Refuerzo Estructural','Desgaste y Cavitación','Control de Temperatura','Impermebilización','Movimiento Estructural','Restauracion y Puesta en Valor'];
  footerLinks.innerHTML = quickLinks.map(t => `<li><a href="#catalogo">${t}</a></li>`).join('');

  // ---- Hero rotator ----
  const heroTitle = document.getElementById('heroTitle');
  const heroEyebrow = document.getElementById('heroEyebrow');
  const heroDots = document.getElementById('heroDots');
  let heroIndex = 0;
  let heroTimer = null;

  heroDots.innerHTML = heroHeadlines.map((_, i) => `<button aria-label="Slide ${i + 1}" data-i="${i}"></button>`).join('');
  const dotEls = [...heroDots.querySelectorAll('button')];

  function showHero(i) {
    heroIndex = (i + heroHeadlines.length) % heroHeadlines.length;
    heroTitle.style.opacity = '0';
    setTimeout(() => {
      heroTitle.innerHTML = heroHeadlines[heroIndex];
      heroTitle.style.opacity = '1';
    }, 200);
    dotEls.forEach((d, idx) => d.classList.toggle('active', idx === heroIndex));
  }

  function startHeroAuto() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => showHero(heroIndex + 1), 4500);
  }

  heroTitle.style.transition = 'opacity .2s ease';
  showHero(0);
  startHeroAuto();

  dotEls.forEach(d => d.addEventListener('click', () => {
    showHero(parseInt(d.dataset.i, 10));
    startHeroAuto();
  }));

  // ---- Mobile nav toggle ----
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Mobile: tap to expand "Soluciones" dropdown instead of hover
  const dropdown = document.querySelector('.dropdown');
  const dropdownTrigger = document.querySelector('.dropdown-trigger');
  dropdownTrigger.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
      e.preventDefault();
      dropdown.classList.toggle('open');
    }
  });

  // Close mobile menu when a plain link is clicked
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // ---- Lenis smooth scroll ----
  let lenis = null;
  if (window.Lenis && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = id && id.length > 1 ? document.querySelector(id) : null;
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -70 });
        }
      });
    });
  }

  // ---- Scroll reveal ----
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }
})();
