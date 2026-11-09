import {hatch, migrateOld, advanceWild, witness, chooseStory, connect, storyFor, pathFor, stageLabel, selfSummary, isWildSave, RELICS, BIOMES, STAGES, ACTIONS} from './wild-engine.mjs';

const byId=id=>document.getElementById(id);
const canvas=byId('sky'),ctx=canvas.getContext('2d',{alpha:false});
const overlay=byId('overlay'),overlayBody=byId('overlay-body'),overlayKicker=byId('overlay-kicker');
const STORAGE='mio.wild.v1',OLD_STORAGE='mio.life.v1';
const view={width:0,height:0,scale:1,started:performance.now(),stars:[],motes:[],foreground:[],look:'world',hitTime:0,motion:0,latestDiscovery:null};
const naming={curiosity:'Neugier',courage:'Mut',dreaming:'Fantasie',empathy:'Mitgefühl',independence:'Eigensinn'};
let pet=readSave(),audio=null,audioOn=false,toastTimer,sceneTime=0,renderKey='';

function readSave(){
  try {
    const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');
    if(isWildSave(saved))return saved;
    const old=JSON.parse(localStorage.getItem(OLD_STORAGE)||'null');
    const s=migrateOld(old);
    if(s){localStorage.setItem(STORAGE,JSON.stringify(s));return s;}
  }catch(e){console.warn('Spielstand konnte nicht geladen werden',e)}
  return null;
}
function save(){if(!pet)return;try{localStorage.setItem(STORAGE,JSON.stringify(pet))}catch(e){console.warn('Speichern fehlgeschlagen',e);toast('Bitte Speicher im Browser erlauben.')}}
function escapeHTML(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function toast(message){const el=byId('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3100);}
function setText(id,text){byId(id).textContent=String(text);}
function seedrandom(seed){let a=seed>>>0;return ()=>{a+=0x6d2b79f5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}}
function maxDay(){return pet?Math.max(1,Math.floor((Date.now()-pet.bornAt)/86400000)+1):1;}
function path(){return pet?pathFor(pet):null;}
function playSound(f=440){if(!audioOn)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(f,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(f*1.5,audio.currentTime+.18);gain.gain.setValueAtTime(.0001,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.045,audio.currentTime+.03);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+.37);osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+.39)}catch(e){console.warn(e)}}

function render(){if(!pet)return;
  const biome=BIOMES.find(b=>b.id===pet.biome)||BIOMES[0],act=ACTIONS.find(a=>a.id===pet.activity);
  setText('place-chapter',`KAPITEL ${String(pet.chapter).padStart(2,'0')} · ${path()?.title.toUpperCase()||'EIN NEUES LEBEN'}`);
  setText('place-name',biome.name.toUpperCase());setText('place-sub',biome.sub);
  setText('place-presence',`${pet.name} ist hier · ${pet.mood}`);
  setText('stage-title',stageLabel(pet).toUpperCase());
  setText('speech-text',pet.thought);setText('speech-icon',act?.emoji||'✧');
  setText('moment-title',`${pet.name} ${act?.verb||'entdeckt sich selbst'}.`);
  setText('moment-reason',pet.reason);setText('moment-art',act?.emoji||'✦');
  setText('moment-count',`TAG ${maxDay()}`);
  byId('choice-button').hidden=!pet.pending;
  if(!overlay.hidden && view.look!=='world')refreshPanel();
}
function showPanel(which){if(!pet)return;view.look=which;
  document.querySelectorAll('.nav-item').forEach(b=>{const yes=b.dataset.panel===which;b.classList.toggle('selected',yes);if(yes)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  if(which==='world'){closePanel();return;}
  refreshPanel();overlay.hidden=false;document.body.style.overflow='hidden';byId('overlay-close').focus();
}
function closePanel(){overlay.hidden=true;document.body.style.overflow='';view.look='world';document.querySelectorAll('.nav-item').forEach(b=>{const yes=b.dataset.panel==='world';b.classList.toggle('selected',yes);if(yes)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});}
function refreshPanel(){if(!pet||overlay.hidden&&view.look==='world')return;const which=view.look;
  let html='';overlayKicker.textContent=({map:'DIE WELT ENTDECKEN',journal:'SEINE GESCHICHTE',identity:'WER BIN ICH?',event:'EINE ENTSCHEIDUNG',evolution:'DEIN WESEN VERÄNDERT SICH',discovery:'EIN SELTENER FUND',settings:'DEIN KLEINES UNIVERSUM'})[which]||'MIO. WILD';
  if(which==='map'){
    html=`<h2 id="overlay-title">Eine Welt, die nicht<br>auf dich wartet.</h2><p class="overlay-intro">${escapeHTML(pet.name)} reist von selbst. Du kannst seine Wege und die Geheimnisse der Regionen entdecken, ohne ihm Befehle zu geben.</p><div class="map-grid">${BIOMES.map(b=>{const count=RELICS.filter(q=>q.biome===b.id&&pet.discoveries.includes(q.id)).length;return `<button type="button" class="map-node ${pet.biome===b.id?'current':''}" data-biome="${b.id}"><span class="map-icon">${b.icon}</span><div><strong>${b.name}</strong><small>${pet.biome===b.id?'✦ Gerade hier · ':''}${count}/3 Geheimnisse entdeckt</small></div></button>`}).join('')}</div><div class="details-foot"><h3>Gefundene Geheimnisse</h3><p>${pet.discoveries.length} von 12 Artefakten. Jedes verändert ein Stück seiner inneren Welt.</p><div class="relic-grid">${RELICS.map(item=>{const found=pet.discoveries.includes(item.id);return `<div class="relic ${found?'':'unseen'}"><span class="relic-icon">${found?item.icon:'?'}</span><strong>${found?item.title:'Unbekannt'}</strong><span>${found?item.text:'Wartet darauf, entdeckt zu werden.'}</span></div>`}).join('')}</div></div>`;
  }else if(which==='journal'){
    html=`<h2 id="overlay-title">Nichts davon<br>passiert zweimal.</h2><p class="overlay-intro">Dein Wesen schreibt seine eigene Geschichte – auch während du weg bist. Seine Erinnerungen bleiben.</p><div class="timeline">${pet.memories.slice(0,40).map(m=>`<article class="timeline-entry"><div class="timeline-icon">${escapeHTML(m.icon)}</div><div class="timeline-body"><strong>${escapeHTML(m.title)}</strong><p>${escapeHTML(m.text)}</p><small>${new Date(m.at).toLocaleDateString('de-DE',{day:'2-digit',month:'long'})} · ${new Date(m.at).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}</small></div></article>`).join('')}</div>`;
  }else if(which==='identity'){
    const path=pathFor(pet);
    html=`<h2 id="overlay-title">Kein zweites Wesen<br>wie ${escapeHTML(pet.name)}.</h2><p class="overlay-intro">Seine Gene legen den Anfang fest – aber seine Erlebnisse bestimmen, wer es wird.</p><div class="identity-hero"><div class="identity-glyph">✳</div><div><h3>${escapeHTML(pet.name)}</h3><span class="segment">✦ ${stageLabel(pet)}</span><span class="segment">${path.title}</span><p>${escapeHTML(selfSummary(pet))}</p></div></div><h3>Sein Charakter</h3><p>Die Werte ändern sich durch Erfahrungen, nicht durch das Drücken eines Knopfes.</p><div class="trait-list">${Object.entries(naming).map(([key,label])=>`<div class="trait-item"><div class="trait-top"><span>${label}</span><strong>${Math.round(pet.traits[key])}</strong></div><div class="trait-rail"><div style="width:${pet.traits[key]}%"></div></div></div>`).join('')}</div><div class="details-foot"><h3>Was in ihm wächst</h3><p>Eine eigene Form verändert sich durch seinen stärksten Lebensweg. Jeder Fund, jede Begegnung und jede selbstständige Entscheidung prägt diesen Weg.</p><span class="segment">${pet.journeys} eigene Entschlüsse</span><span class="segment">${pet.discoveries.length} Entdeckungen</span><span class="segment">${pet.encounters.length} Geschichten</span><span class="segment">${STAGES.length-pet.stage-1} mögliche weitere Formen</span></div>`;
  }else if(which==='event'){
    const event=storyFor(pet);if(!event){closePanel();toast('Die Geschichte wurde bereits erzählt.');return}
    html=`<h2 id="overlay-title">Die Welt hält<br>kurz den Atem an.</h2><p class="overlay-intro">Du kannst diesmal Teil eines besonderen Moments werden. Deine Wahl hinterlässt Spuren in seiner Persönlichkeit.</p><section class="story-card"><div class="story-art">${event.icon}</div><h3>${event.title}</h3><p>${event.scene}</p><div class="story-options">${event.options.map((o,i)=>`<button data-choice="${i}" class="story-option"><div><strong>${o.label}</strong><small>${o.hint}</small></div><span class="arrow">↗</span></button>`).join('')}</div></section>`;
  }else if(which==='evolution'){
    const p=pathFor(pet);
    html=`<div class="reveal"><div class="reveal-glyph">✺</div><div class="micro">DEINE WELT HAT SICH VERÄNDERT</div><h2 id="overlay-title">${escapeHTML(pet.name)} ist<br><em>${stageLabel(pet)}</em> geworden.</h2><p>Keine Entwicklung wurde ausgewählt. Seine Handlungen haben diese Gestalt geformt. Der ${p.title}-Pfad hat neue Spuren in seinem Wesen hinterlassen.</p><span class="segment">${escapeHTML(p.ability)}</span><div class="details-foot"><button type="button" class="primary" id="reveal-close">Seine neue Form entdecken <span>↗</span></button></div></div>`;
  }else if(which==='discovery'){
    const item=RELICS.find(x=>x.id===view.latestDiscovery);
    html=`<div class="reveal"><div class="reveal-glyph">${item?.icon||'✧'}</div><div class="micro">SELTENER FUND</div><h2 id="overlay-title">${escapeHTML(pet.name)} hat etwas gefunden.</h2><h3>${escapeHTML(item?.title||'Ein Geheimnis')}</h3><p>${escapeHTML(item?.text||'Eine neue Erinnerung für seine Welt.')}</p><p>Dieser Fund verstärkt den Weg, den es aus eigenem Antrieb verfolgt.</p><div class="details-foot"><button type="button" class="primary" id="reveal-close">Dieses Geheimnis bewahren <span>↗</span></button></div></div>`;
  }else if(which==='settings'){
    html=`<h2 id="overlay-title">Ein Universum,<br>das dir gehört.</h2><p class="overlay-intro">Kein Konto, kein Online-Zwang. Die gesamte Geschichte lebt auf diesem Gerät. Sichere sie vor einer Neuinstallation.</p><button id="export-button" class="settings-action">↓ Geschichte als Datei sichern<small>Auf Android im Downloads-Ordner</small></button><button id="import-button" class="settings-action">↑ Eine Geschichte wiederherstellen<small>Auch ältere mio.-Spielstände werden übernommen</small></button><input type="file" id="import-input" accept=".json,application/json" hidden><button id="restart-button" class="settings-action danger">Ein ganz neues Wesen erschaffen<small>Das bisherige wird auf diesem Gerät ersetzt</small></button><p class="panel-note">Die eigenständigen Entscheidungen werden lokal simuliert. Aktuell keine generative KI – dafür nachvollziehbares Verhalten und permanente Konsequenzen.</p>`;
  }
  overlayBody.innerHTML=html;
  overlayBody.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{
    const choice=chooseStory(pet,Number(b.dataset.choice));if(!choice)return;
    save();closePanel();render();toast(`✦ ${choice.description}`);playSound(520);
  }));
  overlayBody.querySelectorAll('[data-biome]').forEach(b=>b.addEventListener('click',()=>{
    const area=BIOMES.find(x=>x.id===b.dataset.biome);
    if(area)toast(`${area.icon} ${area.name}: ${area.sub}. ${pet.biome===area.id?'Dein Wesen ist gerade dort.':'Dein Wesen entdeckt diesen Ort auf eigene Faust.'}`);
  }));
  byId('reveal-close')?.addEventListener('click',closePanel);
  byId('export-button')?.addEventListener('click',exportSave);
  byId('import-button')?.addEventListener('click',()=>byId('import-input')?.click());
  byId('import-input')?.addEventListener('change',importSave);
  byId('restart-button')?.addEventListener('click',()=>{if(confirm('Alle Erinnerungen von '+pet.name+' auf diesem Gerät ersetzen? Bitte vorher eine Sicherung exportieren.')){try{localStorage.removeItem(STORAGE);localStorage.removeItem(OLD_STORAGE)}catch{}pet=null;closePanel();byId('intro-gate').hidden=false;byId('hatch-name').value='';byId('hatch-name').focus();}});
}
function exportSave(){if(!pet)return;const raw=JSON.stringify(pet,null,2);
  if(window.MioAndroid && typeof window.MioAndroid.saveBackup==='function'){window.MioAndroid.saveBackup(raw);return;}
  const blob=new Blob([raw],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`mio-wild-${pet.name.replace(/[^a-z0-9_-]/gi,'_')}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Deine Geschichte ist gesichert.');
}
async function importSave(e){const file=e.target.files?.[0];if(!file)return;
 try{if(file.size>400000)throw Error('Die Datei ist zu groß.');const data=JSON.parse(await file.text());const incoming=isWildSave(data)?data:migrateOld(data);
  if(!incoming || !isWildSave(incoming))throw Error('Kein gültiger mio.-Spielstand.');
  if(pet&&!confirm(`${pet.name} durch ${incoming.name} ersetzen?`))return;
  pet=incoming;advanceWild(pet);save();closePanel();render();toast(`Willkommen zurück, ${pet.name} ♡`);
 }catch(err){toast(err.message||'Sicherung konnte nicht geöffnet werden.')}finally{e.target.value=''}
}

/* Canvas illustration. No image URLs, no licensed assets, no CSS character emoji. */
function resize(){const w=window.innerWidth,h=window.innerHeight,dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';view.width=w;view.height=h;view.scale=dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
 const r=seedrandom(73);view.stars=Array.from({length:145},()=>({x:r(),y:r()*.65,z:.4+r()*1.9,t:r()*6}));view.motes=Array.from({length:66},()=>({x:r(),y:r(),phase:r()*6.3,size:.4+r()*2.2,speed:.2+r()*.7}));}
function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function triangle(x1,y1,x2,y2,x3,y3,color){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineTo(x3,y3);ctx.closePath();ctx.fill()}
function glow(x,y,r,color,alpha=1){ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r);ctx.restore()}
function mountainLayer(w,h,base,amp,color,seed,shift=0){const r=seedrandom(seed);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-10,h);ctx.lineTo(-10,base);let x=-10;while(x<w+50){const dx=65+r()*105;ctx.lineTo(x+dx*.44,base-amp*(.25+r()*.9)+shift);ctx.lineTo(x+dx,base-amp*(.03+r()*.55));x+=dx}ctx.lineTo(w+10,h);ctx.closePath();ctx.fill()}
function drawTree(x,y,scale,t,biome,seed){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);const wig=Math.sin(t*.25+seed)*1.5;ctx.strokeStyle=biome==='ember'?'#39243b':'#122b34';ctx.lineCap='round';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(0,35);ctx.bezierCurveTo(wig,2,-5+wig,-25,0,-75);ctx.stroke();for(let i=0;i<3;i++){const dir=i%2?-1:1;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(0,-12-i*20);ctx.quadraticCurveTo(dir*22,-38-i*24,dir*(24+i*6),-45-i*21);ctx.stroke();glow(dir*(24+i*6),-45-i*21,17,biome==='ember'?'#ff9779':'#95eedb',.4);circle(dir*(24+i*6),-45-i*21,2.3,biome==='ember'?'#ffbb89':'#c0ffe5')}glow(0,-84,30,'#9bf6d4',.22);ctx.restore()}
function plant(x,y,scale,t,biome,phase){const color=biome==='ember'?'#fcb797':biome==='astral'?'#b7c2ff':'#cbffcd';ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.rotate(Math.sin(t*.7+phase)*.09);ctx.strokeStyle='#589b8c';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,9);ctx.quadraticCurveTo(-9,-8,-2,-21);ctx.stroke();glow(-2,-22,15,color,.45);circle(-2,-22,3.4,color);ctx.strokeStyle='#609e8b';ctx.beginPath();ctx.moveTo(0,-3);ctx.quadraticCurveTo(-17,-18,-18,-10);ctx.moveTo(0,-10);ctx.quadraticCurveTo(18,-26,22,-14);ctx.stroke();ctx.restore()}
function drawSky(t){const w=view.width,h=view.height,biome=pet?.biome||'lumen';const b=BIOMES.find(q=>q.id===biome)||BIOMES[0];
 let grad=ctx.createLinearGradient(0,0,w*.3,h);grad.addColorStop(0,b.colors[0]);grad.addColorStop(.6,b.colors[1]);grad.addColorStop(1,b.colors[2]);ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
 const x=w*(biome==='astral'?.68:.76),y=h*.20,rad=Math.min(w,h)*.14;
 glow(x,y,rad*3,biome==='ember'?'#ffad73':biome==='astral'?'#9ab4fb':'#a6ffde',.26);
 const orb=ctx.createRadialGradient(x-rad*.2,y-rad*.3,rad*.1,x,y,rad);orb.addColorStop(0,biome==='ember'?'#ffefb3':'#e1ffd7');orb.addColorStop(.7,biome==='astral'?'#bed6fa':'#b0e3d1');orb.addColorStop(1,biome==='ember'?'#d68b7c':'#759fa7');ctx.fillStyle=orb;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
 ctx.save();for(const s of view.stars){const tw=.4+Math.sin(t*(.9+s.z)+s.t)*.35;ctx.globalAlpha=tw;circle(s.x*w,s.y*h,Math.min(2.2,s.z*.88),'#e7ffe8')}ctx.restore();
 if(biome==='astral'){ctx.save();ctx.globalAlpha=.21;ctx.strokeStyle='#9fe6ff';ctx.lineWidth=19;ctx.beginPath();ctx.ellipse(w*.23,h*.24,w*.32,h*.12,-.44,0,Math.PI*2);ctx.stroke();ctx.restore()}
 if(biome==='mist'){for(let i=0;i<5;i++){glow(w*(.12+i*.21),h*(.23+i%2*.15),w*.3,'#b8f4db',.075)}}
 mountainLayer(w,h,h*.64,h*.19,biome==='ember'?'#49364a':'#304b60',17);
 mountainLayer(w,h,h*.71,h*.13,biome==='astral'?'#283b6b':biome==='ember'?'#583e4d':'#264b58',93);
 const waterY=h*.70;const water=ctx.createLinearGradient(0,waterY,0,h);water.addColorStop(0,biome==='ember'?'#5f4556':biome==='astral'?'#203456':'#214b58');water.addColorStop(1,'#0a1a27');ctx.fillStyle=water;ctx.fillRect(0,waterY,w,h-waterY);
 ctx.save();ctx.globalAlpha=.11;for(let i=0;i<28;i++){const xx=((i*199+t*4)%(w+160))-80,yy=h*(.76+(i%9)*.022);ctx.fillStyle='#b5fff0';ctx.fillRect(xx,yy,18+(i%7)*13,1)}ctx.restore();
 // Near cliff silhouettes form a safe, sheltered world around the creature.
 ctx.fillStyle=biome==='ember'?'#211e31':'#102632';ctx.beginPath();ctx.moveTo(0,h*.71);ctx.bezierCurveTo(w*.13,h*.69,w*.20,h*.77,w*.31,h*.82);ctx.bezierCurveTo(w*.35,h*.83,w*.44,h*.8,w*.5,h*.82);ctx.bezierCurveTo(w*.72,h*.79,w*.8,h*.67,w,h*.71);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.closePath();ctx.fill();
 const sc=Math.min(1.55,w/750);
 drawTree(w*.095,h*.73,sc*.9,t,biome,1);drawTree(w*.89,h*.74,sc*1.25,t,biome,3);if(w>600){drawTree(w*.28,h*.79,sc*.6,t,biome,2);drawTree(w*.73,h*.79,sc*.7,t,biome,4)}
 for(let i=0;i<15;i++){const side=i%2?-.08:1.08;const xx=w*(side+(i%7)*.055*(i%2?1:-1)),yy=h*(.77+(i%5)*.036);plant(xx,yy,(.55+i%4*.19)*sc,t,biome,i)}
 for(let i=0;i<view.motes.length;i++){const m=view.motes[i],px=(m.x*w+Math.sin(t*m.speed+m.phase)*14),py=((m.y*h-t*4*m.speed)%(h+30)+h+30)%(h+30);if(py<h*.09||py>h*.81)continue;glow(px,py,10,'#b3ffe2',.08);circle(px,py,m.size,'#d4ffe5')}
}
function drawAvatar(t){if(!pet)return;const w=view.width,h=view.height,genes=pet.genes,stage=pet.stage,form=pathFor(pet).id;const sc=Math.min(w<600?.91:1.21,Math.max(.74,w/470));const x=w*.5+(Math.sin(t*.29+pet.id)*16),y=h*(w<650?.51:.535)+Math.sin(t*1.25)*6;
 ctx.save();ctx.translate(x,y);ctx.scale(sc*genes.size/100,sc*genes.size/100);
 const r=genes.hue,base=`hsl(${r} 66% 77%)`,edge=`hsl(${r} 45% 55%)`,shine=`hsl(${r} 98% 90%)`,accent=form==='fire'?'#ffc38f':form==='stars'?'#d5c5ff':form==='bond'?'#ffb8cd':form==='dream'?'#9bf3ec':'#d7ffb3';
 // Aura and moving nebula around its growing body.
 const ar=110+stage*13;glow(0,0,ar,accent,.24+Math.sin(t*1.9)*.035);
 ctx.globalAlpha=.4;ellipse(0,105,86,14,'#001624');ctx.globalAlpha=1;
 // wings appear based on the path and evolution, they move independently of the body.
 if(stage>=2){const flap=Math.sin(t*3)*12;ctx.save();ctx.fillStyle=accent;ctx.globalAlpha=.52;ctx.beginPath();ctx.moveTo(-52,-22);ctx.quadraticCurveTo(-118,-76+flap,-92,25);ctx.quadraticCurveTo(-83,69,-43,49);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(52,-22);ctx.quadraticCurveTo(118,-76+flap,92,25);ctx.quadraticCurveTo(83,69,43,49);ctx.closePath();ctx.fill();ctx.restore()}
 // distinctive tails, which evolve into longer and more elaborate forms.
 ctx.save();ctx.strokeStyle=edge;ctx.lineWidth=14;ctx.lineCap='round';ctx.beginPath();const tailSign=genes.tail%2?1:-1;ctx.moveTo(tailSign*52,42);ctx.bezierCurveTo(tailSign*100,26,tailSign*(98+stage*9),93,tailSign*(55+stage*8),87);ctx.stroke();glow(tailSign*(55+stage*8),87,18,accent,.45);circle(tailSign*(55+stage*8),87,9,accent);ctx.restore();
 // feet and soft paws
 for(const side of [-1,1]){ctx.save();ctx.translate(side*43,82);ctx.rotate(side*.22);ellipse(0,0,27,19,edge);ellipse(-5,-6,17,9,base);ctx.restore()}
 // horns/antennae respond to genetically inherited ear shape.
 for(const side of [-1,1]){ctx.save();ctx.translate(side*42,-73);ctx.rotate(side*(genes.ears*.075));ctx.fillStyle=base;ctx.beginPath();ctx.moveTo(-24,24);ctx.quadraticCurveTo(-16,-49,-4,-52-stage*6);ctx.quadraticCurveTo(12,-22,26,20);ctx.closePath();ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=3;ctx.stroke();ctx.restore()}
 if(stage>=3){for(const side of [-1,1]){ctx.save();ctx.strokeStyle=accent;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(side*25,-72);ctx.bezierCurveTo(side*31,-104,side*52,-111,side*50,-135);ctx.moveTo(side*43,-112);ctx.lineTo(side*72,-118);ctx.stroke();glow(side*50,-135,22,accent,.5);ctx.restore()}}
 // organic pear-shaped creature, not a flat sprite
 const surface=ctx.createRadialGradient(-31,-55,4,9,23,145);surface.addColorStop(0,shine);surface.addColorStop(.54,base);surface.addColorStop(1,edge);ctx.fillStyle=surface;ctx.beginPath();ctx.moveTo(0,-89);ctx.bezierCurveTo(-80,-96,-92,-31,-84,24);ctx.bezierCurveTo(-76,98,-37,99,0,99);ctx.bezierCurveTo(44,99,83,87,84,19);ctx.bezierCurveTo(90,-31,73,-96,0,-89);ctx.closePath();ctx.fill();
 ctx.strokeStyle=`hsla(${r} 32% 30% / .28)`;ctx.lineWidth=2.5;ctx.stroke();
 // Evolution markings encoded by genes.
 ctx.save();ctx.globalAlpha=.77;ctx.fillStyle=accent;if(genes.mark%3===0){for(let i=0;i<3;i++)circle(-27+i*27,33+Math.sin(i+genes.mark)*7,5+(stage>2?2:0),accent)}else if(genes.mark%3===1){for(let i=0;i<3+stage;i++){ctx.save();ctx.translate(-32+i*15,31+Math.sin(i)*6);ctx.rotate(i*.5);roundRect(-3,-5,6,10,2);ctx.fill();ctx.restore()}}else{ctx.beginPath();ctx.moveTo(0,20);ctx.lineTo(11,38);ctx.lineTo(0,52);ctx.lineTo(-11,38);ctx.closePath();ctx.fill();}
 if(stage>=1){ctx.strokeStyle=accent;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,38,25+stage*4,.25,Math.PI-.25);ctx.stroke()}
 ctx.restore();
 // eyes with catchlights and occasional blinks
 const blink=Math.sin(t*.68+pet.id*.001)>.988?.13:1;
 for(const side of [-1,1]){ctx.save();ctx.translate(side*31,-16);ctx.scale(1,blink);ellipse(0,0,12+stage*.5,18+stage*.5,'#2b3348');ellipse(side*-2,-4,4.2,6.8,'#fafff3');circle(side*4,4,2.2,'#aeffe6');ctx.restore()}
 ellipse(-52,12,15,8,'#f5aab791');ellipse(52,12,15,8,'#f5aab791');ctx.strokeStyle='#6d5268';ctx.lineCap='round';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,9,8,.1,Math.PI-.1);ctx.stroke();
 // visible life pulse around legendary stages
 if(stage>=4){for(let i=0;i<9;i++){const angle=i*Math.PI*2/9+t*.3,rr=105+Math.sin(t+i)*7;glow(Math.cos(angle)*rr,Math.sin(angle)*rr*.85,15,accent,.45);circle(Math.cos(angle)*rr,Math.sin(angle)*rr*.85,2.4,accent)}}
 ctx.restore();
}
function draw(){const t=(performance.now()-view.started)/1000;drawSky(t);drawAvatar(t);requestAnimationFrame(draw)}
function update(){if(!pet||!byId('intro-gate').hidden)return;const key=`${pet.updatedAt}|${pet.pending?.id||''}|${pet.stage}|${pet.biome}|${pet.activity}`;advanceWild(pet);if(key!==`${pet.updatedAt}|${pet.pending?.id||''}|${pet.stage}|${pet.biome}|${pet.activity}`){save();render();}else if(Date.now()-sceneTime>8000){sceneTime=Date.now();render();}}

byId('hatch-form').addEventListener('submit',e=>{e.preventDefault();pet=hatch(byId('hatch-name').value);save();byId('intro-gate').hidden=true;render();playSound(460);toast(`${pet.name} ist da. Niemand weiß, was es werden wird.`)});
byId('witness-button').addEventListener('click',()=>{
 if(!pet)return;
 const prevStage=pet.stage,previous=new Set(pet.discoveries);
 const out=witness(pet);save();render();playSound(340+(pet.journeys%4)*75);
 const newRelic=pet.discoveries.find(x=>!previous.has(x));
 if(pet.stage>prevStage){showPanel('evolution');playSound(670)}
 else if(newRelic){view.latestDiscovery=newRelic;showPanel('discovery');playSound(610)}
 else if(pet.pending){showPanel('event')}
 else if(out)toast('✧ '+out.reason);
});
byId('choice-button').addEventListener('click',()=>showPanel('event'));
byId('pet-hit').addEventListener('click',()=>{if(!pet)return;const thought=connect(pet);if(thought){save();render();playSound(560);toast('♡ '+thought)}else toast(`${pet.name} ist gerade ganz bei sich. Versuch es gleich nochmal.`)});
byId('settings-button').addEventListener('click',()=>showPanel('settings'));
byId('overlay-close').addEventListener('click',closePanel);
overlay.addEventListener('click',e=>{if(e.target===overlay)closePanel()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)closePanel()});
document.querySelectorAll('.nav-item').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.panel)));
byId('ambient-button').addEventListener('click',()=>{audioOn=!audioOn;byId('ambient-button').textContent=audioOn?'♫':'♪';byId('ambient-button').setAttribute('aria-pressed',String(audioOn));toast(audioOn?'Kleine Klangmomente aktiviert.':'Kleine Klangmomente ausgeschaltet.');playSound(440)});
window.addEventListener('resize',resize);
window.addEventListener('focus',()=>{if(pet){advanceWild(pet);save();render()}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&pet){advanceWild(pet);save();render()}});
window.addEventListener('storage',e=>{if(e.key!==STORAGE)return;const newer=readSave();if(newer){pet=newer;render()}});
resize();if(pet){advanceWild(pet);save();render()}else{byId('intro-gate').hidden=false;}
requestAnimationFrame(draw);setInterval(update,2000);
