// Adapter für Huawei OceanProtect: liest Kennzahlen aus DeviceManager/eBackup
// aus und bringt sie in das generische { key, value, unit? }-Format, das
// POST /api/collector/ingest erwartet.
//
// TODO (pro Kunde einzurichten): Die untenstehenden Werte sind Platzhalter.
// Ich habe keinen Zugriff auf eine echte OceanProtect-DeviceManager-Instanz
// oder deren API-Dokumentation — die konkreten REST-Aufrufe (Endpunkte,
// Auth-Flow, Feldnamen für Job-Erfolgsquote/Kapazität/Dedup/Alarme) müssen
// hier anhand der Huawei-API-Doku des jeweiligen Kunden ergänzt werden.
//
// Die metricKeys müssen exakt zu den Definitionen in
// src/lib/managed-reports/metrics/oceanprotect.ts passen.
async function collect(config) {
  const { deviceManagerUrl, username, password } = config.oceanprotect ?? {};
  if (!deviceManagerUrl) {
    throw new Error("collector/adapters/oceanprotect.js: config.oceanprotect.deviceManagerUrl fehlt.");
  }

  // Beispiel-Grundgerüst für den echten Aufruf — ersetzen durch die
  // tatsächliche DeviceManager/eBackup-REST-API des Kunden:
  //
  //   const token = await authenticate(deviceManagerUrl, username, password);
  //   const jobs = await fetchJson(`${deviceManagerUrl}/api/v2/backup-jobs/summary`, token);
  //   const capacity = await fetchJson(`${deviceManagerUrl}/api/v2/storage/capacity`, token);
  //   const alerts = await fetchJson(`${deviceManagerUrl}/api/v2/alarms/summary`, token);
  //
  // und daraus die untenstehenden Werte berechnen.

  // Erwartete Rückgabeform, sobald die echte Anbindung steht:
  //   return [
  //     { key: "backup_success_rate", value: 99.2, unit: "%" },
  //     { key: "rpo_compliance_rate", value: 98.5, unit: "%" },
  //     { key: "protected_capacity_tb", value: 42.7, unit: "TB" },
  //     { key: "dedup_ratio", value: 6.3, unit: "x" },
  //     { key: "air_gap_isolation_events", value: 4, unit: "count" },
  //     { key: "alerts_critical", value: 0, unit: "count" },
  //     { key: "alerts_warning", value: 2, unit: "count" },
  //     { key: "incidents_count", value: 1, unit: "count" },
  //   ];
  throw new Error(
    "collector/adapters/oceanprotect.js: collect() ist noch nicht implementiert — " +
      "siehe TODO-Kommentar im Adapter. Ohne echte DeviceManager-Anbindung können keine Kennzahlen erhoben werden."
  );
}

module.exports = { collect };
