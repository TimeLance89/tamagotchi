import { appearanceFor, ensureIdentity, insightFor, motiveFor, progressFor, resolveOpportunity, STAGES, PATHS } from './evolution.mjs';

const $ = id => document.getElementById(id);
const el = (tag,cls,txt) => {const n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n;};
let currentState=null;
let saveAndRender=null;
let lastDiscoveryStamp=null;
const stageIcons=['✦','✧','❋','✹','✺'];

function createLayer(){
  const world=$('world');
  const ornaments=el('div','evo-world-ornaments');ornaments.setAttribute('aria-hidden','true');
  ornaments.innerHTML=`<div class="stardust dust-1">✦</div><div class="stardust dust-2">✧</div><div class="stardust dust-3">✧</div><div class="stardust dust-4">✦</div><div class="stardust dust-5">✧</div><div class="stardust dust-6">✳</div><div class="orbit-line orbit-one"></div><div class="orbit-line orbit-two"></div><div class="crystal crystal-left"></div><div class="crystal crystal-right"></div><div class="little-satellite satellite-one">✦</div><div class="little-satellite satellite-two">✳</div>`;
  world.prepend(ornaments);
  const genome=el('span','world-genome');genome.id='world-genome';world.append(genome);
  const creature=$('creature');
  creature.setAttribute('aria-label','Dein einzigartiges Wesen streicheln');
  const face=creature.querySelector('.creature-body');
  for(const c of ['crest','pattern-speckles','evo-wings','evo-rune','evo-glint']) face.append(el('span',`gene-${c}`));
  const spark=el('div','hatch-spark');spark.textContent='✧';creature.append(spark);
  const label=el('div','stage-floating');label.id='stage-floating';world.append(label);
  const discovery=el('div','event-overlay');discovery.id='event-overlay';
  discovery.innerHTML=`<div class="event-head"><span id="event-icon" class="event-icon"></span><div><span class="eyebrow">EIN KLEINER MOMENT, DER BLEIBT</span><h3 id="event-heading"></h3></div><button type="button" id="event-dismiss" class="event-close" aria-label="Entdeckung allein lassen">✕</button></div><p id="event-description"></p><div class="event-buttons"><button type="button" id="event-choice-first" class="event-choice primary"></button><button type="button" id="event-choice-second" class="event-choice"></button></div>`;
  discovery.hidden=true;
  world.append(discovery);

  const actions=$('scene-controls') || document.querySelector('.scene-controls');
  const inner=el('section','mind-section');inner.innerHTML=`<div class="mind-icon">✺</div><div class="mind-text"><div class="eyebrow">WARUM TUT ES DAS?</div><strong id="mind-reason">Es findet seinen eigenen Weg.</strong><span id="mind-motive"></span></div><span class="mind-live">ECHTES VERHALTEN <span></span></span>`;
  actions.append(inner);

  const sidebar=document.querySelector('.sidebar');
  const evolution=el('section','card evolution-card');evolution.innerHTML=`<div class="evo-header"><div><span class="section-kicker">NICHT NUR PUNKTE. ECHTER WANDEL.</span><h2>Seine Evolution</h2></div><span class="evolution-icon">🧬</span></div><div class="evo-stage-row"><div class="stage-orb" id="stage-orb">✦</div><div><span class="evo-small">AKTUELLE LEBENSFORM</span><h3 id="evo-stage-title">Ursprung</h3><p id="evo-stage-subtitle">Ein Funke wird wach</p></div></div><div class="evo-stepper" id="evo-stepper"></div><div class="evo-bar-head"><span id="evo-next-name">Nächste Verwandlung</span><strong id="evo-percent">0%</strong></div><div class="evo-bar"><div id="evo-bar-fill"></div></div><div class="evo-path"><span id="evo-path-icon">✧</span><div><small>SEIN EIGENER WEG</small><strong id="evo-path-name">Noch ungeschrieben</strong><p id="evo-path-description">Was es einmal sein wird, bestimmen seine Erfahrungen.</p></div></div>`;
  sidebar.append(evolution);

  const discoveries=el('section','treasure-section');discoveries.innerHTML=`<div class="treasure-heading"><div><span class="section-kicker">ERLEBNISSE, DIE NIEMAND PLANEN KANN</span><h2>Gesammelte Wunder <span class="treasure-count" id="treasure-count">0</span></h2><p>Manche Dinge findet es ganz von allein. Jede Entdeckung ist Teil seiner Geschichte.</p></div><span class="treasure-heading-icon">✧</span></div><div class="treasure-grid" id="treasure-grid"></div>`;
  const discGrid=document.querySelector('.discovery-grid');discGrid.after(discoveries);

  const footer=document.querySelector('.footer');footer.before((()=>{const x=el('section','signature-banner');x.innerHTML=`<div class="signature-orb">✳</div><div><span class="section-kicker">KEINE ZWEI GLEICHEN SEELEN</span><strong id="signature-message">Eine Geschichte, die niemand sonst erlebt.</strong><p id="signature-subline">Die Gene sind sein Anfang. Die Erlebnisse machen es unverwechselbar.</p></div><span id="signature-code" class="signature-code">0000·00</span>`;return x;})());

  const handle=(option)=>{
    const state=currentState;if(!state)return;
    const result=resolveOpportunity(state,option);
    if(result) saveAndRender?.(result.message);
  };
  $('event-choice-first').addEventListener('click',()=>handle('first'));
  $('event-choice-second').addEventListener('click',()=>handle('second'));
  $('event-dismiss').addEventListener('click',()=>handle('skip'));
}

