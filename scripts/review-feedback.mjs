import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
const findings={viewports:[],policies:{},errors:[],failed:[]};
page.on('pageerror',e=>findings.errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)findings.failed.push(r.url());});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
await page.locator('img').evaluateAll(async imgs=>Promise.all(imgs.map(i=>{i.loading='eager';return i.decode();})));
for(const width of [320,390,533,768,1001,1440]){
 await page.setViewportSize({width,height:900});
 await page.locator('.ritual').screenshot({path:`qa/ritual-printed-${width}.png`,animations:'disabled'});
 findings.viewports.push(await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,heroHeight:document.querySelector('.hero').getBoundingClientRect().height,ritualImageHeight:document.querySelector('.ritual-image').getBoundingClientRect().height,aboutHeight:document.querySelector('#about').getBoundingClientRect().height,unnamedDialogs:[...document.querySelectorAll('dialog')].filter(e=>!e.hasAttribute('aria-labelledby')&&!e.hasAttribute('aria-label')).map(e=>e.id)})));
 if(width===533){await page.locator('.hero').screenshot({path:'qa/hero-without-ribbon-mobile.png',animations:'disabled'});}
}
for(const policy of ['shipping','returns','privacy']){
 await page.locator(`[data-policy="${policy}"]`).click();
 findings.policies[policy]=await page.locator('#info-content').innerText();
 await page.keyboard.press('Escape');
}
findings.catalog=await page.evaluate(()=>({count:KARMA_CONFIG.products.length,mode:KARMA_CONFIG.mode,productsWithIngredients:KARMA_CONFIG.products.filter(p=>p.ingredients).length,productsWithDirections:KARMA_CONFIG.products.filter(p=>p.directions).length}));
await fs.writeFile('qa/feedback-review.json',JSON.stringify(findings,null,2));
console.log(JSON.stringify(findings,null,2));
await browser.close();
