"""Check publication identity, statistic scope, protocol integrity and link evidence."""
from pathlib import Path
import collections, csv, datetime as dt, json, re
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
for name,var,js in [('papers','GAIT_DATA','papers.js'),('companion','GAIT_COMPANION','companion-data.js'),('research-map','GAIT_MAP','research-map-data.js'),('codebases','GAIT_CODEBASES','codebases-data.js')]:
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
cell=lambda method,train,target,metric:next(r['metrics'][metric] for r in cross if r['source']['key']=='ye2025biggergait' and r['method']==method and r['train']==train and r['target']==target)
# Source identity is part of an experiment: do not overwrite differing baselines.
keys=[(r['source']['key'],r['method'],r['configuration'],r['train'],r['target']) for r in cross]
assert len(keys)==len(set(keys)), 'Ambiguous cross-domain experiment'
gb={r['source']['key']:r['metrics'].get('R1') for r in cross if r['method']=='GaitBase' and r['train']=='CCPG' and r['target']=='SUSTech1K'}
assert gb['ye2025biggergait']==16.8 and gb['jin2025denoising']==17.3
assert all('R1' not in r['metrics'] for r in cross if r['source']['key']=='huang2026gaitmax'), 'Do not relabel GaitMax condition means as overall accuracy'
F=load('data/cross-domain-figure.json');by_id={r['id']:r for r in cross}
for key in ['gaitmax_cl','pose_transfer']:
    panel=F[key]
    for method,values,record_ids in zip(panel['methods'],panel['values'],panel['recordIds']):
        for direction,value,rid in zip(panel['directions'],values,record_ids):
            r=by_id[rid]
            assert (r['method'],r['train'],r['target'],r['source']['key'],r['metrics'][panel['metric']])==(method,direction['train'],direction['target'],panel['source']['key'],value)
for section,train in [('ccpg','CCPG'),('ccgr_mini','CCGR-Mini')]:
    for method,values in zip(F[section]['methods'],F[section]['values']):
        for (target,metric),value in zip([('SUSTech1K','R1'),('SUSTech1K','CL'),('CASIA-B*','CL'),('CCGR-Mini','R1')],values):
            assert cell(method,train,target,metric)==value
for rid,values in zip(F['silhouette_transfer']['recordIds'],F['silhouette_transfer']['values']):
    r=by_id[rid]
    assert r['source']['key']=='zheng2022gait' and r['method']=='GaitSet'
    assert [r['metrics'][m] for m in F['silhouette_transfer']['metrics']]==values
custom=[r for r in cross if r['source']['key']=='zheng2022gait' and 'GREW' in r['target']]
assert len(custom)==1 and custom[0]['target']=='GREW (1,000-ID subset)' and custom[0]['metrics']['R1']==43.86
poses=[r for r in cross if r['source']['key']=='fu2023gpgait']
assert len(poses)==48 and all(r['input']=='K' and r['protocol'] for r in poses)
assert next(r for r in poses if r['method']=='GaitTR' and r['train']=='OUMVLP-Pose' and r['target']=='CASIA-B')['metrics']['Mean']==7.84
assert (ROOT/'assets/cross-domain-transfer.pdf').read_bytes().startswith(b'%PDF-')
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
C=load('codebases.json')
assert len(C['records'])==C['meta']['recordCount']==len(members)
assert {r['paperId'] for r in C['records']}==members
corpus_years={r['paperId']:r['year'] for r in D['records']}
statuses=['available_claim','future_promise','resource_only','no_explicit_claim_found']
for r in C['records']:
    assert set(r)=={'paperId','title','method','year','venue','status','decision','sourceUrl','evidence','extraction'},'Only public audit fields may be exported'
    assert r['year']==corpus_years[r['paperId']] and r['status'] in statuses
    assert r['sourceUrl'].startswith('https://')
    if r['status'] in statuses[:2]:assert r['evidence']['page']>0 and r['evidence']['description']
    else:assert r['evidence'] is None
assert [r['year'] for r in C['annualClaims']]==list(range(*[C['meta']['period'][0],C['meta']['period'][1]+1]))
for a in C['annualClaims']:
    rows=[r for r in C['records'] if r['year']==a['year']]
    counts=collections.Counter(r['status'] for r in rows)
    assert a['n']==len(rows) and all(a[s]==counts[s] for s in statuses)
    assert a['claim_count']==counts[statuses[0]]+counts[statuses[1]]
    assert abs(a['claim_percent']-a['claim_count']/a['n']*100)<1e-8
repos=C['repositories'];assert len({r['repository'] for r in repos})==len(repos)
code_sources=load('data/code-source-links.json')
for pid,evidence in code_sources.items():
    assert pid in members and evidence['basis'] and evidence['checkedOn']
    assert next(r['sourceUrl'] for r in C['records'] if r['paperId']==pid)==evidence['url']
assert all(isinstance(r['stars'],int) and r['stars']>=0 and r['url']=='https://github.com/'+r['repository'] for r in repos)
running=0;previous=None
for d in C['history']:
    date=dt.date.fromisoformat(d['date'])
    assert previous is None or date-previous==dt.timedelta(days=1)
    assert isinstance(d['stars_recorded'],int) and d['stars_recorded']>=0
    running+=d['stars_recorded'];assert running==d['cumulative'];previous=date
for point in C['yearEnds']:
    assert point['cumulative']==[r['cumulative'] for r in C['history'] if int(r['date'][:4])<=point['year']][-1]
assert running==next(r['stars'] for r in repos if r['repository']=='ShiqiYu/OpenGait')
assert (ROOT/'assets/public-codebases-statistics.pdf').read_bytes().startswith(b'%PDF-')
for script in re.findall(r'<script src="\./([^"]+)"',(ROOT/'index.html').read_text()):assert (ROOT/script).exists()
print(f'PASS: {len(C["records"])} code-statement records; {sum(r["claim_count"] for r in C["annualClaims"])} explicit claims; {len(repos)} repositories; {len(C["history"])} daily history points.')
print(f'PASS: {len(ids)} catalogue references; {len(members)} corpus publications; {sum(mods.values())} modality uses; {len(D["results"])} experiments; {len(M["links"])} supported map links.')
