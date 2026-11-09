/**
 * mio. WILD — a self-directed, deterministic-on-seed virtual life simulation.
 * No remote services. Every consequence is calculated locally.
 * v1 state intentionally does not mutate the old mio.life.v1 save.
 */

export const BIOMES = [
  { id: 'lumen', name: 'Lichtwald', sub: 'Wo die Bäume Sterne tragen', icon: '✦', colors: ['#18283a','#36535d','#3c716d'], affinity: 'wild' },
  { id: 'astral', name: 'Sternensee', sub: 'Das Wasser erinnert sich', icon: '☽', colors: ['#171a43','#343269','#54688a'], affinity: 'stars' },
  { id: 'ember', name: 'Glutfelder', sub: 'Das Land der flüsternden Funken', icon: '✧', colors: ['#382435','#864e56','#b27b5a'], affinity: 'fire' },
  { id: 'mist', name: 'Nebelinseln', sub: 'Wo unsichtbare Wege beginnen', icon: '◈', colors: ['#172d35','#3f656d','#72979a'], affinity: 'dream' }
];
export const PATHS = [
  { id: 'wild', title: 'Waldläufer', adjective: 'Naturverbunden', ability: 'Spürt verborgene Pfade' },
  { id: 'stars', title: 'Sternenseher', adjective: 'Unendlich neugierig', ability: 'Liest Geschichten am Himmel' },
  { id: 'fire', title: 'Funkenweber', adjective: 'Unerschrocken', ability: 'Entfacht neues Leben' },
  { id: 'dream', title: 'Traumformer', adjective: 'Fantasievoll', ability: 'Webt Dinge aus Träumen' },
  { id: 'bond', title: 'Herzenshüter', adjective: 'Empathisch', ability: 'Verbindet entfernte Welten' }
];
export const STAGES = ['Funke', 'Wanderer', 'Wandlung', 'Erwachen', 'Mythos'];
const NAMES = ['Nori', 'Lumi', 'Kio', 'Mori', 'Vela', 'Sora', 'Milu', 'Numa', 'Kiri', 'Auri', 'Amo', 'Fina'];
const KEYS = ['curiosity','courage','dreaming','empathy','independence'];
const ABILITIES = ['wild','stars','fire','dream','bond'];
const cap = (v,min=0,max=100)=>Math.max(min,Math.min(max,v));
const pick = (arr,r)=>arr[Math.floor(r()*arr.length) % arr.length];
const randomInt=(r,min,max)=>Math.floor(r()*(max-min+1))+min;
const safeText=(s,max=24)=>String(s || '').trim().slice(0,max);
const nowClock=ts => new Date(ts).getHours();

const ACTIONS = [
  {id:'wander',verb:'erforscht einen verborgenen Pfad',emoji:'✦',affinity:'wild',drive:'curiosity',effect:['wonder',11],thought:['Da draußen gibt es einen Weg, den noch niemand kennt.','Ein Pfad endet nicht, nur weil man ihn nicht sehen kann.','Vielleicht ist die Welt größer, als ich dachte.']},
  {id:'stargaze',verb:'lauscht den Sternen',emoji:'☽',affinity:'stars',drive:'dreaming',effect:['focus',8],thought:['Jemand hat diese Sterne wie Spuren hinterlassen.','Wenn ein Stern erlischt, behalte ich sein Licht.','Der Himmel stellt Fragen, und ich höre zu.']},
  {id:'invent',verb:'erschafft etwas Unmögliches',emoji:'✧',affinity:'fire',drive:'courage',effect:['wonder',12],thought:['Das gab es noch nicht. Jetzt vielleicht schon.','Ich mag Ideen, die ein bisschen Angst machen.','Aus einem kleinen Funken wird manchmal ein Universum.']},
  {id:'dream',verb:'reist durch seine Träume',emoji:'◈',affinity:'dream',drive:'dreaming',effect:['energy',12],thought:['Ich träumte von einem Ort, den ich noch nie sah.','Manche Rätsel lösen sich erst, wenn ich schlafe.','Ob meine Träume vielleicht eigene Träume haben?']},
  {id:'connect',verb:'sucht eine fremde Seele',emoji:'♡',affinity:'bond',drive:'empathy',effect:['bond',8],thought:['Nicht alles, was allein aussieht, ist einsam.','Vielleicht ist irgendwo ein neuer Freund.','Ich möchte verstehen, wie andere die Welt sehen.']},
  {id:'rest',verb:'ruht im Leuchten der Welt',emoji:'☁',affinity:'dream',drive:'independence',effect:['energy',24],thought:['Ich brauche keine Aufgabe, um etwas wert zu sein.','Gerade passiert scheinbar nichts. Das ist schön.','Eine Pause kann der Beginn von etwas Großem sein.']}
];

