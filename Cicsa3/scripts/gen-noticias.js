// One-off generator: builds noticias.html hub + noticias/*.html detail pages from scraped source text.
// Not part of the deployed site — safe to delete after use.
const fs = require('fs');
const path = require('path');

const SCRATCH = 'C:\\Users\\PC-1\\AppData\\Local\\Temp\\claude\\C--Users-PC-1-Desktop-Cicsa3\\1d6497f0-d22b-462b-af4c-be650b6acdab\\scratchpad';
const ROOT = 'C:\\Users\\PC-1\\Desktop\\Cicsa3';

// id, slug, title (in real site display order, newest first)
const NOTICIAS = [
  { id: '167', slug: 'seminario-mangueras', title: 'Seminario de Mangueras compuestas, juntas y sellos' },
  { id: '54', slug: 'seminario-juntas-puentes', title: 'Seminario juntas, apoyos y mantenimiento de puentes' },
  { id: '53', slug: 'cila-xxi', title: 'CICSA Ingeniería participó del CILA XXI, uno de los congresos más importantes del mundo en lo referido al asfalto' },
  { id: '52', slug: 'webinar-pesquera-naviera', title: 'Con participantes de Argentina, Paraguay y Ecuador, CICSA sumó otra webinar a su ciclo de difusión tecnológica: SOLUCIONES A LAS PROBLEMÁTICAS TÍPICAS DE LA INDUSTRIA PESQUERA Y NAVIERA' },
  { id: '51', slug: 'seminario-puentes-carreteros', title: 'CICSA lo invita a participar del Seminario Intensivo: Introducción a la Gestión, Inspección y Conservación de Puentes Carreteros' },
  { id: '50', slug: 'webinar-oil-gas', title: 'CICSA sumó otra webinar a su ciclo de difusión tecnológica: SOLUCIONES PARA PROBLEMÁTICAS TÍPICAS DEL SECTOR OIL & GAS' },
  { id: '49', slug: 'semana-ingenieria-2021', title: 'Semana de la ingeniería 2021: Ingeniería, construcción e innovación y el rol del ingeniero hoy' },
  { id: '48', slug: 'webinar-industria-minera-realizada', title: 'CICSA sumó otra webinar a su ciclo de difusión tecnológica: SOLUCIONES PARA PROBLEMÁTICAS TÍPICAS DE LA INDUSTRIA MINERA' },
  { id: '47', slug: 'webinar-industria-minera-proxima', title: 'CICSA dará una nueva webinar : SOLUCIONES PARA PROBLEMÁTICAS TÍPICAS DE LA INDUSTRIA MINERA' },
  { id: '46', slug: 'webinar-recalificacion-puentes', title: 'Con participantes de la Dirección Nacional de Vialidad, CICSA sumó otra webinar a su ciclo de difusión tecnológica: RECALIFICACIÓN FUNCIONAL DE PUENTES' },
  { id: '45', slug: 'webinar-fda-realizada', title: 'CICSA dictó una nueva webinar : TRATAMIENTOS DE PROTECCIÓN PARA INSTALACIONES Y EQUIPOS CON APROBACIÓN FDA' },
  { id: '44', slug: 'webinar-fda-proxima', title: 'CICSA dará una nueva webinar : TRATAMIENTOS DE PROTECCIÓN PARA INSTALACIONES Y EQUIPOS CON APROBACIÓN FDA' },
  { id: '43', slug: 'jornadas-tuneles', title: 'CICSA Ingeniería participó de las 10° Jornadas de Túneles y Espacios Subterráneos' },
  { id: '42', slug: 'seminario-nanotecnologia-vial-realizado', title: 'El seminario online NANOTECNOLOGÍA APLICADA AL SECTOR VIAL fue realizado con buena recepción tanto en Paraguay como en Argentina' },
  { id: '41', slug: 'webinar-nanotecnologia-vial', title: 'CICSA dará una nueva webinar : NANOTECNOLOGÍA APLICADA AL SECTOR VIAL' },
  { id: '40', slug: 'webinar-fertilizantes-realizada', title: 'Con participantes de Argentina y Paraguay, CICSA sumó otra webinar a su ciclo de difusión tecnológica: TRATAMIENTOS DE PROTECCIÓN PARA INSTALACIONES Y EQUIPOS EN CONTACTO CON FERTILIZANTES' },
  { id: '39', slug: 'webinar-fertilizantes-proxima', title: 'CICSA dará una nueva webinar : TRATAMIENTOS DE PROTECCIÓN PARA INSTALACIONES Y EQUIPOS EN CONTACTO CON FERTILIZANTES' },
  { id: '38', slug: 'webinar-zycotherm-1', title: 'CICSA realizó con éxito la webinar ADITIVOS PARA ASFALTOS ZYCOTHERM para Argentina, Paraguay y Uruguay' },
  { id: '37', slug: 'webinar-zycotherm-2', title: 'CICSA realizó con éxito la webinar ADITIVOS PARA ASFALTOS ZYCOTHERM para Argentina, Paraguay y Uruguay' },
  { id: '36', slug: 'seminario-gestion-puentes', title: 'Seminario "Introducción a la Gestión, Inspección y Conservación de Puentes Carreteros"' },
  { id: '35', slug: 'seminarios-quito-ecuador', title: 'Seminarios y Reuniones en Quito, Ecuador' },
];

