# mio. ✳ — Ein kleines Eigenleben

Ein modernes, autonomes Tamagotchi, das nicht nur Aufgaben abarbeitet: **Es entwickelt einen eigenen Charakter und einen erkennbaren Evolutionsweg**. Du bist Begleitung, nicht Aufpasser.

## Version 0.2: Eine Welt, die sich verändert

- **Einzigartige genetische Signatur:** Aus dem Genom ergeben sich Körperfarbe, Ohren, Augen, Muster, Größe und Aura. Unterschiedliche Wesen sehen anders aus.
- **Fünf echte Evolutionsstufen:** Ursprung → Erwachen → Wandlung → Entfaltung → Legende. Der Körper verändert sich sichtbar.
- **Vier mögliche Bestimmungen:** Sternensucher, Funkenweber, Traumwandler und Herzenshüter. Der Entwicklungsweg hängt von Charakter und selbst gewählten Aktivitäten ab, nicht von einem vorher festgelegten Klickmenü.
- **Autonomes Verhalten:** Neugier, Bedürfnisse, Gewohnheiten, Tageszeit, Motivation und neue Erfahrungen fließen in die Entscheidungen ein. Die Oberfläche erklärt den aktuellen Beweggrund.
- **Eigene Entdeckungen:** Das Wesen kann auf seinen Streifzügen neue Artefakte finden und ein Sammelalbum anlegen. Gelegentliche Ereignisse bieten freiwillige Entscheidungen, die seine Eigenschaften tatsächlich verändern.
- **Persönlichkeit über Zeit:** Vorlieben und Wesenszüge bilden sich durch seine eigenen Erlebnisse. Erinnerungen werden protokolliert; neue Entwicklungswege sind möglich.
- **Ohne Pflegezwang:** Keine Bestrafung oder Tod durch Abwesenheit; beim nächsten Besuch wird die verstrichene Zeit in begrenzten Schritten simuliert.
- **Bisherige Wesen bleiben erhalten:** Saves der Version 0.1 werden beim nächsten Start automatisch um eine stabile genetische Identität erweitert.
- **Privat:** Keine Anmeldung, Server, APIs oder Telemetrie. Sicherung und Wiederherstellung als JSON-Datei möglich.

> **Technische Ehrlichkeit:** Die Intelligenz ist derzeit eine erklärbare, regelbasierte Verhaltenssimulation mit Gedächtnis und adaptiven Präferenzen. **Es ist noch kein generatives Sprachmodell integriert.** Dialogsätze verwenden aktuell Textvorlagen; ein optionales lokales KI-Modell ist eine spätere Ausbaustufe.

## Starten

**Über GitHub Pages:** Repository → Settings → Pages → Deploy from a branch → main → /(root). Nach der Veröffentlichung bekommst du eine URL; kein Build nötig.

**Lokal:** Node.js 20+ installieren, Repository klonen, im Projektordner `npm start` und `http://localhost:4173` öffnen. Die App benötigt einen Webserver für ES Modules; HTML nicht einfach per Doppelklick öffnen.

**Testen:** `npm test` führt die Simulationstests unter Node.js aus; zusätzlich liegt ein GitHub-Actions-Workflow im Repository.

## Aufbau

| Datei | Aufgabe |
|---|---|
| `engine.mjs` | Autonomes Verhalten und grundlegende Bedürfnisse |
| `evolution.mjs` | Genom, Lebensformen, Ziele, Funde, Wegentscheidungen und Migration |
| `evolution-ui.mjs` | Evolutionsdarstellung, Entscheidungen und Weltobjekte |
| `app.mjs` | Browser-App, Speichern und Bedienung |
| `index.html` | Spieloberfläche |
| `styles.css`, `evolution.css` | Responsive Darstellung, Welt, Wesen und Animationen |
| `server.mjs` | Lokaler Server ohne Dependencies |
| `tests/` | Simulationstests |

## Geplante Ausbaustufen

Ausführlichere, generierte Geschichten, weitere Lebensformen, sichtbare Orte, Begegnungen mehrerer Wesen, sichere NAS-Synchronisation und optional lokale KI-Gespräche über ein geschütztes Backend. Kein direkt freigegebener Ollama-Port im Internet.
