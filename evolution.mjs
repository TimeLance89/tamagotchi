/* Mio // Lebensform-System. Kein LLM: die Entscheidungen sind erklärbar,
   aus Persönlichkeit, Erfahrungen und eigenen Motiven abgeleitet. */

const clamp = (n, min=0, max=100) => Math.min(max, Math.max(min, n));
const choose = (list, rng) => list[Math.min(list.length-1, Math.floor(rng()*list.length))];
const PALETTES = [
  { name:'Polarlicht', skin:'#c4eaf4', shade:'#7aaacf', accent:'#e8fbff', glow:'#70dff6' },
  { name:'Rosennebel', skin:'#fbd3c8', shade:'#db879e', accent:'#fff0cc', glow:'#f7a3d3' },
  { name:'Mondflieder', skin:'#e2ceff', shade:'#9982cb', accent:'#fff1fc', glow:'#bda5ff' },
  { name:'Waldgeist', skin:'#c5e6ad', shade:'#79b4a0', accent:'#fff0c9', glow:'#9ce8b7' },
  { name:'Sternenstaub', skin:'#ffdba3', shade:'#e19b8c', accent:'#fff2d6', glow:'#ffc785' },
  { name:'Tiefseele', skin:'#afc4f5', shade:'#7379bd', accent:'#d8f1ff', glow:'#8ea7fa' },
  { name:'Korallenfunke', skin:'#ffaebb', shade:'#dd7096', accent:'#fff0e5', glow:'#ff9da7' },
  { name:'Nachtminze', skin:'#9fdbc9', shade:'#5c9a9e', accent:'#efffea', glow:'#82f9d4' }
];
export const PATHS = {
  seeker: { name:'Sternensucher', icon:'✧', noun:'Entdecken', color:'#a9caff', text:'Es zieht hinaus, bis aus Fragen ganze Sternbilder werden.', activities:['wander','watch'], trait:'curiosity' },
  maker: { name:'Funkenweber', icon:'✳', noun:'Erschaffen', color:'#ffca95', text:'Es macht aus kleinen Ideen Dinge, die vorher nicht existierten.', activities:['invent','reflect'], trait:'creativity' },
  dreamer: { name:'Traumwandler', icon:'☾', noun:'Träumen', color:'#d2bbff', text:'Seine Fantasie öffnet Türen zu stillen Welten.', activities:['dream','sleep'], trait:'calm' },
  guardian: { name:'Herzenshüter', icon:'♡', noun:'Verbinden', color:'#ffb7d4', text:'Es sammelt Begegnungen und findet Bedeutung in Nähe.', activities:['makefriends'], trait:'sociability' }
};
const MOTIVES = [
  { key:'curiosity', label:'Will Neues verstehen', activity:'wander' },
  { key:'creativity', label:'Will etwas Eigenes erschaffen', activity:'invent' },
  { key:'sociability', label:'Sucht echte Verbindung', activity:'makefriends' },
  { key:'calm', label:'Braucht Raum für Gedanken', activity:'reflect' }
];
const DISCOVERIES = {
  wander: [ ['🌙','Mondfeder','Eine Feder, die auch ohne Wind schwebt.'], ['🪐','Kometensplitter','Ein Stein, der sich warm an Erinnerungen fühlt.'], ['🗝️','Schlüssel aus Moos','Er passt offenbar nicht zu gewöhnlichen Türen.'], ['🪶','Windbotschaft','Die Luft hat ein Geheimnis hinterlassen.'] ],
  invent: [ ['🔮','Gedankenprisma','Jeder Blick zeigt eine andere mögliche Zukunft.'], ['🫧','Flüsterkugel','Darin klingt eine bislang ungehörte Melodie.'], ['⚙️','Zeitfalter','Eine winzige Maschine, die sich niemals wiederholt.'], ['✨','Glühfunke','Die erste Idee, die man mitnehmen kann.'] ],
  dream: [ ['🌌','Schlafstern','Ein Stück eines Traums, der weiterleuchtet.'], ['💎','Nebeljuwel','Es wird heller, sobald jemand daran glaubt.'], ['🦋','Traumfalter','Seine Flügel zeigen Erinnerungen.'] ],
  makefriends: [ ['💌','Herzpost','Eine Nachricht aus einer unerwarteten Begegnung.'], ['🧶','Schicksalsfaden','Zwei fremde Geschichten berühren sich.'], ['🫶','Wärmestein','Er glüht, wenn jemand zuhört.'] ],
  watch: [ ['☁️','Wolkenkarte','Heute hat der Himmel eine Landkarte gezeichnet.'], ['🌈','Regentropfen','Ein Tropfen, der einen Regenbogen aufbewahrt.'] ],
  reflect: [ ['📜','Alte Frage','Eine Antwort, die eine neue Frage geworden ist.'], ['🪞','Spiegelbild','Ein Blick auf das, was noch werden könnte.'] ],
  sleep: [ ['🌠','Sternenstaub','Ein Überbleibsel von einer langen Nacht.'] ]
};
export const STAGES = [
  { title:'Ursprung', subtitle:'Ein Funke wird wach', threshold:0 },
  { title:'Erwachen', subtitle:'Die ersten Eigenheiten', threshold:16 },
  { title:'Wandlung', subtitle:'Ein ganz eigener Körper', threshold:65 },
  { title:'Entfaltung', subtitle:'Die eigene Bestimmung', threshold:165 },
  { title:'Legende', subtitle:'Unverwechselbar', threshold:360 }
];

