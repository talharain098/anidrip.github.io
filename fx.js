/* AniDrip FX: scroll progress, cursor glow, card tilt, screen flash on lightning, shaky intro with real bolts. */
(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* scroll progress */
const prog=$('#prog');addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;prog.style.transform=`scaleX(${h>0?scrollY/h:0})`},{passive:true});
/* cursor glow (fine pointers only) */
const cur=$('#cur');if(matchMedia('(pointer:fine)').matches&&!RM){addEventListener('pointermove',e=>{cur.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;cur.classList.add('on')},{passive:true})}else cur.remove();
/* screen flash on every lightning sound */
const fl=$('#fl');addEventListener('anidrip:zap',e=>{if(RM)return;fl.style.setProperty('--fo',Math.min(.5,.18*(e.detail||1)));fl.classList.remove('on');void fl.offsetWidth;fl.classList.add('on')});
/* ---- intro bolts ---- */
function jag(x0,y0,x1,y1,disp,out,depth=0){if(disp<3){out.push([x1,y1]);return}const mx=(x0+x1)/2+(Math.random()-.5)*disp,my=(y0+y1)/2+(Math.random()-.5)*disp*.4;jag(x0,y0,mx,my,disp/2,out,depth);jag(mx,my,x1,y1,disp/2,out,depth)}
function bolt(x0,y0,x1,y1,branches=3){const main=[[x0,y0]];jag(x0,y0,x1,y1,Math.hypot(x1-x0,y1-y0)*.35,main);const paths=[main];
 for(let i=0;i<branches;i++){const k=Math.floor(main.length*(.2+Math.random()*.6)),[bx,by]=main[k],ang=Math.PI/2+(Math.random()-.5)*1.8,len=90+Math.random()*180,p=[[bx,by]];jag(bx,by,bx+Math.cos(ang)*len,by+Math.sin(ang)*len,len*.4,p);paths.push(p)}return paths}
window.AniIntro={play(){const it=$('#intro'),cv=$('#ibolt');if(!it||!cv)return;const cx=cv.getContext('2d');const sz=()=>{cv.width=innerWidth;cv.height=innerHeight};sz();
  const sym=$('.sym',it);const strikes=[.25,1.0,1.85,2.55];let cur=null;
  const target=()=>{const r=sym.getBoundingClientRect();return[r.left+r.width*(.4+Math.random()*.4),r.top+r.height*(.15+Math.random()*.5)]};
  const fire=(i)=>{const[tx,ty]=target();cur={t0:performance.now(),paths:bolt(tx+(Math.random()-.5)*160,-10,tx,ty,i===2?5:3),dur:i===2?520:340,big:i===2};
   it.classList.remove('shake');void it.offsetWidth;it.classList.add('shake');$('.iflash',it).classList.remove('on');void $('.iflash',it).offsetWidth;$('.iflash',it).classList.add('on');
   if(i>=2){const r=$('.iring',it);r.classList.remove('on');void r.offsetWidth;r.classList.add('on');if(i===2){const r2=$('.iring.r2',it);r2.classList.remove('on');void r2.offsetWidth;r2.classList.add('on')}}
   if(i===3)it.classList.add('glitch')};
  strikes.forEach((s,i)=>setTimeout(()=>{if(it.isConnected)fire(i)},s*1000));
  const draw=()=>{if(!it.isConnected)return;cx.clearRect(0,0,cv.width,cv.height);if(cur){const a=1-(performance.now()-cur.t0)/cur.dur;if(a>0){const fl=Math.random()<.35?.4:1;for(const[w,col,blur,al]of[[16,'rgba(229,9,20,.55)',40,.5],[6,'rgba(255,70,80,.9)',22,.9],[2.4,'#fff',10,1]]){cx.lineWidth=cur.big?w*1.3:w;cx.strokeStyle=col;cx.shadowColor='rgba(229,9,20,1)';cx.shadowBlur=blur;cx.globalAlpha=Math.max(0,a)*al*fl;cx.lineJoin='round';for(const p of cur.paths){cx.beginPath();p.forEach(([x,y],k)=>k?cx.lineTo(x,y):cx.moveTo(x,y));cx.stroke()}}cx.globalAlpha=1}else cur=null}requestAnimationFrame(draw)};draw();addEventListener('resize',sz)}};
})();

/* ---------- bold custom cursor: red dot + ring; click toggles red <-> white; hover grows ring ---------- */
(()=>{if(!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const de=document.documentElement,cd=document.getElementById('cd'),cr=document.getElementById('cr');if(!cd||!cr)return;de.classList.add('ccur');
let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y,vis=false,white=false;
const HOV='a,button,[data-info],.card,.sh,.col,.sw,.cb,.sizes button,label,select,summary,input[type=range],input[type=file]';
addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;if(!vis){vis=true;rx=x;ry=y;de.classList.add('cshow')}
 cd.style.transform=`translate3d(${x}px,${y}px,0)`;const t=e.target.closest&&e.target.closest(HOV);cr.classList.toggle('hv',!!t)},{passive:true});
document.addEventListener('mouseleave',()=>{vis=false;de.classList.remove('cshow')});
addEventListener('pointerdown',()=>cr.classList.add('dn'));addEventListener('pointerup',()=>cr.classList.remove('dn'));
addEventListener('click',e=>{white=!white;de.classList.toggle('cwhite',white);const r=document.createElement('i');r.className='crip';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),600)});
(function loop(){rx+=(x-rx)*.2;ry+=(y-ry)*.2;cr.style.transform=`translate3d(${rx}px,${ry}px,0)`;requestAnimationFrame(loop)})()})();
