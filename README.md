# mio. ✳ – Ein kleines Eigenleben

**Ein Tamagotchi, das nicht auf dich wartet, sondern seinen eigenen Weg geht.**  
Ein modernes, interaktives virtuelles Wesen für Handy und PC. Ohne Fütterungszwang, Punktejagd und Konto.

> Status: **spielbarer erster Prototyp (v0.1)**. Die Persönlichkeitssimulation ist regelbasiert, keine generative KI. Ein optionales lokales Sprachmodell kann später ergänzt werden.

## Was schon funktioniert

- **Individuelle Geburt:** Name frei wählbar oder zufällig. Fünf unterschiedliche Start-Eigenschaften, ein eigener Lebenstraum.
- **Eigene Entscheidungen:** Wandern, Erfinden, Staunen, Nachdenken, Kontakt suchen und Schlafen – je nach Energie, Tageszeit, Charakter und Interessen.
- **Entwicklung:** Wiederholte Aktivitäten prägen Vorlieben, Fähigkeiten und Charakterzüge.
- **Innere Welt:** Energie, Neugier, Verbundenheit und Inspiration beeinflussen, was als Nächstes geschieht.
- **Eigene Ziele:** Nach Erfüllung eines Traums sucht das Wesen selbst einen neuen.
- **Erinnerungstagebuch:** Kleine Erlebnisse und gemeinsame Momente bleiben sichtbar.
- **Gemeinsame Momente (optional):** Reden, Spielen, Erfinden, Träumen, Streicheln.
- **Offline-Fortschritt:** Beim nächsten Öffnen holt das Wesen verpasste Entscheidungen in komprimierter Form nach (maximal 40 je Wiederkehr).
- **Keine Bestrafung:** Kein Sterben durch Abwesenheit. Die Werte werden schonend weitergeführt.
- **Mobile Oberfläche:** Die Welt verändert sich passend zu Aktivitäten und Tageszeit.
- **Privatsphäre:** Kein Konto, keine externen Fonts, keine API-Aufrufe, keine Telemetrie.
- **Backup:** Das Wesen unter Einstellungen als JSON-Datei sichern oder wiederherstellen.

## Sofort starten

### A – GitHub Pages

Im GitHub-Repository unter **Settings → Pages → Build and deployment** als Quelle **Deploy from a branch** und **main / (root)** auswählen und speichern. GitHub zeigt nach der Veröffentlichung eine URL an. Es gibt keinen Build-Schritt.

### B – lokal

1. Repository klonen oder als ZIP herunterladen.
2. Node.js 20 oder neuer installieren, falls noch nicht vorhanden.
3. Im Projektordner den Befehl **npm start** ausführen.
4. **http://localhost:4173** im Browser öffnen.

Alternativ funktioniert ein Python-Webserver mit **python -m http.server 4173**. Die App verwendet JavaScript-Module und sollte nicht per Doppelklick auf die HTML-Datei geöffnet werden.

## Technischer Aufbau

| Datei | Aufgabe |
|---|---|
| index.html | Semantische Oberfläche und Welt |
| styles.css | Responsive Gestaltung und Animationen |
| engine.mjs | Entscheidungs-, Entwicklungs- und Erinnerungslogik |
| app.mjs | Darstellung, Interaktionen und Browser-Speicherung |
| server.mjs | Kleiner lokaler Entwicklungsserver |
| tests/engine.test.mjs | Automatisierte Simulationstests |

**Gewählte Sprache:** modernes **JavaScript mit ES Modules**. Keine Framework-Abhängigkeiten, Datenbank oder Build-Tools nötig. Die Simulationslogik kann später an ein Backend angeschlossen werden.

## Wie das Eigenleben entsteht

Jedes Wesen erhält zur Geburt zufällige Ausprägungen für Neugier, Fantasie, Nähe, Mut und Gelassenheit. Die Simulation bewertet mögliche Aktivitäten anhand seiner Eigenschaften, Bedürfnisse, Tageszeit, selbst gesetztem Ziel und einem Zufallselement. Es entscheidet **eigenständig**. Erlebnisse verändern seine inneren Werte, Vorlieben und nach und nach die Persönlichkeit.

Die App verwendet aktuell **weder ChatGPT noch Ollama**. Die Gedanken und Gespräche stammen aus kuratierten Texten. Ein generativer, kontextsensitiver Gesprächsmodus ist eine mögliche spätere Ausbaustufe.

## Speichern und Datenschutz

Das Wesen wird automatisch unter dem Schlüssel **mio.life.v1** im lokalen Browser-Speicher gesichert. Dieser Speicher ist **geräte- und browserspezifisch**. Es gibt noch keine automatische Synchronisation zwischen Handy und PC. Beim Leeren der Browserdaten kann das Wesen verloren gehen: daher zuvor im Einstellungsmenü eine JSON-Sicherung exportieren. Diese lässt sich auch auf einem anderen Gerät importieren.

## Tests

**npm test** startet die Tests unter Node.js 20+. Sie prüfen Geburt, Entscheidungen, Offline-Fortschritt, Interaktionen und Hilfsfunktionen. GitHub Actions prüft Pushes auf main und Pull Requests.

## Mögliche nächste Schritte

- Tiefere Persönlichkeits- und Beziehungsentwicklung mit neuen Ereignissen, eigenen Geschichten und Gewohnheiten.
- Mehr visuelles Leben: Orte, Bewegungen, Kleidung, Entdeckungen und individuellere Formen.
- Optionaler lokaler KI-Dialog über ein geschütztes Backend, etwa mit Ollama.
- Server/NAS-Synchronisation zwischen Geräten.
- Mehrere Wesen und eine gemeinsam wachsende Welt.

---

Mit Liebe für kleine große Persönlichkeiten. ♡
