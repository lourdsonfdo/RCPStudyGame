# Battle Worlds and Guardian Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Give all 57 guardians anatomical idle/combat poses in six original battle environments.

**Architecture:** Keep stable portrait registry and battle logic. BossMotion overlays a six-pose atlas only within battle arenas, while ArenaBg chooses battle-only scenery. Fx hooks request interruptible pose sequences; router cleanup cancels effects and screen timers.

**Tech Stack:** Vanilla browser JS/CSS, transparent WebP atlases, Node assert/VM tests, Playwright Chrome, Python/Pillow/cwebp asset preparation.

### Task 1: Production artwork
- [x] Generate six individually composed environments under `img/arenas/<course>.webp`, where courses are rcp103,rcp104,rcp201,rcp202,rcp203,rcp2xx. Generate 57 identity-referenced 3x2 sheets under `img/boss-motion/<id>.webp`.
- [x] Prepare sheets with uniform scale across poses and shared feet baseline; preserve RGBA. Record source paths, prompt, and stable IDs in `docs/art/battle-motion-sources.json` and `docs/art/battle-motion.md`.
- [x] Assert six arenas, 57 sheets, dimensions 1152x768, alpha outside silhouettes, nonidentical poses; review six course contact sheets and representative animations.

### Task 2: Motion engine (Codex)
Files: `js/engine/boss-motion.js`, `css/battle-world.css`, `tools/tests/boss-motion.test.cjs`.
- [x] Write and run failing behavioral tests for idle pose cycle, attack/hit interruption, reduced motion and cancel/dispose/fallback; use fake DOM/timers to exercise actual engine state.
- [x] Implement `BossMotion.attach(portrait,{bossId})`, `BossMotion.play(portrait,state)`, `BossMotion.reset()`, `BossMotion.duration(state)`. States are attack,hit,defeat; attack 1000ms,hit 480ms,defeat 900ms. Attach returns cleanup. Atlas load failure leaves original img visible.
- [x] Use CSS background-position for 3x2 poses. Remove bob only for mounted battle portraits. Add contact shadow and scoped arena styles, with no text overlap or horizontal overflow.
- [x] Run `node tools/tests/boss-motion.test.cjs` and inspect pilot in Chrome.

### Task 3: Screen/FX integration (Claude; disjoint files)
Files: `js/engine/fx.js`, `js/engine/arena-bg.js`, `js/screens/battle.js`, `js/screens/superboss.js`, `js/app.js`, `tools/tests/battle-motion-integration.test.cjs`.
- [x] Write tests for mode/course-to-art mapping, navigation cancellation, paused effect suppression and answer-once behavior; run red then green.
- [x] Extend ArenaBg.attach with course; set arena data-battle-world plus --battle-world-art for six course assets when mode battle; keep other modes compatible.
- [x] Mount BossMotion on regular and Titan combat portraits after render. Make Fx bossHit/Counter request motion; avoid old image lunge when new atlas is active. Identity-specific/generic counter text replaces hardcoded PLEURAL CRUSH.
- [x] Track/cancel Fx timers and WAAPI effects through Fx.reset; respect reduced/paused/hidden modes including global fx-host. Cancel visual effects and pending screen callbacks on router switch. Screen init may return cleanup, which router invokes. Guard stale question input without changing saves/rewards.
- [x] Preserve visible explanation/next behavior and Titan phase flow. Run integration and73engine tests; provide changed paths and review notes. Do not edit Codex-owned files or commit.

### Task 4: Release integration and review (Codex)
Files: `index.html`, `sw.js`, browser tests, art docs.
- [x] Add boss-motion.js before Fx/screens and battle-world.css after academy styles. Revise changed URLs; SW v22-battle-worlds precaches all63new assets and two new code files.
- [x] Run asset coverage, motion, integration and existing engine tests. Browser-check 320/390/1440, all course scenes,57sheet loads, real answers/crit/shield/finisher, Titan, pause/reduced motion changes, leave midattack, failure fallback and offline. Save screenshots/video previews outside served repo.
- [x] Claude spec-compliance review then code-quality review; resolve substantiated issues and repeat affected checks.
- [ ] Commit intended files, publish using existing live-site authorization, verify changed production assets SHA256 match release, save Obsidian summary.
