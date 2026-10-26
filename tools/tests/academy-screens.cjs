const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});
 try {
 const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400 && /\.webp(?:\?|$)/.test(r.url())) errors.push('Artwork failed: '+r.url());});
 await page.goto(process.env.TEST_BASE_URL||'http://127.0.0.1:8873/RCPStudyGame/');await page.locator('.academy.active').waitFor();
 await page.evaluate(()=>{localStorage.setItem('rcpsg_music_hinted','1');if (location.search.includes('xl')){App.getState().settings.textSize='xl';App.applyTextSize('xl');}});
 const screens=['course-mode','boss-select','prep-camp','training','battle','scenario-select','crisis','results','outcome','settings','survival','review-answers','superboss-briefing','superboss','level-up'];
 for(const width of (process.env.WIDTHS || '320,390,768,1440').split(',').map(Number)){
 await page.setViewportSize({width,height:900});
 for(const id of screens){
 await page.evaluate(id=>{
  const boss=ALL_BOSSES.find(b=>b.id==='copd');const scenario=ALL_SCENARIOS.find(s=>s.course==='rcp103');
  const ctx={course:'rcp103',bossId:boss.id,scenarioId:scenario.id,lvlInfo:{leveledUp:false},oldLevel:1,newLevel:2};
  if(id==='results'){ctx.session=Battle.start({boss,playerMaxHp:100,equipped:[],isDaily:false,questionPool:ALL_QUESTIONS.filter(q=>q.course===boss.course&&boss.questionTopics.includes(q.topic)),state:App.getState()});ctx.session.outcome='victory';}
  if(id==='outcome'){ctx.session=Crisis.start(scenario);ctx.session.outcome='stabilized';}
  if(id==='review-answers'){const q=ALL_QUESTIONS.find(q=>q.course==='rcp103');ctx.answers=[{q:q.q,choices:q.choices,chose:(q.correct+1)%4,correctIdx:q.correct,isCorrect:false,explanation:q.explanation,topic:q.topic}];}
  App.goto(id,ctx);
 },id);
 await page.locator(`[data-screen="${id}"].active`).waitFor();await page.waitForTimeout(500);
 const dims=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth}));assert.ok(dims.scroll<=width,`${id} at ${width}: ${JSON.stringify(dims)}`);
 if(width===390 && process.env.PREVIEW_DIR) await page.screenshot({path:require('node:path').join(process.env.PREVIEW_DIR,`world-${id}.png`),fullPage:true});
 assert.ok(await page.locator('.screen.active.acsc').count(),id+' must use academy theme');
 }
 console.log('All screens fit',width);
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{App.getState().settings.academyMotionPaused=true;App.goto('battle',{course:'rcp103',bossId:'copd'});});
 await page.locator('[data-screen="battle"].active').waitFor();await page.waitForTimeout(600);
 assert.equal(await page.locator('.screen.active .arena').evaluate(el=>getComputedStyle(el,'::before').animationName),'none');
 assert.match(await page.locator('.screen.active .arena').evaluate(el=>getComputedStyle(el).backgroundImage),/academy-room/);
 const boxes=await page.evaluate(()=>['.quick-settings-mini','.screen.active .back-btn'].map(sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {top:r.top,bottom:r.bottom};}));assert.ok(boxes[0].top>=boxes[1].bottom,'Text control must not cover Back');
 await page.evaluate(()=>App.goto('training',{course:'rcp103',bossId:'copd',studyCount:2}));
 await page.locator('[data-screen="training"].active').waitFor();await page.waitForTimeout(600);
 const first=page.locator('.screen.active .ans-btn').first();await first.click();
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.screen.active .ans-btn.correct')).backgroundColor==='rgb(23, 73, 56)');
 const feedback=await page.locator('.screen.active .ans-btn.correct').evaluate(el=>getComputedStyle(el).backgroundColor);
 assert.equal(feedback,'rgb(23, 73, 56)','correct answers retain green feedback');
 await page.locator('#nextq').click();assert.ok(await page.locator('.screen.active.acsc .ans-btn').count());
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.evaluate(()=>{App.getState().settings.academyMotionPaused=false;App.goto('battle',{course:'rcp103',bossId:'copd'});});
 await page.locator('[data-screen="battle"].active').waitFor();await page.waitForTimeout(600);
 assert.equal(await page.locator('.screen.active .arena').evaluate(el=>getComputedStyle(el,'::before').animationName),'none');
 assert.deepEqual(errors,[]);console.log('PASS: secondary screen layouts, scenery, saved/reduced motion, answer feedback and rerenders');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
