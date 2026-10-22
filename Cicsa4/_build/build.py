# CICSA — static site generator.
# Reads the content extracted from the original site (content.json) and renders
# every page with a shared header/footer. Run:  python _build/build.py
import json, re, html, unicodedata, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
B = Path(__file__).resolve().parent
C = json.loads((B / 'content.json').read_text(encoding='utf-8'))
META = json.loads((B / 'imgmeta.json').read_text(encoding='utf-8'))
URLMAP = json.loads((B / 'urlmap.json').read_text(encoding='utf-8'))
SITE = 'https://www.cicsaingenieria.com/'  # TODO: confirmar dominio final de producción (usado en canonical / Open Graph)
YEAR = datetime.date.today().year
WARN = []

TITLE = 'CICSA - CICSA Ingenieria'
DESC = ('Empresa de ingeniería civil especializada en construcciones y restauraciones de alta calidad. '
        'Ofrecemos soluciones integrales para proyectos  comerciales e industriales, garantizando eficiencia, '
        'innovación y cumplimiento de plazos.')
TAGLINE = 'Soluciones tecnológicas para el mantenimiento edilicio, industrial y de infraestructura.'
FB = 'https://www.facebook.com/profile.php?id=100064301070484&view_public_for=1301758733301371'
LI = 'https://www.linkedin.com/in/cic-sa-ingenier%C3%ADa-78bb6b1b5/'
MAP = ('https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3347.582096096685!2d-60.64740332360923!3d-32.96204117266746'
       '!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b7ab096de39c9b%3A0x7a479da3ccedb98a!2sEntre%20R%C3%ADos'
       '%202153%2C%20S2000FXI%20Rosario%2C%20Santa%20Fe!5e0!3m2!1ses-419!2sar!4v1727275374256!5m2!1ses-419!2sar')
MAP_LINK = 'https://www.google.com/maps/search/?api=1&query=Entre+R%C3%ADos+2153%2C+S2000FXI+Rosario%2C+Santa+Fe'

CLIENT_NAMES = ['Mijovi Constructora', 'Vialidad Nacional', 'Renova', 'Teatro Colón', 'Boortmalt', 'Open Candy',
    'Facultad de Derecho, Universidad Nacional de Rosario', 'TFA, Terminal de Fertilizantes Argentinos', 'YPF', 'Arcor',
    'AySA', 'CCK', 'Conorvial', 'Cargill', 'EPE, Energía de Santa Fe', 'Azzollini Construcciones', 'Constructora Sudamericana',
    'Friar', 'Depaoli & Trosce Constructora', 'Bunge', 'Explora', 'Costanera Norte', 'ADM', 'Arenera San Nicolás',
    'Abut Transportes', 'Grupo Forja', 'Pellegrinet', 'ADK', 'Obras & Sistemas', 'ANSES', 'Asociación de Cooperativas Argentinas',
    'AFIP', 'Geotub']

# ---------------------------------------------------------------- helpers
esc = lambda s: html.escape(str(s), quote=True)

def slugify(s):
    s = unicodedata.normalize('NFKD', html.unescape(s)).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s.lower()).strip('-')
    return s[:80].rstrip('-')

def sentence(s):
    s = s.strip().lower()
    return s[:1].upper() + s[1:]

def key_post(name):
    k = URLMAP.get('https://www.cicsaingenieria.com/post/' + name)
    if not k:
        WARN.append('missing post ' + name)
    return k

def key_url(url):
    k = URLMAP.get(url) or URLMAP.get(url.replace('/nuevo/archivos/', '/archivos/'))
    if not k:
        WARN.append('missing url ' + url)
    return k

def img(key, alt, p, sizes='100vw', eager=False, cls='', extra=''):
    if not key or key not in META:
        return ''
    m = META[key]
    src = f'{p}assets/img/{key}.webp'
    srcset = ''
    if m.get('small'):
        srcset = f' srcset="{p}assets/img/{key}-800.webp 800w, {src} {m["w"]}w" sizes="{sizes}"'
    load = 'fetchpriority="high" decoding="async"' if eager else 'loading="lazy" decoding="async"'
    c = f' class="{cls}"' if cls else ''
    return f'<img src="{src}"{srcset} width="{m["w"]}" height="{m["h"]}" alt="{esc(alt)}" {load}{c}{extra}>'

def ensure_small(key):  # srcset only when -800 exists
    return key

ICON = {
    'arrow': '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'arrow-ne': '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 11l6-6M6 5h5v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'chev': '<svg class="chev" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'play': '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9.5-5.5z" fill="currentColor"/></svg>',
    'fb': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21z"/></svg>',
    'li': '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 8.5h3V19H5zM6.5 4a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zM10 8.5h2.9v1.4h.1c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.6 2 3.6 4.6V19h-3v-5.4c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V19h-3z"/></svg>',
    'check': '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 10.5l3 3 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'alert': '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 6v5m0 3h.01M10 2l8 15H2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}

# ---------------------------------------------------------------- data model
SOL_ORDER = [134, 135, 136, 137, 138, 139, 140, 142, 141, 145, 146, 147, 148]  # 8 with photo first, then 5 typographic
CATALOG = ['17271011861.jpg', '17271022191.jpg', '17272067801.jpg', '17271012291.jpg', '17271012681.jpg', '17271012891.jpg',
           '17271013261.jpg', '17271014921.jpg', '17271015331.jpg', '17405748121.png', '17405839831.jpg', '17407618601.jpg', '17407729041.jpg']
EXTRACT_ORDER = [134, 135, 136, 137, 138, 139, 140, 141, 142, 145, 146, 147, 148]
SLIDER_IDS = [134, 135, 136, 137, 138, 139, 140, 142]
PROJECT_SOL = {'Corrosión': 134, 'Viales': 135, 'Filtraciones': 136, 'Desgaste y Cavitación': 137, 'Impermeabilización': 139}

sols = {s['id']: s for s in C['solutions']}
for i, sid in enumerate(EXTRACT_ORDER):
    sols[sid]['catalog'] = CATALOG[i]
for (imgname, title), sid in zip(C['slider'], SLIDER_IDS):
    sols[sid]['slider'] = (imgname, title)
for sid, s in sols.items():
    s['slug'] = slugify(s['name'])
    s['heading'] = s['title'] or s['name']
    cover = (s['covers'][:1] or [None])[0]
    s['photo'] = key_post(s['slider'][0]) if s.get('slider') else key_post(cover or s['catalog'])
    s['cover'] = key_post(s['slider'][0]) if s.get('slider') else key_post(cover or s['catalog'])
    s['sub'] = sentence(s['slider'][1]) if s.get('slider') else ''
ORDERED = [sols[i] for i in SOL_ORDER]

SECTOR_GROUPS = [('Agroindustria', ('agroind', 'agro', 'fertiliz', 'agropecu')), ('Alimenticio', ('aliment', 'frigor')),
                 ('Energía', ('energ', 'bioener')), ('Vial', ('vial',)), ('Infraestructura', ('infraestr', 'puerto')),
                 ('Edilicio', ('edilic', 'obra publica')), ('Industrial', ('industr', 'quimic', 'construcciones industriales'))]

