# sitemap.xml, robots.txt and llms.txt — generated from the same data as the pages.
import datetime, html


def seo_files(b):
    SITE, ROOT = b.SITE, b.ROOT
    today = datetime.date.today().isoformat()
    pages = ['index.html', 'soluciones.html', 'servicios.html', 'proyectos.html', 'noticias.html', 'quienes-somos.html', 'contacto.html']
    pages += [f'soluciones/{s["slug"]}.html' for s in b.ORDERED]
    pages += [f'proyectos/{pr["slug"]}.html' for pr in b.PROJ]
    pages += [f'noticias/{n["slug"]}.html' for n in b.C['news']]

    def prio(u):
        return '1.0' if u == 'index.html' else ('0.8' if '/' not in u else '0.6')

    urls = ''.join(f'  <url><loc>{SITE}{"" if u == "index.html" else u}</loc><lastmod>{today}</lastmod><priority>{prio(u)}</priority></url>\n'
                   for u in pages)
    (ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n'
                                      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                                      f'{urls}</urlset>\n', encoding='utf-8')

    (ROOT / 'robots.txt').write_text('User-agent: *\nAllow: /\nDisallow: /_build/\n\n'
                                     f'Sitemap: {SITE}sitemap.xml\n', encoding='utf-8')

    st = b.strip_tags
    L = ['# CICSA Ingeniería', '',
         f'> {b.TAGLINE} Empresa de ingeniería creada en el año 2008 en Rosario, Santa Fe, Argentina.', '',
         st(b.ABOUT_P[0]), '', st(b.ABOUT_P[1]), '',
         '## Contacto', '',
         '- Dirección: Entre Ríos 2153, S2000FXI Rosario, Santa Fe, Argentina',
         '- Teléfono (Recepción): +54 9 341 694 1780',
         '- Teléfono (Administración): +54 9 341 670 5661',
         '- Email: cicsa@cicsaingenieria.com',
         '- Email técnico: tecnica@cicsaingenieria.com',
         f'- Formulario de contacto: {SITE}contacto.html', '',
         '## Páginas principales', '',
         f'- [Soluciones]({SITE}soluciones.html): Catálogo de Tecnologías del GRUPO CICSA',
         f'- [Servicios]({SITE}servicios.html): {st(b.SERV_P[0])}',
         f'- [Proyectos]({SITE}proyectos.html): {len(b.PROJ)} antecedentes de obra',
         f'- [Noticias]({SITE}noticias.html)',
         f'- [Quiénes Somos]({SITE}quienes-somos.html)', '',
         '## Soluciones', '']
    L += [f'- [{html.unescape(s["heading"])}]({SITE}soluciones/{s["slug"]}.html)' + (f': {s["sub"]}' if s['sub'] else '')
          for s in b.ORDERED]
    L += ['', '## Proyectos', ''] + [f'- [{html.unescape(pr["title"])}]({SITE}proyectos/{pr["slug"]}.html)' for pr in b.PROJ]
    L += ['', '## Noticias', ''] + [f'- [{html.unescape(n["title"])}]({SITE}noticias/{n["slug"]}.html)' for n in b.C['news']]
    (ROOT / 'llms.txt').write_text('\n'.join(L) + '\n', encoding='utf-8')