export const RELICS = [
  {id:'leaf',biome:'lumen',icon:'❧',title:'Schimmerblatt',text:'Ein Blatt, das sich niemals zweimal gleich bewegt.',affinity:'wild'},
  {id:'fern',biome:'lumen',icon:'✽',title:'Mondfarn',text:'Nur jemand mit Geduld entdeckt seinen Atem.',affinity:'dream'},
  {id:'seed',biome:'lumen',icon:'✿',title:'Herzsamen',text:'Er wird wärmer, sobald jemand lächelt.',affinity:'bond'},
  {id:'mirror',biome:'astral',icon:'◇',title:'Himmelsglas',text:'Darin spiegeln sich Sterne, die noch nicht existieren.',affinity:'stars'},
  {id:'drop',biome:'astral',icon:'◈',title:'Zeitentropfen',text:'Ein Augenblick, der zu schwer zum Vergessen ist.',affinity:'dream'},
  {id:'meteor',biome:'astral',icon:'✶',title:'Sternensplitter',text:'Er leuchtet nur, wenn niemand hinsieht.',affinity:'stars'},
  {id:'coal',biome:'ember',icon:'✷',title:'Glutkern',text:'Eine Flamme, die von Mut statt Holz lebt.',affinity:'fire'},
  {id:'amber',biome:'ember',icon:'⬡',title:'Bernsteinherz',text:'Bewahrt die Erinnerung an einen mutigen Schritt.',affinity:'bond'},
  {id:'spark',biome:'ember',icon:'✧',title:'Wilder Funke',text:'Er lässt kleine unmögliche Dinge wahr werden.',affinity:'fire'},
  {id:'veil',biome:'mist',icon:'◌',title:'Nebelperle',text:'Mal ist sie da. Mal war sie nie fort.',affinity:'dream'},
  {id:'bell',biome:'mist',icon:'♧',title:'Stille Glocke',text:'Ihr Klang ist eine Erinnerung ohne Worte.',affinity:'wild'},
  {id:'feather',biome:'mist',icon:'❋',title:'Traumfeder',text:'Sie liegt nie dort, wo du sie abgelegt hast.',affinity:'dream'}
];

