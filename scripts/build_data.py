"""Regenerate browser bundles and downloadable counts from canonical JSON.
Python 3 standard library only. This does not change corpus membership.
"""
from pathlib import Path
import collections, csv, itertools, json, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,str(ROOT/'sync_data.py')],check=True)
D=json.loads((ROOT/'companion.json').read_text())
P=json.loads((ROOT/'papers.json').read_text())
R=json.loads((ROOT/'research-map.json').read_text())
members={r['paperId'] for r in D['records']}
for p in P['papers']:
    p['statisticsEligible']=p['id'] in members
    p['venueInScope']=p['venue'] in D['meta']['allowedVenues']
P['meta']['updated']=D['meta']['updated']
for filename,data,var in [('papers',P,'GAIT_DATA'),('companion',D,'GAIT_COMPANION'),('research-map',R,'GAIT_MAP')]:
    (ROOT/(filename+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    js='papers.js' if filename=='papers' else filename+'-data.js'
    (ROOT/js).write_text('window.'+var+' = '+json.dumps(data,ensure_ascii=False)+';\n')
with (ROOT/'statistics-membership.csv').open('w',newline='') as f:
    w=csv.writer(f,lineterminator="\n");w.writerow(['paperId','citationKey','year','venue','title','datasets','modalities','archiveRow'])
    for r in D['records']:w.writerow([r['paperId'],r['citationKey'],r['year'],r['venue'],r['title'],'; '.join(r['datasets']),'; '.join(r['modalities']),r['archiveRow']])
ds=collections.Counter(v for r in D['records'] for v in sorted(set(r['datasets'])))
mods=collections.Counter(v for r in D['records'] for v in sorted(set(r['modalities'])))
major=['CASIA-B','OU-MVLP','Gait3D','GREW','BRIAR','SUSTech1K','CCPG'];co=collections.Counter()
for r in D['records']:
    present=[d for d in major if d in r['datasets']]
    for k in range(2,len(present)+1):co.update(itertools.combinations(present,k))
top=sorted(co.items(),key=lambda x:(-x[1],len(x[0]),x[0]))[:10]
summary=dict(recordCount=len(members),excludedRows=D['exclusions'],datasetCounts=dict(ds),modalities=dict(mods),yearCounts=dict(collections.Counter(r['year'] for r in D['records'])),results=len(D['results']),catalogueEntries=len(D['catalogue']),topCombinations=[dict(datasets=list(k),count=v,percentage=round(v/len(members)*100,1)) for k,v in top])
(ROOT/'data-audit.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
with (ROOT/'statistics-counts.csv').open('w',newline='') as f:
    w=csv.writer(f,lineterminator="\n");w.writerow(['kind','label','publications','denominator','percent'])
    for kind,counts in [('dataset',ds),('modality',mods)]:
        for label,value in sorted(counts.items(),key=lambda x:(-x[1],x[0])):w.writerow([kind,label,value,len(members),round(value/len(members)*100,1)])
print(f'Generated {len(members)}-publication snapshot; {sum(mods.values())} modality uses; {len(D["results"])} result records.')
