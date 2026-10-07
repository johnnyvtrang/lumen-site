function makePricing(M){
const RATE=M.rate_per_min,A=M.anchors_sedan,T0=M.types,PROT=M.protected,ADD=M.addons,MOD=M.modifiers;
const EXT=M.minutes_sedan.e,INT=M.minutes_sedan.i,OV=M.minutes_sedan.overlap;
const INSIDE=new Set(['seats','floor','dash','vents','iglass','cargo','seats+floor']);
const pyRound=x=>{const f=Math.floor(x),d=x-f;if(Math.abs(d-0.5)<1e-9)return(f%2===0)?f:f+1;return Math.round(x);};
const round9=x=>pyRound((x+1) / 10)*10-1;
const round5=x=>pyRound(x / 5)*5;
const round10=x=>pyRound(x / 10)*10;
const T=k=>{const v=T0[k];if(!v)throw new Error('Unknown vehicle type '+k);return v;};
const sum=(areas,level,veh)=>{let t=0;for(const k in areas)t+=areas[k].min[level]*veh[areas[k].factor];return t;};
const INC=M.included;
function always(track,level){
const a=(INC.always||{})[String(level)];
if(!a||(a.tracks||'').indexOf(track)<0)return[0,0];
let mn=0,usd=0;
for(const k in a)if(k!=='tracks'&&a[k]&&typeof a[k]==='object'){mn+=a[k].min||0;usd+=a[k].product_usd||0;}
return[mn,usd];
}
function minutes(track,level,e,i){
i=i||e;
if(T(e).interior_only)throw new Error(e+' is interior-only');
let m=0;
if(track==='e'||track==='f')m+=sum(EXT,level,T(e));
if(track==='i'||track==='f')m+=sum(INT,level,T(i));
if(track==='f')m-=OV.min[level]*T(e)[OV.factor];
return m+always(track,level)[0];
}
function takeRateMinutes(track,level,e,i){
i=i||e;
const p=INC.priced_at_take_rate[String(level)]||{};
let m=0;
if((track==='e'||track==='f')&&p.e){
m+=(p.e.gear_units||0)*addon('accessory',e,i).minutes;
if(p.e.trim_restore)m+=addon('trim_restore',e,i,2).minutes;
}
if((track==='i'||track==='f')&&p.i)m+=(p.i.car_seat_units||0)*addon('car_seat',e,i).minutes;
return INC.take_rate*m;
}
const pricedMinutes=(track,level,e,i)=>minutes(track,level,e,i)+takeRateMinutes(track,level,e,i);
let FIXED=null; 
function fixed(){
if(!FIXED){FIXED={};for(const t of'eif')FIXED[t]=[0,1,2].map(l=>A[t][l]-RATE*pricedMinutes(t,l,'sedan')-always(t,l)[1]);}
return FIXED;
}
const price=(track,level,e,i)=>round9(fixed()[track][level]+RATE*pricedMinutes(track,level,e,i)+always(track,level)[1]);
function included(level,track,kind){
const al=INC.allowance,fl=INC.from_level;
if(kind){
const pr=INC.protected[kind],hasI=kind==='pfull';
return{car_seat:hasI?pr.car_seat||0:0,gear:pr.gear||0,trim_restore:false,ws_ceramic:false,glass_spots:kind==='reseal'};
}
const hasE=track==='e'||track==='f',hasI=track==='i'||track==='f',a=(INC.always||{})[String(level)];
const gf=ADD.water_light.glass_credit_from_level==null?2:ADD.water_light.glass_credit_from_level;
return{car_seat:hasI?al.car_seat[level]:0,gear:hasE?al.gear[level]:0,trim_restore:hasE&&level>=fl.trim_restore,
ws_ceramic:!!(a&&a.ws_ceramic&&(a.tracks||'').indexOf(track)>=0),glass_spots:hasE&&level>=gf};
}
function pfMinutes(kind,e,i){
const s=PROT[kind];i=i||e;
let m=0;
if(s.e!=null)m+=sum(EXT,s.e,T(e));
if(s.i!=null)m+=sum(INT,s.i,T(i));
if(s.overlap!=null)m-=OV.min[s.overlap]*T(e)[OV.factor];
return m;
}
const PF_FIXED={};
for(const k in PROT)PF_FIXED[k]=PROT[k].anchor-RATE*pfMinutes(k,'sedan');
const pfPrice=(kind,e,i)=>round9(PF_FIXED[kind]+RATE*pfMinutes(kind,e,i));
const factor=(name,tkey)=>{const v=T(tkey);return name==='seats+floor'?(v.seats+v.floor) / 2:v[name];};
function addon(key,e,i,level,opt){
i=i||e;
if(MOD[key])return{price:MOD[key].price,minutes:MOD[key].min||0};
const d=ADD[key];if(!d)throw new Error('Unknown add-on '+key);
if(d.options)return{price:d.options[opt||'pods'],minutes:d.min};
if(!d.factor)return{price:d.base,minutes:d.min};
const k=factor(d.factor,INSIDE.has(d.factor)?i:e),s=d.share==null?0.8:d.share;
let p=Math.max(5,round5(d.base*(1-s)+d.base*s*k)),mn=d.min*k;
if(level===2&&d.crp_credit_addon){const c=addon(d.crp_credit_addon,e,i);p-=c.price;mn-=c.minutes;} 
if(level!=null&&level>=(d.glass_credit_from_level==null?2:d.glass_credit_from_level)&&d.l2_credit){
const cf=d.l2_credit_factor||'floor',fl=factor(cf,INSIDE.has(cf)?i:e);
p-=Math.max(5,round5(d.l2_credit*fl));mn-=(d.l2_credit_min||0)*fl;
}
return{price:p,minutes:mn};
}
function glassWheels(key,e){
const G=M.glass_wheels,d=G.items[key];if(!d)throw new Error('Unknown glass/wheel item '+key);
if(!d.factor)return d.base;
return round9(d.base*(1-G.share)+d.base*G.share*T(e)[d.factor]);
}
function glassWheelsMinutes(key,e){
const d=M.glass_wheels.items[key];if(!d)throw new Error('Unknown glass/wheel item '+key);
if(!d.min)return 0;
return d.factor?d.min*T(e)[d.factor]:d.min;
}
function heavySoil(level,i){
const c=M.condition.heavy,m=c.share_of_interior_labor*sum(INT,level,T(i));
return{price:Math.max(c.min_usd,round5(RATE*m)),minutes:m};
}
const restoration=(e,i)=>round9(price('f',2,e,i)+addon('shampoo_full',e,i).price);
const restorationMinutes=(e,i)=>minutes('f',2,e,i)+addon('shampoo_full',e,i).minutes+M.specialty.restoration.extra_min;
const correction=(kind,e)=>round9(M.correction[kind].anchor*(0.1+0.9*T(e).paint));
const cycle=(e,i)=>(2*price('f',0,e,i)+price('f',1,e,i)) / 3;
function plan(name,freq,e,i){
const a=M.plans[name].anchors;
let d;
if(name==='std')d=freq==='q'?price('f',1,e,i)-price('f',1,'sedan'):cycle(e,i)-cycle('sedan');
else d=(pfPrice('refresh',e)+price('i',1,e,i))-(pfPrice('refresh','sedan')+price('i',1,'sedan'));
return a[freq]+round10(d);
}
const planOneOff=(name,freq,e,i)=>name==='std'?(freq==='q'?price('f',1,e,i):cycle(e,i)):pfPrice('refresh',e)+price('i',1,e,i);
const fullSaving=(level,e,i)=>price('e',level,e)+price('i',level,e,i)-price('f',level,e,i);
const maxSaving=(e,i)=>Math.max(fullSaving(0,e,i),fullSaving(1,e,i),fullSaving(2,e,i));
const hoursLabel=m=>{const h=Math.max(1,Math.floor(m / 30+0.5) / 2);return h===1?'about 1 hour':`about ${h} hours`;};
const publicTypes=()=>Object.keys(T0).filter(k=>!T0[k].interior_only);
(function selfCheck(){
for(const t of'eif')for(let l=0;l<3;l++)if(price(t,l,'sedan')!==A[t][l])console.warn('Lumen pricing: sedan anchor mismatch',t,l);
for(const k in PROT)if(pfPrice(k,'sedan')!==PROT[k].anchor)console.warn('Lumen pricing: protected anchor mismatch',k);
if([0,1,2].map(l=>fullSaving(l,'sedan')).join()!=='29,59,89')console.warn('Lumen pricing: sedan Full saving is not 29/59/89');
for(const k in M.glass_wheels.items)if(glassWheels(k,'sedan')!==M.glass_wheels.items[k].base)console.warn('Lumen pricing: glass/wheel sedan mismatch',k);
})();
return{minutes,price,takeRateMinutes,included,pfMinutes,pfPrice,addon,glassWheels,glassWheelsMinutes,heavySoil,restoration,restorationMinutes,correction,plan,planOneOff,
fullSaving,maxSaving,hoursLabel,publicTypes,round9,round5,pyRound,types:T0,model:M};
}
if(typeof module!=='undefined')module.exports={makePricing};
