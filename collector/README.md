# Ferrion Managed-Service-Collector

Läuft beim Kunden (nicht Teil der Next.js-App) und meldet periodisch Kennzahlen
einer Managed-Service-Plattform (z. B. Huawei OceanProtect) an das Ferrion-
Portal, damit dort automatisiert Quartalsberichte erstellt werden können.

## Einrichtung

1. Im Ferrion-Admin-Bereich unter **Managed Reports** die Subscription des
   Kunden anlegen (Kunde + Produkt + Servicestufe) und dort einen
   Collector-API-Key erzeugen (Klartext-Key wird nur einmal angezeigt).
2. `config.example.json` nach `config.json` kopieren und ausfüllen. Hat der
   Standort **mehrere Geräte** (z. B. OceanProtect + OceanStor), gehört
   jedes als eigener Eintrag in das `devices`-Array — jedes Gerät hat seine
   eigene Subscription (eigener API-Key aus Schritt 1) und seinen eigenen
   `productSlug`/Zugangsdaten-Block, aber alle laufen über **eine** einzige
   `config.json` und **einen** einzigen geplanten Lauf (Task Scheduler/cron)
   für den ganzen Standort — nicht mehrere separate Configs/Tasks pro Gerät.
   Bei nur einem Gerät kann `devices` weggelassen und `productSlug`/`apiKey`/
   der Zugangsdaten-Block direkt auf oberster Ebene gesetzt werden (Legacy-
   Form, funktioniert unverändert).
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

   **Air-Gap-Policy-Status** (optionaler Healthcheck, `collectAirGapPolicyStatus`
   in `adapters/oceanprotect.js`): braucht die optionalen Config-Felder
   `oceanprotect.airGapDeviceId`/`oceanprotect.airGapRemoteDeviceId` (eigene
   sowie Partner-`deviceId` des Air-Gap-Pairings, siehe
   `config.example.json`) — ohne beide Felder wird der Check stillschweigend
   übersprungen (kein Fehler, nicht jede Umgebung hat ein Air-Gap-Pairing
   eingerichtet). Endpunkt `GET /v1/anti-ransomware/airgap/device/detail`.
   **Retention-Compliance** (`collectRetentionCompliance`, ebenfalls
   `oceanprotect.js`): paginiert über `GET /v1/copies`, meldet Kopien, deren
   konfigurierte Aufbewahrungsfrist bereits abgelaufen ist, obwohl sie noch
   nicht gelöscht wurden — braucht keine zusätzliche Konfiguration.
   **Client-/Ressourcenliste für die Systemdokumentation**
   (`collectClientInventory`, ebenfalls `oceanprotect.js`): paginiert über
   `GET /v1/resource` (bisher ungenutzt — liefert Name, Umgebungs-IP,
   Betriebssystem sowie Schutz-/SLA-Status je bei DataBackup bekannter
   Ressource, anders als `/v1/resource/protection/summary`, das nur
   aggregierte Zählungen liefert), max. 500 Ressourcen. Fließt in
   `meta.clients` — nicht in den Healthcheck-Bericht, sondern nur in die neue
   Systemdokumentation (Word-Dokument, im Admin-Bereich unter der jeweiligen
   Subscription generierbar). Braucht keine zusätzliche Konfiguration.
   Läuft die Appliance mit einem selbstsignierten Zertifikat im internen Netz,
   `allowInsecureTls: true` setzen (deaktiviert die TLS-Zertifikatsprüfung nur
   für die Collector-Requests an diese eine Appliance — bewusster
   Sicherheits-Trade-off, besser wäre das interne CA-Zertifikat zu
   vertrauen).
