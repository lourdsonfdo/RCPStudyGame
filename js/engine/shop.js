/* ============================================================
   SHOP — item catalog, prices, purchase logic
   ============================================================ */
(function (global) {
  'use strict';

  const ITEMS = [
    { key:'healthPotion', emoji:'🧪', name:'Health Potion',  desc:'Restore 25 HP during battle.',                    price: 50 },
    { key:'hintScroll',   emoji:'🔮', name:'Hint Scroll',    desc:'Remove 2 wrong answers on one question.',         price: 75 },
    { key:'shieldRune',   emoji:'🛡', name:'Shield Rune',    desc:'Absorb 1 wrong answer (no HP loss).',             price:100 },
    { key:'reviveCharm',  emoji:'💖', name:'Revive Charm',   desc:'Auto-revive at 1 HP if you would die.',           price:200 },
    { key:'doubleXpTome', emoji:'⚡', name:'Double XP Tome',  desc:'2× XP earned in your next fight.',                price:150 },
  ];

  function catalog() { return ITEMS.slice(); }
  function priceOf(key) { return (ITEMS.find(i => i.key === key) || {}).price || 0; }
  function buy(state, key) {
    const p = priceOf(key);
    if (!p) return { ok: false, reason: 'unknown item' };
    if (state.gold < p) return { ok: false, reason: 'not enough gold' };
    state.gold -= p;
    State.addItem(state, key, 1);
    return { ok: true };
  }

  global.Shop = { catalog, priceOf, buy, ITEMS };
})(window);
