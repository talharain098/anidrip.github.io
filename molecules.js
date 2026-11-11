/* AniDrip molecule footer: tiny glowing white + red particles forming "AniDrip".
   Hover scatters them, leaving brings them back. */
(()=>{
const cv=document.getElementById('molC');if(!cv)return;const cx=cv.getContext('2d'),RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
let W,H,dpr,P=[],run=false,raf=0,mx=-9999,my=-9999,R=90,built=false,allRed=false,cT=0,cx0=0,cy0=0,rippling=false;
function build(){
  const box=cv.parentElement.getBoundingClientRect();W=Math.max(280,Math.round(box.width));
  dpr=Math.min(devicePixelRatio||1,2);R=Math.max(55,Math.min(100,W*.08));
  const FF="800 100px Unbounded,'Arial Black',sans-serif",m=document.createElement('canvas').getContext('2d');m.font=FF;
  const tw=Math.min(W*.88,1000),base=m.measureText('Ani').width+m.measureText('Drip').width,fs=100*tw/base;
  H=Math.round(Math.min(360,Math.max(130,fs*1.5)));cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
  const o=document.createElement('canvas');o.width=W;o.height=H;const c=o.getContext('2d');
  c.font="800 "+fs+"px Unbounded,'Arial Black',sans-serif";const w1=c.measureText('Ani').width,w2=c.measureText('Drip').width;
  c.textBaseline='middle';const x0=(W-w1-w2)/2,y0=H/2;
  c.fillStyle='#fff';c.fillText('Ani',x0,y0);c.fillStyle='#e50914';c.fillText('Drip',x0+w1,y0);
  const d=c.getImageData(0,0,W,H).data,step=W<600?2:3;P=[];
  for(let y=0;y<H;y+=step)for(let x=0;x<W;x+=step){const i=(y*W+x)*4;if(d[i+3]>140){const red=d[i]>200&&d[i+1]<90;
    P.push({hx:x+(Math.random()-.5)*step*.6,hy:y+(Math.random()-.5)*step*.6,x:x,y:y,vx:0,vy:0,r:.42+Math.random()*.4,base:red,red:allRed||red,k:.05+Math.random()*.05})}}
  built=true;draw()}
function draw(){cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,W,H);
  for(const col of [0,1]){cx.fillStyle=col?'#ff2b38':'#ffffff';cx.beginPath();for(const p of P)if(p.red===!!col)cx.rect(p.x-p.r,p.y-p.r,p.r*2,p.r*2);cx.fill()}}
function tick(){
  const R2=R*R,now=performance.now();let moving=false;
  if(rippling){let left=false;for(const p of P){const tgt=allRed?true:p.base;if(p.red!==tgt){if(now-cT>Math.hypot(p.hx-cx0,p.hy-cy0)*.9)p.red=tgt;else left=true}}if(!left)rippling=false;else moving=true}
  for(const p of P){
    const dx=p.x-mx,dy=p.y-my,d2=dx*dx+dy*dy;
    if(d2<R2){const d=Math.sqrt(d2)||1,f=(1-d/R)*(1-d/R)*5;p.vx+=dx/d*f+(Math.random()-.5)*.5;p.vy+=dy/d*f+(Math.random()-.5)*.5}
    p.vx+=(p.hx-p.x)*p.k;p.vy+=(p.hy-p.y)*p.k;p.vx*=.84;p.vy*=.84;p.x+=p.vx;p.y+=p.vy;
    if(Math.abs(p.vx)>.02||Math.abs(p.vy)>.02||Math.abs(p.hx-p.x)>.05||Math.abs(p.hy-p.y)>.05)moving=true}
  draw();if(moving||mx>-999)raf=requestAnimationFrame(tick);else raf=0}
function kick(){if(!raf&&run&&!RM)raf=requestAnimationFrame(tick)}
function pos(e){const r=cv.getBoundingClientRect();mx=(e.clientX-r.left)*(W/r.width);my=(e.clientY-r.top)*(H/r.height);kick()}
function leave(){mx=my=-9999;kick()}
cv.addEventListener('pointermove',pos,{passive:true});
cv.addEventListener('pointerdown',pos,{passive:true});
cv.addEventListener('pointerleave',leave);cv.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')leave()});cv.addEventListener('pointercancel',leave);
new IntersectionObserver(es=>{run=es[0].isIntersecting;if(run&&built)kick()},{rootMargin:'100px'}).observe(cv);
(document.fonts&&document.fonts.load?document.fonts.load("800 80px Unbounded").catch(()=>{}).then(()=>document.fonts.ready):Promise.resolve()).then(build);
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(build,250)});
})();
