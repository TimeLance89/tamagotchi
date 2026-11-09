# mio. WILD — ein kleines Universum, das sich selbst verändert

Eine vollständig offlinefähige Android- und Web-Spielwelt. Das Wesen wächst in fünf Evolutionsstufen, entscheidet nach Charakter und Erfahrungen selbstständig, entdeckt Artefakte in vier Regionen und begegnet eigenen Geschichten.

## Die neue Version

- Eine **immersive, animierte Canvas-Welt** statt einer Liste von Bedürfnissen und Statusbalken
- **Einzigartige Gene**, sichtbare Entwicklung, Flügel, Geweih, leuchtende Muster und fünf Lebenspfade
- **Autonome Entscheidungen** aus Eigenschaften, Zielen, Werten, Energie, Biomen und Zufall
- **Vier Regionen und zwölf Fundstücke**, die Beziehungen und die innere Entwicklung beeinflussen
- **Acht Begegnungen mit echten Verzweigungen**, die dauerhaft im Gedächtnis bleiben
- **Geschichte, Biome, DNA und Erinnerungen** über die Navigation erkundbar
- **Datensparsam:** Kein Konto, keine Cloud, keine Telemetrie, kein Online-Zwang
- **Alte Spielstände werden beim ersten Start lokal in das neue Format übernommen.** Das Original bleibt unter `mio.life.v1` erhalten.

**Wichtig:** Die Intelligenz beruht derzeit auf einer lokalen, erklärbaren Simulation. Eine generative KI mit freien, unvorhersehbaren Gesprächen ist noch nicht integriert. Das Wesen wird nicht bestraft, wenn du länger nicht spielst; beim nächsten Besuch holt die Simulation die Entwicklung begrenzt nach.

## Sofort ausprobieren

Im Browser auf einem Webserver öffnen (`npm start`, dann `http://localhost:4173`) oder per GitHub Pages bereitstellen. Die native Android-App ist als APK unter [GitHub Releases](https://github.com/TimeLance89/tamagotchi/releases/tag/android-preview) verfügbar; der Android-Build wird über `.github/workflows/android-apk.yml` erzeugt.

Das WILD-Interface besteht aus `index.html`, `wild.css`, `wild-app.mjs` und `wild-engine.mjs`. Die vorherigen `engine.mjs`, `evolution.mjs` und deren Tests bleiben als Kompatibilitäts- und Verlaufscode erhalten.

### Testen

```sh
npm test
```

Der Testlauf prüft Geburten, autonome Aktivitäten, Entwicklungsformen, echte Folgen von Story-Entscheidungen, lokale Migration und sicheres Offline-Aufholen.

### APK-Aktualisierungen

Die Vorschau-APK wird als Debug-Build signiert. **Vor einem Versionswechsel immer in ⚙ Einstellungen die Geschichte exportieren.** Unterschiedliche Debug-Schlüssel können ein Deinstallieren der alten Version erforderlich machen. Im Anschluss kann der Spielstand importiert werden.

---

**Ein Wesen, kein Aufgabenplan.**
