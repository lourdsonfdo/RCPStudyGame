/* ============================================================
   RCP 103 BATTLE POOL — additional boss-fight questions
   Fast-recall exam-style: definitions, cutoffs, drug classes.
   ============================================================ */
(function () {
  const additions = [
    // ---------------- COPD / COR PULMONALE (4) ----------------
    {
      id: 'q-copd-b01', topic: 'copd', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'GOLD stage 2 (moderate) COPD = post-bronchodilator FEV1 % predicted of:',
      choices: ['≥ 80%', '50–79%', '30–49%', '< 30%'],
      correct: 1,
      explanation: 'GOLD 1 ≥80, GOLD 2 50-79 (moderate), GOLD 3 30-49 (severe), GOLD 4 < 30 (very severe).',
    },
    {
      id: 'q-copd-b02', topic: 'copd', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Roflumilast belongs to which drug class used in severe COPD with chronic bronchitis and frequent exacerbations?',
      choices: ['Long-acting beta-2 agonist', 'Phosphodiesterase-4 (PDE4) inhibitor', 'Inhaled corticosteroid', 'Mast cell stabilizer'],
      correct: 1,
      explanation: 'Roflumilast is a selective PDE4 inhibitor — adjunct in severe COPD with chronic bronchitis phenotype and exacerbations.',
    },
    {
      id: 'q-cor-pulmonale-b01', topic: 'cor-pulmonale', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'The MOST common cause of cor pulmonale worldwide is:',
      choices: ['Pulmonary embolism', 'COPD', 'ILD', 'OSA'],
      correct: 1,
      explanation: 'COPD is by far the most common cause of cor pulmonale, via chronic hypoxic pulmonary vasoconstriction and capillary bed destruction.',
    },
    {
      id: 'q-copd-b03', topic: 'copd', course: 'rcp103', difficulty: 3, pool: 'battle',
      q: 'A serum AAT level below what % of normal strongly suggests AAT-deficiency emphysema?',
      choices: ['50%', '15–20% of normal value', '70%', '90%'],
      correct: 1,
      explanation: 'AAT < 15-20% of normal value is highly suggestive of AAT-deficiency emphysema. Screen young (< 45), nonsmokers, or lower-lobe emphysema.',
    },

    // ---------------- ASTHMA (4) ----------------
    {
      id: 'q-asthma-b01', topic: 'asthma', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'Methacholine challenge is considered POSITIVE when FEV1 drops by:',
      choices: ['≥ 5%', '≥ 12%', '≥ 20%', '≥ 50%'],
      correct: 2,
      explanation: 'Methacholine challenge positive = FEV1 decrease ≥ 20% — indicates airway hyperresponsiveness consistent with asthma.',
    },
    {
      id: 'q-asthma-b02', topic: 'asthma', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'Yellow zone of the Asthma Action Plan = PEFR of:',
      choices: ['< 50% personal best', '50–79% personal best', '80–100% personal best', '> 100% personal best'],
      correct: 1,
      explanation: 'Yellow zone (caution) = PEFR 50-79% of personal best. Use SABA, monitor; if no improvement, may need oral steroids.',
    },
    {
      id: 'q-asthma-b03', topic: 'asthma', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Daily PEFR variability suggesting asthma in ADULTS is:',
      choices: ['> 5%', '> 10%', '> 25%', '> 50%'],
      correct: 1,
      explanation: 'Adult PEFR daily variability > 10% supports asthma diagnosis (>13% in children).',
    },
    {
      id: 'q-asthma-b04', topic: 'asthma', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Omalizumab targets which mediator in severe allergic asthma?',
      choices: ['IL-5', 'IgE', 'TNF-alpha', 'Histamine'],
      correct: 1,
      explanation: 'Omalizumab (Xolair) is an anti-IgE monoclonal antibody used in severe allergic asthma with elevated IgE.',
    },

    // ---------------- ABG / ACID-BASE (4) ----------------
    {
      id: 'q-abg-b01', topic: 'abg', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'Mild hypoxemia is defined as PaO2 of:',
      choices: ['60–79 mmHg', '40–59 mmHg', '< 40 mmHg', '> 80 mmHg'],
      correct: 0,
      explanation: 'Mild 60-79, Moderate 40-59, Severe < 40 mmHg.',
    },
    {
      id: 'q-acid-base-b01', topic: 'acid-base', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Which letter in MUDPILES corresponds to "ethylene glycol"?',
      choices: ['M', 'D', 'P', 'E'],
      correct: 3,
      explanation: 'MUDPILES = Methanol, Uremia, DKA, Propylene glycol, Iron/INH, Lactic acidosis, Ethylene glycol, Salicylates.',
    },
    {
      id: 'q-abg-b02', topic: 'abg', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'For radial ABG sampling, after needle removal hold direct pressure for at least:',
      choices: ['30 seconds', '1 minute', '5 minutes', '15 minutes'],
      correct: 2,
      explanation: 'Hold direct pressure ≥ 5 minutes (longer if anticoagulated) to prevent hematoma at the puncture site.',
    },
    {
      id: 'q-acid-base-b02', topic: 'acid-base', course: 'rcp103', difficulty: 3, pool: 'battle',
      q: 'Winter\'s formula predicts expected PaCO2 in metabolic acidosis as:',
      choices: ['PaCO2 = HCO3- + 8', 'PaCO2 = 1.5 × HCO3- + 8 (± 2)', 'PaCO2 = HCO3- × 2', 'PaCO2 = 40 − HCO3-'],
      correct: 1,
      explanation: 'Winter\'s: expected PaCO2 = 1.5(HCO3-) + 8 ± 2. Actual PaCO2 outside that range suggests an additional respiratory disorder.',
    },

    // ---------------- PLEURAL / CHEST TUBES / FLAIL (4) ----------------
    {
      id: 'q-pleural-b01', topic: 'pleural', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'Air in the pleural space is called:',
      choices: ['Hemothorax', 'Pneumothorax', 'Empyema', 'Chylothorax'],
      correct: 1,
      explanation: 'Pneumothorax = air; hemothorax = blood; empyema = pus; chylothorax = chyle.',
    },
    {
      id: 'q-chest-tubes-b01', topic: 'chest-tubes', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Tidaling (fluid level rising on inspiration, falling on expiration) in the water-seal chamber of a chest tube indicates:',
      choices: ['Air leak', 'Normal patent system with the pleural space', 'Tube occlusion', 'Tension pneumothorax'],
      correct: 1,
      explanation: 'Tidaling = normal pleural pressure fluctuations transmitted up the tube. Loss of tidaling suggests tube obstruction or full lung re-expansion.',
    },
    {
      id: 'q-flail-chest-b01', topic: 'flail-chest', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Flail chest requires fractures of at least:',
      choices: ['1 rib', '2 adjacent ribs in 2 or more places', '4 ribs anywhere', 'A sternal fracture'],
      correct: 1,
      explanation: 'Flail chest definition: ≥ 2 adjacent ribs broken in ≥ 2 places, creating a free-floating, paradoxically moving segment.',
    },
    {
      id: 'q-pleural-b02', topic: 'pleural', course: 'rcp103', difficulty: 3, pool: 'battle',
      q: 'Per Light\'s criteria, which fluid LDH ratio supports an EXUDATE?',
      choices: ['Fluid/serum LDH < 0.4', 'Fluid/serum LDH > 0.6', 'Fluid LDH = serum LDH', 'Fluid LDH < 100'],
      correct: 1,
      explanation: 'Light\'s criteria for exudate: protein ratio > 0.5, LDH ratio > 0.6, OR fluid LDH > 2/3 ULN serum LDH. Any one positive = exudate.',
    },

    // ---------------- INFECTIOUS / PNEUMONIA / TB / FUNGAL (4) ----------------
    {
      id: 'q-pneumonia-b01', topic: 'pneumonia', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'The leading cause of bacterial community-acquired pneumonia (CAP) is:',
      choices: ['Mycoplasma pneumoniae', 'Streptococcus pneumoniae', 'Haemophilus influenzae', 'Pseudomonas aeruginosa'],
      correct: 1,
      explanation: 'Streptococcus pneumoniae causes > 80% of bacterial CAP cases. Lobar consolidation with rust-colored sputum is classic.',
    },
    {
      id: 'q-tb-b01', topic: 'tb', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'A PPD of ≥ 5 mm induration is considered positive in which patient group?',
      choices: ['Healthy adults with no risk factors', 'HIV-positive, recent TB contact, immunosuppressed, or fibrotic CXR', 'Healthcare workers and IV drug users', 'Children under 4'],
      correct: 1,
      explanation: '≥ 5 mm cutoff: HIV+, recent close contact, immunosuppressed (steroids, transplant), fibrotic CXR changes consistent with prior TB.',
    },
    {
      id: 'q-fungal-b01', topic: 'fungal', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Blastomycosis ("Chicago Disease") often presents with:',
      choices: ['Spherules in sputum', 'Purulent productive cough with skin lesions (often the first sign of dissemination)', 'Eggshell hilar lymph node calcification', 'Caseating granulomas confined to the lungs only'],
      correct: 1,
      explanation: 'Blastomyces dermatitidis (south-central/Midwest US, Canada): productive cough, may disseminate to skin (lesions often the first clue), bones, and other organs.',
    },
    {
      id: 'q-tb-b02', topic: 'tb', course: 'rcp103', difficulty: 3, pool: 'battle',
      q: 'Which rapid molecular test detects M. tuberculosis AND rifampin resistance in under 2 hours?',
      choices: ['Mantoux PPD', 'AFB smear with Ziehl-Neelsen stain', 'Xpert MTB/RIF (and Ultra)', 'QuantiFERON-TB Gold'],
      correct: 2,
      explanation: 'Xpert MTB/RIF (and the more sensitive Ultra version) detects TB DNA and rifampin resistance markers in < 2 hours.',
    },

    // ---------------- ARDS (4) ----------------
    {
      id: 'q-ards-b01', topic: 'ards', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'Moderate ARDS per Berlin = P/F ratio:',
      choices: ['> 300', '200–300', '100–200', '≤ 100'],
      correct: 2,
      explanation: 'Berlin severity (PEEP ≥ 5): Mild 200-300, Moderate 100-200, Severe ≤ 100.',
    },
    {
      id: 'q-ards-b02', topic: 'ards', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Ventilator-associated lung injury is BEST limited by which two ARDSnet parameters?',
      choices: ['TV 10 mL/kg and Pplat ≤ 40', 'TV 4-6 mL/kg IBW and Pplat ≤ 30 cmH2O', 'TV 8 mL/kg and Pplat ≤ 25', 'TV based on actual body weight, PEEP > 20'],
      correct: 1,
      explanation: 'ARDSnet lung-protective ventilation: TV 4-6 mL/kg ideal body weight AND plateau pressure ≤ 30 cmH2O.',
    },
    {
      id: 'q-ards-b03', topic: 'ards', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'In ARDS, ABG progression typically goes from:',
      choices: ['Metabolic acidosis → metabolic alkalosis', 'Respiratory alkalosis with hypoxemia (early) → respiratory acidosis (late ventilatory failure)', 'Pure respiratory acidosis throughout', 'Metabolic alkalosis throughout'],
      correct: 1,
      explanation: 'Early ARDS: hyperventilation → respiratory alkalosis. Late ARDS: muscle fatigue and increasing dead space → respiratory acidosis (ventilatory failure).',
    },
    {
      id: 'q-ards-b04', topic: 'ards', course: 'rcp103', difficulty: 3, pool: 'battle',
      q: 'Prone positioning is most strongly indicated when P/F is below:',
      choices: ['< 300', '< 200', '< 150', '< 50'],
      correct: 2,
      explanation: 'Prone positioning is recommended for moderate-severe ARDS with P/F < 150 — reduces mortality (PROSEVA trial).',
    },

    // ---------------- ILD / PNEUMOCONIOSES (4) ----------------
    {
      id: 'q-ild-b01', topic: 'ild', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'The hallmark HRCT finding of end-stage IPF is:',
      choices: ['Tree-in-bud nodules', 'Honeycombing with traction bronchiectasis (subpleural, basal predominant)', 'Crazy paving', 'Ground-glass without fibrosis'],
      correct: 1,
      explanation: 'IPF / usual interstitial pneumonia (UIP) pattern: subpleural, basal honeycombing with traction bronchiectasis on HRCT.',
    },
    {
      id: 'q-pneumoconioses-b01', topic: 'pneumoconioses', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: '"Coal macules" — pinpoint black nodules — are characteristic of:',
      choices: ['Silicosis', 'Coal worker\'s pneumoconiosis (CWP)', 'Asbestosis', 'Berylliosis'],
      correct: 1,
      explanation: 'CWP shows coal macules from inhaled dust deposits. Severe disease progresses to progressive massive fibrosis in upper lobes.',
    },
    {
      id: 'q-ild-b02', topic: 'ild', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Nintedanib\'s mechanism in IPF is:',
      choices: ['ACE inhibition', 'Tyrosine kinase inhibition targeting fibroblast growth factor receptors', 'Beta-2 agonism', 'Anti-IgE antibody'],
      correct: 1,
      explanation: 'Nintedanib (OFEV) inhibits tyrosine kinases including FGFR/PDGFR/VEGFR — antifibrotic, slows FVC decline in IPF.',
    },
    {
      id: 'q-ild-b03', topic: 'ild', course: 'rcp103', difficulty: 3, pool: 'battle',
      q: 'Bronchoalveolar lavage (BAL) as therapy is most useful in:',
      choices: ['IPF', 'Sarcoidosis', 'Pulmonary alveolar proteinosis (PAP)', 'Asbestosis'],
      correct: 2,
      explanation: 'PAP fills alveoli with proteinaceous material. Therapeutic whole-lung lavage clears the protein/lipid debris — often needs multiple sessions.',
    },

    // ---------------- SLEEP APNEA (4) ----------------
    {
      id: 'q-sleep-apnea-b01', topic: 'sleep-apnea', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'Mild OSA = AHI of:',
      choices: ['< 5/hr', '5–15/hr', '15–30/hr', '> 30/hr'],
      correct: 1,
      explanation: 'AHI severity: Mild 5-15, Moderate 15-30, Severe > 30 events/hr.',
    },
    {
      id: 'q-sleep-apnea-b02', topic: 'sleep-apnea', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Initial CPAP pressure range for CSA per the notes is:',
      choices: ['+2 to 4 cmH2O', '+5 to 10 cmH2O', '+12 to 18 cmH2O', '+20 to 25 cmH2O'],
      correct: 1,
      explanation: 'Initial CPAP for CSA is +5 to 10 cmH2O, titrated to control events.',
    },
    {
      id: 'q-sleep-apnea-b03', topic: 'sleep-apnea', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Cheyne-Stokes respirations seen in CSA are classically associated with:',
      choices: ['Asthma', 'Heart failure (and high altitude)', 'COPD only', 'Sepsis'],
      correct: 1,
      explanation: 'Crescendo-decrescendo respirations with central apneas = Cheyne-Stokes pattern, classic in heart failure and high-altitude breathing.',
    },
    {
      id: 'q-sleep-apnea-b04', topic: 'sleep-apnea', course: 'rcp103', difficulty: 3, pool: 'battle',
      q: 'On a sleep study, OSA classification requires that what percentage of events be obstructive?',
      choices: ['≥ 25%', '≥ 50%', '≥ 75%', '100%'],
      correct: 2,
      explanation: 'OSA diagnostic criterion: ≥ 75% of events must be obstructive. If < 75%, the patient may be classified as central or mixed.',
    },

    // ---------------- NEURO-RESP / PHRENIC (4) ----------------
    {
      id: 'q-neuro-resp-b01', topic: 'neuro-resp', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'Myasthenia gravis weakness pattern is BEST described as:',
      choices: ['Ascending — "ground to brain"', 'Descending — "mind to ground," worsens with activity, improves with rest', 'Symmetric and constant', 'Distal sensory loss with normal strength'],
      correct: 1,
      explanation: 'MG: descending weakness pattern starting with bulbar/ocular muscles ("mind to ground"); fatigable, better with rest. Opposite of GBS\'s "ground to brain."',
    },
    {
      id: 'q-neuro-resp-b02', topic: 'neuro-resp', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'Per the impending-failure thresholds, MEP (cough strength) becomes concerning when below:',
      choices: ['< 20 cmH2O', '< 40 cmH2O', '< 60 cmH2O', '< 100 cmH2O'],
      correct: 1,
      explanation: 'MEP < 40 cmH2O signals weak cough/inadequate secretion clearance; combined with VC < 20 mL/kg and MIP weaker than −30 = intubate.',
    },
    {
      id: 'q-phrenic-b01', topic: 'phrenic', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'The diaphragm receives its motor innervation from:',
      choices: ['Vagus nerve (CN X)', 'Phrenic nerve, C3-C5', 'Intercostal nerves T1-T6', 'Hypoglossal nerve (CN XII)'],
      correct: 1,
      explanation: '"C3, 4, 5 keeps the diaphragm alive." Phrenic nerve arises from anterior rami of C3-C5 and provides sole motor supply to the diaphragm.',
    },
    {
      id: 'q-neuro-resp-b03', topic: 'neuro-resp', course: 'rcp103', difficulty: 3, pool: 'battle',
      q: 'First-line pharmacologic therapy for symptom control in myasthenia gravis is:',
      choices: ['IVIG indefinitely', 'Pyridostigmine (acetylcholinesterase inhibitor)', 'Botulism antitoxin', 'Riluzole'],
      correct: 1,
      explanation: 'Pyridostigmine (Mestinon) inhibits acetylcholinesterase → more ACh at the NMJ → improved strength. First-line for MG symptom management.',
    },

    // ---------------- PULM EDEMA / PE / PVD (4) ----------------
    {
      id: 'q-pulm-edema-b01', topic: 'pulm-edema', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'A normal mean pulmonary artery pressure at rest is:',
      choices: ['5–9 mmHg', '10–20 mmHg', '25–35 mmHg', '> 40 mmHg'],
      correct: 1,
      explanation: 'Normal mPAP = 10-20 mmHg. Pulmonary hypertension is defined as mPAP > 25 mmHg at rest.',
    },
    {
      id: 'q-pe-b01', topic: 'pe', course: 'rcp103', difficulty: 1, pool: 'battle',
      q: 'The MOST COMMON ECG finding in pulmonary embolism is:',
      choices: ['S1Q3T3 pattern', 'Sinus tachycardia', 'ST elevation in V1-V4', 'Delta wave'],
      correct: 1,
      explanation: 'Sinus tachycardia is by far the most common ECG finding in PE. S1Q3T3 is "classic" but uncommon.',
    },
    {
      id: 'q-pvd-b01', topic: 'pvd', course: 'rcp103', difficulty: 2, pool: 'battle',
      q: 'In WHO PH classification, Group 4 PH is caused by:',
      choices: ['Idiopathic PAH', 'Left heart disease', 'Lung disease / hypoxia', 'Chronic thromboembolic PH (CTEPH)'],
      correct: 3,
      explanation: 'Group 4 = chronic thromboembolic pulmonary hypertension (CTEPH) — sequelae of unresolved/recurrent PE. Treated with pulmonary endarterectomy when possible.',
    },
    {
      id: 'q-pe-b02', topic: 'pe', course: 'rcp103', difficulty: 3, pool: 'battle',
      q: 'The Westermark sign on CXR refers to:',
      choices: ['A wedge-shaped peripheral infarct', 'Focal oligemia/hyperlucency distal to a pulmonary embolus', 'Cardiomegaly with Kerley lines', 'Bilateral fluffy infiltrates'],
      correct: 1,
      explanation: 'Westermark sign = regional decrease in pulmonary vascular markings (oligemia/hyperlucency) distal to a PE — uncommon but suggestive.',
    },
  ];
  window.ALL_QUESTIONS = (window.ALL_QUESTIONS || []).concat(additions);
})();