function safeText(id,v) { const node=$(id); if(node)node.textContent=String(v??''); }
function renderStages(stage){
  const root=$('evo-stepper');
  root.replaceChildren(...STAGES.map((s,i)=>{
    const dot=el('span','evo-step '+(i<=stage?'reached ':'')+(i===stage?'current':''),stageIcons[i]);
    dot.setAttribute('title',s.title);dot.setAttribute('aria-label',s.title+(i<=stage?' erreicht':''));return dot;
  }));
}
function renderTreasures(state){
  const id=ensureIdentity(state), items=id.discoveries;
  const stamp=items.map(x=>x.title+x.at).join('|');
  if(stamp===lastDiscoveryStamp)return;
  lastDiscoveryStamp=stamp;
  safeText('treasure-count',String(items.length).padStart(2,'0'));
  const cards=items.slice(0,4).map(item=>{
    const card=el('article','relic-card');
    card.append(el('div','relic-visual',item.icon));
    const content=el('div','relic-content');
    content.append(el('strong','',item.title),el('p','',item.description));
    card.append(content);return card;
  });
  if(!cards.length){const empty=el('div','empty-relic');empty.innerHTML=`<span>✳</span><strong>Noch ist die Welt voller Geheimnisse.</strong><p>Du musst nicht suchen – es wird selbst seine ersten Wunder entdecken.</p>`;cards.push(empty);}
  $('treasure-grid').replaceChildren(...cards);
}
function renderEvents(state){
  const o=ensureIdentity(state).opportunity, card=$('event-overlay');
  card.hidden=!o;
  if(!o)return;
  safeText('event-icon',o.icon);
  safeText('event-heading',o.title);
  safeText('event-description',o.description);
  safeText('event-choice-first',o.first.label+' ✧');
  safeText('event-choice-second',o.second.label+' ♡');
}
function renderAppearance(state){
  const a=appearanceFor(state), c=$('creature'), world=$('world');
  c.dataset.ears=String(a.ears);
  c.dataset.marks=String(a.marks);
  c.dataset.eyes=String(a.eyes);
  c.dataset.size=String(a.size);
  c.dataset.stage=String(a.stage);
  c.dataset.path=a.path||'';
  c.style.setProperty('--gene-skin',a.skin);
  c.style.setProperty('--gene-shade',a.shade);
  c.style.setProperty('--gene-accent',a.accent);
  c.style.setProperty('--gene-glow',a.glow);
  world.style.setProperty('--gene-glow',a.glow);
  world.style.setProperty('--gene-skin',a.skin);
  safeText('world-genome','DNA '+a.signature);
  safeText('signature-code',a.signature);
  safeText('stage-floating',stageIcons[a.stage]+' '+STAGES[a.stage].title.toUpperCase());
  world.dataset.stage=String(a.stage);
  world.dataset.path=a.path||'';
  world.dataset.mood=state.identity.mood;
}

export function initEvolutionUI(getState, update) {
  saveAndRender=update;
  createLayer();
}
export function renderEvolutionUI(state){
  if(!state)return;
  currentState=state;
  const id=ensureIdentity(state), p=progressFor(state), info=motiveFor(state);
  renderAppearance(state);
  safeText('mind-reason',info.why);
  safeText('mind-motive',`Innerer Antrieb: ${info.motive} · Stimmung: ${info.mood}`);
  safeText('evo-stage-title',p.stage.title);
  safeText('evo-stage-subtitle',p.stage.subtitle);
  safeText('stage-orb',stageIcons[id.stage]);
  safeText('evo-percent',p.percent+'%');
  safeText('evo-next-name',p.next?'Auf dem Weg zu '+p.next.title:'Seine endgültige Form');
  $('evo-bar-fill').style.width=p.percent+'%';
  renderStages(id.stage);
  safeText('evo-path-icon',p.path?.icon||'✧');
  safeText('evo-path-name',p.path?.name||'Noch ungeschrieben');
  safeText('evo-path-description',p.path?.text||'Mit jeder Entscheidung zeichnet sich sein Weg klarer ab.');
  safeText('signature-message',insightFor(state));
  renderTreasures(state);
  renderEvents(state);
}