const ENCOUNTERS = [
  {id:'echo',title:'Eine Stimme ohne Körper',icon:'◌',scene:'Zwischen den Bäumen ruft etwas seinen Namen. Die Stimme klingt wie ein zukünftiges Ich.',
    options:[{label:'Der Stimme folgen',hint:'Mut und Sternenwissen',affinity:'stars',trait:'courage',effect:8,text:'Es ist der Stimme gefolgt und hat eine eigene Zukunft gesehen.'},{label:'Erst einmal zuhören',hint:'Geduld und Traumkraft',affinity:'dream',trait:'dreaming',effect:8,text:'Es hat gelernt, dass auch die Stille Antworten kennt.'}]},
  {id:'fox',title:'Der verlorene Lichtfuchs',icon:'✧',scene:'Ein winziges Lichtwesen sitzt am Rand eines fremden Pfades und traut sich nicht weiter.',
    options:[{label:'Ihm den Weg zeigen',hint:'Verbindung und Mitgefühl',affinity:'bond',trait:'empathy',effect:9,text:'Es hat dem Lichtfuchs geholfen. Der Wald fühlt sich jetzt ein wenig vertrauter an.'},{label:'Gemeinsam die Welt erkunden',hint:'Abenteuer und Natur',affinity:'wild',trait:'curiosity',effect:8,text:'Sie haben einen Pfad gefunden, den es gestern noch nicht gab.'}]},
  {id:'door',title:'Die Tür im Himmel',icon:'◇',scene:'Für einen Herzschlag öffnet sich zwischen zwei Sternen eine Tür. Dahinter schimmert etwas Unbekanntes.',
    options:[{label:'Hindurchspringen',hint:'Mut und neue Möglichkeiten',affinity:'fire',trait:'courage',effect:10,text:'Es ist gesprungen und zurückgekommen mit Funken im Fell.'},{label:'Sich die Tür merken',hint:'Sternenwissen und Geduld',affinity:'stars',trait:'dreaming',effect:7,text:'Es hat die Position der Tür in seinen Gedanken eingeschlossen.'}]},
  {id:'garden',title:'Ein Garten aus Gedanken',icon:'✿',scene:'Aus einem vergessenen Gedanken ist eine Blume gewachsen. Sie fragt nach einem Namen.',
    options:[{label:'Einen Namen schenken',hint:'Empathie und Bindung',affinity:'bond',trait:'empathy',effect:8,text:'Ein neuer Name ist in der Welt geblieben, auch als die Blume verschwand.'},{label:'Sie wachsen lassen',hint:'Unabhängigkeit und Natur',affinity:'wild',trait:'independence',effect:8,text:'Es hat beschlossen, manche Wunder nicht festzuhalten.'}]},
  {id:'storm',title:'Der umgedrehte Regen',icon:'☽',scene:'Heute fallen Regentropfen nach oben. Jeder trägt ein winziges Bild aus der Vergangenheit.',
    options:[{label:'Ein Bild auffangen',hint:'Träume und Erinnerungen',affinity:'dream',trait:'dreaming',effect:8,text:'Es bewahrt einen Moment, der nie wirklich passiert ist.'},{label:'Im Regen tanzen',hint:'Mut und Lebensfreude',affinity:'fire',trait:'courage',effect:8,text:'Es tanzt gegen die Schwerkraft und vergisst für einen Moment jede Angst.'}]},
  {id:'island',title:'Die Insel, die wandert',icon:'❋',scene:'Eine kleine Insel zieht vorbei, auf ihrem Rücken tausend schlafende Blumen.',
    options:[{label:'Mit ihr reisen',hint:'Freiheit und Entdeckung',affinity:'wild',trait:'independence',effect:8,text:'Ein Stück der Reise wird noch lange in seinem Herzen bleiben.'},{label:'Eine Blume wecken',hint:'Nähe und Geheimnisse',affinity:'bond',trait:'empathy',effect:8,text:'Eine Blume hat ihm im Flüstern ein Versprechen gegeben.'}]},
  {id:'comet',title:'Ein Stern hat Hunger',icon:'✶',scene:'Ein taumelnder Komet hält über dem Tal an. Er fragt nach einem schönen Gedanken.',
    options:[{label:'Einen Traum verschenken',hint:'Fantasie und Sterne',affinity:'stars',trait:'dreaming',effect:10,text:'Der Komet fliegt weiter und trägt nun einen Teil seiner Fantasie.'},{label:'Eine Geschichte erzählen',hint:'Verbindung und Erinnerung',affinity:'bond',trait:'empathy',effect:8,text:'Der Komet antwortet mit einem kleinen Lichtzeichen.'}]},
  {id:'shadow',title:'Ein Schatten mit eigenem Willen',icon:'◈',scene:'Sein Schatten bleibt stehen, während es weitergeht. Er möchte offenbar einen anderen Weg nehmen.',
    options:[{label:'Dem Schatten vertrauen',hint:'Freiheit und Mut',affinity:'fire',trait:'independence',effect:9,text:'Der Schatten führt zu einem Ort, der nur bei Nacht existiert.'},{label:'Zusammen weitergehen',hint:'Harmonie und Träume',affinity:'dream',trait:'empathy',effect:8,text:'Beide entdecken, dass man nicht denselben Weg wollen muss, um zusammenzubleiben.'}]}
];

function memory(s, at, icon, title, text, kind='life') {
  s.memories.unshift({at,icon,title,text,kind});
  if(s.memories.length>70)s.memories.length=70;
}
function freshGenes(r) {return {hue:randomInt(r,165,340),shape:randomInt(r,0,3),ears:randomInt(r,0,3),mark:randomInt(r,0,4),tail:randomInt(r,0,3),iris:randomInt(r,0,2),size:randomInt(r,88,112),glow:randomInt(r,0,3)};}
function freshTraits(r){return Object.fromEntries(KEYS.map(k=>[k,randomInt(r,24,78)]));}
function getPath(s){return PATHS.slice().sort((a,b)=>(s.affinities[b.id]||0)-(s.affinities[a.id]||0))[0]}
function stageFor(s){return STAGES[Math.min(4,s.stage||0)]}
function dominant(s){return getPath(s).id}

