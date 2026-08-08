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
6. Periodisch einplanen — Installationsskripte übernehmen das:
   - **Windows:** PowerShell als Administrator, im `collector`-Ordner:
     `.\install-windows.ps1` (registriert einen täglichen Scheduled Task).
   - **Linux:** `./install-linux.sh` (trägt einen täglichen cron-Eintrag für
     den aktuellen Benutzer ein).
   - Beide Skripte akzeptieren `--export-dir <Pfad>` für den Air-Gap-Modus
     (siehe unten) statt des Live-Push.

## Air-gapped Standorte ("Blacksite") — manueller Datentransfer

Hat der Collector-Host keinen Netzwerkweg zu `ingestUrl` (z. B. eine isolierte
Backup-Zone ohne Internetzugang), läuft der Collector im Export-Modus statt im
Push-Modus:

```bash
node index.js config.json --export-dir ./exports
```

Statt live zu pushen, schreibt jeder Lauf eine Datei
`exports/metrics-<Zeitstempel>.json` im selben Format, das die Ingestion-API
erwartet (`ingestUrl`/`apiKey` in `config.json` werden für den Export-Modus
nicht gebraucht). Regelmäßig einplanen wie oben (`install-windows.ps1
-ExportDir ...` bzw. `install-linux.sh --export-dir ...`).

Die gesammelten `.json`-Dateien werden periodisch (z. B. per USB-Stick) aus
der isolierten Umgebung herausgetragen und im Ferrion-Admin-Bereich unter der
jeweiligen Subscription (`/admin/managed-reports/<id>`, Abschnitt
**"Manueller Upload"**) hochgeladen — mehrere Dateien gleichzeitig möglich,
kein API-Key nötig (die Admin-Anmeldung übernimmt die Authentifizierung).

## Installationspaket bauen

`npm run collector:package` im Projekt-Root erzeugt
`dist/ferrion-collector.zip` — enthält den kompletten `collector/`-Ordner
(ohne ein eventuell vorhandenes `config.json` mit echten Zugangsdaten) für die
Weitergabe an einen Kunden-Standort.

## Neues Produkt anbinden

1. `adapters/<produktslug>.js` mit einer `collect(config)`-Funktion anlegen,
   die `[{ key, value, unit? }, …]` zurückgibt.
2. In `index.js` unter `ADAPTERS` registrieren.
3. Im Portal unter `src/lib/managed-reports/metrics/<produktslug>.ts` die
   passenden Kennzahl-Definitionen (Label, Einheit, Aggregation, Trend-
   Richtung) hinterlegen und in `metrics/index.ts` registrieren — danach
   ziehen Aggregation und PDF-Report automatisch mit.
