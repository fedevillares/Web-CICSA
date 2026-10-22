// One-off generator: builds the 13 soluciones/*.html pages from scraped source text.
// Not part of the deployed site — safe to delete after use.
const fs = require('fs');
const path = require('path');

const SCRATCH = 'C:\\Users\\PC-1\\AppData\\Local\\Temp\\claude\\C--Users-PC-1-Desktop-Cicsa3\\1d6497f0-d22b-462b-af4c-be650b6acdab\\scratchpad';
const ROOT = 'C:\\Users\\PC-1\\Desktop\\Cicsa3';

const CATEGORIES = [
  { slug: 'corrosion', num: '01', title: 'Corrosión', file: 'categorias/134_corrosion.txt', extra: ['detalles/id_121.txt', 'detalles/id_56.txt'] },
  { slug: 'viales', num: '02', title: 'Viales', file: 'categorias/135_viales.txt' },
  { slug: 'filtraciones', num: '03', title: 'Filtraciones', file: 'categorias/136_filtraciones.txt' },
  { slug: 'desgaste', num: '04', title: 'Desgaste, abrasión y Cavitación', file: 'categorias/137_desgaste.txt', extra: ['detalles/id_125.txt', 'detalles/id_60.txt'] },
  { slug: 'temperatura', num: '05', title: 'Control de Temperatura', file: 'categorias/138_temperatura.txt' },
  { slug: 'impermeabilizacion', num: '06', title: 'Impermeabilización', file: 'categorias/139_impermeabilizacion.txt', extra: ['detalles/id_65.txt', 'detalles/id_64.txt'] },
  { slug: 'refuerzo', num: '07', title: 'Refuerzo Estructural', file: 'categorias/140_refuerzo.txt' },
  { slug: 'movimiento', num: '08', title: 'Movimiento Estructural', file: 'categorias/141_movimiento.txt' },
  { slug: 'restauracion', num: '09', title: 'Restauracion y Puesta en Valor', file: 'categorias/142_restauracion.txt' },
  { slug: 'ignifuga', num: '10', title: 'Protección ignífuga', file: 'categorias/145_ignifuga.txt' },
  { slug: 'juntas', num: '11', title: 'Juntas de dilatación y construcción', file: 'categorias/146_juntas.txt' },
  { slug: 'defensas', num: '12', title: 'Defensas para puertos', file: 'categorias/147_defensas.txt' },
  { slug: 'renovable', num: '13', title: 'Tecnología renovable', file: 'categorias/148_renovable.txt' },
];

const FOOTER_MARKERS = [
  'Soluciones tecnológicas para el mantenimiento edilicio, industrial y de infraestructura.',
  '--- END UNTRUSTED EXTERNAL CONTENT ---',
];
const SKIP_LINES = new Set([
  'prevnext', 'Seleccionar idioma\u200b\u25bc', 'VER ANTECEDENTES',
  'Texto originalCalifica esta traducciónTus comentarios nos ayudarán a mejorar Google Traductor',
  'INICIO', 'Soluciones',
]);
const NAV_MEGA = 'CorrosiónVialesFiltracionesDesgaste, abrasión y CavitaciónControl de TemperaturaImpermeabilizaciónRefuerzo EstructuralMovimiento EstructuralRestauracion y Puesta en ValorProtección ignífugaJuntas de dilatación y construcciónDefensas para puertosTecnología renovable  Noticias Servicios Proyectos Quiénes Somos                         Contacto';

function extractBody(rawText, dropFirstHeading) {
  let lines = rawText.split('\n').map(l => l.trim());
  // drop BEGIN marker line and header block up through nav mega string
  let startIdx = lines.findIndex(l => l === NAV_MEGA);
  if (startIdx === -1) startIdx = 0; else startIdx += 1;
  let endIdx = lines.length;
  for (const marker of FOOTER_MARKERS) {
    const idx = lines.indexOf(marker);
    if (idx !== -1) { endIdx = Math.min(endIdx, idx); break; }
  }
  let body = lines.slice(startIdx, endIdx).filter(l => l.length > 0 && !SKIP_LINES.has(l));
  if (dropFirstHeading && body.length) body = body.slice(1); // drop repeated category/detail title line
  return body;
}

