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
    const title = State.titleForLevel(state.level);
    const sprite = (window.BOSS_SPRITES && window.BOSS_SPRITES[boss.id]) || `<div class="boss-emoji">${boss.emoji}</div>`;
    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>BACK</button>
        <span class="mode-tag">⚔ PREP CAMP</span>
        <span class="chapter-tag">${boss.course.toUpperCase()}</span>
      </div>

      <div class="arena" style="min-height: 170px;">
        <div class="boss-portrait">${sprite}</div>
        <div class="boss-name">${boss.name}</div>
        <div class="boss-sub">${boss.description || ''}</div>
      </div>

      <div class="hud hud-corners">
        <span class="br1"></span><span class="br2"></span>
        <div class="header-strip" style="margin: -14px -16px 12px;">
          <span><span class="status-dot"></span>OPERATOR STATUS</span>
          <span>LV.${state.level} · ${title.toUpperCase()}</span>
        </div>
        <div class="vitals">
          <div class="vital">
            <span class="vital-label">GOLD</span>
            <span class="vital-value amber">${state.gold}</span>
            <span class="vital-unit">CREDITS</span>
          </div>
          <div class="vital">
            <span class="vital-label">LOADOUT</span>
            <span class="vital-value ${state.equipped.length ? 'green' : ''}">${state.equipped.length}/3</span>
            <span class="vital-unit">${state.equipped.length ? state.equipped.map(k => ITEM_EMOJI[k]).join(' ') : 'EMPTY'}</span>
          </div>
          <div class="vital">
            <span class="vital-label">HP MAX</span>
            <span class="vital-value">${state.maxHp}</span>
            <span class="vital-unit">CAPACITY</span>
          </div>
        </div>
      </div>

      <div class="module" data-go="training">
        <div class="module-icon-wrap">🏋️</div>
        <div class="module-body">
          <div class="module-tag">▸ DRILL</div>
          <div class="module-title">TRAIN</div>
          <div class="module-meta">+5 XP · +10 ¢ PER CORRECT</div>
        </div>
      </div>

      <div class="module module-104" data-go="shop">
        <div class="module-icon-wrap">🪙</div>
        <div class="module-body">
          <div class="module-tag">▸ REQUISITION</div>
          <div class="module-title">SHOP</div>
          <div class="module-meta">EXCHANGE CREDITS FOR ITEMS</div>
        </div>
      </div>

      <div class="module" data-go="equip">
        <div class="module-icon-wrap">🎒</div>
        <div class="module-body">
          <div class="module-tag">▸ LOADOUT</div>
          <div class="module-title">EQUIP</div>
          <div class="module-meta">SELECT UP TO 3 ITEMS</div>
        </div>
      </div>

      <div class="spacer"></div>

      <button class="btn btn-block btn-primary" data-go="fight">⚔ ENGAGE BOSS</button>
    `;

    // Animated background still applies
    const arenaEl = root.querySelector('.arena');
    if (arenaEl && window.ArenaBg) ArenaBg.attach(arenaEl, { mode: 'battle' });

    root.querySelector('[data-back]').addEventListener('click', () => App.back());
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
        <button class="back-btn" data-back>BACK</button>
        <span class="mode-tag">🪙 REQUISITION TERMINAL</span>
        <span class="chapter-tag gold-txt">¢ ${state.gold}</span>
      </div>
      <div class="header-strip"><span><span class="status-dot"></span>ITEMS AVAILABLE</span><span>BALANCE: ${state.gold}¢</span></div>
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
          <div class="item-name">${item.name.toUpperCase()}</div>
          <div class="item-desc">${item.desc}</div>
        </div>
        <div class="item-meta">
          <div class="item-count">×${have}</div>
          <button class="item-btn" data-buy="${item.key}" ${state.gold < item.price ? 'disabled' : ''}>${item.price}¢</button>
        </div>`;
      list.appendChild(row);
    });

    root.querySelector('[data-back]').addEventListener('click', () => { panel = 'menu'; render(); });
    root.querySelectorAll('[data-buy]').forEach(b => {
      b.addEventListener('click', () => {
        const r = Shop.buy(state, b.dataset.buy);
        if (r.ok) { State.save(state); App.toast('PURCHASED'); render(); }
        else App.toast(r.reason.toUpperCase());
      });
    });
  }

  function renderEquip() {
    root.innerHTML = `
      <div class="topbar">
        <button class="back-btn" data-back>BACK</button>
        <span class="mode-tag">🎒 LOADOUT</span>
        <span class="chapter-tag">${state.equipped.length}/3</span>
      </div>
      <div class="header-strip"><span><span class="status-dot"></span>EQUIP TO SLOT</span><span>MAX 3</span></div>
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
          <div class="item-name">${item.name.toUpperCase()}</div>
          <div class="item-desc">${item.desc}</div>
        </div>
        <div class="item-meta">
          <div class="item-count">×${have}</div>
          <button class="item-btn ${equipped ? 'equipped' : ''}" data-toggle="${item.key}">${equipped ? '✓ EQUIPPED' : 'EQUIP'}</button>
        </div>`;
      list.appendChild(row);
    });

    if (!list.children.length) {
      list.innerHTML = '<div class="panel t-mute t-center t-sm">NO ITEMS IN STORAGE · VISIT REQUISITION</div>';
    }

    root.querySelector('[data-back]').addEventListener('click', () => { panel = 'menu'; render(); });
    root.querySelectorAll('[data-toggle]').forEach(b => {
      b.addEventListener('click', () => {
        const key = b.dataset.toggle;
        let eq = state.equipped.slice();
        if (eq.includes(key)) eq = eq.filter(k => k !== key);
        else if (eq.length < 3) eq.push(key);
        else { App.toast('LOADOUT FULL'); return; }
        State.setEquipped(state, eq);
        State.save(state);
        render();
      });
    });
  }

  render();
});
