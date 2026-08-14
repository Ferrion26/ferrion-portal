// Kleine, von mehreren Huawei-DeviceManager-Adaptern (oceanstor.js,
// oceanprotect.js) gemeinsam genutzte Hilfsfunktion — kein eigenes Modul für
// jede einzelne geteilte Funktion, nur für das, was tatsächlich identisch ist.
const { requestJson, joinUrl } = require("../httpClient");

// Huawei meldet für viele Komponenten (Netzteil, Lüfter, Festplatte,
// Netzwerk-Port, …) ein LOCATION-Feld, dessen erstes Punkt-Segment das
// physische Gehäuse benennt, in dem die Komponente steckt (z. B.
// "CTE0.PSU0" -> Gehäuse "CTE0", "CTE0.A.FAN0" -> ebenfalls "CTE0",
// "DAE010.3" -> Gehäuse "DAE010"). Dieses Segment entspricht exakt dem NAME-
// Feld, mit dem das Gehäuse selbst im /enclosure-Endpunkt geführt wird — für
// den Bericht reicht daher ein reiner String-Split, ohne die Gehäuseliste
// gegen eine PARENTID auflösen zu müssen.
// Gehäuse selbst melden hier "--" (kein Elternteil) -> null, damit sie nicht
// fälschlich "unter sich selbst" gruppiert werden.
function componentGroup(item) {
  const loc = String(item.LOCATION ?? item.location ?? "");
  if (!loc || loc === "--") return null;
  const first = loc.split(".")[0];
  return first || null;
}

// Report-seitige Obergrenzen (siehe src/lib/managed-reports/ingestSchema.ts):
// höchstens LUN_LIMIT LUNs je Ingest, höchstens INITIATORS_PER_LUN_LIMIT
// Initiatoren je LUN — hier schon im Collector gedeckelt, damit ein Gerät mit
// ungewöhnlich vielen LUNs/Initiatoren nicht am Zod-Limit scheitert und den
// ganzen Ingest verwirft.
const LUN_LIMIT = 300;
const INITIATORS_PER_LUN_LIMIT = 20;

