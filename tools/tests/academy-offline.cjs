const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
 try {
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.TEST_BASE_URL || 'http://127.0.0.1:8873/RCPStudyGame/');await page.locator('.academy.active').waitFor();
 await page.waitForFunction(()=>navigator.serviceWorker.controller,{},{timeout:30000});
 const cache=await page.evaluate(async()=>{const name=(await caches.keys()).find(k=>k.startsWith('rcp-study-'));if(!name)return 0;const c=await caches.open(name);return (await c.keys()).length});assert.ok(cache>=57);console.log('Precache assets',cache);
 await page.evaluate(()=>{const s=App.getState();s.gold=250;s.inventory.healthPotion=3;s.equipped=['healthPotion'];App.persist();App.goto('battle',{course:'rcp103',bossId:'copd'});});
 await page.locator('[data-screen="battle"].active').waitFor();
 const saved=await page.evaluate(()=>JSON.stringify(App.getState().battleRun));
 const inventory=await page.evaluate(()=>JSON.stringify(App.getState().inventory));
 const home=async()=>{await page.evaluate(()=>App.goto('home'));await page.locator('.academy.active').waitFor();await page.waitForTimeout(450);};
 await home();await page.locator('[data-action="study"]').click();await page.locator('[data-screen="training"].active').waitFor();
 assert.equal(await page.evaluate(()=>JSON.stringify(App.getState().battleRun)),saved);assert.equal(await page.evaluate(()=>JSON.stringify(App.getState().inventory)),inventory);
 await home();await page.locator('[data-action="resume"]').click();await page.locator('[data-screen="battle"].active').waitFor();
 assert.equal(await page.evaluate(()=>JSON.stringify(App.getState().battleRun)),saved);assert.equal(await page.evaluate(()=>JSON.stringify(App.getState().inventory)),inventory);
 await home();await page.evaluate(()=>{const s=App.getState();s.dailyChallenge.bossId='asthma';s.dailyChallenge.course='rcp103';s.dailyChallenge.completed=false;App.refresh();});
 await page.locator('[data-action="daily"]').click();await page.locator('dialog[open]').waitFor();assert.match(await page.locator('.ac-dialog-sub').textContent(),/replaces your saved battle/);await page.locator('[data-close]').click();
 assert.equal(await page.evaluate(()=>JSON.stringify(App.getState().battleRun)),saved);
 for(const course of ['rcp103','rcp104']){await page.locator(`[data-course="${course}"]`).click();await page.locator('[data-screen="course-mode"].active').waitFor();await home();}
 for(const [action,screen] of [['titan','superboss-briefing'],['survival','survival'],['settings','settings']]){await page.locator(`[data-action="${action}"]`).click();await page.locator(`[data-screen="${screen}"].active`).waitFor();await home();}
 await page.getByRole('button',{name:'Boss Arena',exact:true}).click();await page.locator('dialog [data-pick="rcp104"]').click();await page.locator('[data-screen="boss-select"].active').waitFor();await page.locator('[data-screen="boss-select"] [data-boss-id]').first().click();await page.locator('[data-screen="prep-camp"].active').waitFor();await home();
 await page.evaluate(()=>{const s=App.getState();s.topicStats.abg={correct:1,total:7};App.persist();App.refresh();});assert.match(await page.locator('#ac-next-title').textContent(),/ABG/);
 await page.reload();await page.locator('.academy.active').waitFor();assert.equal(await page.evaluate(()=>JSON.stringify(App.getState().battleRun)),saved);assert.equal(await page.evaluate(()=>App.getState().gold),250);
 await context.setOffline(true);await page.reload({waitUntil:'load'});await page.locator('.academy.active').waitFor();
 assert.ok(await page.locator('.ac-scene img').evaluate(img=>img.complete&&img.naturalWidth>0));
 await page.locator('[data-action="study"]').click();await page.locator('[data-screen="training"].active').waitFor();assert.equal(await page.locator('[data-screen="training"] .ans-btn').count(),4);
 assert.equal(await page.evaluate(()=>JSON.stringify(App.getState().battleRun)),saved);
 assert.deepEqual(errors,[]);console.log('PASS: saved battle and items preserved, daily replacement confirmation, all main destinations, weakest-topic recommendation, persistent state, cached artwork and offline study.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
