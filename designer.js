/* AniDrip custom designer: realistic garment mockups (front/back), colour picker, drag/resize/rotate/crop,
   print-vs-colour match score, and a WhatsApp hand-off that carries the mockup image with the message. */
(()=>{
const CFG=window.ANIDRIP,MK=window.MOCKUPS||{},$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const W=800,H=900,MAXB=10*1024*1024,SIG=[137,80,78,71,13,10,26,10],NAMES={tee:'T-Shirt',sweat:'Sweatshirt',hoodie:'Hoodie'};
const G={type:'tee',sleeve:'half',color:'#151515',cname:'Black'},D={front:null,back:null},SIDES=['front','back'];
const SWATCH=[['White','#f4f4f4'],['Black','#151515'],['Charcoal','#3a3d42'],['Grey','#9a9da3'],['Navy','#1b2a49'],['Royal Blue','#2457c5'],['Sky Blue','#7fb4e6'],['Red','#c8102e'],['Maroon','#6d1428'],['Orange','#e8742a'],['Yellow','#f2c230'],['Green','#1f7a4a'],['Olive','#5b6b3a'],['Mint','#9fd8c0'],['Beige','#d9c7a6'],['Brown','#5c3d2e'],['Pink','#f0a1bf'],['Purple','#5b3a8c']];
const tip=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(tip.t);tip.t=setTimeout(()=>e.classList.remove('on'),2800)};
const waURL=t=>`https://wa.me/${CFG.whatsapp||''}${t?'?text='+encodeURIComponent(t):''}`;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const panel=s=>$(`.dp[data-side="${s}"]`);
const kind=()=>G.type==='tee'?(G.sleeve==='full'?'tee-full':'tee-half'):G.type;
const gName=()=>`${G.type==='tee'?(G.sleeve==='full'?'Full-sleeve ':'Half-sleeve '):'Full-sleeve '}${NAMES[G.type]}`;
function say(side,t,k){const e=$('.st',panel(side));e.textContent=t;e.className='st '+(k||'')}
/* ---------- colour helpers ---------- */
const hexRgb=h=>{h=h.replace('#','');if(h.length===3)h=[...h].map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]};
const rgbHex=(r,g,b)=>'#'+[r,g,b].map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
function rgbHsv(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn;let h=0;if(d){if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;if(h<0)h+=360}return[h,mx?d/mx:0,mx]}
function hsvRgb(h,s,v){const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r=0,g=0,b=0;if(h<60)[r,g,b]=[c,x,0];else if(h<120)[r,g,b]=[x,c,0];else if(h<180)[r,g,b]=[0,c,x];else if(h<240)[r,g,b]=[0,x,c];else if(h<300)[r,g,b]=[x,0,c];else[r,g,b]=[c,0,x];return[(r+m)*255,(g+m)*255,(b+m)*255]}
const lin=c=>{c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)};
const lumOf=(r,g,b)=>.2126*lin(r)+.7152*lin(g)+.0722*lin(b);
/* ---------- garment layers ---------- */
const LY={};
const loadImg=src=>new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(i);i.src=src});
function layers(k,side){const key=k+side;if(LY[key])return LY[key];const d=MK[k]&&MK[k][side];const o=LY[key]={ready:false,base:{}};if(!d)return o;
 o.zone=d.zone;o.def=d.def;o.p=Promise.all([loadImg(d.m),loadImg(d.s),loadImg(d.h)]).then(([m,s,h])=>{o.m=m;o.s=s;o.h=h;o.ready=true;renderAll()});return o}
function baseFor(ly){const k=G.color;if(ly.base.key===k)return ly.base.cv;const t=document.createElement('canvas');t.width=W;t.height=H;const c=t.getContext('2d');c.fillStyle=k;c.fillRect(0,0,W,H);c.globalCompositeOperation='destination-in';c.drawImage(ly.m,0,0);
 const o=document.createElement('canvas');o.width=W;o.height=H;const x=o.getContext('2d');x.shadowColor='rgba(0,0,0,.6)';x.shadowBlur=28;x.shadowOffsetY=16;x.drawImage(t,0,0);ly.base={key:k,cv:o};return o}
const pl=document.createElement('canvas');pl.width=W;pl.height=H;const pc=pl.getContext('2d');
function paint(ctx,side,ox=0,oy=0){const ly=layers(kind(),side);if(!ly.ready)return;ctx.drawImage(baseFor(ly),ox,oy);const d=D[side];
 if(d&&d.img.complete){pc.clearRect(0,0,W,H);pc.save();pc.translate(d.x*W,d.y*H);pc.rotate(d.r*Math.PI/180);const pw=d.sw*W,ph=pw*d.h/d.w;pc.drawImage(d.img,-pw/2,-ph/2,pw,ph);pc.restore();pc.globalCompositeOperation='destination-in';pc.drawImage(ly.m,0,0);pc.globalCompositeOperation='source-over';ctx.drawImage(pl,ox,oy)}
 ctx.drawImage(ly.s,ox,oy);ctx.drawImage(ly.h,ox,oy)}