const NAV_MEGA = 'CorrosiónVialesFiltracionesDesgaste, abrasión y CavitaciónControl de TemperaturaImpermeabilizaciónRefuerzo EstructuralMovimiento EstructuralRestauracion y Puesta en ValorProtección ignífugaJuntas de dilatación y construcciónDefensas para puertosTecnología renovable  Noticias Servicios Proyectos Quiénes Somos                         Contacto';
const FOOTER_START = 'Soluciones tecnológicas para el mantenimiento edilicio, industrial y de infraestructura.';

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function extractBody(rawText, title) {
  let lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  let startIdx = lines.findIndex(l => l === NAV_MEGA);
  if (startIdx === -1) startIdx = -1;
  let rest = lines.slice(startIdx + 1);
  // drop the title line and 'prevnext' marker
  rest = rest.filter(l => l !== title && l !== 'prevnext');
  let endIdx = rest.findIndex(l => l === FOOTER_START);
  if (endIdx !== -1) rest = rest.slice(0, endIdx);
  return rest.filter(Boolean);
}

function header(prefix) {
  return `<div class="topbar">
  <div class="container">
    <a href="tel:+5493416941780">+54 9 341 694 1780</a>
    <a href="tel:+5493416705661">+54 9 341 670 5661</a>
    <a href="mailto:cicsa@cicsaingenieria.com">cicsa@cicsaingenieria.com</a>
  </div>
</div>

<header class="site-header">
  <div class="container">
    <a href="${prefix}index.html" class="logo">CICSA <span>Ingeniería</span></a>
    <nav class="main-nav">
      <ul class="main-nav__list">
        <li class="main-nav__item"><a class="main-nav__link" href="${prefix}index.html">Inicio</a></li>
        <li class="main-nav__item main-nav__item--has-sub">
          <a class="main-nav__link" href="${prefix}soluciones.html">Soluciones</a>
          <div class="submenu">
            <a class="submenu__link" href="${prefix}soluciones/corrosion.html">Corrosión</a>
            <a class="submenu__link" href="${prefix}soluciones/viales.html">Viales</a>
            <a class="submenu__link" href="${prefix}soluciones/filtraciones.html">Filtraciones</a>
            <a class="submenu__link" href="${prefix}soluciones/desgaste.html">Desgaste, abrasión y Cavitación</a>
            <a class="submenu__link" href="${prefix}soluciones/temperatura.html">Control de Temperatura</a>
            <a class="submenu__link" href="${prefix}soluciones/impermeabilizacion.html">Impermeabilización</a>
            <a class="submenu__link" href="${prefix}soluciones/refuerzo.html">Refuerzo Estructural</a>
            <a class="submenu__link" href="${prefix}soluciones/movimiento.html">Movimiento Estructural</a>
            <a class="submenu__link" href="${prefix}soluciones/restauracion.html">Restauracion y Puesta en Valor</a>
            <a class="submenu__link" href="${prefix}soluciones/ignifuga.html">Protección ignífuga</a>
            <a class="submenu__link" href="${prefix}soluciones/juntas.html">Juntas de dilatación y construcción</a>
            <a class="submenu__link" href="${prefix}soluciones/defensas.html">Defensas para puertos</a>
            <a class="submenu__link" href="${prefix}soluciones/renovable.html">Tecnología renovable</a>
          </div>
        </li>
        <li class="main-nav__item"><a class="main-nav__link" href="${prefix}noticias.html">Noticias</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="${prefix}servicios.html">Servicios</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="${prefix}proyectos.html">Proyectos</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="${prefix}quienes-somos.html">Quiénes Somos</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="${prefix}contacto.html">Contacto</a></li>
      </ul>
      <a href="${prefix}contacto.html" class="btn main-nav__cta">Contáctenos</a>
    </nav>
    <button class="nav-toggle" aria-label="Abrir menú"><span></span></button>
  </div>
</header>`;
}