def sector_group(raw):
    t = unicodedata.normalize('NFKD', raw).encode('ascii', 'ignore').decode().lower()
    for g, keys in SECTOR_GROUPS:
        if any(t.startswith(k) or f' {k}' in t for k in keys):
            return g
    return ''

# ---------------------------------------------------------------- prose
FACT_LABELS = r'(Sector|Cliente|Comitente|Supervisi[oó]n|Lugar|Ubicaci[oó]n|Trabajo realizado|Trabajos realizados|Superficie[^:]{0,30}|Tecnolog[ií]as? utilizadas?|Productos utilizados|Ejecuci[oó]n de (?:la )?aplicaci[oó]n|Ejecuci[oó]n|Fecha|A[nñ]o|Plazo[^:]{0,20}|Obra)'

def strip_tags(s):
    return html.unescape(re.sub(r'<[^>]+>', '', s)).strip()

def facts_from(par_html):
    rows, cur = [], None
    for line in re.split(r'<br>', par_html):
        t = strip_tags(line)
        if not t:
            continue
        m = re.match(FACT_LABELS + r'\s*:\s*(.*)$', t, re.I)
        if m and not re.match(r'^[–\-•·*]', t):
            cur = {'label': m.group(1).strip(), 'value': m.group(2).strip(), 'items': []}
            rows.append(cur)
        elif cur is None:
            return None
        elif re.match(r'^[–\-•·*]\s*', t):
            cur['items'].append(re.sub(r'^[–\-•·*]\s*', '', t))
        else:
            if cur['items']:
                cur['items'][-1] += ' ' + t
            else:
                cur['value'] = (cur['value'] + ' ' + t).strip()
    return rows if rows and any(r['label'].lower().startswith('sector') for r in rows) else None

def render_facts(rows):
    out = ['<dl class="facts">']
    for r in rows:
        v = esc(r['value'])
        if r['items']:
            v += '<ul>' + ''.join(f'<li>{esc(i)}</li>' for i in r['items']) + '</ul>'
        out.append(f'<div class="facts__row"><dt>{esc(r["label"])}</dt><dd>{v}</dd></div>')
    out.append('</dl>')
    return ''.join(out)

def yt_block(vid, title, p):
    key = 'yt_' + vid
    poster = img(key, f'Vista previa del video: {title}', p, sizes='(min-width: 1100px) 46rem, 100vw') if key in META else ''
    return (f'<div class="lite-yt" data-id="{esc(vid)}" data-title="{esc(title)}">{poster}'
            f'<button type="button" aria-label="Reproducir video: {esc(title)}"><span>{ICON["play"]}Reproducir video</span></button></div>'
            f'<noscript><p><a href="https://www.youtube.com/watch?v={esc(vid)}">Ver el video en YouTube</a></p></noscript>')

def prose(h, p, title):
    """Turn sanitized CMS html into final markup. Returns (html, toc, facts_rows)."""
    h = re.sub(r'</ul>\s*<ul>', '', h)
    h = re.sub(r'</ol>\s*<ol>', '', h)
    # "VER ANTECEDENTES" links to the old listing are replaced by our own block
    h = re.sub(r'<a href="index\.php\?pagina=lista[^"]*">.*?</a>', '', h)
    h = re.sub(r'<p>\s*(?:<strong>\s*</strong>)?\s*</p>', '', h)
    facts = None
    m = re.search(r'(?:<h2>\s*Ficha de [Oo]bra\s*</h2>)?<p>((?:(?!</p>).)*?Sector\s*:(?:(?!</p>).)*)</p>', h)
    if m:
        rows = facts_from(m.group(1))
        if rows:
            facts = rows
            h = h[:m.start()] + h[m.end():]
    # external links open in a new tab
    def link(mm):
        href = html.unescape(mm.group(1))
        if href.startswith('http'):
            return f'<a href="{esc(href)}" target="_blank" rel="noopener">'
        if 'pagina=' in href:
            WARN.append('internal link left: ' + href)
        return f'<a href="{esc(href)}">'
    h = re.sub(r'<a href="([^"]*)">', link, h)
    # media
    n = [0]
    def media_run(mm):
        urls = re.findall(r'@@IMG ([^@]+)@@', mm.group(0))
        figs = []
        for u in urls:
            n[0] += 1
            k = key_url(u.strip())
            if not k:
                continue
            m_ = META.get(k, {})
            narrow = ' class="is-narrow"' if m_.get('w', 1000) < 560 and len(urls) == 1 else ''
            figs.append(f'<figure{narrow}>' + img(k, f'{title} — imagen {n[0]}', p, sizes='(min-width: 1100px) 46rem, 100vw') + '</figure>')
        if len(figs) > 1:
            return '<div class="gallery">' + ''.join(figs) + '</div>'
        return ''.join(figs)
    h = re.sub(r'(?:@@IMG [^@]+@@\s*)+', media_run, h)
    h = re.sub(r'@@YT ([\w-]+)@@', lambda mm: yt_block(mm.group(1), title, p), h)
    # anchors for TOC
    toc, used = [], set()
    def anchor(mm):
        text = strip_tags(mm.group(1))
        sid = slugify(text) or 'seccion'
        while sid in used:
            sid += '-2'
        used.add(sid)
        toc.append((sid, text))
        return f'<h2 id="{sid}">{mm.group(1)}</h2>'
    h = re.sub(r'<h2>(.*?)</h2>', anchor, h)
    return h, toc, facts

# ---------------------------------------------------------------- layout
NAV = [('servicios.html', 'Servicios'), ('proyectos.html', 'Proyectos'), ('noticias.html', 'Noticias'), ('quienes-somos.html', 'Quiénes Somos')]

