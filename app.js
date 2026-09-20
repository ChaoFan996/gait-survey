'use strict';
(() => {
const $=id=>document.getElementById(id), data=window.GAIT_DATA;
if(!data?.papers){$('paper-list').innerHTML='<div class="empty-state"><h3>The catalogue could not be loaded.</h3><p>Please reload this page.</p></div>';return;}
const papers=data.papers, PAGE_SIZE=12, fields=['motivation','idea','techniques'];
const state={query:'',year:'',venue:'',sort:'newest',field:'all',page:1};
let timer=null, filtered=[], cloudTerms=[], lastFocus=null;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[–—]/g,'-');
const formatAuthors=s=>String(s||'').split(/\s+and\s+/).map(n=>{const a=n.split(',');return n.trim()==='others'?'et al.':a.length===2?a[1].trim()+' '+a[0].trim():n.trim();}).join(', ');
const safeURL=s=>/^https?:\/\//i.test(s||'')?s:'';
papers.forEach(p=>{p.searchText=norm([p.method,p.title,p.authors,p.citationKey,p.venue,p.year,p.motivation,p.idea,p.techniques,p.abstract,p.inputs,p.backbone,p.datasets,...(p.sections||[])].join(' '));});
const years=[...new Set(papers.map(p=>p.year).filter(Boolean))].sort((a,b)=>b-a);
const venues=[...new Set(papers.map(p=>p.venue).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
for(const y of years)$('year').add(new Option(y,y));
for(const v of venues)$('venue').add(new Option(v,v));
$('total-count').textContent=papers.length;
$('about-provenance').textContent=data.meta.description;
function queryTokens(q){return (norm(q).match(/"[^"]+"|\S+/g)||[]).map(s=>s.replace(/^"|"$/g,''));}
function findPapers(ignoreYear=false){const tokens=queryTokens(state.query);return papers.filter(p=>(ignoreYear||!state.year||String(p.year)===state.year)&&(!state.venue||p.venue===state.venue)&&tokens.every(t=>p.searchText.includes(t)));}
function stopPlayback(){if(timer)clearInterval(timer);timer=null;$('play').setAttribute('aria-pressed','false');$('play').innerHTML='<span aria-hidden="true">▶</span>';$('play').setAttribute('aria-label','Animate word cloud by year');}
function syncURL(){const q=new URLSearchParams(location.search);for(const k of ['q','year','venue','sort','field'])q.delete(k);if(state.query)q.set('q',state.query);if(state.year)q.set('year',state.year);if(state.venue)q.set('venue',state.venue);if(state.sort!=='newest')q.set('sort',state.sort);if(state.field!=='all')q.set('field',state.field);const p=new URLSearchParams(location.search).get('paper');if(p)q.set('paper',p);try{history.replaceState(null,'',location.pathname+(q.size?'?'+q:'')+location.hash);}catch{}}
function setFilter(key,value,{playback=false}={}){if(!playback)stopPlayback();state[key]=String(value);state.page=1;render();}
function render(){
  $('search').value=state.query;$('year').value=state.year;$('venue').value=state.venue;$('sort').value=state.sort;$('cloud-field').value=state.field;
  filtered=findPapers();
  filtered.sort((a,b)=>state.sort==='az'?(a.method||a.title).localeCompare(b.method||b.title):state.sort==='oldest'?(a.year||0)-(b.year||0):(b.year||0)-(a.year||0));
  state.page=Math.min(state.page,Math.max(1,Math.ceil(filtered.length/PAGE_SIZE)));
  $('result-count').textContent=filtered.length;
  const complete=filtered.filter(p=>p.complete).length;
  $('result-description').textContent=`${filtered.length} ${filtered.length===1?'paper':'papers'}${filtered.length!==papers.length?' of '+papers.length:''} · ${complete} with three-field summaries`;
  $('active-filters').innerHTML=[['query',state.query],['year',state.year],['venue',state.venue]].filter(x=>x[1]).map(([k,v])=>`<button class="filter-chip" data-clear="${k}" aria-label="Remove ${escape(k)} filter: ${escape(v)}">${escape(v)}<span aria-hidden="true">×</span></button>`).join('');
  $('active-filters').querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.clear,'')));
  renderPapers();renderCloud();renderYears();syncURL();
}
function renderPapers(){
  const start=(state.page-1)*PAGE_SIZE, rows=filtered.slice(start,start+PAGE_SIZE);
  $('paper-list').innerHTML=rows.length?rows.map(p=>`<article class="paper" data-paper="${escape(p.id)}"><div class="paper-top"><div><button class="paper-name" data-open="${escape(p.id)}">${escape(p.method||p.title||p.citationKey)}<span class="detail-arrow" aria-hidden="true">↗</span></button>${p.method&&p.title?`<p class="paper-title">${escape(p.title)}</p>`:''}</div><div class="paper-meta"><span class="venue-tag">${escape(p.venue)}</span><span class="year-tag">${p.year||'—'}</span></div></div><p class="paper-authors">${escape(formatAuthors(p.authors)||'Author metadata pending verification')}</p>${p.complete?`<div class="summary-grid">${fields.map((f,i)=>`<p><span class="mobile-label">${['CORE MOTIVATION','KEY IDEA','MAIN TECHNIQUES'][i]}</span>${escape(p[f])}</p>`).join('')}</div>`:'<p class="pending-note">Bibliographic reference · A structured summary has not yet been added.</p>'}<details class="paper-abstract"><summary>Abstract${p.abstractKind==='Abstract summary'?' <span>· Summary</span>':''}</summary><div><p>${escape(p.abstract||'The abstract has not yet been verified.')}</p>${p.abstractSource?`<p class="abstract-source">${escape(p.abstractKind||'Abstract')} · ${escape(p.abstractSource)}${safeURL(p.abstractUrl||p.url)?` · <a href="${escape(p.abstractUrl||p.url)}" target="_blank" rel="noopener noreferrer">Source ↗</a>`:''}</p>`:''}</div></details><div class="paper-foot">${p.inputs?`<span class="topic-tag">${escape(p.inputs)}</span>`:''}${p.backbone&&p.backbone!=='Not extracted'?`<span class="topic-tag">${escape(p.backbone)}</span>`:''}${p.publicationStatus?`<span class="status-tag">${escape(p.publicationStatus)}</span>`:''}${p.scope!=='Survey collection'?`<span class="related-label">${escape(p.scope)}</span>`:''}</div></article>`).join(''):'<div class="empty-state"><h3>No papers match these filters.</h3><p>Try a broader keyword, another venue or a different year.</p><button id="empty-reset">Clear all filters</button></div>';
  $('paper-list').querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>openPaper(b.dataset.open)));
  $('empty-reset')?.addEventListener('click',reset);
  const pages=Math.ceil(filtered.length/PAGE_SIZE);
  $('pagination').innerHTML=pages>1?`<button id="previous" ${state.page===1?'disabled':''}>← Previous</button><span>${start+1}–${Math.min(start+PAGE_SIZE,filtered.length)} of ${filtered.length}</span><button id="next" ${state.page===pages?'disabled':''}>Next →</button>`:'';
  for(const [id,d] of [['previous',-1],['next',1]])$(id)?.addEventListener('click',()=>{state.page+=d;renderPapers();$('results').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
}
const STOP=new Set('a an the for of on and or in to from with by via as at is are be being been this that these those their its it our we can may using use used uses based approach approaches method methods model models network networks framework frameworks recognition gait improve improving improved enhancement enhance learning learn learned proposed propose effective efficient robust towards toward across better new novel paper study task tasks features feature representation representations various different address addressing enable enables capture capturing leverage leveraging end based together both more within through into without need unified single multiple not under while also improve obtain obtained provide provides proposed proposing identify addressing address existing utilize utilizing using achieve achieving enable enabled enhance propose study based reduce reducing contain containing information novel new based high low limitations limitation limited difficult challenge challenges capture based better improve improving real world well performance accuracy effectiveness different additionally first second specific task related purpose perspective' .split(' '));
const PHRASES=['self-supervised','cross-view','cross-modal','cross-domain','cross-covariate','cloth-changing','clothing change','in-the-wild','point cloud','body shape','multi-modal','multimodal','spatio-temporal','spatial-temporal','counterfactual','contrastive','distillation','disentanglement','occlusion','silhouette','skeleton','diffusion','transformer','attention','temporal','spatial','motion','fusion','causal','privacy','RGB','LiDAR','pretraining','adaptation','generative','robustness','reconstruction','alignment','local','global','identity','covariates','semantics','video','clothing','3D'];
function termFrequency(rows){
  const count=new Map();
  for(const p of rows){if(!p.complete||p.publicationStatus==='Withdrawn')continue;let text=norm((state.field==='all'?fields:[state.field]).map(f=>p[f]||'').join(' '));const seen=new Set();
    for(const phrase of PHRASES){const ph=norm(phrase);if(text.includes(ph)){seen.add(phrase);text=text.split(ph).join(' ');}}
    for(let t of text.match(/[a-z][a-z-]{2,}/g)||[]){t=t.replace(/^-+|-+$/g,'');if(t.endsWith('s')&&t.length>5&&!/(ss|sis|ics)$/.test(t))t=t.slice(0,-1);if(t.length>3&&!STOP.has(t))seen.add(t);}
    for(const t of seen)count.set(t,(count.get(t)||0)+1);
  }
  return [...count].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,55);
}
function hash(s){let n=0;for(const c of s)n=(n*31+c.charCodeAt(0))>>>0;return n;}
function renderCloud(){
  cloudTerms=termFrequency(filtered.filter(p=>p.statisticsEligible));const host=$('word-cloud'),width=host.clientWidth||690,height=host.clientHeight||184;
  if(!cloudTerms.length){host.innerHTML='<div class="cloud-empty">No summary terms in the statistical scope.</div>';$('cloud-caption').textContent='The word cloud uses the specified venues and the frozen 2020–2025 membership.';return;}
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),boxes=[],draw=[],max=cloudTerms[0][1],min=cloudTerms.at(-1)[1];
  const colors=['#1745a3','#265fa6','#526d92','#f05a28','#8292a9','#234773'];
  for(let n=0;n<cloudTerms.length;n++){
    const [term,count]=cloudTerms[n];let size=13+(max===min?.45:(Math.sqrt(count)-Math.sqrt(min))/(Math.sqrt(max)-Math.sqrt(min)))*21;
    ctx.font=`550 ${size}px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif`;
    let w=ctx.measureText(term).width+10,h=size*1.12+4,found=null;
    if(w>width*.86){size*=width*.86/w;w=width*.86;h=size*1.12+4;}
    for(let i=0;i<2200;i++){
      const angle=i*.32+(hash(term)%11),radius=Math.sqrt(i/2200),x=width/2+Math.cos(angle)*radius*width*.57-w/2,y=height/2+Math.sin(angle)*radius*height*.60-h/2;
      if(x<3||y<4||x+w>width-3||y+h>height-4)continue;
      if(!boxes.some(b=>x<b.x+b.w&&x+w>b.x&&y<b.y+b.h&&y+h>b.y)){found={x,y,w,h};break;}
    }
    if(!found)continue;boxes.push(found);
    draw.push(`<text class="cloud-word" x="${(found.x+w/2).toFixed(1)}" y="${(found.y+h*.74).toFixed(1)}" text-anchor="middle" font-size="${size.toFixed(1)}" fill="${colors[n===0?0:n===1?3:n%colors.length]}" role="button" tabindex="0" data-term="${escape(term)}" aria-label="Filter ${escape(term)}: ${count} papers"><title>${escape(term)} · ${count} ${count===1?'paper':'papers'}</title>${escape(term)}</text>`);
  }
  host.innerHTML=`<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" aria-label="Research term frequencies">${draw.join('')}</svg>`;
  host.querySelectorAll('[data-term]').forEach(el=>{const go=()=>setFilter('query',el.dataset.term);el.addEventListener('click',go);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});});
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)host.animate([{opacity:.3},{opacity:1}],{duration:280});
  $('cloud-caption').textContent=`Document frequency · ${filtered.filter(p=>p.complete&&p.statisticsEligible).length} papers in the statistics scope${state.year?' · '+state.year:''}`;
}
function renderYears(){const rows=findPapers(true).filter(p=>p.statisticsEligible),counts=new Map();for(let y=2020;y<=2026;y++)counts.set(y,rows.filter(p=>p.year===y).length);const max=Math.max(1,...counts.values()),maxH=matchMedia('(max-width:700px)').matches?42:98;$('year-chart').innerHTML=[...counts].map(([y,n])=>`<button class="year-bar${state.year===String(y)?' active':''}" data-year="${y}" aria-label="${y}: ${n} papers" aria-pressed="${state.year===String(y)}"><span class="bar-count">${n}</span><span class="bar" style="height:${Math.max(3,n/max*maxH)}px"></span><span>${String(y).slice(2)}</span></button>`).join('');$('year-chart').querySelectorAll('[data-year]').forEach(b=>b.addEventListener('click',()=>setFilter('year',state.year===b.dataset.year?'':b.dataset.year)));}
function paperConnections(p){
 const map=window.GAIT_MAP;if(!map)return '';
 const ids=new Set(map.links.filter(l=>l.paperId===p.id).map(l=>l.nodeId));
 return `<div class="map-paper-connections"><h3>Connections in the survey</h3><div class="map-tags">${map.nodes.filter(n=>ids.has(n.id)).map(n=>`<button data-paper-connection="${escape(p.id)}|${n.id}">${n.section} · ${escape(n.short)}</button>`).join('')||'<span class="unlinked">No indexed discussion link in Sections IV–VI.</span>'}</div><button class="paper-map-link" id="open-method-map">Explore this paper in the research map ↗</button></div>`;
}
function openPaper(id){
 const p=papers.find(p=>p.id===id);if(!p)return;stopPlayback();lastFocus=document.activeElement;
 const details=[['Status',p.publicationStatus],['Authors',formatAuthors(p.authors)],['Publication',`${p.venue} ${p.year||''}`],['Inputs',p.inputs],['Backbone',p.backbone],['Identity loss',p.loss],['Datasets',p.datasets],['Survey sections',p.sections?.join('; ')],['Citation key',p.citationKey]];
 $('paper-details').innerHTML=`<span class="venue-tag">${escape(p.venue)} ${p.year||''}</span><h2 id="detail-title">${escape(p.title||p.method||p.citationKey)}</h2>${p.method&&p.title?`<p>${escape(p.method)}</p>`:''}<div class="detail-fields">${fields.map((f,i)=>`<div class="detail-field"><h3>${['CORE MOTIVATION','KEY IDEA','MAIN TECHNIQUES'][i]}</h3><p>${escape(p[f]||'A checked summary has not yet been added.')}</p></div>`).join('')}</div><details class="paper-abstract detail-abstract"><summary>Abstract${p.abstractKind==='Abstract summary'?' · Summary':''}</summary><div><p>${escape(p.abstract||'The abstract has not yet been verified.')}</p><p class="abstract-source">${escape(p.abstractSource||'')}</p></div></details>${paperConnections(p)}<dl class="detail-metadata">${details.filter(x=>x[1]).map(([k,v])=>`<dt>${k}</dt><dd>${escape(v)}</dd>`).join('')}</dl>${p.notes?`<p class="provenance-note">${escape(p.notes)}</p>`:''}${p.yearNote?`<p class="provenance-note">${escape(p.yearNote)}</p>`:''}<div class="detail-links">${safeURL(p.url)?`<a href="${escape(p.url)}" target="_blank" rel="noopener noreferrer">Read the paper ↗</a>`:`<a href="https://scholar.google.com/scholar?q=${encodeURIComponent(p.title||p.method+' gait recognition '+p.year)}" target="_blank" rel="noopener noreferrer">Find the paper ↗</a>`}${safeURL(p.codeUrl)?`<a href="${escape(p.codeUrl)}" target="_blank" rel="noopener noreferrer">Code ↗</a>`:''}${p.bibtex?'<button id="copy-bib">Copy BibTeX</button>':''}<button id="copy-link">Copy link</button></div><p class="provenance-note">Summary provenance: ${escape([...new Set(p.provenance.map(s=>s.source))].join(' · '))}. ${p.summaryStatus==='Editorial summary'?'Companion editorial synthesis; not a quotation or a claim of author endorsement.':''} ${p.title?'':'Full publication metadata is pending verification; the original archive key is retained.'}</p>`;
 $('open-method-map')?.addEventListener('click',()=>{$('paper-dialog').close();window.GAIT_MAP_UI.openPaper(p.id);});
 $('paper-details').querySelectorAll('[data-paper-connection]').forEach(b=>b.addEventListener('click',()=>{const [pid,nid]=b.dataset.paperConnection.split('|');$('paper-dialog').close();window.GAIT_MAP_UI.openEvidence(pid,nid);}));
 if(!$('paper-dialog').open)$('paper-dialog').showModal();
 const q=new URLSearchParams(location.search);q.set('paper',p.id);try{history.replaceState(null,'',location.pathname+'?'+q+location.hash);}catch{}
 $('copy-bib')?.addEventListener('click',()=>copy(p.bibtex,'BibTeX copied'));$('copy-link').addEventListener('click',()=>copy(location.href,'Paper link copied'));
}
async function copy(text,message){try{await navigator.clipboard.writeText(text);toast(message);}catch{const t=document.createElement('textarea');t.value=text;document.body.append(t);t.select();const ok=document.execCommand('copy');t.remove();toast(ok?message:'Copy is unavailable in this browser.');}}
function toast(message){$('toast').textContent=message;$('toast').classList.add('visible');setTimeout(()=>$('toast').classList.remove('visible'),2400);}
function reset(){stopPlayback();Object.assign(state,{query:'',year:'',venue:'',page:1});render();}
function closeDialog(id){$(id).close();}
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.dataset.close)));
for(const id of ['paper-dialog','about-dialog'])$(id).addEventListener('click',e=>{if(e.target===$(id)){const r=$(id).getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog(id);}});
$('paper-dialog').addEventListener('close',()=>{const q=new URLSearchParams(location.search);q.delete('paper');try{history.replaceState(null,'',location.pathname+(q.size?'?'+q:''));}catch{}lastFocus?.focus();});
$('about-button').addEventListener('click',()=>$('about-dialog').showModal());
$('filter-form').addEventListener('submit',e=>e.preventDefault());
let searchDebounce;$('search').addEventListener('input',e=>{clearTimeout(searchDebounce);const value=e.target.value;searchDebounce=setTimeout(()=>setFilter('query',value),160);});
for(const k of ['year','venue','sort'])$(k).addEventListener('change',e=>setFilter(k,e.target.value));
$('cloud-field').addEventListener('change',e=>{state.field=e.target.value;renderCloud();syncURL();});$('reset').addEventListener('click',reset);
$('play').addEventListener('click',()=>{if(timer){stopPlayback();return;}const yy=[2020,2021,2022,2023,2024,2025,2026];let index=yy.indexOf(Number(state.year));if(index<0||index===6)index=-1;const tick=()=>{index=(index+1)%yy.length;setFilter('year',yy[index],{playback:true});};tick();timer=setInterval(tick,1800);$('play').setAttribute('aria-pressed','true');$('play').innerHTML='<span aria-hidden="true">Ⅱ</span>';$('play').setAttribute('aria-label','Pause year animation');});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();$('search').focus();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{renderCloud();renderYears();},120);});
const params=new URLSearchParams(location.search);state.query=params.get('q')||'';state.year=years.map(String).includes(params.get('year'))?params.get('year'):'';state.venue=venues.includes(params.get('venue'))?params.get('venue'):'';state.sort=['newest','oldest','az'].includes(params.get('sort'))?params.get('sort'):'newest';state.field=['all',...fields].includes(params.get('field'))?params.get('field'):'all';
render();if(params.get('paper'))openPaper(params.get('paper'));
window.GAIT_LIBRARY={search:input=>{stopPlayback();Object.assign(state,{query:String(input.query||''),year:input.year?String(input.year):'',venue:String(input.venue||''),page:1});render();return filtered.map(({id,method,title,year,venue,motivation,idea,techniques})=>({id,method,title,year,venue,motivation,idea,techniques}));},getState:()=>({...state,total:filtered.length,terms:cloudTerms}),openPaper};
const context=document.modelContext;
if(context?.registerTool){
  const lifecycle=new AbortController();
  const toolList=[
    {name:'filter_gait_library',title:'Filter gait papers',description:'Apply keyword, year and venue filters to the visible paper list and word cloud. Returns matching records.',inputSchema:{type:'object',properties:{query:{type:'string'},year:{type:'integer'},venue:{type:'string'}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){
      if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Expected a filter object.');
      if(Object.keys(input).some(k=>!['query','year','venue'].includes(k)))throw new Error('Unknown filter field.');
      if(input.query!==undefined&&typeof input.query!=='string')throw new Error('Query must be a string.');
      if(input.year!==undefined&&!years.includes(input.year))throw new Error('Year is not in the catalogue.');
      if(input.venue!==undefined&&!venues.includes(input.venue))throw new Error('Venue is not in the catalogue.');
      const matches=window.GAIT_LIBRARY.search(input);return {total:matches.length,papers:matches.slice(0,20)};
    }},
    {name:'read_gait_library_state',title:'Read library filters',description:'Read the current filters, result count and leading word-cloud terms.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(){return window.GAIT_LIBRARY.getState();}},
    {name:'open_gait_paper',title:'Open paper details',description:'Open a catalogue paper in the visible detail dialog by its record ID.',inputSchema:{type:'object',properties:{id:{type:'string'}},required:['id'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute(input){const paper=papers.find(p=>p.id===input?.id);if(!paper)throw new Error('Unknown paper ID.');openPaper(paper.id);return {id:paper.id,title:paper.title,year:paper.year,venue:paper.venue};}}
  ];
  for(const tool of toolList){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

})();