function footer(prefix) {
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-col">
      <div class="footer-col__title">CICSA Ingeniería</div>
      <p>Soluciones tecnológicas para el mantenimiento edilicio, industrial y de infraestructura.</p>
    </div>
    <div class="footer-col">
      <div class="footer-col__title">Accesos rápidos</div>
      <a href="${prefix}soluciones/corrosion.html">Corrosión</a>
      <a href="${prefix}soluciones/viales.html">Viales</a>
      <a href="${prefix}soluciones/filtraciones.html">Filtraciones</a>
      <a href="${prefix}soluciones/refuerzo.html">Refuerzo Estructural</a>
      <a href="${prefix}soluciones/desgaste.html">Desgaste y Cavitación</a>
      <a href="${prefix}soluciones/temperatura.html">Control de Temperatura</a>
      <a href="${prefix}soluciones/impermeabilizacion.html">Impermeabilización</a>
      <a href="${prefix}soluciones/movimiento.html">Movimiento Estructural</a>
      <a href="${prefix}soluciones/restauracion.html">Restauracion y Puesta en Valor</a>
    </div>
    <div class="footer-col">
      <div class="footer-col__title">Contáctenos</div>
      <p>Entre Ríos 2153, Rosario, Sta Fe, Argentina</p>
      <a href="${prefix}tel:+5493416941780">+54 9 341 694 1780 (Recepción)</a>
      <a href="${prefix}mailto:cicsa@cicsaingenieria.com">cicsa@cicsaingenieria.com</a>
      <a href="${prefix}mailto:tecnica@cicsaingenieria.com">tecnica@cicsaingenieria.com</a>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>CICSA INGENIERÍA. ©2026 Todos los derechos reservados.</span>
  </div>
</footer>

<script src="${prefix}assets/js/main.js"></script>`;
}

// Fix stray prefix on tel:/mailto: links (only ../ prefix breaks them, root-level footer has no prefix issue)
function fixTelMailto(html, prefix) {
  if (!prefix) return html;
  return html.replace(new RegExp(prefix.replace('.', '\\.') + 'tel:', 'g'), 'tel:')
             .replace(new RegExp(prefix.replace('.', '\\.') + 'mailto:', 'g'), 'mailto:');
}

// id 43 contains a real external "aquí" link (verified via DOM query) and an embedded
// YouTube video the plain-text scrape rendered only as a caption line.
const EXTERNAL_LINKS = {
  '43': { href: 'http://www.aates.org.ar/index.php/component/k2/item/386-se-realizaron-las-10-jornadas-de-tuneles-y-espacios-subterraneos', anchorLine: 'Acceda a la noticia desde aquí' },
};
const EMBEDS = {
  '43': '<div style="max-width:650px; margin-top:24px;"><iframe width="100%" height="400" style="aspect-ratio:16/9; height:auto;" src="https://www.youtube.com/embed/lKhMAMoOtjc" title="Video de la jornada" frameborder="0" allowfullscreen></iframe></div>',
};

// Build detail pages
NOTICIAS.forEach((n, i) => {
  const raw = fs.readFileSync(path.join(SCRATCH, 'noticias', `id_${n.id}.txt`), 'utf8');
  const bodyLines = extractBody(raw, n.title);
  const linkInfo = EXTERNAL_LINKS[n.id];
  const bodyHtml = bodyLines.map(l => {
    if (linkInfo && l === linkInfo.anchorLine) {
      return `<p><a href="${esc(linkInfo.href)}" target="_blank" rel="noopener">Acceda a la noticia desde aquí</a></p>`;
    }
    return `<p>${esc(l)}</p>`;
  }).join('\n') + (EMBEDS[n.id] ? '\n' + EMBEDS[n.id] : '');
  const prefix = '../';
  let html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${esc(n.title)} — Noticias — CICSA Ingeniería</title>
<link rel="stylesheet" href="../assets/css/base.css">
<link rel="stylesheet" href="../assets/css/layout.css">
</head>
<body>

${header(prefix)}

<section class="page-header">
  <div class="container">
    <div class="breadcrumb"><a href="../noticias.html">Noticias</a> / Nota</div>
    <h1 class="page-header__title" style="font-size:clamp(28px,4vw,44px);">${esc(n.title)}</h1>
  </div>
</section>

<section class="section section--lg">
  <div class="container">
    <div class="prose">
${bodyHtml}
    </div>
  </div>
</section>

<section class="section" style="border-top:1px solid rgba(0,0,0,0.1);">
  <div class="container" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px;">
    <span style="font-size:18px; font-weight:300;">¿Quiere conocer más sobre nuestras soluciones?</span>
    <a href="../contacto.html" class="btn">Contáctenos</a>
  </div>
</section>

${footer(prefix)}
</body>
</html>
`;
  html = fixTelMailto(html, prefix);
  fs.mkdirSync(path.join(ROOT, 'noticias'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'noticias', `${n.slug}.html`), html, 'utf8');
});

