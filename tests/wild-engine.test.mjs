import test from 'node:test';
import assert from 'node:assert/strict';
import {hatch,migrateOld,advanceWild,witness,chooseStory,storyFor,pathFor,stageLabel,connect,isWildSave,BIOMES,RELICS} from '../wild-engine.mjs';

test('Birth creates distinct bodies, motives and an owned past',()=>{
 const a=hatch('',1000,()=>.02),b=hatch('',1000,()=>.94);
 assert.notDeepEqual(a.genes,b.genes);
 assert.notDeepEqual(a.traits,b.traits);
 assert.ok(a.name.length);
 assert.equal(a.memories.length,1);
 assert.ok(isWildSave(a));
});
test('Autonomous decisions create memories, experience and an evolving form',()=>{
 const s=hatch('Sora',1000,()=>.5);
 for(let i=1;i<=120;i++)witness(s,1000+i*24001,()=>.35);
 assert.ok(s.journeys>=100);
 assert.ok(s.stage>=3);
 assert.ok(s.memories.some(m=>m.kind==='evolution'));
 assert.ok(BIOMES.find(x=>x.id===s.biome));
 assert.ok(pathFor(s).title.length>3);
 assert.ok(stageLabel(s).length>3);
 assert.ok(Object.values(s.traits).every(v=>v>=5&&v<=95));
});
test('A story is a choice with lasting differences and cannot resolve twice',()=>{
 const s=hatch('Kio',1000,()=>.5);
 for(let i=1;i<=4;i++)witness(s,1000+i*25000,()=>.32);
 assert.ok(s.pending);
 const story=storyFor(s);
 const before=s.affinities[story.options[0].affinity];
 const answer=chooseStory(s,0,110000);
 assert.ok(answer.description.length>10);
 assert.ok(s.affinities[answer.affinity]>before);
 assert.equal(chooseStory(s,0,120000),null);
});
test('Offline simulation has capped catchup and never punishes neglect',()=>{
 const s=hatch('Mori',1000,()=>.15);advanceWild(s,1000+90*86400000,()=>.5);
 assert.ok(s.journeys<=48);
 assert.ok(s.resources.energy>=18);
 assert.ok(s.memories.length<=70);
});
test('Contacts are rate limited to avoid bond-spamming',()=>{
 const s=hatch('Mori',1000,()=>.25);const a=connect(s,30000);
 assert.ok(a);assert.equal(connect(s,30002),null);
});
test('Old save migrates without modifying previous browser slot',()=>{
 const legacy={version:1,name:'Lumi',bornAt:1000,traits:{curiosity:74,creativity:66,sociability:32,courage:50,calm:44},habits:{wander:41},goal:'maker',bond:78,goalsReached:1,memories:[{at:1000,title:'Eine Erinnerung',icon:'✧',text:'Ich war hier.'}]};
 const s=migrateOld(legacy,200000,()=>.5);
 assert.equal(s.name,'Lumi');assert.equal(s.resources.bond,78);
 assert.equal(s.traits.curiosity,74);
 assert.ok(s.memories.length>=2);assert.ok(isWildSave(s));
 assert.equal(legacy.version,1);
});
test('Rejected malformed content does not count as a save',()=>{
 assert.equal(isWildSave({schema:2,name:'x'}),false);
 assert.equal(migrateOld({version:999,name:'oops'}),null);
});