def header(p, current, dark):
    mega = ''.join(f'<li><a href="{p}soluciones/{s["slug"]}.html"><span class="num">{i:02d}</span>{esc(s["name"])}</a></li>'
                   for i, s in enumerate(ORDERED, 1))
    nav = ''.join(f'<li><a class="nav-link" href="{p}{h}"{" aria-current=\"page\"" if current == h else ""}>{t}</a></li>' for h, t in NAV)
    mob_sub = ''.join(f'<a href="{p}soluciones/{s["slug"]}.html">{esc(s["name"])}</a>' for s in ORDERED)
    mob = ''.join(f'<li><a href="{p}{h}">{t}</a></li>' for h, t in NAV)
    sol_cur = ' aria-current="page"' if current == 'soluciones.html' else ''
    return f'''<a class="skip-link" href="#main">Saltar al contenido</a>
<header class="site-header{' is-over-dark is-top' if dark else ''}">
  <div class="container site-header__inner">
    <a class="brand" href="{p}index.html" aria-label="CICSA Ingeniería — Inicio">
      <img class="brand__dark" src="{p}assets/img/logo.webp" width="520" height="142" alt="CICSA Ingeniería">
      <img class="brand__light" src="{p}assets/img/logo_white.webp" width="520" height="142" alt="" aria-hidden="true">
    </a>
    <nav class="primary-nav" aria-label="Principal">
      <ul class="primary-nav__list" role="list">
        <li><button class="nav-link" type="button" data-mega-trigger aria-expanded="false" aria-controls="mega-soluciones"{sol_cur}>Soluciones {ICON["chev"]}</button></li>
        {nav}
      </ul>
    </nav>
    <a class="btn btn--sm header-cta" href="{p}contacto.html">Contacto</a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="mobile-nav" aria-label="Abrir menú">
      <span class="nav-toggle__bar"></span><span class="nav-toggle__bar"></span>
    </button>
  </div>
  <div class="mega" id="mega-soluciones">
    <div class="container mega__inner">
      <div class="mega__intro">
        <span class="eyebrow">Soluciones</span>
        <p>Catálogo de Tecnologías del GRUPO CICSA</p>
        <a class="link-arrow" href="{p}soluciones.html">Ver todas las soluciones {ICON["arrow"]}</a>
      </div>
      <ul class="mega__list" role="list">{mega}</ul>
    </div>
  </div>
</header>
<div class="mobile-nav" id="mobile-nav">
  <nav class="container mobile-nav__inner" aria-label="Principal (móvil)">
    <ul class="mobile-nav__list" role="list">
      <li><button type="button" data-sub-toggle aria-expanded="false" aria-controls="mobile-sol">Soluciones {ICON["chev"]}</button>
        <div class="mobile-nav__sub" id="mobile-sol" hidden><a href="{p}soluciones.html"><strong>Ver todas</strong></a>{mob_sub}</div></li>
      {mob}
      <li><a href="{p}contacto.html">Contacto</a></li>
    </ul>
    <div class="mobile-nav__meta">
      <a href="tel:+5493416941780">+54 9 341 694 1780</a>
      <a href="mailto:cicsa@cicsaingenieria.com">cicsa@cicsaingenieria.com</a>
      <span>Entre Ríos 2153, Rosario, Santa Fe</span>
    </div>
  </nav>
</div>'''

def footer(p):
    links = [('soluciones.html', 'Soluciones')] + NAV + [('contacto.html', 'Contacto')]
    li = ''.join(f'<li><a href="{p}{h}">{t}</a></li>' for h, t in links)
    return f'''<footer class="site-footer theme-dark" data-header-tone="dark">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="{p}assets/img/logo_white.webp" width="520" height="142" alt="CICSA Ingeniería" loading="lazy" decoding="async">
        <p>{TAGLINE}</p>
        <div class="social">
          <a href="{FB}" target="_blank" rel="noopener" aria-label="CICSA en Facebook">{ICON["fb"]}</a>
          <a href="{LI}" target="_blank" rel="noopener" aria-label="CICSA en LinkedIn">{ICON["li"]}</a>
        </div>
      </div>
      <div class="footer-col">
        <h2>Navegación</h2>
        <ul>{li}</ul>
      </div>
      <div class="footer-col">
        <h2>Oficina</h2>
        <address>
          <span>Entre Ríos 2153</span>
          <span>Rosario, Santa Fe</span>
          <a href="{MAP_LINK}" target="_blank" rel="noopener">Ver en Google Maps</a>
        </address>
      </div>
      <div class="footer-col">
        <h2>Contacto</h2>
        <ul>
          <li><a href="tel:+5493416941780">+54 9 341 694 1780</a><small>Recepción</small></li>
          <li><a href="tel:+5493416705661">+54 9 341 670 5661</a><small>Administración</small></li>
          <li><a href="mailto:cicsa@cicsaingenieria.com">cicsa@cicsaingenieria.com</a></li>
          <li><a href="mailto:tecnica@cicsaingenieria.com">tecnica@cicsaingenieria.com</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© {YEAR} CICSA Ingeniería</span>
      <span>Rosario, Santa Fe, Argentina</span>
    </div>
  </div>
</footer>'''

CRITICAL = (ROOT / 'css/tokens.css').read_text(encoding='utf-8') + (ROOT / 'css/base.css').read_text(encoding='utf-8')
CRITICAL = re.sub(r'/\*.*?\*/', '', CRITICAL, flags=re.S)
CRITICAL = re.sub(r'\s*\n\s*', '\n', CRITICAL).strip()

JSONLD = {
    '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': SITE + '#org',
    'name': 'CICSA Ingeniería', 'alternateName': 'CIC S.A.', 'url': SITE,
    'logo': SITE + 'assets/img/logo.png', 'image': SITE + 'assets/img/post_17271008521.webp',
    'description': DESC, 'foundingDate': '2008',
    'email': 'cicsa@cicsaingenieria.com', 'telephone': '+54 9 341 694 1780',
    'address': {'@type': 'PostalAddress', 'streetAddress': 'Entre Ríos 2153', 'addressLocality': 'Rosario',
                'addressRegion': 'Santa Fe', 'postalCode': 'S2000FXI', 'addressCountry': 'AR'},
    'geo': {'@type': 'GeoCoordinates', 'latitude': -32.96204, 'longitude': -60.6474},
    'contactPoint': [
        {'@type': 'ContactPoint', 'telephone': '+54 9 341 694 1780', 'contactType': 'customer service', 'name': 'Recepción', 'areaServed': 'AR'},
        {'@type': 'ContactPoint', 'telephone': '+54 9 341 670 5661', 'contactType': 'billing support', 'name': 'Administración', 'areaServed': 'AR'},
        {'@type': 'ContactPoint', 'email': 'tecnica@cicsaingenieria.com', 'contactType': 'technical support'}],
    'sameAs': [FB, LI],
}

def page(path, *, title, desc, body, current='', dark=False, og_img='post_17271008521', jsonld=False):
    depth = path.count('/')
    p = '../' * depth
    full_title = TITLE if title is None else f'{title} — CICSA Ingeniería'
    og = SITE + f'assets/img/{og_img}.webp'
    ld = f'<script type="application/ld+json">{json.dumps(JSONLD, ensure_ascii=False)}</script>' if jsonld else ''
    doc = f'''<!doctype html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(full_title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{SITE}{'' if path == 'index.html' else path}">
<meta name="theme-color" content="#0b0d12">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_AR">
<meta property="og:site_name" content="CICSA Ingeniería">
<meta property="og:title" content="{esc(full_title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{SITE}{'' if path == 'index.html' else path}">
<meta property="og:image" content="{og}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{p}assets/img/favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600&family=Inter:wght@400;500;600&display=swap">
<script>document.documentElement.classList.add('js')</script>
<style>{CRITICAL}</style>
<link rel="stylesheet" href="{p}css/components.css">
<link rel="stylesheet" href="{p}css/sections.css">
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<script type="module" src="{p}js/main.js"></script>
{ld}
</head>
<body>
{header(p, current, dark)}
<main id="main" tabindex="-1">
{body(p)}
</main>
{footer(p)}
</body>
</html>
'''
    out = ROOT / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc, encoding='utf-8')

