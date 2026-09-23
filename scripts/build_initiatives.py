"""Build the browser bundle and BibTeX from the curated initiative records."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

def bibtex(record):
    c = record['citation']
    fields = {k: c[k] for k in ('author', 'title', 'booktitle', 'year', 'pages', 'doi', 'howpublished', 'note', 'url') if c.get(k)}
    return '@' + c.get('entryType', 'misc') + '{' + c['key'] + ',\n' + ',\n'.join(
        '  ' + k + ' = {' + str(v) + '}' for k, v in fields.items()) + '\n}'

def build():
    data = json.loads((ROOT / 'initiatives.json').read_text())
    (ROOT / 'initiatives-data.js').write_text('window.GAIT_INITIATIVES = ' + json.dumps(data, ensure_ascii=False) + ';\n')
    citations = {}
    for record in data['records']:
        key = record['citation']['key']
        entry = bibtex(record)
        assert key not in citations or citations[key] == entry, f'Conflicting citation: {key}'
        citations[key] = entry
    (ROOT / 'initiatives.bib').write_text('\n\n'.join(citations.values()) + '\n')
    print(f'Generated {len(data["records"])} initiative records and citations.')

if __name__ == '__main__':
    build()
