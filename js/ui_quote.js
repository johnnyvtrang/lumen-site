(function(){
'use strict';
const W=window,D=document,CFG=W.LUMEN_CONFIG||{},NOW_Y=new Date().getFullYear();
const KEY='lumen_quote_v2',SELKEY='lumen_selection',MAX_AGE=30*864e5;
const BODY=Object.assign({generic:"Hi Johnny, I'd like a detail quote. My car: ",exotic:"Hi Johnny, I'd like a quote for my exotic/classic: ",
disaster:"Hi Johnny, I'd like a Disaster/Restoration quote. Photos attached. My car: "},CFG.smsBodies||{});
const $=(s,el)=>(el||D).querySelector(s),$$=(s,el)=>Array.from((el||D).querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const money=n=>'$'+Math.round(Math.abs(n)).toLocaleString('en-US');
const short=s=>String(s||'').replace(/\s*\([^)]*\)/g,'');
const reEsc=x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const vjoin=(model,vn)=>(vn&&model&&new RegExp('^'+reEsc(model)+'(\\b|\\s|$)','i').test(vn)?vn:[model,vn].filter(Boolean).join(' '));
const cap=s=>(s?s.charAt(0).toUpperCase()+s.slice(1):'');
const uniq=l=>l.filter((x,n)=>l.indexOf(x)===n);
const lt=n=>{try{if(W.lumenTrack)W.lumenTrack(n);}catch(e){ }};
const sGet=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}};
const sSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){ }};
const sDel=k=>{try{localStorage.removeItem(k);}catch(e){ }};
const smsHref=b=>(CFG.phone&&!CFG.PREVIEW?'sms:'+CFG.phone+'?&body='+encodeURIComponent(b):'#book');
const mailHref=(sub,b)=>(CFG.email&&!CFG.PREVIEW?'mailto:'+CFG.email+'?subject='+encodeURIComponent(sub)+'&body='+encodeURIComponent(b):'#book');
const fire=(n,d)=>D.dispatchEvent(new CustomEvent(n,{detail:d}));
const mq=q=>!!(W.matchMedia&&W.matchMedia(q).matches);
const ps0=$('input[name="ps"]:checked');
const LS=W.LumenState=W.LumenState||{};
if(!('vehicle'in LS))LS.vehicle=null;
LS.track=LS.track||'f';if(LS.level==null)LS.level=1;LS.freq=LS.freq||'m';LS.ps=LS.ps||(ps0?ps0.value:'utv');
LS.setVehicle=v=>{
LS.vehicle=v||null;
const s=sGet(KEY)||{v:2,step:1,answers:null};
s.v=2;s.vehicle=vSave(LS.vehicle);s.savedAt=Date.now();sSet(KEY,s);
fire('lumen:vehicle',LS.vehicle);
};
LS.setLevel=(t,l)=>{LS.track=t;LS.level=l;fire('lumen:level',{track:t,level:l});};
const B=W.LumenBuilder;
let S=W.LumenSearch; 
let P=null;
try{P=makePricing(JSON.parse(D.getElementById('lumen-pricing').textContent));}catch(e){P=null;} 
const API=W.LumenQuote={render:()=>{},mountPicker:()=>{},focusSearch:()=>{},getVehicle:()=>LS.vehicle,quote:()=>null};
if(!P||!B){console.warn('Lumen quote: the pricing engine or quote builder is missing; the no-JS fallback stays.');return;}
const qm=CFG.PREVIEW?+new URLSearchParams(location.search).get('qa_month'):0;
const cfg={month:qm>=1&&qm<=12?qm:new Date().getMonth()+1,studio:!!CFG.STUDIO,insured:!!CFG.INSURED,nowYear:NOW_Y};
const TYPES=P.publicTypes();
const TW={f:'Full',i:'Interior',e:'Exterior'};
const EX={sedan:'Camry, Civic',coupe:'Mustang, Corvette',compact:'RAV4, CR-V',midsuv:'4Runner, Grand Cherokee',mid3row:'Highlander, Pilot',
fullsuv:'Tahoe, Expedition',minivan:'Sienna, Odyssey',midpickup:'Tacoma, Ranger',fullpickup:'F-150, Ram 1500',hdpickup:'Super Duty, Ram 2500',van:'Sprinter, Transit'};
const IT={cab:'regular cab',extcab:'extended cab',coupe:'2-door',mid3row:'3-row interior',midsuv:'2-row interior',quote:'interior quoted'};
const LOADING='Loading the vehicle list…';
const FAIL=`Couldn't load the vehicle list — choose the closest type below, or <a href="${esc(smsHref(BODY.generic))}" data-act="sms">text me your model</a>.`;
const PS_ROW='Golf carts, UTVs, boats &amp; RVs are priced separately → <a href="#powersports">Powersports</a>';
const ERR='Pick your vehicle, or choose the closest type below.';
const DISC='This is an estimate for the vehicle and condition you described. At the walkaround I confirm the price and note any existing chips, cracks or thin clear coat before I start — if anything changes, you decide before I do the work. No upselling: if an item isn\'t needed, or only partly, I take it off or discount it.';
const TAX=' · before Utah sales tax where it applies';
const QI='Interior: quoted from photos',QIW=cap((/\((.*)\)/.exec(B?B.STRINGS.quotedInterior:'')||['',''])[1])+'.'; 
const DEP=P.model.policy.deposit,MULTI=P.model.policy.multi_vehicle.additional_off,pct=x=>Math.round(x*100)+'%';
const DEP_HOW=CFG.CARD?'Paid by card when you book online, or by a secure link I text you if you book by text.':"I'll text you a secure payment link to hold your date.";
const DEP_FINE=`${pct(DEP.share)} of the estimate, rounded to the nearest ${money(DEP.round_to)} (${money(DEP.min)} minimum), applied to your final bill. Cancel or reschedule ${DEP.notice_hours}+ hours ahead and it moves to your new date or is refunded; later cancellations and no-shows keep it. If I call off for weather, it always carries over.`;
const ADD_VEH=`Add another vehicle (${pct(MULTI)} off)`;
function typeLabel(t,it){
const L=P.types[t].label;
if(!it||it===t)return L;
return short(L)+' · '+(it==='cab'&&t==='van'?'cargo van':IT[it]||short(P.types[it]?P.types[it].label:it).toLowerCase()+' interior');
}
function manualV(t,free){
const tl=P.types[t].label;
return{make:null,model:null,year:null,variant:null,type:t,itype:null,rows:null,seats:null,ev:0,flags:[],typeLabel:tl,
name:free||tl,interiorQuoted:false,manual:true,freeText:free||null};
}
function rowV(row,year,vname,sflags,svar){
const vv=vname?S.variantsFor(row,year).find(x=>x.name===vname)||null:null;
const t=vv?vv.type:row.type,it=(vv?vv.itype:row.itype)||null,fl=(vv&&vv.flags?vv.flags:[]).slice();
(sflags||[]).forEach(f=>{if((!svar||svar===(vv&&vv.name))&&fl.indexOf(f)<0)fl.push(f);});
const rows=it==='cab'?1:row.rows===1&&vv&&(it||t)!=='coupe'?2:row.rows;
return{make:row.make,model:row.model,year:year||null,variant:vv?vv.name:null,type:t,itype:it,rows,seats:row.seats,
ev:row.ev?1:0,flags:fl,typeLabel:typeLabel(t,it),name:[year,row.make,vjoin(row.model,vv&&vv.name)].filter(Boolean).join(' '),
interiorQuoted:it==='quote',manual:false};
}
function preVar(row,year,want){
const vs=S.variantsFor(row,year);
return vs.find(x=>x.name===want)||vs.find(x=>x.type===row.type&&(x.itype||null)===(row.itype||null))||vs[0]||null;
}
function varLegend(vs){ 
let best='Which version?',n=0;
[[/cab/i,'Which cab?'],[/door/i,'How many doors?'],[/seat|row/i,'How many rows of seats?'],[/van|cargo|passenger/i,'Which van?']]
.forEach(c=>{const k=vs.filter(x=>c[0].test(x.name)).length;if(k>n){n=k;best=c[1];}});
return best;
}
function vSave(v){
return v&&{make:v.make,model:v.model,year:v.year,variant:v.variant,manualType:v.manual?v.type:null,freeText:v.freeText||null,
type:v.type,itype:v.itype,rows:v.rows,seats:v.seats,ev:v.ev,flags:v.flags,name:v.name};
}
function vLoad(s){
if(!s)return null;
const t=s.manualType||s.type;
if(!t||!P.types[t]||P.types[t].interior_only)return null;
if(s.manualType)return manualV(t,s.freeText);
const it=s.itype&&(s.itype==='quote'||P.types[s.itype])?s.itype:null;
return{make:s.make,model:s.model,year:s.year||null,variant:s.variant||null,type:t,itype:it,rows:s.rows==null?null:s.rows,
seats:Array.isArray(s.seats)?s.seats:null,ev:s.ev?1:0,flags:Array.isArray(s.flags)?s.flags:[],typeLabel:typeLabel(t,it),
name:s.name||[s.year,s.make,s.model,s.variant].filter(Boolean).join(' '),interiorQuoted:it==='quote',manual:false};
}
const vText=v=>(v.manual?Object.assign({},v,{name:v.freeText||''}):v); 
const vShort=v=>(v.manual?(v.freeText?v.freeText+' · ':'')+v.typeLabel:v.name+' · '+short(v.typeLabel));
let DB=null,srch=null,loadP=null,loadFail=false,maxTo=NOW_Y;
const combos=new Set();
function loadDB(){
if(DB)return Promise.resolve(DB);
const needS=()=>(S?Promise.resolve():new Promise((ok,no)=>{
const x=D.createElement('script');
x.src=CFG.searchSrc||'js/vehicle_search.js';
x.onload=()=>{S=W.LumenSearch;if(S)ok();else no(new Error('LumenSearch missing'));};
x.onerror=no;
D.head.appendChild(x);
}));
if(!loadP)loadP=needS().then(()=>fetch(CFG.vehiclesUrl||'data/vehicles.json')).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(rows=>{
DB=S.rowsToDB(rows);srch=S.makeSearch(DB,{year:NOW_Y});maxTo=DB.reduce((m,v)=>Math.max(m,v.to||0),0);loadFail=false;
dbReady();return DB;
},e=>{loadP=null;loadFail=true;console.warn('Lumen quote: the vehicle list did not load',e);dbDone();throw e;});
return loadP;
}
const effTo=r=>(r.to>=maxTo?Math.max(r.to,NOW_Y)+1:r.to);
const yearsOf=rows=>uniq([].concat(...rows.map(r=>{const y=[];for(let n=effTo(r);n>=r.from;n--)y.push(n);return y;}))).sort((a,b)=>b-a);
function findRow(make,model,year){
const c=DB.filter(r=>r.make===make&&r.model===model);
return c.find(r=>year&&year>=r.from&&year<=effTo(r))||c[0]||null;
}
let uid=0;
function combo(box,o){
const id=o.id||'qc'+(++uid);
box.innerHTML=`<label class="q-lbl" for="${id}">Year, make &amp; model</label><input id="${id}" class="q-in" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="${id}-l" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="search" enterkeyhint="search" placeholder="e.g. 2021 RAV4, F-150, Model Y" value="${esc(o.value||'')}"><div class="q-say" id="${id}-s"></div><ul class="q-list" id="${id}-l" role="listbox" aria-label="Matching vehicles" hidden></ul><p class="sr-only" aria-live="polite" id="${id}-n"></p>`;
const inp=$('input',box),say=$('.q-say',box),list=$('ul',box),live=$('.sr-only',box);
let items=[],act=-1,waiting=false;
const c={input:inp,box,ready:()=>{if(waiting)run();}};
combos.add(c);
function run(){
const q=inp.value;
act=-1;
if(q.trim().length<2){waiting=false;return show([],'');} 
if(!srch){
waiting=true;
if(!loadFail)loadDB().catch(()=>{});
return show([],loadFail?(o.picker?FAIL:''):LOADING);
}
waiting=false;
const r=srch(q);
let l=r.results,msg='',hdr='';
if(r.redirect==='powersports')msg=PS_ROW;
else if(r.redirect==='exotic')msg=`${CFG.STUDIO?'Exotics and show cars are quoted (studio only) — text me photos.':'Exotics and show cars are quoted — text me photos.'} <a class="btn btn-ghost btn-sm" href="${esc(smsHref(BODY.exotic+q.trim()))}" data-act="sms">Text me photos</a>`;
else if(r.redirect==='generic'){msg='Choose the closest type below.';if(o.onGeneric)o.onGeneric(r.suggest);}
else if(r.redirect==='ambiguous'){l=r.candidates;hdr='Which one?';}
else if(r.redirect==='make'){l=r.shortlist;hdr=r.make+': pick a model, or keep typing.';if(o.onMake)o.onMake(r.make);}
else if(r.noMatch)msg=o.picker?'No match. Try another spelling, choose the closest type below, or text me the model.'
:`No match. <a href="#q-lists" data-act="lists">Pick the make below</a>, <a href="#q-types" data-act="types">choose the closest type</a>, or <a href="${esc(smsHref(BODY.generic+q.trim()))}" data-act="sms">text me the model</a>.`;
show(l.slice(0,6),msg,hdr,r.typesDiffer);
}
function optHTML(x,differ){
const v=x.v,vv=x.variant?(v.variants||[]).find(y=>y.name===x.variant):null;
const f=(vv&&vv.from)||v.from,t=(vv&&vv.to)||v.to;
const span=f+(t===f?'':'–'+(t>=maxTo?'now':t));
const mv=vjoin(v.model,vv&&vv.name),rest=mv.slice(v.model.length).trim(),same=mv.indexOf(v.model)===0;
return`<b>${esc(v.make)} ${esc(same?v.model:mv)}</b>${same&&rest?' '+esc(rest):''} <span>${span}${differ?' · '+esc(short(P.types[vv?vv.type:v.type].label)):''}</span>`;
}
function show(l,msg,hdr,differ){
items=l;
say.innerHTML=(hdr?`<span class="q-say-h">${esc(hdr)}</span>`:'')+(msg?`<span class="q-say-m">${msg}</span>`:'');
list.innerHTML=l.map((x,n)=>`<li role="option" id="${id}-${n}" class="q-o" aria-selected="false" data-n="${n}">${optHTML(x,differ)}</li>`).join('');
list.hidden=!l.length;
list.setAttribute('aria-label',hdr==='Which one?'?'Which one?':'Matching vehicles');
inp.setAttribute('aria-expanded',l.length?'true':'false');
inp.removeAttribute('aria-activedescendant');
live.textContent=l.length?`${l.length} ${l.length>1?'vehicles':'vehicle'} found. Use the arrow keys to choose.`:say.textContent;
}
function mark(){
$$('[role=option]',list).forEach((li,k)=>li.setAttribute('aria-selected',k===act?'true':'false'));
const li=D.getElementById(id+'-'+act);
if(li){inp.setAttribute('aria-activedescendant',li.id);li.scrollIntoView({block:'nearest'});}
}
function close(){list.hidden=true;inp.setAttribute('aria-expanded','false');inp.removeAttribute('aria-activedescendant');act=-1;}
function pick(k,ptr){const x=items[k];if(!x)return;close();o.onPick(x,ptr);}
inp.addEventListener('input',run);
inp.addEventListener('focus',()=>{if(!DB)loadDB().catch(()=>{});if(o.value&&inp.value===o.value)inp.select();});
inp.addEventListener('keydown',e=>{
const n=items.length;
if(e.key==='ArrowDown'||e.key==='ArrowUp'){
if(!n)return;
e.preventDefault();
if(list.hidden){list.hidden=false;inp.setAttribute('aria-expanded','true');}
act=e.key==='ArrowDown'?(act+1)%n:act<=0?n-1:act-1;
mark();
}else if(e.key==='Enter'){if(act>=0&&!list.hidden){e.preventDefault();pick(act);}}
else if(e.key==='Escape'){if(!list.hidden){e.preventDefault();e.stopPropagation();close();}else if(o.onEscape)o.onEscape();}
else if(e.key==='Tab')close();
});
inp.addEventListener('blur',()=>setTimeout(()=>{if(D.activeElement!==inp)close();},200));
list.addEventListener('mousedown',e=>e.preventDefault());
list.addEventListener('click',e=>{const li=e.target.closest('[data-n]');if(li)pick(+li.dataset.n,true);});
return c;
}
const freshUI=()=>({q:'',strip:'f',err:false,lists:false,types:false,exOpen:false,restored:false,sug:null,free:'',mk:'',md:'',yr:''});
let ui=freshUI();
let st={step:1,vehicle:null,answers:null,hist:[],row:null,sf:[],sv:null,pending:null,trip:[]};
let syncing=false,c1=null;
const carKey=v=>(v?[v.make,v.model,v.variant,v.manual?v.type:''].join('|'):'');
function fit(a,v,isNew,prev){ 
a=Object.assign(B.defaultAnswers(v),a||{});
if(!Array.isArray(a.extras))a.extras=[];
if(!v)return B.applyRiders(a);
const qs=B.questionsFor(v,a,P,cfg),q=k=>qs.find(x=>x.key===k);
const so=q('seats').options;
if(!so.some(x=>x.value===a.seats))a.seats=B.defaultAnswers(v).seats;
const spo=q('special').options.map(x=>x.value);
let sp=(Array.isArray(a.special)?a.special:[]).filter((x,n,l)=>spo.indexOf(x)>=0&&l.indexOf(x)===n);
if(prev!==undefined&&carKey(prev)!==carKey(v)){
const now=B.specialty(v).softTopPrecheck,was=!!(prev&&B.specialty(prev).softTopPrecheck);
if(now&&sp.indexOf('soft_top')<0)sp.push('soft_top');
else if(!now&&was)sp=sp.filter(x=>x!=='soft_top');
}
a.special=sp;
const ao=q('acc').options.map(x=>x.value);
a.acc=(Array.isArray(a.acc)?a.acc:[]).filter((x,n,l)=>x!=='none'&&ao.indexOf(x)>=0&&l.indexOf(x)===n);
if(isNew&&v.type==='hdpickup'){a.acc=a.acc.filter(x=>x!=='dually');if(v.flags.indexOf('dually')>=0)a.acc.push('dually');} 
if(!q('where').options.some(x=>x.value===a.where))a.where='core';
return B.applyRiders(a);
}
function save(){
sSet(KEY,{v:2,savedAt:Date.now(),step:st.step,vehicle:vSave(st.vehicle),answers:st.vehicle?st.answers:null,
trip:st.trip.map(x=>({vehicle:vSave(x.vehicle),answers:x.answers}))});
}
const loadTrip=l=>(Array.isArray(l)?l:[]).map(x=>{const v=x&&vLoad(x.vehicle);return v?{vehicle:v,answers:fit(x.answers,v,false)}:null;}).filter(Boolean);
sDel('lumen_quote_v1');
const saved=sGet(KEY);
if(saved&&saved.v===2&&Date.now()-(saved.savedAt||0)<MAX_AGE){
st.trip=loadTrip(saved.trip);
if(st.trip.length)ui.restored=true;
const v=vLoad(saved.vehicle);
if(v){
st.vehicle=v;st.answers=fit(saved.answers,v,false);st.step=Math.min(6,Math.max(1,saved.step|0||1));
ui.restored=true;ui.q=v.manual?'':v.name;ui.free=v.freeText||'';LS.vehicle=v;
}else if(saved.vehicle&&saved.vehicle.make&&saved.vehicle.model)st.pending=saved; 
}else if(saved)sDel(KEY);
if(!st.answers)st.answers=fit(null,st.vehicle,true);
if(LS.vehicle){const f=()=>fire('lumen:vehicle',LS.vehicle);if(D.readyState==='complete')f();else D.addEventListener('DOMContentLoaded',f);}
function useVehicle(v,src){
const p=st.vehicle;
st.vehicle=v||null;ui.err=false;
st.answers=fit(st.answers,st.vehicle,!p||!v||p.type!==v.type||String(p.flags)!==String(v.flags),p);
if(!v||v.manual)st.row=null;
if(v&&(!p||p.make!==v.make||p.model!==v.model||p.manual!==v.manual))lt('quote_vehicle');
if(v&&!v.manual){ui.mk=v.make;ui.md=v.model;ui.yr=v.year||'';}
syncQ();
save();LS.setVehicle(st.vehicle);
if(src==='b'&&st.step===1)paint1();else paint();
}
function dbReady(){
const v=st.vehicle,p=st.pending;
if(p){
st.pending=null;
const row=findRow(p.vehicle.make,p.vehicle.model,p.vehicle.year);
if(row){
const vv=preVar(row,p.vehicle.year,p.vehicle.variant);
st.row=row;st.vehicle=rowV(row,p.vehicle.year,vv&&vv.name);st.answers=fit(p.answers,st.vehicle,false);
st.step=Math.min(6,Math.max(1,p.step|0||1));ui.restored=true;syncQ();
save();LS.setVehicle(st.vehicle);paint();
}
}else if(v&&!v.manual){ 
const row=findRow(v.make,v.model,v.year);
if(row){
st.row=row;
const nv=rowV(row,v.year,(preVar(row,v.year,v.variant)||{}).name,v.flags);
if(nv.type!==v.type||nv.itype!==v.itype||nv.variant!==v.variant)useVehicle(nv,'db');
}
}
dbDone();
}
function dbDone(){
if(loadFail)ui.types=true;
if(root&&st.step===1)keep(()=>{paint1();const t=$('#q-types',root);if(t&&loadFail)t.open=true;});
combos.forEach(c=>c.ready());
}
const root=D.getElementById('quote');
let body,nav;
const head=t=>`<h4 class="q-h" id="q-h" tabindex="-1"${st.step<6?' aria-describedby="q-pt"':''}>${esc(t)}</h4>`;
const say=t=>{const el=root&&$('#q-ann',root);if(!el)return;el.textContent='';setTimeout(()=>{el.textContent=t;},60);};
function focusSig(){
const a=D.activeElement;
if(!a||!root||!root.contains(a))return null;
return a.id?'#'+a.id:a.name?`[name="${a.name}"][value="${String(a.value).replace(/["\\]/g,'\\$&')}"]`:null;
}
function keep(fn){const sig=focusSig();fn();if(sig){const el=$(sig,root);if(el&&el!==D.activeElement)el.focus({preventScroll:true});}}
function seq(){ 
const t=st.answers.track,q=st.vehicle&&st.vehicle.interiorQuoted;
return[1].concat(t!=='e'&&!q?[2]:[],t!=='i'?[3,4]:[],[5,6]);
}
function paint(){
if(!root)return;
const s=st.step;
const rs=$('#q-rst',root);
rs.hidden=!(ui.restored&&st.vehicle);
if(!rs.hidden)rs.innerHTML=`Continuing your quote for the ${esc(st.vehicle.manual?vShort(st.vehicle):[st.vehicle.year,st.vehicle.model].filter(Boolean).join(' '))} · <button type="button" class="link-btn" data-act="reset">Start over</button>`;
const vn=st.trip.length?`Vehicle ${st.trip.length+1} · `:'';
$('#q-pt',root).textContent=s<6?`${vn}Step ${s} of 5 · ${B.STEPS[s-1].title}`:'';
const tb=$('#q-tb',root);
tb.hidden=!st.trip.length||s===6;
tb.innerHTML=tb.hidden?'':tripBar();
$$('.q-bars i',root).forEach((b,n)=>b.classList.toggle('on',n<s));
keep(()=>{
body.innerHTML=s===1?step1():s===6?stepR():stepQ();
nav.className='q-nav'+(s===6?' q-nav-r':'');
nav.innerHTML=s===6?'<button type="button" class="btn btn-ghost btn-sm" data-act="back">Back</button>'
:(s>1?'<button type="button" class="btn btn-ghost" data-act="back">Back</button>':'<span></span>')+
`<button type="button" class="btn btn-primary" data-act="next">${s===5?'See my price':'Next'}</button>`;
nav.hidden=false;
if(s===1){
if(c1)combos.delete(c1);
c1=combo($('#q-cb',root),{id:'q-search',value:ui.q,onPick:pickEntry,onGeneric:suggestType,onMake:m=>{ui.mk=m;ui.md='';ui.yr='';keep(paintLists);}});
c1.input.addEventListener('input',()=>{ui.q=c1.input.value;});
paint1();
}
if(s===6)paintR();
});
}
function step1(){
const v=st.vehicle,mt=v&&v.manual?v.type:null;
return head('What are we detailing?')+`<div class="q-cb" id="q-cb"></div><div id="q-fail"></div><div id="q-conf"></div><div class="q-sbox"><div id="q-strip" class="q-strip" aria-live="polite"></div><div id="q-sw"></div></div><div id="q-vy"></div><div id="q-sf"></div>
<details class="q-more" id="q-lists"${ui.lists?' open':''}><summary>Or pick from lists</summary><div class="q-sels" id="q-sels"></div></details>
<details class="q-more" id="q-types"${ui.types?' open':''}><summary>Can't find it? Choose the closest type</summary>
<fieldset class="q-q"><legend class="sr-only">Closest type</legend><div class="q-opts q-tys">${TYPES.map(k=>`<label class="q-opt q-ty${ui.sug===k?' is-sug':''}" data-t="${k}"><input type="radio" name="q-type" value="${k}"${mt===k?' checked':''}><span><b>${esc(P.types[k].label)}</b><small>${EX[k]||''}</small></span></label>`).join('')}</div></fieldset>
<div class="q-f"><label for="q-free">Make &amp; model (optional)</label><input id="q-free" class="q-in" type="text" maxlength="80" autocomplete="off" value="${esc(ui.free)}"></div>
<p class="q-row">Exotic, classic or show car? Quoted${CFG.STUDIO?', studio only':''} — <a href="${esc(smsHref(BODY.exotic))}" data-act="sms">text photos</a>.</p>
<p class="q-row">RVs &amp; boats are priced per foot — see <a href="#powersports">Powersports</a>.</p></details><div id="q-errw"></div>`;
}
function paint1(){
const conf=$('#q-conf',root);
if(!conf)return;
const v=st.vehicle;
let h='',vy='';
if(v){
h=`<p class="q-pa">Pricing as: <b>${esc(vShort(v))}</b> · <button type="button" class="link-btn" data-act="change">Change</button></p>`;
if(st.row){
const vs=S.variantsFor(st.row,v.year);
if(vs.length>1)vy+=`<fieldset class="q-q q-var"><legend>${varLegend(vs)}</legend><div class="q-opts">${vs.map(x=>`<label class="q-opt"><input type="radio" name="q-var" value="${esc(x.name)}"${x.name===v.variant?' checked':''}><span>${esc(x.name)}</span></label>`).join('')}</div></fieldset>`;
vy+=`<div class="q-f q-y1"><label for="q-y1">Model year</label><select id="q-y1" class="q-in"><option value="">Not sure</option>${yearsOf([st.row]).map(y=>`<option${y===v.year?' selected':''}>${y}</option>`).join('')}</select></div>`;
}
}
conf.innerHTML=h;
$('#q-vy',root).innerHTML=vy;
$('#q-strip',root).innerHTML=v?stripTop(v):'';
$('#q-sw',root).innerHTML=v&&!v.interiorQuoted?`<fieldset class="seg q-sw"><legend class="sr-only">Show prices for</legend>${['f','i','e'].map(k=>`<label class="seg-opt"><input type="radio" name="q-strip" value="${k}"${k===ui.strip?' checked':''}>${TW[k]}</label>`).join('')}</fieldset>`:'';
$('#q-sf',root).innerHTML=v?stripFoot():'';
$('#q-fail',root).innerHTML=loadFail?`<p class="q-fail">${FAIL}</p>`:'';
$('#q-errw',root).innerHTML=ui.err&&!v?`<p class="q-err" id="q-err" role="alert">${ERR}</p>`:'';
$$('input[name="q-type"]',root).forEach(x=>{x.checked=!!(v&&v.manual&&v.type===x.value);});
nav.hidden=!!v;
const er=ui.err&&!v,nb=$('[data-act="next"]',nav);
[nb,c1&&c1.input].forEach(x=>{if(x){if(er)x.setAttribute('aria-describedby','q-err');else x.removeAttribute('aria-describedby');}});
if(c1){if(er)c1.input.setAttribute('aria-invalid','true');else c1.input.removeAttribute('aria-invalid');}
paintLists();
}
function stripTop(v){
const e=v.type,i=v.itype&&v.itype!=='quote'?v.itype:undefined;
if(v.interiorQuoted)return`<p class="q-sp">Exterior from <b>${money(P.price('e',0,e))}</b> · Interior: quoted from photos</p>`;
const t=ui.strip;
return`<p class="q-sh">${TW[t]} detail for your ${esc(short(v.model)||v.freeText||short(v.typeLabel).toLowerCase())}:</p><p class="q-sp">${[0,1,2].map(L=>`<a href="#compare" data-lvl="${L}">${B.LEVELS[L]} <b>${money(P.price(t,L,e,i))}</b></a>`).join('<span class="q-dot" aria-hidden="true"> · </span>')}</p>`;
}
function stripFoot(){
const n=seq().length-2;
return`<div class="q-sf"><p>Estimate — confirmed at the walkaround.</p><button type="button" class="btn btn-primary" data-act="next">Next: tailor it (${n} quick step${n>1?'s':''})</button></div>`;
}
function paintLists(){
const box=$('#q-sels',root);
if(!box)return;
if(!DB){box.innerHTML=`<p class="q-help">${loadFail?FAIL:LOADING}</p>`;return;}
const rows=ui.md?DB.filter(r=>r.make===ui.mk&&r.model===ui.md):[];
const sel=(id,lbl,opts,cur,dis)=>`<div class="q-f"><label for="${id}">${lbl}</label><select id="${id}" class="q-in"${dis?' disabled':''}><option value="">Choose…</option>${opts.map(x=>`<option${String(x)===String(cur)?' selected':''}>${esc(x)}</option>`).join('')}</select></div>`;
box.innerHTML=sel('q-mk','Make',uniq(DB.map(r=>r.make)).sort(),ui.mk)+
sel('q-md','Model',ui.mk?uniq(DB.filter(r=>r.make===ui.mk).map(r=>r.model)).sort((a,b)=>a.localeCompare(b)):[],ui.md,!ui.mk)+
sel('q-yr','Year',yearsOf(rows),ui.yr,!ui.md);
}
function syncQ(){ 
const v=st.vehicle;
ui.q=v&&!v.manual?v.name:'';
if(c1&&c1.input.isConnected)c1.input.value=ui.q;
}
function pickRow(row,year,x){
st.row=row;st.sf=(x&&x.flags)||[];st.sv=(x&&x.variant)||null;
const vv=preVar(row,year,x&&(x.variantFromAlias||x.variant));
const v=rowV(row,year,vv&&vv.name,st.sf,st.sv);
useVehicle(v,'b');
return v;
}
function pickEntry(x,ptr){pickRow(x.v,x.year||null,x);if(ptr&&mq('(pointer:coarse)'))c1.input.blur();}
function suggestType(s){
ui.sug=s||null;ui.types=true;
const d=$('#q-types',root);
if(d)d.open=true;
$$('.q-ty',root).forEach(l=>l.classList.toggle('is-sug',l.dataset.t===ui.sug));
}
function listsChange(id,val){
if(id==='q-mk'){ui.mk=val;ui.md='';ui.yr='';}
if(id==='q-md'){ui.md=val;ui.yr='';}
const rows=ui.md?DB.filter(r=>r.make===ui.mk&&r.model===ui.md):[];
if(id==='q-yr'){
ui.yr=+val||'';
const row=ui.yr&&rows.find(r=>ui.yr>=r.from&&ui.yr<=effTo(r));
if(row)return keep(()=>pickRow(row,ui.yr));
}else if(id==='q-md'&&rows.length===1)return keep(()=>pickRow(rows[0],null));
keep(paintLists);
}
function fsHTML(q,a,deco,srLegend){
const multi=q.type==='multi',val=a[q.key],nm='q-'+q.key;
const on=x=>(multi?(val||[]).map(String).indexOf(String(x))>=0:String(val)===String(x));
const opts=q.options.map(o=>`<label class="q-opt"><input type="${multi?'checkbox':'radio'}" name="${nm}" value="${esc(o.value)}"${(o.exclusive?!(val||[]).length:on(o.value))?' checked':''}><span>${esc(o.label)}${(deco&&deco[o.value])||''}</span></label>`).join('');
const kids=q.key==='riders'&&on('kids')?`<p class="q-help" id="qh-riders-kids">${esc(q.options[0].help)}</p>`:'';
const desc=[q.help?'qh-'+q.key:null,kids?'qh-riders-kids':null].filter(Boolean).join(' ');
return`<fieldset class="q-q"${desc?` aria-describedby="${desc}"`:''}><legend${srLegend?' class="sr-only"':''}>${esc(q.legend)}</legend>${q.help?`<p class="q-help" id="qh-${q.key}">${q.help}</p>`:''}<div class="q-opts">${opts}</div>${kids}</fieldset>`;
}
function stepQ(){
const s=B.STEPS[st.step-1],v=st.vehicle,a=st.answers;
const qs=B.questionsFor(v,a,P,cfg).filter(q=>q.step===s.id&&q.visible);
let h=head(s.heading),deco={};
if(s.skip)h+=`<p class="q-skip"><button type="button" class="link-btn" data-act="skip-${s.skip.track}">${esc(s.skip.label)}</button></p>`;
if(st.step===5){ 
const r=B.recommend(a,v,P,cfg),ra=a.level==='auto'?r:B.recommend(Object.assign({},a,{level:'auto'}),v,P,cfg);
const q=r.route==='quoted',amt=(x,sub)=>` <b class="q-amt">${q?'Quoted':money(x.total)}</b>${sub?`<small>${esc(sub)}</small>`:''}`;
const rf=B.recommend(Object.assign({},a,{track:'f'}),v,P,cfg),fl=a.level==='auto'?rf.level:+a.level;
const e=v.type,i=v.itype&&v.itype!=='quote'?v.itype:undefined;
const sv=v.interiorQuoted?0:rf.route==='protected'?P.pfPrice('refresh',e,i)+P.price('i',2,e,i)-P.pfPrice('pfull',e,i):P.fullSaving(fl,e,i);
deco={track:{f:sv>0?` <span class="save">Saves ${money(sv)}</span>`:''},
level:{auto:amt(ra,ra.levelLabel),0:amt(r.levels[0]),1:amt(r.levels[1]),2:amt(r.levels[2],r.levels[2].route==='restoration'?'Restoration Detail':'')}};
}
const tq=q=>(q.key==='where'&&st.trip.length?Object.assign({},q,{help:q.help+' Applies to the whole trip — one travel fee per visit.'}):q);
return h+qs.map(q=>fsHTML(tq(q),a,deco[q.key],q.legend===s.heading)).join('');
}
function onQ(t){
const k=t.name.slice(2),a=st.answers,q=B.QUESTIONS.find(x=>x.key===k);
if(!q)return;
if(q.type==='multi'){
const vals=$$(`input[name="${t.name}"]:checked`,root).map(x=>x.value);
a[k]=k==='acc'&&t.value==='none'?[]:vals.filter(x=>x!=='none');
}else a[k]=q.type==='count'?+t.value:t.value;
if(k==='riders')st.answers=B.applyRiders(a);
save();paint();
}
function stepR(){
return head(st.trip.length?`Vehicle ${st.trip.length+1}: your estimate`:'Your estimate')+`<p class="q-rv" id="q-rv"></p><div id="q-seg"></div><div id="q-lines"></div><details class="q-xd" id="q-ex"${ui.exOpen?' open':''}><summary></summary><div class="q-xl"></div></details><div class="q-tot" aria-live="polite" aria-atomic="true"><span id="q-totl"></span> <b id="q-tot"></b><span class="sr-only" id="q-tots"></span></div><p class="q-hrs" id="q-hrs"></p><div id="q-trip"></div><div class="q-dep" id="q-dep"></div><p class="q-fine">${DISC}</p><div class="q-acts" id="q-acts"></div><div id="q-cp"></div>`;
}
const line=(l,w,amt,cls)=>`<div class="q-line${cls?' '+cls:''}"><p><span>${esc(l)}</span>${w?`<small>${esc(w)}</small>`:''}</p><b>${amt}</b></div>`;
function serviceLabel(r){return r.route==='quoted'?'Interior quoted from photos':r.route==='standard'?`${TW[r.track]} ${r.levelLabel}`:r.levelLabel;}
function xHTML(x,gdesc){
if(x.options){
const sel=x.selected||x.options[0].key;
return`<div class="q-x"><label class="q-xc"><input type="checkbox" name="qx" value="shampoo"${x.checked?' checked':''}><span>${esc(x.label)}</span><b>+${money(x.price)}</b></label><fieldset class="q-xo"><legend class="sr-only">${esc(x.label)}: what to shampoo</legend><div class="q-opts">${x.options.map(o=>`<label class="q-opt"><input type="radio" name="qx-sh" value="${o.key}"${o.key===sel?' checked':''}><span>${esc(o.label)} <b class="q-amt">${money(o.price)}</b></span></label>`).join('')}</div></fieldset></div>`;
}
const rid='qxr-'+x.key,may=x.mayNeed?'<em class="q-may">May be needed</em> ':'';
const desc=[typeof gdesc==='string'?gdesc:null,x.reason?rid:null].filter(Boolean).join(' '); 
return`<div class="q-x${x.enabled?'':' is-off'}"><label class="q-xc"><input type="checkbox" name="qx" value="${x.key}"${x.checked&&x.enabled?' checked':''}${x.enabled?'':' disabled'}${desc?` aria-describedby="${desc}"`:''}><span>${may}${esc(x.label)}</span><b>+${money(x.price)}</b></label>${x.reason?`<p class="q-xr" id="${rid}">${esc(x.reason)}</p>`:''}</div>`;
}
function paintR(){
const v=st.vehicle,a=st.answers,r=B.recommend(a,v,P,cfg);
if(!$('#q-lines',root))return;
$('#q-rv',root).innerHTML=`${esc(vShort(v))} · <button type="button" class="link-btn" data-act="change">Change</button>`;
const quoted=r.route==='quoted';
const autoL=a.level==='auto'?r.level:B.recommend(Object.assign({},a,{level:'auto'}),v,P,cfg).level;
$('#q-seg',root).innerHTML=quoted||r.route==='protected'?'':`<fieldset class="seg q-seg"><legend class="sr-only">Level</legend>${r.levels.map(l=>`<label class="seg-opt"><input type="radio" name="q-rlevel" value="${l.level}"${l.level===r.level?' checked':''}><span class="q-sl">${esc(l.label)}</span> <b>${money(l.total)}</b>${l.level===autoL?'<span class="q-rec">Recommended</span>':''}</label>`).join('')}</fieldset>`;
let L='';
const smoke=r.notes.find(n=>n.key==='smoke');
if(smoke)L+=`<p class="q-banner" role="note">${esc(smoke.text)}</p>`;
L+=line(r.baseLabel,quoted?QIW:r.why,quoted?'Quoted':money(r.base),'q-main');
if(!quoted){
r.items.forEach(x=>{L+=line(x.label,x.why,x.included?'Included':money(x.price),x.included?'q-inc':'');});
if(r.interiorQuoted)L+=line(QI,QIW,'Quoted');
r.adjustments.forEach(x=>{L+=line(x.label,'',(x.amount<0?'−':'+')+money(x.amount),'q-adj');});
}
if(r.skipped.length)L+=`<p class="q-skp">${r.skipped.length} answer${r.skipped.length>1?'s':''} didn't apply to ${r.track==='e'?'Exterior':'Interior'} only.</p>`;
const notes=r.notes.filter(n=>n.key!=='smoke'&&n.key!=='quoted_interior');
if(notes.length)L+=`<ul class="q-notes">${notes.map(n=>`<li>${esc(n.text)}</li>`).join('')}</ul>`;
if(r.actions.length)L+=`<p class="q-ra">${r.actions.map(x=>`<button type="button" class="btn btn-ghost btn-sm" data-act="lvl" data-level="${x.level}">${esc(x.label)}</button>`).join('')}</p>`;
$('#q-lines',root).innerHTML=L;
const ex=$('#q-ex',root);
ex.hidden=!r.extras.length;
$('summary',ex).textContent=`Add an extra (${r.extras.length})`;
const gx=r.extras.filter(x=>!x.group),lx=r.extras.filter(x=>x.group==='glass'),sx=r.extras.filter(x=>x.group==='specialty');
const grp=(title,sub,id,items,sr)=>`<fieldset class="q-xgf"><legend class="q-xg${sr?' sr-only':''}">${esc(title)}</legend>${sub?`<p class="q-xgp"${id?` id="${id}"`:''}>${esc(sub)}</p>`:''}${items}</fieldset>`;
$('.q-xl',ex).innerHTML=(gx.length?grp('Extras','','',gx.map(x=>xHTML(x)).join(''),true):'')+
(lx.length?grp(B.STRINGS.glassTitle,r.glassPrep||'','q-glass-prep',lx.map(x=>xHTML(x,r.glassPrep?'q-glass-prep':'')).join('')):'')+
(sx.length?grp('Specialty surfaces','Same price at every level','',sx.map(x=>xHTML(x)).join('')):'');
const trip=st.trip.length>0,q=current();
$('#q-totl',root).textContent=quoted?'Estimate':(trip?'This vehicle':'Estimated total')+(r.interiorQuoted?' (exterior)':'');
$('#q-tot',root).textContent=quoted?'Quoted':money(r.total);
const dA=(trip?q.trip.deposit:r.deposit).amount; 
$('#q-tots',root).textContent=(trip?` · Trip estimate ${q.trip.total?money(q.trip.total):'quoted'}`:'')+(dA?` · deposit ${money(dA)}`:'');
$('#q-hrs',root).textContent=(quoted?'Interior quoted from photos':cap(r.hoursLabel))+TAX;
$('#q-trip',root).innerHTML=trip?tripHTML(q.entries,q.trip):'';
$('#q-dep',root).innerHTML=depHTML(trip?q.trip.deposit:r.deposit,trip);
const text=q.text,fine=mq('(pointer:fine)'),what=trip?'trip quote':'quote';
$('#q-acts',root).innerHTML=(fine?(CFG.email?`<a class="btn btn-primary" data-act="mail" href="${esc(mailHref((trip?'Trip quote Q-':'Quote Q-')+q.selection.quoteId+' (Lumen Finishworks)',text))}">Email me this ${what}</a>`:'')+
`<button type="button" class="btn ${CFG.email?'btn-ghost':'btn-primary'}" data-act="copy">Copy ${what}</button>`
:`<a class="btn btn-primary" data-act="sms" href="${esc(smsHref(text))}">Text me this ${what}</a>`)+
`<a class="btn btn-ghost" href="#book" data-act="book">${trip?(q.entries.length===2?'Book both vehicles':`Book all ${q.entries.length} vehicles`):'Book this'}</a><button type="button" class="btn btn-ghost" data-act="addveh">${ADD_VEH}</button><button type="button" class="link-btn" data-act="reset">Start over</button>`;
refreshBooked();
}
function refreshBooked(){
const bs=sGet(SELKEY);
if(!bs||!bs.quoteId)return;
const Q=quoteOf(st.step===6?tripEntries():tripEntries().filter(x=>x.saved!=null));
if(!Q){sDel(SELKEY);fire('lumen:selection',null);return;}
const ns=B.withCards(Q.selection,(bs.vehicles||[]).filter(x=>x&&x.card),P.model);
const flat=x=>JSON.stringify(Object.assign({},x,{createdAt:0}));
if(flat(bs)===flat(ns))return;
sSet(SELKEY,ns);fire('lumen:selection',ns);
if(!W.LumenSite)$$('#book [data-sms="book"]').forEach(x=>{x.href=smsHref(ns.text||Q.text);});
}
function depHTML(d,trip){
const amt=d&&d.amount;
return`<p class="q-dep-l"><span>${amt?`Deposit to hold the date${trip?' (whole trip)':''}`:'Deposit'}</span> <b>${amt?money(amt):'Set once I price it from your photos'}</b></p><p class="q-dep-f">${esc(DEP_FINE)} ${esc(DEP_HOW)}</p>`;
}
const tripName=v=>(v.manual?vShort(v):v.name);
function tripEntries(){
const w=st.answers.where,list=st.trip.map((x,n)=>{
const a=Object.assign({},x.answers,{where:w});
return{vehicle:x.vehicle,answers:a,result:B.recommend(a,x.vehicle,P,cfg),name:tripName(x.vehicle),saved:n};
});
if(st.vehicle)list.push({vehicle:st.vehicle,answers:st.answers,result:B.recommend(st.answers,st.vehicle,P,cfg),name:tripName(st.vehicle),saved:null});
return list;
}
const tripBtns=x=>`<button type="button" class="link-btn" data-act="trip-edit" data-n="${x.saved}" aria-label="Edit ${esc(x.name)}">Edit</button><button type="button" class="link-btn" data-act="trip-rm" data-n="${x.saved}" aria-label="Remove ${esc(x.name)} from the trip">Remove</button>`;
function tripBar(){
return`<p class="q-tb-h">On this trip</p><ul class="q-tbl">${tripEntries().filter(x=>x.saved!=null).map(x=>`<li><span class="q-tbn">${esc(x.name)} · ${esc(B.serviceLabel(x.result))}</span> <b>${x.result.route==='quoted'?'Quoted':money(x.result.total)}</b> <span class="q-tbb">${tripBtns(x)}</span></li>`).join('')}</ul>`+
`<p class="q-tbk"><button type="button" class="link-btn" data-act="trip-back">Back to my ${st.trip.length===1?'quote':'trip'}</button></p>`;
}
function tripHTML(E,T){
const lines=E.map((x,n)=>{
const ln=T.lines[n],r=x.result,cur=x.saved==null;
return`<li class="q-tl${cur?' is-cur':''}"><p><span>${esc(x.name)}${cur?' <em>this quote</em>':''}</span><small>${esc(B.serviceLabel(r))}${r.interiorQuoted&&r.route!=='quoted'?' · interior quoted from photos':''}</small>${cur?'':`<span class="q-tbb">${tripBtns(x)}</span>`}</p><b>${r.route==='quoted'?'Quoted':money(ln.total)}</b></li>`+
(ln.discount?`<li class="q-tl q-tl-off"><p><span>${pct(T.pct)} off this vehicle</span><small>Every vehicle after the highest-priced one on the same trip</small></p><b>−${money(ln.discount)}</b></li>`:'');
}).join('');
const tr=T.travel?`<li class="q-tl q-tl-off"><p><span>Travel, once for the trip</span></p><b>+${money(T.travel)}</b></li>`:'';
const lng=T.total?B.tripLong(E.reduce((m,x)=>m+(x.result.minutes||0),0),P):null;
return`<section class="q-trip" aria-labelledby="q-trip-h"><h5 class="q-trip-h" id="q-trip-h">Your trip · ${E.length} vehicles</h5><ul class="q-tls">${lines}${tr}</ul><div class="q-ttot"><span>Trip estimate</span> <b>${T.total?money(T.total):'Quoted'}</b></div>${lng?`<p class="q-tlong">${esc(lng)}.</p>`:''}</section>`;
}
function addVehicle(){ 
if(!st.vehicle)return;
const saved=st.vehicle;
st.trip.push({vehicle:st.vehicle,answers:JSON.parse(JSON.stringify(st.answers))});
const where=st.answers.where;
st.vehicle=null;st.row=null;st.sf=[];st.sv=null;st.hist=[];st.step=1;
st.answers=fit({where},null,true);
ui=freshUI();
lt('trip_add');
save();paint();
root.scrollIntoView({behavior:mq('(prefers-reduced-motion: no-preference)')?'smooth':'instant',block:'start'});
if(c1)c1.input.focus({preventScroll:true});
say(`${tripName(saved)} saved to your trip. Vehicle ${st.trip.length+1}: what are we detailing?`); 
}
function makeCurrent(x){
st.vehicle=x.vehicle;st.answers=fit(Object.assign({},x.answers,{where:st.answers.where}),x.vehicle,false);
st.row=x.vehicle&&DB&&!x.vehicle.manual?findRow(x.vehicle.make,x.vehicle.model,x.vehicle.year):null;
st.sf=[];st.sv=null;st.hist=[];st.step=6;ui=freshUI();syncQ();
LS.setVehicle(st.vehicle);save();paint();
const h=$('#q-h',root);if(h)h.focus({preventScroll:true});
const top=root.getBoundingClientRect().top;
if(top<0||top>innerHeight*0.6)root.scrollIntoView({behavior:mq('(prefers-reduced-motion: no-preference)')?'smooth':'instant',block:'start'});
}
function tripBack(){ 
if(!st.trip.length)return;
const last=st.trip.pop();
makeCurrent(last);
say(st.trip.length?`Back to your trip: ${tripName(last.vehicle)} reopened.`:`Back to your quote for the ${tripName(last.vehicle)}.`);
}
function tripEdit(n){ 
if(!(n>=0&&n<st.trip.length))return;
const x=st.trip.splice(n,1)[0];
if(st.vehicle)st.trip.push({vehicle:st.vehicle,answers:JSON.parse(JSON.stringify(st.answers))});
makeCurrent(x);
say(`Editing ${tripName(x.vehicle)}.`);
}
function tripRemove(n){
if(!(n>=0&&n<st.trip.length))return;
const x=st.trip.splice(n,1)[0];
save();paint();
if(st.step!==6)refreshBooked(); 
const h=$('#q-h',root);if(h)h.focus({preventScroll:true}); 
say(`${tripName(x.vehicle)} removed from the trip.`);
}
function go(n,push){
if(push)st.hist.push(st.step);
st.step=n;ui.restored=false;ui.err=false;
save();paint();
const top=root.getBoundingClientRect().top;
if(top<0||top>innerHeight*0.6)root.scrollIntoView({behavior:mq('(prefers-reduced-motion: no-preference)')?'smooth':'instant',block:'start'});
const h=$('#q-h',root);
if(h)h.focus({preventScroll:true});
if(n===6)lt('quote_complete');
}
function next(){
if(st.step===1&&!st.vehicle){
ui.err=true;paint1();
if(c1)c1.input.focus();
return;
}
const n=seq().find(x=>x>st.step);
if(n)go(n,true);
}
function back(){ 
const sq=seq();
let n=st.hist.pop();
while(n&&n<st.step&&sq.indexOf(n)<0)n=st.hist.pop();
if(!n||n>=st.step||sq.indexOf(n)<0)n=sq.filter(x=>x<st.step).pop()||1;
go(n,false);
}
function toStep1(){
if(st.step!==1){st.hist.push(st.step);st.step=1;ui.restored=false;save();paint();}
if(c1){c1.input.focus();c1.input.select();}
}
function reset(){
sDel(KEY);
st={step:1,vehicle:null,answers:fit(null,null,true),hist:[],row:null,sf:[],sv:null,pending:null,trip:[]};
ui=freshUI();
const sel=sGet(SELKEY);
if(sel&&sel.quoteId){sDel(SELKEY);fire('lumen:selection',null);}
LS.vehicle=null;fire('lumen:vehicle',null);
paint();
if(c1)c1.input.focus();
}
function quoteOf(E){
if(!E.length)return null;
if(E.length===1){
const x=E[0],text=B.summaryText(x.result,vText(x.vehicle),x.answers,cfg);
return{text,trip:null,selection:Object.assign(B.selectionFor(x.result,x.vehicle,x.answers,Date.now()),{label:serviceLabel(x.result),text})};
}
const TE=E.map(x=>({result:x.result,vehicle:vText(x.vehicle),answers:x.answers,name:x.name}));
const text=B.tripText(TE,P,cfg);
return{text,trip:B.tripTotals(E.map(x=>x.result),P.model),selection:Object.assign(B.tripSelection(TE,P,Date.now()),{label:`${E.length} vehicles`,text})};
}
function current(){
const v=st.vehicle;
if(!v)return null;
const E=tripEntries(),Q=quoteOf(E),trip=st.trip.length>0;
return{vehicle:v,answers:st.answers,result:E[E.length-1].result,text:Q.text,entries:trip?E:null,trip:trip?Q.trip:null,selection:Q.selection};
}
function book(){
const q=current();
if(!q)return;
const bs=sGet(SELKEY);
const cards=bs&&bs.quoteId?(bs.vehicles||[]).filter(x=>x&&x.card)
:bs&&bs.v===2&&!bs.quoteId&&bs.route==='powersports'&&bs.total>0&&(bs.vehicles||[]).length===1
?[Object.assign({},bs.vehicles[0],{route:'powersports',back:'powersports'})]:[];
const s=B.withCards(q.selection,cards,P.model);
sSet(SELKEY,s);
fire('lumen:selection',s);
lt('book_click');
if(W.LumenSite)return;
const p=D.getElementById('selection'),n=s.vehicles.length;
if(p){
const what=n>1?`${n} vehicles · ${s.vehicles.map(x=>x.label).join(' + ')}`:`${s.vehicles[0].label} · ${s.vehicles[0].name}`;
p.innerHTML=`Your selection: ${esc(what)} · ${s.total?money(s.total)+' estimate':'quoted from photos'}${s.multiDiscount?` (${pct(s.multiPct)} off ${n===2?'the second':'each additional one'})`:''}${s.deposit?` · ${money(s.deposit)} deposit holds the date`:''} · <a href="#quote">Edit</a>`;
p.hidden=false;
}
$$('#book [data-sms="book"]').forEach(x=>{x.href=smsHref(s.text||q.text);});
}
function copy(btn){
const q=current();
if(!q)return;
const done=ok=>{
btn.textContent=ok?'Copied':'Copy quote';
if(ok)setTimeout(()=>{if(btn.isConnected)btn.textContent='Copy quote';},2500);
else $('#q-cp',root).innerHTML=`<label class="q-lbl" for="q-cpt">Copy this text</label><textarea id="q-cpt" class="q-in q-cpt" rows="8" readonly>${esc(q.text)}</textarea>`;
};
const legacy=()=>{
const t=D.createElement('textarea');
t.value=q.text;t.setAttribute('readonly','');t.className='sr-only';
D.body.appendChild(t);t.select();
let ok=false;
try{ok=D.execCommand('copy');}catch(e){ok=false;}
t.remove();btn.focus();done(ok);
};
if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(q.text).then(()=>done(true),legacy);else legacy();
}
function stripLink(L){ 
const t=ui.strip,r=$(`input[name="track"][value="${t}"]`);
if(r&&!r.checked){r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}));}
LS.setLevel(t,L);
}
function openD(id,sel){
const d=$('#'+id,root);
if(!d)return;
d.open=true;
const f=()=>{const el=$(sel,d);if(el)el.focus();};
if(id==='q-lists'&&!DB)loadDB().then(()=>{paintLists();f();},paintLists);else f();
}
function onChange(e){
const t=e.target,n=t.name||t.id,a=st.answers;
if(n==='q-strip'){ui.strip=t.value;keep(paint1);}
else if(n==='q-var'&&st.row){const v=rowV(st.row,st.vehicle.year,t.value,st.sf,st.sv);keep(()=>useVehicle(v,'b'));}
else if(n==='q-y1'&&st.row){
const y=+t.value||null,vv=preVar(st.row,y,st.vehicle.variant),v=rowV(st.row,y,vv&&vv.name,st.sf,st.sv);
keep(()=>useVehicle(v,'b'));
}else if(n==='q-mk'||n==='q-md'||n==='q-yr')listsChange(n,t.value);
else if(n==='q-type')keep(()=>useVehicle(manualV(t.value,ui.free.trim()),'b'));
else if(n==='q-free'){ui.free=t.value;if(st.vehicle&&st.vehicle.manual)keep(()=>useVehicle(manualV(st.vehicle.type,ui.free.trim()),'b'));}
else if(n==='q-rlevel'){a.level=t.value;save();keep(paintR);syncing=true;LS.setLevel(a.track,+t.value);syncing=false;}
else if(n==='qx'||n==='qx-sh'){
const sh=x=> /^shampoo_/.test(x);
if(n==='qx-sh')a.extras=a.extras.filter(x=>!sh(x)).concat(t.value);
else{
a.extras=a.extras.filter(x=>(t.value==='shampoo'?!sh(x):x!==t.value));
if(t.checked)a.extras.push(t.value==='shampoo'?($('input[name="qx-sh"]:checked',root)||{value:'shampoo_floor'}).value:t.value);
}
save();keep(paintR);
}else if(n.indexOf('q-')===0&&st.step>1&&st.step<6)onQ(t);
}
function mountPicker(el){
if(!el)return;
const pid='qp'+(++uid);
el.hidden=false;
el.innerHTML=`<div class="q-pk"><div class="q-pkc"></div><div class="q-pkv"></div><div class="q-f"><label for="${pid}">Or choose the closest type</label><select id="${pid}" class="q-in"><option value="">Choose…</option>${TYPES.map(k=>`<option value="${k}">${esc(P.types[k].label)}</option>`).join('')}</select></div><p class="q-pkd"><button type="button" class="btn btn-ghost btn-sm" data-pk="done">Done</button></p></div>`;
let row=null,sf=[],sv=null;
const tsel=$('select',el),vbox=$('.q-pkv',el);
const close=()=>{
combos.delete(c);el.innerHTML='';el.hidden=true;
const b=el.parentElement&&el.parentElement.querySelector('[data-change-vehicle]');
if(b)b.focus();
};
const c=combo($('.q-pkc',el),{
picker:true,onEscape:close,onGeneric:s=>{if(s)tsel.value=s;},
onPick:x=>{
row=x.v;sf=x.flags||[];sv=x.variant||null;
const vv=preVar(row,x.year||null,x.variantFromAlias||x.variant),v=rowV(row,x.year||null,vv&&vv.name,sf,sv),vs=S.variantsFor(row,v.year);
c.input.value=v.name;
useVehicle(v,'p');
if(vs.length<2)return close();
vbox.innerHTML=`<fieldset class="q-q"><legend>${varLegend(vs)}</legend><div class="q-opts">${vs.map(y=>`<label class="q-opt"><input type="radio" name="${pid}-v" value="${esc(y.name)}"${y.name===v.variant?' checked':''}><span>${esc(y.name)}</span></label>`).join('')}</div></fieldset>`;
},
});
el.onchange=e=>{
const t=e.target;
if(t===tsel&&t.value){useVehicle(manualV(t.value,''),'p');close();}
else if(t.name===pid+'-v'&&row){const v=rowV(row,LS.vehicle&&LS.vehicle.year,t.value,sf,sv);c.input.value=v.name;useVehicle(v,'p');}
};
el.onclick=e=>{if(e.target.closest('[data-pk="done"]'))close();else if(e.target.closest('[data-act="sms"]'))lt('sms_click');};
el.onkeydown=e=>{if(e.key==='Escape'&&e.target!==c.input)close();};
c.input.focus();
if(!DB)loadDB().catch(()=>{});
}
D.addEventListener('lumen:vehicle',e=>{
const v=e.detail||null,prev=st.vehicle;
if(v===st.vehicle)return;
st.vehicle=v;st.row=v&&DB&&!v.manual?findRow(v.make,v.model,v.year):null;
st.answers=fit(st.answers,v,true,prev);
if(!v&&st.step>1)st.step=1;
syncQ();save();paint();
});
D.addEventListener('lumen:level',e=>{ 
const d=e.detail;
if(syncing||st.step!==6||!d||!st.vehicle||d.track!==st.answers.track)return;
const r=B.recommend(st.answers,st.vehicle,P,cfg);
if(r.route==='protected'||r.route==='quoted'||r.level===d.level)return;
st.answers.level=String(d.level);save();keep(paintR);
});
Object.assign(API,{
render:()=>paint(),mountPicker,getVehicle:()=>st.vehicle,quote:current,
focusSearch:()=>{if(!root)return;toStep1();},
});
if(root){
root.classList.add('q-on');
root.setAttribute('role','region');
root.setAttribute('aria-labelledby','q-title');
const mold=esc(B.STRINGS.mold).replace('Text photos',`<a href="${esc(smsHref(BODY.disaster))}" data-act="sms">Text photos</a>`);
root.innerHTML=`<div class="q-top"><h3 id="q-title" class="q-title">Get my price</h3><p class="q-sub">A price for your exact vehicle, in about a minute. An estimate, confirmed at the walkaround.</p></div><p class="q-rst" id="q-rst" hidden></p><div class="q-tb" id="q-tb" hidden></div><div class="q-prog"><p id="q-pt"></p><div class="q-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div><div id="q-body"></div><p class="q-mold">${mold}</p><div class="q-nav" id="q-nav"></div><p class="sr-only" id="q-ann" aria-live="polite"></p>`;
body=$('#q-body',root);nav=$('#q-nav',root);
root.addEventListener('click',e=>{
const a=e.target.closest('[data-act],[data-lvl]');
if(!a||!root.contains(a))return;
if(a.dataset.lvl!=null)return stripLink(+a.dataset.lvl);
const k=a.dataset.act;
if(k==='next'){e.preventDefault();next();}
else if(k==='back')back();
else if(k==='skip-e'||k==='skip-i'){st.answers.track=k.slice(5);save();go(k==='skip-e'?3:5,true);}
else if(k==='change')toStep1();
else if(k==='reset')reset();
else if(k==='lvl'){st.answers.level=String(+a.dataset.level);save();paintR();const x=$('input[name="q-rlevel"]:checked',root);if(x)x.focus();}
else if(k==='addveh')addVehicle();
else if(k==='trip-rm')tripRemove(+a.dataset.n);
else if(k==='trip-edit')tripEdit(+a.dataset.n);
else if(k==='trip-back')tripBack();
else if(k==='copy')copy(a);
else if(k==='sms')lt('sms_click');
else if(k==='book')book();
else if(k==='lists'||k==='types'){e.preventDefault();openD('q-'+k,k==='lists'?'#q-mk':'input[name="q-type"]');}
});
root.addEventListener('change',onChange);
root.addEventListener('input',e=>{if(e.target.id==='q-free')ui.free=e.target.value;});
root.addEventListener('toggle',e=>{
const id=e.target.id;
if(id==='q-lists'){ui.lists=e.target.open;if(ui.lists&&!DB)loadDB().then(()=>keep(paintLists),()=>{});}
else if(id==='q-types')ui.types=e.target.open;
else if(id==='q-ex')ui.exOpen=e.target.open;
},true);
if(!st.vehicle)st.step=1;
paint();
if(st.pending||(st.vehicle&&st.step===1&&!st.vehicle.manual))loadDB().catch(()=>{}); 
if('IntersectionObserver'in W){
const io=new IntersectionObserver(es=>{if(es.some(x=>x.isIntersecting)){io.disconnect();if(!DB)loadDB().catch(()=>{});}},{rootMargin:'400px 0px'});
io.observe(root);
}
}else if(st.pending)loadDB().catch(()=>{});
})();
