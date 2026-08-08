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
   produktspezifischen Zugangsdaten.
3. Für OceanProtect (X8000) braucht `adapters/oceanprotect.js` Zugangsdaten zu
   **zwei getrennten REST-APIs derselben Appliance** (siehe
   `config.oceanprotect` in `config.example.json`):
   - **Backup Storage / DeviceManager** (Storage-Ebene — Kapazität, Dedup,
     Alarme), Standardport 8088, Login per Benutzername/Passwort.
   - **DataBackup** (Container-App auf der X8000 — Backup-Jobs, SLA/RPO,
     Air-Gap-Isolation), Standardport 25081, eigener Login.
   Für beide empfiehlt sich ein dedizierter, read-only Service-Account statt
   der Admin-Zugangsdaten. Quelle der Endpunkte: die vom Kunden bereitgestellte
   Huawei-REST-Doku (`docs/Rest/` im Repo — "OceanProtect Backup Storage REST
   Interface Reference" und "OceanProtect DataBackup REST Interface
   Reference").
   Läuft die Appliance mit einem selbstsignierten Zertifikat im internen Netz,
   `allowInsecureTls: true` setzen (deaktiviert die TLS-Zertifikatsprüfung nur
   für die Collector-Requests an diese eine Appliance — bewusster
   Sicherheits-Trade-off, besser wäre das interne CA-Zertifikat zu
   vertrauen).
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
