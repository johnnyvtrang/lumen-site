(function(root){
'use strict';
const norm=s=>(s||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'');
const words=s=>(s||'').toLowerCase().replace(/&/g,' and ').split(/[^a-z0-9]+/).filter(Boolean);
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const MAKE_ALIASES={
chevy:'Chevrolet',chev:'Chevrolet',chevrolete:'Chevrolet',chevorlet:'Chevrolet',cheverolet:'Chevrolet',chevolet:'Chevrolet',chevrolt:'Chevrolet',
vw:'Volkswagen',volks:'Volkswagen',volkswagon:'Volkswagen',volkswagan:'Volkswagen',vokswagen:'Volkswagen',volkwagen:'Volkswagen',
mercedes:'Mercedes-Benz',benz:'Mercedes-Benz',mb:'Mercedes-Benz',merc:'Mercedes-Benz',mercedez:'Mercedes-Benz',mercedezbenz:'Mercedes-Benz',
landrover:'Land Rover',rangerover:null,caddy:'Cadillac',cadilac:'Cadillac',caddilac:'Cadillac',alfa:'Alfa Romeo',mini:'MINI',
dodgeram:'Ram',infinity:'Infiniti',infinti:'Infiniti',hyundia:'Hyundai',hundai:'Hyundai',hyndai:'Hyundai',huyndai:'Hyundai',hyunday:'Hyundai',
toyta:'Toyota',toyoda:'Toyota',toyata:'Toyota',porshe:'Porsche',porche:'Porsche',subie:'Subaru',suburu:'Subaru',subaroo:'Subaru',
nissian:'Nissan',nisan:'Nissan',mitsubushi:'Mitsubishi',mitsibishi:'Mitsubishi',mitsu:'Mitsubishi',lincon:'Lincoln',pontiak:'Pontiac',
chrystler:'Chrysler',crysler:'Chrysler',jag:'Jaguar',jagaur:'Jaguar',lexis:'Lexus',izuzu:'Isuzu',isuzo:'Isuzu',isuzi:'Isuzu',
suzki:'Suzuki',susuki:'Suzuki',lambo:null,
};
const SIBLINGS={Ram:['Dodge'],Dodge:['Ram'],Hummer:['GMC'],Scion:['Toyota'],Genesis:['Hyundai'],Hyundai:['Genesis']};
const POPULAR={
Toyota:['RAV4','Camry','Tacoma','Corolla','Highlander','4Runner'],
Ford:['F-150','Explorer','Escape','Bronco','Ranger','Expedition'],
Chevrolet:['Silverado 1500','Equinox','Tahoe','Traverse','Malibu','Colorado'],
Honda:['CR-V','Civic','Accord','Pilot','Odyssey','HR-V'],
Subaru:['Outback','Forester','Crosstrek','Ascent','Impreza','WRX'],
Jeep:['Wrangler','Grand Cherokee','Cherokee','Gladiator','Compass','Wagoneer'],
Ram:['1500','2500','3500','ProMaster'],
GMC:['Sierra 1500','Yukon','Acadia','Terrain','Canyon','Sierra 2500HD / 3500HD'],
Nissan:['Rogue','Altima','Frontier','Pathfinder','Sentra','Titan'],
Hyundai:['Tucson','Santa Fe','Elantra','Palisade','Kona','Sonata'],
Kia:['Telluride','Sorento','Sportage','Forte','Soul','Carnival'],
Tesla:['Model Y','Model 3','Model S','Model X','Cybertruck'],
Mazda:['CX-5','CX-50','Mazda3','CX-90','CX-30','MX-5 Miata'],
Volkswagen:['Atlas','Tiguan','Jetta','Golf','ID.4','Taos'],
BMW:['X5','X3','3 Series','5 Series','X1','X7'],
'Mercedes-Benz':['GLC','GLE / M-Class','C-Class','E-Class','G-Class','Sprinter'],
Lexus:['RX','NX','ES','GX','IS','TX'],
};
const MAKE_RANK=Object.keys(POPULAR);
const POWERSPORTS=new Set(['golfcart','cart','kart','gokart','utv','atv','sxs','sidebyside','polaris','canam','brp','skidoo','seadoo',
'arcticcat','kawasakimule','mule','teryx','rzr','pioneer','wolverine','rhino','yxz','snowmobile','sled','mxz','jetski','waverunner','pwc',
'boat','pontoon','wakeboat','sailboat','outboard','rv','motorhome','trailer','fifthwheel','toyhauler','motorcycle','harley',
'harleydavidson','dirtbike','minibike','clubcar','ezgo','yamahadrive','lsv','yamaha','kawasaki','indian','lynx','bayliner','winnebago',
'keystone','jayco','airstream','coachmen','thor','icon','bounder','newmar','tiffin','heartland','dutchmen','ducati','ktm','husqvarna',
'aprilia','triumph','vespa','scooter','moped','trike','slingshot','ryker','hayabusa','gsxr','vstrom','burgman','sportster','softail',
'goldwing','ninja','cbr','crf','fourtrax','cfmoto','mastercraft','nautique','bennington']);
const PS_SOFT=new Set(['camper','campervan']); 
const PS_PHRASES=[['honda','talon'],['polaris','general'],['quad','bike'],['four','wheeler'],['maverick','x3'],['maverick','r'],
['maverick','sport'],['golf','cart'],['go','kart'],['side','by','side'],['side','x','side'],['can','am'],['ski','doo'],['sea','doo'],
['jet','ski'],['dirt','bike'],['pit','bike'],['club','car'],['ez','go'],['e','z','go'],['arctic','cat'],['fifth','wheel'],['5th','wheel'],
['toy','hauler'],['grand','design'],['forest','river'],['prime','time'],['travel','trailer'],['fleetwood','rv'],['fleetwood','discovery'],
['fleetwood','bounder'],['honda','rebel'],['honda','rubicon'],['honda','foreman'],['honda','goldwing'],['honda','gold','wing'],
['honda','grom'],['honda','rancher'],['honda','recon'],['honda','shadow'],['honda','africa','twin'],['evolution','cart'],['king','quad'],
['gsx','r'],['v','strom'],['cf','moto'],['harley','davidson'],['sea','ray']];
const EXOTIC_MAKES=new Set(['ferrari','ferarri','ferrarri','lamborghini','lamborgini','lamborghni','lambo','mclaren','maclaren','bentley',
'bently','rolls','rollsroyce','aston','astonmartin','lotus','bugatti','koenigsegg','pagani','rimac','spyker']);
const EXOTIC_PHRASES=[['continental','gt'],['flying','spur']];
const EXOTIC_MODELS=new Set(['huracan','aventador','urus','gallardo','murcielago','revuelto','countach','diablo','temerario','488','f8','sf90',
'f430','458','812','roma','portofino','purosangue','testarossa','enzo','laferrari','720s','750s','765lt','570s','600lt','650s',
'artura','senna','bentayga','mulsanne','cullinan','wraith','phantom','spectre','db11','db12','dbs','dbx','vantage','vanquish','rapide',
'evora','emira','elise','exige','eletre','chiron','veyron','jesko','regera','agera','huayra','zonda']);
const STOP=new Set(['limited','platinum','sport','gt','s','se','le','xle','xlt','lariat','tremor','rubicon','sahara','denali','trd',
'premium','touring','base','raptor','laramie']);
const STOP_PAIRS=[['king','ranch']];
const NOISE=new Set(['cab','van','truck','car','suv','wagon','coupe','sedan','pickup','electric','hybrid','sport','4x4','awd']);
const BODY={van:'van',vans:'van',minivan:'minivan',truck:'fullpickup',pickup:'fullpickup',suv:'midsuv',car:'sedan',sedan:'sedan',
hatchback:'sedan',hatch:'sedan',coupe:'coupe',convertible:'coupe',roadster:'coupe',sportscar:'coupe',wagon:'compact',crossover:'compact',
cuv:'compact',cab:null,'4x4':null,'4wd':null,awd:null,electric:null,hybrid:null,ev:null};
const MODS=new Set(['mini','small','compact','mid','midsize','size','full','fullsize','large','big','huge','heavy','duty','hd','oneton',
'3','row','third','7','8','seat','seater','seats','passenger','cargo','crew','extended','regular','family','work','lifted','sports',
'2','4','door','two','four','lowered']);
const FILLER=new Set(['my','a','an','the','our','i','have','got','own','its','it']);
const DROP=new Set(['my','the','our']); 
const FAMILY={fullpickup:['midpickup','fullpickup','hdpickup'],midsuv:['compact','midsuv','mid3row','fullsuv'],van:['van','minivan'],
minivan:['minivan'],sedan:['sedan'],coupe:['coupe'],compact:['compact']};
function refine(body,mods){
const m=w=>mods.includes(w);
if(body==='fullpickup')return(m('heavy')||m('hd')||m('duty')||m('oneton'))?'hdpickup':(m('mid')||m('midsize')||m('small')||m('compact')||m('mini'))?'midpickup':body;
if(body==='midsuv'){
if(m('full')||m('fullsize')||m('large')||m('big')||m('huge'))return'fullsuv';
if(m('3')||m('third')||m('row')||m('7')||m('8')||m('seat')||m('seater'))return'mid3row';
if(m('compact')||m('small')||m('mini'))return'compact';
return body;
}
if(body==='van')return(m('mini')||m('small')||m('compact'))?'minivan':body;
if(body==='sedan'&&m('sports'))return'coupe';
if(body===null&&(m('crew')||m('extended')||m('regular')))return'fullpickup';
return body;
}
const VK_SKIP=new Set(['cab','van','seat','seats','row','version','model']);
function variantKeysFor(name){
const keys=[];
const add=k=>{if(k&&keys.indexOf(k)<0)keys.push(k);};
for(const p of name.split(/[\/,()]/).map(s=>s.trim()).filter(Boolean)){
add(norm(p));
const w=words(p).filter(x=>!VK_SKIP.has(x));
if(w.length===1&&w[0].length>=3)add(w[0]);
}
if(/3.?row/i.test(name)){add('3row');add('threerow');}
if(/2.?row/i.test(name)){add('2row');add('tworow');}
if(/2.?door/i.test(name)){add('2door');add('twodoor');add('2dr');}
if(/4.?door/i.test(name)){add('4door');add('fourdoor');add('4dr');add('unlimited');}
return keys;
}
function autoAmap(make,model,variants,aliases){
const out={};
const skip=new Set(words(make).concat(words(model)));
const mn=norm(model);
const vk=variants.map(v=>({name:v.name||v[0],keys:variantKeysFor(v.name||v[0])}));
for(const a of aliases){
const aw=words(a),left=aw.filter(w=>!skip.has(w));
if(!left.length)continue;
const grams=new Set();
for(let i=0;i<left.length;i++)for(let j=i+1;j<=Math.min(left.length,i+3);j++)grams.add(left.slice(i,j).join(''));
for(let i=0;i<aw.length;i++)for(let j=i+2;j<=Math.min(aw.length,i+5);j++){const g=aw.slice(i,j).join('');if(g!==mn)grams.add(g);}
const hit=[];
for(const x of vk)if(x.keys.some(k=>grams.has(k))&&hit.indexOf(x.name)<0)hit.push(x.name);
if(hit.length===1)out[a]={variant:hit[0]};
}
return out;
}
function rowsToDB(rows){
return(rows||[]).map(r=>({
make:r[0],model:r[1],from:r[2],to:r[3],type:r[4],itype:r[5]||null,
variants:(r[6]||[]).map(x=>({name:x[0],type:x[1],itype:x[2]||null,from:x[3]||0,to:x[4]||0,
flags:x[5]?(Array.isArray(x[5])?x[5].slice():String(x[5]).split(',').filter(Boolean)):[]})),
aliases:r[7]||[],rows:r[8]==null?null:r[8],seats:r[9]==null?null:r[9],ev:r[10]?1:0,amap:r[11]||{},
}));
}
const validIn=(x,year)=>(!x.from||year>=x.from)&&(!x.to||year<=x.to);
function variantsFor(v,year){
const vs=(v&&v.variants)||[];
if(year)return vs.filter(x=>validIn(x,year));
const seen={};
return vs.filter(x=>(has(seen,x.name)?false:(seen[x.name]=true)));
}
function makeSearch(DB,opts){
opts=opts||{};
const nowYear=opts.year||new Date().getFullYear();
const maxTo=DB.reduce((m,v)=>Math.max(m,v.to||0),0);
const makeKeys={};
for(const v of DB)makeKeys[norm(v.make)]=v.make;
for(const k in MAKE_ALIASES)if(MAKE_ALIASES[k])makeKeys[k]=MAKE_ALIASES[k];
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const rows=DB.map(v=>{
const model=norm(v.model);
const modelNoMake=norm(v.model.replace(new RegExp('^'+esc(v.make)+'\\s+','i'),''));
const aliasSet=new Set((v.aliases||[]).map(norm).filter(a=>a&&a!==model));
const amapN={};
for(const a in(v.amap||{}))amapN[norm(a)]=v.amap[a];
const variantKeys=(v.variants||[]).map(x=>({x,keys:variantKeysFor(x.name)}));
const nameWords=words(v.model);
const aliasWords=(v.aliases||[]).map(words);
return{v,model,modelNoMake,makeModel:norm(v.make+' '+v.model),aliasSet,amapN,variantKeys,makeN:norm(v.make),nameWords,aliasWords};
});
const byMake={};
for(const r of rows)(byMake[r.v.make]=byMake[r.v.make]||[]).push(r);
const effTo=v=>(v.to>=maxTo?Math.max(v.to,nowYear)+1:v.to); 
const inRange=(v,year)=>year>=v.from&&year<=effTo(v);
const risky=n=>n.length<=3|| /^\d+$/.test(n);
const newest=(a,b)=>(b.v.to-a.v.to)||(b.v.from-a.v.from)||a.v.model.length-b.v.model.length;
const entry=(r,year,score)=>({v:r.v,variant:null,year:year&&inRange(r.v,year)?year:null,score:score||0,flags:[],variantFromAlias:null});
const resolved=x=>{
const vv=x.variant?(x.v.variants||[]).find(y=>y.name===x.variant):null;
return(vv?vv.type:x.v.type)+'/'+((vv?vv.itype:x.v.itype)||'');
};
const rankOf=make=>{const i=MAKE_RANK.indexOf(make);return i<0?99:i;};
const popRank=v=>{const i=(POPULAR[v.make]||[]).indexOf(v.model);return i<0?99:i;}; 
function stopMask(tokens){
const m=tokens.map(t=>STOP.has(t));
for(let i=0;i+1<tokens.length;i++)for(const p of STOP_PAIRS)if(tokens[i]===p[0]&&tokens[i+1]===p[1])m[i]=m[i+1]=true;
return m;
}
function scoreRows(cands,tokens,ctx){
const year=ctx.year;
const mask=stopMask(tokens);
const grams=[];
for(let i=0;i<tokens.length;i++)for(let j=i+1;j<=Math.min(tokens.length,i+4);j++){
let stopOnly=true;
for(let k=i;k<j;k++)if(!mask[k])stopOnly=false;
grams.push({s:tokens.slice(i,j).join(''),i,j,stopOnly,numeric: /^\d+$/.test(tokens.slice(i,j).join('')),covers:i===0&&j===tokens.length});
}
let strong=false;
for(const g of grams){
if((g.numeric&&!g.covers)||g.stopOnly)continue;
for(const r of cands)if(g.s===r.model||g.s===r.modelNoMake||(r.aliasSet.has(g.s)&&(!risky(g.s)||ctx.make||g.covers))){strong=true;break;}
if(strong)break;
}
let pTokens=tokens.filter((t,k)=>!NOISE.has(t)&&!mask[k]);
if(!pTokens.length&&ctx.make&&tokens.length&&!NOISE.has(tokens[tokens.length-1]))pTokens=tokens.slice(-1);
const prefix=pTokens.slice(Math.max(0,pTokens.length-3)).join('');
const minPrefix=ctx.make?1:3;
const out=[];
for(const r of cands){
let score=0,used=null,amapHit=null;
const mps=ctx.make?ctx.makePrefixes.concat([r.makeN]):[];
for(const g of grams){
const span=g.j-g.i;
let base=0;
if(!g.stopOnly){
if(g.s===r.model||g.s===r.modelNoMake)base=(g.numeric&&!ctx.make&&!g.covers&&strong)?0:4;
else if(r.aliasSet.has(g.s)&&(!risky(g.s)||ctx.make||g.covers))base=3;
}
if(!base&&ctx.make){ 
for(const mp of mps){
const s2=mp+g.s;
if(s2===r.makeModel||s2===r.model)base=4;else if(r.aliasSet.has(s2))base=3;
if(base)break;
}
}
if(base&&base+0.3*span>score){score=base+0.3*span;used=g;}
let am=has(r.amapN,g.s)?r.amapN[g.s]:null;
if(!am)for(const mp of mps)if(has(r.amapN,mp+g.s)){am=r.amapN[mp+g.s];break;}
if(am&&(!amapHit||span>amapHit.span))amapHit={e:am,span,g};
}
let prefixHit=false;
if(!score&&prefix.length>=minPrefix){
if(r.model.startsWith(prefix)||r.modelNoMake.startsWith(prefix))score=2;
else if(tokens.length===1&&pTokens.length===1&&prefix.length>=4&&r.model.includes(prefix))score=1;
prefixHit=!!score;
}
if(!score)continue;
if(ctx.make)score+=1;
if(ctx.sibling)score-=0.5;
const inYear=!!year&&inRange(r.v,year);
if(year)score+=inYear?0.5:-5;
let variant=null,vobj=null,vIdx=[];
if(r.variantKeys.length){
if(amapHit&&amapHit.e.variant){
const c=r.v.variants.filter(x=>x.name===amapHit.e.variant);
vobj=(year?c.filter(x=>validIn(x,year)):c)[0]||null;
}
if(!vobj){
const leftIdx=[];
tokens.forEach((t,k)=>{if(!used||k<used.i||k>=used.j)leftIdx.push(k);});
const leftGrams=[];
for(let i=0;i<leftIdx.length;i++)for(let j=i+1;j<=Math.min(leftIdx.length,i+3);j++){
const idx=leftIdx.slice(i,j);leftGrams.push({s:idx.map(k=>tokens[k]).join(''),idx});
}
for(let i=0;i<tokens.length;i++)for(let j=i+2;j<=Math.min(tokens.length,i+5);j++){
const g=tokens.slice(i,j).join('');
if(g!==r.model&&g!==r.modelNoMake){const idx=[];for(let k=i;k<j;k++)idx.push(k);leftGrams.push({s:g,idx});}
}
const lIdx=leftIdx.filter(k=>tokens[k]==='l');
for(const vk of r.variantKeys){
if(year&&!validIn(vk.x,year))continue;
const hit=leftGrams.find(lg=>vk.keys.indexOf(lg.s)>=0);
if(hit){vobj=vk.x;vIdx=hit.idx;break;}
if(lIdx.length&& /^(l|lwb|long|extended|xl)\b/i.test(vk.x.name)){vobj=vk.x;vIdx=lIdx;break;}
}
}
if(vobj){variant=vobj.name;if(!(amapHit&&amapHit.g===used&&amapHit.e.variant===vobj.name))score+=0.25;}
}
const explained={};
const mark=(i,j)=>{for(let k=i;k<j;k++)explained[k]=1;};
if(used)mark(used.i,used.j);
if(amapHit)mark(amapHit.g.i,amapHit.g.j);
if(prefixHit)pTokens.slice(Math.max(0,pTokens.length-3)).forEach(t=>{const k=tokens.lastIndexOf(t);if(k>=0)explained[k]=1;});
for(const k of vIdx)explained[k]=1;
let unexplained=0;
tokens.forEach((t,k)=>{if(!explained[k]&&!mask[k]&&!NOISE.has(t)&&!MODS.has(t)&&!FILLER.has(t))unexplained++;});
score-=0.1*unexplained;
const flags=[];
if(amapHit&&amapHit.e.flag)flags.push(amapHit.e.flag);
if(vobj)for(const f of vobj.flags||[])if(flags.indexOf(f)<0)flags.push(f);
out.push({v:r.v,variant,year:inYear?year:null,score:Math.round(score*100) / 100,flags,variantFromAlias:variant,_inYear:!year||inYear});
}
return out;
}
function shortlistFor(make,year,makeWords){
const own=(byMake[make]||[]).filter(r=>!year||inRange(r.v,year));
const sib=[];
for(const s of SIBLINGS[make]||[])for(const r of byMake[s]||[]){
if(makeWords.every(w=>r.nameWords.indexOf(w)>=0)&&(!year||inRange(r.v,year)))sib.push(r);
}
const picked=[],names={};
const take=r=>{const k=r.v.make+'|'+r.v.model;if(!has(names,k)&&picked.length<6){names[k]=1;picked.push(r);}};
const pop=POPULAR[make];
if(pop&&!year){
for(const n of pop){const c=own.filter(r=>r.v.model===n).sort(newest);if(c.length)take(c[0]);}
return picked;
}
if(pop)for(const n of pop){const c=own.filter(r=>r.v.model===n).sort(newest);if(c.length)take(c[0]);}
if(year){sib.sort(newest).forEach(take);own.slice().sort(newest).forEach(take);} 
else sib.concat(own).sort(newest).forEach(take); 
return picked;
}
function candidatesFor(stopTokens,make,year){
const seq=(arr,t)=>{for(let i=0;i+t.length<=arr.length;i++){let ok=true;for(let k=0;k<t.length;k++)if(arr[i+k]!==t[k]){ok=false;break;}if(ok)return true;}return false;};
const best={};
for(const r of(make?byMake[make]||[]:rows)){
const exact=r.model===stopTokens.join('')?1:0;
const inName=seq(r.nameWords,stopTokens);
const inAlias=r.aliasWords.some(aw=>seq(aw,stopTokens));
if(!exact&&!inName&&!inAlias)continue;
const k=r.v.make+'|'+r.v.model;
const cand={r,exact,inName:inName?1:0,iy:year&&inRange(r.v,year)?1:0};
const cur=best[k];
if(!cur||cand.iy>cur.iy||(cand.iy===cur.iy&&r.v.to>cur.r.v.to))best[k]=cand;
}
const cur=c=>(c.r.v.to>=maxTo?1:0); 
return Object.keys(best).map(k=>best[k]).sort((a,b)=>(b.exact-a.exact)||(b.iy-a.iy)||(cur(b)-cur(a))||(rankOf(a.r.v.make)-rankOf(b.r.v.make))||
(b.inName-a.inName)||(b.r.v.to-a.r.v.to)||a.r.v.model.length-b.r.v.model.length||a.r.v.make.localeCompare(b.r.v.make))
.filter((c,i,all)=>all.slice(0,i).filter(o=>o.r.v.make===c.r.v.make).length<3) 
.slice(0,6).map(c=>entry(c.r,year));
}
function aliasWordHits(tokens,make,year){
const mask=stopMask(tokens);
const real=tokens.filter((t,k)=>!mask[k]&&!NOISE.has(t)&&t.length>=3);
if(real.length!==1||tokens.length>2)return[];
const w=real[0];
const hits=(make?byMake[make]||[]:rows).filter(r=>r.aliasWords.some(a=>a.indexOf(w)>=0)&&(!year||inRange(r.v,year)));
hits.sort((a,b)=>rankOf(a.v.make)-rankOf(b.v.make)||newest(a,b));
return hits.length<=8?hits.slice(0,6).map((r,i)=>entry(r,year,1-i*0.01)):[];
}
function finish(res,list){
const best=new Map(); 
for(const x of list)if(!best.has(x.v)||best.get(x.v).score<x.score)best.set(x.v,x);
list=Array.from(best.values());
list.sort((a,b)=>b.score-a.score||popRank(a.v)-popRank(b.v)||(b.v.to-a.v.to)||a.v.model.length-b.v.model.length||a.v.make.localeCompare(b.v.make));
res.results=list.slice(0,8).map(x=>({v:x.v,variant:x.variant,year:x.year,score:x.score,flags:x.flags,variantFromAlias:x.variantFromAlias}));
const r0=res.results[0],r1=res.results[1];
res.typesDiffer=!!(r0&&r1&&r0.score-r1.score<=1.0&&resolved(r0)!==resolved(r1));
return res;
}
function search(query){
const res={results:[],redirect:null,suggest:null,candidates:[],shortlist:[],year:null,make:null,typesDiffer:false,noMatch:false};
const q=(query||'').trim();
const qn=norm(q);
if(qn.length<2)return res; 
const ws=words(q);
const joined=ws.join('');
const phrase=ph=>joined.indexOf(ph.join(''))>=0&&ph.every(p=>ws.indexOf(p)>=0);
if(ws.some(w=>POWERSPORTS.has(w))||PS_PHRASES.some(phrase)){res.redirect='powersports';return res;}
const softPS=ws.some(w=>PS_SOFT.has(w));
if(ws.some(w=>EXOTIC_MAKES.has(w))||EXOTIC_PHRASES.some(phrase)){res.redirect='exotic';return res;}
let year=null;
const rest=[];
for(const w of ws){
if(!year&& /^(19[89]\d|20[0-4]\d)$/.test(w))year=+w;
else if(!year&& /^\d{2}$/.test(w)&&ws.length>1&&rest.length===0&&(+w<=(nowYear%100)+1||+w>=90))year=+w>=90?1900+ +w:2000+ +w; 
else rest.push(w);
}
res.year=year;
if(rest.length&&rest.length<=4&&rest.every(w=>has(BODY,w)||MODS.has(w)||FILLER.has(w))&&rest.some(w=>has(BODY,w))){
const b=rest.find(w=>has(BODY,w));
res.redirect='generic';res.suggest=refine(BODY[b],rest);return res;
}
let make=null,makeWords=[];
const tokens=[];
for(let i=0;i<rest.length;i++){
const two=i+1<rest.length?rest[i]+rest[i+1]:null;
if(!make&&two&&has(makeKeys,two)){make=makeKeys[two];makeWords=[rest[i],rest[i+1]];i++;continue;}
if(!make&&has(makeKeys,rest[i])){make=makeKeys[rest[i]];makeWords=[rest[i]];continue;}
if(!DROP.has(rest[i])||rest.length===1)tokens.push(rest[i]);
}
res.make=make;
const typedMakeN=makeWords.join('');
let out=[];
if(tokens.length){
out=scoreRows(make?byMake[make]||[]:rows,tokens,{make,makePrefixes:make?[typedMakeN]:[],year,sibling:false});
if(make==='Ram'&&typedMakeN==='dodgeram') 
out=out.concat(scoreRows(byMake.Dodge||[],['ram'].concat(tokens),{make,makePrefixes:['dodge','ram'],year,sibling:true}));
if(make&&!out.length)out=aliasWordHits(tokens,make,year); 
if(make&&SIBLINGS[make]&&!out.some(x=>x._inYear!==false)){
for(const s of SIBLINGS[make])out=out.concat(scoreRows(byMake[s]||[],makeWords.concat(tokens),{make,makePrefixes:[typedMakeN],year,sibling:true}));
}
}else if(make){
res.shortlist=shortlistFor(make,year,makeWords).map(r=>entry(r,year));
if(res.shortlist.length&&!res.shortlist.some(x=>x.v.make===make)){ 
const l=res.shortlist.map((x,i)=>Object.assign(x,{score:1-i*0.01}));res.shortlist=[];return finish(res,l);
}
if(!res.shortlist.length&&year)res.shortlist=shortlistFor(make,null,makeWords).map(r=>entry(r,year));
res.redirect='make';return res;
}
if(softPS&&!(out.length&& /^(van|minivan)\//.test(resolved(out.slice().sort((a,b)=>b.score-a.score)[0])))){res.redirect='powersports';return res;}
if(out.length)return finish(res,out);
const mask=stopMask(tokens);
if(tokens.length&&mask.every(Boolean)){ 
const c=candidatesFor(tokens,make,year);
if(c.length){res.redirect='ambiguous';res.candidates=c;return res;}
}
if(tokens.length&&tokens.every(t=>t==='dually'||t==='drw')){ 
const c=rows.filter(r=>(!make||r.v.make===make)&&(r.v.variants||[]).some(x=>(x.flags||[]).indexOf('dually')>=0))
.sort((a,b)=>rankOf(a.v.make)-rankOf(b.v.make)||newest(a,b)).slice(0,6).map(r=>entry(r,year));
if(c.length){res.redirect='ambiguous';res.candidates=c;return res;}
}
if(make&&tokens.every(t=>has(BODY,t)||MODS.has(t)||NOISE.has(t))){ 
const fam=tokens.map(t=>BODY[t]).find(b=>b)||(tokens.indexOf('cab')>=0?'fullpickup':null);
const evOnly=tokens.some(t=>t==='electric'||t==='ev');
const types=fam?FAMILY[refine(fam,tokens)]||FAMILY[fam]:null;
const pop=POPULAR[make]||[];
const pick=(byMake[make]||[]).filter(r=>(!types||types.indexOf(r.v.type)>=0)&&(!evOnly||r.v.ev)&&(!year||inRange(r.v,year)));
pick.sort((a,b)=>((pop.indexOf(a.v.model)+1||99)-(pop.indexOf(b.v.model)+1||99))||newest(a,b));
const seen={},list=[];
for(const r of pick)if(!has(seen,r.v.model)&&list.length<6){seen[r.v.model]=1;list.push(entry(r,year,1.5-list.length*0.01));}
if(list.length)return finish(res,list);
res.redirect='make';res.shortlist=shortlistFor(make,null,makeWords).map(r=>entry(r,year));return res;
}
if(!make&&tokens.some(t=>EXOTIC_MODELS.has(t))){res.redirect='exotic';return res;}
const aw=aliasWordHits(tokens,make,year);
if(aw.length)return finish(res,aw);
let typingMake=false;
if(!make&&tokens.length===1&&tokens[0].length>=3){
const ms=[];
for(const k in makeKeys)if(k.indexOf(tokens[0])===0&&ms.indexOf(makeKeys[k])<0)ms.push(makeKeys[k]);
if(ms.length===1){res.redirect='make';res.make=ms[0];res.shortlist=shortlistFor(ms[0],year,words(ms[0])).map(r=>entry(r,year));return res;}
typingMake=ms.length>1;
}
res.noMatch=qn.length>=3&&tokens.join('').length>=3&&!typingMake; 
return res;
}
return search;
}
const LumenSearch={makeSearch,rowsToDB,variantsFor,variantKeysFor,autoAmap,norm,words,POPULAR,POWERSPORTS,PS_SOFT,EXOTIC_MAKES,EXOTIC_MODELS,STOP};
if(typeof module!=='undefined'&&module.exports)module.exports=LumenSearch;
else{root.LumenSearch=LumenSearch;root.makeSearch=makeSearch;} 
})(typeof window!=='undefined'?window:globalThis);
