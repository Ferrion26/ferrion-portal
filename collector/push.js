// Generischer Push zum Ferrion-Portal — produktunabhängig, unabhängig vom
// jeweiligen Collector-Adapter (siehe adapters/*.js).
async function pushMetrics(config, metrics) {
  const res = await fetch(config.ingestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
    },
    body: JSON.stringify({
      collectedAt: new Date().toISOString(),
      metrics,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Push an ${config.ingestUrl} fehlgeschlagen: ${res.status} ${body}`);
  }

  return res.json();
}

module.exports = { pushMetrics };
