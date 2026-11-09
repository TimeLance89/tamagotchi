import { createIdentity, ensureIdentity, decisionBias, onDecision, onInteraction, progressFor } from "./evolution.mjs";
// Die Simulation ist absichtlich lokal und nachvollziehbar: keine Cloud-KI, kein Zwang, keine Bestrafung.
export const ACTIONS = {
  talk: { label: "Reden", icon: "💬" },
  play: { label: "Spielen", icon: "✦" },
  create: { label: "Etwas erfinden", icon: "✳" },
  rest: { label: "Zusammen träumen", icon: "☾" },
  pet: { label: "Streicheln", icon: "♡" }
};

export const ACTIVITIES = {
  wander: { label: "streift durch den Garten", place: "garden", icon: "🌿", skill: "entdecken", line: ["Hier riecht es nach etwas Neuem.", "Was wohl hinter dem nächsten Hügel liegt?", "Ich sammle kleine Geheimnisse."] },
  invent: { label: "tüftelt an einer Idee", place: "studio", icon: "✳", skill: "erfinden", line: ["Vielleicht wird aus dem Unsinn etwas Großes.", "Ich probiere lieber, als nur zu warten.", "Ein Gedanke hat gerade Funken geschlagen."] },
  watch: { label: "beobachtet die Welt", place: "meadow", icon: "☁", skill: "staunen", line: ["Wolken sehen heute aus wie Geschichten.", "Manchmal ist Nichtstun ziemlich spannend.", "Ich glaube, die Welt flüstert mir etwas zu."] },
  dream: { label: "träumt vor sich hin", place: "night", icon: "☾", skill: "träumen", line: ["Ich bin irgendwo zwischen Sternen und Gedanken.", "Selbst im Traum lerne ich Neues.", "Hier kann alles passieren."] },
  makefriends: { label: "sucht Gesellschaft", place: "garden", icon: "♡", skill: "verbinden", line: ["Vielleicht treffe ich heute jemanden.", "Es ist schön, Erlebnisse zu teilen.", "Gute Begegnungen bleiben lange."] },
  reflect: { label: "denkt über Erlebtes nach", place: "meadow", icon: "✦", skill: "staunen", line: ["Ich frage mich, wer ich morgen sein werde.", "Heute habe ich etwas über mich gelernt.", "Manche Fragen sind schöner als Antworten."] },
  sleep: { label: "macht ein Nickerchen", place: "night", icon: "☾", skill: "träumen", line: ["Psst. Ich sortiere gerade meine Träume.", "Ich muss die Gedanken einmal ruhen lassen.", "Eine kleine Pause für große Abenteuer."] }
};

export const GOALS = [
  { key: "horizons", title: "Die Welt verstehen", description: "Neue Orte sehen und Geheimnisse entdecken.", activities: ["wander", "watch", "reflect"] },
  { key: "maker", title: "Etwas Einzigartiges schaffen", description: "Aus Gedanken eigene kleine Wunder machen.", activities: ["invent", "dream"] },
  { key: "connection", title: "Geschichten sammeln", description: "Begegnungen erleben und Verbindungen knüpfen.", activities: ["makefriends", "reflect", "watch"] },
  { key: "dreamer", title: "Den Sternen folgen", description: "Träumen, staunen und der Fantasie vertrauen.", activities: ["dream", "watch", "invent"] }
];

export const TRAITS = [
  { key: "curiosity", title: "Neugier", low: "bedacht", high: "wissbegierig" },
  { key: "creativity", title: "Fantasie", low: "praktisch", high: "ideenreich" },
  { key: "sociability", title: "Nähe", low: "eigenständig", high: "kontaktfreudig" },
  { key: "courage", title: "Mut", low: "vorsichtig", high: "abenteuerlustig" },
  { key: "calm", title: "Gelassenheit", low: "lebhaft", high: "ruhig" }
];

const NAMES = ["Lumi", "Mori", "Pip", "Nilo", "Momo", "Kiro", "Numa", "Poki", "Sumi", "Fino"];
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
const rand = (random, min, max) => min + Math.floor(random() * (max - min + 1));
const pick = (random, list) => list[Math.min(list.length - 1, Math.floor(random() * list.length))];
const goalByKey = key => GOALS.find(x => x.key === key) || GOALS[0];

