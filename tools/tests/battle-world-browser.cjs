const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const phase = process.env.TEST_PHASE || 'layouts';
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8876/RCPStudyGame/';
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true });
  try {
    const context = await browser.newContext({ serviceWorkers: phase === 'offline' ? 'allow' : 'block' });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(base);
    await page.waitForFunction(() => window.App && App.getState() && window.BossMotion && window.ALL_BOSSES?.length === 57);
    async function go(screen, ctx) {
      await page.evaluate(({screen,ctx}) => App.goto(screen,ctx), {screen,ctx});
      await page.locator(`[data-screen="${screen}"].active`).waitFor();
      await page.waitForFunction(() => !document.querySelector('.screen-transition'));
    }
    async function battle(course, bossId) {
      await go('battle', {course,bossId});
      await page.locator('.screen.active #boss-portrait[data-motion-ready="true"]').waitFor();
      assert.equal(await page.locator('.screen.active .arena').getAttribute('data-battle-world'),course);
      const bg = await page.locator('.screen.active .arena').evaluate(el => getComputedStyle(el).backgroundImage);
      assert.ok(bg.includes(`/img/arenas/${course}.webp`));
      assert.ok(!bg.includes('academy-room'));
      assert.equal(await page.locator('.screen.active #boss-portrait').evaluate(el => getComputedStyle(el).animationName),'none');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    if (phase === 'layouts') {
      for (const width of [320,390,1440]) {
        await page.setViewportSize({width,height:950});
        for (const course of ['rcp103','rcp104','rcp201','rcp202','rcp203']) {
          const id = await page.evaluate(c => ALL_BOSSES.find(b => b.course === c).id, course);
          await battle(course,id);
        }
        await go('superboss',{});
        await page.locator('.screen.active #boss-portrait[data-motion-ready="true"]').waitFor();
        assert.equal(await page.locator('.screen.active .arena').getAttribute('data-battle-world'),'rcp2xx');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        console.log('PASS six battle worlds at',width);
      }
      if (process.env.PREVIEW_DIR) {
        fs.mkdirSync(process.env.PREVIEW_DIR,{recursive:true});
        await page.setViewportSize({width:390,height:1100});
        for (const [course,bossId] of [['rcp201','m201-s04'],['rcp202','m202-s03'],['rcp203','m203-s05']]) {
          await battle(course,bossId);
          await page.screenshot({path:`${process.env.PREVIEW_DIR}/battle-world-${course}.png`,fullPage:true});
        }
      }
    } else if (phase === 'actions') {
      await page.setViewportSize({width:390,height:1100});
      await battle('rcp202','m202-s03');
      await page.waitForFunction(() => document.querySelector('.screen.active #boss-portrait').dataset.pose === '1');
      async function answer(correct) {
        return page.evaluate(correct => {
          const s = App.getState().battleRun.session;
          const q = Battle.currentQ(s); const index = correct ? q.correct : (q.correct + 1) % q.choices.length;
          const buttons = [...document.querySelectorAll('.screen.active .ans-btn')];
          const before = s.answers.length;
          buttons[index].click(); buttons[(index+1)%buttons.length].click();
          return {before,after:s.answers.length,disabled:buttons.every(b => b.disabled)};
        },correct);
      }
      let result = await answer(false);
      assert.equal(result.after,result.before+1); assert.ok(result.disabled);
      assert.equal(await page.locator('.screen.active #boss-portrait').getAttribute('data-pose'),'2');
      await page.waitForTimeout(400);
      assert.equal(await page.locator('.screen.active #boss-portrait').getAttribute('data-pose'),'3');
      await page.waitForTimeout(400);
      assert.equal(await page.locator('.screen.active #boss-portrait').getAttribute('data-pose'),'5');
      await page.locator('.screen.active .next-q-btn.show').waitFor();
      await page.locator('.screen.active .next-q-btn').click();
      await page.locator('.screen.active #boss-portrait[data-motion-ready="true"]').waitFor();
      result = await answer(true); assert.equal(result.after,result.before+1);
      assert.equal(await page.locator('.screen.active #boss-portrait').getAttribute('data-pose'),'4');
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.waitForFunction(()=>document.querySelector('.screen.active #boss-portrait').dataset.pose==='0');
      assert.equal(await page.locator('.screen.active #boss-portrait').getAttribute('data-pose'),'0');
      await page.evaluate(() => BossMotion.play(document.querySelector('.screen.active #boss-portrait'),'attack'));
      await page.waitForTimeout(450);
      assert.equal(await page.locator('.screen.active #boss-portrait').getAttribute('data-pose'),'0');
      await page.emulateMedia({reducedMotion:'no-preference'});
      await page.evaluate(() => document.body.classList.add('academy-motion-paused'));
      await page.waitForTimeout(50);
      assert.equal(await page.locator('.screen.active #boss-portrait').getAttribute('data-pose'),'0');
      await page.evaluate(() => document.body.classList.remove('academy-motion-paused'));
      await battle('rcp202','m202-s03'); await answer(false);
      await go('home',{}); await page.waitForTimeout(2000);
      assert.equal(await page.locator('.fx-host .fx-bg-dim.on').count(),0);
      assert.equal(await page.locator('.screen:not(.active) [data-motion-ready="true"]').count(),0);
      await page.evaluate(()=>{const start=SuperBoss.startRun;SuperBoss.startRun=function(...args){const run=start(...args);window.__titanTestRun=run;return run}});
      await go('superboss',{});
      await page.locator('.screen.active #boss-portrait[data-motion-ready="true"]').waitFor();
      const titanAnswer=await page.evaluate(() => {const run=window.__titanTestRun;const q=SuperBoss.currentQ(run);const buttons=document.querySelectorAll('.screen.active .ans-btn');buttons[(q.correct+1)%q.choices.length].click();buttons[q.correct].click();return run.answers.length});
      assert.equal(titanAnswer,1);
      await page.waitForTimeout(100);
      assert.ok(await page.locator('.screen.active .ans-btn').evaluateAll(bs => bs.every(b=>b.disabled)));
      assert.equal(await page.locator('.screen.active #boss-portrait').getAttribute('data-pose'),'2');
      await page.waitForTimeout(600);
      assert.ok(await page.locator('.fx-dmg').getByText('-9',{exact:true}).count());
      await page.waitForFunction(()=>document.querySelector('.screen.active .q-label').textContent.includes('QUERY 2'));
      await page.evaluate(()=>{const q=SuperBoss.currentQ(window.__titanTestRun);document.querySelectorAll('.screen.active .ans-btn')[(q.correct+1)%q.choices.length].click()});
      await go('home',{}); await page.waitForTimeout(2000);
      assert.ok(await page.locator('[data-screen="home"]').evaluate(el=>el.classList.contains('active')));
      console.log('PASS drawn idle/attack/hit, answer once, reduced/paused motion and navigation cancellation');
    } else if (phase === 'special') {
      await battle('rcp202','m202-s03');
      async function correctWithStreak(streak) {
        await page.evaluate(streak=>{const s=App.getState().battleRun.session;s.streak=streak;document.querySelectorAll('.screen.active .ans-btn')[Battle.currentQ(s).correct].click()},streak);
      }
      async function next() {
        await page.locator('.screen.active .next-q-btn.show').waitFor();
        await page.locator('.screen.active .next-q-btn').click();
        await page.locator('.screen.active #boss-portrait[data-motion-ready="true"]').waitFor();
      }
      await correctWithStreak(2);
      assert.ok(await page.locator('.ab-name').getByText('LANCE OF LIGHT',{exact:true}).count());
      await page.waitForTimeout(600);
      assert.equal(await page.locator('.screen.active #boss-portrait').getAttribute('data-pose'),'4');
      await next();await correctWithStreak(4);
      await page.waitForTimeout(300);
      assert.equal(await page.locator('.screen.active #boss-portrait').getAttribute('data-pose'),'4');
      await next();
      await page.evaluate(()=>{App.getState().battleRun.session.items.push('shieldRune');App.goto('battle',{course:'rcp202',bossId:'m202-s03',resume:true})});
      await page.locator('.screen.active #boss-portrait[data-motion-ready="true"]').waitFor();
      await page.locator('.screen.active [data-use="shieldRune"]').click();
      await page.locator('.screen.active #boss-portrait[data-motion-ready="true"]').waitFor();
      const shieldHp=await page.evaluate(()=>{const s=App.getState().battleRun.session;const hp=s.playerHp;const q=Battle.currentQ(s);document.querySelectorAll('.screen.active .ans-btn')[(q.correct+1)%q.choices.length].click();return [hp,s.playerHp]});
      assert.equal(shieldHp[0],shieldHp[1]);
      assert.ok(await page.locator('.fx-dmg').getByText('BLOCK!',{exact:true}).count());
      assert.notEqual(await page.locator('.screen.active #boss-portrait').getAttribute('data-pose'),'2');
      await next();
      await page.evaluate(()=>{const s=App.getState().battleRun.session;s.qIndex=s.questions.length-1;s.correctCount=7;s.streak=0;document.querySelectorAll('.screen.active .ans-btn')[Battle.currentQ(s).correct].click()});
      await page.waitForTimeout(2050);
      assert.equal(await page.locator('.screen.active #boss-portrait').getAttribute('data-motion-state'),'defeat');
      await page.locator('.screen.active .next-q-btn.show').waitFor();
      await page.locator('.screen.active .next-q-btn').click();
      await page.locator('[data-screen="results"].active').waitFor();
      assert.equal(await page.locator('.fx-bg-dim.on').count(),0);
      console.log('PASS crit, combo, actual shield, finisher pose and results cleanup');
    } else if (phase === 'fallback') {
      await page.route('**/img/boss-motion/m202-s03.webp',route=>route.abort());
      await go('battle',{course:'rcp202',bossId:'m202-s03'});
      await page.waitForTimeout(300);
      assert.equal(await page.locator('.screen.active [data-motion-ready]').count(),0);
      assert.equal(await page.locator('.screen.active .boss-art').evaluate(el=>getComputedStyle(el).visibility),'visible');
      assert.ok(await page.locator('.screen.active .boss-art').evaluate(el=>el.complete&&el.naturalWidth===384));
      console.log('PASS static image fallback on atlas load failure');
    } else if (phase === 'offline') {
      await page.evaluate(()=>navigator.serviceWorker.ready);
      await page.waitForFunction(async()=>{const c=await caches.open('rcp-study-v22-battle-worlds');const keys=await c.keys();return keys.filter(k=>/\/img\/(boss-motion|arenas)\//.test(k.url)).length===63},null,{timeout:90000});
      await page.reload(); await page.waitForFunction(()=>window.App);
      await context.setOffline(true);
      for(const course of ['rcp103','rcp104','rcp201','rcp202','rcp203']){
        const id=await page.evaluate(c=>ALL_BOSSES.find(b=>b.course===c).id,course);await battle(course,id);
      }
      await go('superboss',{});await page.locator('.screen.active [data-motion-ready="true"]').waitFor();
      console.log('PASS offline arenas and guardian poses for all courses and Titan');
    }
    assert.deepEqual(errors,[]);
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1)});
