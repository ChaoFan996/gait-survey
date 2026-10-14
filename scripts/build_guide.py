"""Apply the dated manuscript reading guide without changing statistical membership."""
import csv
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def build():
    guide = json.loads((ROOT / 'data/survey-guide.json').read_text())
    mapping = json.loads((ROOT / 'research-map.json').read_text())
    papers = json.loads((ROOT / 'papers.json').read_text())['papers']
    by_key = {p['citationKey']: p for p in papers}
    by_id = {p['id']: p for p in papers}
    topics = guide['topics']
    replaced = {t['id'] for t in topics} | {t['replaces'] for t in topics if 'replaces' in t}
    old_learning = {
        'Transfer from Large Models and Semantic Guidance',
        'Generation as Data, Representation, and Supervision',
    }
    mapping['nodes'] = [n for n in mapping['nodes'] if n['id'] not in replaced]
    mapping['evidence'] = [e for e in mapping['evidence']
        if e['nodeId'] not in replaced and e['basis'] != 'Manuscript synthesis'
        and not (e['nodeId'] == 'learning' and e['subtopic'] in old_learning)]
    modalities = next(n for n in mapping['nodes'] if n['id'] == 'modalities')
    modalities['title'] = 'Ideal Gait Modality'

    def add_passage(topic, passage):
        paper_ids = [by_key[k]['id'] for k in passage['keys']]
        text = passage['text']
        eid = 'guide-' + hashlib.sha256((topic['id'] + '|' + text).encode()).hexdigest()[:12]
        mapping['evidence'].append(dict(
            id=eid, nodeId=topic['id'], section=topic['section'],
            subtopic=passage['heading'], text=text, citationKeys=passage['keys'],
            paperIds=paper_ids, basis='Manuscript synthesis',
            sourceDocument=guide['meta']['sourceDocument'], page=passage['page'],
            updated=guide['meta']['updated']))

    for topic in topics:
        mapping['nodes'].append({k: topic[k] for k in
            ['id', 'title', 'short', 'section', 'group', 'overview']})
        if topic.get('outlookNote'):
            mapping['nodes'][-1]['outlookNote'] = topic['outlookNote']
        for passage in topic['passages']:
            add_passage(topic, passage)
            if topic['id'] == 'synthetic':
                add_passage({'id': 'learning', 'section': 'IV-C'}, passage)
    for passage in guide['learningPassages']:
        add_passage({'id': 'learning', 'section': 'IV-C'}, passage)
    mapping['links'] = [dict(paperId=pid, nodeId=e['nodeId'], evidenceId=e['id'], basis=e['basis'])
        for e in mapping['evidence'] for pid in e['paperIds']]
    mapping['meta'].update(
        updated=guide['meta']['updated'], alignment=guide['meta'],
        linkedPublications=len({l['paperId'] for l in mapping['links']}),
        cataloguePublications=len(papers),
        policy='Links identify survey discussions, not demonstrated capabilities. Original indexed passages retain their manuscript-line provenance. Updated topic summaries are labeled Manuscript synthesis and carry PDF-page provenance. Unmarked cells mean no indexed discussion link.')
    (ROOT / 'research-map.json').write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + '\n')
    (ROOT / 'survey-guide-data.js').write_text('window.GAIT_GUIDE = ' + json.dumps(guide, ensure_ascii=False) + ';\n')
    nodes = {n['id']: n for n in mapping['nodes']}
    with (ROOT / 'relationships.csv').open('w', newline='') as f:
        writer = csv.writer(f, lineterminator='\n')
        writer.writerow(['paperId', 'method', 'node', 'section', 'basis', 'evidence', 'sourceUrl'])
        for e in mapping['evidence']:
            for pid in e['paperIds']:
                p = by_id[pid]
                writer.writerow([pid, p.get('method') or p['title'], nodes[e['nodeId']]['title'],
                    e['section'], e['basis'], e['text'], e.get('sourceUrl') or p.get('url', '')])
    print('Applied manuscript guide: 8 progress rows; 6 synthesis/outlook topics.')


if __name__ == '__main__':
    build()
