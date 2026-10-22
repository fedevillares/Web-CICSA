// One-off generator: builds proyectos.html from scraped project list data (scripts/proyectos-data.json).
// Not part of the deployed site — safe to delete after use.
const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\PC-1\\Desktop\\Cicsa3';
const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'proyectos-data.json'), 'utf8'));

// Map internal solucion codes (as scraped from class names) to real display labels
// matching the site's "Filtrar por Solución" list.
const SOLUCION_LABELS = {
  'Control': 'Control de Temperatura',
  'Corrosion': 'Corrosión',
  'Desgaste y Cavitacion': 'Desgaste y Cavitación',
  'Filtraciones': 'Filtraciones',
  'Impermeabilización': 'Impermeabilización',
  'Refuerzo': 'Refuerzo Estructural',
  'Restauracion': 'Restauración y Puesta en Valor',
  'Viales': 'Viales',
};

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Parse "col-xl-6 col-md-12 col-xs-12 |Sol1|Sol2| |Sector1|Sector2| " into { soluciones: [], sectores: [] }
function parseTags(cls) {
  const parts = cls.split('|').map(s => s.trim());
  // parts: [gridclasses, sol1, sol2, '', sector1, sector2, '']
  // find the two pipe-delimited groups after the leading grid-class chunk
  const rest = cls.slice(cls.indexOf('|'));
  const groups = rest.split('| |');
  const soluciones = groups[0] ? groups[0].split('|').map(s => s.trim()).filter(Boolean) : [];
  const sectores = groups[1] ? groups[1].split('|').map(s => s.trim()).filter(Boolean) : [];
  return { soluciones, sectores };
}

const items = raw.map(r => {
  const { soluciones, sectores } = parseTags(r.cls);
  const idMatch = r.href.match(/id=(\d+)/);
  return {
    id: idMatch ? idMatch[1] : '',
    title: r.title.trim(),
    soluciones,
    sectores,
  };
});

const solucionSet = new Set();
const sectorSet = new Set();
items.forEach(it => {
  it.soluciones.forEach(s => solucionSet.add(s));
  it.sectores.forEach(s => sectorSet.add(s));
});

const solucionTags = Array.from(solucionSet).sort((a, b) => (SOLUCION_LABELS[a] || a).localeCompare(SOLUCION_LABELS[b] || b));
const sectorTags = Array.from(sectorSet).sort((a, b) => a.localeCompare(b));

function header() {
  return `<div class="topbar">
  <div class="container">
    <a href="tel:+5493416941780">+54 9 341 694 1780</a>
    <a href="tel:+5493416705661">+54 9 341 670 5661</a>
    <a href="mailto:cicsa@cicsaingenieria.com">cicsa@cicsaingenieria.com</a>
  </div>
</div>

<header class="site-header">
  <div class="container">
    <a href="index.html" class="logo">CICSA <span>Ingeniería</span></a>
    <nav class="main-nav">
      <ul class="main-nav__list">
        <li class="main-nav__item"><a class="main-nav__link" href="index.html">Inicio</a></li>
        <li class="main-nav__item main-nav__item--has-sub">
          <a class="main-nav__link" href="soluciones.html">Soluciones</a>
          <div class="submenu">
            <a class="submenu__link" href="soluciones/corrosion.html">Corrosión</a>
            <a class="submenu__link" href="soluciones/viales.html">Viales</a>
            <a class="submenu__link" href="soluciones/filtraciones.html">Filtraciones</a>
            <a class="submenu__link" href="soluciones/desgaste.html">Desgaste, abrasión y Cavitación</a>
            <a class="submenu__link" href="soluciones/temperatura.html">Control de Temperatura</a>
            <a class="submenu__link" href="soluciones/impermeabilizacion.html">Impermeabilización</a>
            <a class="submenu__link" href="soluciones/refuerzo.html">Refuerzo Estructural</a>
            <a class="submenu__link" href="soluciones/movimiento.html">Movimiento Estructural</a>
            <a class="submenu__link" href="soluciones/restauracion.html">Restauracion y Puesta en Valor</a>
            <a class="submenu__link" href="soluciones/ignifuga.html">Protección ignífuga</a>
            <a class="submenu__link" href="soluciones/juntas.html">Juntas de dilatación y construcción</a>
            <a class="submenu__link" href="soluciones/defensas.html">Defensas para puertos</a>
            <a class="submenu__link" href="soluciones/renovable.html">Tecnología renovable</a>
          </div>
        </li>
        <li class="main-nav__item"><a class="main-nav__link" href="noticias.html">Noticias</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="servicios.html">Servicios</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="proyectos.html">Proyectos</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="quienes-somos.html">Quiénes Somos</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="contacto.html">Contacto</a></li>
      </ul>
      <a href="contacto.html" class="btn main-nav__cta">Contáctenos</a>
    </nav>
    <button class="nav-toggle" aria-label="Abrir menú"><span></span></button>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-col">
      <div class="footer-col__title">CICSA Ingeniería</div>
      <p>Soluciones tecnológicas para el mantenimiento edilicio, industrial y de infraestructura.</p>
    </div>
    <div class="footer-col">
      <div class="footer-col__title">Accesos rápidos</div>
      <a href="soluciones/corrosion.html">Corrosión</a>
      <a href="soluciones/viales.html">Viales</a>
      <a href="soluciones/filtraciones.html">Filtraciones</a>
      <a href="soluciones/refuerzo.html">Refuerzo Estructural</a>
      <a href="soluciones/desgaste.html">Desgaste y Cavitación</a>
      <a href="soluciones/temperatura.html">Control de Temperatura</a>
      <a href="soluciones/impermeabilizacion.html">Impermeabilización</a>
      <a href="soluciones/movimiento.html">Movimiento Estructural</a>
      <a href="soluciones/restauracion.html">Restauracion y Puesta en Valor</a>
    </div>
    <div class="footer-col">
      <div class="footer-col__title">Contáctenos</div>
      <p>Entre Ríos 2153, Rosario, Sta Fe, Argentina</p>
      <a href="tel:+5493416941780">+54 9 341 694 1780 (Recepción)</a>
      <a href="tel:+5493416705661">+54 9 341 670 5661 (Administración)</a>
      <a href="mailto:cicsa@cicsaingenieria.com">cicsa@cicsaingenieria.com</a>
      <a href="mailto:tecnica@cicsaingenieria.com">tecnica@cicsaingenieria.com</a>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>CICSA INGENIERÍA. ©2026 Todos los derechos reservados.</span>
  </div>
</footer>

<script src="assets/js/main.js"></script>`;
}