function renderSide(side){const cv=$('.gc',panel(side)),c=cv.getContext('2d');c.clearRect(0,0,W,H);paint(c,side)}
function renderAll(){SIDES.forEach(renderSide)}
/* ---------- overlay (zone + box) ---------- */
function layoutOv(side){const p=panel(side),ly=layers(kind(),side),z=p.querySelector('.zone'),b=p.querySelector('.box'),d=D[side];
 if(ly.zone){const[x0,y0,x1,y1]=ly.zone;Object.assign(z.style,{left:x0/W*100+'%',top:y0/H*100+'%',width:(x1-x0)/W*100+'%',height:(y1-y0)/H*100+'%'})}
 z.classList.toggle('faint',!!d);
 if(d){const wP=d.sw*100,hP=d.sw*(d.h/d.w)*(W/H)*100;Object.assign(b.style,{left:d.x*100+'%',top:d.y*100+'%',width:wP+'%',height:hP+'%',transform:`translate(-50%,-50%) rotate(${d.r}deg)`})}}
function sync(side){const p=panel(side),d=D[side];p.classList.toggle('filled',!!d);$('.box',p).hidden=!d;$('.adj',p).hidden=!d;$('.rep',p).hidden=!d;$('.rm',p).hidden=!d;$('.crop',p).hidden=!d;$('.up',p).hidden=!!d;
 if(d){$('.rs',p).value=Math.round(d.sw*100);$('.rs',p).nextElementSibling.textContent=Math.round(d.sw*100)+'%';$('.rr',p).value=Math.round(d.r);$('.rr',p).nextElementSibling.textContent=Math.round(d.r)+'°'}
 $('.tx',p).hidden=!(d&&d.text);$('.addtx',p).hidden=!!(d&&d.text);$('#dSend').classList.toggle('ready',!!(D.front||D.back));layoutOv(side)}
function touch(side){renderSide(side);sync(side);scheduleScore()}
/* ---------- garment + colour controls ---------- */
function drawShirts(){const n=gName();$$('.dp h3').forEach(h=>h.textContent=`${h.closest('.dp').dataset.side==='front'?'Front':'Back'} Design · ${n}`);
 $('#slRow').hidden=G.type!=='tee';$('#gNote').textContent=G.type==='tee'?'':`${NAMES[G.type]}s are full sleeve.`;
 SIDES.forEach(s=>layers(kind(),s));Promise.all(SIDES.map(s=>layers(kind(),s).p)).then(()=>{SIDES.forEach(s=>{layoutOv(s);renderSide(s)});scheduleScore()});SIDES.forEach(layoutOv);renderAll()}
function defaults(side){const ly=layers(kind(),side);if(!ly.def)return;const d=D[side];if(!d)return;d.x=ly.def[0];d.y=ly.def[1];d.sw=Math.min(ly.def[2],d.sw||ly.def[2]);d.r=0}
function chips(id,key){$(id).onclick=e=>{const b=e.target.closest('button');if(!b)return;G[key]=b.dataset.v;
 if(key==='type'){G.sleeve=G.type==='tee'?'half':'full';$$('#gSleeve button').forEach(x=>x.classList.toggle('on',x.dataset.v===G.sleeve))}
 $$('button',$(id)).forEach(x=>x.classList.toggle('on',x===b));
 if(key==='type')SIDES.forEach(s=>{const ly=layers(kind(),s);Promise.resolve(ly.p).then(()=>{if(D[s]){const d=D[s];d.x=ly.def[0];d.y=ly.def[1];d.r=0;sync(s);renderSide(s)}})});
 drawShirts()}}
chips('#gType','type');chips('#gSleeve','sleeve');
function nameOf(hex){const h=hex.toLowerCase();const m=SWATCH.find(x=>x[1]===h);if(m)return m[0];const c=hexRgb(h);let best=null,bd=1e9;for(const[n,x]of SWATCH){const r=hexRgb(x),d=(r[0]-c[0])**2+(r[1]-c[1])**2+(r[2]-c[2])**2;if(d<bd){bd=d;best=n}}return`Custom (≈ ${best})`}
function setColor(hex,fromPicker){G.color=hex.toLowerCase();G.cname=nameOf(G.color);$('#cName').textContent=G.cname;
 $$('#swatches .sw2').forEach(b=>b.classList.toggle('on',b.dataset.h===G.color));$('#cMore').classList.toggle('on',!SWATCH.some(x=>x[1]===G.color));
 if(!fromPicker){const[h,s,v]=rgbHsv(...hexRgb(G.color));pk.h=h;pk.s=s;pk.v=v;pkSync()}
 $('#hexIn').value=G.color;$('#cPrev').style.background=G.color;renderAll();scheduleScore()}
$('#swatches').innerHTML=SWATCH.map(([n,h])=>`<button type="button" class="sw2" data-h="${h}" title="${n}" aria-label="${n}" style="--c:${h}"></button>`).join('');
$('#swatches').onclick=e=>{const b=e.target.closest('.sw2');if(b)setColor(b.dataset.h)};
/* colour box picker (saturation/brightness square + hue slider) */
const pk={h:0,s:0,v:.08},sv=$('#svBox'),sx=sv.getContext('2d');
function drawSV(){const w=sv.width,h=sv.height;sx.fillStyle=`hsl(${pk.h},100%,50%)`;sx.fillRect(0,0,w,h);let g=sx.createLinearGradient(0,0,w,0);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');sx.fillStyle=g;sx.fillRect(0,0,w,h);g=sx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'#000');sx.fillStyle=g;sx.fillRect(0,0,w,h);
 const px=pk.s*w,py=(1-pk.v)*h;sx.beginPath();sx.arc(px,py,8,0,7);sx.lineWidth=3;sx.strokeStyle='#fff';sx.stroke();sx.lineWidth=1;sx.strokeStyle='#000';sx.stroke()}
