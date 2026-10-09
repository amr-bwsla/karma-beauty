import fs from 'node:fs/promises';
const url='https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap';
const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36'}});
if(!response.ok)throw new Error('Font CSS could not be fetched');
let css=await response.text();
const urls=[...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m=>m[1]))];
await fs.mkdir('assets/fonts',{recursive:true});
for(const [i,remote] of urls.entries()){
 const res=await fetch(remote);if(!res.ok)throw new Error('Font file could not be fetched');
 const ext=remote.includes('.woff2')?'woff2':'ttf';
 const file=`fonts/karma-font-${i}.${ext}`;
 await fs.writeFile(`assets/${file}`,Buffer.from(await res.arrayBuffer()));
 css=css.replaceAll(remote,file);
}
await fs.writeFile('assets/fonts.css',css);
const main=await fs.readFile('assets/style.css','utf8');
await fs.writeFile('assets/style.css',main.replace(/^.*\r?\n/,"@import url('./fonts.css');\n"));
await fs.writeFile('assets/fonts/SOURCES.txt','Fonts: Manrope and Tajawal. Distributed under the SIL Open Font License.\nSources: https://github.com/google/fonts/tree/main/ofl/manrope\nhttps://github.com/google/fonts/tree/main/ofl/tajawal\n');
for(const family of ['manrope','tajawal']){
 const r=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`);
 if(r.ok)await fs.writeFile(`assets/fonts/LICENSE-${family}.txt`,await r.text());
}
console.log(`Saved ${urls.length} local font files.`);