const solucionTagsHtml = solucionTags.map(s =>
  `      <button type="button" class="filter-tag" data-group="solucion" data-value="${esc(s)}">${esc(SOLUCION_LABELS[s] || s)}</button>`
).join('\n');

const sectorTagsHtml = sectorTags.map(s =>
  `      <button type="button" class="filter-tag" data-group="sector" data-value="${esc(s)}">${esc(s)}</button>`
).join('\n');

const rowsHtml = items.map((it, i) => {
  const num = String(i + 1).padStart(2, '0');
  const solAttr = esc(it.soluciones.join('|'));
  const secAttr = esc(it.sectores.join('|'));
  const meta = it.sectores.length ? esc(it.sectores[0]) : '';
  return `      <div class="row" data-solucion="${solAttr}" data-sector="${secAttr}"><span class="row__index">${num}</span><span class="row__title">${esc(it.title)}</span><span class="row__meta">${meta}</span></div>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>Proyectos — CICSA Ingeniería</title>
<meta name="description" content="Casos de estudio y proyectos ejecutados por CICSA Ingeniería en mantenimiento edilicio, industrial y de infraestructura.">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/layout.css">
</head>
<body>

${header()}

<section class="page-header">
  <div class="container">
    <span class="eyebrow page-header__eyebrow">Casos de estudio</span>
    <h1 class="page-header__title">Proyectos</h1>
  </div>
</section>

<section class="section section--lg">
  <div class="container">
    <div class="filter-group">
      <div class="filter-group__label">Filtrar por Solución</div>
      <div class="filter-tags">
${solucionTagsHtml}
      </div>
    </div>
    <div class="filter-group">
      <div class="filter-group__label">Filtrar por Sector/Industria</div>
      <div class="filter-tags">
${sectorTagsHtml}
      </div>
    </div>
    <div class="row-list" data-proyectos-list>
${rowsHtml}
    </div>
  </div>
</section>

<section class="section" style="border-top:1px solid rgba(0,0,0,0.1);">
  <div class="container" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px;">
    <span style="font-size:18px; font-weight:300;">¿Tiene un proyecto en mente?</span>
    <a href="contacto.html" class="btn">Contáctenos</a>
  </div>
</section>

${footer()}
</body>
</html>
`;

fs.writeFileSync(path.join(ROOT, 'proyectos.html'), html, 'utf8');
console.log(`Wrote proyectos.html — ${items.length} projects, ${solucionTags.length} solucion tags, ${sectorTags.length} sector tags.`);
