"""Rebuild citation-grounded method/outlook links from an authorized manuscript.
Usage: python3 scripts/build_research_map.py --manuscript /path/to/main.tex
Only section excerpts are exported; the manuscript itself is not published.
"""
import argparse
import collections
import csv
import datetime
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--manuscript', type=Path, required=True)
args = parser.parse_args()
tex = args.manuscript.read_text()
catalogue = json.loads((ROOT/'papers.json').read_text())
papers = catalogue['papers']
by_key = collections.defaultdict(list)
for paper in papers:
    by_key[paper['citationKey']].append(paper)
aliases = {'guo2024clgait': 'guo2024camera', 'guo2025sposgait': 'guo2025gait', 'yu2022interclass': 'yu2022generalized'}
by_id = {p['id']: p for p in papers}
dimensions = [
    ('modalities','Gait Modalities and Representations','Modalities','IV-A'),
    ('backbones','Gait Backbone Architectures','Backbones','IV-B'),
    ('learning','Gait Learning Frameworks','Learning','IV-C'),
    ('robustness','Handling Real-World Noise','Robustness','IV-D'),
    ('metrics','Gait Metric Designs','Metrics','IV-E'),
]
nodes = [dict(id=i,title=title,short=short,section=sec,group='dimension') for i,title,short,sec in dimensions]
dimension_by_title = {n['title']: n for n in nodes}
outlook_ids = {
    'Large-Scale In-the-Wild Benchmarks: Coverage and Attribution.': ('coverage','Benchmark coverage'),
    'Multimodal Gait Modeling: Complementarity under Missing Data.': ('missing-inputs','Missing inputs'),
    'Whole-Body Recognition: Heterogeneous Biometric Fusion.': ('whole-body','Whole-body recognition'),
    'Robust Gait Recognition: Interacting Failures.': ('compound-noise','Interacting failures'),
    'Generalized Gait Recognition: Unseen Acquisition and Time.': ('generalization','Generalization'),
    'Open-Set Recognition: Stable Decisions over Time.': ('open-set','Open-set recognition'),
}
other_ids = {
    'Gait Foundation Models': ('foundation','Foundation models','V-B'),
    'Gait Representation Learning for Healthcare': ('healthcare','Healthcare','V-C'),
    'Gait Recognition for Robotics': ('robotics','Robotics','V-D'),
}
refs = {'fig.intro':'1','fig.information':'2','fig.system':'3','fig.milestone':'4','fig.dataset':'5','fig.modality':'6','tab:focus':'I','tab:benchmarks':'II','tab:sota':'III','tab:transfer':'IV','tab:agenda':'V','sec:backbones':'IV-B','sec:learning':'IV-C','sec:scoring':'IV-E','sec:robustness':'IV-D','sec:representations':'IV-A'}

def plain(s):
    s=re.sub(r'(?m)(?<!\\)%.*','',s)
    s=re.sub(r'\\(?:section|subsection)\{[^}]+\}','',s)
    s=re.sub(r'\\cite\{[^}]+\}','',s)
    s=re.sub(r'\\(?:label)\{[^}]+\}','',s)
    s=re.sub(r'\\ref\{([^}]+)\}',lambda m:refs.get(m[1],m[1]),s)
    s=re.sub(r'\\(?:begin|end)\{[^}]+\}','',s)
    s=re.sub(r'\\(?:item|noindent)\b','',s)
    s=s.replace(r'\%','%').replace(r'\&','&').replace('~',' ').replace('---','—').replace('--','–')
    s=re.sub(r'\\[a-zA-Z]+\*?','',s)
    s=s.replace('$','').replace('{','').replace('}','')
    s=re.sub(r'\s+',' ',s).strip()
    return re.sub(r'\s+([,.;:])',r'\1',s)

def resolve(key):
    options=by_key[aliases.get(key,key)]
    if len(options)==1:return options[0]
    # Manuscript uses the CVPR ICDNet publication, not the PR alpha-blending paper.
    if key=='li2020gait':return by_id['li2020gait-cvpr-2020']
    raise ValueError(f'Unresolved or ambiguous manuscript citation: {key}')

