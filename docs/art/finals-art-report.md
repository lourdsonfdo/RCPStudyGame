# Finals and TMC artwork delivery

All three phases are integrated. No requested IDs or files are missing.

| Phase | New production assets | Integration | Missing |
| --- | ---: | --- | --- |
| 1: portraits | 40 | 384 x 384 RGBA WebP, quality 86; source/concept/motif records; 97-entry registry; precached | None |
| 2: course artwork | 6 | Three 960 x 320 banners and three 1440 x 960 arenas; course mappings and precache entries | None |
| 3: motion | 40 | Six distinct poses per 1152 x 768 RGBA atlas; original source and preparation scale recorded; precached | None |

The new boss IDs are listed below. Every ID has both a portrait and a motion atlas.

- `f202-s01` — The Weaning Warden; Weaning Parameters and Extubation Assessment
- `f202-s02` — Frost Regent; Therapeutic Hypothermia (TH)
- `f202-s03` — The Echo Envoy; Communication
- `f202-s04` — Ember Tyrant; Burn and Inhalation Injury
- `f202-s05` — The Circuit Lich; ECMO
- `f202-s06` — Filtrate Baron; Renal System
- `f202-s07` — The Feeding Hydra; GI System: Routes of Nutrition Delivery
- `f202-s08` — Stairclimb Sentinel; Pulmonary Rehabilitation
- `f202-s09` — The Flail Juggernaut; Trauma
- `f202-s10` — Scope Stalker; Interventional Pulmonary Procedures
- `f202-s11` — The Graft Guardian; Perioperative Management of Lung Transplants
- `f202-s12` — Atlas of Airways; Respiratory Anatomy (Hess Ch 49)
- `f202-s13` — Code Blue Reaper; Cardiopulmonary Resuscitation (CPR)
- `f202-s14` — The Ventilator Overlord; Mechanical Ventilation
- `f202-s15` — High-Flow Harpy; Noninvasive Support (NIPPV and HFNC)
- `f202-s16` — Consolidation King; Pneumonia (PNA)
- `f202-s17` — The Whiteout Wraith; Acute Respiratory Distress Syndrome (ARDS)
- `f202-s18` — The Apothecary Asp; Respiratory Drugs
- `f203-g01` — The Auscultation Oracle; Assessment, Breathing Patterns & Lung Sounds
- `f203-g02` — The Dose Alchemist; Pharmacology, Calculations & Drugs
- `f203-g03` — Loop Leviathan; Mechanical Ventilation, Pressures & Loops
- `f203-g04` — The Airway Architect; Airways, Bronchoscopy & Airway Clearance
- `f203-g05` — Heliox Phoenix; Oxygen, Gas Therapy & Gas Exchange
- `f203-g06` — The Wedge Sphinx; Monitoring, Hemodynamics & Diagnostics
- `f203-g07` — Apnea Nightmare; Sleep, Neonatal Scoring & Infection Control
- `tmc-c01` — The Chart Keeper; Evaluate Data in the Patient Record
- `tmc-c02` — The Bedside Inquisitor; Perform Clinical Assessment
- `tmc-c03` — The Probe Master; Perform Procedures to Gather Clinical Information
- `tmc-c04` — The Results Judge; Evaluate Procedure Results
- `tmc-c05` — The Order Oracle; Recommend Diagnostic Procedures
- `tmc-c06` — Gremlin of the Gear; Assemble and Troubleshoot Devices
- `tmc-c07` — The Sterile Sentinel; Infection Prevention and Quality Control
- `tmc-c09` — The Patency Guardian; Maintain a Patent Airway
- `tmc-c10` — The Mucus Marauder; Perform Airway Clearance and Lung Expansion
- `tmc-c11` — The Gas Exchange General; Support Oxygenation and Ventilation
- `tmc-c12` — The Nebula Chemist; Administer Medications and Specialty Gases
- `tmc-c13` — The Plan Shifter; Ensure Modifications to the Respiratory Care Plan
- `tmc-c14` — The Protocol Sage; Utilize Evidence-Based Principles
- `tmc-c15` — The Crisis Courier; Provide Respiratory Care in High-Risk Situations
- `tmc-c16` — The Right Hand; Assist the Provider; Patient and Family Education

