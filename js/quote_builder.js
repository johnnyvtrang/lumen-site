(function(){
'use strict';
const LEVELS=['Clean','Clean & Protect','Clean, Restore & Protect'];
const TRACK_NAME={f:'Full',i:'Interior',e:'Exterior'};
const TRUCKS=new Set(['midpickup','fullpickup','hdpickup']);
const ACC_CARE=['roof_box','rack','rtt','boards','tonneau','cap'];
const ACC_NAME={roof_box:'roof box',rack:'rack',rtt:'rooftop tent',boards:'running boards',tonneau:'tonneau cover',cap:'truck cap'};
const LIGHTBAR_NAME={pods:'pods (pair)',s:'bar up to 20"',m:'20–40" bar',l:'40"+ bar'};
const RIDER_NAME={kids:'kids',dogs:'dogs',pets:'other pets',adults:'mostly adults'};
const INTERIOR_KEYS=['riders','seats','car_seats','pets','stains','stain_where','odor','headliner','lived'];
const EXTERIOR_KEYS=['outside','water','headlights','protected','trim','special','acc','lightbar'];
const RESTO_COVERED=new Set(['pet_hair','odor','shampoo_full','shampoo_floor','shampoo_seats','heavy_soil']);
const HL_LARGE_LENS=30;
const MAX_EXTRAS=8;
const SMS_MAX=600;
const LABEL={
pet_hair:'Heavy pet hair',car_seat:'Child car seat deep clean',heavy_soil:'Heavy soil, interior',
hl_polish:'Headlight Polish (bundled)',hl_restore:'Headlight Restore (bundled)',accessory:'Accessory care',
};
const SOFT_TOP_TYPES=['coupe','compact','midsuv'];
const OPEN_NAME= /convertible|cabrio|roadster|spyder|spider|volante|targa/i;
const SOFT_TOP_MODELS= /\b(wrangler|bronco(?! sport)|mx-5|miata|boxster|s2000|solstice|sky|z3|z4|mustang|camaro|corvette|911|beetle)\b/i;
const FABRIC_TOPS= /^(MINI (Cooper Convertible|Roadster)|Volkswagen Cabrio|Audi (A[34] )?Cabriolet|Saab (9-3|900) Convertible|Chrysler (PT Cruiser|LeBaron) Convertible|Dodge Shadow Convertible|Pontiac Sun(bird|fire) Convertible|Land Rover Range Rover Evoque Convertible|Nissan Murano CrossCabriolet)\b/;
const SHORT={
pet_hair:'Heavy pet hair',odor:'Ozone odor treatment',shampoo_seats:'Shampoo cloth seats',shampoo_floor:'Shampoo carpets & mats',
shampoo_full:'Full interior shampoo',alcantara:'Alcantara care',car_seat:'Child car seat',gloss_trim:'Gloss-black trim polish',
chrome_trim:'Chrome trim polish',chrome_heavy:'Heavy chrome polish',soft_top:'Soft top care',carbon:'Carbon fiber care',
heavy_soil:'Heavy soil, interior',water_light:'Water spots, light',water_heavy:'Water spots, heavy',trim_restore:'Trim restoration',
engine_bay:'Engine bay',ws_ceramic:'Windshield ceramic coating',all_glass_ceramic:'All-glass ceramic coating',
ws_polish:'Windshield polish',glass_polish:'All-glass polish',headliner:'Headliner cleaning',flush_salt:'Winter Salt Flush',flush_trail:'Trail Flush',
accessory:'Accessory care',restore_box:'Faded roof box restored',restore_cap:'Faded truck cap restored',truck_bed:'Truck bed',
hl_polish:'Headlight Polish (bundled)',hl_restore:'Headlight Restore (bundled)',fog:'Fog lights',tail:'Tail lights',
lightbar:'Light bar / pods',lifted:'Lifted or oversized tires',dually:'Dually',
};
const WHY={
pet_hair:'Heavy hair in seams and carpet takes extra time to pull out.',
car_seat:'Shell, buckles and cover cleaned; you reinstall it.',
odor:'Ozone treatment after the clean, for lingering odors.',
odor_smoke:'Ozone treatment after the clean, for smoke odor.',
alcantara:'Dedicated low-moisture cleaner; nap brushed back up by hand.',
chrome_trim:'Hand-polished with a chrome-safe metal polish, then sealed so water spots wipe off.',
chrome_heavy:'Chrome-safe metal polish by hand, then sealed. Window trim and emblems included.',
soft_top:'Dedicated soft-top cleaner and a soft brush at low pressure — never a pressure washer.',
carbon:'pH-neutral clean, then a protectant made for clear-coated carbon — no polish or abrasives.',
shampoo_full:'Hot-water extraction of seats, carpets and mats.',
shampoo_floor:'Hot-water extraction of the carpets and mats.',
shampoo_floor_l2:'Hot-water extraction of the carpets (mats are already in this level).',
shampoo_seats:'Hot-water extraction of cloth seats.',
heavy_soil:'Sand, crumbs or mess throughout adds about a quarter more time inside. Confirmed at the walkaround.',
flush_trail:'Degreasing undercarriage wash: frame, skid plates, suspension and wheel wells cleared of packed mud (it traps moisture), leaving some anti-corrosion protection.',
flush_salt:'Degreasing undercarriage wash: frame, suspension, brake lines and wheel wells cleared of road salt and grime, leaving some anti-corrosion protection.',
water_light:'Mineral spots removed before protection goes on.',
water_heavy:'Acid mineral remover + clay. Etched rings on the paint need machine polishing, done on-site (quoted).',
trim_restore:'Chalky gray plastics restored with a dedicated trim restorer.',
truck_bed:'Bed washed, dried and dressed.',
lifted:'Ladder work, taller tires and deeper wheel wells.',
dually:'Two extra wheels and tires.',
lightbar:'Restored with this detail at the bundled price.',
hl_polish:'Polish tier at the bundled price. 1-year clarity warranty.',
hl_restore:'Restore tier at the bundled price. 1-year clarity warranty.',
headliner:'Low-moisture cleaner and a soft brush across the whole headliner — too much water can loosen its glue.',
headliner_x:'Low-moisture clean of the whole headliner, for the smoke film that settles there.',
ws_ceramic:'Rain beads off the windshield; ice and bugs come off easier.',
all_glass_ceramic:'Windshield, side & rear glass and mirrors (sunroof on request): rain beads off, ice and bugs come off easier.',
glass_polish_line:'Etched spots polished off so the coating bonds to smooth glass — confirmed at the walkaround.',
coat_prep:'Doubles as prep for the glass coating.',
extra:'Added as an extra.',
};
const SALT_SEASON_TAG='recommended Nov–Mar';
const opt=(value,label,extra)=>Object.assign({value,label},extra||{});
const STEPS=[
{id:'vehicle',n:1,title:'Vehicle',heading:'What are we detailing?'},
{id:'inside',n:2,title:'Inside',heading:'Inside',skip:{label:'Only want the outside? Skip to Outside',track:'e',to:'outside'}},
{id:'outside',n:3,title:'Outside',heading:'Outside',skip:{label:'Only want the inside? Skip ahead',track:'i',to:'service'}},
{id:'gear',n:4,title:'Racks, gear & extras',heading:'Racks, gear & extras',help:'Cleaned and UV-protected in place — not removed.',skipWhenTrack:'i'},
{id:'service',n:5,title:'What would you like?',heading:'What would you like?',button:'See my price'},
];
const QUESTIONS=[
{key:'riders',step:'inside',type:'multi',legend:'Who rides in it?',options:[
opt('kids','Kids',{help:"Kids' crumbs and sticky spots in every seam? Choose Heavy below."}),
opt('dogs','Dogs'),opt('pets','Other pets'),opt('adults','Mostly adults')],
note:'Not used for pricing. Kids reveals car_seats; Dogs or Other pets reveals pets. Call applyRiders() after a change.'},
{key:'seats',step:'inside',type:'single',legend:'Seats',options:[
opt('cloth','Cloth',{materials:['cloth']}),opt('leather','Leather or leatherette',{materials:['leather','leatherette']}),
opt('alcantara','Alcantara or microsuede',{materials:['alcantara']}),
opt('suede','Genuine suede, nubuck or aniline leather',{materials:['leather','alcantara']}),opt('unsure','Not sure')]},
{key:'car_seats',step:'inside',type:'count',legend:'Child car seats to clean',help:'I clean them; you reinstall them for safety.',
options:[opt(0,'None'),opt(1,'1'),opt(2,'2'),opt(3,'3'),opt(4,'4')]},
{key:'pets',step:'inside',type:'single',legend:'Pet hair',options:[
opt('none','None'),opt('some','A little (free)'),opt('heavy','A lot — the dog rides often')]},
{key:'stains',step:'inside',type:'single',legend:'Stains or spills',options:[
opt('none','None'),opt('spots','A few spots'),opt('lots','A lot — seats or carpet look dirty overall')]},
{key:'stain_where',step:'inside',type:'single',legend:'Where?',options:[opt('seats','Seats'),opt('carpet','Carpet'),opt('both','Both')]},
{key:'odor',step:'inside',type:'single',legend:'Any smell?',options:[
opt('none','No'),opt('odor','Yes — pets, food or musty'),opt('smoke','Yes — cigarette or vape smoke')]},
{key:'headliner',step:'inside',type:'single',legend:'Headliner stains or smoke film?',
help:"Cleaning lifts stains and smoke film. It can't fix a sagging headliner — that's a re-glue job.",
options:[opt('no','No'),opt('yes','Yes')]},
{key:'lived',step:'inside',type:'single',legend:'How lived-in is it?',options:[
opt('normal','Normal daily use'),opt('heavy','Heavy — sand, crumbs or mess in every seam'),opt('year',"It hasn't been cleaned in a year or more")]},
{key:'outside',step:'outside',type:'single',legend:'How dirty is the outside?',options:[
opt('normal','Normal daily driver'),opt('muddy','Muddy — trail, dirt road or job site'),opt('neglect','Neglected — months without a wash')]},
{key:'water',step:'outside',type:'single',legend:'Water spots on paint or glass',options:[
opt('none','None'),opt('light','Light rings'),opt('heavy','Baked-on — sprinkler side')]},
{key:'headlights',step:'outside',type:'single',legend:'Headlights',options:[opt('clear','Clear'),opt('hazy','Hazy or cloudy'),opt('yellow','Yellowed')]},
{key:'protected',step:'outside',type:'single',legend:'Is the paint already protected?',options:[
opt('no','No / not sure'),opt('ceramic','Ceramic coating'),opt('ppf','Paint protection film (PPF)'),opt('wrap','Wrap or matte paint')]},
{key:'trim',step:'outside',type:'single',legend:'Black plastic trim',options:[opt('no','Looks fine'),opt('some','A little gray'),opt('heavy','Very faded or chalky')]},
{key:'special',step:'outside',type:'multi',legend:'Anything special about the car?',
help:'Same price at every level. Small pieces — a few chrome emblems or a carbon mirror cap — are included, so leave those unticked.',
options:[opt('chrome_light','Chrome trim — window trim & emblems'),opt('chrome_heavy','Lots of chrome — grille, bumpers, running boards'),
opt('soft_top','Convertible soft top',{softTop:true}),opt('carbon','Exposed carbon fiber'),
opt('single_stage','Classic or single-stage paint'),opt('unsure','Not sure — check at the walkaround')]},
{key:'acc',step:'gear',type:'multi',legend:'Racks, gear & extras',help:'Cleaned and UV-protected in place — not removed.',options:[
opt('roof_box','Roof / ski box'),opt('rack','Roof or bike rack'),opt('rtt','Rooftop tent',{hideFor:['coupe']}),
opt('boards','Running boards or rock sliders'),opt('lightbar','Light bar or pods',{hideFor:['coupe']}),
opt('lifted','Lifted or oversized tires',{hideFor:['sedan','coupe','minivan']}),
opt('tonneau','Tonneau cover',{trucksOnly:true}),opt('cap','Truck cap / topper',{trucksOnly:true}),
opt('bed','Truck bed clean & dress',{trucksOnly:true}),opt('dually','Dually',{onlyFor:['hdpickup']}),
opt('none','None',{exclusive:true})]},
{key:'lightbar',step:'gear',type:'single',legend:'Light bar size',options:[
opt('pods','Pods (pair)'),opt('s','Bar up to 20"'),opt('m','20–40"'),opt('l','40"+')]},
{key:'track',step:'service',type:'single',legend:'What would you like?',options:[
opt('f','Inside & out',{saves:true}),opt('i','Interior only'),opt('e','Exterior only')]},
{key:'level',step:'service',type:'single',legend:'Level',help:"Not sure? I'll recommend one from your answers.",options:[
opt('auto','Recommend for me'),opt('0','Clean'),opt('1','Clean & Protect'),opt('2','Clean, Restore & Protect')]},
{key:'where',step:'service',type:'single',legend:'Where should I do it?',help:'Not sure of your zone? See <a href="#area">Service area</a>.',options:[
opt('core','Mobile — core valley (no travel fee)'),opt('ext','Mobile — Extended zone',{fee:'ext'}),
opt('reg','Mobile — Regional zone',{fee:'reg'}),opt('studio','Studio drop-off',{pct:'studio_discount',studioOnly:true})]},
];
const STRINGS={
mold:'Mold, flood or rodents? Text photos — those start with an assessment (Disaster Detail).',
quotedInterior:'Interior: quoted from photos (12–15-passenger and camper interiors vary too much to price online).',
w1:'November–March: the mobile exterior wash is rinseless (no hose rinse), with the same price and protection steps. Undercarriage flushes are available year-round.',
coating:"Coated by another shop? Tell me who installed it — some coating warranties also need the installer's annual inspection.",
restoIncludes:'Restoration Detail includes full extraction, heavy pet hair, stain pre-treatment and ozone. Confirmed from photos.',
neglectPhotos:'Long-neglected interiors are confirmed from photos.',
petsFree:'Light pet hair is included — no charge.',
leatherIncluded:"Leather stains come out in this level's leather deep-clean.",
trimIncluded:'Faded trim is restored in this level — light or heavy.',
waterReseal:'Water spots come off in the Decon & Reseal step.',
etched:'Etched rings on the paint need machine polishing (Gloss Enhancement or Paint Correction, done on-site) — quoted.',
suede:'Genuine suede, nubuck or aniline leather: quoted after a test spot — water can mark these materials.',
singleStage:'Classic or single-stage paint: quoted after a test spot — I check how the paint reacts before any polish or protection goes on.',
specialUnsure:"I'll check for specialty surfaces at the walkaround and tell you before starting.",
chromeIncluded:'Included in heavy chrome polish',
glassTitle:'Glass ceramic coating',
glassIncluded:'Included in all-glass ceramic coating',
glassPrepWalk:"Glass coating prep: coatings bond to clean, smooth glass and seal in whatever is on it. I check for water spots and wiper haze at the walkaround and quote any removal before starting.",
polishMaybe:'Only if etched spots are still there after the chemical spot removal — I check at the walkaround and quote it before starting.',
cheaperCrp:'Clean, Restore & Protect covers this work for no more than Clean & Protect plus add-ons',
trimIncludedLine:'Faded trim restored — part of this level.',
includedWhy:'Part of this level.',
};
function wsIncludedNote(M){
const w=M.included.always['2'].ws_ceramic;
return`A windshield ceramic coating is part of this level. If it can't go on (the glass is already coated, or the weather is outside the product's range), ${money(w.skip_credit_usd)} comes off at the walkaround.`;
}
function glassPrep(P,e,i,lv){
const M=P.model;
return`Coatings bond to clean, smooth glass and seal in whatever is on it, so water spots and wiper haze come off first: light spots chemically `+
`(${M.addons.water_light.label.replace(/:.*$/,'').toLowerCase()}, ${money(P.addon('water_light',e,i,lv).price)}), etched spots by polishing `+
`(windshield ${money(P.glassWheels('ws_polish',e))}, all glass ${money(P.glassWheels('glass_polish',e))}). I check at the walkaround and quote it before starting.`;
}
const money=n=>'$'+String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g,',');
const pyRound=x=>{const f=Math.floor(x),d=x-f;if(Math.abs(d-0.5)<1e-9)return(f%2===0)?f:f+1;return Math.round(x);};
const cp=s=>Array.from(String(s)); 
const arr=x=>(Array.isArray(x)?x.slice():[]);
const has=(list,x)=>list.indexOf(x)!==-1;
const isTruck=e=>TRUCKS.has(e);
function seatOptions(vehicle){
const mats=vehicle&&Array.isArray(vehicle.seats)&&vehicle.seats.length?vehicle.seats:null;
return QUESTIONS[1].options.filter(o=>!o.materials||!mats||o.materials.some(m=>has(mats,m)));
}
function accAllowed(key,e){
const o=QUESTIONS.find(q=>q.key==='acc').options.find(x=>x.value===key);
if(!o||o.exclusive)return false;
if(o.hideFor&&has(o.hideFor,e))return false;
if(o.trucksOnly&&!isTruck(e))return false;
if(o.onlyFor&&!has(o.onlyFor,e))return false;
return true;
}
function specialty(vehicle,eType){
const v=vehicle||{},e=eType||v.type||'sedan';
const mv=[v.model,v.variant].filter(Boolean).join(' ');
const open=OPEN_NAME.test([mv,v.name,v.freeText].filter(Boolean).join(' '));
const softTopShown=has(SOFT_TOP_TYPES,e)||open;
const fabric= /soft[ -]?top/i.test(mv)||FABRIC_TOPS.test([v.make,mv].join(' '));
const softTopPrecheck=!v.manual&& /convertible|cabrio|roadster/i.test(mv)&&fabric&&!/hard ?top|coupe/i.test(String(v.variant||''));
const softTopOffered=softTopShown&&(open||SOFT_TOP_MODELS.test([v.model,v.freeText].filter(Boolean).join(' '))||(!!v.manual&&e==='coupe'));
const carbonOffered=e==='coupe'||(Array.isArray(v.seats)&&has(v.seats,'alcantara'));
return{softTopShown,softTopPrecheck,softTopOffered,carbonOffered};
}
const SPECIAL_VALUES=['chrome_light','chrome_heavy','soft_top','carbon','single_stage','unsure'];
const specialAllowed=(x,sp)=>has(SPECIAL_VALUES,x)&&(x!=='soft_top'||sp.softTopShown);
function defaultAcc(vehicle){
const flags=arr(vehicle&&vehicle.flags);
return vehicle&&vehicle.type==='hdpickup'&&has(flags,'dually')?['dually']:[];
}
function defaultAnswers(vehicle){
const so=seatOptions(vehicle);
const onlyAlc=!!(vehicle&&Array.isArray(vehicle.seats)&&vehicle.seats.length===1&&vehicle.seats[0]==='alcantara');
const seats=onlyAlc?'alcantara':(so.find(o=>o.value!=='alcantara'&&o.value!=='suede')||so[0]).value;
return{riders:[],seats,car_seats:0,pets:'none',stains:'none',stain_where:'seats',odor:'none',headliner:'no',lived:'normal',
outside:'normal',water:'none',headlights:'clear',protected:'no',trim:'no',
special:specialty(vehicle).softTopPrecheck?['soft_top']:[],acc:defaultAcc(vehicle),lightbar:'pods',
track:'f',level:'auto',where:'core',extras:[]};
}
function applyRiders(answers){
const a=Object.assign({},answers);
if(!Array.isArray(a.riders))return a;
if(!has(a.riders,'kids'))a.car_seats=0;
if(!has(a.riders,'dogs')&&!has(a.riders,'pets'))a.pets='none';
return a;
}
function questionsFor(vehicle,answers,P,cfg){
const a=answers||{},M=P.model,e=vehicle?vehicle.type:'sedan',studio=!!(cfg&&cfg.studio);
const riders=Array.isArray(a.riders)?a.riders:null;
return QUESTIONS.map(q=>{
let options=q.options;
if(q.key==='seats')options=seatOptions(vehicle);
if(q.key==='acc')options=options.filter(o=>o.exclusive||accAllowed(o.value,e));
if(q.key==='special'){const sp=specialty(vehicle,e);options=options.filter(o=>!o.softTop||sp.softTopShown);}
if(q.key==='where')options=options.filter(o=>!o.studioOnly||studio);
options=options.map(o=>{
const c=Object.assign({},o);
if(o.fee)c.label=`${o.label} (+${money(M.location.travel[o.fee])})`;
if(o.pct)c.label=`${o.label} (${Math.round(M.location[o.pct]*100)}% off)`;
return c;
});
let visible=true;
if(q.key==='car_seats')visible=!(vehicle&&vehicle.rows===1)&&(!riders||has(riders,'kids'));
if(q.key==='pets')visible=!riders||has(riders,'dogs')||has(riders,'pets');
if(q.key==='stain_where')visible=!!a.stains&&a.stains!=='none';
if(q.key==='lightbar')visible=has(arr(a.acc),'lightbar')&&accAllowed('lightbar',e);
if(q.key==='special')visible=a.track!=='i'; 
return Object.assign({},q,{options,visible});
});
}
function context(answers,vehicle,P,cfg){
const a0=answers||{},v=vehicle||{},M=P.model;
cfg=cfg||{};
const now=new Date();
const month=Number(cfg.month)||now.getMonth()+1;
const nowYear=Number(cfg.nowYear)||now.getFullYear();
const studio=!!cfg.studio;
const e=v.type&&P.types[v.type]&&!P.types[v.type].interior_only?v.type:'sedan';
const quotedI=!!(v.interiorQuoted||v.itype==='quote');
const i=!quotedI&&v.itype&&P.types[v.itype]?v.itype:e;
const d=defaultAnswers(v),sp=specialty(v,e);
const pick=(k,allowed)=>(a0[k]!=null&&has(allowed,a0[k])?a0[k]:d[k]);
const a={
riders:arr(a0.riders),
seats:pick('seats',['cloth','leather','alcantara','suede','unsure']),
car_seats:v.rows===1?0:Math.max(0,Math.min(4,Math.floor(Number(a0.car_seats)||0))),
pets:pick('pets',['none','some','heavy']),
stains:pick('stains',['none','spots','lots']),
stain_where:pick('stain_where',['seats','carpet','both']),
odor:pick('odor',['none','odor','smoke']),
headliner:pick('headliner',['no','yes']),
lived:pick('lived',['normal','heavy','year']),
outside:pick('outside',['normal','muddy','neglect']),
water:pick('water',['none','light','heavy']),
headlights:pick('headlights',['clear','hazy','yellow']),
protected:pick('protected',['no','ceramic','ppf','wrap']),
trim:pick('trim',['no','some','heavy']),
special:(Array.isArray(a0.special)?a0.special:d.special).filter((x,n,l)=>specialAllowed(x,sp)&&l.indexOf(x)===n),
acc:(Array.isArray(a0.acc)?a0.acc:d.acc).filter((x,n,l)=>accAllowed(x,e)&&l.indexOf(x)===n),
lightbar:pick('lightbar',['pods','s','m','l']),
extras:arr(a0.extras),
};
const track=has(['f','i','e'],a0.track)?a0.track:'f';
const lv=a0.level==null||a0.level===''||a0.level==='auto'?'auto':Number(a0.level);
const levelAns=lv==='auto'||!has([0,1,2],lv)?'auto':lv;
let where=has(['core','ext','reg','studio'],a0.where)?a0.where:'core';
if(where==='studio'&&!studio)where='core'; 
const skipped=[];
const changed=k=>{
if(k==='riders')return a.riders.length>0;
if(k==='acc')return a.acc.length>0&&a.acc.slice().sort().join()!==d.acc.slice().sort().join();
if(k==='special')return a.special.length>0&&a.special.slice().sort().join()!==d.special.slice().sort().join();
if(k==='lightbar')return false; 
if(k==='stain_where')return false; 
if(k==='car_seats')return a.car_seats>0;
return a[k]!==d[k];
};
if(track==='e')INTERIOR_KEYS.forEach(k=>changed(k)&&skipped.push(k));
if(track==='i')EXTERIOR_KEYS.forEach(k=>changed(k)&&skipped.push(k));
return{a,v,P,M,e,i,quotedI,track,levelAns,where,studio,month,nowYear,sp,
winter:has(M.policy.winter_months,month),skipped};
}
function run(c,force,lift){
const{a,P,M,e,i}=c;
const explicit=force!=null||c.levelAns!=='auto';
const pt=c.quotedI?(c.track==='i'?null:'e'):c.track;
const notes=[],items=[],actions=[];
const note=(key,text)=>{if(!notes.some(n=>n.key===key))notes.push({key,text});};
if(c.quotedI)note('quoted_interior',STRINGS.quotedInterior);
if(pt===null)return quotedOnly(c,explicit,force,notes);
const hasI=pt!=='e',hasE=pt!=='i';
const reasons=[];
if(hasI&&a.lived==='year')reasons.push("it hasn't been cleaned in a year or more");
if(hasI&&a.stains==='lots'&&(a.seats==='leather'||a.seats==='alcantara'||a.seats==='suede')&&a.stain_where!=='carpet')
reasons.push(a.seats==='alcantara'?'Alcantara stains need the deep-clean':'leather stains need the deep-clean');
if(hasE&&a.outside==='neglect')reasons.push('months without a wash need a clay treatment');
const lifted=!!(lift&&force==null&&c.levelAns==='auto'&&!reasons.length);
if(lifted)reasons.push(STRINGS.cheaperCrp);
const level=force!=null?force:c.levelAns!=='auto'?c.levelAns:reasons.length?2:1;
const prot=hasE&&a.protected!=='no';
let route=prot?'protected':'standard',kind=null,base,bmin,baseLabel,ilv,elv;
if(prot){
kind=pt==='f'?'pfull':level===2||a.outside==='neglect'?'reseal':'refresh';
base=P.pfPrice(kind,e,i);bmin=P.pfMinutes(kind,e,i);baseLabel=M.protected[kind].label;
ilv=kind==='pfull'?2:null; 
elv=null; 
}else{
base=P.price(pt,level,e,i);bmin=P.minutes(pt,level,e,i);baseLabel=`${TRACK_NAME[pt]} · ${LEVELS[level]}`;
ilv=elv=level;
}
const delta=(to,from)=>P.price(pt,to,e,i)-P.price(pt,from,e,i);
const add=(key,why,o)=>{
o=o||{};
const qty=o.qty||1,lv=o.lv==null?null:o.lv;
const r=P.addon(key,e,i,lv,o.opt);
const d=M.addons[key]||M.modifiers[key]||{};
const l2=lv!=null&&((d.l2_credit&&lv>=(d.glass_credit_from_level==null?2:d.glass_credit_from_level))||(lv===2&&d.crp_credit_addon));
const label=o.label||(l2&&d.l2_label)||LABEL[key]||d.label;
items.push({key,label:label+(qty>1&&!o.label?` ×${qty}`:''),short:(o.short||SHORT[key]||label)+(qty>1?` ×${qty}`:''),
qty,price:r.price*qty,minutes:r.minutes*qty,why,level:lv,source:o.source||'answer',opt:o.opt||null});
};
const addSpecial=(key,source)=>{
const g=M.glass_wheels.items[key];
const r=g?{price:P.glassWheels(key,e),minutes:P.glassWheelsMinutes(key,e)}:P.addon(key,e,i);
items.push({key,label:(g||M.addons[key]).label,short:SHORT[key],qty:1,price:r.price,minutes:r.minutes,
why:WHY[key],level:null,source:source||'answer',opt:null,specialty:true});
};
if(hasI){
const lv=ilv;
if(a.pets==='heavy')add('pet_hair',WHY.pet_hair);
if(a.pets==='some')note('pets_free',STRINGS.petsFree);
if(a.car_seats>0)add('car_seat',WHY.car_seat,{qty:a.car_seats});
let st=a.stains,w=a.stain_where;
const forcedExtraction=pt==='i'&&a.lived==='year'&&level===2;
if(forcedExtraction){st='lots';w='both';}
const cloth=a.seats==='cloth'||a.seats==='unsure';
if(st==='spots'){
if(lv===0&&w!=='carpet')note('spots_cp',`Spot treatment starts at Clean & Protect (+${money(delta(1,0))}).`);
if(lv!==2&&w!=='seats')note('spots_carpet',`Carpet spot treatment is part of Clean, Restore & Protect (+${money(delta(2,lv))}).`);
}
if(st==='lots'){
const l2=lv===2?2:null;
if(w==='both'&&cloth)add('shampoo_full',WHY.shampoo_full,{lv:l2});
else{
if(w==='both'||w==='carpet')add('shampoo_floor',l2?WHY.shampoo_floor_l2:WHY.shampoo_floor,{lv:l2});
if(w==='seats'&&cloth)add('shampoo_seats',WHY.shampoo_seats);
if(w!=='carpet'&&!cloth){
if(lv===2)note('leather_included',STRINGS.leatherIncluded);
else note('leather_crp',`Leather stains come out in the deep-clean at Clean, Restore & Protect (+${money(delta(2,lv))}).`);
}
}
}
if(a.odor==='odor')add('odor',WHY.odor);
if(a.odor==='smoke'){
add('odor',WHY.odor_smoke);
note('smoke',`Smoke odor: I confirm from photos. Heavy smoke damage may need a Disaster Detail (from ${money(M.specialty.disaster.from)}).`);
}
if(a.headliner==='yes')add('headliner',WHY.headliner);
if(a.seats==='alcantara')add('alcantara',WHY.alcantara);
if(a.seats==='suede')note('suede',STRINGS.suede); 
if(forcedExtraction)note('neglect_photos',STRINGS.neglectPhotos);
if(a.lived==='heavy')addHeavySoil(lv);
if(a.lived==='year'){
if(prot)addHeavySoil(2);
else if(level<2&&pt==='f'){
addHeavySoil(level);
note('year_resto',`A year or more without cleaning usually needs a Restoration Detail (${money(P.restoration(e,i))}) — I'll confirm from photos.`);
actions.push({key:'switch_restoration',label:'Switch to Restoration Detail',level:2});
}else if(level<2&&pt==='i'){
const xk=cloth?'shampoo_full':'shampoo_floor';
const crp=P.price('i',2,e,i)+P.addon(xk,e,i,2).price;
note('year_crp',`A year or more without cleaning usually needs Clean, Restore & Protect with extraction (${money(crp)}) — I'll confirm from photos.`);
}
}
}
function addHeavySoil(lv){
const h=P.heavySoil(lv,i);
items.push({key:'heavy_soil',label:LABEL.heavy_soil,short:SHORT.heavy_soil,qty:1,price:h.price,minutes:h.minutes,
why:WHY.heavy_soil,level:lv,source:'answer',opt:null});
}
const deferred=[]; 
if(hasE){
if(prot)note('coating',STRINGS.coating);
if(a.outside==='muddy'){
const mud=`Mud packed solid: +${money(M.modifiers.packed_mud.price)}, confirmed at the walkaround.`;
add('flush_trail',WHY.flush_trail);note('mud',mud);
}
if(a.outside==='neglect'&&!prot&&level<2)
note('neglect_outside',`Months without a wash usually need the clay treatment in Clean, Restore & Protect (+${money(delta(2,level))}).`);
const swap=P.pfPrice('reseal',e,i)-P.pfPrice('refresh',e,i);
if(a.outside==='neglect'&&kind==='pfull'&&a.water==='none')
note('pf_neglect',`Months without a wash usually need the full decon: upgrade the outside to Decon & Reseal for +${money(swap)}.`);
if(a.water!=='none'){
if(kind==='reseal')note('water_reseal',STRINGS.waterReseal+(a.water==='heavy'?' '+STRINGS.etched:''));
else{
add('water_'+a.water,WHY['water_'+a.water],{lv:elv}); 
if(kind==='refresh'||kind==='pfull'){
const wp=items[items.length-1].price;
note('water_swap',`Or upgrade the outside to Decon & Reseal: +${money(swap)}, and the ${money(wp)} spot removal comes off (net ${swap-wp<0?'−':'+'}${money(swap-wp)}).`);
}
}
}
const trimIn=elv!=null&&elv>=M.included.from_level.trim_restore;
if(a.trim==='heavy'){
if(trimIn){
const t=P.addon('trim_restore',e,i,elv);
items.push({key:'trim_restore',label:`${M.addons.trim_restore.label} (included)`,short:'Faded trim restored',qty:1,price:0,minutes:t.minutes,
why:STRINGS.trimIncludedLine,level:elv,source:'answer',opt:null,included:true,incl:1,inclName:'faded trim'});
}else add('trim_restore',WHY.trim_restore,{lv:elv});
}
if(a.trim==='some'){
if(trimIn)note('trim_included',STRINGS.trimIncluded);
else if(!prot)note('trim_crp',`Lightly faded trim is revived at Clean, Restore & Protect (+${money(delta(2,level))}).`);
}
const sp=a.special;
if(has(sp,'chrome_heavy'))addSpecial('chrome_heavy');else if(has(sp,'chrome_light'))addSpecial('chrome_trim');
if(has(sp,'soft_top'))addSpecial('soft_top');
if(has(sp,'carbon'))addSpecial('carbon');
if(has(sp,'single_stage'))note('single_stage',STRINGS.singleStage);
if(has(sp,'unsure'))note('special_unsure',STRINGS.specialUnsure);
const care=a.acc.filter(x=>has(ACC_CARE,x));
if(care.length){
const names=care.map(x=>ACC_NAME[x]);
const list=names.length>1?names.slice(0,-1).join(', ')+' and '+names[names.length-1]:names[0];
add('accessory',`${list.charAt(0).toUpperCase()+list.slice(1)}: cleaned and UV-protected in place.`,
{qty:care.length,label:care.length>1?`${LABEL.accessory} ×${care.length}`:`${LABEL.accessory} (${names[0]})`,
short:care.length>1?LABEL.accessory:`${LABEL.accessory} (${names[0]})`});
items[items.length-1].names=names;
}
if(has(a.acc,'bed'))add('truck_bed',WHY.truck_bed);
if(has(a.acc,'lifted'))add('lifted',WHY.lifted);
if(has(a.acc,'dually'))add('dually',WHY.dually);
if(has(a.acc,'lightbar'))
add('lightbar',WHY.lightbar,{opt:a.lightbar,label:`${M.addons.lightbar.label}: ${LIGHTBAR_NAME[a.lightbar]}`,short:`Light bar (${LIGHTBAR_NAME[a.lightbar]})`});
if(a.headlights==='hazy'||a.headlights==='yellow'){
const k=a.headlights==='hazy'?'hl_polish':'hl_restore';
add(k,WHY[k]);
note('lenses',`Large, luxury or complex lenses +${money(HL_LARGE_LENS)}, confirmed from your photo.`);
}
}
const v=c.v;
if((!hasE||a.headlights==='clear')&&v.year&&c.nowYear-Number(v.year)>=M.policy.headlight_age_years)
note('hl_age',`A ${v.year} is the age when headlights start to yellow — add restoration for ${money(M.addons.hl_polish.base)}–${M.addons.hl_restore.base} with this visit.`);
const wsIn=hasE&&!prot&&P.included(level,pt).ws_ceramic;
if(wsIn)note('ws_included',wsIncludedNote(M));
const chosen=c.a.extras;
const fromAnswers=items.slice();
const shampooAdded=fromAnswers.some(x=> /^shampoo_/.test(x.key));
const hlAdded=fromAnswers.some(x=>x.key==='hl_polish'||x.key==='hl_restore');
function offerExtras(routeNow){
const ex=deferred.slice();
const offer=(key,extra)=>{
const r=P.addon(key,e,i);
ex.push(Object.assign({key,label:M.addons[key].label,price:r.price,enabled:true,reason:null,checked:has(chosen,key)},extra||{}));
};
if(hasE)offer('flush_salt',c.winter?{label:`${M.addons.flush_salt.label} — ${SALT_SEASON_TAG}`}:null);
if(hasE&&hlAdded){offer('fog');offer('tail');}
if(hasE&&!Number(c.v.ev))offer('engine_bay');
if(hasI)offer('gloss_trim');
if(hasI&&a.odor==='smoke'&&a.headliner!=='yes')offer('headliner',{why:WHY.headliner_x}); 
if(hasI&&!shampooAdded&&routeNow!=='restoration'){
const lv2=ilv===2?2:null,cloth=a.seats==='cloth'||a.seats==='unsure';
const options=[['shampoo_seats','Seats'],['shampoo_floor','Carpets & mats'],['shampoo_full','Everything']]
.filter(([k])=>cloth||k==='shampoo_floor')
.map(([k,l])=>({key:k,label:l,price:P.addon(k,e,i,k==='shampoo_seats'?null:lv2).price,level:k==='shampoo_seats'?null:lv2}));
const sel=options.find(o=>has(chosen,o.key));
ex.push({key:'shampoo',label:'Shampoo & extraction',price:(sel||options[0]).price,enabled:true,reason:null,
checked:!!sel,selected:sel?sel.key:null,options});
}
if(hasI&&a.seats==='unsure')offer('alcantara');
if(hasE&&has(a.acc,'roof_box'))offer('restore_box');
if(hasE&&has(a.acc,'cap'))offer('restore_cap');
if(hasE&&isTruck(e)&&!has(a.acc,'bed')&&!has(a.acc,'tonneau')&&!has(a.acc,'cap'))offer('truck_bed');
return ex.filter((x,n)=>n<MAX_EXTRAS||x.checked).concat(hasE?glassExtras():[],hasE?specialExtras():[]);
}
function glassExtras(){
const out=[],allX=has(chosen,'all_glass_ceramic'),wsX=wsIn||(!allX&&has(chosen,'ws_ceramic'));
const glv=wsIn?2:null;
const offer=(key,extra)=>out.push(Object.assign({key,label:(glv&&M.addons[key].l2_label)||M.addons[key].label,price:P.addon(key,e,i,glv).price,
enabled:true,reason:null,checked:has(chosen,key),group:'glass',level:glv},extra||{}));
if(!wsIn)offer('ws_ceramic',allX?{enabled:false,checked:false,reason:STRINGS.glassIncluded}:null);
offer('all_glass_ceramic');
if(a.water==='heavy'&&(allX||wsX)){
const pk=allX?'glass_polish':'ws_polish',g=M.glass_wheels.items[pk];
out.push({key:pk,label:g.label,price:P.glassWheels(pk,e),enabled:true,reason:STRINGS.polishMaybe,checked:has(chosen,pk),
group:'glass',mayNeed:true});
}
return out;
}
function specialExtras(){
const sp=a.special,out=[],heavyAns=has(sp,'chrome_heavy'),lightAns=has(sp,'chrome_light');
const offer=(key,extra)=>{
const g=M.glass_wheels.items[key];
out.push(Object.assign({key,label:(g||M.addons[key]).label,price:g?P.glassWheels(key,e):P.addon(key,e,i).price,
enabled:true,reason:null,checked:has(chosen,key),group:'specialty'},extra||{}));
};
const heavyX=!heavyAns&&has(chosen,'chrome_heavy');
if(!heavyAns&&!lightAns)offer('chrome_trim',heavyX?{enabled:false,checked:false,reason:STRINGS.chromeIncluded}:null);
if(!heavyAns)offer('chrome_heavy');
if(c.sp.softTopOffered&&!has(sp,'soft_top'))offer('soft_top');
if(c.sp.carbonOffered&&!has(sp,'carbon'))offer('carbon');
return out;
}
let extras=offerExtras(route);
for(const x of extras){
if(!x.checked||!x.enabled)continue;
if(x.group==='specialty'){
if(x.key==='chrome_heavy'){const n=items.findIndex(y=>y.key==='chrome_trim');if(n>=0)items.splice(n,1);} 
addSpecial(x.key,'extra');
}else if(x.group==='glass'){
if(x.mayNeed)items.push({key:x.key,label:x.label,short:SHORT[x.key],qty:1,price:x.price,minutes:P.glassWheelsMinutes(x.key,e),
why:WHY.glass_polish_line,level:null,source:'extra',opt:null});
else add(x.key,WHY[x.key],{lv:x.level,source:'extra'});
}else if(x.key==='headliner')add('headliner',x.why,{source:'extra'});
else if(x.key==='shampoo'){
const o=x.options.find(y=>y.key===x.selected);
add(o.key,WHY.extra,{lv:o.level,source:'extra'});
}else add(x.key,WHY.extra,{lv:null,source:'extra',label:x.label});
}
if(wsIn||items.some(x=>x.key==='ws_ceramic'||x.key==='all_glass_ceramic')){
const wi=items.find(x=>x.key==='water_light'||x.key==='water_heavy'),wr=notes.find(n=>n.key==='water_reseal');
if(wi)wi.why=`${wi.why} ${WHY.coat_prep}`;
else if(wr)wr.text=`${wr.text} ${WHY.coat_prep}`;
else note('glass_prep',STRINGS.glassPrepWalk);
}
let restoReason=null;
if(pt==='f'&&!prot&&level===2){
const rp=P.restoration(e,i);
const std=base+items.filter(x=>RESTO_COVERED.has(x.key)).reduce((s,x)=>s+x.price,0);
if(a.lived==='year'||std>=rp){
restoReason=a.lived==='year'?"it hasn't been cleaned in a year or more"
:'it covers the extra interior work for no more than Clean, Restore & Protect plus add-ons';
for(let n=items.length-1;n>=0;n--)if(RESTO_COVERED.has(items[n].key))items.splice(n,1);
route='restoration';base=rp;bmin=P.restorationMinutes(e,i);baseLabel='Restoration Detail';
note('resto_includes',STRINGS.restoIncludes);
extras=offerExtras(route); 
}
}
applyAllowances(items,route==='protected'?P.included(2,pt,kind):P.included(level,pt),P,e,i);
const subtotal=base+items.reduce((s,x)=>s+x.price,0);
const adjustments=travelAdj(c);
if(c.where==='studio'){
const pct=Math.round(M.location.studio_discount*100);
adjustments.push({key:'studio',label:`Studio drop-off −${pct}%`,amount:-P.pyRound(subtotal*M.location.studio_discount)});
}
const total=subtotal+adjustments.reduce((s,x)=>s+x.amount,0);
const minutes=bmin+items.reduce((s,x)=>s+x.minutes,0);
if(c.winter&&hasE&&c.where!=='studio')note('w1',STRINGS.w1);
const longMin=M.policy.long_job_minutes,longH=String(Math.round(longMin / 6) / 10);
if(minutes>longMin||route==='restoration')
note('long_job',c.studio?`More than ${longH} hours of work: I'll book it as a studio day, or split it over two mobile visits if you'd rather.`
:`More than ${longH} hours of work: I'll split it over two visits on back-to-back days.`);
const why=lifted&&route==='standard'?lift:whyText(pt,level,explicit,reasons,route,kind,a,restoReason);
const levelLabel=route==='restoration'?'Restoration Detail':prot?M.protected[kind].label:LEVELS[level];
return{route,kind,track:c.track,pricingTrack:pt,level,explicit,levelLabel,baseLabel,why,typeLabel:P.types[e].label,
base,baseMinutes:bmin,items,subtotal,adjustments,total,minutes,hoursLabel:P.hoursLabel(minutes),
notes,extras,skipped:c.skipped.slice(),actions,where:c.where,interiorQuoted:c.quotedI,deposit:depositFor(total,M),
glassPrep:hasE?glassPrep(P,e,i,route==='protected'?null:level):null};
}
function applyAllowances(items,inc,P,e,i){
const free=(x,k)=>{
const n=x.qty||1;
k=Math.min(n,k);
if(k<=0)return 0;
const unit=x.price / n;
x.incl=k;x.price=unit*(n-k);
const base=x.label.replace(/ ×\d+$/,'');
if(k===n){
x.included=true;
x.label=n>1?`${base} ×${n} (included)`: /\)$/.test(base)?base.replace(/\)$/,', included)'):`${base} (included)`;
x.why=`${x.why?x.why+' ':''}${STRINGS.includedWhy}`;
}else x.label=`${base} ×${n} (${k} included)`;
x.short=`${String(x.short||base).replace(/ ×\d+$/,'')}${n>1?' ×'+n:''}${k===n?' (incl.)':` (${k} incl.)`}`;
const nm=x.key==='car_seat'?`${k} child seat${k>1?'s':''}`:x.key==='truck_bed'?'truck bed'
:x.names&&x.names.length===1?x.names[0]:`${k} gear item${k>1?'s':''}`;
x.inclName=nm;
return k;
};
const seat=items.find(x=>x.key==='car_seat');
if(seat&&inc.car_seat)free(seat,inc.car_seat);
let g=inc.gear||0;
const unit=x=>x.price / (x.qty||1);
items.filter(x=>has(P.model.included.allowance.gear_keys,x.key)).sort((x,y)=>unit(y)-unit(x)).forEach(x=>{if(g>0)g-=free(x,g);});
void e;void i;
}
function travelAdj(c){
const T=c.M.location.travel;
if(c.where==='ext')return[{key:'travel_ext',label:'Travel: Extended zone',amount:T.ext}];
if(c.where==='reg')return[{key:'travel_reg',label:'Travel: Regional zone',amount:T.reg}];
return[];
}
function quotedOnly(c,explicit,force,notes){
const level=force!=null?force:c.levelAns!=='auto'?c.levelAns:1;
return{route:'quoted',kind:null,track:c.track,pricingTrack:null,level,explicit,levelLabel:'Quoted from photos',typeLabel:c.P.types[c.e].label,
baseLabel:'Interior: quoted from photos',why:STRINGS.quotedInterior,base:0,baseMinutes:0,items:[],subtotal:0,
adjustments:travelAdj(c),total:0,minutes:0,hoursLabel:'',notes,extras:[],skipped:c.skipped.slice(),actions:[],
where:c.where,interiorQuoted:true,deposit:depositFor(0,c.M),glassPrep:null};
}
function depositFor(total,M){
const d=M.policy.deposit;
const amount=total>0?Math.max(d.min,pyRound(total*d.share / d.round_to)*d.round_to):null;
return{amount,share:d.share,min:d.min,noticeHours:d.notice_hours};
}
const WHY_LEVEL={
cp:{f:'a ceramic soap layer outside (1–3 months) and a steam-cleaned, UV-protected interior.',i:'steam-cleaned and UV-protected, with leather protected.',
e:'iron and tar removal plus a ceramic soap layer (1–3 months).'},
clean:{f:'Hand wash and spray wax outside, thorough vacuum and wipe-down inside.',i:'Thorough vacuum and wipe-down inside.',e:'Hand wash and spray wax outside.'},
crp:{f:'Hand-applied ceramic spray outside (6–12 months) plus a windshield ceramic coating, fully restored inside.',i:'Fully steamed, leather conditioned, fabric protected.',
e:'Clay, faded trim restored + hand-applied ceramic spray on paint and wheels (6–12 months) and a windshield ceramic coating.'},
};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
function whyText(pt,level,explicit,reasons,route,kind,a,restoReason){
if(route==='restoration')
return explicit?`Clean, Restore & Protect becomes a Restoration Detail because ${restoReason}.`:`Recommended because ${restoReason}.`;
if(route==='protected'){
const finish={ceramic:'ceramic coating',ppf:'paint protection film',wrap:'wrap or matte paint'}[a.protected];
if(kind==='refresh')return`Finish-safe hand wash and a topper matched to your ${finish}.`;
if(kind==='reseal')return a.outside==='neglect'?`Months without a wash need the full decon, then a fresh ceramic spray topper over your ${finish}.`
:`Full chemical decon and a fresh ceramic spray topper over your ${finish}.`;
return`Finish-safe Refresh Wash outside for your ${finish}, plus an Interior Clean, Restore & Protect.`;
}
if(level===0)return WHY_LEVEL.clean[pt];
if(level===1)return explicit?cap(WHY_LEVEL.cp[pt]):'Recommended: '+WHY_LEVEL.cp[pt];
if(!explicit&&reasons.length)return`Recommended because ${reasons.join(' and ')}.`;
return WHY_LEVEL.crp[pt];
}
function includedGain(lo,hi){
const out=[],incl=(r,k)=>r.items.filter(x=>x.key===k).reduce((n,x)=>n+(x.incl||0),0);
const seats=incl(hi,'car_seat')-incl(lo,'car_seat');
if(seats>0)out.push(seats===1?'child car seat':`${seats} child car seats`);
const acc=hi.items.find(x=>x.key==='accessory'),names=(acc&&acc.names)||[];
const gearNames=names.slice(incl(lo,'accessory'),incl(hi,'accessory'));
if(incl(hi,'truck_bed')>incl(lo,'truck_bed'))gearNames.push('truck bed');
if(gearNames.length)out.push(gearNames.length>1?gearNames.slice(0,-1).join(', ')+' and '+gearNames[gearNames.length-1]:gearNames[0]);
if(incl(hi,'trim_restore')>incl(lo,'trim_restore'))out.push('faded-trim restoration');
if(lo.items.some(x=>x.key==='ws_ceramic')&&!hi.items.some(x=>x.key==='ws_ceramic')&&hi.notes.some(n=>n.key==='ws_included'))out.push('windshield ceramic coating');
if(!out.length)return null;
return out.length>1?out.slice(0,-1).join(', ')+' and '+out[out.length-1]:out[0];
}
const cheaperText=(hiLabel,loLabel,diff,gain)=>
`${hiLabel} ${diff>0?`costs ${money(diff)} less than`:'costs the same as'} ${loLabel} for your answers`+(gain?`, because it includes your ${gain}.`:', because its own work covers your add-ons.');
function recommend(answers,vehicle,P,cfg){
const c=context(answers,vehicle,P,cfg);
let r=run(c,null);
if(c.levelAns==='auto'&&r.route==='standard'&&r.level===1){
const r2=run(c,2);
if(r2.route!=='protected'&&r2.total<=r.total)
r=run(c,null,'Recommended: '+cheaperText(LEVELS[2],LEVELS[1],r.total-r2.total,includedGain(r,r2)));
}
if(c.levelAns!=='auto'&&r.route==='standard'&&r.level<2){
const ups=[2,1].filter(l=>l>r.level).map(l=>run(c,l)).filter(x=>x.route!=='protected'&&x.total<=r.total);
const up=ups[0]; 
if(up){
const hl=up.route==='restoration'?'Restoration Detail':LEVELS[up.level];
r.notes.push({key:'cheaper_level',text:cheaperText(hl,LEVELS[r.level],r.total-up.total,includedGain(r,up)).replace(/^(.*?) costs/,'$1 costs')});
r.actions.push({key:'switch_level',label:`Switch to ${hl}`,level:up.level});
}
}
r.levels=[0,1,2].map(l=>{
const x=run(c,l);
return{level:l,label:x.levelLabel,total:x.total,route:x.route};
});
r.quoteId=quoteId(vehicle,answers);
return r;
}
const B32='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function canon(vehicle,answers){
const v=vehicle||{};
const veh={};
['make','model','year','variant','type','itype','freeText'].forEach(k=>{if(v[k]!=null&&v[k]!=='')veh[k]=v[k];});
const a=answers||{},ans={};
Object.keys(a).sort().forEach(k=>{
let x=a[k];
if(x==null||x===''||typeof x==='function')return;
if(Array.isArray(x))x=x.map(String).sort();
else if(k==='car_seats'||k==='level')x=String(x);
ans[k]=x;
});
return JSON.stringify([veh,ans]);
}
function hashId(s){
let h=0x811c9dc5;
for(let n=0;n<s.length;n++){h^=s.charCodeAt(n);h=Math.imul(h,0x01000193)>>>0;}
const x=((h>>>20)^h)&0xfffff;
let id='';
for(let k=3;k>=0;k--)id+=B32[(x>>>(5*k))&31];
return id;
}
const quoteId=(vehicle,answers)=>hashId(canon(vehicle,answers));
const tripId=entries=>(entries.length===1?quoteId(entries[0].vehicle,entries[0].answers)
:hashId(entries.map(x=>canon(x.vehicle,x.answers)).join('|')));
function vehicleName(v){
if(!v)return'My vehicle';
if(v.name)return v.name;
const n=[v.year,v.make,v.model,v.variant].filter(x=>x!=null&&x!=='').join(' ');
return n||v.freeText||'My vehicle';
}
const smsName=v=>(v&&v.manual&&!v.name?(v.freeText?v.freeText:'Picked by type'):vehicleName(v));
const typeShort=(r,v)=>String(r.typeLabel||(v&&v.typeLabel)||'').replace(/\s*\([^)]*\)\s*$/,'');
function whereText(r,trip){
const adj=(r.adjustments||[]).find(x=>(r.where==='studio'?x.key==='studio': /^travel_/.test(x.key)));
const once=trip?', once for the trip':'';
if(r.where==='studio'){
const pct=adj?adj.label.replace(/^Studio drop-off\s*/,''):'';
return!adj?'Where: studio drop-off':trip?`Where: studio drop-off (${pct} on each vehicle)`:`Where: studio drop-off (${pct}: −${money(adj.amount)})`;
}
if(r.where==='ext')return`Where: mobile, Extended zone (+${money(adj?adj.amount:0)}${once})`;
if(r.where==='reg')return`Where: mobile, Regional zone (+${money(adj?adj.amount:0)}${once})`;
return'Where: mobile, core valley (no travel fee)';
}
const depositLine=d=>(d&&d.amount?`Deposit ${money(d.amount)} holds the date`:null);
const hrsShort=h=>String(h||'').replace(/hours$/,'hrs').replace(/hour$/,'hr');
function fitSms(t){
if(t.length<=SMS_MAX)return t;
const a=cp(t);
while(a.join('').length>SMS_MAX)a.pop();
return a.join('');
}
const clip=(s,max)=>{const a=cp(s);return max&&a.length>max?a.slice(0,max-1).join('')+'…':s;};
function includedLine(r){
const l=(r.items||[]).filter(x=>x.included).map(x=>x.inclName||x.short||x.label);
return l.length?`Included: ${l.join(', ')}`:null;
}
function specLinesOf(r){
const nk=(r.notes||[]).map(n=>n.key),out=[];
const spot=[has(nk,'suede')&&'suede/nubuck/aniline seats',has(nk,'single_stage')&&'single-stage paint'].filter(Boolean);
if(spot.length)out.push(`Test spot first: ${spot.join(', ')}`);
if(has(nk,'special_unsure'))out.push('Check specialty surfaces at the walkaround');
return out;
}
function summaryText(result,vehicle,answers,cfg){
const r=result,v=vehicle||{};
void cfg; 
const id=r.quoteId||quoteId(vehicle,answers);
const typeLbl=typeShort(r,v);
const vname=smsName(v);
const head=`Hi Johnny, quote from your site (Q-${id}):`;
const riders=arr(answers&&answers.riders).filter(x=>RIDER_NAME[x]);
const ridersLine=r.track!=='e'&&riders.length?`Riders: ${riders.map(x=>RIDER_NAME[x]).join(', ')}`:null;
const whereLine=whereText(r);
const tail=r.route==='quoted'?['Estimate: interior quoted from photos','Day/time that works:']
:[`Estimate ${money(r.total)} before tax${r.interiorQuoted?' (exterior)':''} · ${hrsShort(r.hoursLabel)}`,depositLine(r.deposit),'Day/time that works:'].filter(Boolean);
const items=(r.items||[]).filter(x=>!x.included),inclLine=includedLine(r);
const specLines=specLinesOf(r);
const vl=typeLbl?`${vname} (${typeLbl})`:vname;
const build=(shown,vmax)=>{
const lines=[head,clip(vl,vmax)];
if(ridersLine)lines.push(ridersLine);
if(r.route==='quoted')lines.push('Interior: quoted from photos');
else{
lines.push(`${r.baseLabel}: ${money(r.base)}`);
items.slice(0,shown).forEach(x=>lines.push(`+ ${x.short||x.label}: ${money(x.price)}`));
const rest=items.slice(shown);
if(rest.length)lines.push(`+ ${rest.length} more ${rest.length===1?'extra':'extras'}: ${money(rest.reduce((s,x)=>s+x.price,0))}`);
if(inclLine)lines.push(inclLine);
if(r.interiorQuoted)lines.push('Interior: quoted from photos');
}
specLines.forEach(l=>lines.push(l));
lines.push(whereLine);
return lines.concat(tail).join('\n');
};
let shown=items.length>6?6:items.length,vmax=0,text=build(shown,vmax);
if(text.length>SMS_MAX&&cp(vl).length>60)text=build(shown,(vmax=60));
while(text.length>SMS_MAX&&shown>0)text=build(--shown,vmax);
if(text.length>SMS_MAX)text=build(0,40);
return fitSms(text);
}
const serviceLabel=r=>(r.route==='quoted'?'Interior quoted from photos':r.route==='standard'?`${TRACK_NAME[r.track]} ${r.levelLabel}`:r.levelLabel);
const travelOf=r=>(r.adjustments||[]).filter(x=> /^travel_/.test(x.key)).reduce((s,x)=>s+x.amount,0);
function tripTotals(results,M){
const rs=results||[],off=M.policy.multi_vehicle.additional_off;
const list=rs.map(r=>({name:r.name||'',total:Math.max(0,(r.total||0)-travelOf(r))}));
let full=0;
list.forEach((x,n)=>{if(x.total>list[full].total)full=n;});
const lines=list.map((x,n)=>({name:x.name,total:x.total,discount:list.length>1&&n!==full?pyRound(x.total*off):0}));
const subtotal=lines.reduce((s,x)=>s+x.total,0),discount=lines.reduce((s,x)=>s+x.discount,0);
const travel=rs.reduce((m,r)=>Math.max(m,travelOf(r)),0);
const total=subtotal-discount+travel;
return{lines,subtotal,discount,travel,total,deposit:depositFor(total,M),full:list.length?full:null,pct:off};
}
function tripText(entries,P,cfg){
const E=entries||[];
if(!E.length)return'';
if(E.length===1)return summaryText(E[0].result,E[0].vehicle,E[0].answers,cfg);
const T=tripTotals(E.map(x=>x.result),P.model),pct=Math.round(T.pct*100);
const wr=E.map(x=>x.result).find(r=>travelOf(r)===T.travel)||E[0].result;
const minutes=E.reduce((s,x)=>s+(x.result.minutes||0),0);
const head=`Hi Johnny, trip quote from your site (Q-${tripId(E)}), ${E.length} vehicles:`;
const quotedAny=E.some(x=>x.result.route==='quoted'||x.result.interiorQuoted);
const tail=[whereText(wr,true),`Trip estimate ${money(T.total)} before tax${quotedAny?' (priced parts)':''}${minutes?' · '+hrsShort(P.hoursLabel(minutes)):''}`,
depositLine(T.deposit),'Day/time that works:'].filter(Boolean);
const build=(lvl)=>{
const L=[head];
E.forEach((x,n)=>{
const r=x.result,v=x.vehicle||{},ln=T.lines[n],items=r.items||[];
const riders=arr(x.answers&&x.answers.riders).filter(k=>RIDER_NAME[k]);
const vn=clip(smsName(v),lvl>=3?26:lvl>=2?40:0),ty=typeShort(r,v);
const off=ln.discount?` (${pct}% off: −${money(ln.discount)})`:'';
const what=r.route==='quoted'?'Interior: quoted from photos'
:`${r.baseLabel}${items.length?lvl===0?' + '+items.map(y=>y.short||y.label).join(', '):` + ${items.length} ${items.length===1?'extra':'extras'}`:''}`+
`${r.interiorQuoted?', interior quoted':''}: ${money(ln.total)}${off}`;
if(lvl<=1){
L.push(`${n+1}) ${vn}${ty?` (${ty})`:''}${r.track!=='e'&&riders.length&&lvl===0?` · riders: ${riders.map(k=>RIDER_NAME[k]).join(', ')}`:''}`);
L.push(what);
if(lvl===0)specLinesOf(r).forEach(l=>L.push(l));
}else L.push(`${n+1}) ${vn}: ${what}`);
});
return L.concat(tail).join('\n');
};
let lvl=0,text=build(lvl);
while(text.length>SMS_MAX&&lvl<3)text=build(++lvl);
return fitSms(text);
}
function selectionOf(entries,T,now){
const first=entries[0].result;
return{v:2,quoteId:tripId(entries),
vehicles:entries.map((x,n)=>{
const r=x.result;
return{name:x.name||smsName(x.vehicle),typeLabel:(x.vehicle&&x.vehicle.typeLabel)||r.typeLabel,track:r.track,level:r.level,levelLabel:r.levelLabel,route:r.route,
label:serviceLabel(r),total:T.lines[n].total,discount:T.lines[n].discount,extras:(r.items||[]).length,interiorQuoted:!!r.interiorQuoted};
}),
subtotal:T.subtotal,multiDiscount:T.discount,multiPct:T.pct,travel:T.travel,total:T.total,
deposit:T.deposit.amount,depositPolicy:{share:T.deposit.share,min:T.deposit.min,noticeHours:T.deposit.noticeHours},
where:first.where,createdAt:now==null?null:now};
}
const tripSelection=(entries,P,now)=>selectionOf(entries,tripTotals(entries.map(x=>x.result),P.model),now);
function selectionFor(result,vehicle,answers,now){
const r=result,tr=travelOf(r),t=Math.max(0,r.total-tr);
return selectionOf([{result:r,vehicle,answers}],{lines:[{total:t,discount:0}],subtotal:t,discount:0,travel:tr,total:r.total,
deposit:r.deposit,pct:0},now);
}
const API={recommend,QUESTIONS,LEVELS,summaryText,quoteId,questionsFor,defaultAnswers,applyRiders,selectionFor,
specialty,STEPS,STRINGS,INTERIOR_KEYS,EXTERIOR_KEYS,HL_LARGE_LENS,
depositFor,tripTotals,tripText,tripSelection,tripId,serviceLabel};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else window.LumenBuilder=API;
})();