3b. Für OceanStor (z. B. 5310) braucht `adapters/oceanstor.js` nur **eine**
   REST-API — dieselbe DeviceManager-API wie bei OceanProtect Backup Storage
   (Login, Alarme, Controller/Disk/Fan/Power, Kapazität, LUNs/Initiatoren),
   Standardport 8088, siehe den `oceanstor`-Block im zweiten `devices`-Eintrag
   in `config.example.json`. Kein DataBackup-Teil, da OceanStor reiner
   Primärspeicher ist. Quelle: `docs/Rest/OceanStor V700R001C30 REST
   Interface Reference` (im Repo, nicht öffentlich).

   **LUNs + Initiatoren** (OceanStor sowie OceanProtects Storage-Ebene, siehe
   `collectLunOverview` in `adapters/shared.js`): der DeviceManager kennt
   keinen direkten LUN->Initiator-Join, daher löst der Collector die Kette
   `LUN -> LUN-Gruppe -> Mapping View <- Host-Gruppe <- Host -> Initiator`
   über mehrere Zusatzaufrufe auf (`GET /lun`, `/mappingview`, `/lungroup`,
   `/hostgroup`, `/host`, `/iscsi_initiator`, `/fc_initiator`). Die dabei
   verwendeten `ASSOCIATEOBJTYPE`-Codes (245 = Mapping View, 256 = LUN-Gruppe,
   14 = Host-Gruppe) und `PARENTTYPE=21` für Host-gebundene Initiatoren folgen
   der allgemeinen DeviceManager-API-Konvention, sind aber **NICHT gegen ein
   reales Gerät verifiziert**. Jeder Teilschritt ist einzeln fehlertolerant
   (fetchOptional) — ein falscher Code führt bestenfalls dazu, dass eine LUN
   fälschlich als "nicht gemappt" erscheint, nie zum Abbruch des ganzen Laufs.
   Bei Abweichungen `meta.rawEndpoints["/lun"]`, `["/mappingview"]` etc. am
   ersten echten Ingest prüfen und `shared.js` bei Bedarf anpassen.

   **Host-Pfade, FC-Ports, NTP** (OceanStor sowie OceanProtects Storage-Ebene,
   siehe `collectPathsPortsAndNtp` in `adapters/shared.js`): `GET /host_link`
   meldet Hosts mit mindestens einem ausgefallenen Pfad (Multipath-
   Redundanzverlust), `GET /fc_port` FC-Port-Status/-Geschwindigkeit
   (separat von `/eth_port`), `GET /ntp_client_config/get_ntp_status` die
   NTP-Zeitsynchronisation. Alle drei Endpunkte sind in `docs/Rest/`
   dokumentiert; die dabei interpretierten `RUNNINGSTATUS`-Codes von
   `/host_link` folgen der allgemeinen DeviceManager-Konvention und sind
   **nicht gegen ein reales Gerät verifiziert** (bei Abweichungen
   `meta.rawEndpoints["/host_link"]` prüfen).

   **Netzwerk-Port-Identität für die Systemdokumentation**
   (`extractNetworkPorts` in `adapters/shared.js`): reine Mapping-Funktion
   auf der ohnehin schon in `collectHardwareMetrics` abgerufenen
   `/eth_port`-Liste (IP/Maske/Gateway/MAC/MTU/Bond/Zweck je Port) — **kein
   neuer HTTP-Aufruf**. Fließt in `meta.networkPorts`, nicht in den
   Healthcheck-Bericht, sondern nur in die neue Systemdokumentation.
