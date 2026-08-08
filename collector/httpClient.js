// Kleiner fetch-Wrapper für die beiden Huawei-REST-APIs (DeviceManager /
// Backup Storage und DataBackup). Viele OceanProtect-Appliances laufen mit
// einem selbstsignierten Zertifikat im internen Netz — dafür gibt es die
// explizite, standardmäßig deaktivierte Opt-in-Option `allowInsecureTls`.
function withInsecureTls(config, fn) {
  if (!config.allowInsecureTls) return fn();
  const prev = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  return Promise.resolve(fn()).finally(() => {
    if (prev === undefined) delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    else process.env.NODE_TLS_REJECT_UNAUTHORIZED = prev;
  });
}

async function requestJson(config, url, options = {}) {
  return withInsecureTls(config, async () => {
    let res;
    try {
      res = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers },
      });
    } catch (err) {
      // Node/undici wraps the real cause (DNS-Fehler, Verbindung abgelehnt,
      // TLS-Zertifikatsproblem, Timeout, ...) in err.cause — ohne das ist
      // "fetch failed" allein nicht diagnostizierbar.
      const cause = err.cause ? ` — Ursache: ${err.cause.code ?? err.cause.message ?? err.cause}` : "";
      throw new Error(`Verbindung zu ${url} fehlgeschlagen${cause}`);
    }
    const text = await res.text();
    let body;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Antwort von ${url} ist kein gültiges JSON: ${text.slice(0, 200)}`);
    }
    if (!res.ok) {
      throw new Error(`${options.method ?? "GET"} ${url} → HTTP ${res.status}: ${text.slice(0, 300)}`);
    }
    return { body, headers: res.headers };
  });
}

// Baut eine URL aus Basis + Pfad, egal ob die Basis (aus config.json) einen
// trailing slash hat oder nicht — vermeidet doppelte Slashes wie
// "https://host:8088//deviceManager/...".
function joinUrl(base, path) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

module.exports = { requestJson, joinUrl };