export function hatch(name='',time=Date.now(),r=Math.random){
  const genes=freshGenes(r),traits=freshTraits(r), id=Math.floor(r()*1e9);
  const s={schema:2,id,name:safeText(name)||pick(NAMES,r),bornAt:time,updatedAt:time,decisionAt:time,seenAt:time,
    genes,traits,stage:0,form:'wild',affinities:{wild:5,stars:5,fire:5,dream:5,bond:5},
    resources:{energy:77,wonder:65,focus:52,bond:30},
    biome:'lumen',position:{x:.48,y:.63},activity:'dream',thought:'Da ist also die Welt. Sie ist wunderschön.',reason:'Es hat gerade erst die Augen geöffnet.',
    experience:0,journeys:0,habits:{},discoveries:[],memories:[],pending:null,encounters:[],
    lastInteraction:0,sparks:0,chapter:1,identity:['Ein neuer Anfang'],
    mood:'neugierig',season:0};
  memory(s,time,'✧','Ein Wesen erwacht',`${s.name} ist nicht gemacht worden, um jemand anderes zu sein. Seine Geschichte beginnt jetzt.`,'birth');
  return s;
}

export function migrateOld(save,time=Date.now(),r=Math.random){
  if(!save||typeof save!=='object')return null;
  if(save.schema===2)return structuredClone(save);
  if(save.version!==1 || typeof save.name!=='string') return null;
  const s=hatch(save.name,Number.isFinite(save.bornAt)?save.bornAt:time,r);
  const t=save.traits||{};
  s.traits.curiosity=cap(t.curiosity??s.traits.curiosity);
  s.traits.courage=cap(t.courage??s.traits.courage);
  s.traits.dreaming=cap(t.creativity??s.traits.dreaming);
  s.traits.empathy=cap(t.sociability??s.traits.empathy);
  s.traits.independence=cap(100-(t.calm??50));
  s.resources.bond=cap(save.bond??30);
  s.experience=Math.max(0,Math.floor((save.goalsReached||0)*35+Object.values(save.habits||{}).reduce((a,b)=>a+(Number(b)||0),0)*3));
  s.journeys=Math.min(80,Math.floor(s.experience/7));
  s.stage=s.experience>245?3:s.experience>120?2:s.experience>35?1:0;
  s.memories=(save.memories||[]).slice(0,30).filter(m=>m&&Number.isFinite(m.at)).map(m=>({at:m.at,icon:String(m.icon||'✧'),title:String(m.title||'Erinnerung'),text:String(m.text||''),kind:'legacy'}));
  memory(s,time,'✦','Ein neues Kapitel',`${s.name} trägt die Erinnerungen aus seinem alten Leben in eine größere Welt.`,'evolution');
  s.bornAt=save.bornAt||time;
  return s;
}

