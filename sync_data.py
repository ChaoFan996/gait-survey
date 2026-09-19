from pathlib import Path
import json, re
p=Path(__file__).resolve().parent
d=json.loads((p/'papers.json').read_text())
assert len({x['id'] for x in d['papers']})==len(d['papers']), 'Duplicate IDs'
assert all(all(x.get(k) for k in ['title','authors','venue','abstract','motivation','idea','techniques']) for x in d['papers']), 'Missing fields'
assert not re.search(r'[\u4e00-\u9fff]',json.dumps(d,ensure_ascii=False)), 'Non-English text found'
d['meta']['counts']={'total':len(d['papers']),'complete':sum(x.get('complete',False) for x in d['papers'])}
(p/'papers.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
(p/'papers.js').write_text('window.GAIT_DATA = '+json.dumps(d,ensure_ascii=False)+';\n')
print(d['meta']['counts'])
