# HOME OS 1.0

Mobile-first Haushaltslager und Einkaufsliste mit lokalem Speicher. Keine Build-Tools und keine externen Abhängigkeiten.

## GitHub Pages
1. Dateien `index.html`, `style.css`, `app.js` in das Stammverzeichnis eines öffentlichen GitHub-Repositories hochladen.
2. Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/(root)` → Save.
3. Nach Veröffentlichung die angezeigte GitHub-Pages-URL auf dem iPhone in Safari öffnen.
4. Optional: Teilen → Zum Home-Bildschirm.

## Bedienung
- Lagerort wählen, Artikel erfassen, Mengen per +/− verändern. Für feinere Änderungen ✎ verwenden.
- Einkaufsliste anlegen, Produkte abhaken und mit ↥ in den aktuell ausgewählten Lagerort übernehmen.
- Spracheingabe: Textfeld öffnen und iPhone-Tastatur-Diktat nutzen.

## Grenzen
- `localStorage` speichert **nur auf dem aktuellen Gerät und in diesem Browser**. Keine Synchronisierung zwischen iPhones.
- Daten können beim Löschen von Website-Daten verloren gehen. Kein Backup/Export in Version 1.0.
- GitHub Pages hostet nur die statische App, nicht die Bestandsdaten.
