/* ============================================================
   RCP 103 PATIENT SCENARIOS — generated from Study Brain notes
   ============================================================ */
(function () {
  const list = [
    {
      id: 'er-bay-4',
      title: 'ER Bay 4: 62yo Chronic Smoker',
      course: 'rcp103',
      intro: 'A 62-year-old with a 40 pack-year smoking history presents with 3 days of worsening SOB and productive cough with yellow-green sputum. Barrel chest, pursed-lip breathing, accessory muscle use. Known GOLD 3 COPD baseline.',
      vitals: { rr: 32, spo2: 84, hr: 110, bp: '142/88' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'First oxygen-therapy action?',
          options: [
            { text: 'Place on 100% non-rebreather',     hpDelta: -25, explain: 'High FiO2 wipes out hypoxic drive in a chronic CO2 retainer and worsens V/Q mismatch via loss of hypoxic vasoconstriction — pushes patient into CO2 narcosis.', next: 'd2' },
            { text: 'Titrate O2 to SpO2 88–92%',         hpDelta: +20, explain: 'Correct — the COPD target window. Preserves hypoxic drive while avoiding dangerous hypoxemia. Use a Venturi mask for precise FiO2 control.', next: 'd2' },
            { text: 'Intubate immediately',              hpDelta: -10, explain: 'Premature. Patient is awake and protecting airway — BiPAP should be trialed first for hypercapnic COPD exacerbations.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'ABG returns: pH 7.22, PaCO2 88, HCO3 38, PaO2 58. Interpretation?',
          options: [
            { text: 'Acute respiratory acidosis',                  hpDelta: +5,  explain: 'Partial credit — pH and CO2 fit, but HCO3 of 38 is far above normal, meaning the kidneys have been compensating chronically.', next: 'd3' },
            { text: 'Acute-on-chronic respiratory acidosis',       hpDelta: +20, explain: 'Correct — elevated baseline HCO3 (chronic retainer) with acute CO2 spike and pH drop. Classic COPD exacerbation gas.', next: 'd3' },
            { text: 'Fully compensated respiratory acidosis',      hpDelta: -15, explain: 'Wrong — if fully compensated the pH would be near 7.35–7.40. A pH of 7.22 means decompensation.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Patient is awake but tiring. Next intervention?',
          options: [
            { text: 'BiPAP 12/5 + bronchodilators + steroids + abx', hpDelta: +20, explain: 'First-line for hypercapnic COPD exacerbation. BiPAP reduces work of breathing, improves alveolar ventilation, and avoids intubation in ~80% of cases.', next: null },
            { text: 'Albuterol nebs alone and reassess',             hpDelta: -10, explain: 'Undertreatment — bronchodilators do not fix the ventilatory failure. Patient will fatigue and crash without ventilatory support.', next: null },
            { text: 'Sedate with benzos and intubate now',           hpDelta: -20, explain: 'Benzos suppress respiratory drive and intubation is premature in an awake cooperative patient. Try BiPAP first.', next: null },
          ]},
      ],
    },
    {
      id: 'er-asthma-crisis',
      title: 'ER Bay 7: Severe Asthma',
      course: 'rcp103',
      intro: '24-year-old known asthmatic, ran out of ICS 2 weeks ago. Brought in by EMS after 6 hours of progressive SOB unrelieved by home albuterol. Speaking in single words, tripoding, intercostal retractions.',
      vitals: { rr: 36, spo2: 88, hr: 132, bp: '148/92' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'You auscultate the chest and hear NO wheezing — almost no air movement. What does this mean?',
          options: [
            { text: 'Asthma is resolving — minimal bronchospasm',  hpDelta: -25, explain: 'Dangerous misread. A "silent chest" means airflow is so poor that no turbulence is generated — this is respiratory arrest imminent, not improvement.', next: 'd2' },
            { text: 'Silent chest = life-threatening obstruction',  hpDelta: +20, explain: 'Correct — no wheeze because no air is moving. Combined with single-word speech and SpO2 88, this is the pre-arrest patient.', next: 'd2' },
            { text: 'Likely pneumothorax instead of asthma',        hpDelta: -10, explain: 'Possible differential but breath sounds are bilaterally diminished and history fits severe asthma. Silent chest in known asthmatic = severe attack.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'ABG: pH 7.36, PaCO2 42, PaO2 62. Earlier gas was pH 7.48, PaCO2 28. What does the trend tell you?',
          options: [
            { text: 'PaCO2 is normalizing — patient is improving',  hpDelta: -20, explain: 'Classic trap. In acute asthma, a "normal" or RISING PaCO2 after initial hypocapnia means the patient is fatiguing and can no longer hyperventilate — this is danger.', next: 'd3' },
            { text: 'Rising PaCO2 = fatigue, prepare to intubate',  hpDelta: +20, explain: 'Correct — the trajectory matters more than the absolute number. Normalization in severe asthma = pre-respiratory-failure.', next: 'd3' },
            { text: 'Pure metabolic compensation, no concern',      hpDelta: -15, explain: 'HCO3 has not changed and the time course is minutes-to-hours — far too short for metabolic compensation.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Continuous albuterol + ipratropium + IV magnesium + IV steroids have failed. Next?',
          options: [
            { text: 'Prepare for intubation with ketamine',         hpDelta: +20, explain: 'Correct — refractory severe asthma with rising PaCO2, silent chest, and exhaustion requires intubation. Ketamine is preferred (bronchodilator properties).', next: null },
            { text: 'Give IV beta blocker for the tachycardia',     hpDelta: -25, explain: 'Catastrophic — beta blockade triggers bronchospasm in asthmatics. Tachycardia here is appropriate from beta-agonists and distress.', next: null },
            { text: 'Switch to BiPAP and continue medical therapy', hpDelta: -5,  explain: 'BiPAP can be a bridge in cooperative asthmatics, but with single-word speech, silent chest, and rising CO2 this patient needs a definitive airway.', next: null },
          ]},
      ],
    },
    {
      id: 'icu-ards-101',
      title: 'ICU 101: Post-Op ARDS',
      course: 'rcp103',
      intro: '54-year-old s/p emergent bowel surgery for perforated diverticulitis with sepsis. Day 2 ICU. Bilateral diffuse infiltrates on CXR, not explained by cardiac failure. PaO2 120 on FiO2 0.8, PEEP 8.',
      vitals: { rr: 28, spo2: 89, hr: 118, bp: '108/62' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'Calculate the P/F ratio and classify severity.',
          options: [
            { text: 'P/F 150 → Mild ARDS',                       hpDelta: -10, explain: 'P/F math is right (120/0.8=150) but mild ARDS is P/F 200–300. 150 falls in moderate.', next: 'd2' },
            { text: 'P/F 150 → Moderate ARDS (Berlin)',          hpDelta: +20, explain: 'Correct — Berlin definition: mild 200–300, moderate 100–200, severe ≤100, with PEEP ≥ 5.', next: 'd2' },
            { text: 'P/F 96 → Severe ARDS',                      hpDelta: -15, explain: 'Math error — P/F = PaO2/FiO2 = 120/0.8 = 150, not 96.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'Patient is 5\'4" female (IBW ~52 kg), currently weighing 80 kg actual. Ventilator settings?',
          options: [
            { text: 'VT 320 mL (6 mL/kg IBW), plateau ≤30',      hpDelta: +20, explain: 'Correct — ARDSnet lung-protective ventilation uses IDEAL/PREDICTED body weight, not actual. Plateau pressure ≤30 cmH2O prevents barotrauma.', next: 'd3' },
            { text: 'VT 800 mL (10 mL/kg actual weight)',        hpDelta: -25, explain: 'Causes ventilator-induced lung injury. Using actual weight for an obese patient overdistends already-damaged alveoli — increases mortality.', next: 'd3' },
            { text: 'VT 520 mL (10 mL/kg IBW)',                  hpDelta: -10, explain: 'Right weight basis, wrong volume. ARDSnet target is 4–6 mL/kg IBW, not 10.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Despite optimization, P/F drops to 90 on FiO2 1.0, PEEP 14. Next step?',
          options: [
            { text: 'Prone positioning for 16 hours',            hpDelta: +20, explain: 'Correct — PROSEVA showed mortality benefit for prone positioning in moderate-severe ARDS with P/F < 150. Improves V/Q matching and recruitment.', next: null },
            { text: 'Increase VT to 8 mL/kg to "blow off CO2"',  hpDelta: -20, explain: 'Violates lung-protective strategy. Permissive hypercapnia is accepted (pH > 7.20) — do not abandon low VT for CO2.', next: null },
            { text: 'Drop PEEP to 5 to reduce barotrauma',       hpDelta: -20, explain: 'PEEP is essential to keep alveoli open in ARDS. Lowering PEEP causes derecruitment and worsens shunt/hypoxemia.', next: null },
          ]},
      ],
    },
    {
      id: 'er-tension-ptx',
      title: 'ER Trauma Bay: Tension PTX',
      course: 'rcp103',
      intro: '28-year-old male, MVC, restrained driver. Tachypneic, severe respiratory distress, absent breath sounds on the LEFT, hyperresonance to percussion, trachea deviated to the RIGHT, JVD, hypotension.',
      vitals: { rr: 38, spo2: 82, hr: 138, bp: '78/44' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'First diagnostic step?',
          options: [
            { text: 'Order STAT upright chest X-ray',            hpDelta: -25, explain: 'Tension pneumothorax is a CLINICAL diagnosis — waiting for imaging while the patient is in obstructive shock can be fatal. Treat first.', next: 'd2' },
            { text: 'Clinical diagnosis — proceed to decompress', hpDelta: +20, explain: 'Correct — absent breath sounds + hyperresonance + tracheal deviation + JVD + hypotension after chest trauma = tension PTX. Decompress immediately.', next: 'd2' },
            { text: 'CT chest to confirm before intervention',    hpDelta: -25, explain: 'Patient will arrest in the scanner. Tension PTX is treated on physical exam findings, not imaging.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'Where do you place the needle for emergent decompression in an adult?',
          options: [
            { text: '2nd ICS midclavicular line (or 4th–5th ICS anterior axillary)', hpDelta: +20, explain: 'Correct — classic site 2nd ICS MCL on the affected side; updated ATLS also accepts 4th–5th ICS anterior axillary line in adults with thick chest walls.', next: 'd3' },
            { text: '5th ICS midaxillary line on the unaffected side',                hpDelta: -25, explain: 'Wrong side AND wrong site. Decompressing the wrong hemithorax creates a second pneumothorax and does nothing for the tension.', next: 'd3' },
            { text: 'Subxiphoid approach with 18-gauge needle',                       hpDelta: -20, explain: 'That is a pericardiocentesis site, not for pneumothorax. Wrong landmark entirely.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'You hear the rush of air, BP improves. What is the definitive next step?',
          options: [
            { text: 'Place a chest tube (tube thoracostomy)',     hpDelta: +20, explain: 'Correct — needle decompression converts a tension PTX into a simple PTX. Definitive management is a chest tube to underwater seal/suction.', next: null },
            { text: 'Remove the needle and observe',              hpDelta: -25, explain: 'Pleural air will reaccumulate and tension can recur. The needle is a temporizing measure only — chest tube is required.', next: null },
            { text: 'Discharge with outpatient pulmonology f/u',  hpDelta: -25, explain: 'Trauma patient with active pneumothorax cannot be discharged. Requires chest tube, admission, and serial CXR.', next: null },
          ]},
      ],
    },
    {
      id: 'er-cap-sepsis',
      title: 'ER Bay 2: CAP with Sepsis',
      course: 'rcp103',
      intro: '71-year-old presents with 4 days of fever, productive cough with rust-colored sputum, pleuritic chest pain, and confusion. CXR shows right lower lobe consolidation with air bronchograms. Lactate 3.8.',
      vitals: { rr: 30, spo2: 87, hr: 124, bp: '92/58' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'First priority workup before antibiotics?',
          options: [
            { text: 'Sputum Gram stain + culture and blood cultures x2', hpDelta: +20, explain: 'Correct — obtain cultures BEFORE antibiotics when feasible, but do not delay abx >1 hr in sepsis. Adequate sputum sample = >25 WBC and <10 epithelial cells per LPF.', next: 'd2' },
            { text: 'Hold all interventions pending CT chest',           hpDelta: -25, explain: 'Sepsis with hypotension and elevated lactate — delaying antibiotics >1 hour increases mortality by ~7% per hour.', next: 'd2' },
            { text: 'Skip cultures, give broad-spectrum abx immediately', hpDelta: +5,  explain: 'Acceptable if cultures will delay therapy, but in this patient cultures can be drawn within minutes — do both.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'On 6L NC, SpO2 is now 89%, RR 32, accessory muscle use. ABG: pH 7.31, PaCO2 52, PaO2 60. Next?',
          options: [
            { text: 'Trial BiPAP and reassess in 1–2 hours',     hpDelta: +10, explain: 'Reasonable in alert patient with hypercapnic-hypoxemic failure — but in CAP with sepsis the failure rate is higher than in COPD. Watch closely.', next: 'd3' },
            { text: 'Intubate now — mental status changes + ARF', hpDelta: +20, explain: 'Best choice — septic patient with altered mental status, hemodynamic instability, and combined hypoxemic/hypercapnic failure does poorly on BiPAP. Early intubation is safer.', next: 'd3' },
            { text: 'Increase NC to 10 L/min and observe',        hpDelta: -20, explain: 'Nasal cannula maxes out around 6 L/min for effective FiO2. Will not fix the ventilatory failure or altered mental status.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Urinary antigen returns positive for Streptococcus pneumoniae. Best antibiotic strategy?',
          options: [
            { text: 'IV ceftriaxone + azithromycin (or levofloxacin)', hpDelta: +20, explain: 'Correct — IDSA guidelines for severe CAP cover S. pneumoniae plus atypicals (Legionella, Mycoplasma). Beta-lactam + macrolide or respiratory fluoroquinolone.', next: null },
            { text: 'Oral amoxicillin and discharge home',             hpDelta: -25, explain: 'Severe CAP with sepsis and respiratory failure cannot be managed orally or as an outpatient — requires IV therapy and ICU admission.', next: null },
            { text: 'Vancomycin alone',                                hpDelta: -15, explain: 'Vanco covers MRSA but does not cover the pneumococcus or atypicals adequately. Not appropriate monotherapy for CAP.', next: null },
          ]},
      ],
    },
    {
      id: 'floor-gbs',
      title: 'Floor Patient: Ascending Weakness',
      course: 'rcp103',
      intro: '38-year-old admitted yesterday with leg weakness 2 weeks after a Campylobacter GI illness. Today: weakness has ascended to arms, areflexia on exam, mild dyspnea. CSF: elevated protein, normal WBC.',
      vitals: { rr: 22, spo2: 95, hr: 96, bp: '138/82' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'Bedside spirometry: VC 18 mL/kg, MIP −22, MEP +35. What does this mean?',
          options: [
            { text: 'Reassuring — values are within acceptable limits', hpDelta: -25, explain: 'Dangerous misread. The 20-30-40 rule: VC <20, MIP weaker than −30, MEP <40 all indicate impending respiratory failure in GBS.', next: 'd2' },
            { text: 'Meets 20-30-40 rule — intubate before crash',      hpDelta: +20, explain: 'Correct — all three thresholds breached. In GBS, intubate PROACTIVELY before respiratory arrest, not after.', next: 'd2' },
            { text: 'MIP is fine, only VC is borderline',                hpDelta: -15, explain: 'MIP of −22 is weaker than the −30 threshold (closer to zero = weaker). Patient cannot generate adequate inspiratory force.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'You are setting up for intubation. What disease-modifying therapy do you initiate?',
          options: [
            { text: 'High-dose IV corticosteroids',              hpDelta: -20, explain: 'Classic trap — steroids do NOT work in GBS and may worsen outcomes. This is the high-yield test pearl: GBS is not a steroid-responsive disease.', next: 'd3' },
            { text: 'IVIG or plasmapheresis',                    hpDelta: +20, explain: 'Correct — these are the two proven therapies for GBS. Either is acceptable; choice depends on availability and patient factors.', next: 'd3' },
            { text: 'Pyridostigmine',                            hpDelta: -15, explain: 'That treats myasthenia gravis (anti-AChR antibodies), not GBS. Wrong neuromuscular disease.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Patient is intubated. On day 5 of mechanical ventilation, MIP improves to −35, VC 22 mL/kg. Plan?',
          options: [
            { text: 'Begin weaning trial (SBT) — values now meet extubation criteria', hpDelta: +20, explain: 'Correct — MIP more negative than −30 and VC trending up suggest recovering inspiratory strength. Trial SBT with adequate cough and secretion clearance.', next: null },
            { text: 'Keep sedated on full vent support for 2 more weeks',              hpDelta: -10, explain: 'Prolonged unnecessary ventilation increases VAP, ICU delirium, and muscle deconditioning. Wean when parameters allow.', next: null },
            { text: 'Tracheostomy now and long-term vent placement',                   hpDelta: -15, explain: 'Premature — patient is showing recovery. Most GBS patients recover over weeks–months; trach is considered after ~2 weeks if no improvement.', next: null },
          ]},
      ],
    },
  ];
  window.ALL_SCENARIOS = (window.ALL_SCENARIOS || []).filter(s => s.course !== 'rcp103').concat(list);
})();
