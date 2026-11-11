const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const CFG=window.ANIDRIP,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const money=n=>CFG.currency+" "+Number(n).toLocaleString();
const eff=p=>p.sale??p.price;
const find=id=>PRODUCTS.find(p=>p.id===id);
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2600)};
const waURL=t=>`https://wa.me/${CFG.whatsapp||''}${t?'?text='+encodeURIComponent(t):''}`;
/* ---------- BRAND TEXT FROM CONFIG ---------- */
$('#tagline').textContent=CFG.tagline.toUpperCase();$('#fsub').textContent=CFG.tagline;$('#itag').textContent=CFG.tagline;
/* ---------- INTRO (first visit per session; skipped for reduced motion) ---------- */
let introDone=false;
function endIntro(){if(introDone)return;introDone=true;const it=$('#intro');try{sessionStorage.setItem('anidrip_intro','1')}catch(e){}
  it.classList.add('open');document.body.classList.remove('locked');setTimeout(()=>it.remove(),1100);reveal()}
$('#skip').onclick=endIntro;
let seen=false;try{seen=sessionStorage.getItem('anidrip_intro')==='1'}catch(e){}
if(RM||seen){$('#intro').remove();introDone=true;document.body.classList.remove('locked');addEventListener('load',reveal)}
else{$('#intro').classList.add('go');window.AniIntro&&AniIntro.play();setTimeout(endIntro,5200)}
/* ---------- NAV ---------- */
addEventListener('scroll',()=>$('#nav').classList.toggle('sc',scrollY>60),{passive:true});
$('#burger').onclick=()=>$('#menu').classList.toggle('open');
$$('#menu a').forEach(a=>a.onclick=()=>$('#menu').classList.remove('open'));
/* ---------- REVEAL + PARALLAX ---------- */
function reveal(){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const t=e.target;t.classList.add('in');io.unobserve(t);if(t.classList.contains('pop'))t.addEventListener('animationend',()=>t.classList.remove('pop','in'),{once:true})}}),{threshold:.1});
 $$('.card,.sh,.col').forEach((el,i)=>{el.classList.add('pop');el.style.setProperty('--d',(i%4)*90+'ms')});$$('.rv,.pop').forEach(el=>io.observe(el))}
