// Adapter für NetApp AFF/ONTAP: liest Kennzahlen über die ONTAP REST API
// (https://<cluster-mgmt-ip>/api/...) aus.
//
// Quelle: NetApps öffentliche ONTAP-REST-API-Referenz (docs.netapp.com/
// us-en/ontap-restapi/) — anders als bei Huawei lag keine kundenspezifische
// PDF-Doku vor. Endpunkte und Feldnamen wurden über die inhaltsgleichen
// Python-Client-Spiegelseiten (library.netapp.com/ecmdocs/…/resources/
// {cluster,node,aggregate,disk,shelf,ems_event}.html) verifiziert, die
// dasselbe REST-Schema dokumentieren. Diese Datei ist NOCH NICHT gegen ein
// echtes Gerät verifiziert (anders als die Huawei-Adapter, die alle gegen
// reale Uni-Salzburg-Geräte liefen) — beim ersten echten Ingest bitte
// meta.rawEndpoints prüfen und diese Datei bei Abweichungen anpassen, genau
// wie es bei OceanProtect mit der Ressourcenschutz-Übersicht und der
// Backup-Erfolgsquote nötig war.
//
// Auth: HTTP Basic (Authorization-Header pro Request) — anders als Huaweis
// Session-Login/iBaseToken-Verfahren gibt es kein Login/Logout.
//
// GET-Collection-Endpunkte liefern standardmäßig NUR die Identitätsfelder
// (name/uuid) zurück — jeder Aufruf hier fragt die benötigten Felder daher
// explizit über ?fields=... an (ONTAP-REST-Konvention, siehe "Getting
// started with the ONTAP REST API").
//
// metricKeys müssen exakt zu den Definitionen in
// src/lib/managed-reports/metrics/netapp.ts passen.
const { requestJson, joinUrl } = require("../httpClient");

function captureRaw(rawEndpoints, key, result) {
  if (!result) return;
  rawEndpoints[key] = result.body?.records !== undefined ? result.body.records : result.body;
}

async function fetchOptional(config, label, promise) {
  try {
    return await promise;
  } catch (err) {
    config.logger?.warn(`${label} konnte nicht abgerufen werden (übersprungen): ${err.message}`);
    return null;
  }
}

// ONTAP-EMS-Severities (emergency > alert > error > notice > informational >
// debug) auf unser dreistufiges Schema gemappt — informational/debug sind
// keine Alarme und werden ignoriert.
const EMS_SEVERITY_MAP = {
  emergency: "critical",
  alert: "critical",
  error: "major",
  notice: "warning",
};

// Wie viele UNTERSCHIEDLICHE Ereignisnamen pro Schweregrad im Bericht gezeigt
// werden. EMS_FETCH_LIMIT ist bewusst deutlich größer als die Sample-Größe —
// sonst könnte ein einzelner, oft wiederkehrender Ereignistyp (z. B.
// dieselbe Meldung alle paar Minuten) allein durch seine vielen jüngsten
// Instanzen alle anderen, ebenso aktiven Ereignistypen aus dem nach Zeit
// sortierten Sample verdrängen (derselbe Fehler wurde beim OceanProtect-/
// OceanStor-Alarm-Sampling bereits einmal gemacht und dort behoben).
const ALARM_SAMPLE_SIZE = 5;
const EMS_FETCH_LIMIT = 200;

function bytesToTB(bytes) {
  return bytes / 1024 ** 4;
}

