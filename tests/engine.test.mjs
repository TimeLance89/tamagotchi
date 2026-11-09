import test from "node:test";
import assert from "node:assert/strict";
import { ACTIVITIES, GOALS, TRAITS, advance, ageFor, birth, goalFor, interact, stageFor, strongestHabit, titleFor } from "../engine.mjs";

test("Jedes Wesen erhält einen eigenen Startcharakter, Traum und Namen", () => {
  const a = birth("", 1000, () => 0);
  const b = birth("", 1000, () => .99);
  assert.notEqual(a.name, b.name);
  assert.notDeepEqual(a.traits, b.traits);
  assert.notEqual(a.goal, b.goal);
  assert.equal(a.memories.length, 1);
  assert.equal(a.version, 1);
  assert.ok(TRAITS.every(t => Number.isFinite(a.traits[t.key])));
});

test("Eigene Entscheidungen verändern Gewohnheiten und Fähigkeiten", () => {
  const state = birth("Mio", 1000, () => .4);
  advance(state, 1000 + 43000, () => .4);
  assert.equal(Object.values(state.habits).reduce((a, b) => a + b, 0), 1);
  assert.ok(Object.keys(ACTIVITIES).includes(state.current.activity));
  assert.ok(Object.values(state.skills).some(x => x > 0));
  assert.equal(state.updatedAt, 44000);
});

test("Rückkehr nach langer Zeit bleibt begrenzt und ohne Vernachlässigungsstrafe", () => {
  const state = birth("Nilo", 1000, () => .6);
  advance(state, 1000 + 30 * 86400000, () => .6);
  assert.equal(Object.values(state.habits).reduce((a, b) => a + b, 0), 40);
  assert.ok(state.memories.length <= 32);
  assert.ok(Object.values(state.meters).every(x => x >= 0 && x <= 100));
  assert.ok(Object.values(state.traits).every(x => x >= 5 && x <= 95));
  assert.ok(GOALS.some(g => g.key === state.goal));
  assert.ok(state.bond >= 0);
});

test("Gemeinsame Momente bauen Verbindung auf und schaffen Erinnerungen", () => {
  const state = birth("Pip", 1000, () => .5);
  const bond = state.bond;
  assert.equal(interact(state, "talk", 2000, () => .5), true);
  assert.ok(state.bond > bond);
  assert.ok(state.meters.connection > 48);
  assert.equal(state.memories[0].title, "Zusammen erlebt");
  assert.equal(interact(state, "unbekannt", 3000, () => .5), false);
});

test("Hilfsfunktionen geben Beschreibungen statt Rohdaten zurück", () => {
  const state = birth("Lumi", 1000, () => .6);
  assert.ok(titleFor(state).includes(" · "));
  assert.ok(ageFor(state, 1000 + 86400000).includes("1 Tag"));
  assert.ok(stageFor(state).length > 5);
  assert.ok(strongestHabit(state).length > 5);
  assert.ok(goalFor(state).title.length > 4);
});

test("Vergangene und ungültige Ticks ändern den Zustand nicht", () => {
  const state = birth("Momo", 2000, () => .5);
  const before = JSON.stringify(state);
  advance(state, 1000);
  assert.equal(JSON.stringify(state), before);
  advance(state, Number.NaN);
  assert.equal(JSON.stringify(state), before);
});