function pkSync(){$('#hueR').value=pk.h;drawSV()}
function pkApply(){setColor(rgbHex(...hsvRgb(pk.h,pk.s,pk.v)),true);drawSV()}
let svDrag=false;const svPick=e=>{const r=sv.getBoundingClientRect();pk.s=clamp((e.clientX-r.left)/r.width,0,1);pk.v=1-clamp((e.clientY-r.top)/r.height,0,1);pkApply()};
sv.addEventListener('pointerdown',e=>{svDrag=true;sv.setPointerCapture(e.pointerId);svPick(e)});sv.addEventListener('pointermove',e=>{if(svDrag)svPick(e)});['pointerup','pointercancel'].forEach(v=>sv.addEventListener(v,()=>svDrag=false));
$('#hueR').oninput=e=>{pk.h=+e.target.value;pkApply()};
$('#hexIn').oninput=e=>{let v=e.target.value.trim();if(!v.startsWith('#'))v='#'+v;if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)){const c=hexRgb(v);setColor(rgbHex(...c))}};
$('#cMore').onclick=()=>{const o=$('#cPop').hidden;$('#cPop').hidden=!o;$('#cMore').setAttribute('aria-expanded',o);if(o)drawSV()};
$('#cDone').onclick=()=>{$('#cPop').hidden=true;$('#cMore').setAttribute('aria-expanded','false')};
document.addEventListener('pointerdown',e=>{if(!$('#cPop').hidden&&!e.target.closest('#cPop,#cMore')){$('#cPop').hidden=true;$('#cMore').setAttribute('aria-expanded','false')}});
/* ---------- upload ---------- */
async function isPng(f){const b=new Uint8Array(await f.slice(0,8).arrayBuffer());return SIG.every((v,i)=>b[i]===v)}
const loadURL=url=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=url});
const toBlob=(cv,t='image/png',q)=>new Promise(r=>cv.toBlob(r,t,q));
function srcCanvas(img){const m=4096,sc=Math.min(1,m/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*sc);c.height=Math.round(img.naturalHeight*sc);c.getContext('2d').drawImage(img,0,0,c.width,c.height);return c}
function bbox(c){const x=c.getContext('2d'),w=c.width,h=c.height,d=x.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;for(let y=0;y<h;y++)for(let i=0;i<w;i++)if(d[(y*w+i)*4+3]>10){if(i<x0)x0=i;if(i>x1)x1=i;if(y<y0)y0=y;if(y>y1)y1=y}return x1<0?null:[x0,y0,x1-x0+1,y1-y0+1]}
function stats(img){const m=96,sc=Math.min(1,m/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*sc));c.height=Math.max(1,Math.round(img.naturalHeight*sc));const x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);const d=x.getImageData(0,0,c.width,c.height).data,P=[];let tr=0;
 for(let i=0;i<d.length;i+=4){const a=d[i+3];if(a<250)tr++;if(a<20)continue;const[h,s,v]=rgbHsv(d[i],d[i+1],d[i+2]);P.push([lumOf(d[i],d[i+1],d[i+2]),h,s,v,a/255])}return{P,hasAlpha:tr/(d.length/4)>.02}}
async function setBlob(side,blob,keepPlace){const url=URL.createObjectURL(blob);let img;try{img=await loadURL(url)}catch(e){URL.revokeObjectURL(url);return false}
 const old=D[side],ly=layers(kind(),side);await ly.p;
 const d=D[side]={file:blob,url,img,w:img.naturalWidth,h:img.naturalHeight,x:ly.def[0],y:ly.def[1],sw:ly.def[2],r:0,st:stats(img),orig:old?old.orig:null};
 if(keepPlace&&old){d.x=old.x;d.y=old.y;d.r=old.r;d.sw=old.sw/old.w*d.w}
 if(old&&old.url!==(old.orig&&old.orig.url))URL.revokeObjectURL(old.url);return true}
async function setFile(side,f){if(!f)return;
 if(f.type!=='image/png'&&!/\.png$/i.test(f.name))return say(side,'Only PNG files are accepted. Please export your design as PNG.','bad');
 if(f.size>MAXB)return say(side,`File is too large (${(f.size/1048576).toFixed(1)} MB). Maximum is 10 MB.`,'bad');
 if(f.size<1024)return say(side,'This file looks empty. Please choose another PNG.','bad');
 if(!await isPng(f))return say(side,'This is not a valid PNG file.','bad');
 const u0=URL.createObjectURL(f);let im;try{im=await loadURL(u0)}catch(e){URL.revokeObjectURL(u0);return say(side,'We could not read this image. Please try another PNG.','bad')}
 const wh=[im.naturalWidth,im.naturalHeight];let blob=f,trimmed=false;
 try{const sc=srcCanvas(im),bb=bbox(sc);if(bb&&(bb[2]*bb[3])/(sc.width*sc.height)<.97){const c=document.createElement('canvas');c.width=bb[2];c.height=bb[3];c.getContext('2d').drawImage(sc,bb[0],bb[1],bb[2],bb[3],0,0,bb[2],bb[3]);blob=await toBlob(c);trimmed=true}}catch(e){}
 const prev=D[side];if(prev){if(prev.orig)URL.revokeObjectURL(prev.orig.url);if(prev.url!==(prev.orig&&prev.orig.url))URL.revokeObjectURL(prev.url);D[side]=null}
 const ok=await setBlob(side,blob);if(!ok){URL.revokeObjectURL(u0);return say(side,'We could not read this image. Please try another PNG.','bad')}
 D[side].orig={file:f,url:u0,w:wh[0],h:wh[1]};
 touch(side);const low=Math.min(...wh)<800,d=D[side];
 say(side,d.st.hasAlpha?`✓ ${side==='front'?'Front':'Back'} design added — ${wh[0]}×${wh[1]}px.${trimmed?' Empty edges trimmed.':''}${low?' Tip: a higher-resolution PNG prints sharper.':''}`:'This PNG has no transparent background — the whole picture will print. Tap ✂ Crop → "Remove white background" if needed.',d.st.hasAlpha&&!low?'ok':'warn')}
