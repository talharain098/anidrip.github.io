/* Loads products from Supabase (if configured in config.js) before the site starts; falls back to products.js */
(async()=>{
  const S=(window.ANIDRIP||{}).supabase||{};
  if(S.url&&S.anonKey){
    try{
      const ctl=new AbortController();setTimeout(()=>ctl.abort(),4000);
      const r=await fetch(`${S.url}/rest/v1/products?select=data&order=sort.asc`,{headers:S.anonKey.startsWith('eyJ')?{apikey:S.anonKey,Authorization:'Bearer '+S.anonKey}:{apikey:S.anonKey},signal:ctl.signal});
      if(r.ok){const rows=await r.json();if(Array.isArray(rows)&&rows.length)PRODUCTS.splice(0,PRODUCTS.length,...rows.map(x=>x.data))}
    }catch(e){}
  }
  const s=document.createElement('script');s.src='script.js';document.body.appendChild(s);
})();