// Build hub
const rowsHtml = NOTICIAS.map((n, i) => {
  const num = String(i + 1).padStart(2, '0');
  return `      <a class="row" href="noticias/${n.slug}.html"><span class="row__index">${num}</span><span class="row__title">${esc(n.title)}</span><span class="row__meta">→</span></a>`;
}).join('\n');

let hub = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Noticias — CICSA Ingeniería</title>
<meta name="description" content="Novedades, seminarios y webinars de CICSA Ingeniería.">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/layout.css">
</head>
<body>

${header('')}

<section class="page-header">
  <div class="container">
    <span class="eyebrow page-header__eyebrow">Novedades</span>
    <h1 class="page-header__title">Noticias</h1>
  </div>
</section>

<section class="section section--lg">
  <div class="container">
    <div class="row-list cat-list">
${rowsHtml}
    </div>
  </div>
</section>

<section class="section" style="border-top:1px solid rgba(0,0,0,0.1);">
  <div class="container" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px;">
    <span style="font-size:18px; font-weight:300;">¿Quiere conocer más sobre nuestras soluciones?</span>
    <a href="contacto.html" class="btn">Contáctenos</a>
  </div>
</section>

${footer('')}
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'noticias.html'), hub, 'utf8');
console.log(`Wrote noticias.html + ${NOTICIAS.length} noticias/*.html detail pages.`);