async function collect(config) {
  const na = config.netapp ?? {};
  const required = ["managementUrl", "username", "password"];
  const missing = required.filter((k) => !na[k]);
  if (missing.length > 0) {
    throw new Error(`collector/adapters/netapp.js: config.netapp fehlt: ${missing.join(", ")}`);
  }

  const base = joinUrl(na.managementUrl, "/api");
  const authHeaders = { Authorization: `Basic ${Buffer.from(`${na.username}:${na.password}`).toString("base64")}` };

  const [cluster, nodes, aggregates, disks, shelves, volumes, emsEvents, luns, lunMaps, igroups, ethernetPorts, fcPorts, snapmirrorRelationships] =
    await Promise.all([
    requestJson(config, joinUrl(base, "/cluster?fields=name,uuid,version"), { headers: authHeaders }),
    requestJson(config, joinUrl(base, "/cluster/nodes?fields=name,model,serial_number,version,uptime,state,ha"), { headers: authHeaders }),
    // encryption: NetApp Aggregate Encryption (NAE) — Feldname nicht gegen
    // ein reales Gerät verifiziert (wie der übrige NetApp-Adapter).
    requestJson(config, joinUrl(base, "/storage/aggregates?fields=uuid,name,state,space,block_storage,encryption"), { headers: authHeaders }),
    fetchOptional(
      config,
      "Disk-Status",
      requestJson(config, joinUrl(base, "/storage/disks?fields=name,state,container_type,model"), { headers: authHeaders })
    ),
    fetchOptional(
      config,
      "Shelf-Status",
      requestJson(config, joinUrl(base, "/storage/shelves?fields=name,state,model,serial_number,frus"), { headers: authHeaders })
    ),
    fetchOptional(
      config,
      "Volume-Status",
      requestJson(
        config,
        // space.snapshot.reserve_percent/used sowie encryption.enabled sind
        // nur durch Analogie zum bereits genutzten space.*-Schema plausibel
        // (space.snapshot.*) bzw. zum bereits genutzten ha.enabled-Muster
        // (encryption.enabled) — nicht gegen ein reales Gerät verifiziert.
        joinUrl(
          base,
          "/storage/volumes?fields=name,state,style,svm,aggregates,space.size,space.used,space.snapshot.reserve_percent,space.snapshot.used,encryption.enabled"
        ),
        { headers: authHeaders }
      )
    ),
    fetchOptional(
      config,
      "EMS-Ereignisse",
      requestJson(
        config,
        joinUrl(base, `/support/ems/events?fields=time,message,log_message,node&max_records=${EMS_FETCH_LIMIT}&order_by=time desc`),
        { headers: authHeaders }
      )
    ),
    fetchOptional(
      config,
      "LUN-Status",
      requestJson(
        config,
        joinUrl(base, "/storage/luns?fields=name,svm,location.volume,os_type,space.size,space.used,status.state"),
        { headers: authHeaders }
      )
    ),
    // Direkter LUN<->Igroup-Join, den ONTAP anders als Huaweis DeviceManager
    // (siehe collector/adapters/shared.js) in einem einzigen Endpunkt anbietet.
    fetchOptional(
      config,
      "LUN-Mappings",
      requestJson(config, joinUrl(base, "/protocols/san/lun-maps?fields=lun,igroup,logical_unit_number,svm"), { headers: authHeaders })
    ),
    // initiators[].name = iSCSI-IQN oder FC-WWN, je nach igroup.protocol.
    fetchOptional(
      config,
      "Initiator-Gruppen",
      requestJson(config, joinUrl(base, "/protocols/san/igroups?fields=name,svm,protocol,os_type,initiators"), { headers: authHeaders })
    ),
    // Port-Linkstatus — Endpunkte/Feldnamen nach allgemeiner ONTAP-REST-
    // Konvention, nicht gegen ein reales Gerät verifiziert (wie der übrige
    // NetApp-Adapter). FC-Ports nur vorhanden, wenn FC lizenziert ist —
    // fetchOptional lässt ein leeres/fehlendes Ergebnis ohne Warnung durch.
    fetchOptional(
      config,
      "Ethernet-Port-Status",
      requestJson(config, joinUrl(base, "/network/ethernet/ports?fields=name,node,state,enabled,speed"), { headers: authHeaders })
    ),
    fetchOptional(
      config,
      "FC-Port-Status",
      requestJson(config, joinUrl(base, "/network/fc/ports?fields=name,node,state,enabled,speed"), { headers: authHeaders })
    ),
    // SnapMirror — nur vorhanden, wenn Replikation lizenziert/konfiguriert
    // ist. Endpunkt/Feldnamen nach allgemeiner ONTAP-REST-Konvention, nicht
    // gegen ein reales Gerät verifiziert.
    fetchOptional(
      config,
      "SnapMirror-Beziehungen",
      requestJson(config, joinUrl(base, "/snapmirror/relationships?fields=healthy,state,lag_time,source.path,destination.path"), {
        headers: authHeaders,
      })
    ),
  ]);

  const rawEndpoints = {};
  captureRaw(rawEndpoints, "/cluster", cluster);
  captureRaw(rawEndpoints, "/cluster/nodes", nodes);
  captureRaw(rawEndpoints, "/storage/aggregates", aggregates);
  captureRaw(rawEndpoints, "/storage/disks", disks);
  captureRaw(rawEndpoints, "/storage/shelves", shelves);
  captureRaw(rawEndpoints, "/storage/volumes", volumes);
  captureRaw(rawEndpoints, "/support/ems/events", emsEvents);
  captureRaw(rawEndpoints, "/storage/luns", luns);
  captureRaw(rawEndpoints, "/protocols/san/lun-maps", lunMaps);
  captureRaw(rawEndpoints, "/protocols/san/igroups", igroups);
  captureRaw(rawEndpoints, "/network/ethernet/ports", ethernetPorts);
  captureRaw(rawEndpoints, "/network/fc/ports", fcPorts);
  captureRaw(rawEndpoints, "/snapmirror/relationships", snapmirrorRelationships);

  const metrics = [];
  const componentFaults = [];
  // Jede geprüfte Komponente (normal UND fehlerhaft) — Grundlage für den
  // abschließenden "erfolgreich geprüft"-Referenzabschnitt im Bericht.
  const componentChecks = [];

  // --- Cluster-/Gerätestammdaten ---
  const clusterData = cluster.body;
  const nodeList = Array.isArray(nodes.body.records) ? nodes.body.records : [];
  const deviceInfo = {
    // Cluster-Name (z. B. "netapp-clu1", wie oben links im System Manager
    // gezeigt) — das ONTAP-Äquivalent zu Huaweis vom Kunden vergebenem NAME.
    name: clusterData.name || null,
    softwareVersion: clusterData.version?.full || null,
    // Modell/Seriennummer werden pro NODE gemeldet, nicht pro Cluster — bei
    // einem HA-Paar wird hier bewusst der erste Node abgegriffen (der
    // Bericht zeigt damit Modell/SN eines der beiden Nodes, nicht beider).
    model: nodeList[0]?.model || null,
    serialNumber: nodeList[0]?.serial_number || null,
  };

  // --- Nodes: Betriebszustand + HA-Failover ---
  if (nodeList.length > 0) {
    const nodesUp = nodeList.filter((n) => n.state === "up").length;
    metrics.push({ key: "system_availability", value: (nodesUp / nodeList.length) * 100, unit: "%" });
    metrics.push({ key: "nodes_down", value: nodeList.length - nodesUp, unit: "count" });
    metrics.push({ key: "ha_disabled", value: nodeList.filter((n) => n.ha?.enabled === false).length, unit: "count" });
  }
  for (const n of nodeList) {
    const up = n.state === "up";
    const id = n.name || "Node";
    componentChecks.push({ category: "Node", id, description: n.state ?? "unbekannt", ok: up });
    if (!up) componentFaults.push({ category: "Node", id, description: n.state ?? "unbekannt" });
    if (n.ha?.enabled === false) {
      componentChecks.push({ category: "HA-Failover", id, description: "deaktiviert", ok: false });
      componentFaults.push({ category: "HA-Failover", id, description: "Storage-Failover deaktiviert" });
    } else if (n.ha) {
      componentChecks.push({ category: "HA-Failover", id, description: "aktiviert", ok: true });
    }
  }

  // --- Aggregate: Kapazität + Zustand ---
  const aggregateList = Array.isArray(aggregates.body.records) ? aggregates.body.records : [];

  // Pro Aggregat den angebundenen Cloud-Tier abfragen (FabricPool) — eigener
  // Request je Aggregat, da cloud-stores ein Unter-Endpunkt des jeweiligen
  // Aggregats ist (GET /storage/aggregates/{uuid}/cloud-stores), keine
  // Cluster-weite Liste. Die meisten Aggregate haben KEINEN Cloud-Tier
  // angebunden — fetchOptional lässt diesen Fall (404/leer) ohne Warnung
  // durchlaufen.
  const cloudStoresByAggregate = new Map();
  await Promise.all(
    aggregateList
      .filter((a) => a.uuid)
      .map(async (a) => {
        const result = await fetchOptional(
          config,
          `Cloud-Tier (${a.name || a.uuid})`,
          requestJson(config, joinUrl(base, `/storage/aggregates/${a.uuid}/cloud-stores?fields=used,target,availability`), {
            headers: authHeaders,
          })
        );
        const records = Array.isArray(result?.body?.records) ? result.body.records : [];
        if (records.length > 0) cloudStoresByAggregate.set(a.uuid, records);
        if (result) rawEndpoints[`/storage/aggregates/${a.name || a.uuid}/cloud-stores`] = records;
      })
  );

  let totalBytes = 0;
  let usedBytes = 0;
  let cloudUsedBytesTotal = 0;
  const ratios = [];
  const capacityBreakdown = [];
  // Physische Kapazität je Aggregat (uuid -> Bytes) — Grundlage für die
  // Thin-Provisioning-Überbuchungsberechnung weiter unten (nach dem
  // Volume-Block, da dort die je Aggregat zugesagte/logische Kapazität
  // aufsummiert wird).
  const aggregateSizeByUuid = new Map();
  for (const a of aggregateList) {
    const size = Number(a.space?.block_storage?.size);
    const used = Number(a.space?.block_storage?.used);
    if (Number.isFinite(size)) totalBytes += size;
    if (Number.isFinite(used)) usedBytes += used;
    if (Number.isFinite(size) && a.uuid) aggregateSizeByUuid.set(a.uuid, size);
    const ratio = Number(a.space?.efficiency?.ratio);
    if (Number.isFinite(ratio)) ratios.push(ratio);

    const cloudStores = cloudStoresByAggregate.get(a.uuid) ?? [];
    const cloudUsedBytes = cloudStores.reduce((sum, cs) => sum + (Number(cs.used) || 0), 0);
    const cloudTargetNames = [...new Set(cloudStores.map((cs) => cs.target?.name).filter(Boolean))];
    if (cloudStores.length > 0) cloudUsedBytesTotal += cloudUsedBytes;

    if (Number.isFinite(size)) {
      capacityBreakdown.push({
        name: a.name || "Aggregat",
        localUsedTB: Number.isFinite(used) ? bytesToTB(used) : 0,
        localTotalTB: bytesToTB(size),
        ...(cloudStores.length > 0 ? { cloudUsedTB: bytesToTB(cloudUsedBytes), cloudTarget: cloudTargetNames.join(", ") || undefined } : {}),
      });
    }
  }
  if (totalBytes > 0) {
    metrics.push({ key: "total_capacity_tb", value: bytesToTB(totalBytes), unit: "TB" });
    metrics.push({ key: "used_capacity_tb", value: bytesToTB(usedBytes), unit: "TB" });
    metrics.push({ key: "storage_pool_fill_level", value: (usedBytes / totalBytes) * 100, unit: "%" });
  }
  if (ratios.length > 0) {
    metrics.push({ key: "data_reduction_ratio", value: ratios.reduce((a, b) => a + b, 0) / ratios.length, unit: "x" });
  }
  if (cloudUsedBytesTotal > 0) {
    metrics.push({ key: "cloud_tier_used_tb", value: bytesToTB(cloudUsedBytesTotal), unit: "TB" });
  }
  if (aggregateList.length > 0) {
    metrics.push({ key: "storage_pools_unhealthy", value: aggregateList.filter((a) => a.state !== "online").length, unit: "count" });
    for (const a of aggregateList) {
      const ok = a.state === "online";
      componentChecks.push({ category: "Aggregat", id: a.name || "Aggregat", description: a.state ?? "unbekannt", ok });
      if (!ok) componentFaults.push({ category: "Aggregat", id: a.name || "Aggregat", description: a.state ?? "unbekannt" });
    }
  }

  // --- Disks ---
  const diskList = Array.isArray(disks?.body?.records) ? disks.body.records : [];
  if (diskList.length > 0) {
    metrics.push({ key: "disks_faulty", value: diskList.filter((d) => d.state === "broken").length, unit: "count" });
    for (const d of diskList) {
      const ok = d.state !== "broken";
      componentChecks.push({ category: "Festplatte", id: d.name || "Disk", description: d.state ?? "unbekannt", ok });
      if (!ok) componentFaults.push({ category: "Festplatte", id: d.name || "Disk", description: d.state ?? "unbekannt" });
    }
  }

  // --- Shelves + Netzteile (frus[].type === "psu") ---
  const shelfList = Array.isArray(shelves?.body?.records) ? shelves.body.records : [];
  if (shelfList.length > 0) {
    metrics.push({ key: "shelves_unhealthy", value: shelfList.filter((s) => s.state !== "ok").length, unit: "count" });
    let psuFaulty = 0;
    for (const s of shelfList) {
      const ok = s.state === "ok";
      const shelfId = s.name || "Shelf";
      componentChecks.push({ category: "Disk-Shelf", id: shelfId, description: s.state ?? "unbekannt", ok });
      if (!ok) componentFaults.push({ category: "Disk-Shelf", id: shelfId, description: s.state ?? "unbekannt" });
      for (const fru of s.frus ?? []) {
        if (fru.type !== "psu") continue;
        const fruOk = !fru.state || /ok|normal/i.test(String(fru.state));
        const fruId = `${shelfId} ${fru.id ?? ""}`.trim();
        componentChecks.push({ category: "Netzteil", id: fruId, description: fru.state ?? "unbekannt", ok: fruOk });
        if (!fruOk) {
          psuFaulty += 1;
          componentFaults.push({ category: "Netzteil", id: fruId, description: fru.state ?? "unbekannt" });
        }
      }
    }
    metrics.push({ key: "power_modules_faulty", value: psuFaulty, unit: "count" });
  }

  // --- Netzwerk-Ports (Ethernet + FC) ---
  // Nicht gegen ein reales Gerät verifiziert (wie der übrige NetApp-Adapter)
  // — Endpunkte/Feldnamen nach allgemeiner ONTAP-REST-Konvention. Nur
  // aktivierte Ports zählen (deaktivierte Ports sind kein Fehlerzustand,
  // analog zu den ausgeschlossenen Wartungsports bei Huawei).
  const portList = [
    ...(Array.isArray(ethernetPorts?.body?.records) ? ethernetPorts.body.records : []),
    ...(Array.isArray(fcPorts?.body?.records) ? fcPorts.body.records : []),
  ].filter((p) => p.enabled !== false);
  if (portList.length > 0) {
    const downPorts = portList.filter((p) => p.state !== "up");
    metrics.push({ key: "network_ports_down", value: downPorts.length, unit: "count" });
    for (const p of portList) {
      const ok = p.state === "up";
      const id = `${p.node?.name ?? ""} ${p.name ?? "Port"}`.trim();
      componentChecks.push({ category: "Netzwerk-Port", id, description: p.state ?? "unbekannt", ok });
      if (!ok) componentFaults.push({ category: "Netzwerk-Port", id, description: p.state ?? "unbekannt" });
    }
  }

  // --- SnapMirror-Beziehungen ---
  // Nicht gegen ein reales Gerät verifiziert (wie der übrige NetApp-Adapter).
  const snapmirrorList = Array.isArray(snapmirrorRelationships?.body?.records) ? snapmirrorRelationships.body.records : [];
  if (snapmirrorList.length > 0) {
    const unhealthy = snapmirrorList.filter((r) => r.healthy !== true);
    metrics.push({ key: "snapmirror_relationships_unhealthy", value: unhealthy.length, unit: "count" });
    for (const r of unhealthy) {
      const id = r.destination?.path || r.source?.path || "SnapMirror";
      const lag = r.lag_time ? `, Lag: ${r.lag_time}` : "";
      componentFaults.push({ category: "SnapMirror", id, description: `${r.state ?? "unbekannt"}${lag}` });
    }
  }

  // --- Volumes: Status je Volume + Übersichtstabelle für den Bericht ---
  // "state" ist bei ONTAP-Volumes online/offline/error/mixed — anders als
  // die anderen Health-Felder hier (die durchgehend "state === 'ok'/'online'"
  // sind) also EXPLIZIT auf "online" statt auf's Fehlen eines Fehlerworts
  // geprüft, damit ein unbekannter/neuer State-Wert nicht fälschlich als "ok"
  // durchrutscht.
  const volumeList = Array.isArray(volumes?.body?.records) ? volumes.body.records : [];
  const volumeOverview = [];
  // Zugesagte (logische) Kapazität je Aggregat (uuid -> Bytes) — nur
  // Volumes mit GENAU EINEM Aggregat werden gezählt (FlexGroups über
  // mehrere Aggregate hinweg würden sonst mehrfach gezählt); Grundlage der
  // Überbuchungsberechnung weiter unten.
  const subscribedBytesByAggregateUuid = new Map();
  let unencryptedVolumes = 0;
  let snapshotReserveExhausted = 0;
  if (volumeList.length > 0) {
    metrics.push({ key: "volumes_faulty", value: volumeList.filter((v) => v.state !== "online").length, unit: "count" });
    for (const v of volumeList) {
      const ok = v.state === "online";
      const id = v.name || "Volume";
      componentChecks.push({ category: "Volume", id, description: v.state ?? "unbekannt", ok });
      if (!ok) componentFaults.push({ category: "Volume", id, description: v.state ?? "unbekannt" });

      const sizeBytes = Number(v.space?.size);
      // ONTAP liefert space.used bei Volumes (anders als bei Aggregaten, wo es
      // ein einzelnes block_storage.used-Feld ist) als Objekt mit mehreren
      // Unterfeldern (u. a. .total) — mit Fallback auf einen direkten
      // Zahlenwert, falls eine ONTAP-Version das Feld doch flach liefert.
      const usedBytes = Number(v.space?.used?.total ?? v.space?.used);
      if (Number.isFinite(sizeBytes)) {
        volumeOverview.push({
          name: v.name || "Volume",
          svm: v.svm?.name || "—",
          aggregate: (v.aggregates ?? []).map((a) => a.name).filter(Boolean).join(", ") || "—",
          state: v.state || "unbekannt",
          usedTB: Number.isFinite(usedBytes) ? bytesToTB(usedBytes) : 0,
          totalTB: bytesToTB(sizeBytes),
        });

        const aggUuids = (v.aggregates ?? []).map((a) => a.uuid).filter(Boolean);
        if (aggUuids.length === 1) {
          const uuid = aggUuids[0];
          subscribedBytesByAggregateUuid.set(uuid, (subscribedBytesByAggregateUuid.get(uuid) ?? 0) + sizeBytes);
        }
      }

      // Verschlüsselungsstatus: encryption.enabled nur durch Analogie zum
      // bereits genutzten ha.enabled-Muster plausibel, nicht gegen ein
      // reales Gerät verifiziert.
      if (v.encryption?.enabled === false) unencryptedVolumes++;

      // Snapshot-Reserve: space.snapshot.used >= space.snapshot.reserve_percent
      // des Gesamtvolumens bedeutet, die reservierte Snapshot-Kapazität ist
      // ausgeschöpft — Felder nur durch Analogie zum space.*-Schema
      // plausibel, nicht gegen ein reales Gerät verifiziert.
      const snapshotUsedBytes = Number(v.space?.snapshot?.used);
      const reservePercent = Number(v.space?.snapshot?.reserve_percent);
      if (Number.isFinite(snapshotUsedBytes) && Number.isFinite(reservePercent) && reservePercent > 0 && Number.isFinite(sizeBytes)) {
        const reserveBytes = (sizeBytes * reservePercent) / 100;
        if (snapshotUsedBytes >= reserveBytes) {
          snapshotReserveExhausted++;
          componentFaults.push({ category: "Snapshot-Reserve", id, description: `Auslastung ${Math.round((snapshotUsedBytes / reserveBytes) * 100)}%` });
        }
      }
    }
    metrics.push({ key: "volumes_unencrypted", value: unencryptedVolumes, unit: "count" });
    metrics.push({ key: "volumes_snapshot_reserve_exhausted", value: snapshotReserveExhausted, unit: "count" });
  }

  // --- Thin-Provisioning-Überbuchung ---
  // Kein NetApp-eigener konfigurierter Schwellwert wie bei Huaweis
  // PROVISIONINGLIMIT bekannt — daher nur der informative Prozentwert, als
  // Maximum über alle Aggregate gemeldet (Worst-Case je Cluster).
  let maxOversubscriptionPct;
  for (const [uuid, subscribedBytes] of subscribedBytesByAggregateUuid) {
    const aggSize = aggregateSizeByUuid.get(uuid);
    if (!aggSize || aggSize <= 0) continue;
    const pct = (subscribedBytes / aggSize) * 100;
    if (maxOversubscriptionPct === undefined || pct > maxOversubscriptionPct) maxOversubscriptionPct = pct;
  }
  if (maxOversubscriptionPct !== undefined) {
    metrics.push({ key: "aggregate_oversubscription_pct", value: maxOversubscriptionPct, unit: "%" });
  }

  // --- LUNs + darauf gemappte Initiatoren ---
  // Anders als bei Huawei (siehe collector/adapters/shared.js) liefert ONTAP
  // den LUN<->Igroup-Join direkt über /protocols/san/lun-maps — kein
  // mehrstufiges Auflösen über LUN-/Host-Gruppen nötig. Igroup-Name dient
  // hier als "hostName", da eine Igroup begrifflich genau das ist: die
  // Gruppe der Initiatoren eines Hosts/Host-Clusters.
  const lunList = Array.isArray(luns?.body?.records) ? luns.body.records : [];
  const lunOverview = [];
  if (lunList.length > 0) {
    const igroupByUuid = new Map((Array.isArray(igroups?.body?.records) ? igroups.body.records : []).map((g) => [g.uuid, g]));
    const mapsByLunUuid = new Map();
    for (const m of Array.isArray(lunMaps?.body?.records) ? lunMaps.body.records : []) {
      const lunUuid = m.lun?.uuid;
      if (!lunUuid) continue;
      if (!mapsByLunUuid.has(lunUuid)) mapsByLunUuid.set(lunUuid, []);
      mapsByLunUuid.get(lunUuid).push(m);
    }

    // "online" ist bei LUNs (anders als bei Volumes/Aggregaten) laut ONTAP-
    // REST-Doku der einzige gesunde status.state-Wert.
    metrics.push({ key: "luns_faulty", value: lunList.filter((l) => l.status?.state !== "online").length, unit: "count" });
    let unmappedCount = 0;
    for (const l of lunList) {
      const ok = l.status?.state === "online";
      const id = l.name || "LUN";
      componentChecks.push({ category: "LUN", id, description: l.status?.state ?? "unbekannt", ok });
      if (!ok) componentFaults.push({ category: "LUN", id, description: l.status?.state ?? "unbekannt" });

      const maps = mapsByLunUuid.get(l.uuid) ?? [];
      const initiators = [];
      for (const m of maps) {
        const igroup = igroupByUuid.get(m.igroup?.uuid);
        if (!igroup) continue;
        const type = igroup.protocol === "fcp" ? "fc" : "iscsi";
        for (const init of igroup.initiators ?? []) {
          if (init.name) initiators.push({ type, name: String(init.name), hostName: igroup.name });
        }
      }
      const mapped = maps.length > 0;
      if (!mapped) unmappedCount += 1;

      const sizeBytes = Number(l.space?.size);
      if (Number.isFinite(sizeBytes)) {
        const usedBytes = Number(l.space?.used);
        lunOverview.push({
          id: l.uuid || id,
          name: id,
          healthStatus: l.status?.state ?? "unbekannt",
          capacityTB: bytesToTB(sizeBytes),
          ...(Number.isFinite(usedBytes) ? { allocatedTB: bytesToTB(usedBytes) } : {}),
          mapped,
          ...(initiators.length > 0 ? { initiators: initiators.slice(0, 20) } : {}),
        });
      }
    }
    metrics.push({ key: "luns_unmapped", value: unmappedCount, unit: "count" });
  }

  // --- EMS-Ereignisse (Alarme) ---
  let alarmSamples;
  if (emsEvents) {
    const events = Array.isArray(emsEvents.body.records) ? emsEvents.body.records : [];
    const counts = { critical: 0, major: 0, warning: 0 };
    const seenBySeverity = { critical: new Set(), major: new Set(), warning: new Set() };
    alarmSamples = [];
    for (const e of events) {
      const severity = EMS_SEVERITY_MAP[String(e.message?.severity ?? "").toLowerCase()];
      if (!severity) continue;
      counts[severity] += 1;
      const name = String(e.message?.name ?? "Ereignis");
      const seen = seenBySeverity[severity];
      if (seen.size < ALARM_SAMPLE_SIZE && !seen.has(name)) {
        seen.add(name);
        alarmSamples.push({
          severity,
          name: name.slice(0, 200),
          description: String(e.log_message ?? "—").slice(0, 500),
          time: e.time ?? undefined,
        });
      }
    }
    metrics.push({ key: "alerts_critical", value: counts.critical, unit: "count" });
    metrics.push({ key: "alerts_major", value: counts.major, unit: "count" });
    metrics.push({ key: "alerts_warning", value: counts.warning, unit: "count" });
  }

  if (metrics.length === 0) {
    throw new Error("Keine Kennzahlen konnten erhoben werden.");
  }

  const meta = {};
  if (deviceInfo.serialNumber) meta.deviceSerialNumber = deviceInfo.serialNumber;
  if (deviceInfo.model) meta.deviceModel = deviceInfo.model;
  if (deviceInfo.name) meta.deviceName = deviceInfo.name;
  if (deviceInfo.softwareVersion) meta.deviceSoftwareVersion = deviceInfo.softwareVersion;
  if (alarmSamples !== undefined) meta.alarmSamples = alarmSamples;
  if (componentFaults.length > 0) meta.componentFaults = componentFaults;
  if (componentChecks.length > 0) meta.componentChecks = componentChecks;
  if (capacityBreakdown.length > 0) meta.capacityBreakdown = capacityBreakdown;
  if (volumeOverview.length > 0) meta.volumes = volumeOverview;
  if (lunOverview.length > 0) meta.luns = lunOverview;
  if (Object.keys(rawEndpoints).length > 0) meta.rawEndpoints = rawEndpoints;

  return { metrics, meta: Object.keys(meta).length > 0 ? meta : undefined };
}

module.exports = { collect };
