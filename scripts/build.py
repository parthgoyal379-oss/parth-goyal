"""Build the static public site; keep reports and tooling out of deployment."""
from pathlib import Path
import json
import re
import shutil
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
BASE = 'https://www.parthgoyal.me'


def build():
    OUT.mkdir(exist_ok=True)
    source = (ROOT / 'index.html').read_text(encoding='utf-8')
    (OUT / 'index.html').write_text(source, encoding='utf-8')
    for asset in ('assets',):
        shutil.copytree(ROOT / asset, OUT / asset, dirs_exist_ok=True)
    pages = [('/', source)]
    projects = [
        ('classpredictor', 'ClassPredictor', 'Academic prediction with React and Firebase',
         'I built ClassPredictor to help students see their class division trajectory from subject-wise marks, prerequisite dependencies, and risk scores.'),
        ('synapse', 'SYNAPSE', 'An AI habit support web app',
         'I built SYNAPSE with a five-step pattern mapping flow, AI-generated plans, daily check-ins, streaks, and relapse responses. SYNAPSE is live.'),
        ('verdikt', 'Verdikt', 'AI market news intelligence for India',
         'I built Verdikt to ingest Indian market news, deduplicate stories with SHA-256, and evaluate market impact with a Gemini multi-agent pipeline.'),
    ]
    cards = re.findall(r'<!-- (?:CLASSPREDICTOR|ClassPredictor|SYNAPSE|VERDIKT) -->\s*(<div class="pj-card.*?)(?=\s*<!--|\s*</div>\s*</section>)', source, re.S)
    # Project cards are already substantial first-person documentation. Reuse the
    # authored content rather than inventing implementation details or outcomes.
    assert len(cards) == 3, f'Expected three project cards, found {len(cards)}'
    css = re.search(r'<style>(.*?)</style>', source, re.S).group(1)
    for (slug, name, subtitle, description), card in zip(projects, cards):
        path = f'/projects/{slug}/'
        url = BASE + path
        title = f'{name} — {subtitle} | Parth Goyal'
        card = re.sub(r'\breveal\b', '', card)
        card = card.replace('<h3 class="pj-name">', '<h2 class="pj-name">').replace('</h3>', '</h2>')
        card = re.sub(r'<a href="/projects/[^\"]+/" class="pj-url u-line">Read project details</a>', '', card)
        schema = {'@context': 'https://schema.org', '@graph': [
            {'@type': 'WebPage', '@id': url+'#page', 'url': url, 'name': title,
             'description': description, 'author': {'@id': BASE+'/#person'},
             'isPartOf': {'@id': BASE+'/#website'}, 'breadcrumb': {'@id': url+'#breadcrumb'}},
            {'@type': 'BreadcrumbList', '@id': url+'#breadcrumb', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Parth Goyal', 'item': BASE+'/'},
                {'@type': 'ListItem', 'position': 2, 'name': name, 'item': url}]}]}
        head = re.search(r'<head>(.*?)</head>', source, re.S).group(1)
        head = re.sub(r'<style>.*?</style>', '', head, flags=re.S)
        head = re.sub(r'<script type="application/ld\+json">.*?</script>', '', head, flags=re.S)
        head = re.sub(r'<title>.*?</title>', '<title>'+escape(title)+'</title>', head)
        head = re.sub(r'(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*', lambda m: m[1]+escape(description, quote=True), head)
        head = re.sub(r'(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*', lambda m: m[1]+escape(title, quote=True), head)
        head = head.replace(f'href="{BASE}/"', f'href="{url}"').replace(f'content="{BASE}/"', f'content="{url}"')
        html = f'''<!doctype html><html lang="en"><head>{head}
<script type="application/ld+json">{json.dumps(schema)}</script>
<style>{css}
.project-main{{padding-top:7rem;overflow:hidden}} .project-main h1{{font:600 clamp(2.5rem,6vw,5rem) var(--serif)}}
nav{{background:var(--paper)}}
.project-main .intro{{max-width:65ch;margin:1.5rem 0 3rem;color:var(--dark-sub)}}
.project-main .stamp{{opacity:1;transform:rotate(-11deg)}}
.project-main .pj-name{{font-weight:500}} .breadcrumbs{{margin-bottom:2rem;color:var(--dark-sub)}}
</style></head><body>
<a href="#main" class="skip-link">Skip to content</a>
<nav aria-label="Primary"><a class="n-logo" href="/">P<span>·</span>G</a><div class="n-right"><a class="n-link" href="/#work">All projects</a><a class="n-link" href="/#contact">Contact</a></div></nav>
<main id="main" class="project-main s-pad" style="background:var(--dark);color:var(--paper-3)">
<div class="breadcrumbs"><a href="/">Parth Goyal</a> / {name}</div>
<h1>{name}</h1><p>{escape(subtitle)}</p><p class="intro">{escape(description)}</p>
{card}
<p style="margin-top:2rem">Project notes by <a href="/#about">Parth Goyal</a>. Descriptions and usage figures are my own reports; the linked demo provides public context.</p>
<p><a href="/#work">Explore my other projects</a> · <a href="mailto:Parthgoyal379@gmail.com">Contact me about this project</a></p>
</main><footer>© 2026 Parth Goyal</footer></body></html>'''
        destination = OUT / path.strip('/') / 'index.html'
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(html, encoding='utf-8')
        pages.append((path, html))
    (OUT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + '\n'.join(f'  <url><loc>{BASE}{path}</loc></url>' for path, _ in pages) + '\n</urlset>\n', encoding='utf-8')
    (OUT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n', encoding='utf-8')
    (OUT / '404.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Parth Goyal</title><h1>Page not found</h1><p><a href="/">Return to Parth Goyal’s portfolio</a></p></html>', encoding='utf-8')
    print(f'Built {len(pages)} indexable static pages into {OUT}')


if __name__ == '__main__':
    build()
