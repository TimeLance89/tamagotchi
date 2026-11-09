# mio. als Android-APK

Diese Android-App lädt die vorhandene mio.-Weboberfläche mit **WebViewAssetLoader** unter einer lokalen, sicheren HTTPS-App-Adresse. Sie funktioniert offline, benötigt keinen Account und fordert keine Internet- oder Speicherberechtigung an.

## APK laden und installieren

Die neueste Android-Testversion steht unter **GitHub → Releases → mio. Android Preview** als Datei `mio-android-preview.apk` bereit. Auf Android die APK herunterladen, öffnen und gegebenenfalls die einmalige Erlaubnis **Apps aus dieser Quelle installieren** erteilen.

Die APK ist ein von GitHub Actions erzeugter **Debug-Build** und nicht für den Play Store signiert. GitHub erzeugt bei jedem Build einen neuen Debug-Schlüssel. Vor einem späteren Neu-Build muss man ggf. die alte App deinstallieren; vorher unbedingt in mio. unter **⚙ Einstellungen → Geschichte sichern** eine Sicherung exportieren.

## Verhalten und Grenzen

- Alles in der APK ist **lokal**. Die Entwicklung wird beim nächsten Öffnen nachgeholt, während die App geschlossen ist, läuft kein Android-Hintergrunddienst.
- Spielstand wird über Android WebView localStorage lokal in der App gespeichert. Der Chrome-Spielstand wird **nicht automatisch übertragen**. Über die Export-/Import-Funktionen kann man ihn übertragen.
- Android sichert den App-Datenbereich nicht automatisch in die Cloud; Spielstände vor einer Deinstallation selbst exportieren.
- JSON-Export landet im **Downloads**-Ordner, JSON-Import nutzt den System-Dateidialog.
- Mindestversion: Android 10 (API 29).
- Keine generative KI enthalten. Die aktuelle Simulation ist regelbasiert.

## Selbst bauen

Voraussetzungen: JDK 17, Android SDK (Plattform 35), Gradle 8.9.

Aus dem Repository-Root:

```sh
mkdir -p android/app/src/main/assets
cp index.html styles.css evolution.css app.mjs engine.mjs evolution.mjs evolution-ui.mjs icon.svg android/app/src/main/assets/
gradle -p android :app:assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`

Der Build auf GitHub wird von `.github/workflows/android-apk.yml` automatisch ausgeführt.