function clear(side){const d=D[side];if(d){if(d.orig)URL.revokeObjectURL(d.orig.url);if(d.url!==(d.orig&&d.orig.url))URL.revokeObjectURL(d.url)}D[side]=null;touch(side);say(side,'')}
/* ---------- stage interaction: move / resize / rotate ---------- */
SIDES.forEach(side=>{const p=panel(side),inp=$('input[type=file]',p),st=$('.stage',p),box=$('.box',p);
 inp.onchange=()=>{setFile(side,inp.files[0]);inp.value=''};$('.rep',p).onclick=()=>inp.click();$('.rm',p).onclick=()=>clear(side);$('.crop',p).onclick=()=>openCrop(side);
 const setS=v=>{const d=D[side];if(!d)return;d.sw=clamp(v/100,.04,1.4);touch(side)};
 $('.rs',p).oninput=e=>setS(+e.target.value);$$('[data-s]',p).forEach(b=>b.onclick=()=>setS(+b.dataset.s));
 $('.rr',p).oninput=e=>{const d=D[side];if(!d)return;d.r=+e.target.value;touch(side)};
 $('.rc',p).onclick=()=>{const d=D[side],ly=layers(kind(),side);if(d){d.x=ly.def[0];d.y=ly.def[1];d.r=0;touch(side)}};
 let drag=null;
 const rect=()=>st.getBoundingClientRect();
 box.addEventListener('pointerdown',e=>{const d=D[side];if(!d)return;const h=e.target.dataset.h,r=rect(),cx=r.left+d.x*r.width,cy=r.top+d.y*r.height;e.preventDefault();box.setPointerCapture(e.pointerId);
  drag={mode:h?(h==='rot'?'rot':'size'):'move',sx:e.clientX,sy:e.clientY,ox:d.x,oy:d.y,sw:d.sw,cx,cy,d0:Math.hypot(e.clientX-cx,e.clientY-cy)||1};box.classList.add('act')});
 box.addEventListener('pointermove',e=>{if(!drag)return;const d=D[side],r=rect();
  if(drag.mode==='move'){d.x=clamp(drag.ox+(e.clientX-drag.sx)/r.width,.02,.98);d.y=clamp(drag.oy+(e.clientY-drag.sy)/r.height,.02,.98)}
  else if(drag.mode==='size'){d.sw=clamp(drag.sw*Math.hypot(e.clientX-drag.cx,e.clientY-drag.cy)/drag.d0,.04,1.4)}
  else{let a=Math.atan2(e.clientY-drag.cy,e.clientX-drag.cx)*180/Math.PI+90;if(a>180)a-=360;if(Math.abs(a)<4)a=0;d.r=a}
  touch(side)});
 ['pointerup','pointercancel'].forEach(ev=>box.addEventListener(ev,()=>{drag=null;box.classList.remove('act')}));
 st.addEventListener('wheel',e=>{const d=D[side];if(!d)return;e.preventDefault();d.sw=clamp(d.sw*(e.deltaY<0?1.05:.95),.04,1.4);touch(side)},{passive:false});
 ['dragenter','dragover'].forEach(ev=>p.addEventListener(ev,e=>{e.preventDefault();p.classList.add('drag')}));['dragleave','drop'].forEach(ev=>p.addEventListener(ev,e=>{e.preventDefault();p.classList.remove('drag')}));p.addEventListener('drop',e=>setFile(side,e.dataTransfer.files[0]));
 st.addEventListener('click',e=>{if(!D[side]&&!e.target.closest('.btn'))inp.click()});
});
addEventListener('resize',()=>SIDES.forEach(layoutOv));
/* ---------- text / name printing (renders text to a transparent PNG, then uses the normal design pipeline) ---------- */
async function textBlob(str,font,color){try{await document.fonts.load(`200px "${font}"`,str)}catch(e){}
 let S=320;const m=document.createElement('canvas').getContext('2d');m.font=`${S}px "${font}"`;let w=m.measureText(str).width;if(w>3800){S=Math.floor(S*3800/w);m.font=`${S}px "${font}"`;w=m.measureText(str).width}
 const t=m.measureText(str),asc=Math.ceil(t.actualBoundingBoxAscent||S*.8),dsc=Math.ceil(t.actualBoundingBoxDescent||S*.2),l=Math.ceil(t.actualBoundingBoxLeft||0),r=Math.ceil(t.actualBoundingBoxRight||w),pad=24;
 const c=document.createElement('canvas');c.width=l+r+pad*2;c.height=asc+dsc+pad*2;const x=c.getContext('2d');x.font=`${S}px "${font}"`;x.fillStyle=color;x.textBaseline='alphabetic';x.fillText(str,pad+l,pad+asc);return toBlob(c)}