/* ---------- PRODUCT RENDER (all from products.js) ---------- */
function priceHTML(p){return p.sale!=null?`<s>${money(p.price)}</s>${money(p.sale)}`:money(p.price)}
const sw=p=>p.colors?`<span class="sws">${p.colors.map((c,i)=>`<i class="sw${i?'':' on'}" data-ci="${i}" title="${c.name}" style="background:${c.hex}"></i>`).join('')}</span>`:'';
function card(p){return `<article class="card" data-id="${p.id}"><div class="cimg">${p.isNew?'<span class="badge">NEW</span>':''}<img src="${p.image}" alt="${p.name}" loading="lazy"><img src="${p.model||p.image}" alt="" loading="lazy"></div><div class="cm"><h3>${p.name}</h3><span class="price">${priceHTML(p)}</span><span class="sz">${p.sizes.join(' · ')}</span>${sw(p)}<span class="vp">View Product</span></div></article>`}
const fill=(sel,list)=>$(sel).innerHTML=list.map(card).join('');
fill('#shirtGrid',PRODUCTS.filter(p=>p.category==='Shirts'));
const nw=[...PRODUCTS].reverse().filter(p=>p.isNew).slice(0,4);fill('#newRow',nw);if(!nw.length)$('#new').style.display='none';
fill('#bestRow',PRODUCTS.filter(p=>p.featured));
const cats=['All',...new Set(PRODUCTS.map(p=>p.category))];
$('#filters').innerHTML=cats.map((c,i)=>`<button class="${i?'':'on'}" data-c="${c}">${c}</button>`).join('');
const showAll=c=>fill('#allGrid',c==='All'?PRODUCTS:PRODUCTS.filter(p=>p.category===c));showAll('All');
$('#filters').onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('#filters button').forEach(x=>x.classList.remove('on'));b.classList.add('on');showAll(b.dataset.c)};
const showP=[...PRODUCTS.filter(p=>p.model)].sort((a,b)=>b.featured-a.featured).slice(0,4);
$('#showcase').innerHTML=showP.map(p=>`<div class="sh" data-id="${p.id}"><img src="${p.model}" alt="${p.name}" loading="lazy"><div><h3>${p.name}</h3><span class="btn">Discover</span></div></div>`).join('');
const COLP={Shirts:'medusa-tee',Hoodies:'wings-hoodie',Sweatshirts:'scribble-sweatshirt'};
$('#cols').innerHTML=[...new Set(PRODUCTS.map(p=>p.category))].map(c=>{const p=find(COLP[c])||PRODUCTS.find(x=>x.category===c);return `<div class="col" data-cat="${c}"><img src="${(p.id==='wings-hoodie'?p.image:(p.model||p.image))}" alt="${c}" loading="lazy"><span>${c}</span></div>`}).join('');
const animeL=PRODUCTS.filter(p=>p.brand==='Anime'||p.brand==='NMA');if(animeL.length){fill('#animeGrid',animeL);$('#anime').hidden=false}else $$('a[href="#anime"]').forEach(a=>a.remove());
document.addEventListener('click',e=>{
  const w=e.target.closest('.sw');if(w){const cd=w.closest('.card'),p=find(cd.dataset.id),c=p.colors[w.dataset.ci],im=$$('.cimg img',cd);im[0].src=c.image;im[1].src=c.model||c.image;$$('.sw',cd).forEach(x=>x.classList.toggle('on',x===w));return}
  const c=e.target.closest('.card,.sh');if(c){if(matchMedia('(hover:none)').matches&&c.classList.contains('sh')&&!c.classList.contains('on')){$$('.sh').forEach(x=>x.classList.remove('on'));c.classList.add('on');return}openP(c.dataset.id);return}
  const col=e.target.closest('.col');if(col){$$('#filters button').forEach(b=>b.classList.toggle('on',b.dataset.c===col.dataset.cat));showAll(col.dataset.cat);$('#shop').scrollIntoView()}
  const inf=e.target.closest('[data-info]');if(inf){e.preventDefault();toast(inf.dataset.info)}});
/* ---------- PRODUCT DETAIL ---------- */
let curSize=null,curCol=0;
function openP(id){const p=find(id);curSize=null;curCol=0;const c0=p.colors?p.colors[0]:p;const rel=PRODUCTS.filter(x=>x.id!==id&&x.category===p.category).slice(0,4);
 $('#pmBody').innerHTML=`<div class="pd"><div class="gal"><img src="${c0.image}" alt="">${c0.model?`<img src="${c0.model}" alt="">`:''}</div><div class="pdi"><p class="eyebrow">${p.category.toUpperCase()}</p><h2>${p.name}</h2><span class="price">${priceHTML(p)}</span><p>${p.desc}</p>${p.colors?`<b>Colour</b><div class="cols2">${p.colors.map((c,i)=>`<button class="cb${i?'':' on'}" data-ci="${i}"><i style="background:${c.hex}"></i>${c.name}</button>`).join('')}</div>`:''}<b>Size</b><div class="sizes">${p.sizes.map(s=>`<button data-s="${s}">${s}</button>`).join('')}</div><button class="btn wa" id="addBag">Add to Bag</button><button class="btn wa" id="orderNow">Buy Now</button>${p.link&&p.link!=='#'?`<a class="vp" href="${p.link}" target="_blank" rel="noopener">Product link</a>`:''}${rel.length?`<div class="rel">${rel.map(r=>`<img src="${r.image}" data-r="${r.id}" alt="${r.name}">`).join('')}</div>`:''}</div></div>`;
 $('#pm').classList.add('on');
 $$('.sizes button').forEach(b=>b.onclick=()=>{$$('.sizes button').forEach(x=>x.classList.remove('on'));b.classList.add('on');curSize=b.dataset.s});
 $$('.cb').forEach(b=>b.onclick=()=>{curCol=+b.dataset.ci;$$('.cb').forEach(x=>x.classList.toggle('on',x===b));const c=p.colors[curCol],g=$$('.gal img');g[0].src=c.image;g[1].src=c.model||c.image});
 const colName=()=>p.colors?p.colors[curCol].name:'';
 $('#addBag').onclick=()=>{if(!curSize)return toast('Please select a size');addBag(id,curSize,colName());$('#pm').classList.remove('on');openBag()};
 $('#orderNow').onclick=()=>{if(!curSize)return toast('Please select a size');openCheckout([{id,size:curSize,color:colName(),qty:1}])};
 $$('[data-r]').forEach(i=>i.onclick=()=>openP(i.dataset.r))}
