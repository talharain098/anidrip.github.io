const $=s=>document.querySelector(s),C=(window.ANIDRIP||{}).supabase||{};let sb,rows=[],edit=null,form={};
const say=(t,ok)=>{const m=$('#am');m.textContent=t;m.className='msg'+(ok?' ok':'')};
if(!C.url||!C.anonKey){$('#setup').style.display='grid'}
else{sb=supabase.createClient(C.url,C.anonKey);sb.auth.getSession().then(({data})=>data.session?start():$('#login').style.display='grid')}
$('#go').onclick=async()=>{const{error}=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});if(error)$('#lm').textContent=error.message;else{$('#login').style.display='none';start()}};
$('#out').onclick=async()=>{await sb.auth.signOut();location.reload()};
async function start(){$('#app').style.display='grid';await load()}
async function load(){const{data,error}=await sb.from('products').select('*').order('sort',{ascending:true});if(error)return say(error.message);rows=data;draw();stats()}
function draw(){$('#rows').innerHTML=rows.length?rows.map((r,i)=>`<tr><td><img src="${r.data.image||''}"></td><td>${r.data.name}${(r.data.brand==='Anime'||r.data.brand==='NMA')?' <b style="color:#e50914">· Anime</b>':''}</td><td>${r.data.category||''}</td><td><input type="number" data-p="${i}" value="${r.data.price??''}"></td><td><input type="number" data-s="${i}" value="${r.data.sale??''}" placeholder="none"></td><td><input type="checkbox" data-nw="${i}" ${r.data.isNew?'checked':''} style="width:auto;transform:scale(1.3)"></td><td class="acts"><button data-sv="${i}">Save price</button><button class="g" data-ed="${i}">Edit</button><button class="r" data-dl="${i}">Delete</button></td></tr>`).join(''):'<tr><td colspan="7">No products yet. Click "Import current products" or "+ Add product".</td></tr>'}
$('#rows').onchange=async e=>{const i=e.target.dataset.nw;if(i===undefined)return;const r=rows[i],d={...r.data,isNew:e.target.checked},{error}=await sb.from('products').update({data:d}).eq('id',r.id);error?(say(error.message),e.target.checked=!e.target.checked):(r.data=d,say(d.name+(d.isNew?' added to':' removed from')+' New Arrivals',1))};
$('#rows').onclick=async e=>{const t=e.target.dataset;
 if(t.sv!==undefined){const r=rows[t.sv],p=+$(`[data-p="${t.sv}"]`).value,s=$(`[data-s="${t.sv}"]`).value;if(!p)return say('Enter a valid price');
  const d={...r.data,price:p,sale:s===''?null:+s};const{error}=await sb.from('products').update({data:d}).eq('id',r.id);error?say(error.message):(r.data=d,say('Price saved for '+d.name,1))}
 if(t.ed!==undefined)open(rows[t.ed]);
 if(t.dl!==undefined){const r=rows[t.dl];if(!confirm('Delete "'+r.data.name+'"? This cannot be undone.'))return;const{error}=await sb.from('products').delete().eq('id',r.id);error?say(error.message):(say('Deleted',1),load())}};
$('#seed').onclick=async()=>{if(!confirm('Import the '+PRODUCTS.length+' products from products.js? Existing ones with the same id are overwritten.'))return;
 const{error}=await sb.from('products').upsert(PRODUCTS.map((p,i)=>({id:p.id,data:p,sort:i+1})));error?say(error.message):(say('Imported',1),load())};