function applyActivity(s,a,r,time){
  s.activity=a.id;
  s.thought=pick(a.thought,r);
  s.position={x:cap(.25+r()*.5,0,1),y:.63};
  s.habits[a.id]=(s.habits[a.id]||0)+1;
  s.journeys++;
  s.experience+=2+(s.biome==='astral' && a.affinity==='stars'?1:0);
  s.affinities[a.affinity]+=a.id==='rest'?1:3;
  const [key,value]=a.effect;
  s.resources[key]=cap((s.resources[key]||0)+value);
  if(a.id==='wander'||a.id==='invent'){s.resources.energy=cap(s.resources.energy-6);}
  if(a.id==='rest')s.resources.wonder=cap(s.resources.wonder+3);
  const needed=BIOMES.find(b=>b.id===s.biome)?.affinity;
  if(needed===a.affinity)s.affinities[a.affinity]+=2;
  if(s.habits[a.id] % 7===0){s.traits[a.drive]=cap(s.traits[a.drive]+1,5,95);memory(s,time,'✧','Eine Eigenart wächst',`${s.name} merkt: ${a.verb}. Es wird ein Teil von ihm.`,'trait');}
  if(r()<.25)memory(s,time,a.emoji,'Ein eigener Augenblick',`${s.name} ${a.verb}. „${s.thought}“`);
}
function maybeDiscover(s,r,time){
  if(s.journeys<2 ||r()>.19)return;
  const pool=RELICS.filter(item=>item.biome===s.biome&&!s.discoveries.includes(item.id));
  if(!pool.length)return;
  const item=pick(pool,r);
  s.discoveries.push(item.id);
  s.affinities[item.affinity]+=7;
  s.experience+=10;
  memory(s,time,item.icon,`Gefunden: ${item.title}`,item.text,'discovery');
  s.thought=`Ich habe ${item.title} entdeckt. Es fühlt sich wichtig an.`;
}
function maybeEncounter(s,r,time){
  if(s.pending||s.journeys<3||s.journeys % 4!==0)return;
  // Stories appear at a deliberate cadence rather than in endless notification spam.
  const available=ENCOUNTERS.filter(e=>!s.encounters.includes(e.id));
  const chosen=pick(available.length?available:ENCOUNTERS,r);
  s.pending={id:chosen.id,since:time};
  memory(s,time,chosen.icon,'Ein Rätsel wartet',chosen.title,'event');
}
function maybeTravel(s,r,time){
  if(s.journeys % 5!==0)return;
  const choices=BIOMES.filter(b=>b.id!==s.biome);
  const favorite=choices.slice().sort((a,b)=>(s.affinities[b.affinity]||0)-(s.affinities[a.affinity]||0));
  const target=r()<.65?favorite[0]:pick(choices,r);
  s.biome=target.id;
  s.experience+=3;
  memory(s,time,target.icon,'Ein neuer Horizont',`${s.name} hat sich selbst auf den Weg zum ${target.name} gemacht.`,'travel');
}
function maybeEvolve(s,time){
  const thresholds=[0,18,75,180,360];
  const next=s.stage+1;
  if(next>=thresholds.length || s.experience<thresholds[next])return;
  s.stage=next;
  s.form=dominant(s);
  const path=getPath(s);
  s.sparks+=1;
  s.chapter+=1;
  s.identity.push(path.adjective);
  s.traits.independence=cap(s.traits.independence+2);
  memory(s,time,'✺','Etwas in mir verändert sich',`${s.name} ist jetzt ${stageFor(s)}. Sein Wesen folgt dem ${path.title}-Pfad: ${path.ability}.`,'evolution');
  s.thought='Etwas ist anders. Aber es fühlt sich genau richtig an.';
}
function decide(s,r,time){
  const h=nowClock(time),remaining=100-s.resources.energy;
  const ranked=ACTIONS.map(a=>{
    let score=r()*24+((s.traits[a.drive]||45)*.5)+(s.affinities[a.affinity]||5)*.13;
    if(a.id==='rest'||a.id==='dream')score+=remaining*.65+(h<6||h>21?20:0);
    if(a.id==='wander')score+=(100-s.resources.wonder)*.34;
    if(a.id==='connect')score+=(100-s.resources.bond)*.24;
    if(a.id==='invent')score+=(100-s.resources.focus)*.25;
    if(a.id===s.activity)score-=25;
    if(s.resources.energy<28&&!['rest','dream'].includes(a.id))score-=65;
    return {a,score};
  }).sort((a,b)=>b.score-a.score);
  const a=ranked[0].a;
  s.reason=({
    wander:'Seine Neugier war heute stärker als die Angst vor Neuem.',
    stargaze:'Seine Fantasie hat die Sterne wieder ein Stück näher geholt.',
    invent:'Eine Idee hat ihn einfach nicht losgelassen.',
    dream:'Seine Träume sind gerade wichtiger als die Außenwelt.',
    connect:'Er möchte etwas erleben, das er nicht allein erleben kann.',
    rest:'Es hat selbst gemerkt, dass eine Pause guttut.'
  })[a.id];
  applyActivity(s,a,r,time);
  maybeDiscover(s,r,time);
  maybeTravel(s,r,time);
  maybeEncounter(s,r,time);
  maybeEvolve(s,time);
  s.mood=s.resources.energy<28?'müde':s.resources.bond>75?'geborgen':s.resources.wonder>75?'elektrisiert':'neugierig';
}

/** Call frequently; steps are at most one every 24 seconds while open.
 *  When returning after a long absence, up to 48 decisions summarize elapsed time. */
