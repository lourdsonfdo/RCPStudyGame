/* ============================================================
   RCP 104 BATTLE POOL — additional boss-fight questions
   ============================================================ */
(function () {
  const additions = [
    /* ---------- Adrenergics (4) ---------- */
    {
      id: 'q-adren-b01', topic: 'adrenergics', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Brovana (arformoterol) is dosed how?',
      choices: ['MDI BID','SVN nebulizer BID for COPD','Once-daily DPI','Oral tablet'],
      correct: 1,
      explanation: 'Arformoterol (Brovana) is a single-isomer LABA available as a nebulizer solution for COPD maintenance, BID.',
    },
    {
      id: 'q-adren-b02', topic: 'adrenergics', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Catecholamines are rapidly inactivated by which enzyme?',
      choices: ['Acetylcholinesterase','COMT (catechol-O-methyltransferase)','Carbonic anhydrase','Phosphodiesterase'],
      correct: 1,
      explanation: 'COMT and MAO inactivate catecholamines, limiting duration (1.5–3 hr) and oral effectiveness.',
    },
    {
      id: 'q-adren-b03', topic: 'adrenergics', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'The "keyhole theory" states that as the β-agonist side chain ____, β2 specificity ____.',
      choices: ['shrinks; rises','enlarges; rises','enlarges; falls','shrinks; falls'],
      correct: 1,
      explanation: 'Larger side chains on the catechol nucleus fit only the β2 receptor → more β2 specificity, fewer α/β1 effects.',
    },
    {
      id: 'q-adren-b04', topic: 'adrenergics', course: 'rcp104', difficulty: 3, pool: 'battle',
      q: 'Which ultra-LABA is only available as a combination product (with fluticasone or umeclidinium)?',
      choices: ['Salmeterol','Vilanterol','Indacaterol','Olodaterol'],
      correct: 1,
      explanation: 'Vilanterol is not sold as monotherapy — found in Breo Ellipta, Anoro Ellipta, and Trelegy Ellipta.',
    },

    /* ---------- Anticholinergics (4) ---------- */
    {
      id: 'q-antich-b01', topic: 'anticholinergics', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Incruse Ellipta is the brand name for?',
      choices: ['Tiotropium','Umeclidinium (LAMA, once daily DPI)','Glycopyrrolate','Aclidinium'],
      correct: 1,
      explanation: 'Incruse Ellipta = umeclidinium bromide 62.5 µg once daily for COPD.',
    },
    {
      id: 'q-antich-b02', topic: 'anticholinergics', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Anoro Ellipta combines umeclidinium with which LABA?',
      choices: ['Salmeterol','Formoterol','Vilanterol','Olodaterol'],
      correct: 2,
      explanation: 'Anoro Ellipta = umeclidinium + vilanterol (LAMA + ultra-LABA) once daily for COPD.',
    },
    {
      id: 'q-antich-b03', topic: 'anticholinergics', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Tudorza Pressair (aclidinium) is dosed?',
      choices: ['Once daily DPI','BID DPI 400 µg/inhalation','QID MDI','Continuous SVN'],
      correct: 1,
      explanation: 'Aclidinium (Tudorza Pressair) DPI 400 µg, ONE inhalation BID, for COPD maintenance.',
    },
    {
      id: 'q-antich-b04', topic: 'anticholinergics', course: 'rcp104', difficulty: 3, pool: 'battle',
      q: 'Stiolto Respimat combines tiotropium with?',
      choices: ['Vilanterol','Olodaterol','Salmeterol','Formoterol'],
      correct: 1,
      explanation: 'Stiolto Respimat = tiotropium + olodaterol (LAMA + ultra-LABA) once daily for COPD.',
    },

    /* ---------- Xanthines (3) ---------- */
    {
      id: 'q-xan-b01', topic: 'xanthines', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Theophylline serum level >30 µg/mL most commonly causes?',
      choices: ['No effect','Cardiac arrhythmias','Mild nausea only','Therapeutic effect'],
      correct: 1,
      explanation: '>20 = nausea, >30 = cardiac arrhythmias, 40–45 = seizures. Disease-specific therapeutic ranges: 5–15 µg/mL (asthma), 5–10 µg/mL (COPD).',
    },
    {
      id: 'q-xan-b02', topic: 'xanthines', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Loading dose of caffeine citrate (Cafcit) for apnea of prematurity?',
      choices: ['5 mg/kg','10 mg/kg','20 mg/kg','40 mg/kg'],
      correct: 2,
      explanation: 'Cafcit: load 20 mg/kg, maintain 5 mg/kg/day PO or IV.',
    },
    {
      id: 'q-xan-b03', topic: 'xanthines', course: 'rcp104', difficulty: 3, pool: 'battle',
      q: 'Proposed mechanism of theophylline includes?',
      choices: ['Mast cell stabilization','Phosphodiesterase inhibition → ↑ cAMP and adenosine antagonism','5-LO inhibition','Steroid receptor binding'],
      correct: 1,
      explanation: 'Theories: PDE inhibition (↑ cAMP), adenosine antagonism, catecholamine release — exact MOA still debated.',
    },

    /* ---------- Mucus / Mucolytics (3) ---------- */
    {
      id: 'q-muc-b01', topic: 'mucus-control', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Trade name for N-acetylcysteine?',
      choices: ['Mucinex','Mucomyst','Pulmozyme','Survanta'],
      correct: 1,
      explanation: 'Mucomyst = N-acetylcysteine. Mucinex = guaifenesin (expectorant).',
    },
    {
      id: 'q-muc-b02', topic: 'mucolytics', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Which medication should NOT be mixed in the same nebulizer with NAC?',
      choices: ['Water','Tobramycin','Albuterol','Saline'],
      correct: 1,
      explanation: 'NAC is incompatible with aminoglycosides (tobramycin), erythromycin, tetracyclines, ampicillin, amphotericin B.',
    },
    {
      id: 'q-muc-b03', topic: 'mucus-control', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'A "mucoregulatory" agent does what?',
      choices: ['Severs disulfide bonds','Reduces VOLUME of airway mucus secretion','Cleaves DNA','Increases ciliary beat'],
      correct: 1,
      explanation: 'Mucoregulatory = reduces mucus volume (e.g., anticholinergics, glucocorticoids). Mucolytic = degrades polymers.',
    },

    /* ---------- Surfactant (3) ---------- */
    {
      id: 'q-surf-b01', topic: 'surfactant', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Curosurf is derived from?',
      choices: ['Bovine','Porcine','Synthetic','Human'],
      correct: 1,
      explanation: 'Poractant alfa (Curosurf) = porcine. Survanta = bovine. Infasurf = calf BAL.',
    },
    {
      id: 'q-surf-b02', topic: 'surfactant', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Beractant (Survanta) dose is?',
      choices: ['1 mg/kg','4 mg/kg of birth weight','10 mg/kg','20 mg/kg'],
      correct: 1,
      explanation: 'Beractant: 4 mg/kg birth weight via ETT in quarter doses; may repeat ≥6 hours later.',
    },
    {
      id: 'q-surf-b03', topic: 'surfactant', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'LaPlace\'s law applied to alveoli: pressure = ?',
      choices: ['(4 × surface tension) / radius','(2 × surface tension) / radius','surface tension × radius','radius / surface tension'],
      correct: 1,
      explanation: 'Single air–liquid interface in alveoli: P = 2T/r. Surfactant lowers T → ↓ pressure needed to keep alveolus open.',
    },

    /* ---------- Corticosteroids (3) ---------- */
    {
      id: 'q-cort-b01', topic: 'corticosteroids', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Dulera is the combination of?',
      choices: ['Fluticasone + salmeterol','Mometasone + formoterol','Budesonide + formoterol','Fluticasone + vilanterol'],
      correct: 1,
      explanation: 'Dulera = mometasone furoate + formoterol fumarate (ICS/LABA MDI).',
    },
    {
      id: 'q-cort-b02', topic: 'corticosteroids', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Cortisol release peaks around what time of day?',
      choices: ['Midnight','Early morning (~8 a.m.)','Noon','Evening'],
      correct: 1,
      explanation: 'Cortisol follows a diurnal rhythm with peak ~8 a.m. and nadir near midnight.',
    },
    {
      id: 'q-cort-b03', topic: 'corticosteroids', course: 'rcp104', difficulty: 3, pool: 'battle',
      q: 'Trelegy Ellipta combines which three agents?',
      choices: ['Budesonide + formoterol + tiotropium','Fluticasone furoate + umeclidinium + vilanterol','Mometasone + glycopyrrolate + olodaterol','Beclomethasone + ipratropium + albuterol'],
      correct: 1,
      explanation: 'Trelegy = fluticasone furoate + umeclidinium + vilanterol (ICS/LAMA/LABA once daily DPI).',
    },

    /* ---------- Nonsteroidal / LTRA (3) ---------- */
    {
      id: 'q-nonst-b01', topic: 'leukotrienes', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Singulair (montelukast) is dosed?',
      choices: ['BID inhaled','PO once daily in the evening','QID MDI','IV q8h'],
      correct: 1,
      explanation: 'Montelukast 10 mg PO once daily in the evening (4–5 mg for children).',
    },
    {
      id: 'q-nonst-b02', topic: 'leukotrienes', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Zyflo (zileuton) and Accolate (zafirlukast) share which monitoring requirement?',
      choices: ['Renal panel','Liver function tests','Bone density','EKG'],
      correct: 1,
      explanation: 'Both can elevate liver enzymes — monitor LFTs.',
    },
    {
      id: 'q-nonst-b03', topic: 'nonsteroidal', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Cromolyn sodium is delivered most often via?',
      choices: ['Oral tablet','SVN nebulizer (or MDI historically)','IV push','IM injection'],
      correct: 1,
      explanation: 'Cromolyn is delivered via SVN (or formerly MDI/intranasal); prophylactic only — NOT for acute attacks.',
    },

    /* ---------- Anti-infective / CF (3) ---------- */
    {
      id: 'q-antiinf-b01', topic: 'ribavirin', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'A major occupational concern with aerosolized ribavirin is?',
      choices: ['Bronchospasm in staff','Teratogenic risk — pregnant staff should not enter','Hyperkalemia','Hyperglycemia'],
      correct: 1,
      explanation: 'Ribavirin is teratogenic; pregnant caregivers must avoid exposure. Use scavenger hoods/SPAG-2 with filters.',
    },
    {
      id: 'q-antiinf-b02', topic: 'cf', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'TOBI dose for chronic CF Pseudomonas is?',
      choices: ['100 mg daily','300 mg BID via nebulizer','500 mg QID','1 g once weekly'],
      correct: 1,
      explanation: 'TOBI 300 mg BID via nebulizer, 28 days on / 28 days off cycles.',
    },
    {
      id: 'q-antiinf-b03', topic: 'pentamidine', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Pentamidine 300 mg is reconstituted with how much sterile water?',
      choices: ['3 mL','6 mL sterile water','15 mL normal saline','30 mL D5W'],
      correct: 1,
      explanation: 'Pentamidine 300 mg vial + 6 mL sterile water. Saline causes precipitation.',
    },

    /* ---------- Antimicrobials (3) ---------- */
    {
      id: 'q-amx-b01', topic: 'tb-meds', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Ethambutol\'s most distinctive serious side effect is?',
      choices: ['Orange body fluids','Optic neuritis (red-green color change, decreased acuity)','Hyperuricemia and gout','Peripheral neuropathy'],
      correct: 1,
      explanation: 'Ethambutol → optic neuritis. Rifampin → orange fluids. Pyrazinamide → hyperuricemia. INH → peripheral neuropathy (give B6).',
    },
    {
      id: 'q-amx-b02', topic: 'vap-meds', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'A 5th-generation cephalosporin with MRSA coverage is?',
      choices: ['Cefazolin','Cefepime','Ceftaroline','Ceftriaxone'],
      correct: 2,
      explanation: 'Ceftaroline is the only β-lactam cephalosporin with MRSA activity (no Pseudomonas coverage).',
    },
    {
      id: 'q-amx-b03', topic: 'antimicrobial', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Vancomycin trough levels are monitored to balance efficacy vs?',
      choices: ['Hepatotoxicity','Nephrotoxicity (and red-man syndrome with rapid infusion)','Cardiotoxicity','Optic neuritis'],
      correct: 1,
      explanation: 'Vancomycin is nephrotoxic; rapid IV infusion causes red-man syndrome (histamine release). Slow infusion ≥60 min.',
    },

    /* ---------- Cold-cough (3) ---------- */
    {
      id: 'q-cough-b01', topic: 'cold-cough', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Robitussin DM contains?',
      choices: ['Diphenhydramine + pseudoephedrine','Guaifenesin + dextromethorphan','Acetaminophen + codeine','Loratadine + pseudoephedrine'],
      correct: 1,
      explanation: 'Robitussin DM = guaifenesin (expectorant) + dextromethorphan (non-narcotic antitussive).',
    },
    {
      id: 'q-cough-b02', topic: 'cold-cough', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Flu (influenza) and the common cold differ in that influenza typically presents with?',
      choices: ['No fever, just sneezing','Abrupt high fever, myalgias, marked fatigue','Only nasal congestion','GI predominant symptoms'],
      correct: 1,
      explanation: 'Influenza = abrupt high fever, body aches, severe fatigue. Common cold = gradual sore throat, congestion, low/no fever.',
    },
    {
      id: 'q-cough-b03', topic: 'cold-cough', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Tamiflu (oseltamivir) should ideally be started?',
      choices: ['Day 7 of illness','Within 48 hours of symptom onset','Only after lab confirmation','For RSV only'],
      correct: 1,
      explanation: 'Oseltamivir is most effective when started within 48 hours of influenza A or B symptom onset.',
    },

    /* ---------- Emphysema / NO / Smoking (3) ---------- */
    {
      id: 'q-emph-b01', topic: 'emphysema-rx', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'α1-Proteinase Inhibitor (Prolastin-C) is dosed?',
      choices: ['Aerosolized BID','IV 60 mg/kg once weekly','PO daily','IM monthly'],
      correct: 1,
      explanation: 'API: IV 60 mg/kg once weekly, lifelong. Augments deficient α1-AT but cannot reverse existing damage.',
    },
    {
      id: 'q-no-b01', topic: 'nitric-oxide', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Standard iNO starting dose for PPHN?',
      choices: ['5 ppm','20 ppm','40 ppm','80 ppm'],
      correct: 1,
      explanation: '20 ppm. Higher doses increase MetHb and NO2 without added benefit.',
    },
    {
      id: 'q-smk-b01', topic: 'smoking-cessation', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Chantix is the trade name for?',
      choices: ['Bupropion','Varenicline','Nortriptyline','Clonidine'],
      correct: 1,
      explanation: 'Chantix = varenicline. Zyban = bupropion. Both are first-line non-NRT options.',
    },

    /* ---------- NMBA (3) ---------- */
    {
      id: 'q-nmba-b01', topic: 'nmba', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Train-of-four (TOF) goal for ICU paralysis is typically?',
      choices: ['0 of 4','1–2 of 4','3 of 4','4 of 4'],
      correct: 1,
      explanation: '1–2/4 twitches = adequate paralysis without overdose. 0/4 risks prolonged weakness.',
    },
    {
      id: 'q-nmba-b02', topic: 'nmba', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Sugammadex reverses which NMBAs?',
      choices: ['Succinylcholine','Rocuronium and vecuronium','Cisatracurium and atracurium','All depolarizing agents'],
      correct: 1,
      explanation: 'Sugammadex encapsulates aminosteroid NMBAs — rocuronium (best) and vecuronium. NOT cisatracurium or succinylcholine.',
    },
    {
      id: 'q-nmba-b03', topic: 'nmba', course: 'rcp104', difficulty: 3, pool: 'battle',
      q: 'Malignant hyperthermia is treated with?',
      choices: ['Naloxone','Dantrolene','Flumazenil','Atropine'],
      correct: 1,
      explanation: 'Dantrolene blocks Ca2+ release from the SR — treats MH triggered by succinylcholine or volatile anesthetics.',
    },

    /* ---------- Diuretics (3) ---------- */
    {
      id: 'q-diur-b01', topic: 'diuretics', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'HCTZ (hydrochlorothiazide) is which class?',
      choices: ['Loop','Thiazide','Potassium-sparing','Osmotic'],
      correct: 1,
      explanation: 'HCTZ is the prototypical thiazide diuretic — works at the distal convoluted tubule.',
    },
    {
      id: 'q-diur-b02', topic: 'diuretics', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Bumex (bumetanide) is what class and how does it compare to Lasix?',
      choices: ['Thiazide; weaker','Loop; ~40× more potent than furosemide on a mg basis','Osmotic; same potency','Aldosterone antagonist'],
      correct: 1,
      explanation: 'Bumetanide is a loop diuretic roughly 40× more potent than furosemide mg-for-mg (1 mg bumex ≈ 40 mg lasix).',
    },
    {
      id: 'q-diur-b03', topic: 'diuretics', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'About what % of cardiac output flows to the kidneys?',
      choices: ['5%','10%','~22–25%','50%'],
      correct: 2,
      explanation: 'Per Ch 19: kidneys receive ~22% of cardiac output (highest blood flow per gram of any organ).',
    },

    /* ---------- CNS / Opioids / Benzos (3) ---------- */
    {
      id: 'q-cns-b01', topic: 'opioids', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Narcan is the trade name for?',
      choices: ['Flumazenil','Naloxone','Naltrexone','Methadone'],
      correct: 1,
      explanation: 'Narcan = naloxone — short-acting µ-opioid antagonist; reverses opioid respiratory depression.',
    },
    {
      id: 'q-cns-b02', topic: 'benzos', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Romazicon is the trade name for?',
      choices: ['Naloxone','Flumazenil','Lorazepam','Midazolam'],
      correct: 1,
      explanation: 'Romazicon = flumazenil — reverses benzodiazepine overdose. Caution: may precipitate seizures in chronic users.',
    },
    {
      id: 'q-cns-b03', topic: 'cns-drugs', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Which class is the 1st-line treatment for delirium tremens?',
      choices: ['Opioids','Benzodiazepines (lorazepam, diazepam)','Antipsychotics','Beta-blockers'],
      correct: 1,
      explanation: 'Benzodiazepines are the cornerstone of DT treatment — they replace lost GABA tone and prevent seizures.',
    },

    /* ---------- Vasopressors / Antiarrhythmics / NAVEL (3) ---------- */
    {
      id: 'q-vp-b01', topic: 'vasopressors', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Cardiac output equation?',
      choices: ['SV × HR','BP × HR','MAP × CVP','SV ÷ HR'],
      correct: 0,
      explanation: 'CO = Stroke Volume × Heart Rate. Normal ≈ 4–8 L/min.',
    },
    {
      id: 'q-vp-b02', topic: 'antiarrhythmics', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'First-dose adenosine for SVT is?',
      choices: ['1 mg slow IV','6 mg rapid IV push followed by saline flush','12 mg over 1 minute','25 mg infusion'],
      correct: 1,
      explanation: 'Adenosine 6 mg rapid IV push (with saline flush) → if no conversion, 12 mg, may repeat 12 mg.',
    },
    {
      id: 'q-vp-b03', topic: 'navel', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'What does the "V" in NAVEL stand for?',
      choices: ['Verapamil','Vasopressin','Vecuronium','Versed'],
      correct: 1,
      explanation: 'NAVEL = Naloxone, Atropine, Vasopressin, Epinephrine, Lidocaine.',
    },

    /* ---------- Antihypertensives / MI (3) ---------- */
    {
      id: 'q-htn-b01', topic: 'antihypertensives', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Losartan belongs to which class?',
      choices: ['ACE inhibitor','ARB (angiotensin receptor blocker)','Beta-blocker','CCB'],
      correct: 1,
      explanation: 'Losartan, valsartan, irbesartan are ARBs — block AT1 receptor. Do not cause the dry cough of ACEIs.',
    },
    {
      id: 'q-htn-b02', topic: 'htn', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Stage 2 hypertension per ACC/AHA is defined as?',
      choices: ['≥120/80','≥130/80','≥140/90','≥160/100'],
      correct: 2,
      explanation: 'Stage 1 = 130–139/80–89; Stage 2 = ≥140/90.',
    },
    {
      id: 'q-mi-b01', topic: 'mi-rx', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Cardiac contraction depends most critically on which ion?',
      choices: ['Sodium','Calcium','Magnesium','Potassium'],
      correct: 1,
      explanation: 'Calcium influx triggers actin-myosin cross-bridging. CCBs reduce contractility by blocking this.',
    },

    /* ---------- Sleep (3) ---------- */
    {
      id: 'q-sleep-b01', topic: 'sleep-pharm', course: 'rcp104', difficulty: 1, pool: 'battle',
      q: 'Most common sleep disorder in adults?',
      choices: ['Narcolepsy','Obstructive sleep apnea','Restless legs syndrome','Sleepwalking'],
      correct: 1,
      explanation: 'OSA affects ~25% of adult men, ~10% of women; the most common SRBD.',
    },
    {
      id: 'q-sleep-b02', topic: 'sleep-pharm', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'Hypocretin (orexin) deficiency in the lateral hypothalamus is the cause of?',
      choices: ['Insomnia','Narcolepsy type 1 (with cataplexy)','OSA','RLS'],
      correct: 1,
      explanation: 'Narcolepsy type 1 is caused by loss of hypocretin/orexin neurons → EDS + cataplexy.',
    },
    {
      id: 'q-sleep-b03', topic: 'sleep-pharm', course: 'rcp104', difficulty: 2, pool: 'battle',
      q: 'First-line RLS pharmacotherapy (after iron, if low) is?',
      choices: ['Benzodiazepines','Dopamine agonists (pramipexole, ropinirole)','SSRIs','Beta-blockers'],
      correct: 1,
      explanation: 'Dopamine agonists (and α2δ ligands like gabapentin enacarbil) are first-line. Iron supplementation if ferritin low.',
    },
  ];
  window.ALL_QUESTIONS = (window.ALL_QUESTIONS || []).concat(additions);
})();