def crumbs(p, items):
    li = []
    for i, (href, label) in enumerate(items):
        if i == len(items) - 1:
            li.append(f'<li><span aria-current="page">{esc(label)}</span></li>')
        else:
            li.append(f'<li><a href="{p}{href}">{esc(label)}</a></li>')
    return f'<nav class="breadcrumbs" aria-label="Ruta de navegación"><ol>{"".join(li)}</ol></nav>'

# ---------------------------------------------------------------- components
def sol_card(s, i, p, cls=''):
    sub = f'<p class="sol-card__sub">{esc(s["sub"])}</p>' if s['sub'] else ''
    return f'''<a class="sol-card {cls}" href="{p}soluciones/{s["slug"]}.html" data-reveal>
  <div class="sol-card__media">{img(s["photo"], s["sub"] or s["name"], p, sizes="(min-width: 1024px) 50vw, 100vw")}</div>
  <div class="sol-card__top"><span class="sol-card__num">{i:02d}</span><span class="sol-card__arrow">{ICON["arrow-ne"]}</span></div>
  <h3 class="sol-card__title">{esc(s["name"])}</h3>{sub}
</a>'''

def type_card(s, i, p):
    return f'''<a class="type-card" href="{p}soluciones/{s["slug"]}.html" data-reveal>
  <div class="type-card__media" aria-hidden="true">{img(s["photo"], "", p, sizes="(min-width: 1024px) 20vw, 100vw")}</div>
  <span class="type-card__num">{i:02d}</span>
  <div><h3 class="type-card__title">{esc(s["name"])}</h3></div>
  <span class="type-card__go">Ver solución {ICON["arrow"]}</span>
</a>'''

def bento(p, lead_href):
    cards = []
    for i, s in enumerate(ORDERED[:8], 1):
        cards.append(sol_card(s, i, p, 'is-xl' if i in (1, 8) else ''))
    cards.append(f'''<a class="sol-card sol-card--lead is-wide" href="{lead_href}" data-reveal>
  <span class="eyebrow eyebrow--plain" style="color:rgb(244 242 238 / .75)">GRUPO CICSA</span>
  <div><h3 class="sol-card__title">Catálogo de Tecnologías del GRUPO CICSA</h3>
  <p class="sol-card__sub">13 soluciones tecnológicas para el mantenimiento edilicio, industrial y de infraestructura.</p></div>
</a>''')
    types = ''.join(type_card(s, i, p) for i, s in enumerate(ORDERED[8:], 9))
    return f'<div class="bento">{"".join(cards)}</div><div class="type-grid">{types}</div>'

NEWS = {n['id']: n for n in C['news']}
used = set()
for n in C['news']:
    sl = slugify(n['title'])[:70].rstrip('-')
    if sl in used:
        sl = f'{sl}-{n["id"]}'
    used.add(sl)
    n['slug'] = sl
    yt = re.search(r'@@YT ([\w-]+)@@', n['html'])
    n['yt'] = yt.group(1) if yt else None
    n['thumbkey'] = key_post(n['thumb']) if n['thumb'] else (('yt_' + n['yt']) if n['yt'] else None)

def news_card(n, p, sizes='(min-width: 1100px) 33vw, (min-width: 680px) 50vw, 100vw'):
    play = f'<span class="ecard__play" aria-hidden="true"><span>{ICON["play"]}</span></span>' if not n['thumb'] and n['yt'] else ''
    media = f'<div class="frame ecard__media">{img(n["thumbkey"], n["title"], p, sizes=sizes)}{play}</div>' if n['thumbkey'] else ''
    if not n['thumbkey']:
        media = '<!-- TODO: falta imagen de portada para esta noticia -->'
    return f'''<article class="ecard" data-reveal>
  {media}
  <h3 class="ecard__title"><a href="{p}noticias/{n["slug"]}.html">{esc(n["title"])}</a></h3>
</article>'''

PROJ = C['projects']
used = set()
for pr in PROJ:
    sl = slugify(pr['title'])[:70].rstrip('-')
    if sl in used:
        sl = f'{sl}-{pr["id"]}'
    used.add(sl)
    pr['slug'] = sl
    pr['sols'] = [sols[PROJECT_SOL[x]] for x in pr['sol'] if x in PROJECT_SOL]
    for x in pr['sol']:
        if x not in PROJECT_SOL:
            WARN.append(f'unknown project sol {x}')
    pr['body'], pr['toc'], pr['facts'] = prose(pr['html'], '../', pr['title'])
    raw = next((r['value'] for r in (pr['facts'] or []) if r['label'].lower().startswith('sector')), '')
    if not raw:
        m = re.search(r'Sector\s*:\s*(?:</strong>)?\s*([^<]+)', pr['html'])
        raw = html.unescape(m.group(1)).strip() if m else ''
    pr['sector_raw'] = raw.rstrip('.').strip()
    pr['sector'] = sector_group(pr['sector_raw'])
    pr['thumbkey'] = key_post(pr['thumb'] or pr['covers'][0])

for s in sols.values():
    s['projects'] = [pr for pr in PROJ if s in pr['sols']]

def proj_card(pr, p):
    tags = ''.join(f'<span class="tag">{esc(s["name"])}</span>' for s in pr['sols'])
    if pr['sector']:
        tags += f'<span class="tag">{esc(pr["sector"])}</span>'
    return f'''<article class="ecard" data-project data-sol="{' '.join(s['slug'] for s in pr['sols'])}" data-sector="{slugify(pr['sector'])}" data-reveal>
  <div class="frame ecard__media">{img(pr["thumbkey"], pr["title"], p, sizes="(min-width: 1100px) 33vw, (min-width: 680px) 50vw, 100vw")}</div>
  <div class="ecard__meta">{tags}</div>
  <h3 class="ecard__title"><a href="{p}proyectos/{pr["slug"]}.html">{esc(pr["title"])}</a></h3>
</article>'''

ABOUT_P = re.findall(r'<p>(.*?)</p>', C['about']['html'])
SERV_P = re.findall(r'<p>(.*?)</p>', C['services']['html'])
STEPS = [(strip_tags(a), b) for a, b in re.findall(r'<h2>(.*?)</h2><p>(.*?)</p>', C['services']['html'])]
STEP_SHORT = {3: 'Somos actores en todo el ciclo de instalación de una solución.'}