const autoCol=()=>{const[r,g,b]=hexRgb(G.color);return lumOf(r,g,b)>.35?'#111111':'#ffffff'};
async function applyText(side){const p=panel(side),str=$('.tin',p).value.trim(),font=$('.tf.on',p).dataset.f,color=$('.tpick',p).value;
 if(!str)return;
 const blob=await textBlob(str,font,color),old=D[side],keep=!!(old&&old.text);
 if(!await setBlob(side,blob,keep))return;
 const d=D[side],u=URL.createObjectURL(blob);if(old&&old.orig)URL.revokeObjectURL(old.orig.url);
 d.orig={file:blob,url:u,w:d.w,h:d.h};d.text={str,font,color};
 if(!keep){d.sw=Math.min(d.sw,Math.max(.14,Math.min(.5,d.w/d.h*.12)))}
 touch(side);say(side,`✓ Text added — drag, resize or rotate it on the shirt.`,'ok')}
function openText(side){const p=panel(side),d=D[side];
 if(d&&!d.text&&!confirm('This will replace your uploaded design with text. Continue?'))return;
 const c=autoCol();$('.tpick',p).value=c;$$('.tsw button',p).forEach(b=>b.classList.toggle('on',b.dataset.c===c));
 $('.tin',p).value='';$('.tx',p).hidden=false;$('.addtx',p).hidden=true;$('.tin',p).focus();say(side,'Type your name or text below.','')}
SIDES.forEach(side=>{const p=panel(side),tin=$('.tin',p);let tm=0;const go=()=>{clearTimeout(tm);tm=setTimeout(()=>applyText(side),250)};
 $('.addtx',p).onclick=()=>openText(side);
 tin.addEventListener('input',()=>{$$('.tf',p).forEach(b=>b.textContent=tin.value.trim()||'Name');go()});
 $('.tfonts',p).onclick=e=>{const b=e.target.closest('.tf');if(!b)return;$$('.tf',p).forEach(x=>x.classList.toggle('on',x===b));go()};
 $('.tsw',p).onclick=e=>{const b=e.target.closest('button');if(!b)return;$('.tpick',p).value=b.dataset.c;$$('.tsw button',p).forEach(x=>x.classList.toggle('on',x===b));go()};
 $('.tpick',p).addEventListener('input',()=>{$$('.tsw button',p).forEach(x=>x.classList.remove('on'));go()})});
/* ---------- crop tool ---------- */
const C={side:null,src:null,r:{x:0,y:0,w:0,h:0},asp:0,drag:null};
const cImg=$('#cImg'),cRect=$('#cRect'),cIn=$('#cIn');
const cDims=()=>({w:cImg.clientWidth,h:cImg.clientHeight});
function cPaint(){const r=C.r;Object.assign(cRect.style,{left:r.x+'px',top:r.y+'px',width:r.w+'px',height:r.h+'px'})}
function cFull(){const{w,h}=cDims();C.r={x:0,y:0,w,h};cPaint()}
function cShow(){cImg.src=C.src.toDataURL('image/png');cImg.onload=()=>{cFull();if(C.asp)cAspect(C.asp)}}
function openCrop(side){const d=D[side];if(!d)return;C.side=side;C.src=srcCanvas(d.img);$('#cm').classList.add('on');cShow()}
function cAspect(a){C.asp=a;const{w,h}=cDims();if(!a){cFull();return}let rw=w,rh=w/a;if(rh>h){rh=h;rw=h*a}C.r={x:(w-rw)/2,y:(h-rh)/2,w:rw,h:rh};cPaint()}
$('#cAsp').onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('#cAsp button').forEach(x=>x.classList.toggle('on',x===b));cAspect(+b.dataset.a)};
cRect.addEventListener('pointerdown',e=>{e.preventDefault();cRect.setPointerCapture(e.pointerId);C.drag={h:e.target.dataset.h||'move',sx:e.clientX,sy:e.clientY,r:{...C.r}}});
cRect.addEventListener('pointermove',e=>{const g=C.drag;if(!g)return;const{w:W0,h:H0}=cDims(),dx=e.clientX-g.sx,dy=e.clientY-g.sy;let{x,y,w,h}=g.r;const mn=24;
 if(g.h==='move'){x=clamp(x+dx,0,W0-w);y=clamp(y+dy,0,H0-h)}
 else{let x0=x,y0=y,x1=x+w,y1=y+h;const hh=g.h;if(hh.includes('l'))x0=clamp(x0+dx,0,x1-mn);if(hh.includes('r'))x1=clamp(x1+dx,x0+mn,W0);if(hh.includes('t'))y0=clamp(y0+dy,0,y1-mn);if(hh.includes('b'))y1=clamp(y1+dy,y0+mn,H0);
  if(C.asp&&hh.length===2){let nw=x1-x0,nh=nw/C.asp;if(hh.includes('t'))y0=y1-nh;else y1=y0+nh;if(y0<0){y0=0;nh=y1-y0;nw=nh*C.asp;if(hh.includes('l'))x0=x1-nw;else x1=x0+nw}if(y1>H0){y1=H0;nh=y1-y0;nw=nh*C.asp;if(hh.includes('l'))x0=x1-nw;else x1=x0+nw}}
  x=x0;y=y0;w=x1-x0;h=y1-y0}
 C.r={x,y,w,h};cPaint()});