$('#pm').onclick=e=>{if(e.target.id==='pm'||e.target.hasAttribute('data-x'))$('#pm').classList.remove('on')};
/* ---------- BAG (localStorage) ---------- */
let bag=[];try{bag=JSON.parse(localStorage.getItem('anidrip_bag')||'[]').filter(i=>find(i.id))}catch(e){}
const save=()=>{try{localStorage.setItem('anidrip_bag',JSON.stringify(bag))}catch(e){}renderBag()};
function addBag(id,size,color=''){const i=bag.find(x=>x.id===id&&x.size===size&&x.color===color);i?i.qty++:bag.push({id,size,color,qty:1});save();toast('Added to bag')}
function renderBag(){$('#bagN').textContent=bag.reduce((a,b)=>a+b.qty,0);
 $('#bagItems').innerHTML=bag.length?bag.map((it,n)=>{const p=find(it.id);return `<div class="bi"><img src="${((p.colors||[]).find(c=>c.name===it.color)||p).image}" alt=""><div><b>${p.name}</b><br>${it.color?it.color+' · ':''}Size ${it.size} · ${money(eff(p))}<div class="q"><button data-q="${n}" data-d="-1">−</button>${it.qty}<button data-q="${n}" data-d="1">+</button><button class="rm" data-rm="${n}">Remove</button></div></div></div>`}).join(''):'<p style="opacity:.6">Your bag is empty.</p>';
 renderSug();$('#bagT').textContent=money(bag.reduce((a,b)=>a+eff(find(b.id))*b.qty,0))}