3c. Für NetApp AFF/ONTAP (z. B. A400) braucht `adapters/netapp.js` nur die
   **ONTAP REST API** des Clusters selbst (kein separater Login/Session-Token
   nötig — HTTP Basic Auth pro Request), Standard-HTTPS-Port 443, siehe den
   `netapp`-Block im dritten `devices`-Eintrag in `config.example.json`.
   Der Service-Account braucht mindestens **read-only** Zugriff auf
   `/api/cluster`, `/api/cluster/nodes`, `/api/storage/aggregates`,
   `/api/storage/disks`, `/api/storage/shelves`, `/api/storage/volumes`,
   `/api/storage/luns`, `/api/protocols/san/lun-maps`,
   `/api/protocols/san/igroups`, `/api/network/ethernet/ports`,
   `/api/network/fc/ports`, `/api/network/ip/interfaces`,
   `/api/snapmirror/relationships` und `/api/support/ems/events`
   (in ONTAP System Manager z. B. über die eingebaute `readonly`-Rolle, oder
   eine eigene Rolle mit `GET`-Rechten auf die genannten REST-Pfade). Quelle
   der Endpunkte: NetApps öffentliche ONTAP-REST-API-Referenz
   (docs.netapp.com/us-en/ontap-restapi/) — anders als bei Huawei online
   recherchiert statt aus kundenspezifischer PDF-Doku, da NetApp die
   REST-API-Referenz öffentlich zugänglich macht. Die LUN<->Initiator-
   Zuordnung ist bei ONTAP anders als bei Huawei ein direkter Join über
   `/protocols/san/lun-maps` (LUN<->Igroup) + `/protocols/san/igroups`
   (Igroup<->Initiatoren), kein mehrstufiges Auflösen über Gruppen nötig.
   `/api/network/ip/interfaces` (LIFs) liefert zusätzlich die IP-Adresse/
   Subnetzmaske je Interface für die Systemdokumentation — anders als
   `/api/network/ethernet/ports`/`/api/network/fc/ports` oben, die nur den
   reinen Link-Status für den Healthcheck-Bericht liefern.
   **Noch nicht gegen ein reales Gerät verifiziert** — beim ersten echten Ingest `meta.rawEndpoints`
   im Admin-Bereich prüfen und `adapters/netapp.js` bei Abweichungen im
   tatsächlichen Antwortformat anpassen. Die Port-/SnapMirror-/NTP-Endpunkte
   sind dabei die am schwächsten belegten (reine Namenskonvention, kein
   Abgleich gegen eine öffentliche Doku-Spiegelseite wie bei
   cluster/node/aggregate/disk/shelf/ems_event) — **NTP-Sync-Status wurde bei
   NetApp deshalb bewusst NICHT umgesetzt** (nur bei OceanStor/OceanProtect),
   da selbst die Existenz/Form des Endpunkts unsicher ist.
   Läuft der Cluster mit einem selbstsignierten Zertifikat im internen Netz,
   auch hier `allowInsecureTls: true` setzen (siehe oben).
3d. Für Huawei DCS/FusionCompute (VRM-Management) braucht
   `adapters/fusioncompute.js` Zugangsdaten zur **VRM-REST-API**
   (`POST /service/session` mit Benutzername/Passwort, liefert einen
   10 Minuten gültigen Session-Token im Antwort-Header `X-Auth-Token`), siehe
   den `fusioncompute`-Block im vierten `devices`-Eintrag in
   `config.example.json` (`productSlug: "huawei-dcs"` — dasselbe
   Katalogprodukt wie im Shop, kein separates "FusionCompute"-Produkt).
   Der Service-Account braucht mindestens read-only Zugriff auf
   `/service/sites`, `hosts`, `clusters`, `datastores`, `vms` und
   `alarms/activeAlarms` der jeweiligen Site. Quelle der Endpunkte: die vom
   Kunden bereitgestellte FusionCompute-VRM-REST-Doku (`docs/Rest/` im
   Repo). **Noch nicht gegen ein reales Gerät verifiziert** — beim ersten
   echten Ingest `meta.rawEndpoints` im Admin-Bereich prüfen, insbesondere
   den JSON-Listen-Schlüssel für Hosts/Clusters/Datastores/VMs (der Adapter
   probiert dafür mehrere plausible Kandidaten durch, siehe `extractList()`
   in `adapters/fusioncompute.js`).
   Läuft der Cluster mit einem selbstsignierten Zertifikat im internen Netz,
   auch hier `allowInsecureTls: true` setzen (siehe oben).

   Zusätzlich zum passiven Healthcheck kann für FusionCompute-Hosts aktiv der
   **Wartungsmodus** ein-/ausgeschaltet werden (einziger schreibender Eingriff
   unter allen Adaptern, deshalb bewusst kein Teil des automatischen Laufs):

   ```bash
   node index.js maintenance enter <hostId> [config.json]
   node index.js maintenance exit  <hostId> [config.json]
   ```