# ---------------------------------------------------------------- HOME
def home(p):
    hero_img = 'post_17271008521'
    steps = ''.join(f'''<li class="step" data-reveal>
        <span class="step__num">{i:02d}</span>
        <h3 class="step__title">{esc(t)}</h3>
        <p class="step__text">{STEP_SHORT.get(i - 1, d)}</p>
      </li>''' for i, (t, d) in enumerate(STEPS, 1))
    index = ''.join(f'<li><span>{i:02d}</span>{esc(t)}</li>' for i, (t, _) in enumerate(STEPS, 1))
    news = ''.join(news_card(NEWS[i], p) for i in (167, 54, 53, 52, 51, 50))
    clients = C['clients']
    half = (len(clients) + 1) // 2
    def track(items, hidden):
        lis = ''.join(f'<li class="logo-tile">{img(key_post(f), "" if hidden else name, p, sizes="11rem")}</li>' for f, name in items)
        return f'<ul class="marquee__track" role="list"{" aria-hidden=\"true\"" if hidden else ""}>{lis}</ul>'
    rows = ''
    for k, items in enumerate([list(zip(clients, CLIENT_NAMES))[:half], list(zip(clients, CLIENT_NAMES))[half:]]):
        rev = ' marquee__row--reverse' if k else ''
        rows += f'<div class="marquee__row{rev}" style="--marquee-dur:{80 + k * 10}s">{track(items, False)}{track(items, True)}</div>'
    return f'''
<section class="hero theme-dark" data-header-tone="dark" data-header-top data-parallax-root aria-labelledby="hero-title">
  <div class="hero__media" data-parallax="8" data-parallax-top>{img(hero_img, "Equipo de CICSA trabajando sobre una plataforma elevadora bajo el tablero de un puente", p, eager=True, sizes="100vw")}</div>
  <div class="container hero__content">
    <span class="eyebrow">CICSA Ingeniería · Desde 2008</span>
    <h1 id="hero-title" class="display hero__title" data-split="load">Soluciones tecnológicas para el mantenimiento edilicio, industrial y de infraestructura.</h1>
    <div class="hero__foot">
      <div class="hero__ctas" data-reveal>
        <a class="btn btn--lg" href="soluciones.html">Ver soluciones {ICON["arrow"]}</a>
        <a class="btn btn--lg btn--ghost" href="contacto.html">Contactar</a>
      </div>
      <p class="hero__caption">Soluciones para refuerzo estructural</p>
      <span class="scroll-cue" aria-hidden="true"></span>
    </div>
  </div>
</section>

<section class="section creds" aria-labelledby="creds-title">
  <div class="container">
    <h2 id="creds-title" class="visually-hidden">Trayectoria</h2>
    <span class="rule" data-draw></span>
    <div class="creds__grid" style="border-top:0">
      <div class="cred" data-reveal><span class="cred__num tabular">2008</span><p class="cred__label">Empresa de ingeniería creada en el año 2008.</p></div>
      <div class="cred" data-reveal><span class="cred__num tabular"><sup>+</sup><span data-count="20">20</span></span><p class="cred__label">Años de experiencia en la generación de soluciones tecnológicas instaladas.</p></div>
      <div class="cred" data-reveal><span class="cred__num tabular" data-count="13">13</span><p class="cred__label">Líneas de soluciones en el Catálogo de Tecnologías del GRUPO CICSA.</p></div>
      <div class="cred" data-reveal><span class="cred__num tabular" data-count="{len(PROJ)}">{len(PROJ)}</span><p class="cred__label">Antecedentes de obra documentados.</p></div>
    </div>
    <p class="h2 creds__statement" data-split>Con el aporte de las <em>empresas de elite mundial</em> a quien representa, para un mercado latinoamericano.</p>
  </div>
</section>

<section class="section method method--pinned theme-dark" data-header-tone="dark" aria-labelledby="method-title">
  <div class="method__track">
    <div class="container method__stage">
      <div class="method__head">
        <span class="eyebrow">Servicios</span>
        <h2 id="method-title" class="h2">Desde la planificación de la solución hasta su instalación y control.</h2>
        <p class="lead">{SERV_P[0]}</p>
        <ol class="method__index" aria-hidden="true">{index}</ol>
      </div>
      <ol class="method__steps" role="list">{steps}</ol>
      <div class="method__progress" aria-hidden="true"><span></span></div>
    </div>
  </div>
</section>

<section class="section solutions" id="soluciones" aria-labelledby="sol-title">
  <div class="container">
    <div class="section-head section-head--split">
      <div style="display:grid;gap:var(--s-5)">
        <span class="eyebrow">Soluciones</span>
        <h2 id="sol-title" class="h2" data-split>Catálogo de Tecnologías del GRUPO CICSA</h2>
      </div>
      <div style="display:grid;gap:var(--s-5);justify-items:start">
        <a class="link-arrow" href="soluciones.html">Ver todas las soluciones {ICON["arrow"]}</a>
      </div>
    </div>
    {bento(p, "soluciones.html")}
  </div>
</section>

<section class="section about" aria-labelledby="about-title">
  <div class="container about__grid">
    <div class="frame about__media" data-reveal="clip">
      <img src="assets/img/b-3.webp" srcset="assets/img/b-3-640.webp 640w, assets/img/b-3.webp 1000w" sizes="(min-width: 960px) 45vw, 100vw" width="1000" height="750" alt="Ingenieros con cascos revisando planos sobre una mesa, vistos desde arriba" loading="lazy" decoding="async" data-parallax="6">
    </div>
    <div class="about__body">
      <span class="eyebrow">CICSA Ingeniería</span>
      <h2 id="about-title" class="h2" data-split>Quiénes somos</h2>
      <p class="lead" data-reveal>{ABOUT_P[0]}</p>
      <p data-reveal>{ABOUT_P[1]}</p>
      <div data-reveal><a class="link-arrow" href="quienes-somos.html">Conocé más sobre CICSA {ICON["arrow"]}</a></div>
    </div>
  </div>
</section>

<section class="section news" aria-labelledby="news-title">
  <div class="container">
    <div class="section-head section-head--split">
      <div style="display:grid;gap:var(--s-5)">
        <span class="eyebrow">Noticias</span>
        <h2 id="news-title" class="h2" data-split>Últimas noticias</h2>
      </div>
      <div style="justify-self:start"><a class="link-arrow" href="noticias.html">Ver todas las noticias {ICON["arrow"]}</a></div>
    </div>
    <div class="card-grid card-grid--feature">{news}</div>
  </div>
</section>

<section class="section clients" aria-labelledby="clients-title">
  <div class="container">
    <div class="section-head">
      <span class="eyebrow">Clientes</span>
      <h2 id="clients-title" class="h2" data-split>Nuestros clientes</h2>
    </div>
  </div>
  <div class="marquee">{rows}</div>
</section>

{cta(p)}
'''

def cta(p):
    return f'''<section class="section cta theme-dark" data-header-tone="dark" aria-labelledby="cta-title">
  <div class="container cta__inner">
    <h2 id="cta-title" class="display cta__title" data-split>La solución óptima al problema planteado.</h2>
    <div class="cta__side">
      <p class="cta__aside" data-reveal>El Departamento Técnico, formado por profesionales de amplia experiencia en el sector, asesora eficientemente y de manera personalizada.</p>
      <div class="cta__row" data-reveal>
        <span class="magnetic"><a class="btn btn--lg btn--accent" href="{p}contacto.html">Contacto {ICON["arrow"]}</a></span>
        <a class="btn btn--lg btn--ghost" href="tel:+5493416941780">+54 9 341 694 1780</a>
      </div>
    </div>
  </div>
</section>'''