// Ermittelt für alle LUNs eines Huawei-DeviceManager-Systems (OceanStor,
// OceanProtect-Storage-Ebene — identische API) Zustand, Kapazität und die
// darauf gemappten Initiatoren (iSCSI-IQN/FC-WWN samt Host-Name).
//
// Auflösungskette (Huawei kennt keinen direkten LUN->Initiator-Join):
//   LUN --(LUN-Gruppe)--> Mapping View <--(Host-Gruppe)-- Host --> Initiator
// Für jede Mapping View werden ihre LUN-/Host-Gruppen aufgelöst, für jede
// dieser Gruppen die enthaltenen LUNs bzw. Hosts, und für jeden so
// gefundenen Host dessen iSCSI-/FC-Initiatoren.
//
// Die dabei verwendeten ASSOCIATEOBJTYPE-Codes (245 = Mapping View,
// 256 = LUN-Gruppe, 14 = Host-Gruppe) und PARENTTYPE=21 für Host-gebundene
// Initiatoren folgen der allgemeinen Huawei-DeviceManager-API-Konvention,
// sind aber NICHT gegen ein reales Gerät verifiziert. Jeder Teilschritt läuft
// über fetchOptional — ein falscher Code führt bestenfalls zu einer leeren
// Initiatorenliste (LUN erscheint als "nicht gemappt"), nie zum Abbruch der
// gesamten Erhebung.
async function collectLunOverview(config, base, authHeaders, fetchOptional, describeHealthStatus) {
  const rawEndpoints = {};

  const lunsRes = await fetchOptional(config, "LUN-Liste", requestJson(config, joinUrl(base, "/lun"), { headers: authHeaders }));
  const lunList = Array.isArray(lunsRes?.body?.data) ? lunsRes.body.data : [];
  if (lunsRes) rawEndpoints["/lun"] = lunsRes.body?.data ?? lunsRes.body;
  if (lunList.length === 0) return { luns: [], metrics: [], rawEndpoints };

  const mvRes = await fetchOptional(config, "Mapping-Views", requestJson(config, joinUrl(base, "/mappingview"), { headers: authHeaders }));
  const mappingViews = Array.isArray(mvRes?.body?.data) ? mvRes.body.data : [];
  if (mvRes) rawEndpoints["/mappingview"] = mvRes.body?.data ?? mvRes.body;

  // lunId -> Set(hostId), über alle Mapping Views hinweg aufgebaut.
  const lunIdToHostIds = new Map();
  // hostId -> Name (aus der Host-Gruppen-Auflösung, spart einen eigenen
  // /host-Batch-Aufruf nur für die Namen).
  const hostNames = new Map();

  await Promise.all(
    mappingViews.map(async (mv) => {
      const mvId = mv.ID ?? mv.id;
      if (mvId === undefined) return;
      const [lunGroupsRes, hostGroupsRes] = await Promise.all([
        fetchOptional(
          config,
          `LUN-Gruppen (Mapping View ${mvId})`,
          requestJson(config, joinUrl(base, `/lungroup?ASSOCIATEOBJTYPE=245&ASSOCIATEOBJID=${mvId}`), { headers: authHeaders })
        ),
        fetchOptional(
          config,
          `Host-Gruppen (Mapping View ${mvId})`,
          requestJson(config, joinUrl(base, `/hostgroup?ASSOCIATEOBJTYPE=245&ASSOCIATEOBJID=${mvId}`), { headers: authHeaders })
        ),
      ]);
      const lunGroups = Array.isArray(lunGroupsRes?.body?.data) ? lunGroupsRes.body.data : [];
      const hostGroups = Array.isArray(hostGroupsRes?.body?.data) ? hostGroupsRes.body.data : [];
      if (lunGroups.length === 0 || hostGroups.length === 0) return;

      const [lunIdLists, hostLists] = await Promise.all([
        Promise.all(
          lunGroups.map(async (lg) => {
            const lgId = lg.ID ?? lg.id;
            const res = await fetchOptional(
              config,
              `LUNs in LUN-Gruppe ${lgId}`,
              requestJson(config, joinUrl(base, `/lun?ASSOCIATEOBJTYPE=256&ASSOCIATEOBJID=${lgId}`), { headers: authHeaders })
            );
            const list = Array.isArray(res?.body?.data) ? res.body.data : [];
            return list.map((l) => String(l.ID ?? l.id));
          })
        ),
        Promise.all(
          hostGroups.map(async (hg) => {
            const hgId = hg.ID ?? hg.id;
            const res = await fetchOptional(
              config,
              `Hosts in Host-Gruppe ${hgId}`,
              requestJson(config, joinUrl(base, `/host?ASSOCIATEOBJTYPE=14&ASSOCIATEOBJID=${hgId}`), { headers: authHeaders })
            );
            const list = Array.isArray(res?.body?.data) ? res.body.data : [];
            return list.map((h) => ({ id: String(h.ID ?? h.id), name: String(h.NAME ?? h.name ?? h.ID ?? h.id) }));
          })
        ),
      ]);

      const lunIds = lunIdLists.flat();
      const hosts = hostLists.flat();
      for (const host of hosts) hostNames.set(host.id, host.name);
      for (const lunId of lunIds) {
        if (!lunIdToHostIds.has(lunId)) lunIdToHostIds.set(lunId, new Set());
        const set = lunIdToHostIds.get(lunId);
        for (const host of hosts) set.add(host.id);
      }
    })
  );

  // Initiatoren je Host nur EINMAL auflösen (nicht je LUN), auch wenn ein
  // Host auf mehrere LUNs gemappt ist.
  const allHostIds = new Set();
  for (const set of lunIdToHostIds.values()) for (const id of set) allHostIds.add(id);

  const hostInitiators = new Map();
  await Promise.all(
    [...allHostIds].map(async (hostId) => {
      const [iscsiRes, fcRes] = await Promise.all([
        fetchOptional(
          config,
          `iSCSI-Initiatoren (Host ${hostId})`,
          requestJson(config, joinUrl(base, `/iscsi_initiator?PARENTTYPE=21&PARENTID=${hostId}`), { headers: authHeaders })
        ),
        fetchOptional(
          config,
          `FC-Initiatoren (Host ${hostId})`,
          requestJson(config, joinUrl(base, `/fc_initiator?PARENTTYPE=21&PARENTID=${hostId}`), { headers: authHeaders })
        ),
      ]);
      const iscsiList = Array.isArray(iscsiRes?.body?.data) ? iscsiRes.body.data : [];
      const fcList = Array.isArray(fcRes?.body?.data) ? fcRes.body.data : [];
      const hostName = hostNames.get(hostId);
      hostInitiators.set(hostId, [
        ...iscsiList.map((i) => ({ type: "iscsi", name: String(i.ID ?? i.id ?? "—"), hostName })),
        ...fcList.map((f) => ({ type: "fc", name: String(f.ID ?? f.id ?? "—"), hostName })),
      ]);
    })
  );

  const luns = [];
  const metrics = [];
  let faultyCount = 0;
  let unmappedCount = 0;
  for (const lun of lunList.slice(0, LUN_LIMIT)) {
    const lunId = String(lun.ID ?? lun.id);
    const healthCode = Number(lun.HEALTHSTATUS ?? lun.healthStatus);
    const isFaulty = Number.isFinite(healthCode) && healthCode !== 1;
    if (isFaulty) faultyCount++;

    const hostIds = lunIdToHostIds.get(lunId);
    const mapped = Boolean(hostIds && hostIds.size > 0);
    if (!mapped) unmappedCount++;

    const initiators = mapped
      ? [...hostIds].flatMap((hostId) => hostInitiators.get(hostId) ?? []).slice(0, INITIATORS_PER_LUN_LIMIT)
      : [];

    const capacitySectors = Number(lun.CAPACITY);
    const allocSectors = Number(lun.ALLOCCAPACITY);

    luns.push({
      id: lunId,
      name: String(lun.NAME ?? lun.name ?? lunId),
      healthStatus: describeHealthStatus(healthCode),
      capacityTB: Number.isFinite(capacitySectors) ? (capacitySectors * 512) / 1024 ** 4 : 0,
      ...(Number.isFinite(allocSectors) ? { allocatedTB: (allocSectors * 512) / 1024 ** 4 } : {}),
      mapped,
      ...(initiators.length > 0 ? { initiators } : {}),
    });
  }
  metrics.push({ key: "luns_faulty", value: faultyCount, unit: "count" });
  metrics.push({ key: "luns_unmapped", value: unmappedCount, unit: "count" });

  return { luns, metrics, rawEndpoints };
}

module.exports = { componentGroup, collectLunOverview };