['pointerup','pointercancel'].forEach(v=>cRect.addEventListener(v,()=>C.drag=null));
$('#cTrim').onclick=()=>{const bb=bbox(C.src);if(!bb)return tip('Nothing to trim');const{w,h}=cDims(),k=w/C.src.width;C.r={x:bb[0]*k,y:bb[1]*k,w:bb[2]*k,h:bb[3]*k};cPaint()};
$('#cWhite').onclick=()=>{const x=C.src.getContext('2d'),im=x.getImageData(0,0,C.src.width,C.src.height),d=im.data;for(let i=0;i<d.length;i+=4){const mn=Math.min(d[i],d[i+1],d[i+2]);if(mn>236)d[i+3]=0;else if(mn>205)d[i+3]=Math.min(d[i+3],Math.round((236-mn)/31*255))}x.putImageData(im,0,0);const r={...C.r};cImg.src=C.src.toDataURL('image/png');cImg.onload=()=>{C.r=r;cPaint()};tip('White background removed')};
$('#cReset').onclick=()=>{const d=D[C.side];if(!d||!d.orig)return;loadURL(d.orig.url).then(im=>{C.src=srcCanvas(im);cShow()})};
$('#cApply').onclick=async()=>{const side=C.side,d=D[side];if(!d)return;const{w,h}=cDims(),kx=C.src.width/w,ky=C.src.height/h,r=C.r;
 const sx=Math.round(r.x*kx),sy=Math.round(r.y*ky),sw=Math.max(1,Math.round(r.w*kx)),sh=Math.max(1,Math.round(r.h*ky)),c=document.createElement('canvas');c.width=sw;c.height=sh;c.getContext('2d').drawImage(C.src,sx,sy,sw,sh,0,0,sw,sh);
 const blob=await toBlob(c),orig=d.orig,old=d;const ok=await setBlob(side,blob,false);if(!ok)return tip('Could not crop');const n=D[side];n.orig=orig;n.x=old.x;n.y=old.y;n.r=old.r;n.sw=clamp(old.sw*sw/C.src.width,.04,1.4);
 $('#cm').classList.remove('on');touch(side);say(side,'✓ Design cropped','ok')};
$('#cm').onclick=e=>{if(e.target.id==='cm'||e.target.hasAttribute('data-x'))$('#cm').classList.remove('on')};
/* ---------- print x colour match score ---------- */
const hueD=(a,b)=>{const d=Math.abs(a-b)%360;return d>180?360-d:d};
function evalDesign(d,hex,ly){const g=hexRgb(hex),LG=lumOf(...g),[gh,gs]=rgbHsv(...g),P=d.st.P;let vis=0,ws=0,hx=0,hy=0,hw=0;
 for(const[L,h,s,v,a]of P){const cr=(Math.max(L,LG)+.05)/(Math.min(L,LG)+.05);vis+=a*clamp((cr-1.25)/1.75,0,1);ws+=a;if(s>.28&&v>.2){const k=a*s;hx+=Math.cos(h*Math.PI/180)*k;hy+=Math.sin(h*Math.PI/180)*k;hw+=k}}
 const V=ws?vis/ws:0;let Hm=1,hnote='';
 if(gs>.22&&ws&&hw/ws>.04){const ph=(Math.atan2(hy,hx)*180/Math.PI+360)%360,dd=hueD(ph,gh);Hm=dd>=110?1:dd>=60?.8:dd>=25?.65:.5;if(Hm<=.65)hnote='print and shirt colours are too similar in tone'}
 let Sz=1,snote='';const w=d.sw/.5; /* print width relative to garment width */
 if(d.sw<.14){Sz=clamp(d.sw/.14,.35,1);snote='print is quite small'}else if(d.sw>.5){Sz=clamp(1-(d.sw-.5)*1.6,.35,1);snote='print is very large'}
 if(ly&&ly.zone){const[x0,y0,x1,y1]=ly.zone,cx=d.x*W,cy=d.y*H;if(cx<x0-40||cx>x1+40||cy<y0-50||cy>y1+60){Sz*=.7;snote='print is placed outside the usual print area'}}
 const sc=Math.round(100*(.65*V+.2*Hm+.15*Sz));return{sc,V,Hm,Sz,note:V<.5?'a large part of the print blends into this colour':V<.75?'some darker/lighter parts of the print will fade':hnote||snote||''}}
const tier=p=>p>=88?['Excellent match','#33d17a']:p>=75?['Looks great','#7bd33a']:p>=60?['Good','#d6c52a']:p>=45?['Weak — will fade','#f0902a']:['Poor — barely visible','#ff4d55'];
let sct=0;function scheduleScore(){cancelAnimationFrame(sct);sct=requestAnimationFrame(updateScores)}
function updateScores(){const res={};let tot=0,n=0;
 SIDES.forEach(s=>{const d=D[s],m=$('.mt',panel(s));m.hidden=!d;if(!d)return;const r=evalDesign(d,G.color,layers(kind(),s));res[s]=r;tot+=r.sc;n++;const[l,c]=tier(r.sc);$('.mp',m).textContent=r.sc+'%';$('.ml',m).textContent=l;$('.mbar i',m).style.cssText=`width:${r.sc}%;background:${c}`;$('.mp',m).style.color=c;$('.mw',m).textContent=r.note?'Note: '+r.note+'.':'Print and colour work well together.'});
 const all=$('#mAll');all.hidden=!n;if(!n)return;const avg=Math.round(tot/n),[l,c]=tier(avg);all.style.setProperty('--p',avg);all.style.setProperty('--c',c);$('#mRing b').textContent=avg+'%';
 $('#mSum').innerHTML=`<b style="color:${c}">${l}</b> — your design will look about <b>${avg}%</b> good on <b>${G.cname}</b> (${100-avg}% risk of it looking off).`;
 const alt=SWATCH.map(([nm,h])=>{let t=0;SIDES.forEach(s=>{if(D[s])t+=evalDesign(D[s],h,layers(kind(),s)).sc});return[nm,h,Math.round(t/n)]}).filter(x=>x[1]!==G.color).sort((a,b)=>b[2]-a[2]).slice(0,5);
 $('#mSug').innerHTML=alt[0]&&alt[0][2]>avg+3?'<span>Better colours for this design:</span>'+alt.filter(x=>x[2]>avg).map(([nm,h,p])=>`<button type="button" class="sug" data-h="${h}" title="${nm}"><i style="background:${h}"></i>${nm} ${p}%</button>`).join(''):'<span>This colour is among the best for your design 👌</span>'}
