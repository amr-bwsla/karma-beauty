import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const browser=await chromium.launch({channel:'chrome',headless:true});
const checks=[];
for(const scenario of [{name:'first visit',lang:'en'},{name:'saved Arabic',saved:'ar',lang:'ar'},{name:'saved English',saved:'en',cookie:'ar',lang:'en'},{name:'cookie fallback',cookie:'ar',lang:'ar'},{name:'unavailable storage',blocked:true,cookie:'ar',lang:'ar'}]){
 const context=await browser.newContext({viewport:{width:870,height:668}});
 if(scenario.cookie)await context.addCookies([{name:'karma_language',value:scenario.cookie,url:'http://127.0.0.1:4173/'}]);
 await context.addInitScript(s=>{
  if(s.saved)localStorage.setItem('karma-language',s.saved);
  if(s.blocked)Object.defineProperty(window,'localStorage',{get(){throw Error('Storage disabled');}});
  window.visibleFrames=[];
  const sample=()=>{const hero=document.querySelector('.hero h1');if(hero&&getComputedStyle(hero).visibility==='visible')window.visibleFrames.push({lang:document.documentElement.lang,dir:document.documentElement.dir,text:hero.textContent});requestAnimationFrame(sample);};requestAnimationFrame(sample);
 },scenario);
 const page=await context.newPage();
 let release;const gate=new Promise(resolve=>release=resolve);
 let requested;const hit=new Promise(resolve=>requested=resolve);
 await page.route('**/assets/i18n.js',async route=>{requested();await gate;await route.continue();});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'commit'});await hit;
 await expect(page.locator('html')).toHaveAttribute('lang',scenario.lang);
 await expect(page.locator('body')).toHaveCSS('visibility','hidden');
 assert.deepEqual(await page.evaluate(()=>window.visibleFrames),[]);
 release();await page.waitForLoadState('networkidle');
 await expect(page.locator('body')).toHaveCSS('visibility','visible');
 await expect(page.locator('[data-language-toggle]')).toHaveText(scenario.lang==='en'?'ع':'EN');
 await expect.poll(()=>page.evaluate(()=>window.visibleFrames.length)).toBeGreaterThan(0);
 const frames=await page.evaluate(()=>window.visibleFrames);
 assert.ok(frames.every(f=>f.lang===scenario.lang&&f.dir===(scenario.lang==='en'?'ltr':'rtl')&&(scenario.lang==='en'?!/[\u0600-\u06ff]/.test(f.text):f.text.includes('جمالك'))),scenario.name+' had an incorrect visible frame');
 const seam=await page.locator('.hero-art').evaluate(e=>{const s=getComputedStyle(e,'::after');return {left:s.left,right:s.right,gradient:s.backgroundImage};});
 assert.equal(scenario.lang==='en'?seam.left:seam.right,'0px');
 assert.ok(seam.gradient.includes(scenario.lang==='en'?'to right':'to left'));
 checks.push(scenario.name+': correct first visible language, label and seam');
 await context.close();
}
const page=await browser.newPage({viewport:{width:870,height:668}});
await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
await page.screenshot({path:'qa/en-startup.png',animations:'disabled'});
await page.locator('[data-dismiss-announcement]').click();
await expect(page.locator('.announcement')).toBeHidden();
await expect(page.locator('[data-language-toggle]')).toBeFocused();
await page.reload({waitUntil:'networkidle'});
await expect(page.locator('.announcement')).toBeHidden();
await page.locator('[data-language-toggle]').click();
await expect(page.locator('[data-language-toggle]')).toHaveText('EN');
await expect(page.locator('.announcement')).toBeHidden();
await page.reload({waitUntil:'networkidle'});
await expect(page.locator('html')).toHaveAttribute('lang','ar');
await expect(page.locator('.announcement')).toBeHidden();
await page.screenshot({path:'qa/ar-dismissed.png',animations:'disabled'});
checks.push('dismissal survives reload and language switch; focus preserved');
for(const lang of ['ar','en']){
 if(lang==='en')await page.locator('[data-language-toggle]').click();
 for(const width of [320,648,870,1440]){
  await page.setViewportSize({width,height:668});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const bounds=await page.locator('[data-language-toggle]').boundingBox();assert.equal(bounds.width,32);assert.equal(bounds.height,32);
  if(width===648){const seam=await page.locator('.hero-art').evaluate(e=>{const s=getComputedStyle(e,'::after');return {width:s.width,height:s.height,gradient:s.backgroundImage};});assert.equal(/to (left|right)/.test(seam.gradient),false);assert.equal(seam.width,width+'px');assert.equal(seam.height,'32px');}
 }
}
checks.push('compact 32px toggle and top seam at mobile sizes, both languages');
// The preview owner flag goes through the real build, then always restores it.
const path='assets/store-content.json',original=await fs.readFile(path,'utf8');
try{
 const config=JSON.parse(original);config.announcementEnabled=false;
 await fs.writeFile(path,JSON.stringify(config,null,2)+'\n');execFileSync(process.execPath,['scripts/build.mjs']);
 const fresh=await browser.newPage();await fresh.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 await expect(fresh.locator('.announcement')).toHaveCount(0);await expect(fresh.locator('.site-header')).toBeVisible();await fresh.close();
 const header=await fs.readFile('release/karma-beauty/template-parts/site-header.php','utf8');
 assert.ok(header.includes("if (get_theme_mod('karma_announcement_enabled', true))"));
 checks.push('owner preview flag removes announcement; packaged PHP has independent Customizer gate');
}finally{await fs.writeFile(path,original);execFileSync(process.execPath,['scripts/build.mjs']);}
await browser.close();
await fs.writeFile('qa/startup-results.json',JSON.stringify({passed:true,checks},null,2));
console.log('PASS: first-paint locale, persisted dismissal, owner setting, compact switch and directional seam.');