$('#bagItems').onclick=e=>{const q=e.target.dataset;if(q.q!==undefined){bag[q.q].qty+=+q.d;if(bag[q.q].qty<1)bag.splice(q.q,1);save()}if(q.rm!==undefined){bag.splice(q.rm,1);save()}};
const openBag=()=>$('#bag').classList.add('on');$('#bagBtn').onclick=openBag;$('#bagX').onclick=()=>$('#bag').classList.remove('on');
$('#order').onclick=()=>bag.length?(($('#bag').classList.remove('on')),openCheckout(bag.map(x=>({...x})))):toast('Your bag is empty');
/* ---------- DELIVERY (petrol cost for the distance + addOn, capped) + CHECKOUT ---------- */
const DL=CFG.delivery||{},geoC={};
async function geo(q){if(geoC[q]!==undefined)return geoC[q];let r=null;try{const j=await(await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=${DL.country||'pk'}&q=${encodeURIComponent(q)}`)).json();if(j&&j[0])r={lat:+j[0].lat,lon:+j[0].lon}}catch(e){}return geoC[q]=r}
async function geoLoose(a){const p=a.split(/[,\n]+/).map(x=>x.trim()).filter(Boolean);if(!p.length)return null;const tries=[p.join(', ')];if(p.length>2)tries.push(p.slice(1).join(', '));if(p.length>1)tries.push(p.slice(-2).join(', '));tries.push(p[p.length-1]);for(const t of [...new Set(tries)].slice(0,4)){const r=await geo(t);if(r)return r}return null}
const hav=(a,b)=>{const d=x=>x*Math.PI/180,dl=d(b.lat-a.lat),dn=d(b.lon-a.lon),h=Math.sin(dl/2)**2+Math.cos(d(a.lat))*Math.cos(d(b.lat))*Math.sin(dn/2)**2;return 12742*Math.asin(Math.sqrt(h))};
async function roadKm(a,b){try{const c=new AbortController();setTimeout(()=>c.abort(),6000);const j=await(await fetch(`https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`,{signal:c.signal})).json();if(j.routes&&j.routes[0])return j.routes[0].distance/1000}catch(e){}return hav(a,b)*1.35}
async function deliveryFor(addr){const o=await geoLoose(DL.origin||'Karachi, Pakistan'),d=await geoLoose(addr);if(!o||!d)return null;const km=await roadKm(o,d),petrol=km*(DL.roundTrip?2:1)/(DL.kmPerLitre||40)*(DL.petrolPerLitre||270),fee=Math.max(DL.min||0,Math.min(DL.max||550,Math.ceil((petrol+(DL.addOn||100))/10)*10));return{km:Math.round(km*10)/10,fee}}
function debounce(f,ms){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>f(...a),ms)}}
let CO=[],coFee=null,coTok=0;
const coSub=()=>CO.reduce((a,i)=>a+eff(find(i.id))*i.qty,0);
function coDraw(){$('#coSub').textContent=money(coSub());$('#coDel').textContent=coFee==null?($('#coAddr').value.trim()?'To be confirmed':'Enter address'):money(coFee);$('#coTot').textContent=money(coSub()+(coFee||0))}
function openCheckout(items){CO=items;coFee=null;
 $('#coItems').innerHTML=items.map(i=>{const p=find(i.id);return `<div class="coi"><img src="${((p.colors||[]).find(c=>c.name===i.color)||p).image}" alt=""><div><b>${p.name}</b><small>${i.color?i.color+' · ':''}Size ${i.size} · Qty ${i.qty}</small></div><span>${money(eff(p)*i.qty)}</span></div>`}).join('');
 $('#coSt').textContent='';coDraw();$('#pm').classList.remove('on');$('#co').classList.add('on')}
const coCalc=debounce(async()=>{const a=$('#coAddr').value.trim();coFee=null;if(a.length<6){$('#coSt').textContent='';return coDraw()}
 const my=++coTok;$('#coSt').textContent='Calculating delivery…';coDraw();const r=await deliveryFor(a);if(my!==coTok)return;
 if(r){coFee=r.fee;$('#coSt').textContent=`Delivery for about ${r.km} km`}else $('#coSt').textContent="Couldn't locate this address exactly — we'll confirm delivery on WhatsApp (between "+money(DL.min||0)+" and "+money(DL.max||550)+").";coDraw()},800);
$('#coAddr').oninput=coCalc;
$('#co').onclick=e=>{if(e.target.id==='co'||e.target.hasAttribute('data-x'))$('#co').classList.remove('on')};
$('#coGo').onclick=()=>{const n=$('#coName').value.trim(),a=$('#coAddr').value.trim();if(!n)return toast('Please enter your name');if(!a)return toast('Please enter your delivery address');
 const lines=CO.map(i=>{const p=find(i.id);return `• ${p.name} | ${i.color?'Colour '+i.color+' | ':''}Size ${i.size} | Qty ${i.qty} | ${money(eff(p)*i.qty)}`});
 const sub=coSub(),msg=`Hello AniDrip, I would like to order:\n${lines.join('\n')}\nSubtotal: ${money(sub)}\nDelivery: ${coFee==null?'to be confirmed ('+money(DL.min||0)+' – '+money(DL.max||550)+')':money(coFee)}\nTotal: ${money(sub+(coFee||0))}${coFee==null?' + delivery':''}\n\nName: ${n}\nAddress: ${a}`;
 open(waURL(msg),'_blank','noopener');$('#co').classList.remove('on')};
/* ---------- CONTACT / SOCIAL (from config.js; only filled-in links are shown) ---------- */
$('#waMain').href=waURL();
const IC={whatsapp:'<svg viewBox="0 0 24 24"><path d="M12.04 2a9.9 9.9 0 00-8.5 14.9L2 22l5.25-1.5A9.9 9.9 0 1012.04 2zm5.8 14.1c-.25.7-1.45 1.35-2 1.4-.52.05-1 .25-3.4-.7-2.9-1.15-4.75-4.1-4.9-4.3-.15-.2-1.15-1.55-1.15-2.95s.72-2.1 1-2.4c.25-.28.55-.35.75-.35h.55c.18 0 .42-.07.65.5l.9 2.2c.08.17.12.35.02.55l-.3.45-.4.45c-.13.15-.27.3-.12.58.15.27.68 1.12 1.45 1.8 1 .88 1.82 1.15 2.1 1.28.27.13.43.1.6-.08.15-.2.7-.82.88-1.1.18-.27.37-.22.62-.13l2 .95c.27.13.45.2.52.3.07.1.07.65-.18 1.35z"/></svg>',
facebook:'<svg viewBox="0 0 24 24"><path d="M13.5 22v-8.2h2.8l.45-3.3H13.5V8.4c0-.95.27-1.6 1.62-1.6h1.7V3.85A22 22 0 0014.4 3.7c-2.5 0-4.2 1.5-4.2 4.3v2.5H7.4v3.3h2.8V22h3.3z"/></svg>',
instagram:'<svg viewBox="0 0 24 24"><path d="M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2zm0 2A3.5 3.5 0 004 7.5v9A3.5 3.5 0 007.5 20h9a3.5 3.5 0 003.5-3.5v-9A3.5 3.5 0 0016.5 4h-9zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.2-3.2a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>',
tiktok:'<svg viewBox="0 0 24 24"><path d="M16.6 2h-3.2v13.2a2.9 2.9 0 11-2.9-2.9c.3 0 .6 0 .85.1V9.1a6.1 6.1 0 00-.85-.06 6.1 6.1 0 106.1 6.1V8.7a7.7 7.7 0 004.4 1.4V6.9a4.5 4.5 0 01-4.4-4.9z"/></svg>',
youtube:'<svg viewBox="0 0 24 24"><path d="M21.6 7.2a2.5 2.5 0 00-1.75-1.77C18.3 5 12 5 12 5s-6.3 0-7.85.43A2.5 2.5 0 002.4 7.2C2 8.75 2 12 2 12s0 3.25.4 4.8a2.5 2.5 0 001.75 1.77C5.7 19 12 19 12 19s6.3 0 7.85-.43a2.5 2.5 0 001.75-1.77C22 15.25 22 12 22 12s0-3.25-.4-4.8zM10 15V9l5.2 3L10 15z"/></svg>',
email:'<svg viewBox="0 0 24 24"><path d="M3.5 5h17A1.5 1.5 0 0122 6.5v11a1.5 1.5 0 01-1.5 1.5h-17A1.5 1.5 0 012 17.5v-11A1.5 1.5 0 013.5 5zm.6 2l7.9 5.6L19.9 7H4.1zM20 9.1l-8 5.7-8-5.7v8.4h16V9.1z"/></svg>'};
const links=[['whatsapp',waURL()],...Object.entries(CFG.social||{}).filter(([,u])=>u)];
const C=CFG.contact||{};/* the phone number is intentionally NOT printed — icons only */
$('#conn').className='soc';
$('#conn').innerHTML=links.map(([k,u])=>`<a href="${u}" target="_blank" rel="noopener" aria-label="${k}" title="${k[0].toUpperCase()+k.slice(1)}">${IC[k]||k}</a>`).join('')+(C.email?`<a href="mailto:${C.email}" aria-label="Email" title="${C.email}">${IC.email}</a>`:'');