$('#mSug').onclick=e=>{const b=e.target.closest('.sug');if(b)setColor(b.dataset.h)};
/* ---------- WhatsApp hand-off (mockup image travels with the message) ---------- */
/* ---------- price + delivery (garment price + custom print, delivery by petrol distance) ---------- */
const dUnit=()=>((CFG.pricing||{})[G.type]||0)+((CFG.pricing||{}).custom||0);
let dFee=null,dTok=0,dKm=null,dBusy=false;
const dQ=()=>clamp(+$('#dQty').value||1,1,50),dMoney=n=>CFG.currency+' '+Number(n).toLocaleString();
function dUpd(){const a=$('#dAddr').value.trim(),q=dQ(),sub=dUnit()*q,delTxt=dBusy?'Calculating…':dFee!=null?dMoney(dFee)+(dKm?` (~${dKm} km)`:''):a?'To be confirmed':'Enter address';
 $('#dPrice').innerHTML=`<div><span>${gName()} · custom print × ${q}</span><b>${dMoney(sub)}</b></div><div><span>Delivery</span><b>${delTxt}</b></div><div class="cot"><span>Total</span><b>${dMoney(sub+(dFee||0))}${dFee==null&&a&&!dBusy?' + delivery':''}</b></div>`}
const dCalc=(window.debounce||((f,ms)=>{let t;return(...x)=>{clearTimeout(t);t=setTimeout(()=>f(...x),ms)}}))(async()=>{const a=$('#dAddr').value.trim();dFee=null;dKm=null;if(a.length<6){dBusy=false;return dUpd()}
 const my=++dTok;dBusy=true;dUpd();let r=null;try{r=await deliveryFor(a)}catch(e){}if(my!==dTok)return;dBusy=false;if(r){dFee=r.fee;dKm=r.km}dUpd()},800);
$('#dAddr').addEventListener('input',()=>{dBusy=true;dUpd();dCalc()});$('#dQty').addEventListener('input',dUpd);
document.addEventListener('click',e=>{if(e.target.closest('#gType,#gSleeve'))setTimeout(dUpd,0)});dUpd();
const pos=d=>`${Math.round(d.sw/.5*100)}% of garment width${Math.abs(d.r)>1?', rotated '+Math.round(d.r)+'°':''}`;
function message(links){const q=clamp(+$('#dQty').value||1,1,50),n=$('#dNote').value.trim(),lines=[];
 SIDES.forEach(s=>{const d=D[s];lines.push(`${s==='front'?'Front':'Back'} design: ${d?'yes — '+(d.text?`text "${d.text.str}" (${d.text.font}, ${d.text.color}) `:'')+'print '+pos(d)+', match '+evalDesign(d,G.color,layers(kind(),s)).sc+'%':'not included'}`)});
 let t=`Hello AniDrip, I would like a custom print.\nGarment: ${gName()}\nColour: ${G.cname} (${G.color})\n${lines.join('\n')}\nSize: ${$('#dSize').value} | Quantity: ${q}${n?'\nNotes: '+n:''}\nPrice: ${dMoney(dUnit()*q)}\nDelivery: ${dFee!=null?dMoney(dFee):'to be confirmed ('+dMoney((CFG.delivery||{}).min||0)+' – '+dMoney((CFG.delivery||{}).max||550)+')'}\nTotal: ${dMoney(dUnit()*q+(dFee||0))}${dFee==null?' + delivery':''}\nAddress: ${$('#dAddr').value.trim()||'—'}`;
 if(links)t+=`\n\nMy design preview: ${links.mock}${links.f?'\nFront PNG: '+links.f:''}${links.b?'\nBack PNG: '+links.b:''}`;else t+='\n\n(My design image is attached below.)';return t}
async function composite(){const sides=SIDES.filter(s=>D[s]),cv=document.createElement('canvas');cv.width=W*sides.length;cv.height=H+120;const c=cv.getContext('2d');
 const g=c.createLinearGradient(0,0,cv.width,cv.height);g.addColorStop(0,'#0b0b0c');g.addColorStop(1,'#1d0b0e');c.fillStyle=g;c.fillRect(0,0,cv.width,cv.height);
 const rg=c.createRadialGradient(cv.width*.85,0,0,cv.width*.85,0,cv.width*.6);rg.addColorStop(0,'rgba(229,9,20,.28)');rg.addColorStop(1,'rgba(229,9,20,0)');c.fillStyle=rg;c.fillRect(0,0,cv.width,cv.height);
 sides.forEach((s,i)=>{paint(c,s,i*W,0);c.fillStyle='rgba(255,255,255,.85)';c.font='700 26px Manrope,Arial,sans-serif';c.textAlign='left';c.fillText(s.toUpperCase(),i*W+34,50)});
 const sc=sides.map(s=>evalDesign(D[s],G.color,layers(kind(),s)).sc),avg=Math.round(sc.reduce((a,b)=>a+b,0)/sc.length);
 c.fillStyle='#fff';c.font='700 30px Manrope,Arial,sans-serif';c.textAlign='left';c.fillText(`AniDrip Custom · ${gName()} · ${G.cname}`,34,H+56);
 c.fillStyle='#bbb';c.font='500 24px Manrope,Arial,sans-serif';c.fillText(`Colour ${G.color} · Size ${$('#dSize').value} × ${clamp(+$('#dQty').value||1,1,50)} · Print match ${avg}%`,34,H+94);
 return{jpg:await toBlob(cv,'image/jpeg',.92),png:await toBlob(cv,'image/png')}}