3e. Für **Commvault** braucht `adapters/commvault.js` Zugangsdaten zur
   **Commvault-REST-API** (`POST <baseUrl>/commandcenter/api/Login` mit
   Benutzername + Base64-kodiertem Passwort, liefert einen Token, danach
   Header `Authtoken: <token>` auf allen Folgeaufrufen — kein
   `Authorization: Bearer`), siehe den `commvault`-Block im fünften
   `devices`-Eintrag in `config.example.json` (`productSlug: "commvault"`).
   Der Service-Account braucht mindestens read-only Zugriff auf
   `/Job`, `/Client`, `/ClientOperations/get-client-checkreadiness`,
   `/CommServ`, `/api/cv/DashboardOperations/get-commcellsladetails`,
   `/StoragePool`, `/V2/MediaAgents`, `/Events` und
   `/api/cv/OpenAPI3/get-license-info`.

   Quelle der Endpunkte: Commvaults öffentliche REST-API-Doku
   (documentation.commvault.com) — online recherchiert, **nicht** an einem
   realen CommCell verifiziert (wie beim NetApp-Adapter). Unterschiedlich
   gut belegt:
   - **Solide bestätigt** (vollständig abrufbare Doku-Seite mit
     Beispiel-Feldern): Login-Flow, `/Job`-Liste, `/Client`-Liste,
     Check-Readiness-Endpunkt.
   - **Nur über Suchergebnis-Snippets belegt** (Endpunkt-Pfad plausibel,
     Antwortschema nicht bestätigt): CommCell-Stammdaten (`/CommServ`),
     SLA-Compliance, Storage-Pool-Kapazität, Lizenzablauf, Ereignisse.
   - **Am unsichersten**: MediaAgent-Status (`/V2/MediaAgents`) —
     ausschließlich aus einem Commvault-Community-Forenpost belegt, laut
     dortigem Autor selbst von Commvault Support und nicht öffentlich
     dokumentiert.

   Alle Bereiche mit unsicherem Schema sind bewusst defensiv geschrieben
   (mehrere Feldnamen-Kandidaten je Objekt probiert, `try/catch` um die
   Feld-Interpretation) — ein falsches Schema lässt bestenfalls die
   einzelne Kennzahl weg, nie den ganzen Lauf abstürzen. **Beim ersten
   echten Ingest bitte `meta.rawEndpoints` im Admin-Bereich prüfen** und
   `adapters/commvault.js` bei Abweichungen im tatsächlichen Antwortformat
   anpassen (analog zu netapp.js/fusioncompute.js).

   Client-Bereitschaft ist pro Client ein eigener API-Aufruf
   (`get-client-checkreadiness`) — bei mehr als 50 Clients werden nur die
   ersten 50 geprüft (`CLIENT_READINESS_LIMIT` in `adapters/commvault.js`),
   mit Log-Hinweis statt stillschweigend unvollständig zu bleiben.

   Läuft die Appliance mit einem selbstsignierten Zertifikat im internen
   Netz, auch hier `allowInsecureTls: true` setzen (siehe oben). Nutzt den
   bereits im Katalog vorhandenen Produkteintrag `commvault`
   (`src/app/produkte/products-data.ts`) — keine Änderung dort nötig.
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

Statt live zu pushen, schreibt jeder Lauf pro konfiguriertem Gerät eine Datei
`exports/metrics-<productSlug>-<Zeitstempel>.json` im selben Format, das die
Ingestion-API erwartet (`ingestUrl`/`apiKey` werden für den Export-Modus
nicht gebraucht). Regelmäßig einplanen wie oben (`install-windows.ps1
-ExportDir ...` bzw. `install-linux.sh --export-dir ...`).

