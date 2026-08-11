// Kleine, von mehreren Huawei-DeviceManager-Adaptern (oceanstor.js,
// oceanprotect.js) gemeinsam genutzte Hilfsfunktion — kein eigenes Modul für
// jede einzelne geteilte Funktion, nur für das, was tatsächlich identisch ist.

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

module.exports = { componentGroup };