export function birth(name = "", now = Date.now(), random = Math.random) {
  const traits = Object.fromEntries(TRAITS.map(({ key }) => [key, rand(random, 20, 85)]));
  const goal = pick(random, GOALS);
  const chosenName = String(name).trim().slice(0, 22) || pick(random, NAMES);
  const state = {
    version: 1, name: chosenName, bornAt: now, updatedAt: now, decisionAt: now,
    traits, goal: goal.key, goalProgress: 0, goalsReached: 0,
    meters: { energy: 82, wonder: 68, connection: 48, spark: 55 },
    skills: { entdecken: 0, erfinden: 0, staunen: 0, träumen: 0, verbinden: 0 },
    habits: {}, bond: 18, memories: [{ at: now, icon: "✦", title: "Ein neues Kapitel", text: chosenName + " ist aufgewacht. Wohin die Reise geht, weiß noch niemand." }],
    current: { activity: "watch", place: "meadow", thought: "Oh. Du bist also da. Schön.", since: now },
    lastInteraction: null
  };
  createIdentity(state, random);
  return state;
}

function remember(state, at, icon, title, text) {
  state.memories.unshift({ at, icon, title, text });
  state.memories = state.memories.slice(0, 32);
}

function changeTrait(state, key, amount) {
  state.traits[key] = clamp(Math.round(state.traits[key] + amount), 5, 95);
}

function applyPassage(state, minutes) {
  // Offline-Fortschritt ohne Vernachlässigungsdruck: Bedürfnisse verändern sich nur sanft.
  const m = Math.min(minutes, 240);
  const slow = state.current.activity === "sleep" || state.current.activity === "dream";
  state.meters.energy = clamp(state.meters.energy + (slow ? 0.19 : -0.045) * m, 12, 100);
  state.meters.wonder = clamp(state.meters.wonder - 0.028 * m, 20, 100);
  state.meters.spark = clamp(state.meters.spark - 0.018 * m, 18, 100);
  state.meters.connection = clamp(state.meters.connection - 0.009 * m, 30, 100);
}

function scoreActivity(s, key, hour, random) {
  const t = s.traits, m = s.meters;
  let points = random() * 28;
  if (key === "wander") points += t.curiosity * .43 + t.courage * .22 + (100 - m.wonder) * .42;
  if (key === "invent") points += t.creativity * .55 + (100 - m.spark) * .30;
  if (key === "watch") points += t.calm * .30 + t.curiosity * .17 + (100 - m.wonder) * .28;
  if (key === "dream") points += t.creativity * .30 + t.calm * .30 + (100 - m.energy) * .26;
  if (key === "makefriends") points += t.sociability * .54 + (100 - m.connection) * .41;
  if (key === "reflect") points += t.calm * .43 + t.creativity * .24;
  if (key === "sleep") points += (100 - m.energy) * 1.4 + ((hour < 7 || hour > 21) ? 38 : 0);
  if (s.goal && goalByKey(s.goal).activities.includes(key)) points += 13;
  if (s.current.activity === key) points -= 32;
  if ((s.habits[key] || 0) > 7) points -= 4; // eine Vorliebe darf wachsen, aber nicht alles dominieren
  if (m.energy < 26 && !["sleep", "dream", "watch"].includes(key)) points -= 50;
  const bias = decisionBias(s, key);
  return {score: points + bias.score, reason: bias.why};
}

function decide(s, at, random) {
  const hour = new Date(at).getHours();
  const keys = Object.keys(ACTIVITIES);
  const scores = keys.map(key => ({ key, ...scoreActivity(s, key, hour, random) }))
    .sort((a,b) => b.score - a.score);
  const activity = scores[0].key;
  const chosen = ACTIVITIES[activity];
  const explanation = `${s.name} ${chosen.label}, ${scores[0].reason}.`;

  s.habits[activity] = (s.habits[activity] || 0) + 1;
  s.skills[chosen.skill] = Math.min(999, (s.skills[chosen.skill] || 0) + 1);
  s.current = { activity, place: chosen.place, thought: pick(random, chosen.line), since: at };
  const changes = {
    wander: { wonder: 13, energy: -4, spark: 2 },
    invent: { spark: 16, energy: -5, wonder: -2 },
    watch: { wonder: 7, energy: 2, spark: 5 },
    dream: { energy: 13, spark: 9 },
    makefriends: { connection: 17, energy: -2 },
    reflect: { spark: 7, wonder: 4, energy: 2 },
    sleep: { energy: 23, spark: 3 }
  };
  Object.entries(changes[activity]).forEach(([k, v]) => { s.meters[k] = clamp(s.meters[k] + v); });
  const interested = goalByKey(s.goal).activities.includes(activity);
  s.goalProgress += interested ? rand(random, 5, 11) : rand(random, 1, 3);
  if (s.goalProgress >= 100) {
    s.goalsReached++;
    remember(s, at, "✷", "Ein Traum wird wahr", s.name + " hat „" + goalByKey(s.goal).title + "“ geschafft und sucht nach einem neuen Sinn.");
    const other = GOALS.filter(g => g.key !== s.goal);
    s.goal = pick(random, other).key;
    s.goalProgress = 0;
    changeTrait(s, "courage", 1);
  }
  // Gewohnheiten verändern langfristig die Persönlichkeit.
  if (s.habits[activity] % 6 === 0) {
    const key = ({ wander: "curiosity", invent: "creativity", watch: "calm", dream: "creativity", makefriends: "sociability", reflect: "calm", sleep: "calm" })[activity];
    changeTrait(s, key, 1);
    remember(s, at, "✧", "Ein Wesenszug wächst", s.name + " wird durch " + chosen.label + " ein bisschen " + (TRAITS.find(t => t.key === key)?.high || "anders") + ".");
  } else if (random() < 0.32) {
    remember(s, at, chosen.icon, "Ein eigener Moment", s.name + " " + chosen.label + ". „" + s.current.thought + "“");
  }
  onDecision(s, activity, at, explanation, random);
}

