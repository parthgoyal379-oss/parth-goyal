"""Build static HTML from the homepage, project data and shared template."""
from pathlib import Path
from html import escape
from string import Template
import hashlib
import json
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
BASE = 'https://www.parthgoyal.me'


def build():
    OUT.mkdir(exist_ok=True)
    shutil.copytree(ROOT / 'assets', OUT / 'assets', dirs_exist_ok=True)
    for verification_file in ROOT.glob('google*.html'):
        shutil.copyfile(verification_file, OUT / verification_file.name)
    source = (ROOT / 'index.html').read_text(encoding='utf-8')
    projects = json.loads((ROOT / 'content/projects.json').read_text(encoding='utf-8'))
    template = Template((ROOT / 'templates/project.html').read_text(encoding='utf-8'))
    assert len({p['slug'] for p in projects}) == len(projects)

    # Discover fonts in the first response instead of through a blocking CSS hop.
    source = source.replace('<link rel="stylesheet" href="/assets/fonts.css">',
                            '<style>' + (ROOT / 'assets/fonts.css').read_text(encoding='utf-8') + '</style>')
    source = source.replace('<link rel="stylesheet" href="/assets/refinements.css">', '')
    source = source.replace('</head>', '<style>' + (ROOT / 'assets/refinements.css').read_text(encoding='utf-8') + '</style>\n</head>')

    # Hashed URLs allow long cache lifetimes without serving stale edits.
    for asset in (ROOT / 'assets').rglob('*'):
        if asset.suffix not in ('.woff2', '.js'):
            continue
        digest = hashlib.sha256(asset.read_bytes()).hexdigest()[:12]
        relative = asset.relative_to(ROOT).as_posix()
        versioned = asset.with_name(f'{asset.stem}.{digest}{asset.suffix}').relative_to(ROOT)
        shutil.copyfile(asset, OUT / versioned)
        source = source.replace('/' + relative, '/' + versioned.as_posix())
    (OUT / 'index.html').write_text(source, encoding='utf-8')
    pages = [('/', source)]
    homepage_head = re.search(r'<head>(.*?)</head>', source, re.S).group(1)
    graph = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', source, re.S).group(1))['@graph']
    identity = [node for node in graph if node['@type'] in ('Person', 'WebSite')]

    for project in projects:
        slug, name = project['slug'], project['name']
        path = f'/projects/{slug}/'
        url = BASE + path
        schema = {'@context': 'https://schema.org', '@graph': identity + [
            {'@type': 'WebPage', '@id': url + '#page', 'url': url, 'name': project['title'],
             'description': project['description'], 'author': {'@id': BASE + '/#person'},
             'isPartOf': {'@id': BASE + '/#website'}, 'breadcrumb': {'@id': url + '#breadcrumb'}},
            {'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
                {'@type': 'ListItem', 'position': 1, 'name': 'Parth Goyal', 'item': BASE + '/'},
                {'@type': 'ListItem', 'position': 2, 'name': name, 'item': url}]}]}
        head = re.sub(r'<script type="application/ld\+json">.*?</script>',
                      lambda _: '<script type="application/ld+json">' + json.dumps(schema, ensure_ascii=False) + '</script>', homepage_head, flags=re.S)
        head = re.sub(r'<title>.*?</title>', '<title>' + escape(project['title']) + '</title>', head)
        for fields, value in [('description|og:description|twitter:description', project['description']), ('og:title|twitter:title', project['title'])]:
            head = re.sub(r'(<meta (?:name|property)="(?:' + fields + r')" content=")[^"]*', lambda m: m[1] + escape(value, quote=True), head)
        head = head.replace(f'href="{BASE}/"', f'href="{url}"').replace(f'content="{BASE}/"', f'content="{url}"')
        fields = {key: escape(value) for key, value in project.items() if isinstance(value, str)}
        fields.update({
            'head': head,
            'source_link': f'<a class="btn-g" href="{escape(project["source"])}" target="_blank" rel="noopener noreferrer">View source on GitHub ↗</a>' if project['source'] else '',
            'implementation': ''.join(f'<h3>{escape(item["title"])}</h3><p>{escape(item["text"])}</p>' for item in project['implementation']),
            'flow': ''.join('<li>' + escape(step) + '</li>' for step in project['flow']),
            'stack': ''.join('<li>' + escape(tech) + '</li>' for tech in project['stack']),
            'related': ''.join(f'<a href="/projects/{p["slug"]}/"><strong>{escape(p["name"])} ↗</strong><span>{escape(p["category"])}</span></a>' for p in projects if p['slug'] != slug)
        })
        html = template.substitute(fields)
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
