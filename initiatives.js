'use strict';
(() => {
  const D = window.GAIT_INITIATIVES, host = document.getElementById('view-initiatives');
  if (!D || !host) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const scopeLabels = {gait:'Gait recognition',biometrics:'Multimodal identity',reid:'Related re-identification'};
  const params = new URLSearchParams(location.search);
  const countries = [...new Set(D.records.flatMap(r => r.countries))].sort();
  const years = [...new Set(D.records.flatMap(r => Array.from({length:(r.endYear ?? r.startYear)-r.startYear+1}, (_, i) => r.startYear+i)))].sort((a,b) => b-a).map(String);
  const state = {
    kind: params.get('kind') === 'competitions' ? 'competitions' : 'projects',
    country: countries.includes(params.get('initcountry')) ? params.get('initcountry') : '',
    year: years.includes(params.get('inityear')) ? params.get('inityear') : '',
    scope: Object.hasOwn(scopeLabels, params.get('initscope')) ? params.get('initscope') : '',
    query: params.get('initq') || ''
  };
  function save() {
    const q = new URLSearchParams(location.search);
    for (const [key,value] of Object.entries({kind:state.kind,initcountry:state.country,inityear:state.year,initscope:state.scope,initq:state.query})) {
      if (value) q.set(key,value); else q.delete(key);
    }
    history.replaceState(null,'',location.pathname+'?'+q+location.hash);
  }
  function selected() {
    const query = state.query.toLocaleLowerCase().trim();
    return D.records.filter(r => r.kind === state.kind &&
      (!state.country || r.countries.includes(state.country)) &&
      (!state.year || Number(state.year) >= r.startYear && Number(state.year) <= (r.endYear ?? r.startYear)) &&
      (!state.scope || r.scope === state.scope) &&
      (!query || [r.title,r.originalTitle,r.host,r.summary,r.details,...r.tags].join(' ').toLocaleLowerCase().includes(query)))
      .sort((a,b) => (b.endYear ?? b.startYear)-(a.endYear ?? a.startYear) || b.startYear-a.startYear || a.title.localeCompare(b.title));
  }
  function options(values,current,label) {
    return `<option value="">${label}</option>`+values.map(value => `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(value)}</option>`).join('');
  }
  function link(source) {
    return `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)} ↗</a>`;
  }
  function rows() {
    const records = selected(), total = D.records.filter(r => r.kind === state.kind).length;
    host.querySelector('#init-count').textContent = `${records.length} of ${total} ${state.kind === 'projects' ? 'projects' : 'competition editions'}`;
    host.querySelector('#init-list').innerHTML = records.length ? records.map(r => `<article class="initiative" id="${esc(r.id)}">
      <div class="initiative-date"><strong>${esc(r.period)}</strong><span>${esc(r.countries.join(' · '))}</span></div>
      <div class="initiative-body"><div class="initiative-heading"><h3>${esc(r.title)}</h3><span class="initiative-scope ${esc(r.scope)}">${scopeLabels[r.scope]}</span></div>
      <p class="initiative-host">${esc(r.host)}</p><p class="initiative-summary">${esc(r.summary)}</p>
      <div class="initiative-foot"><div class="initiative-tags">${r.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>${link(r.sources[0])}</div>
      <details><summary>Scope &amp; sources</summary>
        ${r.originalTitle ? `<p class="initiative-original">${esc(r.originalTitle)}</p>` : ''}
        <p>${esc(r.details)}</p><p class="initiative-period-note">${esc(r.periodBasis)}</p>
        ${r.funding ? `<p><strong>Reported funding:</strong> ${esc(r.funding.amount)}. ${esc(r.funding.basis)}</p>` : ''}
        <ul class="initiative-evidence">${r.sources.map(s => `<li>${link(s)}<span>${esc(s.evidence)}</span></li>`).join('')}</ul>
        <p class="initiative-checked">Sources checked ${esc(r.checkedOn)} · Citation key: <code>${esc(r.citation.key)}</code></p>
      </details></div></article>`).join('') : '<div class="empty-state"><h3>No matching entries</h3><p>Try another year, region or keyword, or reset the filters.</p></div>';
    host.querySelector('#init-export').disabled = !records.length;
    save();
  }
  function download(name,content,type) {
    const objectURL = URL.createObjectURL(new Blob([content],{type}));
    const a = document.createElement('a'); a.href=objectURL; a.download=name; a.click();
    setTimeout(() => URL.revokeObjectURL(objectURL),1000);
  }
  function render() {
    host.innerHTML = `<div class="section-intro"><div><p class="eyebrow">SECTIONS III-D–E / SHARED EVALUATION &amp; RESEARCH PROGRAMS</p>
      <h2 id="initiatives-title">Projects &amp; competitions<span class="title-dot">.</span></h2>
      <p>Explore the programs and shared evaluations behind gait recognition, from sensing and biometric fusion to transfer across cameras and datasets.</p></div>
      <div class="initiative-downloads"><a href="./initiatives.bib" download>Download BibTeX ↓</a><a href="./initiatives.json" download>All records ↓</a></div></div>
      <div class="segmented" aria-label="Initiative type">${['projects','competitions'].map(kind => `<button data-init-kind="${kind}" aria-pressed="${state.kind === kind}">${kind === 'projects' ? 'Research projects' : 'Competitions'} · ${D.records.filter(r => r.kind === kind).length}</button>`).join('')}</div>
      <form class="controls initiative-controls" role="search" aria-label="Filter projects and competitions">
        <label class="initiative-search">Search<input id="init-search" type="search" autocomplete="off" placeholder="Project, dataset, funder, task…" value="${esc(state.query)}"></label>
        <label>Country / region<select id="init-country">${options(countries,state.country,'All regions')}</select></label>
        <label>Recorded year<select id="init-year">${options(years,state.year,'All years')}</select></label>
        <label>Research scope<select id="init-scope"><option value="">All scopes</option>${Object.entries(scopeLabels).map(([key,label]) => `<option value="${key}"${key === state.scope ? ' selected' : ''}>${label}</option>`).join('')}</select></label>
        <button class="reset-button" id="init-reset" type="button">Reset filters</button>
      </form>
      <div class="initiative-result-bar"><p id="init-count" role="status" aria-live="polite"></p><button id="init-export" class="download-button" type="button">Export selection ↓</button></div>
      <p class="initiative-context">${state.kind === 'projects' ? 'Selected funded research with a documented connection to gait identity or broader re-identification. Open each entry for the project scope and funding source.' : 'Each edition retains its own input restrictions, training resources and evaluation rules. Related aerial–ground ReID events are labeled separately.'}</p>
      <div id="init-list"></div>
      <p class="initiative-maintenance">This index can expand beyond the manuscript. <a href="https://github.com/ChaoFan996/gait-survey/issues/new" target="_blank" rel="noopener noreferrer">Suggest a project, competition or correction ↗</a> · <a href="https://github.com/ChaoFan996/gait-survey/blob/main/docs/initiatives.md" target="_blank" rel="noopener noreferrer">Scope &amp; update guide ↗</a></p>`;
    host.querySelector('form').addEventListener('submit',e => e.preventDefault());
    host.querySelectorAll('[data-init-kind]').forEach(button => button.addEventListener('click',() => {
      state.kind=button.dataset.initKind; state.country=''; state.year=''; state.scope=''; state.query='';
      render(); host.querySelector(`[data-init-kind="${state.kind}"]`).focus();
    }));
    for (const [id,key] of [['init-country','country'],['init-year','year'],['init-scope','scope']]) {
      host.querySelector('#'+id).addEventListener('change',e => {state[key]=e.target.value; rows();});
    }
    host.querySelector('#init-search').addEventListener('input',e => {state.query=e.target.value; rows();});
    host.querySelector('#init-reset').addEventListener('click',() => {
      state.country=''; state.year=''; state.scope=''; state.query=''; render(); host.querySelector('#init-search').focus();
    });
    host.querySelector('#init-export').addEventListener('click',() => download(`gait-${state.kind}.json`,JSON.stringify({meta:D.meta,filters:{...state},records:selected()},null,2)+'\n','application/json'));
    rows();
  }
  window.GAIT_INITIATIVES_UI = {render};
  if (params.get('view') === 'initiatives') render();
})();