def page_hero(p, crumbs_items, eyebrow, title, lead='', long=False, meta=''):
    lead_html = f'<p class="lead page-hero__lead" data-reveal>{lead}</p>' if lead else ''
    return f'''<section class="page-hero">
  <div class="container page-hero__inner">
    {crumbs(p, crumbs_items)}
    {f'<span class="eyebrow">{eyebrow}</span>' if eyebrow else ''}
    <h1 class="h1 page-hero__title{' page-hero__title--long' if long else ''}" data-split="load">{esc(title)}</h1>
    {meta}
    {lead_html}
  </div>
</section>'''

def media_band(key, alt, p):
    if not key:
        return ''
    return f'''<div class="container"><div class="frame page-media page-media--parallax" data-reveal="clip" data-parallax-root>{img(key, alt, p, sizes="100vw", eager=False, extra=' data-parallax="6"')}</div></div>'''

# ---------------------------------------------------------------- pages
def build():
    page('index.html', title=None, desc=DESC, body=home, dark=True, jsonld=True)

    # Solutions listing
    page('soluciones.html', title='Soluciones', desc='Catálogo de Tecnologías del GRUPO CICSA: ' + ', '.join(s['name'] for s in ORDERED) + '.',
         current='soluciones.html', body=lambda p: page_hero(p, [('index.html', 'Inicio'), ('', 'Soluciones')], 'Soluciones',
            'Catálogo de Tecnologías del GRUPO CICSA', TAGLINE)
         + f'<section class="section" style="padding-top:0"><div class="container">{bento(p, "#todas")}</div></section>'
         + f'''<section class="section section--tight" id="todas" aria-labelledby="all-title" style="padding-top:0"><div class="container">
            <h2 id="all-title" class="visually-hidden">Todas las soluciones</h2><span class="rule"></span>
            <ol class="mega__list" role="list" style="grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));border-top:0">
            {''.join(f'<li><a href="soluciones/{s["slug"]}.html"><span class="num">{i:02d}</span>{esc(s["name"])}</a></li>' for i, s in enumerate(ORDERED, 1))}
            </ol></div></section>''' + cta(p))

    # Solution detail pages
    for idx, s in enumerate(ORDERED):
        build_solution(s, idx)

    # Services
    def services(p):
        steps = ''.join(f'''<li class="services-step" data-reveal><span class="num">{i:02d}</span><h2>{esc(t)}</h2><p>{d}</p></li>'''
                        for i, (t, d) in enumerate(STEPS, 1))
        return (page_hero(p, [('index.html', 'Inicio'), ('', 'Servicios')], 'Servicios', 'Servicios', SERV_P[0])
                + media_band(key_post(C['services']['covers'][0]), 'Servicios de ingeniería de CICSA', p)
                + f'''<section class="section"><div class="container--text prose" data-reveal><p class="lead" style="color:var(--text)">{SERV_P[1]}</p><p>{SERV_P[2]}</p></div></section>
<section class="section theme-dark" data-header-tone="dark" aria-labelledby="steps-title"><div class="container">
  <div class="section-head"><span class="eyebrow">Servicios</span><h2 id="steps-title" class="h2" data-split>Estudiamos, diseñamos, supervisamos, gestionamos e instalamos.</h2></div>
  <ol class="services-steps" role="list">{steps}</ol></div></section>''' + cta(p))
    page('servicios.html', title='Servicios', desc=strip_tags(SERV_P[0]), current='servicios.html', body=services)

    # Projects listing
    def projects(p):
        counts = [(s, len(s['projects'])) for s in ORDERED if s['projects']]
        chips = '<button type="button" class="chip" data-sol-chip="" aria-pressed="true">Todas <span class="count">' + str(len(PROJ)) + '</span></button>'
        chips += ''.join(f'<button type="button" class="chip" data-sol-chip="{s["slug"]}" aria-pressed="false">{esc(s["name"])} <span class="count">{n}</span></button>' for s, n in counts)
        sectors = sorted({pr['sector'] for pr in PROJ if pr['sector']})
        opts = '<option value="">Todos los sectores</option>' + ''.join(
            f'<option value="{slugify(g)}">{esc(g)} ({sum(1 for pr in PROJ if pr["sector"] == g)})</option>' for g in sectors)
        cards = ''.join(proj_card(pr, p) for pr in PROJ)
        return (page_hero(p, [('index.html', 'Inicio'), ('', 'Proyectos')], 'Antecedentes', 'Proyectos',
                          f'{len(PROJ)} antecedentes de obra documentados.')
                + f'''<section class="section" style="padding-top:0"><div class="container">
  <!-- TODO: Control de Temperatura, Refuerzo Estructural, Restauración y el resto de soluciones no tienen proyectos asociados en el sitio original; {sum(1 for pr in PROJ if not pr['sols'])} proyectos no tienen solución asignada. -->
  <div class="filters" data-filters>
    <div class="filters__group"><span class="filters__label" id="f-sol">Solución</span><div class="chips" role="group" aria-labelledby="f-sol">{chips}</div></div>
    <div class="filters__group" style="max-width:22rem"><label class="filters__label" for="f-sector">Sector / Industria</label>
      <div class="field"><select id="f-sector" data-sector-select style="min-height:2.75rem;padding:0 1rem;border-radius:var(--r-pill);border:1px solid var(--line-strong);background:var(--paper)">{opts}</select></div></div>
    <p class="results-count" data-results-count aria-live="polite">{len(PROJ)} proyectos</p>
  </div>
  <div class="card-grid">{cards}</div>
  <p data-empty hidden class="lead">No hay proyectos para esta combinación de filtros.</p>
</div></section>''' + cta(p))
    page('proyectos.html', title='Proyectos', desc=f'{len(PROJ)} antecedentes de obra de CICSA Ingeniería: corrosión, filtraciones, impermeabilización, desgaste y soluciones viales.',
         current='proyectos.html', body=projects)
    for i, pr in enumerate(PROJ):
        build_project(pr, i)

    # News
    def news(p):
        cards = ''.join(news_card(n, p) for n in C['news'])
        return (page_hero(p, [('index.html', 'Inicio'), ('', 'Noticias')], 'Noticias', 'Noticias', '')
                + f'<section class="section" style="padding-top:0"><div class="container"><div class="card-grid card-grid--feature">{cards}</div></div></section>' + cta(p))
    page('noticias.html', title='Noticias', desc='Noticias de CICSA Ingeniería: seminarios, webinars, congresos y jornadas técnicas.', current='noticias.html', body=news)
    for i, n in enumerate(C['news']):
        build_news(n, i)

    # About
    def about(p):
        a = C['about']['html']
        mision = re.search(r'<h2>Misión</h2><p>(.*?)</p>((?:<ul>.*?</ul>)+)', a)
        items = re.findall(r'<li>(.*?)</li>', mision.group(2))
        vision = re.search(r'<h2>Visión</h2><p>(.*?)</p>', a).group(1)
        return (page_hero(p, [('index.html', 'Inicio'), ('', 'Quiénes Somos')], 'Quiénes somos', 'Quiénes somos', ABOUT_P[0])
                + '''<div class="container"><div class="frame page-media page-media--parallax" data-reveal="clip" data-parallax-root>
<img src="assets/img/b-3.webp" srcset="assets/img/b-3-640.webp 640w, assets/img/b-3.webp 1000w" sizes="100vw" width="1000" height="750" alt="Ingenieros con cascos revisando planos sobre una mesa, vistos desde arriba" loading="lazy" decoding="async" data-parallax="6">
<!-- TODO: b-3.jpg mide 1000px de ancho; para esta banda a pantalla completa conviene una versión de al menos 2000px. --></div></div>'''
                + f'''<section class="section"><div class="container--text prose" data-reveal><p class="lead" style="color:var(--text)">{ABOUT_P[1]}</p><p>{ABOUT_P[2]}</p></div></section>
<section class="section" style="padding-top:0" aria-label="Misión y visión"><div class="container mv">
  <div class="mv__card" data-reveal><span class="eyebrow">01</span><h2>Misión</h2><p>{mision.group(1)}</p><ul>{''.join(f'<li>{x}</li>' for x in items)}</ul></div>
  <div class="mv__card" data-reveal><span class="eyebrow">02</span><h2>Visión</h2><p>{vision}</p></div>
</div></section>
<section class="section" style="padding-top:0" aria-labelledby="video-title"><div class="container--text">
  <h2 id="video-title" class="h3" style="margin-bottom:var(--s-5)">Video institucional</h2>{yt_block("Sm-Ig8_tnmw", "Video institucional CIC S A", p)}</div></section>'''
                + cta(p))
    page('quienes-somos.html', title='Quiénes Somos', desc=strip_tags(ABOUT_P[0]), current='quienes-somos.html', body=about, og_img='b-3')

    page('contacto.html', title='Contacto', desc='Contacto CICSA Ingeniería: Entre Ríos 2153, Rosario, Santa Fe. +54 9 341 694 1780 · cicsa@cicsaingenieria.com',
         current='contacto.html', body=contact, jsonld=True)

    page('404.html', title='Página no encontrada', desc=DESC, body=lambda p: f'''<section class="container notfound">
  <span class="eyebrow">Error 404</span>
  <h1 class="display" data-split="load">Esta página no existe.</h1>
  <p class="lead">Puede que el enlace haya cambiado con el nuevo sitio.</p>
  <div class="hero__ctas"><a class="btn btn--lg" href="{p}index.html">Ir al inicio {ICON["arrow"]}</a><a class="btn btn--lg btn--ghost" href="{p}soluciones.html">Ver soluciones</a></div>
</section>''')