$('#add').onclick=()=>open(null);
/* ----- form ----- */
const esc=v=>String(v??'').replace(/"/g,'&quot;');
function imgField(key,label,val){return `<label>${label}<div class="img"><img data-pv="${key}" src="${esc(val)}"><input data-k="${key}" value="${esc(val)}" placeholder="image URL or upload"><label class="up"><span style="background:rgba(255,255,255,.08);padding:.55rem .9rem;border-radius:10px;cursor:pointer;color:#eee">Upload</span><input type="file" accept="image/*" data-up="${key}"></label></div></label>`}
function open(r){edit=r;const d=r?r.data:{name:'',category:'Hoodies',price:'',sale:null,desc:'',image:'',model:'',sizes:['S','M','L','XL'],link:'#',featured:false,isNew:true,colors:[]};form=JSON.parse(JSON.stringify(d));form.colors=form.colors||[];renderForm();$('#modal').classList.add('on')}
function renderForm(){const d=form;$('#form').innerHTML=`<h2>${edit?'Edit product':'Add product'}</h2>
<div class="row"><label>Name<input data-k="name" value="${esc(d.name)}"></label><label>Category<input data-k="category" list="cats" value="${esc(d.category)}"><datalist id="cats"><option>Shirts<option>Hoodies<option>Sweatshirts</datalist></label></div>
<div class="row"><label>Price (PKR)<input data-k="price" type="number" value="${esc(d.price)}"></label><label>Sale price (optional)<input data-k="sale" type="number" value="${esc(d.sale)}"></label></div>
<label>Description<textarea data-k="desc" rows="2">${esc(d.desc)}</textarea></label>
<label>Sizes (comma separated)<input data-k="sizes" value="${esc((d.sizes||[]).join(', '))}"></label>
${imgField('image','Main picture',d.image)}${imgField('model','Model / hover picture (optional)',d.model)}
<div class="chk"><label><input type="checkbox" data-k="featured" ${d.featured?'checked':''}>Best seller</label><label><input type="checkbox" data-k="isNew" ${d.isNew?'checked':''}>New arrival</label><label><input type="checkbox" data-k="nma" ${d.brand==='Anime'||d.brand==='NMA'?'checked':''}>Show in Anime section</label></div>
<h3 style="margin:.4rem 0 0;color:var(--red)">Colours (optional)</h3>
${d.colors.map((c,i)=>`<div class="col"><div class="row"><label>Colour name<input data-c="${i}" data-ck="name" value="${esc(c.name)}"></label><label>Colour<input type="color" data-c="${i}" data-ck="hex" value="${c.hex||'#111111'}" style="height:38px;padding:2px"></label></div>${imgField('c'+i+'.image','Picture in this colour',c.image)}${imgField('c'+i+'.model','Hover picture',c.model)}<button class="r" data-rc="${i}">Remove colour</button></div>`).join('')}
<button class="g" id="addc">+ Add colour</button>
<div class="msg" id="fm"></div><div class="acts"><button id="sv">Save product</button><button class="g" id="cl">Cancel</button></div>`}
function setKey(k,v){const m=k.match(/^c(\d+)\.(image|model)$/);m?form.colors[m[1]][m[2]]=v:form[k]=v}
function sync(){$('#form').querySelectorAll('[data-k]').forEach(el=>{if(el.type==='file')return;let v=el.type==='checkbox'?el.checked:el.value;if(el.dataset.k==='sizes')v=v.split(',').map(x=>x.trim()).filter(Boolean);else if(['price','sale'].includes(el.dataset.k))v=v===''?null:+v;if(el.dataset.k==='nma'){if(v)form.brand='Anime';else delete form.brand;return}setKey(el.dataset.k,v)});
 $('#form').querySelectorAll('[data-c]').forEach(el=>form.colors[el.dataset.c][el.dataset.ck]=el.value)}
async function shrink(file){const bmp=await createImageBitmap(file),sc=Math.min(1,1600/Math.max(bmp.width,bmp.height)),cv=document.createElement('canvas');cv.width=bmp.width*sc;cv.height=bmp.height*sc;cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);return new Promise(r=>cv.toBlob(r,'image/jpeg',.88))}
$('#form').onchange=async e=>{const k=e.target.dataset.up;if(!k)return;const f=e.target.files[0];if(!f)return;$('#fm').textContent='Uploading…';
 try{sync();const blob=await shrink(f),name=Date.now()+'-'+f.name.replace(/[^a-z0-9]/gi,'_')+'.jpg',{error}=await sb.storage.from('product-images').upload(name,blob,{contentType:'image/jpeg'});if(error)throw error;
  setKey(k,sb.storage.from('product-images').getPublicUrl(name).data.publicUrl);renderForm();$('#fm').textContent='Uploaded ✓'}catch(err){$('#fm').textContent=err.message||'Upload failed'}};
$('#form').onclick=async e=>{const id=e.target.id,t=e.target.dataset;
 if(id==='cl')$('#modal').classList.remove('on');
 if(id==='addc'){sync();form.colors.push({name:'',hex:'#111111',image:'',model:''});renderForm()}
 if(t.rc!==undefined){sync();form.colors.splice(t.rc,1);renderForm()}
 if(id==='sv'){sync();if(!form.name||!form.price||!form.image)return $('#fm').textContent='Name, price and main picture are required';
  form.colors=form.colors.filter(c=>c.name&&c.image);if(!form.colors.length)delete form.colors;
  const pid=edit?edit.id:(form.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+Math.random().toString(36).slice(2,6));form.id=pid;
  const sort=edit?edit.sort:(Math.max(0,...rows.map(r=>r.sort||0))+1);
  const{error}=await sb.from('products').upsert({id:pid,data:form,sort});if(error)return $('#fm').textContent=error.message;
  $('#modal').classList.remove('on');say('Saved '+form.name,1);load()}};

/* ----- real stats (computed only from the products table) ----- */
function stats(){const d=rows.map(r=>r.data);$('#sT').textContent=d.length;$('#sN').textContent=d.filter(x=>x.isNew).length;$('#sB').textContent=d.filter(x=>x.featured).length;$('#sS').textContent=d.filter(x=>x.sale!=null).length;$('#sC').textContent=new Set(d.map(x=>x.category)).size}
document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-v]').forEach(x=>x.classList.toggle('on',x===b));document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!=='v-'+b.dataset.v)});
