/* ============================================================
   RCP 103 BOSSES — generated from Study Brain notes
   ============================================================ */
(function () {
  const list = [
    { id:'copd',       name:'The Blue Bloater',      emoji:'🌫️', course:'rcp103', description:'COPD: chronic bronchitis & emphysema', hp:100, unlockedByDefault:true,  questionTopics:['copd','cor-pulmonale'] },
    { id:'asthma',     name:'The Hyperresponsive',   emoji:'💨', course:'rcp103', description:'Asthma: zones, biphasic, severity',     hp:100, unlockedByDefault:true,  questionTopics:['asthma'] },
    { id:'abg',        name:'The Acid-Base Specter', emoji:'🩸', course:'rcp103', description:'ABG interpretation & anion gap',        hp:100, unlockedByDefault:true,  questionTopics:['abg','acid-base'] },
    { id:'pleural',    name:'Tension Wraith',        emoji:'🫁', course:'rcp103', description:'PTX, effusion, chest tubes',            hp:100, unlockedByDefault:false, questionTopics:['pleural','chest-tubes','flail-chest'] },
    { id:'infectious', name:'The Consolidation King',emoji:'🦠', course:'rcp103', description:'Pneumonia / TB / fungal',               hp:100, unlockedByDefault:false, questionTopics:['pneumonia','tb','fungal'] },
    { id:'ards',       name:'Hyaline Hydra',         emoji:'💧', course:'rcp103', description:'ARDS — Berlin, P/F, lung-protective',   hp:100, unlockedByDefault:false, questionTopics:['ards'] },
    { id:'ild',        name:'The Honeycomb Husk',    emoji:'🪨', course:'rcp103', description:'ILD, pneumoconioses, IPF',              hp:100, unlockedByDefault:false, questionTopics:['ild','pneumoconioses'] },
    { id:'sleep',      name:'Apnea Phantom',         emoji:'😴', course:'rcp103', description:'OSA / CSA / CPAP / BiPAP',              hp:100, unlockedByDefault:false, questionTopics:['sleep-apnea'] },
    { id:'neuro',      name:'The Paralytic',         emoji:'⚡', course:'rcp103', description:'GBS, botulism, MIP/NIF',                hp:100, unlockedByDefault:false, questionTopics:['neuro-resp','phrenic'] },
    { id:'pvd',        name:'The Drowning Heart',    emoji:'💔', course:'rcp103', description:'Pulm edema / PE / cor pulmonale',       hp:100, unlockedByDefault:false, questionTopics:['pulm-edema','pe','pvd'] },
  ];
  window.ALL_BOSSES = (window.ALL_BOSSES || []).filter(b => b.course !== 'rcp103').concat(list);
})();