def contact(p):
    return page_hero(p, [('index.html', 'Inicio'), ('', 'Contacto')], 'Contacto', 'Contacto', TAGLINE) + f'''
<section class="section" style="padding-top:0"><div class="container">
  <div class="contact__grid">
    <div class="contact__info">
      <div class="info-block" data-reveal><h2>Dirección</h2><address>Entre Ríos 2153<br>Rosario, Santa Fe</address></div>
      <div class="info-block" data-reveal><h2>Teléfonos</h2>
        <a href="tel:+5493416941780">+54 9 341 694 1780</a><small>Recepción</small>
        <a href="tel:+5493416705661">+54 9 341 670 5661</a><small>Administración</small></div>
      <div class="info-block" data-reveal><h2>Email</h2>
        <a href="mailto:cicsa@cicsaingenieria.com">cicsa@cicsaingenieria.com</a>
        <a href="mailto:tecnica@cicsaingenieria.com">tecnica@cicsaingenieria.com</a></div>
      <div class="info-block" data-reveal><h2>Redes</h2>
        <div class="social" style="margin-top:0"><a href="{FB}" target="_blank" rel="noopener" aria-label="CICSA en Facebook">{ICON["fb"]}</a><a href="{LI}" target="_blank" rel="noopener" aria-label="CICSA en LinkedIn">{ICON["li"]}</a></div></div>
    </div>
    <div class="contact__form" data-reveal>
      <!-- TODO: configurar data-endpoint con el servicio de envío real (el formulario original no tenía endpoint). Sin endpoint, se abre el cliente de correo con el mensaje armado. -->
      <form class="form" data-contact-form data-endpoint="" data-mailto="cicsa@cicsaingenieria.com" novalidate aria-labelledby="form-title">
        <h2 id="form-title" class="h3">Envianos tu consulta</h2>
        <div class="form__row form__row--2">
          <div class="field"><label for="f-nombre">Nombre y Apellido<span class="req" aria-hidden="true">*</span></label>
            <input id="f-nombre" name="nombre" type="text" autocomplete="name" required aria-describedby="f-nombre-error"><p class="field__error" id="f-nombre-error" aria-live="polite"></p></div>
          <div class="field"><label for="f-empresa">Empresa<span class="req" aria-hidden="true">*</span></label>
            <input id="f-empresa" name="empresa" type="text" autocomplete="organization" required aria-describedby="f-empresa-error"><p class="field__error" id="f-empresa-error" aria-live="polite"></p></div>
        </div>
        <div class="field"><label for="f-email">Email<span class="req" aria-hidden="true">*</span></label>
          <input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="f-email-error"><p class="field__error" id="f-email-error" aria-live="polite"></p></div>
        <div class="field"><label for="f-mensaje">Mensaje<span class="req" aria-hidden="true">*</span></label>
          <textarea id="f-mensaje" name="mensaje" rows="6" required aria-describedby="f-mensaje-error"></textarea><p class="field__error" id="f-mensaje-error" aria-live="polite"></p></div>
        <div class="visually-hidden" aria-hidden="true"><label for="f-website">No completar</label><input id="f-website" name="website" type="text" tabindex="-1" autocomplete="off"></div>
        <div class="form__status form__status--success" data-status="success" role="status" tabindex="-1" hidden>{ICON["check"]}<span data-status-text>Su mensaje fue enviado correctamente.</span></div>
        <div class="form__status form__status--error" data-status="error" role="alert" tabindex="-1" hidden>{ICON["alert"]}<span>No pudimos enviar el mensaje. Escribinos a <a href="mailto:cicsa@cicsaingenieria.com"><u>cicsa@cicsaingenieria.com</u></a> o llamá al +54 9 341 694 1780.</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:var(--s-4);align-items:center;justify-content:space-between">
          <p class="form__note">Los campos con * son obligatorios.</p>
          <button class="btn btn--lg btn--accent" type="submit">Enviar mensaje {ICON["arrow"]}</button>
        </div>
      </form>
    </div>
  </div>
  <div class="map" data-reveal>
    <div class="frame"><iframe src="{MAP}" title="Mapa: Entre Ríos 2153, Rosario, Santa Fe" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div>
    <div class="map__foot"><span>Entre Ríos 2153, S2000FXI Rosario, Santa Fe</span><a class="link-arrow" href="{MAP_LINK}" target="_blank" rel="noopener">Abrir en Google Maps {ICON["arrow-ne"]}</a></div>
  </div>
</div></section>'''