export function advanceWild(s,now=Date.now(),r=Math.random){
  if(!s || s.schema!==2 ||!Number.isFinite(now)||now<=s.updatedAt)return s;
  const elapsed=(now-s.updatedAt)/60000;
  const minutes=Math.min(360,elapsed);
  s.resources.energy=cap(s.resources.energy + (s.activity==='rest'||s.activity==='dream'?.14:-.025)*minutes,18,100);
  s.resources.wonder=cap(s.resources.wonder-.017*minutes,15,100);
  s.resources.focus=cap(s.resources.focus+.022*minutes,20,100);
  let due=Math.floor((now-s.decisionAt)/24000);
  const count=Math.min(48,Math.max(0,due));
  const start=s.decisionAt;
  for(let n=0;n<count;n++){
    const at=start+(now-start)*(n+1)/count;
    decide(s,r,at);
  }
  if(count>0)s.decisionAt=now;
  s.updatedAt=now;
  return s;
}

/** This is an invitation to witness the next choice, not a command to the creature. */
export function witness(s,time=Date.now(),r=Math.random){
  if(!s||s.schema!==2)return null;
  advanceWild(s,time,r);
  decide(s,r,time);
  s.decisionAt=time;
  s.updatedAt=time;
  return {thought:s.thought,reason:s.reason,activity:s.activity};
}

/** True player agency: two distinct, lasting outcomes per story. */
export function chooseStory(s,index,time=Date.now()){
  if(!s?.pending)return null;
  const e=ENCOUNTERS.find(x=>x.id===s.pending.id);
  const option=e?.options[index];
  if(!option)return null;
  s.affinities[option.affinity]+=option.effect;
  s.traits[option.trait]=cap(s.traits[option.trait]+3,5,95);
  s.resources.bond=cap(s.resources.bond+3);
  s.experience+=13;
  s.encounters.push(e.id);
  s.pending=null;
  s.thought=option.text;
  s.reason=`Du hast ihn begleitet, aber seinen eigenen Weg hat ${s.name} selbst gewählt.`;
  memory(s,time,e.icon,e.title,option.text,'choice');
  maybeEvolve(s,time);
  s.updatedAt=time;
  return {title:e.title,description:option.text,affinity:option.affinity};
}
export function connect(s,time=Date.now()){
  if(!s)return;
  const wait=12000;
  if(time-s.lastInteraction<wait)return null;
  s.lastInteraction=time;
  s.resources.bond=cap(s.resources.bond+4);
  s.affinities.bond+=2;
  s.thought=['Gut, dass du da bist.','Du darfst ein Teil meiner Geschichte sein.','Ich hab dich bemerkt. ♡'][s.journeys%3];
  memory(s,time,'♡','Ein stiller Moment',`${s.name} hat deine Nähe gespürt.`,'bond');
  s.updatedAt=time;
  return s.thought;
}
export function storyFor(s){return ENCOUNTERS.find(e=>e.id===s?.pending?.id)||null;}
export function pathFor(s){return getPath(s);}
export function stageLabel(s){return stageFor(s);}
export function oldestMemoryDate(s){return s?.memories?.at(-1)?.at||0;}
export function selfSummary(s){
  const most=Object.entries(s.habits).sort((a,b)=>b[1]-a[1])[0];
  const favorite=ACTIONS.find(a=>a.id===most?.[0]);
  return `${s.name} ist ${PATHS.find(p=>p.id===dominant(s))?.adjective.toLowerCase()}. ${favorite ? 'Am liebsten '+favorite.verb+'.':'Seine Geschichte beginnt gerade.'} ${s.discoveries.length} Entdeckungen haben seine Sicht auf die Welt geprägt.`;
}
export function isWildSave(s){return Boolean(s&&s.schema===2&&typeof s.name==='string'&&s.name.length>0&&s.name.length<=24&&Number.isFinite(s.bornAt)&&Number.isFinite(s.updatedAt)&&s.genes&&typeof s.genes.hue==='number'&&s.resources&&s.traits&&s.affinities&&Array.isArray(s.memories)&&Array.isArray(s.discoveries)&&s.memories.length<200&&s.discoveries.length<=RELICS.length&&BIOMES.some(b=>b.id===s.biome))}
export {ACTIONS};
