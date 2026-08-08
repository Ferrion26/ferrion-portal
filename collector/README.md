# Ferrion Managed-Service-Collector

Läuft beim Kunden (nicht Teil der Next.js-App) und meldet periodisch Kennzahlen
einer Managed-Service-Plattform (z. B. Huawei OceanProtect) an das Ferrion-
Portal, damit dort automatisiert Quartalsberichte erstellt werden können.

## Einrichtung

1. Im Ferrion-Admin-Bereich unter **Managed Reports** die Subscription des
   Kunden anlegen (Kunde + Produkt + Servicestufe) und dort einen
   Collector-API-Key erzeugen (Klartext-Key wird nur einmal angezeigt).
2. `config.example.json` nach `config.json` kopieren und ausfüllen:
   `ingestUrl`, `apiKey` (aus Schritt 1), `productSlug` sowie die
   produktspezifischen Zugangsdaten (z. B. `oceanprotect.deviceManagerUrl`).
3. Für OceanProtect: `adapters/oceanprotect.js` enthält noch keine echte
   DeviceManager/eBackup-API-Anbindung (siehe TODO-Kommentar dort) — das muss
   pro Kunde anhand der Huawei-API-Dokumentation ergänzt werden, bevor der
   Collector produktiv läuft.
4. Node.js 18+ auf dem Collector-Host voraussetzen (nutzt das eingebaute
   `fetch`), keine weiteren Abhängigkeiten nötig.
5. Testlauf: `node index.js config.json`
6. Periodisch einplanen (z. B. täglich), damit über ein Quartal genug
   Datenpunkte für die Aggregation vorliegen — per Windows Task Scheduler
   oder cron:
   - **cron (Linux):** `0 6 * * * cd /opt/ferrion-collector && node index.js config.json >> collector.log 2>&1`
   - **Windows Task Scheduler:** Aktion `node.exe`, Argumente
     `C:\ferrion-collector\index.js C:\ferrion-collector\config.json`,
     täglich wiederholend.

## Neues Produkt anbinden

1. `adapters/<produktslug>.js` mit einer `collect(config)`-Funktion anlegen,
   die `[{ key, value, unit? }, …]` zurückgibt.
2. In `index.js` unter `ADAPTERS` registrieren.
3. Im Portal unter `src/lib/managed-reports/metrics/<produktslug>.ts` die
   passenden Kennzahl-Definitionen (Label, Einheit, Aggregation, Trend-
   Richtung) hinterlegen und in `metrics/index.ts` registrieren — danach
   ziehen Aggregation und PDF-Report automatisch mit.