## Generation and preparation

Generated with the built-in image-generation tool. Portrait prompts use [boss-sprites.md](boss-sprites.md), the appended [concepts](boss-sprite-concepts.json), and [medical motifs](boss-medical-motifs.json). Banner prompts and original paths are in [course-illustrations.md](course-illustrations.md). Arena subjects are in [battle-arena-concepts.json](battle-arena-concepts.json). Motion prompts follow [battle-motion.md](battle-motion.md), with each new portrait as the identity reference and a request for compact poses with at least 90px transparent margins.

Original PNGs remain in `/Users/lourdsonfernando/.codex/generated_images/01a1e53c-e926-7111-b2ce-9ef50b250826/`. Final source selections are recorded in the portrait and motion source manifests. The preparation tool executed the unchanged `pose_cells.py` extraction and `prepare_boss_motion.py` packaging; its temporary source log was redirected inside the repository to honor the write-scope restriction.

`tmc-c13` was regenerated after the preparation tool rejected its first source for lacking alpha. `f202-s14` and `tmc-c12` motion sources were regenerated to remove pale halos found during visual review. Two initial portrait halos (`f202-s03`, `f202-s05`) were also corrected before Phase 1 integration.

No known unresolved medical-prop issues remain from visual review. Gas-cylinder colors were explicitly constrained in prompts and checked in the specialty-gas portraits. Automated checks validate asset structure and integration; medical cues were reviewed visually.

## Verification

All six requested commands passed on the final implementation:

- `node tools/tests/boss-art.test.cjs` — PASS (exit 0): 97 distinct registered and precached portraits.
- `node tools/tests/boss-motion.test.cjs` — PASS (exit 0): 4 tests passed.
- `node tools/tests/battle-motion-integration.test.cjs` — PASS (exit 0): 28 checks passed, including nine course mappings.
- `python3 tools/tests/battle-art.test.py` — PASS (exit 0): 97 transparent six-pose anchored atlases, nine distinct arenas, three new banners; portrait dimensions/alpha and source coverage.
- `node tools/tests/finals-content.test.cjs` — PASS (exit 0): 2009 structure checks passed; 2009 questions identical to Recall.
- `node tools/run-engine-tests.js` — PASS (exit 0): 73 checks passed.

The original 57 concept and medical-motif entries retain their values and order. The cache name remains `rcp-study-v28-finals-tmc`. Only the three changed script URLs received `?v=finals-art1`.

No commits, pushes, or Git commands were run. No question files, screen files, `tools/build_finals.py`, or `tools/finals/*` were edited by this artwork task. `content/rcp202-final.js` changed concurrently during the task; that change was left intact, and the final content checks passed against the shared checkout.

## Files changed by this artwork task

103 files: 86 new production assets and 17 integration, manifest, documentation, or test files. This list excludes the other engineer's concurrent changes.

### Integration, manifests, documentation, and tests

- `content/boss-sprites.js`
- `docs/art/boss-sprite-concepts.json`
- `docs/art/boss-medical-motifs.json`
- `docs/art/boss-sprite-sources.json`
- `docs/art/battle-arena-concepts.json`
- `docs/art/battle-motion-sources.json`
- `docs/art/boss-sprites.md`
- `docs/art/course-illustrations.md`
- `docs/art/battle-motion.md`
- `js/engine/academy.js`
- `js/engine/arena-bg.js`
- `sw.js`
- `index.html`
- `tools/tests/boss-art.test.cjs`
- `tools/tests/battle-art.test.py`
- `tools/tests/battle-motion-integration.test.cjs`
- `docs/art/finals-art-report.md`

### Production assets

