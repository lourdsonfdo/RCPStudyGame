const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const output = process.env.PREVIEW_DIR || path.join(require('node:os').tmpdir(), 'rcp-academy-previews');
fs.mkdirSync(output,{recursive:true});
const BASE=process.env.TEST_BASE_URL || 'http://127.0.0.1:8873/RCPStudyGame/';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1100},serviceWorkers:'block'});
 try {
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(BASE); await page.locator('.ac-course').first().waitFor();await page.waitForTimeout(3300);
 await page.screenshot({path:path.join(output,'academy-desktop.png'),fullPage:true});
 console.log('desktop',await page.locator('.ac-main').boundingBox());
 for(const width of [390,320,768]){
  await page.setViewportSize({width,height:844});await page.waitForTimeout(100);
  const dims=await page.evaluate(()=>({w:innerWidth,scroll:document.documentElement.scrollWidth,button:document.querySelector('.ac-primary').getBoundingClientRect().bottom}));
  assert.ok(dims.scroll<=width,JSON.stringify(dims));console.log('layout',width,dims);
  if(width===390) await page.screenshot({path:path.join(output,'academy-mobile.png'),fullPage:true});
 }
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Library',exact:true}).click();
 await page.locator('dialog [data-pick="rcp104"]').click();await page.locator('[data-screen="boss-select"].active').waitFor();
 await page.locator('[data-screen="boss-select"] [data-boss-id]').first().click();await page.locator('[data-screen="training"].active').waitFor();
 assert.equal(await page.locator('[data-screen="training"] .ans-btn').count(),4);
 await page.evaluate(()=>App.goto('home'));await page.locator('.academy.active').waitFor();
 await page.getByRole('button',{name:'Start Study Session'}).click();await page.locator('[data-screen="training"].active').waitFor();
 for(let i=0;i<8;i++){await page.locator('[data-screen="training"] .ans-btn').nth(await page.evaluate(()=>{const text=document.querySelector('[data-screen="training"] .q-text').textContent;const q=ALL_QUESTIONS.find(q=>q.q===text);return [...document.querySelectorAll('[data-screen="training"] .ans-btn')].findIndex(b=>b.textContent.slice(1)!==q.choices[q.correct]);})).click();await page.locator('#nextq').click();}
 await page.getByRole('button',{name:'RETURN TO THE ACADEMY'}).click();await page.locator('.academy.active').waitFor();
 const stats=await page.evaluate(()=>App.getState().topicStats);assert.equal(Object.values(stats).reduce((sum,x)=>sum+x.total,0),8);
 await page.locator('[data-action="review"]').click();await page.locator('[data-screen="training"].active').waitFor();assert.equal(await page.locator('[data-screen="training"] .ans-btn').count(),4);
 await page.evaluate(()=>App.goto('home'));await page.locator('.academy.active').waitFor();
 await page.getByRole('button',{name:'Simulation Lab',exact:true}).click();await page.locator('dialog [data-pick="rcp103"]').click();await page.locator('[data-screen="scenario-select"].active').waitFor();
 await page.evaluate(()=>App.goto('home'));await page.locator('.academy.active').waitFor();
 await page.getByRole('button',{name:'Pause ambience'}).click();await page.reload();await page.locator('.academy-paused').waitFor();
 assert.ok(await page.getByRole('button',{name:'Play ambience'}).count());
 await page.evaluate(()=>{App.getState().settings.textSize='xl';App.persist();App.applyTextSize('xl');App.refresh();});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.screenshot({path:path.join(output,'academy-mobile-xl.png'),fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.ac-dust i').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 console.log('page errors',errors);assert.deepEqual(errors,[]);
 console.log('PASS: responsive layout, library/training, finite session, review, simulation, persisted motion and reduced motion');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