Die gesammelten `.json`-Dateien werden periodisch (z. B. per USB-Stick) aus
der isolierten Umgebung herausgetragen und im Ferrion-Admin-Bereich **je
Gerät unter dessen eigener Subscription** (`/admin/managed-reports/<id>`,
Abschnitt **"Manueller Upload"**) hochgeladen — die Datei gehört anhand ihres
`productSlug` im Namen zur passenden Subscription. Mehrere Dateien
gleichzeitig innerhalb derselben Subscription sind möglich, kein API-Key
nötig (die Admin-Anmeldung übernimmt die Authentifizierung).

## Alte Export-Dateien aufräumen

Im Air-Gap-Export-Modus (`--export-dir`, siehe oben) sammeln sich mit der
Zeit beliebig viele `metrics-<productSlug>-<Zeitstempel>.json`-Dateien im
Exportverzeichnis an — der Collector selbst löscht sie nie automatisch.
Drei optionale, frei kombinierbare Flags räumen nach jedem Lauf auf (immer
die ältesten Dateien zuerst):

```bash
node index.js config.json --export-dir ./exports --cleanup-max-age-days 90
node index.js config.json --export-dir ./exports --cleanup-max-count 500
node index.js config.json --export-dir ./exports --cleanup-max-size-mb 200
```

- `--cleanup-max-age-days <n>` — löscht Dateien, die älter als `n` Tage sind.
- `--cleanup-max-count <n>` — löscht die ältesten Dateien, bis höchstens `n`
  übrig bleiben.
- `--cleanup-max-size-mb <n>` — löscht die ältesten Dateien, bis die
  Gesamtgröße des Verzeichnisses höchstens `n` MB beträgt.

Alle drei lassen sich kombinieren (werden dann nacheinander angewendet) und
sind reine CLI-Parameter ohne Pendant in `config.json`, analog zu
`--export-dir` selbst. Ohne gesetztes Flag räumt der Collector nichts auf.

## Config.json über die CLI verwalten

Statt `config.json` von Hand zu editieren, lassen sich Geräte-Einträge über
eingebaute Unterbefehle verwalten — praktisch besonders bei mehreren Geräten
im `devices`-Array:

```bash
node index.js config list                       # alle Geräte anzeigen (Zugangsdaten maskiert)
node index.js config add                        # neues Gerät interaktiv anlegen
node index.js config edit <productSlug>          # bestehendes Gerät bearbeiten
node index.js config remove <productSlug>        # Gerät entfernen (mit Bestätigung)
node index.js --help                             # vollständige Usage-Übersicht mit Beispielen
```

`config add`/`config edit` fragen die nötigen Felder interaktiv ab (Node-
`readline`, keine Passwort-Maskierung während der Eingabe — dafür bräuchte es
plattformübergreifenden Raw-Mode-Terminal-Code, der auf Windows/PowerShell
und Linux/Bash unterschiedlich zuverlässig ist). Eingegebene Passwörter
landen nie im Klartext auf der Platte, sondern werden vor dem Schreiben
sofort verschlüsselt (siehe nächster Abschnitt). Ein optionaler
Pfad-Parameter am Ende (`node index.js config list ./andere-config.json`)
zielt auf eine andere Datei als das Standard-`config.json` im
`collector`-Ordner.

## Passwörter in config.json

Passwort-Felder in `config.json` (jedes Feld, dessen Name "password" enthält,
z. B. `deviceManagerPassword`, `password`) werden **nicht** im Klartext
gespeichert. Beim Start prüft der Collector automatisch, ob noch
Klartext-Passwörter in der Datei stehen — falls ja, werden sie sofort
verschlüsselt und die Datei wird mit den verschlüsselten Werten
überschrieben. Das passiert transparent und ohne manuellen Schritt: eine
frisch aus `config.example.json` befüllte Datei wird beim allerersten Lauf
automatisch migriert. Entschlüsselt wird nur für die Dauer eines einzelnen
Laufs im Arbeitsspeicher, nie erneut auf die Platte geschrieben.

Verfahren:

