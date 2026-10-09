import fs from 'node:fs/promises';
await fs.mkdir('assets/payments',{recursive:true});
const sources=[['fawry.png','https://www.fawry.com/wp-content/uploads/2023/05/fawry-Logo.png'],['visa.svg','https://cdn.simpleicons.org/visa/1434CB'],['mastercard.svg','https://cdn.simpleicons.org/mastercard/EB001B'],['paymob.png','https://d24lr4zqs1tgqh.cloudfront.net/ef979edc-3c2f-4e9d-9f33-dede34eb26fe.png']];
for(const [name,url] of sources){
 const r=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error(name+': '+r.status);let bytes=Buffer.from(await r.arrayBuffer());if(name==='visa.svg')bytes=Buffer.from(bytes.toString().replace('viewBox="0 0 24 24"','viewBox="0 7.5 24 9"'));if(name==='mastercard.svg')bytes=Buffer.from(bytes.toString().replace('viewBox="0 0 24 24"','viewBox="0 4 24 16"'));await fs.writeFile('assets/payments/'+name,bytes);console.log(name);
}
await fs.writeFile('assets/payments/SOURCES.md','# Payment marks\n\nBrand trademarks belong to their owners. Displayed as proposed payment options; no active processing or partnership is implied.\n\n'+sources.map(([name,url])=>`- ${name}: ${url}`).join('\n')+'\nPaymob source page: https://developers.paymob.com/paymob-docs/integration-paths/plugins/wordpress\nVisa and Mastercard vectors from Simple Icons (CC0 icon collection; brand trademark rights remain).\n');
const footer=await fs.readFile('theme/template-parts/site-footer.php','utf8');await fs.writeFile('theme/template-parts/site-footer.php',footer.replaceAll('payments/paymob.svg','payments/paymob.png'));
const style=await fs.readFile('assets/style.css','utf8');await fs.writeFile('assets/style.css',style.replaceAll("'DM Sans'","'Manrope'"));
