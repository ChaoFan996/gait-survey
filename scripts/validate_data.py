"""Check publication identity, statistic scope, protocol integrity and link evidence."""
from pathlib import Path
import collections, csv, json, re
ROOT=Path(__file__).resolve().parents[1]
load=lambda name:json.loads((ROOT/name).read_text())
P=load('papers.json');D=load('companion.json');M=load('research-map.json');S=load('data/snapshot.json');A=load('data-audit.json')
ids={p['id'] for p in P['papers']};assert len(ids)==len(P['papers']),'Duplicate publication IDs'
members={r['paperId'] for r in D['records']};assert len(members)==len(D['records'])==S['publications']==D['meta']['recordCount']
assert members<=ids
assert S['period']==D['meta']['period'] and S['allowedVenues']==D['meta']['allowedVenues']
assert all(r['venue'] in S['allowedVenues'] and S['period'][0]<=r['year']<=S['period'][1] for r in D['records'])
assert sum(len(set(r['modalities'])) for r in D['records'])==S['modalityUses']==D['meta']['modalityUses']
assert all(len(r[field])==len(set(r[field])) for r in D['records'] for field in ['datasets','modalities'])
assert all(p.get('statisticsEligible')==(p['id'] in members) for p in P['papers'])
ds=collections.Counter(d for r in D['records'] for d in r['datasets'])
mods=collections.Counter(m for r in D['records'] for m in r['modalities'])
assert dict(ds)==A['datasetCounts'] and dict(mods)==A['modalities']
assert dict(collections.Counter(str(r['year']) for r in D['records']))==A['yearCounts']
for r in D['catalogue']:
    if r['archivedUsage'] is not None:assert r['archivedUsage']==ds[r.get('statisticsKey',r['dataset'])],r['dataset']
for name,var,js in [('papers','GAIT_DATA','papers.js'),('companion','GAIT_COMPANION','companion-data.js'),('research-map','GAIT_MAP','research-map-data.js')]:
    text=(ROOT/js).read_text();assert text.startswith('window.'+var+' = ')
    assert json.loads(text.split(' = ',1)[1].strip().removesuffix(';'))==load(name+'.json'),js+' is stale'
with (ROOT/'statistics-membership.csv').open() as f:assert {r['paperId'] for r in csv.DictReader(f)}==members
assert len({r['id'] for r in D['results']})==len(D['results'])
for r in D['results']:
    assert r['target'] in D['benchmarks'] and r['domain'] in ['within','cross']
    assert r['source']['url'].startswith(('https://','http://')),r['id']
    assert all(v is None or isinstance(v,(float,int)) and 0<=v<=100 for v in r['metrics'].values())
    assert (r['train']==r['target']) if r['domain']=='within' else (r['train']!=r['target']),r['id']
    assert r['configuration'] and r['resources'] and r['origin']
mini=[r for r in D['results'] if r['domain']=='within' and r['target']=='CCGR-Mini']
best={}
for r in mini:
    key=(r['method'],r['configuration'])
    if key not in best or r['metrics']['R1']>best[key]['metrics']['R1']:best[key]=r
big=[r for r in best.values() if r['method']=='BigGait'][0]
assert big['metrics']['R1']==88.0 and big['metrics'].get('mAP') is None and big['metrics'].get('mINP') is None
baseline=[r for r in best.values() if r['method']=='GaitBase'][0]
assert baseline['metrics']=={'R1':27.0,'mAP':24.9,'mINP':9.7}
cross=[r for r in D['results'] if r['domain']=='cross']
cell=lambda method,train,target,metric:next(r['metrics'][metric] for r in cross if r['method']==method and r['train']==train and r['target']==target)
assert round(cell('DeepGaitV2','CCGR-Mini','CASIA-B*','CL')-cell('DeepGaitV2','CCPG','CASIA-B*','CL'),1)==-13.6
nodes={n['id'] for n in M['nodes']};evidence={e['id']:e for e in M['evidence']}
assert len(nodes)==len(M['nodes']) and sum(n['group']=='dimension' for n in M['nodes'])==5
for link in M['links']:
    assert link['paperId'] in ids and link['nodeId'] in nodes
    e=evidence[link['evidenceId']]
    assert link['paperId'] in e['paperIds'] and link['nodeId']==e['nodeId'] and e['text']
    assert e['basis'] in ['Survey discussion','Curated paper evidence']
    if e['basis']=='Survey discussion':assert e['line']>0 and e['citationKeys']
    else:assert all(e.get(k) for k in ['sourceUrl','reviewedBy','reviewedOn'])
assert M['meta']['linkedPublications']==len({l['paperId'] for l in M['links']})
for script in re.findall(r'<script src="\./([^"]+)"',(ROOT/'index.html').read_text()):assert (ROOT/script).exists()
print(f'PASS: {len(ids)} catalogue references; {len(members)} corpus publications; {sum(mods.values())} modality uses; {len(D["results"])} experiments; {len(M["links"])} supported map links.')