section='';sub='';topic='';active=None
evidence=[];seen_nodes={n['id'] for n in nodes};passages=collections.defaultdict(list)
for match in re.finditer(r'\S[\s\S]*?(?=\n\s*\n|\Z)',tex):
    block=match.group();line=tex[:match.start()].count('\n')+1
    m=re.search(r'\\section\{([^}]+)\}',block)
    if m:section=m[1];sub='';topic='';active=None
    m=re.search(r'\\subsection\{([^}]+)\}',block)
    if m:sub=m[1];topic='';active=None
    m=re.search(r'\\(?:item\s*|noindent\s*)?\\textbf\{([^}]+)\}',block)
    if m:topic=m[1]
    if section=='Advances in Methods':
        active=dimension_by_title.get(sub)
    elif section=='Challenges and Outlooks':
        if sub=='Real-World Gait Recognition' and topic in outlook_ids:
            nid,title=outlook_ids[topic];active=dict(id=nid,title=title,short=title,section='V-A',group='outlook')
        elif sub in other_ids:
            nid,title,sec=other_ids[sub];active=dict(id=nid,title=title,short=title,section=sec,group='outlook')
    elif section=='Privacy Concerns and Potential Solutions':
        active=dict(id='privacy',title='Privacy and responsible use',short='Privacy',section='VI',group='outlook')
    else:active=None
    if not active:continue
    if active['id'] not in seen_nodes:nodes.append(active);seen_nodes.add(active['id'])
    if '\\begin{table' in block or '\\begin{figure' in block:continue
    keys=list(dict.fromkeys(k.strip() for group in re.findall(r'\\cite\{([^}]+)\}',block) for k in group.split(',')))
    text=plain(block)
    # Node introductions support the agenda cards; links require explicit citations.
    clean=re.sub(r'^'+re.escape(plain('\\item \\textbf{'+topic+'}'))+r'\s*','',text) if topic else text
    if clean:passages[active['id']].append(clean)
    if not keys:continue
    if not clean:continue
    eid='e-'+hashlib.sha256((active['id']+'|'+clean).encode()).hexdigest()[:12]
    evidence.append(dict(id=eid,nodeId=active['id'],section=active['section'],subtopic=topic.rstrip('.'),line=line,text=clean,citationKeys=keys,paperIds=list(dict.fromkeys(resolve(k)['id'] for k in keys)),basis='Survey discussion'))

links=[]
for e in evidence:
    for pid in e['paperIds']:links.append(dict(paperId=pid,nodeId=e['nodeId'],evidenceId=e['id'],basis=e['basis']))
extra_path=ROOT/'data/relationship-additions.json'
extras=json.loads(extra_path.read_text()) if extra_path.exists() else []
for extra in extras:
    assert extra['paperId'] in by_id and extra['nodeId'] in seen_nodes
    assert all(extra.get(k) for k in ['evidence','sourceUrl','reviewedBy','reviewedOn'])
    eid='curated-'+hashlib.sha256(json.dumps(extra,sort_keys=True).encode()).hexdigest()[:12]
    node=next(n for n in nodes if n['id']==extra['nodeId'])
    evidence.append(dict(id=eid,nodeId=node['id'],section=node['section'],subtopic=extra.get('relationship','Editorial relationship'),text=extra['evidence'],paperIds=[extra['paperId']],citationKeys=[],basis='Curated paper evidence',sourceUrl=extra['sourceUrl'],reviewedBy=extra['reviewedBy'],reviewedOn=extra['reviewedOn']))
    links.append(dict(paperId=extra['paperId'],nodeId=node['id'],evidenceId=eid,basis='Curated paper evidence'))
for n in nodes:n['overview']=' '.join(passages[n['id']][:2])
try:
    revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=args.manuscript.parent,text=True).strip()
except subprocess.CalledProcessError:revision='unversioned'
meta=dict(updated=datetime.date.today().isoformat(),manuscriptBase=revision,manuscriptSha256=hashlib.sha256(tex.encode()).hexdigest(),policy='Links index explicit discussions in Sections IV–VI. A paper may connect to several dimensions or outlooks. Unmarked cells mean no indexed discussion link, not absence of a capability. Additional editorial links require a source excerpt and a recorded review.',statisticsPolicy='Aggregate relationship counts use only the fixed 160-publication corpus. The browseable map also includes foundational, related and 2026 references; these do not enter those counts.',linkedPublications=len({e['paperId'] for e in links}),cataloguePublications=len(papers))
result=dict(meta=meta,nodes=nodes,evidence=evidence,links=links,aliases=aliases)
(ROOT/'research-map.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
(ROOT/'research-map-data.js').write_text('window.GAIT_MAP = '+json.dumps(result,ensure_ascii=False)+';\n')
with (ROOT/'relationships.csv').open('w',newline='') as f:
    writer=csv.writer(f,lineterminator="\n");writer.writerow(['paperId','method','node','section','basis','evidence','sourceUrl'])
    for link in links:
        p=by_id[link['paperId']];e=next(e for e in evidence if e['id']==link['evidenceId']);n=next(n for n in nodes if n['id']==link['nodeId'])
        writer.writerow([p['id'],p.get('method') or p['title'],n['title'],n['section'],e['basis'],e['text'],e.get('sourceUrl') or p.get('url','')])
print(json.dumps(dict(nodes=len(nodes),evidence=len(evidence),links=len(links),linkedPublications=meta['linkedPublications']),indent=2))
