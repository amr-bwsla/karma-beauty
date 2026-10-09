import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:390,height:850}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>localStorage.setItem('karma-language','ar'));
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
const dimensions=await page.locator('.welcome-perk').boundingBox();
assert.ok(dimensions.height<110,'Mobile welcome card must be compact');
await page.locator('.hero').screenshot({path:'qa/compact-welcome-mobile.png',animations:'disabled'});
await page.locator('.welcome-perk button').click();
await expect(page.locator('#member-dialog')).toBeVisible();
await page.keyboard.press('Escape');
await page.locator('[data-action="show-all"]').click();
for(const id of await page.locator('.product-picture').evaluateAll(es=>es.map(e=>e.dataset.product))){
 await page.locator('.product-picture[data-product="'+id+'"]').click();
 await expect(page.locator('.product-information .detail-draft')).toContainText('ليست تركيبة فعلية');
 await expect(page.locator('.product-information details').first().locator('p')).not.toBeEmpty();
 await page.locator('.product-information summary').nth(1).click();
 await expect(page.locator('.product-information li')).toHaveCount(2);
 assert.equal(await page.locator('#product-dialog').evaluate(e=>e.scrollWidth>e.clientWidth),false);
 if(id==='1')await page.locator('.product-information').screenshot({path:'qa/product-ingredients-usage.png'});
 await page.keyboard.press('Escape');
}
for(const policy of ['shipping','returns','privacy']){
 await page.locator('[data-policy="'+policy+'"]').click();
 await expect(page.locator('.policy-draft')).toContainText('مسودة');
 assert.ok(await page.locator('.policy-copy section').count()>=4);
 assert.equal(await page.locator('#info-dialog').evaluate(e=>e.scrollWidth>e.clientWidth),false);
 if(policy==='returns')await expect(page.locator('.policy-source')).toHaveAttribute('href',/cpa.gov.eg/);
 await page.locator('#info-dialog').screenshot({path:'qa/policy-'+policy+'.png'});
 await page.keyboard.press('Escape');
}
await page.locator('[data-add="1"]').click();
await page.locator('[data-action="cart"]').click();
await page.locator('#shipping-governorate').selectOption('القاهرة');
await expect(page.locator('#delivery-estimate')).toContainText('2–3');
await expect(page.locator('[data-shipping]')).toContainText('٥٠');
await page.locator('#shipping-governorate').selectOption('الجيزة');
await expect(page.locator('#delivery-estimate')).toContainText('3–5');
await expect(page.locator('[data-shipping]')).toContainText('١٢٠');
await page.keyboard.press('Escape');
for(const width of [320,390,533,680,768,1440]){
 await page.setViewportSize({width,height:850});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(width<=680)assert.ok((await page.locator('.welcome-perk').boundingBox()).height<110);
}
assert.deepEqual(errors,[]);
await fs.writeFile('qa/draft-content-results.json',JSON.stringify({passed:true,mobileWelcomeHeight:dimensions.height,checks:['20 product ingredient lists and usage steps','draft labeling','mobile signup action preserved','three structured policies','governorate delivery estimates and unchanged shipping prices','320–1440 responsive layout'],errors},null,2));
await browser.close();
console.log('PASS: compact welcome, 20 draft product details, editable policies and delivery estimates.');