function linesToHtml(lines) {
  let html = '';
  let inList = false;
  for (const line of lines) {
    const isBullet = line.startsWith('•') || line.startsWith('-') && line.length > 2 && line[1] === ' ';
    if (isBullet) {
      if (!inList) { html += '<ul>\n'; inList = true; }
      html += `  <li>${esc(line.replace(/^[•-]\s*/, ''))}</li>\n`;
      continue;
    }
    if (inList) { html += '</ul>\n'; inList = false; }
    const isHeading = line.length < 70 && !/[.:;,]$/.test(line) && line === line.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(line);
    const isTitleHeading = line.length < 70 && !/[.:;,]$/.test(line) && !isBullet && /^[A-ZÁÉÍÓÚÑ]/.test(line) && line.split(' ').length <= 8 && !/\d{4}/.test(line);
    if (isHeading) {
      html += `<h2>${esc(line)}</h2>\n`;
    } else if (isTitleHeading) {
      html += `<h3>${esc(line)}</h3>\n`;
    } else {
      html += `<p>${esc(line)}</p>\n`;
    }
  }
  if (inList) html += '</ul>\n';
  return html;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function header(cat) {
  return `<div class="topbar">
  <div class="container">
    <a href="tel:+5493416941780">+54 9 341 694 1780</a>
    <a href="tel:+5493416705661">+54 9 341 670 5661</a>
    <a href="mailto:cicsa@cicsaingenieria.com">cicsa@cicsaingenieria.com</a>
  </div>
</div>

<header class="site-header">
  <div class="container">
    <a href="../index.html" class="logo">CICSA <span>Ingeniería</span></a>
    <nav class="main-nav">
      <ul class="main-nav__list">
        <li class="main-nav__item"><a class="main-nav__link" href="../index.html">Inicio</a></li>
        <li class="main-nav__item main-nav__item--has-sub">
          <a class="main-nav__link" href="../soluciones.html">Soluciones</a>
          <div class="submenu">
            <a class="submenu__link" href="corrosion.html">Corrosión</a>
            <a class="submenu__link" href="viales.html">Viales</a>
            <a class="submenu__link" href="filtraciones.html">Filtraciones</a>
            <a class="submenu__link" href="desgaste.html">Desgaste, abrasión y Cavitación</a>
            <a class="submenu__link" href="temperatura.html">Control de Temperatura</a>
            <a class="submenu__link" href="impermeabilizacion.html">Impermeabilización</a>
            <a class="submenu__link" href="refuerzo.html">Refuerzo Estructural</a>
            <a class="submenu__link" href="movimiento.html">Movimiento Estructural</a>
            <a class="submenu__link" href="restauracion.html">Restauracion y Puesta en Valor</a>
            <a class="submenu__link" href="ignifuga.html">Protección ignífuga</a>
            <a class="submenu__link" href="juntas.html">Juntas de dilatación y construcción</a>
            <a class="submenu__link" href="defensas.html">Defensas para puertos</a>
            <a class="submenu__link" href="renovable.html">Tecnología renovable</a>
          </div>
        </li>
        <li class="main-nav__item"><a class="main-nav__link" href="../noticias.html">Noticias</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="../servicios.html">Servicios</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="../proyectos.html">Proyectos</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="../quienes-somos.html">Quiénes Somos</a></li>
        <li class="main-nav__item"><a class="main-nav__link" href="../contacto.html">Contacto</a></li>
      </ul>
      <a href="../contacto.html" class="btn main-nav__cta">Contáctenos</a>
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
      <a href="corrosion.html">Corrosión</a>
      <a href="viales.html">Viales</a>
      <a href="filtraciones.html">Filtraciones</a>
      <a href="refuerzo.html">Refuerzo Estructural</a>
      <a href="desgaste.html">Desgaste y Cavitación</a>
      <a href="temperatura.html">Control de Temperatura</a>
      <a href="impermeabilizacion.html">Impermeabilización</a>
      <a href="movimiento.html">Movimiento Estructural</a>
      <a href="restauracion.html">Restauracion y Puesta en Valor</a>
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

<script src="../assets/js/main.js"></script>`;
}

for (const cat of CATEGORIES) {
  let contentHtml = '';
  if (!cat.extra) {
    const raw = fs.readFileSync(path.join(SCRATCH, cat.file), 'utf8');
    const bodyLines = extractBody(raw, false);
    contentHtml = linesToHtml(bodyLines);
  }

  if (cat.extra) {
    for (const extraFile of cat.extra) {
      const rawExtra = fs.readFileSync(path.join(SCRATCH, extraFile), 'utf8');
      const extraLines = extractBody(rawExtra, false);
      // First line of extra is the sub-item title -> render as h2, rest as body
      const subTitle = extraLines[0];
      const rest = extraLines.slice(1);
      contentHtml += `<h2>${esc(subTitle)}</h2>\n` + linesToHtml(rest);
    }
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>${esc(cat.title)} — Soluciones — CICSA Ingeniería</title>
<link rel="stylesheet" href="../assets/css/base.css">
<link rel="stylesheet" href="../assets/css/layout.css">
</head>
<body>

${header(cat)}

<section class="page-header">
  <div class="container">
    <div class="breadcrumb"><a href="../soluciones.html">Soluciones</a> / ${esc(cat.title)}</div>
    <span class="eyebrow page-header__eyebrow">Categoría ${cat.num}</span>
    <h1 class="page-header__title">${esc(cat.title)}</h1>
  </div>
</section>

<section class="section section--lg">
  <div class="container">
    <div class="prose">
${contentHtml}    </div>
  </div>
</section>

<section class="section" style="border-top:1px solid rgba(0,0,0,0.1);">
  <div class="container" style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:20px;">
    <span style="font-size:18px; font-weight:300;">¿Tiene un proyecto relacionado con ${esc(cat.title.toLowerCase())}?</span>
    <a href="../contacto.html" class="btn">Contáctenos</a>
  </div>
</section>

${footer()}
</body>
</html>
`;

  fs.writeFileSync(path.join(ROOT, 'soluciones', `${cat.slug}.html`), html, 'utf8');
  console.log('wrote', cat.slug);
}
