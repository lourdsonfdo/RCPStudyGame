/* ============================================================
   PREP-CAMP — train / shop / equip / enter fight (with modals)
   ctx: { course, bossId }
   ============================================================ */
App.registerScreen('prep-camp', ({ root, state, ctx }) => {
  const boss = (window.ALL_BOSSES || []).find(b => b.id === ctx.bossId);
  if (!boss) { root.innerHTML = '<div class="panel t-red">Boss not found.</div>'; return; }

  const ITEM_EMOJI = { healthPotion:'🧪', hintScroll:'🔮', shieldRune:'🛡', reviveCharm:'💖', doubleXpTome:'⚡' };

  let panel = 'menu'; // 'menu' | 'shop' | 'equip'

  function render() {
    if (panel === 'shop')  return renderShop();
    if (panel === 'equip') return renderEquip();
    renderMenu();
  }

  function renderMenu() {
    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>← BACK</button>
        <span class="t-sm t-orange">⚔️ PREP CAMP</span>
        <span class="t-sm t-dim">${boss.course.toUpperCase()}</span>
      </div>

      <div class="arena" style="min-height: 150px;">
        <div class="boss-portrait">${(window.BOSS_SPRITES && window.BOSS_SPRITES[boss.id]) || `<div class="boss-emoji">${boss.emoji}</div>`}</div>
        <div class="boss-name">${boss.name}</div>
        <div class="boss-sub">${boss.description || ''}</div>
      </div>

      <div class="panel" style="display:flex; flex-direction:column; gap:6px;">
        <div class="xp-header">
          <span class="lvl-txt">★ LVL ${state.level}</span>
          <span class="gold-txt">🪙 ${state.gold}g</span>
        </div>
        <div class="xp-sub">EQUIPPED: ${state.equipped.length ? state.equipped.map(k => ITEM_EMOJI[k]).join(' ') : '—'}</div>
      </div>

      <button class="btn btn-block" data-go="training">🏋️ TRAIN <span class="spacer"></span><span class="t-xs t-dim">+5 XP / +10g</span></button>
      <button class="btn btn-block" data-go="shop">🪙 SHOP <span class="spacer"></span><span class="t-xs t-dim">Buy items</span></button>
      <button class="btn btn-block" data-go="equip">🎒 EQUIP <span class="spacer"></span><span class="t-xs t-dim">Up to 3 items</span></button>

      <div class="spacer"></div>

      <button class="btn btn-block btn-primary" data-go="fight">⚔️ ENTER BOSS FIGHT</button>
    `;

    const arenaEl = root.querySelector('.arena');
    if (arenaEl && window.ArenaBg) ArenaBg.attach(arenaEl, { mode: 'battle' });

    root.querySelector('[data-back]').addEventListener('click', () => App.goto('boss-select', { course: ctx.course }));
    root.querySelectorAll('[data-go]').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = btn.dataset.go;
        if (d === 'training') App.goto('training', { course: ctx.course, bossId: ctx.bossId });
        else if (d === 'fight') App.goto('battle', { course: ctx.course, bossId: ctx.bossId });
        else { panel = d; render(); }
      });
    });
  }

  function renderShop() {
    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>← BACK</button>
        <span class="t-sm t-orange">🪙 SHOP</span>
        <span class="gold-txt t-sm">${state.gold}g</span>
      </div>
      <div class="t-xs t-mute t-center" style="margin: 4px 0 8px;">Buy items to bring into the fight.</div>
      <div id="items"></div>
    `;

    const list = root.querySelector('#items');
    Shop.catalog().forEach(item => {
      const have = state.inventory[item.key] || 0;
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-body">
          <div class="item-name">${item.name}</div>
          <div class="item-desc">${item.desc}</div>
        </div>
        <div class="item-meta">
          <div class="item-count">×${have}</div>
          <button class="item-btn" data-buy="${item.key}" ${state.gold < item.price ? 'disabled' : ''}>${item.price}g</button>
        </div>`;
      list.appendChild(row);
    });

    root.querySelector('[data-back]').addEventListener('click', () => { panel = 'menu'; render(); });
    root.querySelectorAll('[data-buy]').forEach(b => {
      b.addEventListener('click', () => {
        const r = Shop.buy(state, b.dataset.buy);
        if (r.ok) { State.save(state); App.toast('Purchased!'); render(); }
        else App.toast(r.reason);
      });
    });
  }

  function renderEquip() {
    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>← BACK</button>
        <span class="t-sm t-orange">🎒 EQUIP</span>
        <span class="t-sm t-dim">${state.equipped.length}/3</span>
      </div>
      <div class="t-xs t-mute t-center" style="margin: 4px 0 8px;">Tap to equip / unequip (max 3).</div>
      <div id="items"></div>
    `;
    const list = root.querySelector('#items');

    Shop.catalog().forEach(item => {
      const have = state.inventory[item.key] || 0;
      const equipped = state.equipped.includes(item.key);
      if (have === 0) return;

      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-emoji">${item.emoji}</div>
        <div class="item-body">
          <div class="item-name">${item.name}</div>
          <div class="item-desc">${item.desc}</div>
        </div>
        <div class="item-meta">
          <div class="item-count">×${have}</div>
          <button class="item-btn ${equipped ? 'equipped' : ''}" data-toggle="${item.key}">${equipped ? '✓ EQUIPPED' : 'EQUIP'}</button>
        </div>`;
      list.appendChild(row);
    });

    if (!list.children.length) {
      list.innerHTML = '<div class="panel t-mute t-center t-sm">No items yet — visit the shop.</div>';
    }

    root.querySelector('[data-back]').addEventListener('click', () => { panel = 'menu'; render(); });
    root.querySelectorAll('[data-toggle]').forEach(b => {
      b.addEventListener('click', () => {
        const key = b.dataset.toggle;
        let eq = state.equipped.slice();
        if (eq.includes(key)) eq = eq.filter(k => k !== key);
        else if (eq.length < 3) eq.push(key);
        else { App.toast('Max 3 items'); return; }
        State.setEquipped(state, eq);
        State.save(state);
        render();
      });
    });
  }

  render();
});
