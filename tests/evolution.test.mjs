import test from 'node:test';
import assert from 'node:assert/strict';
import { birth,advance,interact } from '../engine.mjs';
import { appearanceFor,ensureIdentity,progressFor,resolveOpportunity,PATHS } from '../evolution.mjs';

test('Geburt erzeugt ein visuell individuelles, dauerhaftes Genom',()=>{
  const a=birth('Sora',1000,()=>.1);
  const b=birth('Sora',1000,()=>.9);
  assert.ok(a.identity.genome.seed!==b.identity.genome.seed);
  assert.ok(appearanceFor(a).signature!==appearanceFor(b).signature);
  assert.equal(appearanceFor(a).stage,0);
});
test('eigene Entscheidungen entwickeln das Wesen bis zu neuen Formen',()=>{
  const p=birth('Lumi',1000,()=>.4);
  advance(p,1000+42000*40,()=>.0);
  assert.ok(p.identity.points>=16);
  assert.ok(p.identity.stage>=1);
  assert.ok(p.identity.decisions===40);
  assert.ok(p.identity.discoveries.length>0);
  assert.ok(p.identity.rationale.includes('Lumi'));
  advance(p,1000+42000*100,()=>.1);
  assert.ok(p.identity.stage>=2);
  assert.ok(Object.keys(PATHS).includes(p.identity.path));
  assert.ok(progressFor(p).percent>=0 && progressFor(p).percent<=100);
});
test('Entscheidungen über Entdeckungen beeinflussen reale Eigenschaften',()=>{
  const p=birth('Nilo',1000,()=>.4);
  advance(p,1000+42000*40,()=>0);
  assert.ok(p.identity.opportunity);
  const curiosity=p.traits.curiosity;
  const memory=p.memories.length;
  const result=resolveOpportunity(p,'first',1000+42000*41);
  assert.ok(result.message);
  assert.equal(p.traits.curiosity,Math.min(95,curiosity+2));
  assert.equal(p.identity.opportunity,null);
  assert.ok(p.memories.length>=memory);
});
test('bestehende Wesen bleiben erhalten und werden migriert',()=>{
  const p=birth('Mori',1000,()=>.7);
  delete p.identity;
  const bond=p.bond,name=p.name;
  ensureIdentity(p);
  assert.equal(p.name,name);
  assert.equal(p.bond,bond);
  assert.ok(p.identity.genome);
  interact(p,'talk',3000,()=>.5);
  assert.ok(p.identity.choices.length>=1);
});
test('ein Wesen stirbt bei längerer Abwesenheit nicht und bleibt berechenbar',()=>{
  const p=birth('Kiro',1000,()=>.6);
  advance(p,1000+365*86400000,()=>.2);
  assert.equal(p.identity.decisions,40);
  assert.ok(p.memories.length<=32);
  assert.ok(p.identity.discoveries.length<=40);
  assert.ok(Number.isFinite(p.identity.points));
});
