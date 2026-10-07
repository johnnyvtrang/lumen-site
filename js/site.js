(function(){
'use strict';
const d=document,w=window,C=w.LUMEN_CONFIG||{},B=C.smsBodies||{};
const $$=(s,r)=>Array.from((r||d).querySelectorAll(s));
const seen={};
const warn=(m,e)=>{if(!seen[m]){seen[m]=1;console.warn('Lumen site: '+m,e||'');}};
const guard=f=>e=>{try{f(e);}catch(x){warn('handler failed',x);}}; 
const track=n=>{try{if(w.lumenTrack)w.lumenTrack(n);}catch(e){ }};
const fire=(n,detail)=>d.dispatchEvent(new CustomEvent(n,{detail}));
const money=n=>(n<0?'−$':'$')+Math.abs(n).toLocaleString('en-US');
const half=x=>Math.floor(x+0.5); 
const store=(k,v)=>{ 
try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v));}catch(e){return null;}
};
const media=(q,f)=>{const m=matchMedia(q);if(m.addEventListener)m.addEventListener('change',f);else m.addListener(f);return m;};
const mine=el=>!el.closest('#quote,[data-veh-picker]'); 
const txt=el=>(el?el.textContent.replace(/\s+/g,' ').trim():'');
const byId=id=>d.getElementById(id);
const hide=(el,h)=>{el.hidden=h;if(el.style.display||(h&&getComputedStyle(el).display!=='none'))el.style.display=h?'none':'';};
let M=null,P=null;
try{M=JSON.parse(byId('lumen-pricing').textContent);P=w.makePricing(M);}
catch(e){M=P=null;warn('no pricing model, the static sedan prices stay',e);}
let month=new Date().getMonth()+1;
const qm=C.PREVIEW&&parseInt(new URLSearchParams(location.search).get('qa_month'),10);
if(qm>=1&&qm<=12)month=qm;
const winter=!!M&&M.policy.winter_months.indexOf(month)>=0;
const DEP=(M&&M.policy.deposit)||null,MULTI=(M&&M.policy.multi_vehicle)||null;
const pct=x=>Math.round(x*100)+'%';
const depositFor=t=>(DEP&&P&&typeof t==='number'&&t>0?Math.max(DEP.min,P.pyRound(t*DEP.share / DEP.round_to)*DEP.round_to):null);
const depAmt=x=>(x==null?null:typeof x==='number'?x:typeof x.amount==='number'?x.amount:null);
const dflt=(n,f)=>($$('[data-seg] input[name="'+n+'"]').find(x=>x.defaultChecked)||{value:f}).value;
let S=w.LumenState;
if(!S||typeof S!=='object'){
S=w.LumenState={vehicle:null,track:'f',level:1,
setVehicle(v){S.vehicle=v||null;fire('lumen:vehicle',S.vehicle);},
setLevel(t,l){S.track=t;S.level=l;fire('lumen:level',{track:t,level:l});}};
}
if(!/^[ief]$/.test(S.track))S.track=dflt('track','f');
if(S.freq==null)S.freq=dflt('freq','m');
if(S.ps==null)S.ps=dflt('ps','utv');
const lv={};
for(const t of'ief')lv[t]=dflt('lvl-'+t,2)-1;
if(S.level>=0&&S.level<=2)lv[S.track]=+S.level;
function veh(){
let v=S.vehicle||null,e='sedan',i;
if(v&&P){
const T=P.types[v.type];
if(!T||T.interior_only){warn('unknown vehicle type "'+v.type+'", showing sedan prices');v=null;}
else{
e=v.type;
if(v.itype&&v.itype!=='quote'){if(P.types[v.itype])i=v.itype;else warn('unknown interior type "'+v.itype+'"');}
}
}
return{v,e,i,q:!!v&&!!(v.interiorQuoted||v.itype==='quote')};
}
const LVL= /^([eif])([123])$/,PF={pf_refresh:'refresh',pf_reseal:'reseal',pf_full:'pfull'};
const INSIDE= /^[if][123]$|^resto$|^pf_full$/; 
const calc=(k,V,mins)=>{ 
const m=LVL.exec(k);
if(m)return P[mins?'minutes':'price'](m[1],m[2]-1,V.e,V.i);
if(PF[k])return P[mins?'pfMinutes':'pfPrice'](PF[k],V.e,V.i);
if(k==='resto')return mins?P.restorationMinutes(V.e,V.i):P.restoration(V.e,V.i);
if(!mins&&(k==='enh'||k==='corr'))return P.correction(k,V.e);
};
const TRACK={i:'Interior',e:'Exterior',f:'Full'};
const levelName=l=>((w.LumenBuilder&&w.LumenBuilder.LEVELS)||['Clean','Clean & Protect','Clean, Restore & Protect'])[l];
const typeLabel=V=>(V.v&&V.v.typeLabel)||P.types[V.e].label;
const fill=(a,fn)=>$$('[data-'+a+']').forEach(el=>{
try{
const k=el.getAttribute('data-'+a),t=fn(el,k);
if(t===undefined)warn('unknown data-'+a+' "'+k+'"');
else if(t!==null&&el.textContent!==t)el.textContent=t;
}catch(e){warn('could not fill data-'+a,e);}
});
const orig=el=>(el._lumen==null?(el._lumen=el.textContent):el._lumen); 
const snapshot=()=>$$('[data-vehicle-label],[data-type-label],[data-up-for],[data-plan-cycle]').forEach(orig);
const smalls=(el,h)=>[el.previousElementSibling,el.nextElementSibling].forEach(s=>{if(s&&s.tagName==='SMALL')hide(s,h);});
function oneoff(k,f,V){ 
const one=P.planOneOff(k,f,V.e,V.i),dd=half(P.plan(k,f,V.e,V.i)-one),avg=money(half(one));
const lead=money(Math.abs(dd))+(dd>0?' more':' less')+' per visit than booking ';
if(k==='pf')return lead+'a Refresh Wash + Interior Clean & Protect one-off ('+avg+').';
return lead+(f==='q'?'a Full Clean & Protect one-off ('+avg+')':'the same visits one-off (about '+avg+' each)')
+(dd>0?' — that covers priority booking and the member perks.':'.');
}
function render(){
sync();
if(!P)return;
const V=veh(),v=V.v,f=S.freq,q=k=>V.q&&INSIDE.test(k);
const name=v&&(v.name||typeLabel(V));
fill('vehicle-label',el=>name||orig(el));
fill('type-label',el=>(v?typeLabel(V):orig(el)));
fill('up-for',el=>(v?'for your '+(v.model||name):orig(el)));
fill('price',(el,k)=>{
const n=calc(k,V);
if(n===undefined)return n;
smalls(el,q(k));
return q(k)?'Quoted':money(n);
});
fill('time',(el,k)=>{const n=calc(k,V,1);return n===undefined?n:q(k)?'quoted from photos':P.hoursLabel(n);});
fill('long-note',(el,k)=>{ 
const n=calc(k,V,1);
if(n===undefined)return n;
hide(el,q(k)||!(n>M.policy.long_job_minutes));
return null;
});
fill('gw',(el,k)=>(M.glass_wheels.items[k]?money(P.glassWheels(k,V.e)):undefined));
fill('addon',(el,k)=>{
const m= /^(.+?)(?:-(cp|crp))?$/.exec(k),key=m[1],lv=m[2]==='crp'?2:m[2]==='cp'?1:0,A=M.addons[key];
if(!A&&!M.modifiers[key])return undefined;
const qi=V.q&&!!A&&A.side==='int'&&A.factor!=null;
if(m[2])hide(el.closest('.inc')||el,qi);
return qi?'Quoted':money(P.addon(key,V.e,V.i,lv).price);
});
fill('up',(el,k)=>{ 
const[a,b]=k.split('>'),pa=calc(a,V),pb=calc(b||'',V);
if(pa===undefined||pb===undefined)return undefined;
hide(el.closest('.upgrade')||el,q(a)||q(b));
return'+'+money(pb-pa);
});
fill('save',(el,k)=>{
const m= /^f([123])$/.exec(k);
if(k!=='max'&&!m)return undefined;
hide(el.closest('.save-line')||el,V.q);
return money(m?P.fullSaving(m[1]-1,V.e,V.i):P.maxSaving(V.e,V.i));
});
fill('save-badge',el=>{hide(el,V.q);return'Saves up to '+money(P.maxSaving(V.e,V.i));}); 
fill('plan',(el,k)=>{
if(!M.plans[k])return undefined;
smalls(el,V.q);
return V.q?'Quoted':money(P.plan(k,f,V.e,V.i));
});
fill('plan-oneoff',(el,k)=>{if(!M.plans[k])return undefined;hide(el,V.q);return oneoff(k,f,V);});
fill('plan-cycle',el=>(f==='q'?'Full Clean & Protect every visit.':orig(el)));
const F={pickup: /pickup$/.test(V.e),hdpickup:V.e==='hdpickup',lifted:!/^(sedan|coupe|minivan)$/.test(V.e),
ice:!(v&&+v.ev===1),rows2:!(v&&+v.rows===1),flush:true}; 
fill('filter',(el,k)=>{
const fs=k.split(/\s+/);
if(!fs.every(x=>x in F))return undefined;
hide(el,!fs.every(x=>F[x]));
return null;
});
fill('addon-count',el=>String($$('tbody tr:not(.tgroup)',el.closest('details,section')||d).filter(r=>!r.hidden).length));
fill('winter',el=>{hide(el,!winter);return null;});
fill('not-winter',el=>{hide(el,winter);return null;});
smsBodies();
}
const check=(n,val)=>$$('[data-seg] input[name="'+n+'"]').filter(mine).forEach(r=>{r.checked=r.value===String(val);});
const show=(a,val)=>{if(d.querySelector('[data-'+a+'="'+val+'"]'))$$('[data-'+a+']').forEach(p=>hide(p,p.getAttribute('data-'+a)!==val));};
function sync(){
check('track',S.track);
show('track-panel',S.track);
for(const t of'ief'){
const L=String(lv[t]+1);
check('lvl-'+t,L);
$$('[data-track-panel="'+t+'"] .tcol[data-level]').forEach(c=>c.classList.toggle('is-active',c.getAttribute('data-level')===L));
}
check('freq',S.freq);
check('ps',S.ps);
show('ps-panel',S.ps);
}
const onChange=e=>{
const x=e.target,n=x.name;
if(x.type!=='radio'||!x.closest('[data-seg]')||!mine(x))return;
if(n==='track'){S.track=x.value;S.level=lv[x.value];}
else if(/^lvl-[ief]$/.test(n)){
const t=n.slice(4);
lv[t]=x.value-1;
if(S.setLevel)S.setLevel(t,lv[t]); 
}
else if(n==='freq')S.freq=x.value;
else if(n==='ps')S.ps=x.value;
else return;
render();
};
const onLevel=e=>{
const x=e.detail||{};
if(/^[ief]$/.test(x.track)&&x.level>=0&&x.level<=2){S.track=x.track;S.level=lv[x.track]=+x.level;}
sync();
};
function closePickers(){
$$('[data-veh-picker]').forEach(pk=>{
if(pk.hidden)return;
const back=pk.contains(d.activeElement),b=pk.parentNode.querySelector('[data-change-vehicle]');
pk.hidden=true;
pk.textContent='';
if(b&&back)b.focus();
});
}
function initPickers(){
const mo=new MutationObserver(rs=>rs.forEach(r=>{
const b=r.target.parentNode.querySelector('[data-change-vehicle]:not([data-change-vehicle="builder"])');
if(b)b.setAttribute('aria-expanded',String(!r.target.hidden));
}));
$$('[data-veh-picker]').forEach(pk=>{
const b=pk.parentNode.querySelector('[data-change-vehicle]:not([data-change-vehicle="builder"])');
if(b)b.setAttribute('aria-expanded','false');
mo.observe(pk,{attributes:true,attributeFilter:['hidden']});
});
}
function changeVehicle(b){
const Q=w.LumenQuote,pk=b.parentNode.querySelector('[data-veh-picker]');
if(b.getAttribute('data-change-vehicle')==='builder'||!pk||!Q||!Q.mountPicker){ 
const q=byId('quote');
if(q)q.scrollIntoView({block:'start'});
if(Q&&Q.focusSearch)Q.focusSearch();
return;
}
const open=pk.hidden; 
closePickers();
if(!open)return;
pk.hidden=false;
Q.mountPicker(pk);
}
let sel=null;
const live=!!C.phone&&!C.PREVIEW; 
const smsHref=body=>'sms:'+(C.phone||'')+'?&body='+encodeURIComponent(body);
function label(s){ 
if(s.label)return s.label;
if(s.route==='restoration')return'Restoration Detail';
if(s.route==='protected'&&M)return M.protected[M.protected[s.kind]?s.kind:s.track==='f'?'pfull':'refresh'].label;
if(s.levelLabel&& /^(Full|Interior|Exterior|Restoration)\b/.test(s.levelLabel))return s.levelLabel;
const lvl=s.levelLabel||(s.route==='quoted'||!(s.level>=0)?'':levelName(s.level));
return((TRACK[s.track]||'')+(lvl?' '+lvl:'')).trim()||'Detail';
}
const extras=s=>{ 
const n=typeof s.extras==='number'?s.extras:(s.items||[]).length;return n?n+(n>1?' extras':' extra'):'';};
function norm(s){
if(!s||typeof s!=='object')return null;
if(s.v===2&&Array.isArray(s.vehicles)&&s.vehicles.length)return s;
if(s.v!==1)return null;
const vv=s.vehicle||{},iq=vv.itype==='quote'&&s.track!=='e';
return Object.assign({},s,{v:2,v1:true,multiDiscount:0,subtotal:s.total,
deposit:s.deposit!=null?s.deposit:iq?null:depositFor(s.total),
vehicles:[{name:vv.label||null,itype:vv.itype||null,typeLabel:null,track:s.track,level:s.level,label:label(s),
total:s.total,priceText:s.priceText,items:s.items}]});
}
const many=s=>s.vehicles.length>1;
const offNote=s=>(s.multiDiscount?' ('+(MULTI?pct(MULTI.additional_off)+' ':'')+'off '+(s.vehicles.length===2?'the second':'each additional one')+')':'');
function bookBody(s){ 
const own=s.text||s.body;
if(typeof own==='string'&&own)return own;
const a=(s.adjustments||[])[0],amt=a?money(Math.abs(a.amount)):'',x=s.vehicles[0],n=extras(x),L=[],dep=depAmt(s.deposit);
L.push('Hi Johnny, I\'d like to book'+(s.quoteId?' (Q-'+s.quoteId+')':'')+':');
if(many(s)){
s.vehicles.forEach((y,i)=>L.push((y.name||'Vehicle '+(i+1))+': '+label(y)+' '+(y.total!=null?money(y.total):'quoted from photos')));
if(s.multiDiscount)L.push('Multi-vehicle'+offNote(s)+': −'+money(Math.abs(s.multiDiscount)));
}else{
L.push(x.name||'My car: '); 
L.push(label(x)+': '+(x.priceText||(s.base!=null?money(s.base):x.total!=null?money(x.total):'quoted from photos')));
if(n&&Array.isArray(x.items))L.push('+ '+n+': '+money(x.items.reduce((t,y)=>t+(y.price||0),0)));
}
if(s.where)L.push('Where: '+(s.where==='studio'?'studio drop-off (−'+amt+')':s.where==='ext'?'mobile, Extended zone (+'+amt+')'
:s.where==='reg'?'mobile, Regional zone (+'+amt+')':'mobile, core valley (no travel fee)'));
if(s.total)L.push('Estimate '+money(s.total)+' before tax'+(!many(s)&&s.minutes&&P?' · '+P.hoursLabel(s.minutes).replace(/hour(s?)$/,'hr$1'):''));
if(dep)L.push('Deposit to hold the date: '+money(dep));
L.push('Day/time that works: ');
return L.join('\n').slice(0,600);
}
function smsBodies(){
if(!live)return;
const v=S.vehicle,name=(v&&(v.name||v.freeText))||'';
$$('[data-sms]').filter(mine).forEach(a=>{
const k=a.getAttribute('data-sms');
let body=k==='book'&&sel?bookBody(sel):B[k];
if(body==null)return warn('no SMS body for data-sms "'+k+'"');
if(body===B[k]&& /(My car|for my): $/.test(body))body+=name;
a.setAttribute('href',smsHref(body));
});
}
function showSel(s){
sel=norm(s);
smsBodies();
const p=byId('selection');
if(!p)return;
p.textContent='';
p.hidden=!sel;
if(!sel)return;
const b=d.createElement('button'),dep=depAmt(sel.deposit),parts=[];
if(many(sel)){ 
parts.push(sel.vehicles.length+' vehicles',sel.vehicles.map(label).join(' + '),
sel.total?money(sel.total)+' estimate'+offNote(sel):'quoted from photos',
sel.total&&!sel.vehicles.some(y=> /quoted/i.test(label(y)))
&&sel.vehicles.some(y=>y.interiorQuoted||(y.itype==='quote'&&y.track!=='e'))?'interior quoted from photos':'');
}else{
const x=sel.vehicles[0],n=extras(x),lab=label(x),tot=x.total!=null?x.total:sel.total;
const iq=(x.itype==='quote'||!!x.interiorQuoted)&&x.track!=='e',pt=typeof x.priceText==='string'?x.priceText:'';
parts.push(lab,x.name,tot?money(tot)+' estimate'+(iq?' for the exterior':'')+(n?' ('+n+')':''):pt,
(iq||(!tot&&!pt))&&!/quoted/i.test(lab)?(iq?'interior ':'')+'quoted from photos':'');
}
if(dep)parts.push(money(dep)+' deposit holds the date');
p.append('Your selection: '+parts.filter(Boolean).join(' · ')+' · ');
b.type='button';b.className='link-btn';b.textContent='Edit';b.setAttribute('data-edit-selection','');
p.append(b);
}
function book(el){
if(!P)return;
const key=el.getAttribute('data-book'),t=el.getAttribute('data-track'),L=+el.getAttribute('data-level'),V=veh(),v=V.v||{};
let k=null,lab,route='standard',price=null,minutes=null,machine=null,priceText=null,back=null;
if(t&&L){k=t+L;lab=TRACK[t]+' '+levelName(L-1);}
else if(PF[key]){k=key;route='protected';lab=M.protected[PF[key]].label;}
else if(/^hl_/.test(key)){ 
const card=el.closest('.card'),m= /\$([\d,]+)/.exec(txt(card&&card.querySelector('.price')));
route='headlights';lab='Headlight '+txt(card&&card.querySelector('h3'));price=m&&+m[1].replace(/,/g,'');
}
else if(key==='ps'){ 
const card=el.closest('.card'),pt=txt(card&&card.querySelector('.price')),m= /^\$([\d,]+)$/.exec(pt);
route='powersports';lab=txt(card&&card.querySelector('h3'));price=m?+m[1].replace(/,/g,''):null;
machine=txt(card&&card.querySelector('.lvl-track'));priceText=m?null:pt;back='powersports';
}
else if(/^plan_(std|pf)$/.test(key)){ 
const pk=key.slice(5),r=$$('[data-seg="freq"] input[name="freq"]').find(x=>x.value===S.freq);
route='plan';back='plans';
lab=txt(el.closest('.card')&&el.closest('.card').querySelector('h3'))+' plan · '+txt(r&&r.closest('label')).toLowerCase();
priceText=V.q?'quoted from photos':money(P.plan(pk,S.freq,V.e,V.i))+' / visit';
}
else if(key==='correction'){ 
route='correction';back='correct';lab='Paint correction';priceText='from '+money(calc('enh',V));
}
else return warn('unknown data-book "'+key+'"');
if(k&&!(V.q&&INSIDE.test(k))){price=calc(k,V);minutes=calc(k,V,1);}
const name=machine||(V.v?v.name||typeLabel(V):route==='headlights'?null:P.types.sedan.label);
const s={v:2,quoteId:null,
vehicles:[{name,typeLabel:machine||!V.v?null:typeLabel(V),track:t||null,level:t?L-1:null,
levelLabel:t?levelName(L-1):null,total:price,label:lab,priceText:priceText||null,itype:machine?null:v.itype||null}],
subtotal:price,multiDiscount:0,total:price,deposit:route==='plan'?null:depositFor(price),where:null,
route,kind:PF[key]||null,base:price,items:[],adjustments:[],minutes,createdAt:Date.now(),label:lab,key:k||key};
if(back)s.back=back; 
store('lumen_selection',s);
fire('lumen:selection',s);
}
function onClick(e){
const a=e.target.closest('a,button');
if(!a)return;
const href=a.getAttribute('href')||'',ours=mine(a);
if(ours&&a.matches('[data-change-vehicle]'))return changeVehicle(a);
if(a.matches('[data-edit-selection]')){ 
const q=byId((sel&& /^(powersports|plans|correct)$/.test(sel.back)&&sel.back)||'quote');
if(!q)return;
q.scrollIntoView({block:'start'});
if(!q.hasAttribute('tabindex'))q.setAttribute('tabindex','-1');
return q.focus({preventScroll:true});
}
if(ours&&a.matches('[data-book]'))book(a);
if(a.matches('[data-book-online]')){ 
const text=sel?bookBody(sel):(B.book||'')+((S.vehicle&&S.vehicle.name)||'');
try{navigator.clipboard.writeText(text).then(()=>toast('Quote copied — paste it into the booking notes.'),()=>{});}catch(x){ }
}
if(href[0]==='#')openTarget(href.slice(1));
if(!ours)return; 
if(a.hasAttribute('data-sms')|| /^sms:/.test(href))track('sms_click');
else if(a.hasAttribute('data-tel')|| /^tel:/.test(href))track('call_click');
else if(a.matches('[data-book],[data-book-online]')||(href==='#book'&&a.classList.contains('btn')))track('book_click');
}
function toast(msg){ 
const s=byId('selection'),p=d.createElement('p');
if(!s)return;
p.className='selection';p.setAttribute('role','status');p.textContent=msg;
s.after(p);
setTimeout(()=>p.remove(),6000);
}
function openTarget(id){
let el=null;
try{el=byId(decodeURIComponent(id));}catch(e){ }
for(;el;el=el.parentElement)if(el.tagName==='DETAILS')el.open=true;
}
const fields=f=>$$('input:not([type=hidden]):not(.hp),select,textarea',f);
const labelOf=(f,x)=>txt(x.id&&f.querySelector('label[for="'+x.id+'"]'))||x.name;
const formBody=(f,kind)=> 
[(B[kind==='waitlist'?'ceramic':kind]||'Hi Johnny,').replace(/\s*[^.]*:\s*$/,'')]
.concat(fields(f).filter(x=>x.value.trim()).map(x=>labelOf(f,x).replace(/\?$/,'')+': '+x.value.trim())).join('\n');
function invalid(f){ 
for(const x of fields(f)){
const v=x.value.trim(),lab=labelOf(f,x).toLowerCase(),pat=x.getAttribute('pattern');
if(x.required&&!v)return[x,x.tagName==='SELECT'?'Please answer: '+labelOf(f,x):'Please add your '+lab.replace(/^your /,'')+'.'];
if(v&&x.type==='tel'&&v.replace(/\D/g,'').length<10)return[x,'Please check your '+lab+'.'];
if(v&&pat&&!new RegExp('^(?:'+pat+')$').test(v))return[x,'Please enter '+lab.replace(/\?$/,'')+' as a number.'];
}
}
function failed(st,body){ 
const a=d.createElement('a');
a.href=live?smsHref(body):'#book';
a.textContent='Text me';
st.textContent='Didn\'t go through. ';
st.append(a,' instead — or try again.');
}
function submit(f){
const kind=f.getAttribute('data-form'),st=f.querySelector('.form-status')||d.createElement('p');
const btn=f.querySelector('[type=submit]'),hp=f.querySelector('.hp');
if(hp&&hp.value)return; 
const bad=invalid(f);
if(bad){st.textContent=bad[1];bad[0].setAttribute('aria-invalid','true');return bad[0].focus();}
const ep=(C.formEndpoint||{})[kind]||f.getAttribute('action'),body=formBody(f,kind);
st.textContent='';
if(!ep){ 
const mail=C.email&&!C.PREVIEW&&'mailto:'+C.email+'?subject='+encodeURIComponent((f.querySelector('[name=_subject]')||{}).value||'')
+'&body='+encodeURIComponent(body);
const url=live&&(matchMedia('(pointer:coarse)').matches||!mail)?smsHref(body):mail;
if(url)location.href=url;else failed(st,body);
return;
}
const was=btn?btn.textContent:'',ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),15000);
if(btn){btn.disabled=true;btn.textContent='Sending…';}
fetch(ep,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'},signal:ctl.signal})
.then(r=>{
if(!r.ok)throw new Error('HTTP '+r.status); 
f.reset();
st.textContent=kind==='fleet'?'Thanks. I\'ll be in touch within 1–2 business days.':'Thanks. I\'ll text you about your coating quote within 1–2 business days.';
track('form_submit_'+kind);
})
.catch(()=>failed(st,body))
.then(()=>{clearTimeout(timer);if(btn){btn.disabled=false;btn.textContent=was;}});
}
let menuOpen=false,barSync=()=>{}; 
function initMenu(){ 
const b=d.querySelector('.menu-btn'),m=b&&byId(b.getAttribute('aria-controls'));
if(!m)return;
const word=b.textContent;
const set=(open,focus)=>{
m.hidden=!open;
menuOpen=open;barSync();
b.setAttribute('aria-expanded',String(open));
b.textContent=open?'Close':word;
if(!open&&focus)b.focus();
};
b.addEventListener('click',()=>set(m.hidden));
m.addEventListener('click',e=>{if(e.target.closest('a'))set(false);});
d.addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.hidden)set(false,true);});
d.addEventListener('click',e=>{if(!m.hidden&&!e.target.closest('.site-header'))set(false);});
const wide=media('(min-width:1041px)',()=>{if(wide.matches)set(false);});
}
function initBar(){ 
const bar=d.querySelector('.actionbar'),vis={};
if(!bar||!w.IntersectionObserver)return;
const io=new IntersectionObserver(es=>{
for(const x of es){ 
vis[x.target.id]=x.isIntersecting&&(x.intersectionRatio>=0.3||x.intersectionRect.height>=0.3*(x.rootBounds?x.rootBounds.height:innerHeight));
}
barSync();
},{threshold:Array.from({length:21},(_,n)=>n / 20)});
barSync=()=>bar.classList.toggle('is-hidden',!!(vis.quote||vis.book||menuOpen));
['quote','book'].forEach(id=>byId(id)&&io.observe(byId(id)));
}
function initSlider(){ 
$$('.ba').forEach(ba=>{
const r=ba.querySelector('.ba-range'),after=ba.querySelector('.ba-after'),h=ba.querySelector('.ba-handle');
if(!r||!after)return;
const move=()=>{after.style.clipPath='inset(0 0 0 '+r.value+'%)';if(h)h.style.left=r.value+'%';};
r.addEventListener('input',move);
move();
});
}
function initCollapse(){ 
const apply=()=>$$('details[data-collapse-sm]').forEach(x=>{x.open=!mq.matches;});
const mq=media('(max-width:760px)',apply);
if(mq.matches)apply();
}
const safe=(name,f)=>{try{f();}catch(e){warn(name+' did not start',e);}};
safe('labels',snapshot);
safe('listeners',()=>{
d.addEventListener('change',guard(onChange));
d.addEventListener('click',guard(onClick));
d.addEventListener('lumen:level',guard(onLevel));
d.addEventListener('lumen:vehicle',guard(render));
d.addEventListener('lumen:selection',guard(e=>showSel(e.detail)));
w.addEventListener('hashchange',guard(()=>openTarget(location.hash.slice(1))));
$$('form[data-form]').forEach(f=>{
f.addEventListener('submit',e=>{e.preventDefault();guard(()=>submit(f))();});
f.addEventListener('input',e=>e.target.removeAttribute('aria-invalid'));
});
});
safe('pickers',initPickers);
safe('menu',initMenu);
safe('action bar',initBar);
safe('slider',initSlider);
safe('collapsibles',initCollapse);
safe('hash',()=>{if(location.hash.length>1)openTarget(location.hash.slice(1));});
safe('selection',()=>{ 
const s=store('lumen_selection');
showSel(s&&(!s.createdAt||Date.now()-s.createdAt<2592e6)?s:null);
});
w.LumenSite={render:guard(render),smsHref,month,winter};
w.LumenSite.render();
})();
