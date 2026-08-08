// Generischer Push zum Ferrion-Portal — produktunabhängig, unabhängig vom
// jeweiligen Collector-Adapter (siehe adapters/*.js). Nimmt dasselbe
// { collectedAt, metrics }-Payload-Format entgegen, das auch im
// --export-dir-Modus (siehe index.js) in Dateien geschrieben wird.
async function pushMetrics(config, payload) {
  const res = await fetch(config.ingestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Push an ${config.ingestUrl} fehlgeschlagen: ${res.status} ${body}`);
  }

  return res.json();
}

module.exports = { pushMetrics };
