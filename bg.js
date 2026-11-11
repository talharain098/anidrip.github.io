/* Light 2D background: few drifting outlines + thin red lines. No blur/shadow filters, 30fps cap, pauses when tab hidden. */
(()=>{const cv=document.getElementById('bg'),cx=cv.getContext('2d'),RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
let W,H,S=[],L=[],on=true,last=0,sc=0,st;addEventListener('scroll',()=>{sc=1;clearTimeout(st);st=setTimeout(()=>sc=0,140)},{passive:true});
function build(){const d=1;W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;
 const n=W<700?8:14;S=Array.from({length:n},()=>({x:Math.random()*W,y:Math.random()*H,r:8+Math.random()*28,a:Math.random()*6.28,v:.07+Math.random()*.16,k:Math.random()<.5?3:4,o:.14+Math.random()*.16,red:Math.random()<.5}));
 L=Array.from({length:4},()=>({x:Math.random()*W,s:.12+Math.random()*.22,o:.1+Math.random()*.1}))}
function poly(s){cx.beginPath();for(let i=0;i<s.k;i++){const t=s.a+i*6.283/s.k;cx.lineTo(s.x+Math.cos(t)*s.r,s.y+Math.sin(t)*s.r)}cx.closePath()}
function frame(t){if(on&&!sc&&t-last>32){last=t;cx.clearRect(0,0,W,H);cx.lineWidth=1.3;
 for(const l of L){l.x=(l.x+l.s*2)%(W+200);cx.strokeStyle=`rgba(229,9,20,${l.o})`;cx.beginPath();cx.moveTo(l.x-120,0);cx.lineTo(l.x-320,H);cx.stroke()}
 for(const s of S){s.y-=s.v*2;s.a+=.003;if(s.y<-40){s.y=H+40;s.x=Math.random()*W}poly(s);cx.strokeStyle=s.red?`rgba(255,40,50,${s.o+.12})`:`rgba(255,255,255,${s.o*.8})`;cx.stroke()}}
 if(!RM)requestAnimationFrame(frame)}
build();RM?(frame(100),0):requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>on=!document.hidden);
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{build();if(RM)frame(100)},250)})})();