- `img/bosses/f202-s01.webp`
- `img/bosses/f202-s02.webp`
- `img/bosses/f202-s03.webp`
- `img/bosses/f202-s04.webp`
- `img/bosses/f202-s05.webp`
- `img/bosses/f202-s06.webp`
- `img/bosses/f202-s07.webp`
- `img/bosses/f202-s08.webp`
- `img/bosses/f202-s09.webp`
- `img/bosses/f202-s10.webp`
- `img/bosses/f202-s11.webp`
- `img/bosses/f202-s12.webp`
- `img/bosses/f202-s13.webp`
- `img/bosses/f202-s14.webp`
- `img/bosses/f202-s15.webp`
- `img/bosses/f202-s16.webp`
- `img/bosses/f202-s17.webp`
- `img/bosses/f202-s18.webp`
- `img/bosses/f203-g01.webp`
- `img/bosses/f203-g02.webp`
- `img/bosses/f203-g03.webp`
- `img/bosses/f203-g04.webp`
- `img/bosses/f203-g05.webp`
- `img/bosses/f203-g06.webp`
- `img/bosses/f203-g07.webp`
- `img/bosses/tmc-c01.webp`
- `img/bosses/tmc-c02.webp`
- `img/bosses/tmc-c03.webp`
- `img/bosses/tmc-c04.webp`
- `img/bosses/tmc-c05.webp`
- `img/bosses/tmc-c06.webp`
- `img/bosses/tmc-c07.webp`
- `img/bosses/tmc-c09.webp`
- `img/bosses/tmc-c10.webp`
- `img/bosses/tmc-c11.webp`
- `img/bosses/tmc-c12.webp`
- `img/bosses/tmc-c13.webp`
- `img/bosses/tmc-c14.webp`
- `img/bosses/tmc-c15.webp`
- `img/bosses/tmc-c16.webp`
- `img/academy-critical-final.webp`
- `img/academy-board-final.webp`
- `img/academy-tmc.webp`
- `img/arenas/rcp202f.webp`
- `img/arenas/rcp203f.webp`
- `img/arenas/rcptmc.webp`
- `img/boss-motion/f202-s01.webp`
- `img/boss-motion/f202-s02.webp`
- `img/boss-motion/f202-s03.webp`
- `img/boss-motion/f202-s04.webp`
- `img/boss-motion/f202-s05.webp`
- `img/boss-motion/f202-s06.webp`
- `img/boss-motion/f202-s07.webp`
- `img/boss-motion/f202-s08.webp`
- `img/boss-motion/f202-s09.webp`
- `img/boss-motion/f202-s10.webp`
- `img/boss-motion/f202-s11.webp`
- `img/boss-motion/f202-s12.webp`
- `img/boss-motion/f202-s13.webp`
- `img/boss-motion/f202-s14.webp`
- `img/boss-motion/f202-s15.webp`
- `img/boss-motion/f202-s16.webp`
- `img/boss-motion/f202-s17.webp`
- `img/boss-motion/f202-s18.webp`
- `img/boss-motion/f203-g01.webp`
- `img/boss-motion/f203-g02.webp`
- `img/boss-motion/f203-g03.webp`
- `img/boss-motion/f203-g04.webp`
- `img/boss-motion/f203-g05.webp`
- `img/boss-motion/f203-g06.webp`
- `img/boss-motion/f203-g07.webp`
- `img/boss-motion/tmc-c01.webp`
- `img/boss-motion/tmc-c02.webp`
- `img/boss-motion/tmc-c03.webp`
- `img/boss-motion/tmc-c04.webp`
- `img/boss-motion/tmc-c05.webp`
- `img/boss-motion/tmc-c06.webp`
- `img/boss-motion/tmc-c07.webp`
- `img/boss-motion/tmc-c09.webp`
- `img/boss-motion/tmc-c10.webp`
- `img/boss-motion/tmc-c11.webp`
- `img/boss-motion/tmc-c12.webp`
- `img/boss-motion/tmc-c13.webp`
- `img/boss-motion/tmc-c14.webp`
- `img/boss-motion/tmc-c15.webp`
- `img/boss-motion/tmc-c16.webp`
