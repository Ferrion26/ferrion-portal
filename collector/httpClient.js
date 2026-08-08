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
    const res = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
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

module.exports = { requestJson };
