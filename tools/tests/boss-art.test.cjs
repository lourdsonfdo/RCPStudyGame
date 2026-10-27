const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root=path.resolve(__dirname,'../..');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['rcp103-bosses.js','rcp104-bosses.js','rcp201-midterm.js','rcp202-midterm.js','rcp203-midterm.js','rcp2xx-superboss.js','boss-sprites.js']){
 vm.runInContext(fs.readFileSync(path.join(root,'content',f),'utf8'),ctx);
}
const bosses=ctx.window.ALL_BOSSES,sprites=ctx.window.BOSS_SPRITES;
assert.equal(bosses.length,57);
const used=new Set();const hashes=new Set();const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
for(const boss of bosses){
 const markup=sprites[boss.id];assert.ok(markup,`missing ${boss.id}`);
 const src=/src="([^"]+)"/.exec(markup)?.[1];assert.equal(src,`img/bosses/${boss.id}.webp`);
 assert.ok(!used.has(src));used.add(src);
 const bytes=fs.readFileSync(path.join(root,src));
 const hash=require('node:crypto').createHash('sha256').update(bytes).digest('hex');
 assert.ok(!hashes.has(hash),`Reused image: ${boss.id}`);hashes.add(hash);
 assert.ok(sw.includes(`'/RCPStudyGame/${src}'`),`Not precached: ${src}`);
}
assert.equal(Object.keys(sprites).length,57);
console.log('PASS: 57 bosses have distinct existing, precached portrait assets with stable IDs');
