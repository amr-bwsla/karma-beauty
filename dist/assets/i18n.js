(() => {
 'use strict';
 const cfg=window.KARMA_CONFIG||{};
 const dictionary=cfg.translations||{};
 let language=window.KarmaBoot?.language||'en';
 if(!window.KarmaBoot){try { const saved=localStorage.getItem('karma-language');language=['en','ar'].includes(saved)?saved:/(?:^|;\s*)karma_language=ar(?:;|$)/.test(document.cookie)?'ar':'en'; } catch { language=/(?:^|;\s*)karma_language=ar(?:;|$)/.test(document.cookie)?'ar':'en'; }}
 const originals=new WeakMap(), attributes=new WeakMap();
 const attrs=['aria-label','alt','title','placeholder'];
 const ignored='script,style,noscript,textarea,[data-no-translate]';
 const western=s=>s.replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/٬/g,',').replace(/٫/g,'.');
 function translate(raw) {
  const key=raw.trim();
  if(!key)return raw;
  let out=dictionary[key];
  if(out===undefined){
   let match;
   if((match=key.match(/^بتشاهدي (\d+) من (\d+) منتج$/)))out=`Showing ${match[1]} of ${match[2]} products`;
   else if((match=key.match(/^نتائج البحث \((\d+)\)$/)))out=`Search results (${match[1]})`;
   else if((match=key.match(/^نتائج البحث عن «(.*)»$/)))out=`Results for “${match[1]}”`;
   else if((match=key.match(/^أهلًا يا (.*)$/)))out=`Welcome, ${match[1]==='صديقة كارما'?'Karma friend':match[1]}`;
   else if((match=key.match(/^(إضافة إلى|إزالة من) المفضلة: (.*)$/)))out=`${match[1]==='إضافة إلى'?'Add to':'Remove from'} favorites: ${translate(match[2])}`;
   else if((match=key.match(/^(عرض|تقليل كمية|زيادة كمية|الشحن إلى) (.*)$/))){const labels={'عرض':'View','تقليل كمية':'Decrease quantity of','زيادة كمية':'Increase quantity of','الشحن إلى':'Shipping to'};out=labels[match[1]]+' '+translate(match[2]);}
   else if((match=key.match(/^الحجم: (.*)$/)))out='Size: '+translate(match[1]);
   else if((match=key.match(/^([\d.]+) (مل|جم)$/)))out=match[1]+' '+(match[2]==='مل'?'ml':'g');
   else if((match=key.match(/^([\d٠-٩٬٫,.]+) ج\.م\.(.*)$/)))out='EGP '+western(match[1])+(match[2]?translate(match[2]):'');
   else if((match=key.match(/^خصم (.*)$/)))out=match[1]==='الترحيب'?'Welcome discount':'Discount '+match[1];
   else if((match=key.match(/^المدة التقديرية: (.*?) أيام عمل من تأكيد الطلب\.$/)))out='Estimated delivery: '+match[1]+' business days from confirmation.';
   else if((match=key.match(/^توصيل تقديري: القاهرة (.*?) أيام عمل · باقي المحافظات (.*?) أيام عمل\.$/)))out='Estimated delivery: Cairo '+match[1]+' business days · Elsewhere '+match[2]+' business days.';
   else if(key.includes(' · '))out=key.split(' · ').map(translate).join(' · ');
   else if((match=key.match(/^·\s*(.*)$/)))out='· '+translate(match[1]);
   else if((match=key.match(/^([23]–[35]) أيام عمل$/)))out=match[1]+' business days';
  }
  if(out===undefined)return raw;
  return raw.replace(key,out);
 }
 function applyText(node){
  if(node.parentElement?.closest(ignored))return;
  const current=node.nodeValue;
  const previous=originals.get(node);
  const source=previous&&current===previous.last?previous.source:current;
  const next=language==='en'?translate(source):source;
  originals.set(node,{source,last:next});
  if(current!==next)node.nodeValue=next;
 }
 function applyElement(el){
  const blocked=el.closest(ignored);
  if(blocked && (blocked!==el || !el.matches('textarea')))return;
  let records=attributes.get(el);if(!records){records={};attributes.set(el,records);}
  for(const attr of attrs){
   if(!el.hasAttribute(attr))continue;
   const current=el.getAttribute(attr),previous=records[attr];
   const source=previous&&current===previous.last?previous.source:current;
   const next=language==='en'?translate(source):source;
   records[attr]={source,last:next};
   if(current!==next)el.setAttribute(attr,next);
  }
 }
 function localize(root){
  if(root.nodeType===Node.TEXT_NODE){applyText(root);return;}
  if(root.nodeType!==Node.ELEMENT_NODE)return;
  const selfIgnored=root.matches(ignored);
  if(selfIgnored && !root.matches('textarea'))return;
  applyElement(root);
  if(selfIgnored)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  while(walker.nextNode()){const node=walker.currentNode;if(node.nodeType===Node.TEXT_NODE)applyText(node);else applyElement(node);}
 }
 function syncLocale(){
  document.documentElement.lang=language;
  document.documentElement.dir=language==='ar'?'rtl':'ltr';
  if(cfg.mode!=='woocommerce')document.title=language==='en'?'Karma Beauty — Naturally you':'Karma Beauty — جمالك على طبيعتك';
  document.querySelector('meta[name="description"]')?.setAttribute('content',language==='en'?'Your little space for care and beauty. Discover Karma skincare, makeup, haircare and bodycare.':'كارما بيوتي — مساحتك الصغيرة للعناية والجمال. اكتشفي العناية بالبشرة والمكياج والشعر والجسم.');
  document.querySelectorAll('.announcement-group').forEach(el=>el.dir=language==='ar'?'rtl':'ltr');
  document.querySelectorAll('[data-language-toggle]').forEach(button=>{
   button.textContent=language==='en'?'ع':'EN';
   button.lang=language==='en'?'ar':'en';
   button.setAttribute('aria-label',language==='en'?'Switch to Arabic':'التبديل إلى الإنجليزية');
  });
 }
 const observer=new MutationObserver(records=>{
  observer.disconnect();
  const roots=new Set();
  for(const record of records){
   if(record.type==='childList')record.addedNodes.forEach(node=>roots.add(node));
   else roots.add(record.target);
  }
  roots.forEach(localize);
  observe();
 });
 function observe(){observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrs});}
 function setLanguage(next){
  if(!['en','ar'].includes(next))return;
  language=next;
  try{localStorage.setItem('karma-language',language);}catch{/* Cookie provides a fallback. */}
  document.cookie='karma_language='+language+';path=/;max-age=31536000;SameSite=Lax';
  observer.disconnect();syncLocale();localize(document.body);observe();
  if(cfg.mode==='woocommerce')location.reload();
 }
 window.KarmaI18n={get language(){return language;},translate,setLanguage,refresh:()=>localize(document.body)};
 syncLocale();localize(document.body);observe();
 window.KarmaBoot?.ready();
 document.addEventListener('click',event=>{if(event.target.closest('[data-language-toggle]'))setLanguage(language==='en'?'ar':'en');});
})();