def toc_html(toc):
    if len(toc) < 2:
        return '<div></div>'
    li = ''.join(f'<li><a href="#{i}">{esc(t)}</a></li>' for i, t in toc)
    return f'<nav class="toc" aria-label="En esta página"><h2>En esta página</h2><ol>{li}</ol></nav>'

def pager(p, prev, nxt, base, label):
    a = ''
    if prev:
        a += f'<a href="{p}{base}/{prev["slug"]}.html"><span>← Anterior</span><strong>{esc(prev.get("name") or prev["title"])}</strong></a>'
    else:
        a += '<span></span>'
    if nxt:
        a += f'<a href="{p}{base}/{nxt["slug"]}.html"><span>Siguiente →</span><strong>{esc(nxt.get("name") or nxt["title"])}</strong></a>'
    return f'<nav class="pager" aria-label="{label}">{a}</nav>'

def build_solution(s, idx):
    p = '../'
    body_html, toc, _ = prose(s['html'], p, s['heading'])
    chapters = ''
    for ch in s.get('children', []):
        h, t2, _ = prose(ch['html'], p, ch['title'])
        cid = slugify(ch['title'])[:50]
        toc.append((cid, ch['title']))
        thumb = key_post(ch['thumb']) if ch.get('thumb') else (key_post(ch['covers'][0]) if ch['covers'] else None)
        media = f'<div class="frame" data-reveal="clip">{img(thumb, ch["title"], p, sizes="(min-width: 1100px) 46rem, 100vw")}</div>' if thumb else ''
        h = h.replace('<h2 id="', '<h3 id="').replace('</h2>', '</h3>')
        chapters += f'''<section class="chapter" aria-labelledby="{cid}">
  <header class="chapter__head"><h2 id="{cid}" class="h2" style="font-size:clamp(1.75rem,1.3rem + 2vw,3rem)">{esc(ch["title"])}</h2>{media}</header>
  <div class="prose">{h}</div></section>'''
    n = len(s['projects'])
    if n:
        ante = f'''<aside class="antecedentes" aria-label="Antecedentes"><div><h2>Antecedentes</h2><p>{n} {"proyecto documentado" if n == 1 else "proyectos documentados"} con esta solución.</p></div>
  <a class="btn" href="{p}proyectos.html?sol={s["slug"]}">Ver antecedentes {ICON["arrow"]}</a></aside>'''
    else:
        ante = '<!-- TODO: el sitio original enlaza "VER ANTECEDENTES" para esta solución pero no tiene proyectos asociados. -->'
    prev = ORDERED[idx - 1] if idx > 0 else None
    nxt = ORDERED[idx + 1] if idx < len(ORDERED) - 1 else None
    lead = s['sub'] if s['sub'] and s['sub'].lower() != s['heading'].lower() else ''
    def body(p):
        return (page_hero(p, [('index.html', 'Inicio'), ('soluciones.html', 'Soluciones'), ('', s['name'])], f'Solución {idx + 1:02d}', s['heading'], lead)
                + media_band(s['cover'], s['sub'] or s['heading'], p)
                + f'''<section class="section"><div class="container detail detail--toc">{toc_html(toc)}
  <div class="detail__main"><div class="prose">{body_html}</div>{chapters}{ante}</div></div></section>
<section class="section section--tight" style="padding-top:0"><div class="container">{pager(p, prev, nxt, "soluciones", "Otras soluciones")}</div></section>''' + cta(p))
    desc = strip_tags(body_html)[:155] or f'{s["heading"]} — CICSA Ingeniería.'
    page(f'soluciones/{s["slug"]}.html', title=s['heading'], desc=desc, current='soluciones.html', body=body, og_img=s['cover'])

def build_project(pr, i):
    def body(p):
        tags = ''.join(f'<a class="tag" href="{p}proyectos.html?sol={s["slug"]}">{esc(s["name"])}</a>' for s in pr['sols'])
        meta = f'<div class="page-hero__meta" data-reveal>{tags}</div>' if tags else ''
        facts = f'<section aria-labelledby="ficha" style="margin-bottom:var(--s-8)"><h2 id="ficha" class="h3" style="margin-bottom:var(--s-5)">Ficha de obra</h2>{render_facts(pr["facts"])}</section>' if pr['facts'] else ''
        prev = PROJ[i - 1] if i > 0 else None
        nxt = PROJ[i + 1] if i < len(PROJ) - 1 else None
        return (page_hero(p, [('index.html', 'Inicio'), ('proyectos.html', 'Proyectos'), ('', pr['title'])], 'Proyecto', pr['title'], long=len(pr['title']) > 50, meta=meta)
                + media_band(pr['thumbkey'], pr['title'], p)
                + f'''<section class="section"><div class="container"><div class="detail__main detail__main--center" data-reveal>{facts}<div class="prose">{pr["body"]}</div></div></div></section>
<section class="section section--tight" style="padding-top:0"><div class="container">{pager(p, prev, nxt, "proyectos", "Otros proyectos")}</div></section>''' + cta(p))
    desc = (pr['title'] + '. ' + strip_tags(pr['body'])[:120]).strip()
    page(f'proyectos/{pr["slug"]}.html', title=pr['title'], desc=desc, current='proyectos.html', body=body, og_img=pr['thumbkey'])

def build_news(n, i):
    nb, toc, _ = prose(n['html'], '../', n['title'])
    covers = [key_post(c) for c in n['covers']]
    def body(p):
        prev = C['news'][i - 1] if i > 0 else None
        nxt = C['news'][i + 1] if i < len(C['news']) - 1 else None
        extra = ''
        if len(covers) > 1:
            extra = '<div class="gallery">' + ''.join(f'<figure>{img(k, f"{n["title"]} — imagen {j}", p, sizes="(min-width: 1100px) 23rem, 100vw")}</figure>' for j, k in enumerate(covers[1:], 2)) + '</div>'
        return (page_hero(p, [('index.html', 'Inicio'), ('noticias.html', 'Noticias'), ('', 'Nota')], 'Noticias', n['title'], long=True)
                + (media_band(covers[0], n['title'], p) if covers else '')
                + f'''<section class="section"><div class="container"><article class="detail__main detail__main--center prose" data-reveal>{nb}{extra}</article></div></section>
<section class="section section--tight" style="padding-top:0"><div class="container">{pager(p, prev, nxt, "noticias", "Otras noticias")}</div></section>''' + cta(p))
    desc = (strip_tags(nb)[:155] or n['title'])
    page(f'noticias/{n["slug"]}.html', title=n['title'], desc=desc, current='noticias.html', body=body, og_img=covers[0] if covers else (n['thumbkey'] or 'post_17271008521'))


if __name__ == '__main__':
    import sys
    from seo import seo_files
    build()
    seo_files(sys.modules[__name__])
    print('pages:', len(list(ROOT.glob('*.html'))) + len(list(ROOT.glob('*/*.html'))))
    for w in sorted(set(WARN)):
        print('WARN', w)