- **Windows:** Windows Data Protection API (DPAPI), Scope `LocalMachine` — der
  Klartext verlässt den Prozess nie über die Kommandozeile (dort in der
  Prozessliste einsehbar), sondern wird ausschließlich per stdin/stdout an
  PowerShell übergeben. `LocalMachine` statt `CurrentUser`, damit die
  Entschlüsselung unabhängig davon funktioniert, unter welchem Konto der Task
  Scheduler den Collector tatsächlich ausführt — das bedeutet aber auch: **jedes
  Benutzerkonto auf derselben Maschine könnte grundsätzlich entschlüsseln**, und
  die Verschlüsselung ist **nicht auf eine andere Maschine übertragbar** (eine
  kopierte `config.json` lässt sich dort nicht mehr entschlüsseln — muss neu mit
  dem Klartext-Passwort befüllt werden, wird dann dort automatisch neu
  verschlüsselt).
- **Linux/macOS (und Windows-Fallback, falls PowerShell/DPAPI nicht verfügbar
  ist):** AES-256-GCM mit einem zufällig erzeugten, 256-Bit-Schlüssel in einer
  Datei `.collector.key` neben `config.json` (Zugriffsrechte `600`, nicht Teil
  von Git, siehe `.gitignore`). Wird diese Schlüsseldatei verloren oder
  gelöscht, lassen sich die verschlüsselten Passwörter nicht mehr entschlüsseln
  — Passwörter dann im Klartext neu eintragen, werden beim nächsten Lauf wieder
  automatisch verschlüsselt.

**Was das schützt und was nicht:** Das Verfahren schützt gegen die
realistischsten Risiken bei einer lokal am Kundenstandort abgelegten
Config-Datei — eine versehentlich geteilte Datei-/Bildschirmkopie, ein
Backup-Job, der `config.json` unverändert mitsichert, ein anderes
Benutzerkonto auf derselben Maschine (bei der AES-Variante), ein
versehentliches `git add -A`. Es schützt **nicht** gegen einen Angreifer mit
vollem Zugriff auf genau das Konto/die Maschine, unter der der Collector
selbst läuft — das kann kein rein lokales, ohne menschliche Passworteingabe
automatisiert laufendes Verfahren (Task Scheduler/cron) leisten.

Weitere bereits umgesetzte Absicherungen: Passwörter werden nie als
Kommandozeilenargument übergeben (siehe oben), `config.json` und
`.collector.key` erhalten beim Schreiben Zugriffsrechte `600`, Debug-Logs
redigieren Passwort-/Token-/Cookie-Felder automatisch (siehe `logger.js`), und
für alle Geräte wird ein dedizierter **read-only Service-Account** empfohlen
statt Admin-Zugangsdaten (siehe oben) — ein kompromittiertes Passwort erlaubt
damit ohnehin nur Lesezugriff. **Bewusst nicht umgesetzt:** Verschleierung
(Obfuscation) des Collector-Quellcodes selbst — das wäre Security-Theater
gegen einen Angreifer mit Maschinenzugriff, würde aber Ferrions eigene
Wartung des Collectors dauerhaft erschweren.

## Logging & Fehlersuche

Jeder Lauf schreibt zusätzlich zur Konsole eine Tages-Logdatei nach
`logs/collector-<Datum>.log` (relativ zum `collector`-Ordner) — damit ein
fehlgeschlagener geplanter Lauf (Task Scheduler/cron) auch nachträglich
nachvollziehbar ist, nicht nur bei manuellem Testlauf. Passwörter, API-Keys
und Session-Tokens werden dabei nie im Klartext geloggt.

Für tiefere Fehlersuche (z. B. bei unklaren Antworten der X8000-APIs)
`--debug` anhängen oder `"debug": true` in `config.json` setzen:

```bash
node index.js config.json --debug
```

Loggt dann zusätzlich jede HTTP-Anfrage/-Antwort (Request-Body mit
redigierten Zugangsdaten, Response-Body gekürzt auf 1000 Zeichen) sowie den
vollen Stacktrace bei einem Fehlschlag.

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
