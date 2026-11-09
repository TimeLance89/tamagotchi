import { initEvolutionUI, renderEvolutionUI } from "./evolution-ui.mjs";
import { ACTIONS, ACTIVITIES, TRAITS, advance, ageFor, birth, goalFor, interact, stageFor, strongestHabit, titleFor } from "./engine.mjs";

const KEY = "mio.life.v1";
const byId = id => document.getElementById(id);
const world = byId("world");
const creature = byId("creature");
const welcome = byId("welcome");
const settings = byId("settings");
const toast = byId("toast");
const localeTime = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit" });
const localeDate = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short" });
const worldNames = { meadow: "AUF DER WIESE", garden: "IM GARTEN", studio: "IN DER WERKSTATT", night: "IM TRAUMLAND" };
const meterNames = ["energy", "wonder", "connection", "spark"];
let pet = readSave();
let toastTimer = null;
let previousMemoryKey = "";
let lastActionAt = 0;

function isValid(value) {
  const numeric = n => typeof n === "number" && Number.isFinite(n);
  return Boolean(value && value.version === 1 &&
    typeof value.name === "string" && value.name.length > 0 && value.name.length <= 22 &&
    value.traits && TRAITS.every(t => numeric(value.traits[t.key]) && value.traits[t.key] >= 0 && value.traits[t.key] <= 100) &&
    value.meters && meterNames.every(k => numeric(value.meters[k]) && value.meters[k] >= 0 && value.meters[k] <= 100) &&
    value.habits && typeof value.habits === "object" && !Array.isArray(value.habits) &&
    value.skills && typeof value.skills === "object" &&
    value.current && ACTIVITIES[value.current.activity] &&
    typeof value.current.thought === "string" && value.current.thought.length < 500 &&
    Array.isArray(value.memories) && value.memories.length <= 50 &&
    value.memories.every(m => m && numeric(m.at) && typeof m.icon === "string" &&
      typeof m.title === "string" && typeof m.text === "string" && m.text.length < 3000) &&
    numeric(value.bornAt) && numeric(value.updatedAt) && numeric(value.decisionAt) &&
    numeric(value.bond) && numeric(value.goalProgress) && numeric(value.goalsReached));
}

function readSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    return isValid(value) ? value : null;
  } catch { return null; }
}

function save() {
  if (!pet) return;
  try { localStorage.setItem(KEY, JSON.stringify(pet)); }
  catch { showToast("Speichern ist im Browser blockiert. Das Wesen lebt vorübergehend nur hier."); }
}

function setText(id, value) { byId(id).textContent = String(value); }
function fill(id, value) { byId(id).style.width = Math.max(0, Math.min(100, Number(value) || 0)) + "%"; }
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2900);
}
function openDialog(which) {
  which.hidden = false;
  document.body.style.overflow = "hidden";
  const first = which.querySelector("input:not([hidden]), button:not([hidden])");
  first?.focus();
}
function closeDialog(which) {
  which.hidden = true;
  if (welcome.hidden && settings.hidden) document.body.style.overflow = "";
}

function visibleMemoryKey() {
  return pet.memories.map(m => String(m.at) + m.title + m.text).join("|");
}

function renderMemories() {
  const key = visibleMemoryKey();
  if (key === previousMemoryKey) return;
  previousMemoryKey = key;
  const fragment = document.createDocumentFragment();
  for (const m of pet.memories.slice(0, 8)) {
    const item = document.createElement("article");
    item.className = "journal-item";
    const icon = document.createElement("div");
    icon.className = "journal-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = m.icon;
    const content = document.createElement("div");
    content.className = "journal-content";
    const top = document.createElement("div");
    top.className = "journal-top";
    const title = document.createElement("strong");
    title.textContent = m.title;
    const time = document.createElement("time");
    time.dateTime = new Date(m.at).toISOString();
    const now = Date.now();
    time.textContent = now - m.at < 86400000 ? localeTime.format(new Date(m.at)) : localeDate.format(new Date(m.at));
    top.append(title, time);
    const body = document.createElement("p");
    body.textContent = m.text;
    content.append(top, body);
    item.append(icon, content);
    fragment.append(item);
  }
  byId("journal").replaceChildren(fragment);
}

function renderTraits() {
  const fragment = document.createDocumentFragment();
  for (const trait of TRAITS) {
    const value = Math.max(0, Math.min(100, Number(pet.traits[trait.key]) || 0));
    const row = document.createElement("div");
    row.className = "trait-row";
    const line = document.createElement("div");
    line.className = "trait-line";
    const label = document.createElement("strong");
    label.textContent = trait.title;
    const hint = document.createElement("span");
    hint.textContent = value >= 50 ? trait.high : trait.low;
    const track = document.createElement("div");
    track.className = "trait-track";
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-label", trait.title);
    track.setAttribute("aria-valuenow", String(value));
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "100");
    const bar = document.createElement("div");
    bar.className = "trait-fill";
    bar.style.width = value + "%";
    track.append(bar);
    line.append(label, hint);
    row.append(line, track);
    fragment.append(row);
  }
  byId("traits").replaceChildren(fragment);
}

