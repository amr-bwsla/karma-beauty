import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[],missing=new Set();page.on('pageerror',e=>errors.push(e.message));
async function audit(){
 const values=await page.evaluate(()=>{
  const root=document.querySelector('dialog[open]')||document.body, result=[];
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  while(w.nextNode()){
   const n=w.currentNode,p=n.parentElement;
   if(!p||p.closest('script,style,[data-no-translate]')||!p.getClientRects().length)continue;
   if(/[\u0600-\u06ff]/.test(n.nodeValue))result.push(n.nodeValue.trim());
  }
  for(const el of root.querySelectorAll('[aria-label],[alt],[placeholder]')){
   if(el.closest('[data-no-translate]'))continue;
   for(const a of ['aria-label','alt','placeholder'])if(/[\u0600-\u06ff]/.test(el.getAttribute(a)||''))result.push(a+': '+el.getAttribute(a));
  }
  return result;
 });values.filter(Boolean).forEach(v=>missing.add(v));
}
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
await expect(page.locator('html')).toHaveAttribute('lang','en');
await expect(page.locator('html')).toHaveAttribute('dir','ltr');
await audit();
await page.screenshot({path:'qa/english-desktop.png',animations:'disabled'});
await expect(page.locator('.product-card')).toHaveCount(12);
await page.locator('#load-more').click();await expect(page.locator('.product-card')).toHaveCount(20);
for(const id of await page.locator('.product-picture').evaluateAll(es=>es.map(e=>e.dataset.product))){
 await page.locator('.product-picture[data-product="'+id+'"]').click();
 await expect(page.locator('.product-information summary').first()).toHaveText('Ingredients');
 await expect(page.locator('.product-information summary').nth(1)).toHaveText('How to use');
 await audit();
 if(id==='1')await page.locator('#product-dialog').screenshot({path:'qa/english-product.png'});
 await page.keyboard.press('Escape');
}
await page.locator('.product-picture[data-product="14"]').click();
await page.locator('input[name="shade"]').nth(1).check();await page.locator('#detail-qty').fill('2');
await page.locator('[data-detail-add="14"]').click();
await page.locator('[data-action="cart"]').click();
await page.locator('[data-action="checkout"]').click();await audit();
await page.locator('#coupon-code').fill('wrong');await page.locator('#coupon-form button').click();await audit();
await page.locator('#coupon-code').fill('KARMA10');await page.locator('#coupon-form button').click();await audit();
await page.locator('#shipping-governorate').selectOption('القاهرة');
await expect(page.locator('[data-shipping]')).toHaveText('EGP 50');
await expect(page.locator('.cart-item')).toContainText('Mauve');
await audit();
for(const method of ['visa','mastercard','fawry','paymob']){
 await page.locator('input[name="payment"][value="'+method+'"]').check();await audit();
}
await page.locator('[data-action="choose-cod"]').click();
await page.locator('#delivery-address').fill('12 Nile Street, building 4, floor 2, apartment 6');
await page.locator('#contact-phone').fill('01012345678');
await page.locator('[data-action="checkout"]').click();await audit();
await page.keyboard.press('Escape');
await page.locator('[data-action="account"]').first().click();await audit();
await page.locator('[data-action="sample-member"]').click();await audit();
await page.locator('[data-action="use-coupon"]').click();await audit();
await page.locator('[data-action="checkout"]').click();await audit();
await page.keyboard.press('Escape');
await page.locator('[data-action="search"]').click();
await page.locator('#search-input').fill('serum');await audit();
await expect(page.locator('.search-product')).toHaveCount(3);
await page.locator('#search-input').fill('نايت');
await expect(page.locator('.search-product')).toHaveCount(1);
await expect(page.locator('.search-product')).toContainText('Night Dew Serum');
await page.locator('#search-input').fill('zzxx');await audit();
await page.locator('#search-dialog [data-close]').click();
await page.locator('[data-action="menu"]').click();await audit();await page.keyboard.press('Escape');
for(const p of ['shipping','returns','privacy']){
 await page.locator('[data-policy="'+p+'"]').click();await audit();
 if(p==='privacy')await page.locator('#info-dialog').screenshot({path:'qa/english-policy.png'});
 await page.keyboard.press('Escape');
}
const stateBefore=await page.evaluate(()=>({cart:localStorage.getItem('karma-cart-v1'),member:localStorage.getItem('karma-member-v1')}));
console.log('English flow audit:',JSON.stringify([...missing]));
await page.locator('[data-language-toggle]').click();
await expect(page.locator('html')).toHaveAttribute('dir','rtl');
await expect(page.locator('.hero h1')).toContainText('جمالك.');
await page.reload({waitUntil:'networkidle'});
await expect(page.locator('html')).toHaveAttribute('lang','ar');
await page.locator('[data-action="cart"]').click();
await expect(page.locator('.cart-item')).toContainText('موف');await page.keyboard.press('Escape');
await page.locator('[data-language-toggle]').click();
assert.deepEqual(await page.evaluate(()=>({cart:localStorage.getItem('karma-cart-v1'),member:localStorage.getItem('karma-member-v1')})),stateBefore);
await page.reload({waitUntil:'networkidle'});
await expect(page.locator('html')).toHaveAttribute('lang','en');
await page.locator('.category-card img').evaluateAll(async imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode();})));
await page.locator('.category-section').screenshot({path:'qa/english-categories.png',animations:'disabled'});
await page.locator('.shop-bottom').screenshot({path:'qa/english-load-more.png'});
for(const lang of ['en','ar']){
 if(lang==='ar')await page.locator('[data-language-toggle]').click();
 for(const width of [320,390,515,607,648,768,870,1024,1440]){
  await page.setViewportSize({width,height:900});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Overflow '+lang+' '+width);
  if(width===390)await page.screenshot({path:'qa/'+lang+'-mobile.png',animations:'disabled'});
  await page.locator('[data-action="cart"]').click();
  assert.equal(await page.locator('#cart-dialog').evaluate(e=>e.scrollWidth>e.clientWidth),false,'Cart overflow '+lang+' '+width);
  await page.keyboard.press('Escape');
 }
}
await fs.writeFile('qa/i18n-results.json',JSON.stringify({errors,missing:[...missing],statePreserved:true},null,2));
console.log(JSON.stringify({errors,missing:[...missing]},null,2));
await browser.close();
assert.deepEqual(errors,[]);assert.deepEqual([...missing],[]);