const numericSeed = (name, time) => {
  let h = 2166136261;
  for (const c of `${name}/${time}`) h = Math.imul(h ^ c.charCodeAt(0),16777619);
  return h >>> 0;
};
function randomSeeded(seed) {
  let s = seed>>>0;
  return () => { s=(s+0x6D2B79F5)>>>0; let t=Math.imul(s^(s>>>15),1|s); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; };
}
function makeGenome(name,bornAt,random) {
  const seed = numericSeed(name,bornAt) ^ Math.floor(random()*0xFFFFFFFF);
  const rng = randomSeeded(seed);
  return { seed, palette:Math.floor(rng()*PALETTES.length), ears:Math.floor(rng()*4), marks:Math.floor(rng()*4), eyes:Math.floor(rng()*3), size:Math.floor(rng()*3), orbit:Math.floor(rng()*3), pattern:Math.floor(rng()*4) };
}
function traitsOf(state) {
  return Object.entries(state.traits).sort((a,b)=>b[1]-a[1]);
}
function preferPath(state) {
  const t = state.traits;
  const counts = state.habits;
  const weights = {
    seeker: t.curiosity*.38+t.courage*.15+(counts.wander||0)*2+(counts.watch||0)*.9,
    maker: t.creativity*.48+(counts.invent||0)*2.5+(counts.reflect||0)*.7,
    dreamer: t.calm*.48+(counts.dream||0)*2+(counts.sleep||0)*.3,
    guardian:t.sociability*.45+(counts.makefriends||0)*2.5+(state.bond||0)*.1
  };
  return Object.keys(weights).sort((a,b)=>weights[b]-weights[a])[0];
}
export function createIdentity(state, random=Math.random) {
  const genome = makeGenome(state.name,state.bornAt,random);
  state.identity = {
    genome, points:0, stage:0, path:null, discoveries:[],
    choices:[], milestoneAt:[state.bornAt], impulses:{}, decisions:0,
    mood:'offen', rationale:'Es sieht sich in dieser neuen Welt um.',
    latest:null, opportunity:null,
    originalTraits:{...state.traits}
  };
  return state.identity;
}
// Migration existing v0.1 saves without touching their identity, friendships or history.
export function ensureIdentity(state) {
  if (!state || !state.traits || !state.habits) return null;
  if (!state.identity || !state.identity.genome) {
    const saved = state.identity?.points;
    createIdentity(state,randomSeeded(numericSeed(state.name,state.bornAt)));
    const count=Object.values(state.habits).reduce((a,b)=>a+(Number(b)||0),0);
    state.identity.points = Number.isFinite(saved)? saved:Math.min(125,Math.floor(count*.7));
    state.identity.stage=stageForPoints(state.identity.points);
    state.identity.decisions=count;
    if(state.identity.stage>=2) state.identity.path=preferPath(state);
  }
  const id=state.identity;
  if(!Array.isArray(id.discoveries)) id.discoveries=[];
  if(!Array.isArray(id.choices)) id.choices=[];
  if(!Array.isArray(id.milestoneAt)) id.milestoneAt=[state.bornAt];
  if(!id.impulses || typeof id.impulses!=='object') id.impulses={};
  return id;
}
export function stageForPoints(points) {
  let n=0; for(let i=0;i<STAGES.length;i++) if(points>=STAGES[i].threshold) n=i;
  return n;
}
export function appearanceFor(state) {
  const id=ensureIdentity(state), g=id.genome, palette=PALETTES[g.palette%PALETTES.length]||PALETTES[0];
  return { ...palette, name:palette.name, ears:g.ears, marks:g.marks, eyes:g.eyes, size:g.size, orbit:g.orbit, pattern:g.pattern, stage:id.stage, path:id.path, signature:`${(g.seed>>>0).toString(16).toUpperCase().padStart(8,'0').slice(0,4)}·${String(g.palette+1).padStart(2,'0')}`, pathColor:PATHS[id.path]?.color||palette.glow };
}
export function insightFor(state) {
  const id=ensureIdentity(state);
  const top=traitsOf(state)[0];
  const descriptors={curiosity:'versteht Dinge am liebsten selbst',creativity:'verwandelt Gedanken in Ideen',sociability:'merkt sich Begegnungen',courage:'traut sich ungewöhnliche Wege',calm:'findet auch im Stillen Abenteuer'};
  return `${state.name} ${descriptors[top[0]]}. ${id.path ? PATHS[id.path].text : 'Was daraus einmal wird, weiß es noch nicht.'}`;
}
export function motiveFor(state) {
  const id=ensureIdentity(state);
  const motivation=MOTIVES.map(m=>({...m,weight:state.traits[m.key]+Math.min(14,(state.habits[m.activity]||0)*1.5)})).sort((a,b)=>b.weight-a.weight)[0];
  return { motive:motivation.label, why:id.rationale||'Es hört auf seinen eigenen Kopf.', mood:id.mood };
}
// Motivationsbeitrag zum Utility-Scoring: nicht nur Zufall oder feste Timer.
export function decisionBias(state,key) {
  const id=ensureIdentity(state), count=id.impulses[key]||0;
  const recency=id.latest?.activity===key ? -12:0;
  const novelty=Math.min(13,Math.max(0,8-count*.7));
  const preference=Math.min(15,(state.habits[key]||0)*.6);
  const excitement = state.meters.wonder<42 && ['wander','watch'].includes(key) ? 11:0;
  const recovery = state.meters.energy<36 && ['sleep','dream'].includes(key) ? 13:0;
  return {score:recency+novelty+preference+excitement+recovery, why:recovery?'weil es seine Energie spürt':excitement?'weil seine Neugier geweckt wurde':preference>6?'weil ihm diese Beschäftigung wichtig geworden ist':novelty>=7?'weil es etwas anderes ausprobieren möchte':'weil es dazu gerade Lust hat'};
}
function maybeDiscovery(state,activity,at,random) {
  const id=state.identity;
  const options=DISCOVERIES[activity]||[];
  if(!options.length || random()>.27) return;
  const possibilities=options.filter(a=>!id.discoveries.some(d=>d.title===a[1]));
  if(!possibilities.length)return;
  const item=choose(possibilities,random);
  const discovery={icon:item[0],title:item[1],description:item[2],at,activity};
  id.discoveries.unshift(discovery);
  id.discoveries=id.discoveries.slice(0,40);
  id.points+=4;
  if (!id.opportunity) id.opportunity = { at, title:`${state.name} hat ${item[1]} gefunden!`, description:item[2], icon:item[0], first:{label:'Behutsam erforschen', trait:'curiosity', bonus:'Neugier'}, second:{label:'Als Erinnerung bewahren', trait:'calm', bonus:'Gelassenheit'}, discovery:item[1] };
  state.memories.unshift({ at, icon:item[0], title:'Unerwartete Entdeckung', text:`${state.name} hat ${item[1]} entdeckt. ${item[2]}` });
  state.memories=state.memories.slice(0,32);
}
export function onDecision(state, activity, at, reason, random=Math.random) {
  const id=ensureIdentity(state);
  id.decisions++;
  id.points+=1+(random()<.16?1:0);
  for (const k of Object.keys(id.impulses)) id.impulses[k]=Math.max(0,id.impulses[k]-.15);
  id.impulses[activity]=(id.impulses[activity]||0)+1;
  id.latest={activity,at};
  id.rationale=reason;
  const e=state.meters.energy, w=state.meters.wonder;
  id.mood=e<35?'nachdenklich':w>75?'hellwach':state.meters.spark>75?'inspiriert':'aufmerksam';
  maybeDiscovery(state,activity,at,random);
  const next=stageForPoints(id.points);
  if(next>id.stage){
    id.stage=next;
    id.milestoneAt[next]=at;
    if(next>=2)id.path=preferPath(state);
    const st=STAGES[next];
    state.memories.unshift({at,icon:'🪄',title:'Eine echte Verwandlung',text:`${state.name} erreicht ${st.title}. Es ist nicht mehr das Wesen von gestern.`});
    state.memories=state.memories.slice(0,32);
  }
  // Bestimmung bleibt nicht festgeschrieben: nach längerer Entwicklung kann sie wechseln.
  if(id.stage>=2 && id.decisions%70===0){
    const nextPath=preferPath(state);
    if(nextPath!==id.path){
      id.path=nextPath;
      state.memories.unshift({at,icon:'🧬',title:'Ein anderer Weg',text:`${state.name} ist jetzt ein ${PATHS[nextPath].name}. Erlebnisse haben es verändert.`});
      state.memories=state.memories.slice(0,32);
    }
  }
}
export function onInteraction(state,action,at) {
  const id=ensureIdentity(state);
  id.points+= action==='pet' ? .4 : 1;
  const associations={ talk:'sociability', play:'courage', create:'creativity', rest:'calm', pet:'sociability' };
  const key=associations[action];
  if(key){id.choices.push({at,action,kind:'together'});id.choices=id.choices.slice(-25);}
  id.mood=action==='rest'?'geborgen':action==='play'?'aufgeregt':'verbunden';
  id.rationale='weil es deine Nähe gerade mit einem guten Erlebnis verbindet';
}
export function resolveOpportunity(state,option,at=Date.now()) {
  const id=ensureIdentity(state); const event=id.opportunity;
  if(!event||!['first','second','skip'].includes(option))return null;
  id.opportunity=null;
  if(option==='skip')return {message:'Du lässt es selbst entscheiden. Das ist auch okay.'};
  const choice=event[option];
  state.traits[choice.trait]=clamp(state.traits[choice.trait]+2,5,95);
  id.points+=3;
  id.choices.push({at,action:choice.label,kind:'discovery',discovery:event.discovery});
  id.choices=id.choices.slice(-25);
  state.memories.unshift({at,icon:event.icon,title:'Eine Entscheidung, die bleibt',text:`Ihr habt „${event.discovery}“ ${option==='first'?'erforscht':'aufbewahrt'}. ${state.name} ist ein wenig ${choice.bonus.toLowerCase()}er geworden.`});
  state.memories=state.memories.slice(0,32);
  return {message:`Deine Entscheidung verändert ${state.name}s Charakter. ✦`};
}
export function progressFor(state) {
  const id=ensureIdentity(state), next=STAGES[id.stage+1], current=STAGES[id.stage];
  return {stage:current, next, percent:next?clamp(Math.round((id.points-current.threshold)/(next.threshold-current.threshold)*100)):100, path:PATHS[id.path]||null};
}
