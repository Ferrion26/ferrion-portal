import { MetricDefinition } from "./types";
import { OCEANPROTECT_METRICS } from "./oceanprotect";
import { OCEANSTOR_METRICS } from "./oceanstor";
import { NETAPP_METRICS } from "./netapp";
import { FUSIONCOMPUTE_METRICS } from "./fusioncompute";
import { COMMVAULT_METRICS } from "./commvault";

export * from "./types";

// Der einzige Ort, den ein neues Produkt ergänzen muss, damit Aggregation
// und PDF-Template automatisch mitziehen: neue Datei metrics/<slug>.ts
// anlegen und hier unter dem passenden productSlug (siehe
// src/app/produkte/products-data.ts) registrieren.
const METRIC_DEFINITIONS: Record<string, MetricDefinition[]> = {
  oceanprotect: OCEANPROTECT_METRICS,
  "oceanstor-hybrid-flash": OCEANSTOR_METRICS,
  "netapp-aff": NETAPP_METRICS,
  // Kein eigener Katalog-Eintrag "fusioncompute" nötig — das bestehende
  // Produkt "huawei-dcs" (Huawei Datacenter Virtualization, siehe
  // products-data.ts) ist laut eigener Beschreibung bereits "die Server-
  // und Hypervisor-Schicht auf Basis von FusionCompute", also derselbe
  // Collector-Adapter/dieselbe Kennzahlen-Definition unter dem bestehenden
  // Slug statt eines verwirrenden Duplikats.
  "huawei-dcs": FUSIONCOMPUTE_METRICS,
  commvault: COMMVAULT_METRICS,
};

export function getMetricDefinitions(productSlug: string): MetricDefinition[] {
  return METRIC_DEFINITIONS[productSlug] ?? [];
}

// Welche Produkte tatsächlich Kennzahl-Definitionen (und damit einen
// Collector-Adapter) haben — genutzt, um die "Neue Subscription
// anlegen"-Auswahl im Admin-Bereich einzugrenzen. Bewusst getrennt von
// Product.managedServices (öffentliche Marketing-Inhalte auf der
// Produktseite) — ein Produkt kann Managed-Service-Reporting unterstützen,
// ohne schon eine eigene Marketing-Paketseite zu haben, und umgekehrt.
export function getReportableProductSlugs(): string[] {
  return Object.keys(METRIC_DEFINITIONS);
}
