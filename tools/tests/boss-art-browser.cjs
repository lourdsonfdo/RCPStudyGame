const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
 try{
  const context=await browser.newContext();
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const base=process.env.TEST_BASE_URL||'http://127.0.0.1:8876/RCPStudyGame/';
  await page.goto(base);await page.locator('.academy.active').waitFor();
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(async()=>{const c=await caches.open('rcp-study-v21-boss-art');const keys=await c.keys();return keys.filter(k=>k.url.includes('/img/bosses/')).length===57;},null,{timeout:60000});
  await page.reload();await page.locator('.academy.active').waitFor();
  async function go(screen,ctx){
   await page.evaluate(({screen,ctx})=>App.goto(screen,ctx),{screen,ctx});
   await page.locator(`[data-screen="${screen}"].active`).waitFor();await page.waitForTimeout(100);
   await page.waitForFunction(()=>[...document.querySelectorAll('.screen.active img.boss-art')].every(i=>i.complete&&i.naturalWidth===384));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),screen+' overflow');
  }
  for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:900});
   for(const course of ['rcp103','rcp104','rcp201','rcp202','rcp203']){
    await go('boss-select',{course});
    const expected=await page.evaluate(c=>ALL_BOSSES.filter(b=>b.course===c).length,course);
    assert.equal(await page.locator('.screen.active .boss-art').count(),expected);
   }
   for(const bossId of ['copd','m201-s04','m202-s03','m203-s05']){
    const course=await page.evaluate(id=>ALL_BOSSES.find(b=>b.id===id).course,bossId);
    for(const screen of ['prep-camp','battle']){
     await go(screen,{course,bossId});
     assert.equal(await page.locator('.screen.active .boss-art').count(),1);
    }
   }
   await go('superboss-briefing',{});assert.equal(await page.locator('.screen.active .boss-art').count(),1);
   console.log('PASS portrait screens at',width);
  }
  await page.setViewportSize({width:390,height:900});await go('battle',{course:'rcp202',bossId:'m202-s03'});
  await page.evaluate(()=>Fx.bossHit(document.querySelector('#boss-portrait')));
  assert.ok(await page.locator('#boss-portrait').evaluate(e=>e.classList.contains('fx-bosshit')));
  await page.waitForTimeout(500);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('#boss-portrait').evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{App.getState().settings.academyMotionPaused=true;App.refresh();});
  assert.equal(await page.locator('#boss-portrait').evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.evaluate(()=>{const boss=ALL_BOSSES.find(b=>b.id==='m203-s05');const session=Battle.start({boss,playerMaxHp:100,equipped:[],questionPool:ALL_QUESTIONS.filter(q=>q.course===boss.course&&boss.questionTopics.includes(q.topic)),state:App.getState()});session.outcome='victory';App.goto('results',{session,lvlInfo:{leveledUp:false},course:boss.course,bossId:boss.id});});
  await page.locator('[data-screen="results"].active .boss-art').waitFor();
  assert.match(await page.locator('.screen.active .boss-art').getAttribute('src'),/m203-s05/);
  await context.setOffline(true);await page.reload();await page.locator('.academy.active').waitFor();
  for(const course of ['rcp103','rcp104','rcp201','rcp202','rcp203'])await go('boss-select',{course});
  await go('superboss-briefing',{});
  if(process.env.PREVIEW_DIR){
   await context.setOffline(false);fs.mkdirSync(process.env.PREVIEW_DIR,{recursive:true});
   for(const [screen,ctx,label] of [['boss-select',{course:'rcp202'},'boss-grid'],['prep-camp',{course:'rcp202',bossId:'m202-s03'},'oxygenator'],['superboss-briefing',{},'titan']]){
    await go(screen,ctx);await page.waitForTimeout(1200);await page.screenshot({path:`${process.env.PREVIEW_DIR}/sprite-${label}.png`,fullPage:true});
   }
  }
  assert.deepEqual(errors,[]);console.log('PASS 57 offline portraits, hit FX, paused/reduced motion and victory portrait');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
