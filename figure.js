'use strict';
(() => {
  const $=id=>document.getElementById(id), library=window.GAIT_LIBRARY;
  if(!library)return;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ctx=document.createElement('canvas').getContext('2d');
  const colors={ink:'#172b4d',blue:'#1745a3',orange:'#ed592c',muted:'#60718a',line:'#d7e1ee',pale:'#f2f6fc'};
  const fields=['motivation','idea','techniques'],labels=['Core Motivation','Key Idea','Main Techniques'];
  let current={svg:'',width:1000,height:400}, active=false;
  function corpus(){return window.GAIT_DATA.papers.filter(p=>p.complete&&p.publicationStatus!=='Withdrawn'&&p.year>=2020&&p.year<=2026&&($('figure-scope').value==='recent'||p.scope==='Survey collection'));}
  function measure(text,size=16,weight=400){ctx.font=`${weight} ${size}px Arial`;return ctx.measureText(text).width;}
  function wrap(text,width,size=16,weight=400){
    const lines=[];let line='';
    for(const word of String(text||'').split(/\s+/)){if(line&&measure(line+' '+word,size,weight)>width){lines.push(line);line=word;}else line+=(line?' ':'')+word;}
    if(line)lines.push(line);return lines;
  }
  function text(value,x,y,size=16,color=colors.ink,weight=400,anchor='start'){return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}" text-anchor="${anchor}">${esc(value)}</text>`;}
  function paragraph(value,x,y,width,size=16,color=colors.ink,weight=400,leading=21){const lines=wrap(value,width,size,weight);return {markup:lines.map((line,i)=>text(line,x,y+i*leading,size,color,weight)).join(''),height:lines.length*leading};}
  function rule(x,y,w){return `<path d="M${x} ${y}h${w}" stroke="${colors.line}" stroke-width="1"/>`;}
  function cloud(rows,x,y,width,height,single){
    const terms=library.termFrequency(rows,'all').slice(0,single?28:38),boxes=[],items=[],max=terms[0]?.[1]||1,min=terms.at(-1)?.[1]||1;
    const palette=[colors.blue,colors.orange,'#3b628b','#69809c','#264e7a'];
    for(let n=0;n<terms.length;n++){
      const [term,count]=terms[n],scale=max===min?.5:(Math.sqrt(count)-Math.sqrt(min))/(Math.sqrt(max)-Math.sqrt(min));
      let size=(single?15:16)+scale*(single?17:19),w=measure(term,size,600)+12,h=size+7,found=null;
      if(w>width-8){size*=(width-8)/w;w=width-8;h=size+7;}
      for(let i=0;i<2600;i++){
        const angle=i*.36+n*.91,r=Math.sqrt(i/2600),bx=width/2+Math.cos(angle)*r*width*.6-w/2,by=height/2+Math.sin(angle)*r*height*.65-h/2;
        if(bx<0||by<0||bx+w>width||by+h>height||boxes.some(b=>bx<b.x+b.w&&bx+w>b.x&&by<b.y+b.h&&by+h>b.y))continue;
        found={x:bx,y:by,w,h};break;
      }
      if(!found)continue;boxes.push(found);
      items.push(`<g><title>${esc(term)}: ${count} papers</title>${text(term,x+found.x+w/2,y+found.y+size,size,palette[n%palette.length],600,'middle')}</g>`);
    }
    return items.join('');
  }
  function bars(rows,x,y,width,height,single){
    const counts=Array.from({length:7},(_,i)=>rows.filter(p=>p.year===2020+i).length),max=Math.max(1,...counts),step=width/7,bw=Math.min(37,step*.62),bottom=y+height;
    let out=rule(x,bottom,width);
    counts.forEach((n,i)=>{const bx=x+i*step+(step-bw)/2,h=n/max*height,year=2020+i;
      out+=`<rect x="${bx}" y="${bottom-h}" width="${bw}" height="${h}" rx="2" fill="${i===6?'#a8bbdc':'#d5e1f2'}"${i===6?' stroke="#1745a3" stroke-dasharray="3 2"':''}/>`;
      out+=text(n,bx+bw/2,bottom-h-7,single?14:15,colors.muted,400,'middle');
      out+=text(String(year),bx+bw/2,bottom+20,single?15:14,colors.muted,400,'middle');
    });return out;
  }
  function populate(){
    const selected=$('figure-example').value,rows=corpus().sort((a,b)=>b.year-a.year||(a.method||a.title).localeCompare(b.method||b.title));
    $('figure-example').replaceChildren(...rows.map(p=>new Option(`${p.method||p.title} · ${p.venue} ${p.year}`,p.id)));
    $('figure-example').value=rows.some(p=>p.id===selected)?selected:rows.find(p=>p.method==='CoD2')?.id||rows[0]?.id;
  }
  function render(){
    const single=$('figure-layout').value==='single',W=single?500:1000,pad=single?18:24,inner=W-pad*2,rows=corpus(),paper=rows.find(p=>p.id===$('figure-example').value);
    if(!paper)return;
    const scope=$('figure-scope').value==='survey'?'Survey collection':'Indexed literature';
    const bits=[`<rect width="100%" height="100%" fill="white"/>`];
    bits.push(text(`${scope} · ${rows.length} papers · 2020–2026`,pad,24,single?15:16,colors.muted));
    let end;
    if(single){
      bits.push(text('a',pad,51,17,colors.ink,700),text('Research vocabulary',pad+21,51,17,colors.ink,700));
      bits.push(cloud(rows,pad,62,inner,112,true));
      bits.push(text('b',pad,195,17,colors.ink,700),text('Publication years',pad+21,195,17,colors.ink,700),text('2026: partial',W-pad,195,14,colors.muted,400,'end'));
      bits.push(bars(rows,pad,222,inner,45,true));end=303;
    }else{
      bits.push(text('a',pad,55,18,colors.ink,700),text('Research vocabulary',pad+22,55,18,colors.ink,700));
      bits.push(cloud(rows,pad,66,578,134,false));
      bits.push(`<path d="M626 43V199" stroke="${colors.line}"/>`);
      bits.push(text('b',650,55,18,colors.ink,700),text('Publication years',672,55,18,colors.ink,700),text('2026: partial',W-pad,55,14,colors.muted,400,'end'));
      bits.push(bars(rows,647,88,329,88,false));end=220;
    }
    bits.push(rule(pad,end-7,inner));
    const title=paper.method||paper.title,meta=`${paper.venue} · ${paper.year}`;
    const titleBlock=paragraph(title,pad,end+18,inner-measure(meta,single?14:16)-22,single?19:21,colors.ink,700,single?23:25);
    bits.push(titleBlock.markup,text(meta,W-pad,end+18,single?14:16,colors.blue,600,'end'));
    let y=end+18+titleBlock.height;
    if(paper.method){const full=paragraph(paper.title,pad,y,inner,single?15:16,colors.muted,400,single?18:20);bits.push(full.markup);y+=full.height;}
    const authors=paragraph(library.formatAuthors(paper.authors),pad,y+1,inner,single?14:15,colors.muted,400,single?18:19);bits.push(authors.markup);y+=authors.height+13;
    if(single){
      fields.forEach((field,i)=>{
        bits.push(text(labels[i].toUpperCase(),pad,y,14,colors.blue,700));
        const content=paragraph(paper[field],pad,y+21,inner,17,colors.ink,400,22);bits.push(content.markup);y+=content.height+29;
      });y-=16;
    }else{
      const gap=26,cw=(inner-2*gap)/3;let highest=0;
      fields.forEach((field,i)=>{const x=pad+i*(cw+gap);bits.push(text(labels[i].toUpperCase(),x,y,14,colors.blue,700));const content=paragraph(paper[field],x,y+25,cw,18,colors.ink,400,23);bits.push(content.markup);highest=Math.max(highest,content.height);});y+=highest+27;
    }
    const H=Math.ceil(y+12);
    current={width:W,height:H,svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="figure-title figure-desc" font-family="Arial, Helvetica, sans-serif"><title id="figure-title">Gait research vocabulary and publication years</title><desc id="figure-desc">${rows.length} ${esc(scope.toLowerCase())} papers from 2020 to 2026, excluding withdrawn records. Word sizes show document frequency across three summary fields. 2026 coverage is partial. Example: ${esc(title)}.</desc>${bits.join('')}</svg>`};
    $('figure-preview').innerHTML=current.svg;$('figure-preview').classList.toggle('single',single);
    const mm=single?88:180;$('figure-size').textContent=`At ${mm} mm wide: ${(H/W*mm).toFixed(1)} mm high · SVG: vector text · PNG: ${W*4} × ${H*4} px`;
    if(active)history.replaceState(null,'',location.pathname+location.search+`#figure-${single?'single':'wide'}`);
  }
  function show(){library.stopPlayback();active=true;$('library-view').hidden=true;$('figure-view').hidden=false;document.body.classList.add('figure-mode');populate();render();window.scrollTo(0,0);}
  function hide(){active=false;$('library-view').hidden=false;$('figure-view').hidden=true;document.body.classList.remove('figure-mode');history.replaceState(null,'',location.pathname+location.search);window.dispatchEvent(new Event('resize'));$('figure-button').focus();}
  function save(blob,ext){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`gait-library-${$('figure-layout').value}.${ext}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  $('figure-button').addEventListener('click',show);$('figure-close').addEventListener('click',hide);
  $('figure-layout').addEventListener('change',render);$('figure-example').addEventListener('change',render);$('figure-scope').addEventListener('change',()=>{populate();render();});
  $('figure-svg').addEventListener('click',()=>save(new Blob([current.svg],{type:'image/svg+xml;charset=utf-8'}),'svg'));
  $('figure-png').addEventListener('click',async()=>{
    const button=$('figure-png');button.disabled=true;button.textContent='Exporting…';
    const url=URL.createObjectURL(new Blob([current.svg],{type:'image/svg+xml;charset=utf-8'}));
    try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=current.width*4;canvas.height=current.height*4;const draw=canvas.getContext('2d');draw.drawImage(img,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('Export failed');save(blob,'png');}
    catch{$('figure-size').textContent='PNG export is unavailable in this browser. Download the vector SVG instead.';}
    finally{URL.revokeObjectURL(url);button.disabled=false;button.textContent='Download PNG';}
  });
  if(/^#figure-(single|wide)$/.test(location.hash)){$('figure-layout').value=location.hash.endsWith('single')?'single':'wide';show();}
})();
