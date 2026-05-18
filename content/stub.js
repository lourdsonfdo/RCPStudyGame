/* ============================================================
   STUB CONTENT — dev seed so screens render before full content
   is generated. Defines:
     window.ALL_BOSSES, window.ALL_QUESTIONS, window.ALL_SCENARIOS
   Production content tasks (25-28) will OVERWRITE these globals
   by re-assigning them in rcp103/104-*.js files loaded after this.
   ============================================================ */
(function () {
  if (window.ALL_BOSSES) return;  // production content already loaded

  window.ALL_BOSSES = [
    // RCP 103
    { id: 'copd',   name: 'The Blue Bloater',     emoji: '🌫️', course: 'rcp103', description: 'Chronic bronchitis & emphysema', hp: 100, unlockedByDefault: true,  questionTopics: ['copd'] },
    { id: 'asthma', name: 'The Hyperresponsive',  emoji: '💨', course: 'rcp103', description: 'Asthma — zones, biphasic, severity', hp: 100, unlockedByDefault: true, questionTopics: ['asthma'] },
    { id: 'abg',    name: 'The Acid-Base Specter',emoji: '🩸', course: 'rcp103', description: 'ABG interpretation, anion gap', hp: 100, unlockedByDefault: true, questionTopics: ['abg'] },
    { id: 'ards',   name: 'Hyaline Hydra',        emoji: '💧', course: 'rcp103', description: 'ARDS — Berlin criteria, P/F ratio', hp: 100, unlockedByDefault: false, questionTopics: ['ards'] },
    // RCP 104
    { id: 'corticosteroids', name: 'Corticosteroid Boss', emoji: '🧪', course: 'rcp104', description: 'Chapter 11 — Anti-inflammatory', hp: 100, unlockedByDefault: true, questionTopics: ['corticosteroids'] },
    { id: 'diuretics',       name: 'Diuretic Boss',       emoji: '💧', course: 'rcp104', description: 'Chapter 19 — Diuretics', hp: 100, unlockedByDefault: true, questionTopics: ['diuretics'] },
  ];

  window.ALL_QUESTIONS = [
    // COPD (3)
    { id:'q-copd-1', topic:'copd', course:'rcp103', difficulty:1,
      q:'The hallmark PFT finding in COPD is...',
      choices:['FEV1/FVC > 0.70','Post-bronchodilator FEV1/FVC < 0.70','Normal FEV1','Increased DLCO'], correct:1,
      explanation:'Post-bronchodilator FEV1/FVC < 0.70 is the GOLD diagnostic criterion for COPD.' },
    { id:'q-copd-2', topic:'copd', course:'rcp103', difficulty:1,
      q:'In chronic CO2 retainers with COPD, what drives ventilation?',
      choices:['Central chemoreceptors','Peripheral hypoxic drive','Vagal tone','Stretch receptors'], correct:1,
      explanation:'Central chemoreceptors become desensitized in chronic CO2 retention; peripheral chemoreceptors (hypoxic drive) take over.' },
    { id:'q-copd-3', topic:'copd', course:'rcp103', difficulty:2,
      q:'What target SpO2 range is appropriate for a COPD exacerbation?',
      choices:['95–100%','88–92%','>99%','70–80%'], correct:1,
      explanation:'88–92% preserves hypoxic drive; >92% risks wiping it out and causing CO2 retention.' },

    // Asthma (3)
    { id:'q-asthma-1', topic:'asthma', course:'rcp103', difficulty:1,
      q:'A normal or rising PaCO2 during an acute severe asthma attack indicates:',
      choices:['Adequate ventilation','Imminent respiratory failure','Mild exacerbation','Bronchodilator response'], correct:1,
      explanation:'A rising PaCO2 means the patient can no longer hyperventilate to compensate — they are fatiguing and crashing.' },
    { id:'q-asthma-2', topic:'asthma', course:'rcp103', difficulty:2,
      q:'A "silent chest" in asthma means:',
      choices:['Patient is sleeping','Asthma resolved','No air movement — life-threatening','Mild attack'], correct:2,
      explanation:'Silent chest = no wheeze because no air is moving. Intubation is imminent.' },
    { id:'q-asthma-3', topic:'asthma', course:'rcp103', difficulty:1,
      q:'In the Asthma Action Plan, the RED zone PEFR is:',
      choices:['80–100% personal best','50–79%','< 50%','> 100%'], correct:2,
      explanation:'RED zone = PEFR < 50% personal best — emergency. Use rescue inhaler + oral steroids + call 911.' },

    // ABG (3)
    { id:'q-abg-1', topic:'abg', course:'rcp103', difficulty:1,
      q:'ABG: pH 7.16, PaCO2 79, HCO3 26. Interpret:',
      choices:['Acute respiratory acidosis','Chronic resp acidosis','Metabolic alkalosis','Metabolic acidosis'], correct:0,
      explanation:'Low pH + high PaCO2 + normal HCO3 = acute (uncompensated) respiratory acidosis.' },
    { id:'q-abg-2', topic:'abg', course:'rcp103', difficulty:2,
      q:'Anion gap formula:',
      choices:['Na – Cl','Na – (Cl + HCO3)','Cl – HCO3','HCO3 – Na'], correct:1,
      explanation:'Anion Gap = Na+ – (Cl– + HCO3–). Normal range 8–12 mEq/L.' },
    { id:'q-abg-3', topic:'abg', course:'rcp103', difficulty:2,
      q:'"MUDPILES" describes causes of:',
      choices:['Normal anion gap metabolic acidosis','Elevated anion gap metabolic acidosis','Metabolic alkalosis','Respiratory acidosis'], correct:1,
      explanation:'MUDPILES = Methanol, Uremia, DKA, Propylene glycol, Iron/INH, Lactic, Ethylene glycol, Salicylates.' },

    // ARDS (2)
    { id:'q-ards-1', topic:'ards', course:'rcp103', difficulty:2,
      q:'Mild ARDS P/F ratio range:',
      choices:['>400','300–400','200–300','100–200'], correct:2,
      explanation:'Berlin: Mild 200–300, Moderate 100–200, Severe ≤100 (with PEEP ≥ 5).' },
    { id:'q-ards-2', topic:'ards', course:'rcp103', difficulty:1,
      q:'Lung-protective ventilation tidal volume in ARDS is:',
      choices:['10–12 mL/kg actual weight','8 mL/kg actual weight','4–6 mL/kg ideal body weight','15 mL/kg'], correct:2,
      explanation:'ARDSnet protocol: 4–6 mL/kg of IDEAL/predicted body weight (not actual).' },

    // Corticosteroids (3)
    { id:'q-cort-1', topic:'corticosteroids', course:'rcp104', difficulty:1,
      q:"Pulmicort's generic name is?",
      choices:['Fluticasone','Budesonide','Beclomethasone','Mometasone'], correct:1,
      explanation:'Pulmicort = budesonide (inhaled corticosteroid).' },
    { id:'q-cort-2', topic:'corticosteroids', course:'rcp104', difficulty:2,
      q:'Glucocorticoid endogenous production follows what rhythm?',
      choices:['Lunar','Circadian (peak AM)','Random','Weekly'], correct:1,
      explanation:'Glucocorticoids follow a circadian rhythm with peak cortisol release in the early morning.' },
    { id:'q-cort-3', topic:'corticosteroids', course:'rcp104', difficulty:1,
      q:'Most common local side effect of inhaled corticosteroids:',
      choices:['Hypertension','Oral candidiasis','Hyperglycemia','Osteoporosis'], correct:1,
      explanation:'Oral candidiasis (thrush) and dysphonia — rinse mouth after use.' },

    // Diuretics (3)
    { id:'q-diur-1', topic:'diuretics', course:'rcp104', difficulty:1,
      q:'Most potent class of diuretic:',
      choices:['Thiazide','Loop','Potassium-sparing','Osmotic'], correct:1,
      explanation:'Loop diuretics (e.g., furosemide) are the most potent — act on thick ascending limb.' },
    { id:'q-diur-2', topic:'diuretics', course:'rcp104', difficulty:2,
      q:'Mannitol is what kind of diuretic, used for what?',
      choices:['Thiazide; HTN','Loop; HF','Osmotic; cerebral edema','K-sparing; CHF'], correct:2,
      explanation:'Mannitol is an OSMOTIC diuretic used for cerebral edema and increased ICP.' },
    { id:'q-diur-3', topic:'diuretics', course:'rcp104', difficulty:2,
      q:'Approximately what % of cardiac output flows through the renal system?',
      choices:['5%','10%','25%','50%'], correct:2,
      explanation:'About 25% of CO flows through the kidneys (renal blood flow ~1200 mL/min).' },
  ];

  window.ALL_SCENARIOS = [
    {
      id: 'er-bay-4', title: 'ER Bay 4: 62yo Chronic Smoker', course: 'rcp103',
      intro: 'A 62-year-old with 40 pack-year smoking history presents with worsening SOB and productive cough.',
      vitals: { rr: 32, spo2: 84, hr: 110, bp: '142/88' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'First action?',
          options: [
            { text: 'Place on 100% NRB',           hpDelta: -25, explain: 'Wipes hypoxic drive in chronic CO2 retainers — dangerous.', next: 'd2' },
            { text: 'Titrate O2 to SpO2 88–92%',   hpDelta: +10, explain: 'Correct — preserves hypoxic drive.', next: 'd2' },
            { text: 'Intubate immediately',        hpDelta: -10, explain: 'Premature; trial BiPAP first.',     next: 'd2' },
          ]},
        { id: 'd2', prompt: 'ABG: pH 7.22, PaCO2 88, HCO3 38, PaO2 58 — interpret:',
          options: [
            { text: 'Acute respiratory acidosis',          hpDelta: +5,  explain: 'Partial — HCO3 is elevated, suggesting chronic component.', next: 'd3' },
            { text: 'Acute-on-chronic respiratory acidosis', hpDelta: +15, explain: 'Correct — chronic CO2 retainer (high HCO3) with acute exacerbation.', next: 'd3' },
            { text: 'Pure metabolic alkalosis',            hpDelta: -15, explain: 'Wrong — pH is acidemic.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Next intervention?',
          options: [
            { text: 'BiPAP 12/5',                hpDelta: +20, explain: 'First-line for hypercapnic respiratory failure in COPD.', next: null },
            { text: 'Bronchodilator only',       hpDelta: -5,  explain: 'Undertreated — patient needs ventilatory support.',     next: null },
            { text: 'Sedate and intubate now',   hpDelta: -10, explain: 'Too aggressive; try BiPAP first.',                     next: null },
          ]},
      ],
    },
    {
      id: 'icu-101', title: 'ICU 101: Post-Op ARDS', course: 'rcp103',
      intro: '54yo s/p emergent bowel surgery for sepsis. Day 2 ICU: PaO2/FiO2 = 150 on FiO2 0.8. Bilateral infiltrates on CXR.',
      vitals: { rr: 28, spo2: 89, hr: 118, bp: '108/62' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'Diagnose severity:',
          options: [
            { text: 'Mild ARDS',     hpDelta: -5, explain: 'P/F 150 = moderate.', next: 'd2' },
            { text: 'Moderate ARDS', hpDelta: +15, explain: 'Correct — P/F 100–200 with PEEP ≥ 5.', next: 'd2' },
            { text: 'Pneumonia, not ARDS', hpDelta: -15, explain: 'Bilateral infiltrates + sepsis + P/F < 300 = ARDS.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'Ventilator strategy?',
          options: [
            { text: 'VT 4–6 mL/kg IBW, PEEP per table', hpDelta: +20, explain: 'ARDSnet lung-protective ventilation.', next: 'd3' },
            { text: 'VT 10 mL/kg actual weight',       hpDelta: -20, explain: 'Causes ventilator-induced lung injury.', next: 'd3' },
            { text: 'High-frequency oscillation',      hpDelta: -10, explain: 'Not first-line; HFOV trials showed no mortality benefit.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Patient remains hypoxemic. P/F now 110. Next?',
          options: [
            { text: 'Prone positioning',          hpDelta: +20, explain: 'Indicated for P/F < 150 in moderate-severe ARDS.', next: null },
            { text: 'Increase VT to 8 mL/kg',     hpDelta: -15, explain: 'Violates lung-protective strategy.', next: null },
            { text: 'Stop PEEP',                  hpDelta: -20, explain: 'PEEP is critical for oxygenation in ARDS.', next: null },
          ]},
      ],
    },
  ];
})();