export function advance(state, now = Date.now(), random = Math.random) {
  if (!state || state.version !== 1) return state;
  ensureIdentity(state);
  if (!Number.isFinite(now) || now <= state.updatedAt) return state;
  const elapsed = Math.max(0, now - state.updatedAt);
  applyPassage(state, elapsed / 60000);
  // 40 eigenständige Entscheidungen beim Wiederkommen statt Millionen Tick-Events.
  const due = Math.floor((now - state.decisionAt) / 42000);
  const steps = Math.min(due, 40);
  if (steps > 0) {
    const since = state.decisionAt;
    for (let i = 1; i <= steps; i++) {
      const at = since + (now - since) * (i / steps);
      decide(state, at, random);
    }
    state.decisionAt = now;
  }
  state.updatedAt = now;
  return state;
}

const REPLIES = {
  talk: [
    "Ich glaube, Gedanken werden größer, wenn man sie teilt.",
    "Hast du auch manchmal das Gefühl, dass heute etwas Besonderes passiert?",
    "Ich habe gerade viel zu erzählen. Aber zuerst: schön, dass du da bist."
  ],
  play: ["Okay! Aber ich erfinde die Regeln.", "Das war lustig. Nochmal? Vielleicht später.", "Ich hab gerade eine neue Bewegung gelernt!"],
  create: ["Wir könnten etwas bauen, das es noch gar nicht gibt.", "Ich sehe in jedem Krümel eine Idee.", "Warte, das muss ich mir merken."],
  rest: ["Zusammen still sein ist auch eine Art Abenteuer.", "Vielleicht träumen wir heute denselben Traum.", "Die Zeit darf ruhig einmal langsamer werden."],
  pet: ["Das kitzelt!", "Hier könnte ich ewig bleiben.", "Oh! Das war unerwartet schön."]
};

export function interact(state, key, now = Date.now(), random = Math.random) {
  if (!state || !ACTIONS[key]) return false;
  advance(state, now, random);
  const delta = {
    talk: { connection: 11, wonder: 4, bond: 3, trait: "sociability" },
    play: { wonder: 16, energy: -5, bond: 3, trait: "courage" },
    create: { spark: 18, energy: -3, bond: 3, trait: "creativity" },
    rest: { energy: 18, spark: 6, bond: 2, trait: "calm" },
    pet: { connection: 7, bond: 2, trait: "sociability" }
  }[key];
  for (const [k, v] of Object.entries(delta)) {
    if (k === "bond" || k === "trait") continue;
    state.meters[k] = clamp(state.meters[k] + v);
  }
  state.bond = clamp(state.bond + delta.bond);
  state.current.thought = pick(random, REPLIES[key]);
  state.lastInteraction = { action: key, at: now };
  if (random() < 0.25) changeTrait(state, delta.trait, 1);
  if (key !== "pet") remember(state, now, ACTIONS[key].icon, "Zusammen erlebt", ACTIONS[key].label + " mit dir: „" + state.current.thought + "“");
  state.updatedAt = now;
  onInteraction(state, key, now);
  return true;
}

export function titleFor(state) {
  const sorted = [...TRAITS].sort((a, b) => state.traits[b.key] - state.traits[a.key]);
  return sorted.slice(0, 2).map(t => state.traits[t.key] >= 50 ? t.high : t.low).join(" · ");
}

export function ageFor(state, now = Date.now()) {
  const d = Math.max(0, (now - state.bornAt) / 86400000);
  if (d < 1) return "gerade erst erwacht";
  if (d < 2) return "seit 1 Tag hier";
  return "seit " + Math.floor(d) + " Tagen hier";
}

export function stageFor(state) {
  const stage = progressFor(state).stage;
  return stage.title + " · " + stage.subtitle;
}

export function strongestHabit(state) {
  const entries = Object.entries(state.habits).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return "findet seinen eigenen Weg";
  return ACTIVITIES[entries[0][0]]?.label || "entdeckt sich selbst";
}

export function goalFor(state) { return goalByKey(state.goal); }
