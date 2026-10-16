"""Validate the generated URL inventory, metadata, JSON-LD and local links."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist'
BASE = 'https://www.parthgoyal.me'


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.json = []
        self.recording = False
        self.buffer = ''
        self.title = ''
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.recording = True
            self.buffer = ''
        if tag == 'title':
            self.in_title = True

    def handle_data(self, data):
        if self.recording:
            self.buffer += data
        if self.in_title:
            self.title += data

    def handle_endtag(self, tag):
        if tag == 'script' and self.recording:
            self.json.append(json.loads(self.buffer))
            self.recording = False
        if tag == 'title':
            self.in_title = False


inventory = []
for file in sorted(OUT.rglob('index.html')):
    p = Page()
    p.feed(file.read_text(encoding='utf-8'))
    path = '/' + file.relative_to(OUT).as_posix().removesuffix('index.html')
    meta = {a.get('name', a.get('property')): a.get('content') for t, a in p.tags if t == 'meta'}
    canonicals = [a['href'] for t, a in p.tags if t == 'link' and a.get('rel') == 'canonical']
    assert canonicals == [BASE + path], (path, canonicals)
    assert p.title and meta.get('description') and meta.get('robots') == 'index, follow'
    assert meta['og:url'] == BASE + path
    assert meta.get('og:image') and meta.get('twitter:image')
    assert sum(t == 'h1' for t, _ in p.tags) == 1
    assert sum(t == 'main' for t, _ in p.tags) == 1
    for tag, attrs in p.tags:
        for attr in ('href', 'src'):
            value = attrs.get(attr, '')
            if value.startswith('/') and not value.startswith('//'):
                target = OUT / unquote(urlsplit(value).path.lstrip('/'))
                assert target.exists(), (file, value)
    schemas = [node for block in p.json for node in block['@graph']]
    for node in schemas:
        assert node.get('@type') and node.get('@id')
        if node['@type'] == 'ProfilePage':
            assert node['mainEntity']['@id'] == BASE + '/#person'
        if node['@type'] == 'BreadcrumbList':
            assert [i['position'] for i in node['itemListElement']] == [1, 2]
            assert node['itemListElement'][-1]['item'] == BASE + path
    inventory.append({'path': path, 'title': p.title, 'description': meta['description'], 'canonical': canonicals[0], 'robots': meta['robots'], 'schema': [n['@type'] for n in schemas]})
assert len({i['title'] for i in inventory}) == len(inventory)
assert len({i['description'] for i in inventory}) == len(inventory)
sitemap = ET.parse(OUT / 'sitemap.xml')
locations = [e.text for e in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert set(locations) == {i['canonical'] for i in inventory}
assert f'Sitemap: {BASE}/sitemap.xml' in (OUT / 'robots.txt').read_text()
(ROOT / 'audit' / 'metadata-inventory.json').write_text(json.dumps(inventory, indent=2, ensure_ascii=False), encoding='utf-8')
print(f'PASS: {len(inventory)} pages; unique metadata, canonicals, local targets, sitemap XML, JSON-LD relationships.')
