(function(){
'use strict';
const LEVELS=['Refresh','Renew','Radiance'];
const LEVEL_DESC=['Clean','Clean & Protect','Clean, Restore & Protect'];
const LEVEL_FULL=LEVELS.slice();
const TRACK_NAME={f:'Full',i:'Interior',e:'Exterior'};
const TRUCKS=new Set(['midpickup','fullpickup','hdpickup']);
const ACC_CARE=['roof_box','rack','rtt','boards','tonneau','cap'];
const ACC_NAME={roof_box:'roof box',rack:'rack',rtt:'rooftop tent',boards:'running boards',tonneau:'tonneau cover',cap:'truck cap'};
const LIGHTBAR_NAME={pods:'pods (pair)',s:'bar up to 20"',m:'20–40" bar',l:'40"+ bar'};
const RIDER_NAME={kids:'kids',dogs:'dogs',pets:'other pets',adults:'mostly adults'};
const INTERIOR_KEYS=['riders','seats','car_seats','pets','stains','stain_where','odor','headliner','lived'];
const EXTERIOR_KEYS=['outside','water','headlights','protected','trim','special','acc','lightbar'];
const HL_LARGE_LENS=30;
const HL_MAX_COMPLEX=80;
const MAX_EXTRAS=8;
const SMS_MAX=600;
const LABEL={
pet_hair:'Heavy pet hair',pet_hair_light:'Light pet hair removal',car_seat:'Child car seat deep clean',heavy_soil:'Heavy soil, interior',
hl_polish:'Headlight restoration, Grade I (with a detail)',hl_restore:'Headlight restoration, Grade II (with a detail)',
hl_restore_max:'Headlight restoration, Grade III (with a detail)',
accessory:'Accessory care',radiance_plus_e:'Halo exterior spray coating',
leather_coat:'Leather coating',
};
const LABEL_HALO={radiance_plus_e:'Outside: spray coating, maker-rated up to 12–18 months',
fabric_coat:'Inside: fabric & Alcantara coating',leather_coat:'Inside: leather coating, maker-rated 12–18 months',
leather_fabric_coat:'Inside: leather + Alcantara/fabric (interiors with both)',
panel_coat:'Inside: interior panels — dash, door panels, console & trim, maker-rated 4–12 months'};
const HALO_IN=['fabric_coat','leather_coat','leather_fabric_coat'];
const SOFT_TOP_TYPES=['coupe','compact','midsuv'];
const OPEN_NAME= /convertible|cabrio|roadster|spyder|spider|volante|targa/i;
const SOFT_TOP_MODELS= /\b(wrangler|bronco(?! sport)|mx-5|miata|boxster|s2000|solstice|sky|z3|z4|mustang|camaro|corvette|911|beetle)\b/i;
const FABRIC_TOPS= /^(MINI (Cooper Convertible|Roadster)|Volkswagen Cabrio|Audi (A[34] )?Cabriolet|Saab (9-3|900) Convertible|Chrysler (PT Cruiser|LeBaron) Convertible|Dodge Shadow Convertible|Pontiac Sun(bird|fire) Convertible|Land Rover Range Rover Evoque Convertible|Nissan Murano CrossCabriolet)\b/;
const SHORT={
pet_hair:'Heavy pet hair',pet_hair_light:'Light pet hair',odor:'Ozone odor treatment',shampoo_seats:'Shampoo cloth seats',shampoo_floor:'Shampoo carpets & mats',
shampoo_full:'Full interior shampoo',alcantara:'Alcantara care',car_seat:'Child car seat',gloss_trim:'Gloss-black trim polish',
chrome_trim:'Chrome trim polish',chrome_heavy:'Heavy chrome polish',soft_top:'Soft top care',carbon:'Carbon fiber care',
heavy_soil:'Heavy soil, interior',water_light:'Water spots, light',water_heavy:'Water spots, heavy',trim_restore:'Trim restoration',
engine_bay:'Engine bay',ws_ceramic:'Windshield ceramic coating · multiple seasons',all_glass_ceramic:'All-glass ceramic coating · multiple seasons',
ws_ceramic_ml:'Windshield ceramic coating · up to 24 months / 20,000 miles',all_glass_ceramic_ml:'All-glass ceramic coating · up to 24 months / 20,000 miles',
wheel_quick:'Wheel faces ceramic coating · spray-on',wheel_ml:'Wheel faces ceramic coating · up to 18–24 months',trim_ml:'Trim ceramic coating · up to 24–36 months',tire_coat:'Ceramic tire coating',
fabric_coat:'Halo inside: fabric & Alcantara',leather_coat:'Halo inside: leather',leather_fabric_coat:'Halo inside: leather + fabric',panel_coat:'Halo inside: interior panels',radiance_plus_e:'Halo exterior',
hl_restore_max:'Headlight restoration, Grade III (with a detail)',
ws_polish:'Windshield polish',glass_polish:'All-glass polish',headliner:'Headliner cleaning',flush_salt:'Winter Salt Flush',flush_trail:'Trail Flush',
accessory:'Accessory care',restore_box:'Faded roof box restored',restore_cap:'Faded truck cap restored',truck_bed:'Truck bed',
hl_polish:'Headlight restoration, Grade I (with a detail)',hl_restore:'Headlight restoration, Grade II (with a detail)',fog:'Fog lights',tail:'Tail lights',emblem:'Emblem & badge polish',
lightbar:'Light bar / pods',lifted:'Lifted or oversized tires',dually:'Dually',
};
const WHY={
pet_hair:'Heavy hair in seams and carpet takes extra time to pull out.',
pet_hair_light:'A little hair on the seats and carpet, pulled out with rubber brushes and the vacuum.',
car_seat:'Shell, buckles and cover cleaned; you reinstall it.',
odor:'Ozone treatment after the clean, for lingering odors.',
odor_smoke:'Ozone treatment after the clean, for smoke odor.',
alcantara:'Dedicated low-moisture cleaner; nap brushed back up by hand.',
chrome_trim:'Hand-polished with a chrome-safe metal polish, then sealed so water spots wipe off.',
chrome_heavy:'Chrome-safe metal polish by hand, then sealed. Window trim and emblems included.',
emblem:'Faded or cloudy chrome and plastic emblems hand-polished and protected — front and rear badges.',
soft_top:'Dedicated soft-top cleaner and a soft brush at low pressure — never a pressure washer.',
carbon:'pH-neutral clean, then a protectant made for clear-coated carbon — no polish or abrasives.',
shampoo_full:'Shampoo & extraction of seats, carpets and mats.',
shampoo_floor:'Shampoo & extraction of the carpets and mats.',
shampoo_floor_l2:'Shampoo & extraction of the carpets (mats are already in this level).',
shampoo_seats:'Shampoo & extraction of cloth seats.',
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
hl_polish:'Headlight restoration, Grade I: a light-haze lens polish, at the with-a-detail price. 1-year clarity warranty.',
hl_restore:'Headlight restoration, Grade II: full restoration — sanded, polished and coated — at the with-a-detail price. 1-year clarity warranty.',
hl_restore_max:'Headlight restoration, Grade III: full restoration with a sprayed 2K urethane clear coat, the same kind of finish as the factory hardcoat. Garage required (it cures there); 3-year clarity warranty.',
radiance_plus_e:"A spray coating on the paint after the decon, maker-rated up to 12–18 months.",
panel_coat:'Dash, door panels, console and interior plastic & vinyl trim coated after the dressings come off: a natural matte finish, maker-rated 4–12 months. Screens, the steering wheel and pedals are left uncoated.',
leather_fabric_coat:'Leather coated on the leather, a fabric & Alcantara coating on the rest — for interiors with both. Needs dry fabric, so never the same day as shampoo or extraction.',
leather_coat:'Makers say it makes leather easier to clean and helps stop dye transfer from jeans, with UV protection; maker-rated 12–18 months. 6 hours before the seats are used.',
headliner:'Low-moisture cleaner and a soft brush across the whole headliner — too much water can loosen its glue.',
headliner_x:'Low-moisture clean of the whole headliner, for the smoke film that settles there.',
ws_ceramic:'Rain beads off the windshield; ice and bugs come off easier. Its maker backs it for multiple seasons.',
all_glass_ceramic:'Windshield, side & rear glass and mirrors (sunroof on request): rain beads off, ice and bugs come off easier. Its maker backs it for multiple seasons.',
ws_ceramic_ml:'A longer-rated glass coating: polished prep, layered, cured. Maker-rated up to 24 months or 20,000 miles.',
all_glass_ceramic_ml:'A longer-rated glass coating on the windshield, side & rear glass and mirrors; maker-rated up to 24 months or 20,000 miles.',
wheel_quick:'A spray-on ceramic coating on the four wheel faces: brake dust rinses off between washes. Its maker publishes no time rating.',
wheel_ml:'A wheel coating on the four wheel faces; maker-rated up to 18–24 months.',
trim_ml:'A trim coating on the black plastics; maker-rated up to 24–36 months.',
tire_coat:'Ceramic tire coating: a satin finish that outlasts dressings by washes, not years.',
fabric_coat:'Seats and carpets coated: makers say spills bead up and wipe away before they stain, with UV protection. Needs dry fabric, so never the same day as shampoo or extraction.',
glass_polish_line:'Etched spots polished off so the coating bonds to smooth glass — confirmed at the walkaround.',
coat_prep:'Doubles as prep for the glass coating.',
extra:'Added as an extra.',
};
const SALT_SEASON_TAG='best Nov–Mar';
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
opt('none','None'),opt('some','A little'),opt('heavy','A lot — the dog rides often')]},
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
help:'Same price at every level. Small pieces like a carbon mirror cap are included, so leave those unticked. Only the emblems faded? Add Emblem & badge polish under Add an extra.',
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
{key:'mix',step:'service',type:'toggle',legend:'Mix levels (inside and outside separately)',
help:'Pick a different level for the inside and the outside — you still get the Full discount.',options:[opt('no','No'),opt('yes','Yes')]},
{key:'level',step:'service',type:'single',legend:'Level',help:"Choose a level, or “Based on my answers” to match what you told me. I confirm it with you at the walkaround.",options:[
opt('auto','Based on my answers'),opt('0',LEVEL_FULL[0]),opt('1',LEVEL_FULL[1]),opt('2',LEVEL_FULL[2])]},
{key:'level_i',step:'service',type:'single',legend:'Inside',options:[
opt('auto','Based on my answers'),opt('0',LEVEL_FULL[0]),opt('1',LEVEL_FULL[1]),opt('2',LEVEL_FULL[2])]},
{key:'level_e',step:'service',type:'single',legend:'Outside',options:[
opt('auto','Based on my answers'),opt('0',LEVEL_FULL[0]),opt('1',LEVEL_FULL[1]),opt('2',LEVEL_FULL[2])]},
{key:'where',step:'service',type:'single',legend:'Where should I do it?',help:'Not sure of your zone? See <a href="#area">Service area</a>. Prefer drop-off? Choose mobile and mention it when you text — no travel fee.',options:[
opt('core','Mobile — core valley (no travel fee)'),opt('ext','Mobile — Extended zone',{fee:'ext'}),
opt('reg','Mobile — Regional zone',{fee:'reg'}),opt('studio','Studio drop-off',{pct:'studio_discount',studioOnly:true})]},
];
const STRINGS={
mold:'Mold, flood or rodents? Text photos — those start with an assessment.', 
quotedInterior:'Interior: quoted from photos (12–15-passenger and camper interiors vary too much to price online).',
w1:'November–March: the mobile exterior wash is rinseless (no hose rinse), with the same price and protection steps. Undercarriage flushes are available year-round.',
coating:"Coated by another shop? Tell me who installed it — some coating warranties also need the installer's annual inspection.",
neglectPhotos:'Long-neglected interiors are confirmed from photos.',
leatherIncluded:"Leather stains come out in this level's leather deep-clean.",
trimIncluded:'Faded trim is restored in this level — light or heavy.',
waterReseal:'Water spots come off in the Decon & Reseal step.',
etched:'Etched rings on the paint need machine polishing (paint correction: Grades I–II on-site; Grade III drop-off only, up to 2 days) — quoted.',
suede:'Genuine suede, nubuck or aniline leather: quoted after a test spot — water can mark these materials.',
singleStage:'Classic or single-stage paint: quoted after a test spot — I check how the paint reacts before any polish or protection goes on.',
specialUnsure:"I'll check for specialty surfaces at the walkaround and tell you before starting.",
chromeIncluded:'Included in heavy chrome polish',
emblemIncluded:'Included in chrome trim polish',
glassTitle:'Glass ceramic coating',
quickReplaced:'Replaced by the longer-rated coating', 
fabricWet:'Not the same day as shampoo or extraction: the fabric must be dry. Book it as a return visit.',
rplusTitle:'Halo (optional) — longer-lasting protection',
rplusSubE:'Outside: a spray coating, maker-rated up to 12–18 months.',
rplusSubI:'Inside: interior panels, a seat coating (fabric & Alcantara, leather, or leather + Alcantara/fabric), or both.', 
bestGuess:"Not sure you picked right? Book your best guess. At the walkaround — before I start — I'll take off anything you don't need, and nothing gets added without your OK.",
g3Time:'Allow up to 2 days',
g3Mobile:"Not with Grade III: it takes up to 2 days, so it's drop-off only.",
g3Note:"Grade III (two-step) can take up to 2 days, so it's drop-off only — allow up to 2 days. I'll confirm the drop-off details when you book.",
hlMax:'Headlight restoration, Grade III needs a garage I can work in: the 2K clear coat is sprayed and cures there. 3-year clarity warranty.',
glassIncluded:'Included in all-glass ceramic coating',
glassPrepWalk:"Glass coating prep: coatings bond to clean, smooth glass and seal in whatever is on it. I check for water spots and wiper haze at the walkaround and quote any removal before starting.",
polishMaybe:'Only if etched spots are still there after the chemical spot removal — I check at the walkaround and quote it before starting.',
cheaperCrp:`${LEVEL_FULL[2]} covers this work for no more than ${LEVEL_FULL[1]} plus add-ons`,
trimIncludedLine:'Faded trim restored — part of this level.',
includedWhy:'Part of this level\'s included extras.',
alcantaraHeadliner:'If your headliner is Alcantara, it gets the Alcantara method under the headliner line — you pay for it once.',
};
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
track:'f',level:'auto',mix:'no',level_i:'auto',level_e:'auto',where:'core',extras:[]};
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
const mixable=mixOffered(vehicle,a),mixOn=mixable&&a.mix==='yes';
if(q.key==='mix')visible=mixable;
if(q.key==='level')visible=!mixOn;
if(q.key==='level_i'||q.key==='level_e')visible=mixOn;
return Object.assign({},q,{options,visible});
});
}
function mixOffered(vehicle,a){
const v=vehicle||{};
return(a.track==null||a.track==='f')&&!(v.interiorQuoted||v.itype==='quote')&&(a.protected==null||a.protected==='no');
}
const levelOf=x=>(x==null||x===''||x==='auto'||!has([0,1,2],Number(x))?'auto':Number(x));
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
const mix=(a0.mix==='yes'||a0.mix===true)&&mixOffered(v,Object.assign({},a,{track}));
return{a,v,P,M,e,i,quotedI,track,levelAns,where,studio,month,nowYear,sp,
mix,levI:mix?levelOf(a0.level_i):'auto',levE:mix?levelOf(a0.level_e):'auto',
winter:has(M.policy.winter_months,month),skipped};
}
function run(c,force,lift){
const{a,P,M,e,i}=c;
const mixed=c.mix&&force==null;
const explicit=force!=null||(mixed?c.levI!=='auto'||c.levE!=='auto':c.levelAns!=='auto');
const pt=c.quotedI?(c.track==='i'?null:'e'):c.track;
const notes=[],items=[],actions=[];
const note=(key,text)=>{if(!notes.some(n=>n.key===key))notes.push({key,text});};
if(c.quotedI)note('quoted_interior',STRINGS.quotedInterior);
if(pt===null)return quotedOnly(c,explicit,force,notes);
const hasI=pt!=='e',hasE=pt!=='i';
const reasons=[],rI=[],rE=[];
if(hasI&&a.lived==='year')rI.push("it hasn't been cleaned in a year or more");
if(hasI&&a.stains==='lots'&&(a.seats==='leather'||a.seats==='alcantara'||a.seats==='suede')&&a.stain_where!=='carpet')
rI.push(a.seats==='alcantara'?'Alcantara stains need the deep-clean':'leather stains need the deep-clean');
if(hasE&&a.outside==='neglect')rE.push('months without a wash need a clay treatment');
const li=mixed?(c.levI!=='auto'?c.levI:rI.length?2:1):null;
const le=mixed?(c.levE!=='auto'?c.levE:rE.length?2:1):null;
if(mixed){if(c.levI==='auto')reasons.push(...rI);if(c.levE==='auto')reasons.push(...rE);}else reasons.push(...rI,...rE);
const lifted=!!(lift&&!mixed&&force==null&&c.levelAns==='auto'&&!reasons.length);
if(lifted)reasons.push(STRINGS.cheaperCrp);
const split=mixed&&le!==li;
const level=force!=null?force:mixed?(split?Math.max(le,li):le):c.levelAns!=='auto'?c.levelAns:reasons.length?2:1;
const prot=hasE&&a.protected!=='no';
let route=prot?'protected':'standard',kind=null,base,bmin,baseLabel,ilv,elv;
if(prot){
kind=pt==='f'?'pfull':level===2||a.outside==='neglect'?'reseal':'refresh';
base=P.pfPrice(kind,e,i);bmin=P.pfMinutes(kind,e,i);baseLabel=M.protected[kind].label;
ilv=kind==='pfull'?2:null; 
elv=null; 
}else if(split){
base=P.mixedPrice(le,li,e,i);bmin=P.mixedMinutes(le,li,e,i);baseLabel=`Full — ${mixLabel(le,li)}`;
ilv=li;elv=le;
}else{
base=P.price(pt,level,e,i);bmin=P.minutes(pt,level,e,i);baseLabel=`${TRACK_NAME[pt]} ${LEVEL_FULL[level]}`;
ilv=elv=level;
}
const delta=(to,from)=>P.price(pt,to,e,i)-P.price(pt,from,e,i);
const dI=(to,from)=>(mixed?P.mixedPrice(elv,to,e,i)-P.mixedPrice(elv,from,e,i):delta(to,from));
const dE=(to,from)=>(mixed?P.mixedPrice(to,ilv,e,i)-P.mixedPrice(from,ilv,e,i):delta(to,from));
const add=(key,why,o)=>{
o=o||{};
const qty=o.qty||1,lv=o.lv==null?null:o.lv;
const r=P.addon(key,e,i,lv,o.opt);
const d=M.addons[key]||M.modifiers[key]||{};
const l2=lv!=null&&d.l2_credit&&lv>=(d.glass_credit_from_level==null?2:d.glass_credit_from_level);
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
if(a.pets==='some')add('pet_hair_light',WHY.pet_hair_light); 
if(a.car_seats>0)add('car_seat',WHY.car_seat,{qty:a.car_seats});
let st=a.stains,w=a.stain_where;
const forcedExtraction=(pt==='i'||pt==='f')&&!prot&&a.lived==='year'&&lv===2;
if(forcedExtraction){st='lots';w='both';}
const cloth=a.seats==='cloth'||a.seats==='unsure';
if(st==='spots'){
if(lv===0&&w!=='carpet')note('spots_cp',`Spot treatment isn't part of ${LEVEL_FULL[0]}; it starts at ${LEVEL_FULL[1]}.`);
if(lv!==2&&w!=='seats')note('spots_carpet',`Carpet spot treatment is part of ${LEVEL_FULL[2]}.`);
}
if(st==='lots'){
const l2=lv===2?2:null;
if(w==='both'&&cloth)add('shampoo_full',WHY.shampoo_full,{lv:l2});
else{
if(w==='both'||w==='carpet')add('shampoo_floor',l2?WHY.shampoo_floor_l2:WHY.shampoo_floor,{lv:l2});
if(w==='seats'&&cloth)add('shampoo_seats',WHY.shampoo_seats);
if(w!=='carpet'&&!cloth){
if(lv===2)note('leather_included',STRINGS.leatherIncluded);
else note('leather_crp',`Leather stains come out in the deep-clean, which is part of ${LEVEL_FULL[2]}.`);
}
}
}
if(a.odor==='odor')add('odor',WHY.odor);
if(a.odor==='smoke'){
add('odor',WHY.odor_smoke);
note('smoke','Smoke odor: I confirm from photos. Heavy smoke damage is quoted after I see it.'); 
}
if(a.headliner==='yes')add('headliner',WHY.headliner);
if(a.seats==='alcantara')add('alcantara',WHY.alcantara);
if(a.seats==='alcantara'&&a.headliner==='yes')note('alcantara_headliner',STRINGS.alcantaraHeadliner);
if(a.seats==='suede')note('suede',STRINGS.suede); 
if(forcedExtraction)note('neglect_photos',STRINGS.neglectPhotos);
if(a.lived==='heavy')addHeavySoil(lv);
if(a.lived==='year'){
if(prot)addHeavySoil(2);
else if(lv<2&&pt==='f'){
addHeavySoil(lv);
note('neglect_photos',STRINGS.neglectPhotos);
}else if(level<2&&pt==='i'){
const xk=cloth?'shampoo_full':'shampoo_floor';
const crp=P.price('i',2,e,i)+P.addon(xk,e,i,2).price;
note('year_crp',`A year or more without cleaning usually needs ${LEVEL_FULL[2]} with extraction (${money(crp)}) — I'll confirm from photos.`);
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
if(a.outside==='neglect'&&!prot&&elv<2)
note('neglect_outside',`Months without a wash usually need the clay treatment, which is part of ${LEVEL_FULL[2]}. I'll confirm at the walkaround.`);
const swap=P.pfPrice('reseal',e,i)-P.pfPrice('refresh',e,i);
if(a.outside==='neglect'&&kind==='pfull'&&a.water==='none')
note('pf_neglect','Months without a wash usually need the full decon (Decon & Reseal). I\'ll confirm at the walkaround.');
if(a.water!=='none'){
if(kind==='reseal')note('water_reseal',STRINGS.waterReseal+(a.water==='heavy'?' '+STRINGS.etched:''));
else{
add('water_'+a.water,WHY['water_'+a.water],{lv:elv}); 
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
else if(!prot)note('trim_crp',`Lightly faded trim is revived at ${LEVEL_FULL[2]}.`);
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
const k=has(c.a.extras,'hl_restore_max')?'hl_restore_max':a.headlights==='hazy'?'hl_polish':'hl_restore';
add(k,WHY[k]);
if(k==='hl_restore_max'){
note('lenses',`Large lenses +${money(HL_LARGE_LENS)}, luxury or complex lenses up to +${money(HL_MAX_COMPLEX)} for Headlight restoration, Grade III, confirmed from your photo.`);
note('hl_max',STRINGS.hlMax);
}else note('lenses',`Large, luxury or complex lenses +${money(HL_LARGE_LENS)}, confirmed from your photo.`);
}
}
const v=c.v;
void v; 
const chosen=c.a.extras;
const fromAnswers=items.slice();
const shampooAdded=fromAnswers.some(x=> /^shampoo_/.test(x.key));
const hlAdded=fromAnswers.some(x=>x.key==='hl_polish'||x.key==='hl_restore'||x.key==='hl_restore_max');
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
if(hasI&&!shampooAdded){
const lv2=ilv===2?2:null,cloth=a.seats==='cloth'||a.seats==='unsure';
const options=[['shampoo_seats','Seats'],['shampoo_floor','Carpets & mats'],['shampoo_full','Everything']]
.filter(([k])=>cloth||k==='shampoo_floor')
.map(([k,l])=>({key:k,label:l,price:P.addon(k,e,i,k==='shampoo_seats'?null:lv2).price,level:k==='shampoo_seats'?null:lv2}));
const sel=options.find(o=>has(chosen,o.key));
ex.push({key:'shampoo',label:'Shampoo & extraction',price:(sel||options[0]).price,enabled:true,reason:null,
checked:!!sel,selected:sel?sel.key:null,options});
}
if(hasI&&a.seats==='unsure')offer('alcantara');
if(hasI&&prot)haloInOffers(routeNow).forEach(([k,x])=>offer(k,x));
if(hasE&&has(a.acc,'roof_box'))offer('restore_box');
if(hasE&&has(a.acc,'cap'))offer('restore_cap');
if(hasE&&isTruck(e)&&!has(a.acc,'bed')&&!has(a.acc,'tonneau')&&!has(a.acc,'cap'))offer('truck_bed');
return rplusExtras(routeNow).concat(hlExtras(),ex.filter((x,n)=>n<MAX_EXTRAS||x.checked),hasE?glassExtras():[],hasE?surfaceExtras():[],
hasE?specialExtras():[]);
}
function wetNow(routeNow){
void routeNow; 
return shampooAdded||['shampoo_seats','shampoo_floor','shampoo_full'].some(k=>has(chosen,k));
}
function rplusExtras(routeNow){
if(prot)return[];
const out=[],offer=(key,extra)=>out.push(Object.assign({key,label:LABEL_HALO[key],price:P.addon(key,e,i).price,enabled:true,reason:null,
checked:has(chosen,key),group:'rplus',level:null},extra||{}));
if(hasE)offer('radiance_plus_e');
if(hasI)haloInOffers(routeNow).forEach(([k,x])=>offer(k,x));
return out;
}
function haloInOffers(routeNow){
const pickIn=chosen.filter(k=>HALO_IN.includes(k)).pop()||null,wet=wetNow(routeNow),out=[];
const o=(k,wetOff)=>out.push([k,Object.assign({checked:pickIn===k},wetOff&&wet?{enabled:false,checked:false,reason:STRINGS.fabricWet}:{})]);
out.push(['panel_coat',{checked:has(chosen,'panel_coat')}]); 
o('fabric_coat',true);
if(a.seats==='leather'||a.seats==='unsure')o('leather_coat',false);
if(a.seats==='leather'||a.seats==='unsure'||a.seats==='alcantara')o('leather_fabric_coat',true);
return out;
}
function hlExtras(){
const cur=fromAnswers.find(x=>x.key==='hl_polish'||x.key==='hl_restore'||x.key==='hl_restore_max');
if(!cur)return[];
const from=P.addon(a.headlights==='hazy'?'hl_polish':'hl_restore',e,i).price,mx=P.addon('hl_restore_max',e,i).price;
return[{key:'hl_restore_max',label:'Headlight restoration, Grade III instead — sprayed 2K clear coat, 3-year clarity warranty (garage required)',
price:mx-from,enabled:true,reason:null,checked:cur.key==='hl_restore_max',group:'hl',level:null}];
}
function glassExtras(){
const out=[],allM=has(chosen,'all_glass_ceramic_ml'),allQ=!allM&&has(chosen,'all_glass_ceramic'),allX=allM||allQ;
const wsM=!allX&&has(chosen,'ws_ceramic_ml'),wsX=wsM||(!allX&&has(chosen,'ws_ceramic'));
const offer=(key,extra)=>out.push(Object.assign({key,label:M.addons[key].label,price:P.addon(key,e,i).price,
enabled:true,reason:null,checked:has(chosen,key),group:'glass',level:null},extra||{}));
const off=reason=>({enabled:false,checked:false,reason});
offer('ws_ceramic',allX?off(STRINGS.glassIncluded):wsM?off(STRINGS.quickReplaced):null);
offer('all_glass_ceramic',allM?off(STRINGS.quickReplaced):null);
offer('ws_ceramic_ml',allX?off(STRINGS.glassIncluded):null);
offer('all_glass_ceramic_ml');
if(a.water==='heavy'&&(allX||wsX)){
const pk=allX?'glass_polish':'ws_polish',g=M.glass_wheels.items[pk];
out.push({key:pk,label:g.label,price:P.glassWheels(pk,e),enabled:true,reason:STRINGS.polishMaybe,checked:has(chosen,pk),
group:'glass',mayNeed:true});
}
return out;
}
function surfaceExtras(){
const out=[],whM=has(chosen,'wheel_ml');
const offer=(key,extra)=>{
const g=M.glass_wheels.items[key];
out.push(Object.assign({key,label:(g||M.addons[key]).label,price:g?P.glassWheels(key,e):P.addon(key,e,i).price,
enabled:true,reason:null,checked:has(chosen,key),group:'surface',level:null},extra||{}));
};
offer('wheel_quick',whM?{enabled:false,checked:false,reason:STRINGS.quickReplaced}:null);
offer('wheel_ml');
offer('trim_ml');
offer('tire_coat');
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
const chromeX=heavyX||(!heavyAns&&!lightAns&&has(chosen,'chrome_trim'));
if(!heavyAns&&!lightAns)offer('emblem',chromeX?{enabled:false,checked:false,reason:STRINGS.emblemIncluded}:null);
if(!heavyAns&&!lightAns)offer('chrome_trim',heavyX?{enabled:false,checked:false,reason:STRINGS.chromeIncluded}:null);
if(!heavyAns)offer('chrome_heavy');
if(c.sp.softTopOffered&&!has(sp,'soft_top'))offer('soft_top');
if(c.sp.carbonOffered&&!has(sp,'carbon'))offer('carbon');
return out;
}
let extras=offerExtras(route);
for(const x of extras){
if(!x.checked||!x.enabled)continue;
if(x.group==='hl')continue; 
if(x.group==='rplus'){add(x.key,WHY[x.key],{lv:null,source:'extra',label:M.addons[x.key].label});continue;}
if(x.group==='specialty'){
if(x.key==='chrome_heavy'){const n=items.findIndex(y=>y.key==='chrome_trim');if(n>=0)items.splice(n,1);} 
addSpecial(x.key,'extra');
}else if(x.group==='glass'||x.group==='surface'){
if(x.mayNeed)items.push({key:x.key,label:x.label,short:SHORT[x.key],qty:1,price:x.price,minutes:P.glassWheelsMinutes(x.key,e),
why:WHY.glass_polish_line,level:null,source:'extra',opt:null});
else if(M.glass_wheels.items[x.key])items.push({key:x.key,label:x.label,short:SHORT[x.key]||x.label,qty:1,price:x.price,
minutes:P.glassWheelsMinutes(x.key,e),why:WHY[x.key]||WHY.extra,level:null,source:'extra',opt:null});
else add(x.key,WHY[x.key],{lv:x.level,source:'extra'});
}else if(x.key==='headliner')add('headliner',x.why,{source:'extra'});
else if(x.key==='shampoo'){
const o=x.options.find(y=>y.key===x.selected);
add(o.key,WHY.extra,{lv:o.level,source:'extra'});
}else add(x.key,WHY.extra,{lv:null,source:'extra',label:x.label});
}
if(items.some(x=> /^(ws_ceramic|all_glass_ceramic)(_ml)?$/.test(x.key))){
const wi=items.find(x=>x.key==='water_light'||x.key==='water_heavy'),wr=notes.find(n=>n.key==='water_reseal');
if(wi)wi.why=`${wi.why} ${WHY.coat_prep}`;
else if(wr)wr.text=`${wr.text} ${WHY.coat_prep}`;
else note('glass_prep',STRINGS.glassPrepWalk);
}
applyAllowances(items,route==='protected'?P.included(2,pt,kind):split?P.mixedIncluded(le,li):P.included(level,pt),P,e,i);
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
if(minutes>longMin)
note('long_job',c.studio?`More than ${longH} hours of work: I'll book it as a studio day, or split it over two mobile visits if you'd rather.`
:`More than ${longH} hours of work: I'll split it over two visits on back-to-back days.`);
const why=lifted&&route==='standard'?lift:split?mixWhy(le,li,explicit,reasons):whyText(pt,level,explicit,reasons,route,kind,a);
const levelLabel=prot?M.protected[kind].label:split?mixLabel(le,li):LEVEL_FULL[level];
const mix=mixed&&route!=='protected'?{e:le,i:li,split,saving:P.mixedSaving(le,li,e,i)}:null;
return{route,kind,track:c.track,pricingTrack:pt,level,explicit,levelLabel,baseLabel,why,typeLabel:P.types[e].label,mix,
base,baseMinutes:bmin,items,subtotal,adjustments,total,minutes,hoursLabel:P.hoursLabel(minutes),
notes,extras,skipped:c.skipped.slice(),actions,where:c.where,interiorQuoted:c.quotedI,deposit:depositFor(total,M),
glassPrep:hasE?glassPrep(P,e,i,route==='protected'?null:elv):null};
}
const mixLabel=(le,li)=>`Exterior: ${LEVELS[le]} · Interior: ${LEVELS[li]}`;
function applyAllowances(items,inc,P,e,i){
const AK=P.model.included.allowance.items;
const pool=items.filter(x=>AK[x.key]&&!x.included);
const got=P.allot(inc,pool.map(x=>[x.key,x.price / (x.qty||1),x.qty||1]));
const order=pool.filter(x=>got[x.key]).sort((x,y)=>y.price / (y.qty||1)-x.price / (x.qty||1));
let used=0;
order.forEach(x=>{
const n=x.qty||1,k=Math.min(n,got[x.key]);
got[x.key]-=k;
const unit=x.price / n,from=used+1,to=used+k,rng=from===to?`${from}`:`${from}–${to}`;
used=to;
x.incl=k;x.price=unit*(n-k);
const base=x.label.replace(/ ×\d+$/,'');
if(k===n){
x.included=true;
x.label=n>1?`${base} ×${n} (included ${rng} of ${inc.picks})`
: /\)$/.test(base)?base.replace(/\)$/,`, included ${rng} of ${inc.picks})`):`${base} (included ${rng} of ${inc.picks})`;
x.why=`${x.why?x.why+' ':''}${STRINGS.includedWhy}`;
}else x.label=`${base} ×${n} (${k} included: ${rng} of ${inc.picks})`;
x.short=`${String(x.short||base).replace(/ ×\d+$/,'')}${n>1?' ×'+n:''}${k===n?' (incl.)':` (${k} incl.)`}`;
x.inclName=x.key==='car_seat'?`${k} child seat${k>1?'s':''}`:x.key==='truck_bed'?'truck bed':x.key==='pet_hair_light'?'light pet hair'
:x.names&&x.names.length===1?x.names[0]:`${k} gear item${k>1?'s':''}`;
});
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
where:c.where,interiorQuoted:true,deposit:depositFor(0,c.M),glassPrep:null,mix:null};
}
function depositFor(total,M){
const d=M.policy.deposit;
const amount=total>0?Math.max(d.min,pyRound(total*d.share / d.round_to)*d.round_to):null;
return{amount,share:d.share,min:d.min,noticeHours:d.notice_hours};
}
const WHY_LEVEL={
cp:{f:'a ceramic soap wash outside (maker-rated up to 3 months) and a steam-cleaned, UV-protected interior.',i:'steam-cleaned and UV-protected, with leather protected.',
e:'iron and tar removal plus a ceramic soap wash (maker-rated up to 3 months).'},
clean:{f:'Wax soap hand wash outside, thorough vacuum and wipe-down inside.',i:'Thorough vacuum and wipe-down inside.',e:'Wax soap hand wash outside.'},
crp:{f:'Full decon and a hand-applied ceramic sealant outside (maker-rated up to 6 months), fully restored inside.',i:'Fully steamed, leather conditioned.',
e:'Full decon, clay, faded trim restored + a hand-applied ceramic sealant on paint and wheels (maker-rated up to 6 months).'},
};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const LVK=['clean','cp','crp'];
function mixWhy(le,li,explicit,reasons){
const side=(L,t)=>cap(WHY_LEVEL[LVK[L]][t]).replace(/ (inside|outside)\.$/,'.');
void explicit;
return`${reasons.length?`Based on your answers: ${reasons.join(' and ')}. `:''}Outside, ${LEVEL_FULL[le]}: ${side(le,'e')} Inside, ${LEVEL_FULL[li]}: ${side(li,'i')}`;
}
function whyText(pt,level,explicit,reasons,route,kind,a){
if(route==='protected'){
const finish={ceramic:'ceramic coating',ppf:'paint protection film',wrap:'wrap or matte paint'}[a.protected];
if(kind==='refresh')return a.protected==='ceramic'?'Finish-safe hand wash, then a ceramic topper (included) that refreshes the slickness and beading and takes the wear instead of the coating.':`Finish-safe hand wash and a topper matched to your ${finish}.`;
if(kind==='reseal')return a.outside==='neglect'?`Months without a wash need the full decon, then a fresh ceramic sealant topper over your ${finish}.`
:`Full chemical decon and a fresh ceramic sealant topper over your ${finish}.`;
return`Finish-safe Refresh Wash outside for your ${finish}, plus an Interior ${LEVEL_FULL[2]}.`;
}
if(level===0)return WHY_LEVEL.clean[pt];
if(level===1)return explicit?cap(WHY_LEVEL.cp[pt]):'Based on your answers: '+WHY_LEVEL.cp[pt];
if(!explicit&&reasons.length)return`Based on your answers: ${reasons.join(' and ')}.`;
return WHY_LEVEL.crp[pt];
}
function includedGain(lo,hi){
const out=[],incl=(r,k)=>r.items.filter(x=>x.key===k).reduce((n,x)=>n+(x.incl||0),0);
if(incl(hi,'pet_hair_light')>incl(lo,'pet_hair_light'))out.push('light pet hair');
const seats=incl(hi,'car_seat')-incl(lo,'car_seat');
if(seats>0)out.push(seats===1?'child car seat':`${seats} child car seats`);
const acc=hi.items.find(x=>x.key==='accessory'),names=(acc&&acc.names)||[];
const gearNames=names.slice(incl(lo,'accessory'),incl(hi,'accessory'));
if(incl(hi,'truck_bed')>incl(lo,'truck_bed'))gearNames.push('truck bed');
if(gearNames.length)out.push(gearNames.length>1?gearNames.slice(0,-1).join(', ')+' and '+gearNames[gearNames.length-1]:gearNames[0]);
if(incl(hi,'trim_restore')>incl(lo,'trim_restore'))out.push('faded-trim restoration');
if(!out.length)return null;
return out.length>1?out.slice(0,-1).join(', ')+' and '+out[out.length-1]:out[0];
}
const pricedAs=(hiLabel,loLabel,gain)=>
`priced as ${hiLabel}, which ${gain?`includes your ${gain}`:'covers that work'}, so it costs no more than ${loLabel} with those add-ons.`;
function recommend(answers,vehicle,P,cfg){
const c=context(answers,vehicle,P,cfg);
let r=run(c,null);
if(!r.mix&&c.levelAns==='auto'&&r.route==='standard'&&r.level===1){
const r2=run(c,2);
if(r2.route!=='protected'&&r2.subtotal<=r.subtotal)
r=run(c,null,'Based on your answers: '+pricedAs(LEVEL_FULL[2],LEVEL_FULL[1],includedGain(r,r2)));
}
r.levels=[0,1,2].map(l=>{
const x=run(c,l);
return{level:l,label:x.levelLabel,total:x.total,route:x.route};
});
if(r.mix){
const at=o=>{const x=run(Object.assign({},c,o),null);return x.total;};
r.mixOptions={
i:['auto',0,1,2].map(l=>({value:String(l),total:at({levI:l,levE:r.mix.e})})),
e:['auto',0,1,2].map(l=>({value:String(l),total:at({levE:l,levI:r.mix.i})})),
};
r.mixOptions.i[0].level=run(Object.assign({},c,{levI:'auto',levE:r.mix.e}),null).mix.i;
r.mixOptions.e[0].level=run(Object.assign({},c,{levE:'auto',levI:r.mix.i}),null).mix.e;
}
const tn=r.notes.find(n=>n.key==='trim_crp'),l2=r.levels[2];
if(tn&&!(l2.route==='standard'&&l2.total>r.total))r.notes.splice(r.notes.indexOf(tn),1); 
r.quoteId=quoteId(vehicle,answers);
return r;
}
const B32='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function canon(vehicle,answers){
const v=vehicle||{};
const veh={};
['make','model','year','variant','type','itype','freeText'].forEach(k=>{if(v[k]!=null&&v[k]!=='')veh[k]=v[k];});
const a=answers||{},ans={};
const mixing=a.mix==='yes'||a.mix===true;
Object.keys(a).sort().forEach(k=>{
let x=a[k];
if((k==='mix'||k==='level_i'||k==='level_e')&&!mixing)return; 
if(k==='level'&&mixing)return;
if(x==null||x===''||typeof x==='function')return;
if(Array.isArray(x))x=x.map(String).sort();
else if(k==='car_seats'||k==='level'||k==='level_i'||k==='level_e')x=String(x);
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
lines.push(r.mix&&r.mix.split?`${r.baseLabel} · ${money(r.base)}`:`${r.baseLabel}: ${money(r.base)}`);
if(r.mix&&r.route==='standard'&&r.mix.saving>0)lines.push(`Saves ${money(r.mix.saving)} vs booking separately`); 
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
const serviceLabel=r=>(r.route==='quoted'?'Interior quoted from photos':r.mix&&r.mix.split?`Full — ${r.levelLabel}`
:r.route==='standard'?`${TRACK_NAME[r.track]} ${r.levelLabel}`:r.levelLabel);
const travelOf=r=>(r.adjustments||[]).filter(x=> /^travel_/.test(x.key)).reduce((s,x)=>s+x.amount,0);
function tripTotals(results,M){
const rs=results||[],off=M.policy.multi_vehicle.additional_off;
const list=rs.map(r=>({name:r.name||'',total:Math.max(0,(r.total||0)-travelOf(r))}));
let full=0;
list.forEach((x,n)=>{if(x.total>list[full].total)full=n;});
const lines=list.map((x,n)=>({name:x.name,total:x.total,discount:list.length>1&&n!==full?pyRound(x.total*off):0}));
const subtotal=lines.reduce((s,x)=>s+x.total,0),discount=lines.reduce((s,x)=>s+x.discount,0);
const travel=rs.reduce((m,r)=>Math.max(m,travelOf(r)),0);
const total=subtotal>0?subtotal-discount+travel:0;
return{lines,subtotal,discount,travel,total,deposit:depositFor(total,M),full:list.length?full:null,pct:off};
}
const tripLong=(minutes,P)=>(minutes>P.model.policy.long_job_minutes
?`${cap(hrsShort(P.hoursLabel(minutes)))} in all — I'll book it over back-to-back days`:null);
function tripText(entries,P,cfg){
const E=entries||[];
if(!E.length)return'';
if(E.length===1)return summaryText(E[0].result,E[0].vehicle,E[0].answers,cfg);
const T=tripTotals(E.map(x=>x.result),P.model),pct=Math.round(T.pct*100);
const wr=E.map(x=>x.result).find(r=>travelOf(r)===T.travel)||E[0].result;
const minutes=E.reduce((s,x)=>s+(x.result.minutes||0),0);
const head=`Hi Johnny, trip quote from your site (Q-${tripId(E)}), ${E.length} vehicles:`;
const quotedAny=E.some(x=>x.result.route==='quoted'||x.result.interiorQuoted);
const est=T.total?`Trip estimate ${money(T.total)} before tax${quotedAny?' (priced parts)':''}${minutes?' · '+hrsShort(P.hoursLabel(minutes)):''}`
:'Trip estimate: quoted from photos';
const tailTxt=[whereText(wr,true),est,T.total?tripLong(minutes,P):null,depositLine(T.deposit),'Day/time that works:'].filter(Boolean).join('\n');
const net=n=>T.lines[n].total-T.lines[n].discount;
const lines=(lvl,k)=>{
const L=[];
E.forEach((x,n)=>{
if(lvl>=4&&n>=k)return;
const r=x.result,v=x.vehicle||{},ln=T.lines[n],items=r.items||[];
const riders=arr(x.answers&&x.answers.riders).filter(q=>RIDER_NAME[q]);
const vn=clip(smsName(v),lvl>=3?26:lvl>=2?40:0),ty=typeShort(r,v);
const off=ln.discount?` (${pct}% off: −${money(ln.discount)})`:'';
if(lvl>=4){L.push(`${n+1}) ${vn}: ${r.route==='quoted'?'quoted from photos':money(ln.total)+(ln.discount?` −${money(ln.discount)}`:'')}`);return;}
const what=r.route==='quoted'?'Interior: quoted from photos'
:`${r.baseLabel}${items.length?lvl===0?' + '+items.map(y=>y.short||y.label).join(', '):` + ${items.length} ${items.length===1?'extra':'extras'}`:''}`+
`${r.interiorQuoted?', interior quoted':''}: ${money(ln.total)}${off}`;
if(lvl<=1){
L.push(`${n+1}) ${vn}${ty?` (${ty})`:''}${r.track!=='e'&&riders.length&&lvl===0?` · riders: ${riders.map(q=>RIDER_NAME[q]).join(', ')}`:''}`);
L.push(what);
if(lvl===0)specLinesOf(r).forEach(l=>L.push(l));
}else L.push(`${n+1}) ${vn}: ${what}`);
});
if(lvl>=4&&k<E.length){
const rest=E.length-k,sum=E.slice(k).reduce((s,x,n)=>s+net(k+n),0);
L.push(`+ ${rest} more vehicle${rest>1?'s':''}: ${money(sum)}`);
}
return L;
};
const build=(lvl,k)=>[head].concat(lines(lvl,k),[tailTxt]).join('\n');
let lvl=0,k=E.length,text=build(lvl,k);
while(text.length>SMS_MAX&&lvl<4)text=build(++lvl,k);
while(text.length>SMS_MAX&&k>0)text=build(lvl,--k);
return fitSms(text);
}
function selectionOf(entries,T,now){
const first=entries[0].result;
return{v:2,quoteId:tripId(entries),
vehicles:entries.map((x,n)=>{
const r=x.result;
return{name:x.name||smsName(x.vehicle),typeLabel:(x.vehicle&&x.vehicle.typeLabel)||r.typeLabel,track:r.track,level:r.level,levelLabel:r.levelLabel,route:r.route,
label:serviceLabel(r),total:T.lines[n].total,discount:T.lines[n].discount,extras:(r.items||[]).length,interiorQuoted:!!r.interiorQuoted,
levels:r.mix?{e:r.mix.e,i:r.mix.i,e_label:LEVELS[r.mix.e],i_label:LEVELS[r.mix.i],saving:r.mix.saving}:null};
}),
subtotal:T.subtotal,multiDiscount:T.discount,multiPct:T.pct,travel:T.travel,total:T.total,
deposit:T.deposit.amount,depositPolicy:{share:T.deposit.share,min:T.deposit.min,noticeHours:T.deposit.noticeHours},
where:first.where,createdAt:now==null?null:now};
}
const tripSelection=(entries,P,now)=>selectionOf(entries,tripTotals(entries.map(x=>x.result),P.model),now);
function withCards(sel,cards,M){
if(!sel||!Array.isArray(sel.vehicles))return sel;
cards=Array.isArray(cards)?cards:[];
if(!cards.length&&!sel.vehicles.some(x=>x&&x.card))return sel;
const off=M.policy.multi_vehicle.additional_off;
const list=sel.vehicles.filter(x=>!x.card).concat(cards.map(x=>Object.assign({},x,{card:true})));
let full=0;
list.forEach((x,n)=>{if((x.total||0)>(list[full].total||0))full=n;});
const vehicles=list.map((x,n)=>Object.assign({},x,{discount:list.length>1&&n!==full?pyRound((x.total||0)*off):0}));
const subtotal=vehicles.reduce((s,x)=>s+(x.total||0),0),discount=vehicles.reduce((s,x)=>s+x.discount,0);
const travel=sel.travel||0,total=subtotal>0?subtotal-discount+travel:0,d=depositFor(total,M);
const out=Object.assign({},sel,{vehicles,subtotal,multiDiscount:discount,multiPct:vehicles.length>1?off:0,travel,total,deposit:d.amount,
depositPolicy:{share:d.share,min:d.min,noticeHours:d.noticeHours},label:vehicles.length>1?`${vehicles.length} vehicles`:vehicles[0].label});
const bt=sel.builderText||sel.text;
delete out.text;delete out.builderText;
if(bt)out[cards.length?'builderText':'text']=bt;
return out;
}
function selectionFor(result,vehicle,answers,now){
const r=result,tr=travelOf(r),t=Math.max(0,r.total-tr);
return selectionOf([{result:r,vehicle,answers}],{lines:[{total:t,discount:0}],subtotal:t,discount:0,travel:tr,total:r.total,
deposit:r.deposit,pct:0},now);
}
const ADV=(key,type,legend,options,extra)=>Object.assign({key,type,legend,options},extra||{});
const ADVISOR=[
ADV('finish','single','What finish is on the car?',[opt('gloss','Gloss paint'),opt('matte','Matte or satin paint'),opt('vinyl','Vinyl wrap'),
opt('ppf','Paint protection film (PPF)')]),
ADV('years','single','How long do you want it protected?',[opt('1','About a year — leasing or selling soon'),opt('3','2–3 years'),
opt('5','4–5 years or more')]),
ADV('use','multi','How is it driven and kept?',[opt('daily','Daily commuter'),opt('salt','Winter salt roads'),opt('offroad','Off-road or trails'),
opt('work','Worksite or job truck'),opt('garage','Garage-kept')],{help:'Choose all that fit.'}),
ADV('look','single','What matters most?',[opt('beading','Extreme water beading'),opt('gloss','Deep, wet gloss'),opt('easy','Easiest to wash'),
opt('any','No strong preference')]),
ADV('paint','single','How does the paint look today?',[opt('great','Looks great'),opt('light','Light swirls'),opt('heavy','Heavy swirls or scratches')],
{help:'Look in direct sun or under a flashlight. Every panel is paint-gauged before I polish.'}),
ADV('glass','single','Glass',[opt('none','No glass coating'),opt('ws','Windshield'),opt('all','All glass')]),
ADV('wheels','single','Wheels',[opt('none','No wheel coating'),opt('faces','Wheel faces'),opt('off','Faces + barrels (wheels off)')]),
ADV('more','multi','Also coat',[opt('trim','Black trim'),opt('tires','Tires'),opt('calipers','Brake calipers')]),
ADV('interior','multi','Interior coatings (Halo inside)',[opt('leather','Leather'),opt('fabric','Fabric & Alcantara')]),
];
const ADV_VALUES={finish:['gloss','matte','vinyl','ppf'],years:['1','3','5'],use:['daily','salt','offroad','work','garage'],
look:['beading','gloss','easy','any'],paint:['great','light','heavy'],glass:['none','ws','all'],wheels:['none','faces','off'],
more:['trim','tires','calipers'],interior:['leather','fabric'],level:['auto','rplus','essential','signature','reserve','film'],
grade:['auto','none','g1','g2','g3'],prepay:['no','yes'],flush:['no','yes'],garage:['','yes','no','unsure']};
const advisorDefaults=()=>({finish:'gloss',years:'3',use:[],look:'any',paint:'light',glass:'none',wheels:'none',more:[],interior:[],
level:'auto',grade:'auto',prepay:'no',flush:'no',garage:''});
const HARSH={salt:'winter salt',offroad:'trails',work:'job sites'};
const EURO= /^(Alfa Romeo|Aston Martin|Audi|Bentley|BMW|Ferrari|Jaguar|Lamborghini|Land Rover|Lotus|Maserati|McLaren|Mercedes|MINI|Mini|Polestar|Porsche|Rolls-Royce|Volkswagen|Volvo)\b/;
const FIN_NAME={gloss:'Gloss paint',matte:'Matte/satin',vinyl:'Vinyl wrap',ppf:'PPF'};
const YRS_NAME={1:'~1 year',3:'2–3 years',5:'4–5+ years'};
const LOOK_NAME={beading:'max beading',gloss:'wet gloss',easy:'easy washing'};
const PAINT_NAME={great:'paint looks great',light:'light swirls',heavy:'heavy swirls'};
function advisorAnswers(ans){
const a0=ans||{},d=advisorDefaults(),a={};
Object.keys(d).forEach(k=>{
const ok=ADV_VALUES[k];
if(Array.isArray(d[k]))a[k]=arr(a0[k]).map(String).filter((x,n,l)=>has(ok,x)&&l.indexOf(x)===n);
else a[k]=a0[k]!=null&&has(ok,String(a0[k]))?String(a0[k]):d[k];
});
return a;
}
function coatingPlan(ans,vehicle,P){
const M=P.model,a=advisorAnswers(ans),v=vehicle||{},C=M.coatings.tiers;
const e=v.type&&P.types[v.type]&&!P.types[v.type].interior_only?v.type:'sedan';
const i=v.itype&&v.itype!=='quote'&&P.types[v.itype]?v.itype:e;
const gloss=a.finish==='gloss',harsh=a.use.filter(x=>HARSH[x]),garageKept=has(a.use,'garage');
let rec;
if(!gloss)rec='film';
else if(a.years==='1')rec='rplus';
else if(a.years==='5'||harsh.length)rec='reserve';
else rec=a.look==='gloss'||garageKept?'signature':'essential';
const recGrade=gloss?{great:'g1',light:'g2',heavy:'g3'}[a.paint]:null;
const allowed=gloss?['rplus','essential','signature','reserve']:['film'];
const level=a.level!=='auto'&&has(allowed,a.level)?a.level:rec;
const coat=level!=='rplus';
let grade=null;
if(gloss){
if(a.grade==='none')grade=coat?recGrade:null;
else if(a.grade!=='auto')grade=a.grade;
else grade=coat?recGrade:null;
}
const why=[],notes=[],suggest=[],lines=[];
const tierPrice=k=>P.coating(k,e);
const line=(key,label,price,o)=>lines.push(Object.assign({key,label,price},o||{}));
if(level==='rplus'){
line('base',`Exterior ${LEVEL_FULL[2]}`,P.price('e',2,e),{short:'Exterior Radiance'});
line('radiance_plus_e',LABEL.radiance_plus_e,P.addon('radiance_plus_e',e,i).price,{short:'Halo exterior'});
}else{
const t=C[level];
const nm= /coating$/.test(t.label)?t.label:`${t.label} coating`;
line('coat:'+level,`${nm} — ${/^up to/.test(t.rating)?'maker-rated '+t.rating:t.rating}`,tierPrice(level),{from:!!t.from,short:nm});
}
if(grade)line(grade,`Paint correction ${M.correction[grade].label}`,P.correction(grade,e),{from:true,short:`${M.correction[grade].short} correction`});
if(gloss)why.push(level==='rplus'?`Gloss paint: an Exterior ${LEVEL_FULL[2]} (decon, clay, trim restored), then the Halo spray coating by hand.`:'Gloss paint: polished first — a coating locks in whatever is under it — then coated.');
else why.push({matte:'Matte or satin paint: no polishing (it would add shine); a matte-safe coating.',
vinyl:'Vinyl wrap: no polishing; a film-safe coating (a matte-safe one on matte or satin wrap).',
ppf:'PPF: no polishing; a film-safe coating over the film.'}[a.finish]+' Decon wash included.');
if(a.years==='1')why.push(gloss?"About a year: a multi-year coating won't pay for itself — Halo (a spray coating, maker-rated up to 12–18 months) covers the time you'll own it."
:'About a year: the film coating is still the only coating I put on these finishes; between visits, the Refresh Wash keeps it finish-safe.');
if(!gloss&&a.years!=='1')why.push(`${YRS_NAME[a.years]}: film coatings are rated by their makers at about two years (up to 24 months to two years); the Decon & Reseal tops them up.`);
if(gloss&&a.years==='3')why.push('2–3 years: Essential (maker-rated up to 24 months) or Signature (maker-rated up to 36 months).');
if(gloss&&a.years==='5')why.push('4–5 years or more: Reserve — maker-rated up to 50 months to five years, the longest maker ratings I can offer.');
if(harsh.length&&gloss&&a.years!=='1')why.push(`${cap(harsh.map(x=>HARSH[x]).join(', ').replace(/, ([^,]*)$/,' and $1'))}: Reserve's base and top layers take chemical and abrasion wear best.`);
if(garageKept&&!harsh.length)why.push("Garage-kept: less sun and weather, so Signature's gloss-focused single layer is plenty.");
if(!harsh.length&&!garageKept&&has(a.use,'daily'))why.push('Daily commuter: any level works; the care card keeps it working.');
const stepUp=()=>''; 
if(gloss&&a.years!=='1'){
if(a.look==='beading')why.push(level==='reserve'?'Extreme beading: Reserve beads hardest.':`Extreme beading: Reserve beads hardest${stepUp()}.`);
if(a.look==='gloss')why.push('Deep, wet gloss: Signature is the gloss-focused layer.');
if(a.look==='easy')why.push(level==='reserve'?"Easiest to wash: Reserve's slick top layer lets dirt rinse off.":`Easiest to wash: Reserve's slick top layer lets dirt rinse off${stepUp()}.`);
}
if(gloss&&grade)why.push({great:'Paint looks great: Grade I, a one-step polish (gloss enhancement).',light:'Light swirls: Grade II, a one-step compound & polish.',
heavy:'Heavy swirls or scratches: Grade III, two steps — compound, then polish.'}[a.paint]+(grade!==recGrade?` You chose ${M.correction[grade].short}.`:''));
if(gloss&&!grade)why.push(`Correction is optional with Halo: ${M.correction[recGrade].short} from ${money(P.correction(recGrade,e))} if you want the swirls out first.`);
if(level!==rec)why.push(`You chose ${level==='rplus'?'Halo':C[level].label}; ${rec==='rplus'?'Halo':C[rec].label} is the likely fit for your answers (confirmed at your free inspection).`);
const wheelsOn=a.wheels!=='none';
const complete=a.glass==='all'&&wheelsOn&&has(a.more,'trim')&&has(a.more,'tires');
if(complete)line('coat:complete','Complete: all glass, trim, wheel faces & tires (longer-rated coatings)',P.coating('complete',e),
{saving:P.coatingSaving('complete',e),parts:P.coatingParts('complete',e),short:'Complete (glass, trim, wheels, tires)'});
else{
if(a.glass!=='none'){const k=a.glass==='all'?'all_glass_ceramic_ml':'ws_ceramic_ml';line(k,M.addons[k].label.replace(/ \(with any detail\)/,''),P.addon(k,e,i).price,{short:a.glass==='all'?'All glass':'Windshield'});}
if(has(a.more,'trim'))line('trim_ml',M.addons.trim_ml.label,P.addon('trim_ml',e,i).price,{short:'Trim'});
if(wheelsOn)line('wheel_ml',M.addons.wheel_ml.label.replace(/ \(with any detail\)/,''),P.addon('wheel_ml',e,i).price,{short:'Wheel faces'});
if(has(a.more,'tires'))line('tire_coat',M.glass_wheels.items.tire_coat.label,P.glassWheels('tire_coat',e),{short:'Tires'});
}
if(a.wheels==='off'){
line('wheels_off','Wheels off: barrels and calipers coated too — quoted in person',0,{quoted:true,short:'Wheels-off upgrade (quoted)'});
notes.push(`Wheels-off coating (faces, barrels & calipers) is quoted in person, from ${money(P.glassWheels('wheels_off',e))} on its own — it needs a garage.`);
}
if(has(a.more,'calipers')){
if(a.wheels==='off')notes.push('Brake calipers are coated with the wheels off — part of the wheels-off quote.');
else{line('calipers',M.glass_wheels.items.calipers.label,P.glassWheels('calipers',e),{short:'Calipers'});
notes.push('Brake calipers need the wheels off or open-spoke access — I check at the walkaround.');}
}
if(a.flush==='yes'){
const fk=has(a.use,'offroad')||has(a.use,'work')?'flush_trail':'flush_salt';
line(fk,M.addons[fk].label,P.addon(fk,e,i).price,{short:fk==='flush_trail'?'Trail Flush':'Winter Salt Flush'});
}
const hiKey=has(a.interior,'leather')&&has(a.interior,'fabric')?'leather_fabric_coat':has(a.interior,'leather')?'leather_coat':has(a.interior,'fabric')?'fabric_coat':null;
if(hiKey)line(hiKey,M.addons[hiKey].label,P.addon(hiKey,e,i).price,{short:SHORT[hiKey]});
if(hiKey&&hiKey!=='leather_coat')notes.push(STRINGS.fabricWet);
const reseal=P.pfPrice('reseal',e);
if(coat){
if(a.prepay==='yes')line('care_prepay','Coating Care: two Annual Coating Services, prepaid (about 12% off)',P.carePrepay(e),{short:'2 annual services prepaid'});
if(level==='reserve'&&grade==='g3')notes.push('Reserve with Grade III: your first Annual Coating Service is 25% off.');
}
const total=lines.reduce((t,x)=>t+x.price,0);
const gi=grade?P.CORR_KEYS.indexOf(grade):-1;
const deeper=gi>=0&&gi<P.CORR_KEYS.length-1?P.correction(P.CORR_KEYS[gi+1],e)-P.correction(grade,e):0;
const dropOnly=!!(grade&&M.correction[grade].dropoff_only);
if(dropOnly)notes.push(STRINGS.g3Note);
const needsGarage=(coat||a.wheels==='off')&&!dropOnly;
if(needsGarage&&a.garage==='no')notes.push("Paint coatings and wheels-off work need a garage I can work in. Text me anyway — glass, wheel-face and tire coatings don't need one.");
return{answers:a,vehicle:v,type:e,typeLabel:P.types[e].label,rec,recGrade,level,grade,coat,levelLabel:level==='rplus'?'Halo':C[level].label,
lines,why,notes,suggest,total,low:total,high:total+deeper,from:lines.some(x=>x.from),needsGarage,
where:dropOnly?'dropoff':'mobile',mobile:dropOnly?{enabled:false,reason:STRINGS.g3Mobile}:{enabled:true,reason:null},
days:dropOnly?M.correction[grade].max_days:null,timeNote:dropOnly?STRINGS.g3Time:null,
care:coat?{included:'A 30-day check-in and a care card, included',annual:reseal,prepay:P.carePrepay(e)}:null,
id:'C-'+hashId(JSON.stringify([[v.make,v.model,v.year,v.variant,e].map(x=>(x==null?'':String(x))),a]))};
}
function coatingText(plan,vehicle){
const p=plan,v=vehicle||p.vehicle||{},a=p.answers;
const vl=clip(`${vehicleName(v)}${v.typeLabel||p.typeLabel?` (${String(v.typeLabel||p.typeLabel).replace(/\s*\([^)]*\)\s*$/,'')})`:''}`,70);
const use=a.use.map(x=>({daily:'daily',salt:'salt',offroad:'trails',work:'job site',garage:'garage-kept'})[x]).join(', ');
const ctx=[FIN_NAME[a.finish],YRS_NAME[a.years],use,LOOK_NAME[a.look],a.finish==='gloss'?PAINT_NAME[a.paint]:null].filter(Boolean).join(' · ');
const est=p.high>p.low?`${money(p.low)}–${money(p.high)}`:`${p.from?'from ':''}${money(p.low)}`;
const care=p.care?`Coating Care: 30-day check-in & care card included${a.prepay==='yes'?'':`; annual service ${money(p.care.annual)}`}`:null;
const garage=p.where==='dropoff'?`Where: drop-off (Grade III) · ${p.timeNote.toLowerCase()}`
:p.needsGarage?`Garage: ${a.garage==='yes'?'yes':a.garage==='no'?'no':a.garage==='unsure'?'not sure':'not answered'}`:null;
const build=(n,short)=>{
const L=[`Hi Johnny, coating plan from your site (${p.id}):`,vl,ctx];
p.lines.slice(0,n).forEach(x=>L.push(`${x===p.lines[0]?'':'+ '}${short?x.short||x.label:x.short||x.label}: ${x.quoted?'quoted':(x.from?'from ':'')+money(x.price)}`)); 
if(p.lines.length>n)L.push(`+ ${p.lines.length-n} more: ${money(p.lines.slice(n).reduce((t,x)=>t+x.price,0))}`);
return L.concat([care,garage,`Estimate ${est} before tax, confirmed after inspection`,'Day/time that works:'].filter(Boolean)).join('\n');
};
let n=p.lines.length,t=build(n);
while(t.length>SMS_MAX&&n>1)t=build(--n,true);
return fitSms(t);
}
const API={recommend,QUESTIONS,LEVELS,LEVEL_DESC,LEVEL_FULL,summaryText,quoteId,questionsFor,defaultAnswers,applyRiders,selectionFor,
specialty,mixOffered,STEPS,STRINGS,INTERIOR_KEYS,EXTERIOR_KEYS,HL_LARGE_LENS,
depositFor,tripTotals,tripText,tripSelection,tripId,serviceLabel,withCards,tripLong,HL_MAX_COMPLEX,
ADVISOR,coatingPlan,coatingText,advisorDefaults};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else window.LumenBuilder=API;
})();