async function upload(blob,name,type){const S=CFG.supabase||{};if(!S.url||!S.anonKey)return null;const path=`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}/${name}`;
 const h={'Content-Type':type,'x-upsert':'false',apikey:S.anonKey};if(S.anonKey.startsWith('eyJ'))h.Authorization='Bearer '+S.anonKey;
 const ctl=new AbortController();setTimeout(()=>ctl.abort(),25000);const r=await fetch(`${S.url}/storage/v1/object/designs/${path}`,{method:'POST',headers:h,body:blob,signal:ctl.signal});if(!r.ok)throw new Error('upload '+r.status);return`${S.url}/storage/v1/object/public/designs/${path}`}
const dlBlob=(blob,name)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)};
let job=0,LAST=null;
$('#dSend').onclick=async()=>{if(!D.front&&!D.back)return tip('Please upload your front and/or back PNG design first.');if(!$('#dAddr').value.trim())return tip('Please enter your delivery address.');
 const my=++job,wm=$('#wm');LAST=null;$('#wTitle').textContent='Preparing your design…';$('#wGar').innerHTML=`<b>${gName()}</b> · ${G.cname}`;$('#wMock').removeAttribute('src');$('#wSpin').hidden=false;$('#wSt').textContent='';$('#waOpen').hidden=true;$('#dlM').hidden=true;wm.classList.add('on');
 let out;try{out=await composite()}catch(e){$('#wSpin').hidden=true;$('#wTitle').textContent='Something went wrong';$('#wSt').textContent='We could not build the preview image. Please try again.';return}
 if(my!==job)return;const murl=URL.createObjectURL(out.jpg);$('#wMock').src=murl;$('#wSpin').hidden=true;$('#dlM').href=murl;$('#dlM').hidden=false;
 LAST={out,file:new File([out.jpg],'anidrip-custom-design.jpg',{type:'image/jpeg'}),links:null};
 $('#wTitle').textContent='Your design is ready ✓';$('#waOpen').hidden=false;
 const hasSB=CFG.supabase&&CFG.supabase.url&&CFG.supabase.anonKey;
 if(hasSB){$('#waOpen').disabled=true;$('#wSt').textContent='Getting your order ready…';try{const L={mock:await upload(out.jpg,'mockup.jpg','image/jpeg')};for(const sd of SIDES)if(D[sd])L[sd[0]]=await upload((D[sd].orig&&D[sd].orig.file)||D[sd].file,`${sd}.png`,'image/png');LAST.links=L}catch(e){LAST.links=null}if(my!==job)return;$('#waOpen').disabled=false;$('#wSt').textContent=''}};
/* Drop Your Order: image link + text go straight to OUR WhatsApp number (never a share sheet) */
async function hostFree(blob,name='anidrip-design.jpg',type='image/jpeg'){const f=new FormData();f.append('file',new File([blob],name,{type}));const ctl=new AbortController();setTimeout(()=>ctl.abort(),20000);
 const r=await fetch('https://tmpfiles.org/api/v1/upload',{method:'POST',body:f,signal:ctl.signal});if(!r.ok)throw 0;const j=await r.json(),u=j&&j.data&&j.data.url;if(!u)throw 0;return u.replace('http://','https://').replace('tmpfiles.org/','tmpfiles.org/dl/')}
$('#waOpen').onclick=async()=>{if(!LAST)return;const b=$('#waOpen'),{out}=LAST;let links=LAST.links;
 /* open the tab first (inside the click) so phones don't block it, then fill the address */
 const w=window.open('about:blank','_blank');b.disabled=true;$('#wSt').textContent='Sending your design…';
 if(!links){try{links={mock:await hostFree(out.jpg)};for(const sd of SIDES)if(D[sd]){const src=(D[sd].orig&&D[sd].orig.file)||D[sd].file;try{links[sd[0]]=await hostFree(src,`anidrip-${sd}-design.png`,'image/png')}catch(e){}}LAST.links=links}catch(e){links=null}}
 b.disabled=false;$('#wSt').textContent='';
 let url;if(links)url=waURL(message(links));else{url=waURL(message(null));try{await navigator.clipboard.write([new ClipboardItem({'image/png':out.png})]);tip('Image copied — paste it in the chat')}catch(e){dlBlob(out.jpg,'anidrip-custom-design.jpg');tip('Image saved — attach it in the chat')}}
 if(w)w.location.href=url;else location.href=url};
$('#wm').onclick=e=>{if(e.target.id==='wm'||e.target.hasAttribute('data-x')){job++;$('#wm').classList.remove('on')}};
/* ---------- init ---------- */
if(!CFG.whatsapp)console.warn('[AniDrip] config.js: whatsapp number is empty.');
drawShirts();setColor('#151515');
})();
