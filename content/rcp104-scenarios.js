/* ============================================================
   RCP 104 PATIENT SCENARIOS — pharmacology-flavored
   Generated from Study Brain notes (Ch 11-23)
   ============================================================ */
(function () {
  const list = [
    {
      id: 'er-tylenol-od',
      title: 'ER Bay 1: Tylenol Overdose',
      course: 'rcp104',
      intro: '19-year-old female brought in by roommate after taking "a whole bottle" of extra-strength acetaminophen approximately 3 hours ago in a suicide attempt. Nauseated, vomiting, mildly diaphoretic. Awake and tearful. No co-ingestants reported. Initial acetaminophen level pending.',
      vitals: { rr: 18, spo2: 98, hr: 102, bp: '118/74' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'Ingestion was 3 hours ago. First GI-decontamination action?',
          options: [
            { text: 'Activated charcoal 1 g/kg PO now',                 hpDelta: +20, explain: 'Correct — charcoal is most effective within 1–2 hours but can still bind acetaminophen up to ~4 hours post-ingestion. At 3 hours it is still indicated in an awake, airway-protecting patient.', next: 'd2' },
            { text: 'Induce emesis with syrup of ipecac',               hpDelta: -25, explain: 'Obsolete and dangerous. Ipecac is no longer recommended — it delays charcoal/NAC, risks aspiration, and has no proven outcome benefit.', next: 'd2' },
            { text: 'Skip decontamination — too late to matter',        hpDelta: -10, explain: 'Premature nihilism. Within the 4-hour window charcoal still reduces absorption. Skipping it allows more drug to reach the liver.', next: 'd2' },
          ]},
        { id: 'd2', prompt: '4-hour acetaminophen level plots above the treatment line on the Rumack-Matthew nomogram. Antidote of choice?',
          options: [
            { text: 'N-acetylcysteine (Mucomyst) — IV or PO loading dose', hpDelta: +20, explain: 'Correct — NAC is the antidote. It replenishes hepatic glutathione, neutralizing the toxic NAPQI metabolite. Most effective if started within 8 hours but still beneficial later.', next: 'd3' },
            { text: 'Naloxone (Narcan) IV push',                          hpDelta: -25, explain: 'Wrong drug entirely. Naloxone is the opioid antagonist — it does nothing for acetaminophen toxicity and wastes critical time.', next: 'd3' },
            { text: 'Flumazenil IV',                                      hpDelta: -25, explain: 'Flumazenil is the benzodiazepine antagonist — irrelevant here and can precipitate seizures. NAC is the answer.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Patient gags repeatedly on the foul-smelling oral NAC and vomits two doses. Best next step?',
          options: [
            { text: 'Switch to IV NAC (21-hour protocol)',                hpDelta: +20, explain: 'Correct — IV NAC bypasses GI intolerance. The "rotten egg" sulfur smell of PO Mucomyst commonly causes emesis. IV gives equivalent hepatoprotection.', next: null },
            { text: 'Stop NAC — liver enzymes are still normal',          hpDelta: -25, explain: 'Catastrophic. AST/ALT lag 24–36 hours behind ingestion. By the time enzymes rise, hepatic necrosis is established. Continue NAC.', next: null },
            { text: 'Give a second dose of activated charcoal instead',   hpDelta: -15, explain: 'Charcoal does not reverse already-absorbed drug. After ~4 hours, NAC is the only therapy that prevents hepatotoxicity.', next: null },
          ]},
      ],
    },
    {
      id: 'er-status-asthma',
      title: 'ER Bay 3: Status Asthmaticus',
      course: 'rcp104',
      intro: '28-year-old known asthmatic, ran out of inhaler 4 days ago, now presenting with severe SOB unresponsive to home albuterol MDI. Tripoding, speaking in 2-3 word sentences, accessory muscle use, expiratory wheezes throughout. Peak flow 30% of personal best.',
      vitals: { rr: 34, spo2: 89, hr: 128, bp: '152/94' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'First-line bronchodilator therapy?',
          options: [
            { text: 'Continuous nebulized albuterol + ipratropium',      hpDelta: +20, explain: 'Correct — SABA (albuterol) is first-line beta-2 agonist; adding ipratropium (anticholinergic) provides synergistic bronchodilation in severe attacks. Continuous neb beats intermittent in status.', next: 'd2' },
            { text: 'IV propranolol to slow the tachycardia',            hpDelta: -25, explain: 'Catastrophic — non-selective beta-blockade triggers profound bronchospasm in asthmatics. Tachycardia is appropriate physiology and from beta-agonists.', next: 'd2' },
            { text: 'Cromolyn sodium nebulizer',                         hpDelta: -20, explain: 'Cromolyn is a mast-cell stabilizer used for PROPHYLAXIS, not acute attacks. It has no bronchodilator effect and is useless in status asthmaticus.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'After 30 min of continuous bronchodilators, still wheezing and SpO2 90%. Next medication to add?',
          options: [
            { text: 'IV or IM systemic corticosteroids (methylprednisolone)', hpDelta: +20, explain: 'Correct — systemic steroids reduce airway inflammation; effect takes 4–6 hours so give EARLY. Inhaled steroids are too slow for acute exacerbations.', next: 'd3' },
            { text: 'Inhaled fluticasone (Flovent) MDI',                 hpDelta: -15, explain: 'Inhaled corticosteroids (Flovent, Pulmicort) are CONTROLLERS for maintenance — they have no role in acute rescue. Use systemic steroids.', next: 'd3' },
            { text: 'IV theophylline loading dose',                      hpDelta: -10, explain: 'Theophylline (xanthine) has a narrow therapeutic window with cardiac/CNS toxicity and is no longer recommended in acute asthma. Steroids first.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Despite albuterol, ipratropium, and IV steroids, patient is exhausted with rising PaCO2. Last-resort medication before intubation?',
          options: [
            { text: 'IV magnesium sulfate 2 g over 20 min',              hpDelta: +20, explain: 'Correct — magnesium is a smooth-muscle relaxant adjunct in severe refractory asthma. Bridges to either response or definitive airway with ketamine RSI.', next: null },
            { text: 'IV diphenhydramine (Benadryl)',                     hpDelta: -20, explain: 'Antihistamines dry secretions and cause sedation — both bad in asthma. They do not reverse bronchospasm.', next: null },
            { text: 'IV metoprolol to reduce myocardial demand',         hpDelta: -25, explain: 'Beta-blocker in asthma = bronchospasm and arrest. Even "cardioselective" beta-1 blockers lose selectivity at high doses and are contraindicated.', next: null },
          ]},
      ],
    },
    {
      id: 'icu-vap',
      title: 'ICU 4: Ventilator-Associated Pneumonia',
      course: 'rcp104',
      intro: '67-year-old male, day 6 of mechanical ventilation post-CVA. New fever to 38.9°C, rising WBC, purulent yellow tracheal secretions, new RLL infiltrate on CXR. FiO2 requirement jumped from 0.40 to 0.60 overnight. Sputum sent for Gram stain and culture.',
      vitals: { rr: 24, spo2: 91, hr: 112, bp: '108/64' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'Gram stain returns: "Gram-positive cocci in clusters AND Gram-negative rods, many WBCs." Empiric antibiotic strategy?',
          options: [
            { text: 'Vancomycin + piperacillin-tazobactam (Zosyn)',      hpDelta: +20, explain: 'Correct — late-onset VAP needs MRSA coverage (vancomycin for gram-pos cocci in clusters = Staph) PLUS anti-pseudomonal coverage (Zosyn or cefepime for gram-neg rods). Dual coverage until cultures speciate.', next: 'd2' },
            { text: 'Oral amoxicillin monotherapy',                      hpDelta: -25, explain: 'Wildly inadequate. Oral penicillin has no MRSA or Pseudomonas coverage and poor bioavailability in critically ill patients. VAP needs IV broad-spectrum.', next: 'd2' },
            { text: 'Ceftriaxone alone',                                 hpDelta: -15, explain: 'Ceftriaxone is fine for community-acquired pneumonia but misses BOTH MRSA and Pseudomonas — the two organisms that kill in VAP.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'You select cefepime instead of Zosyn for the gram-negative coverage. Why is gentamicin/tobramycin a problematic monotherapy choice here?',
          options: [
            { text: 'Aminoglycosides have poor lung penetration + nephrotoxic/ototoxic',  hpDelta: +20, explain: 'Correct — aminoglycosides penetrate lung parenchyma poorly and carry significant renal and 8th-cranial-nerve toxicity. They are used as ADJUNCTS, not monotherapy, for Pseudomonas pneumonia.', next: 'd3' },
            { text: 'Aminoglycosides only cover gram-positives',         hpDelta: -20, explain: 'Backwards — aminoglycosides target gram-NEGATIVES (including Pseudomonas). The issue is toxicity and lung penetration, not spectrum.', next: 'd3' },
            { text: 'Aminoglycosides cause bronchospasm when inhaled',   hpDelta: -10, explain: 'Inhaled tobramycin (TOBI) is actually used in CF — bronchospasm is a side effect but not the reason to avoid IV aminoglycoside monotherapy in VAP.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Day 3: cultures grow MSSA (methicillin-SENSITIVE Staph aureus) only — no Pseudomonas, no MRSA. Antibiotic plan?',
          options: [
            { text: 'De-escalate to nafcillin or cefazolin; stop vanc and cefepime', hpDelta: +20, explain: 'Correct — antibiotic stewardship. MSSA is better treated with beta-lactams (nafcillin/cefazolin) than vancomycin. Narrowing reduces resistance, C. diff, and toxicity.', next: null },
            { text: 'Continue vancomycin + cefepime for full 14 days',   hpDelta: -15, explain: 'Drives resistance, vanc nephrotoxicity, and C. difficile. Once culture data is back, de-escalate. Modern VAP courses are 7–8 days when responding.', next: null },
            { text: 'Add a third antibiotic "just to be safe"',          hpDelta: -20, explain: 'More antibiotics = more resistance, more toxicity, more C. diff — without benefit. Cultures are guiding therapy; trust them and narrow.', next: null },
          ]},
      ],
    },
    {
      id: 'er-opioid-od',
      title: 'ER Bay 5: Opioid Overdose',
      course: 'rcp104',
      intro: '34-year-old male found unresponsive in bathroom by family with a syringe nearby. EMS reports pinpoint pupils, shallow agonal respirations, cyanotic lips. On arrival: GCS 5, RR 4 with periods of apnea. Track marks on both arms. Suspected heroin or fentanyl overdose.',
      vitals: { rr: 4, spo2: 78, hr: 58, bp: '92/58' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'Patient is apneic with SpO2 78%. What do you do FIRST while drawing up the antidote?',
          options: [
            { text: 'Bag-valve-mask ventilation with 100% O2',           hpDelta: +20, explain: 'Correct — hypoxia kills opioid overdoses, not the opioid itself. Supportive BVM ventilation buys time and corrects the immediate threat while naloxone is prepared.', next: 'd2' },
            { text: 'Push 2 mg naloxone IV immediately and wait',        hpDelta: -10, explain: 'Half-right — naloxone is correct but ignoring the hypoxic apnea while it works (1–2 min) risks anoxic brain injury. Always ventilate first or simultaneously.', next: 'd2' },
            { text: 'Start chest compressions',                          hpDelta: -20, explain: 'Patient has a pulse of 58 — this is respiratory arrest, not cardiac arrest. Compressions on a perfusing patient are harmful; ventilate them.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'Best initial naloxone (Narcan) dose and route for this patient?',
          options: [
            { text: '0.4–2 mg IV/IM/IN, titrated to respiratory effort', hpDelta: +20, explain: 'Correct — start low and titrate to RESPIRATIONS, not full consciousness. Goal is RR ≥ 12, not waking the patient fully (which causes severe withdrawal and combativeness).', next: 'd3' },
            { text: '10 mg IV push to fully wake the patient',           hpDelta: -25, explain: 'Massive overdose of antagonist precipitates violent withdrawal — vomiting, aspiration, sympathetic storm, flash pulmonary edema, and a combative patient who self-extubates lines.', next: 'd3' },
            { text: 'Flumazenil 0.2 mg IV',                              hpDelta: -25, explain: 'Wrong antagonist — flumazenil reverses BENZODIAZEPINES, not opioids. Pinpoint pupils + apnea = opioid; use naloxone.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Patient wakes with naloxone, then 45 minutes later becomes somnolent and bradypneic again. Most likely cause?',
          options: [
            { text: 'Naloxone half-life is shorter than the opioid — re-narcotization', hpDelta: +20, explain: 'Correct — naloxone half-life is ~30–60 min. Long-acting opioids (methadone, fentanyl analogues, sustained-release) outlast it. Redose naloxone or start an infusion; admit for observation.', next: null },
            { text: 'New stroke from the overdose event',                hpDelta: -10, explain: 'Possible but far less likely than re-narcotization given the textbook timing. Always assume opioid recurrence first and redose naloxone.', next: null },
            { text: 'Discharge — patient is "fine" after first dose',    hpDelta: -25, explain: 'Classic killer. Discharging an opioid overdose after a single dose of naloxone, especially with fentanyl/methadone on the street, leads to home re-arrest. Observe minimum 4–6 hours.', next: null },
          ]},
      ],
    },
    {
      id: 'code-blue',
      title: 'Code Blue: PEA Arrest',
      course: 'rcp104',
      intro: '58-year-old post-op day 2 from total knee arthroplasty. Nurse calls a code — patient unresponsive, no pulse. Monitor shows organized narrow-complex rhythm at 40 bpm but no palpable pulse. CPR in progress. IV access is poor; only an ETT is secured.',
      vitals: { rr: 0, spo2: 0, hr: 40, bp: '0/0' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'No IV/IO access yet — ETT is in place. Which drugs can be given via the endotracheal tube?',
          options: [
            { text: 'NAVEL: Naloxone, Atropine, Vasopressin, Epinephrine, Lidocaine', hpDelta: +20, explain: 'Correct — the NAVEL acronym. ETT-administered drugs need 2–2.5× the IV dose, diluted in 5–10 mL NS, followed by several positive-pressure breaths to aerosolize into alveoli.', next: 'd2' },
            { text: 'Sodium bicarbonate and calcium chloride down the ETT',          hpDelta: -25, explain: 'Bicarb and calcium are NOT in NAVEL — they damage the airway mucosa and inactivate. Only lipid-soluble drugs (NAVEL) absorb via the trachea.', next: 'd2' },
            { text: 'Magnesium sulfate and amiodarone down the ETT',                 hpDelta: -20, explain: 'Neither is in the NAVEL list. They require IV/IO access. Get IO access (humeral or tibial) immediately if IV fails.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'IO access obtained. Pharmacologic management of PEA arrest?',
          options: [
            { text: 'Epinephrine 1 mg IV/IO every 3–5 minutes + CPR',    hpDelta: +20, explain: 'Correct — epinephrine 1 mg (1:10,000) q3–5min is the cornerstone of pulseless rhythms in ACLS. Plus high-quality CPR and search for reversible causes.', next: 'd3' },
            { text: 'Atropine 1 mg IV — rhythm is slow',                 hpDelta: -20, explain: 'Atropine was REMOVED from PEA/asystole algorithms in 2010 ACLS — no benefit demonstrated. It is still used for symptomatic bradycardia with a PULSE, but not in arrest.', next: 'd3' },
            { text: 'Defibrillate at 200 J',                             hpDelta: -25, explain: 'PEA is a non-shockable rhythm (organized electrical activity without mechanical contraction). Shocking PEA does not help — only VF/pulseless VT respond to defibrillation.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Post-op patient, sudden PEA — which reversible cause (H\'s & T\'s) is most likely and how do you treat?',
          options: [
            { text: 'Pulmonary embolism (Thrombosis) — consider thrombolytics', hpDelta: +20, explain: 'Correct — post-op orthopedic patient with sudden cardiovascular collapse and PEA is a classic massive PE presentation. Empiric tPA (alteplase) is reasonable in arrest from suspected PE.', next: null },
            { text: 'Hypoglycemia — push D50',                           hpDelta: -10, explain: 'Hypoglycemia rarely causes PEA arrest acutely without prior symptoms. The post-op DVT/PE picture is far more likely; check glucose but treat the likely cause.', next: null },
            { text: 'Stop CPR — no reversible cause possible',           hpDelta: -25, explain: 'Always run the H\'s and T\'s in PEA: Hypoxia, Hypovolemia, H+ (acidosis), Hypo/Hyperkalemia, Hypothermia, Tension pneumo, Tamponade, Toxins, Thrombosis (PE/MI). Stopping ignores treatable causes.', next: null },
          ]},
      ],
    },
    {
      id: 'icu-htn-crisis',
      title: 'ICU 6: Hypertensive Emergency',
      course: 'rcp104',
      intro: '72-year-old with chronic HTN brought in for severe tearing chest pain radiating to the back. Diaphoretic, anxious. CXR shows widened mediastinum. CT confirms acute Type B aortic dissection. BP 220/130 in both arms. End-organ involvement requires immediate BP control.',
      vitals: { rr: 22, spo2: 96, hr: 118, bp: '220/130' },
      startingHp: 60,
      decisions: [
        { id: 'd1', prompt: 'Target BP and timing for hypertensive EMERGENCY (with end-organ damage)?',
          options: [
            { text: 'Reduce MAP by ≤25% in the first hour, then gradually', hpDelta: +20, explain: 'Correct — aggressive overcorrection causes watershed strokes, MI, and acute kidney injury from hypoperfusion. ≤25% MAP reduction in the first hour is the safe target, except in aortic dissection where SBP goal is <120 in the first 20 min.', next: 'd2' },
            { text: 'Crash BP to normal (120/80) in 10 minutes',         hpDelta: -25, explain: 'Catastrophic. Rapid normalization causes cerebral, coronary, and renal hypoperfusion in a patient whose autoregulation curve has shifted rightward. Watershed strokes are a classic complication.', next: 'd2' },
            { text: 'No intervention — patient is asymptomatic',          hpDelta: -25, explain: 'Patient has an aortic dissection — definite end-organ involvement. This is an EMERGENCY, not urgency. Untreated dissection extends and ruptures.', next: 'd2' },
          ]},
        { id: 'd2', prompt: 'For aortic dissection specifically, first-line IV agent?',
          options: [
            { text: 'IV beta-blocker (esmolol/labetalol) FIRST, then vasodilator', hpDelta: +20, explain: 'Correct — in dissection you must blunt the dP/dt (shear force) before vasodilating. Beta-blocker first slows HR and contractility; adding a pure vasodilator alone causes reflex tachycardia that worsens the tear.', next: 'd3' },
            { text: 'Nitroprusside alone as a single agent',             hpDelta: -20, explain: 'Pure vasodilator → reflex tachycardia → increased aortic shear → propagating dissection. Always pair with a beta-blocker (or use combined-action labetalol).', next: 'd3' },
            { text: 'Sublingual nifedipine to crash the BP',             hpDelta: -25, explain: 'Sublingual nifedipine is obsolete and dangerous — unpredictable precipitous drops cause stroke and MI. Not used in modern hypertensive emergency management.', next: 'd3' },
          ]},
        { id: 'd3', prompt: 'Patient stabilizes. Pharmacist asks which long-term oral antihypertensive to start. Patient has a chronic dry cough on his current ACE inhibitor (lisinopril). Best switch?',
          options: [
            { text: 'Switch lisinopril to an ARB (e.g., losartan)',       hpDelta: +20, explain: 'Correct — ACEI-induced dry cough comes from bradykinin accumulation (ACE also degrades bradykinin). ARBs block angiotensin II at the receptor without bradykinin effect, so no cough.', next: null },
            { text: 'Add nitroglycerin SL PRN as the antihypertensive',   hpDelta: -20, explain: 'Nitroglycerin is for ANGINA (preload reducer) — not a chronic antihypertensive. Tolerance develops quickly and it does not address chronic HTN.', next: null },
            { text: 'Restart lisinopril — the cough is unrelated',         hpDelta: -15, explain: 'Dry, non-productive cough is the classic ACEI side effect (~10–20% of patients) from bradykinin. Switching to an ARB is the textbook fix.', next: null },
          ]},
      ],
    },
  ];
  window.ALL_SCENARIOS = (window.ALL_SCENARIOS || []).filter(s => s.course !== 'rcp104').concat(list);
})();