function renderScene() {
  const activity = ACTIVITIES[pet.current.activity] || ACTIVITIES.watch;
  const place = worldNames[pet.current.place] ? pet.current.place : "meadow";
  const hour = new Date().getHours();
  const isNight = hour < 7 || hour >= 21;
  world.className = "world world-" + place + (isNight ? " nighttime" : "");
  creature.classList.toggle("is-sleeping", ["sleep", "dream"].includes(pet.current.activity));
  creature.classList.toggle("is-happy", pet.meters.connection > 70 || pet.bond > 65);
  setText("world-location", worldNames[place]);
  setText("world-weather", isNight ? "☾ Ein stiller Abend" : hour < 12 ? "✧ Ein neuer Tag" : "✦ Ein guter Moment");
  setText("activity-label", pet.name + " " + activity.label);
  setText("activity-icon", activity.icon);
  setText("thought-text", pet.current.thought || "Ich bin gespannt, was heute passiert.");
}

function render() {
  byId("clock").textContent = localeTime.format(new Date());
  if (!pet) return;
  setText("creature-name", pet.name);
  setText("personality-line", titleFor(pet));
  setText("age-label", ageFor(pet));
  setText("stage-label", stageFor(pet));
  setText("bond-label", Math.round(pet.bond) + "%");
  fill("bond-bar", pet.bond);
  const goal = goalFor(pet);
  setText("goal-title", goal.title);
  setText("goal-description", goal.description);
  setText("goal-value", Math.floor(pet.goalProgress) + "%");
  fill("goal-bar", pet.goalProgress);
  setText("goals-reached", pet.goalsReached ? pet.goalsReached + (pet.goalsReached === 1 ? " Traum verwirklicht ✦" : " Träume verwirklicht ✦") : "Noch kein Traum vollendet · und das ist okay");
  for (const key of meterNames) {
    setText(key + "-value", Math.round(pet.meters[key]));
    fill(key + "-bar", pet.meters[key]);
  }
  setText("favorite-habit", strongestHabit(pet));
  renderScene();
  renderTraits();
  renderMemories();
  renderEvolutionUI(pet);
}

function pulse() {
  if (!pet) return;
  advance(pet);
  save();
  render();
}

byId("birth-form").addEventListener("submit", event => {
  event.preventDefault();
  pet = birth(byId("name-input").value);
  previousMemoryKey = "";
  save();
  closeDialog(welcome);
  render();
  showToast(pet.name + " ist da. Und hat schon eigene Pläne ✦");
});

function interactWith(action) {
  if (!pet || !ACTIONS[action]) return;
  if (Date.now() - lastActionAt < 900) return; // vermeidet ungewollte Doppelklicks
  lastActionAt = Date.now();
  interact(pet, action);
  previousMemoryKey = "";
  save();
  render();
  creature.classList.remove("is-petted");
  void creature.offsetWidth;
  creature.classList.add("is-petted");
  showToast(action === "pet" ? pet.name + " freut sich ♡" : "Ein schöner gemeinsamer Moment ✦");
}
document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => interactWith(button.dataset.action));
});
creature.addEventListener("click", () => interactWith("pet"));
creature.addEventListener("animationend", event => {
  if (event.animationName === "happy-jump") creature.classList.remove("is-petted");
});

byId("settings-button").addEventListener("click", () => openDialog(settings));
byId("close-settings").addEventListener("click", () => closeDialog(settings));
settings.addEventListener("click", event => { if (event.target === settings) closeDialog(settings); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !settings.hidden) closeDialog(settings);
});
byId("export-button").addEventListener("click", () => {
  if (!pet) return;
  const data = new Blob([JSON.stringify(pet, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "mio-" + pet.name.replace(/[^a-zA-Z0-9_-]/g, "_") + "-sicherung.json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Geschichte als Datei gesichert ✦");
});
byId("import-button").addEventListener("click", () => byId("import-file").click());
byId("import-file").addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    if (file.size > 250_000) throw new Error("Die Datei ist zu groß.");
    const incoming = JSON.parse(await file.text());
    if (!isValid(incoming)) throw new Error("Das ist keine gültige mio.-Sicherung.");
    if (pet && !confirm("Dein aktuelles Wesen wird durch " + incoming.name + " ersetzt. Fortfahren?")) return;
    pet = incoming;
    advance(pet);
    previousMemoryKey = "";
    save();
    closeDialog(settings);
    render();
    showToast("Willkommen zurück, " + pet.name + " ♡");
  } catch (error) {
    showToast(error.message || "Sicherung konnte nicht geladen werden.");
  } finally { event.target.value = ""; }
});

byId("reset-button").addEventListener("click", () => {
  if (!pet || !confirm("Wirklich ein neues Wesen erschaffen? Alle Erinnerungen von " + pet.name + " in diesem Browser gehen verloren.")) return;
  try { localStorage.removeItem(KEY); } catch { /* Browser blockiert Speicherung */ }
  pet = null;
  previousMemoryKey = "";
  byId("name-input").value = "";
  closeDialog(settings);
  openDialog(welcome);
});
window.addEventListener("storage", event => {
  if (event.key !== KEY) return;
  const latest = readSave();
  if (latest) {
    pet = latest;
    previousMemoryKey = "";
    if (!welcome.hidden) closeDialog(welcome);
    render();
  }
});
document.addEventListener("visibilitychange", () => { if (!document.hidden) pulse(); });
window.addEventListener("focus", pulse);
initEvolutionUI(() => pet, (message) => {save(); render(); if (message) showToast(message);});
if (pet) {
  advance(pet);
  save();
  render();
} else {
  render();
  openDialog(welcome);
}
setInterval(pulse, 6000);
setInterval(() => { byId("clock").textContent = localeTime.format(new Date()); }, 30000);
