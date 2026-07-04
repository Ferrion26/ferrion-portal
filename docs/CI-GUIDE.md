# Ferrion — Corporate-Identity-Guide

> Lebendes Dokument. Es beschreibt das visuelle & sprachliche Erscheinungsbild von
> Ferrion, wie es **tatsächlich im Code** umgesetzt ist. Bei Designänderungen wird
> dieser Guide mitgepflegt (siehe [Pflege](#9-pflege--governance)).
>
> Zuletzt aktualisiert: 2026-07-05

---

## 1. Marke & Haltung

- **Name:** Ferrion IT Systemhaus GmbH · Wien, Österreich
- **Claim / Slogan:** **build to endure**
- **Tagline:** *IT Systemhaus · Services · Managed Services*
- **Positionierung:** Inhabergeführtes IT-Systemhaus mit Fokus auf Infrastruktur
  (Storage, Backup & Security, AI-Infrastruktur, Managed Services) und tiefer
  Datenbank-Expertise. Partner von Huawei, Pure Storage, Commvault, NVIDIA.
- **Anmutung:** Dunkel, wertig, technisch-präzise, Gold als Signaturfarbe.
  „Infrastruktur, die trägt. Expertise, die überzeugt."

---

## 2. Logo

Wortmarke aus **Emblem** (Gold-/Silber-„F-Swoosh") + Schriftzug **FERRION**
(Serife, gesperrt) + Subline (Tagline).

**Varianten & Dateien**
| Variante | Verwendung | Datei |
|---|---|---|
| Gold auf Dunkel | Website, dunkle Flächen | `public/logos/ferrion.svg` |
| Dunkler Schriftzug auf Hell | Druck (Rechnung/Angebot) | `scripts/assets/ferrion-logo-light.png` |
| Gold-Schriftzug (Print, dunkel) | Reserve | `scripts/assets/ferrion-logo.png` |

**Regeln**
- Emblem bleibt in allen Varianten Gold/Silber.
- Auf **dunklem** Grund: Schriftzug in Gold-Verlauf. Auf **hellem** Grund:
  Schriftzug in dunklem Ink (`#14181F`) für Kontrast — nie Gold auf Weiß (zu blass).
- Schutzraum: mind. Höhe des „F"-Emblems rundum frei halten.
- Nicht verzerren, nicht neu einfärben, Emblem und Schriftzug nicht trennen.

---

## 3. Farben

Gold ist die einzige Akzentfarbe; alles andere ist ein dunkles Grau-Gerüst
(Website) bzw. Weiß + Grau (Druck).

### Kernpalette

| Rolle | Hex | Einsatz |
|---|---|---|
| **Gold (Akzent)** | `#c9a84c` | Linien, Labels, Buttons, Badges, Hover-States, Zahlen/Stat-Werte |
| **Gold Hover** | `#e0bc5a` | Hover auf goldenen Flächen (CTA) |
| **Basis-Dunkel** | `#0d1117` | Haupt-Seitenhintergrund |
| **Karte** | `#111827` | Standard-Karten/Panels, Inputs |
| **Karte (Variante)** | `#111820` | Karten in Services/Newsroom |
| **Tiefdunkel** | `#080d12` | Footer, Testimonials-Band |
| **Ink (Print)** | `#111827` / `#14181F` | Fließtext & Logo-Schriftzug auf Weiß |
| **Grau** | `#6b7280` | Sekundärtext, Labels auf Hell |
| **Helle Linie** | `#e5e7eb` | Tabellen-/Trennlinien auf Weiß |

Tailwind-Nutzung als arbitrary values, z. B. `bg-[#0d1117]`, `text-[#c9a84c]`,
`border-[#c9a84c]/30`. Transparenzen über `/10`–`/40` sind üblich
(`border-white/10`, `bg-[#c9a84c]/5`).

### Semantische Farben (sparsam)
- **Security/Fehler:** Rot (`red-400` Text, `red-500/40` Rahmen, `red-900/20` Fläche) — z. B. Security-Advisory-Tag, Formularfehler.
- **Warnung/Mittel:** Amber (`amber-300/500`) — z. B. mittlere CVE-Severity.

### Gradienten (nur im Logo)
- Gold: `#d4a843 → #f0d080 → #a07830` · Silber: `#c0c0c0 → #e8e8e8 → #909090`.

---

## 4. Typografie

| Kontext | Schrift | Herkunft |
|---|---|---|
| Website (UI & Fließtext) | **Inter** | `next/font/google` in `src/app/layout.tsx` |
| Logo-Schriftzug „FERRION" | Serife (Times New Roman) gesperrt | nur im Logo |
| Druckdokumente (DOCX) | **Arial** | `scripts/generate-invoice-template.js` |

**Muster**
- **Eyebrow-/Label-Stil (Signatur):** `text-xs font-bold tracking-widest uppercase`
  in Gold oder Grau — über Überschriften und als Sektions-Kicker.
- **Headlines:** `font-bold`, groß (`text-4xl`–`text-6xl`), oft zweizeilig mit
  gold gesetzter zweiter Zeile (Hero).
- **Zahlen/Stats:** Gold, `font-bold` (Kennzahl) + kleines graues Label.
- **Grundsatz:** Versalien nur für kurze Labels/Kicker, nicht für Fließtext.

---

## 5. UI-Komponenten & Muster

- **Sektionsrhythmus:** `py-24`, zentriert in `max-w-7xl mx-auto px-6`.
- **Karten:** `bg-[#111827] border border-white/10`, Hover
  `hover:border-[#c9a84c]/30`, meist ohne Radius (kantig).
- **Primär-CTA:** `bg-[#c9a84c] text-black … hover:bg-[#e0bc5a]`,
  `text-xs font-bold tracking-widest uppercase`.
- **Sekundär-CTA / Outline:** `border border-[#c9a84c] text-[#c9a84c]
  hover:bg-[#c9a84c] hover:text-black`.
- **Badge/Tag:** `text-[10px] text-[#c9a84c] border border-[#c9a84c]/30 px-2 py-0.5`.
- **Gold-Trennlinie:** dünne goldene Linie als Sektions-/Kopf-Akzent.
- **Kicker mit Strich:** `— LABEL` (kurzer goldener Strich + Versal-Label).
- **Fakten-Grid (Artikel):** 2–4 Spalten, Gold-Zahl + graues Label auf `#0d1117`.

---

## 6. Bild- & Bewegtbild

- **Fotografie:** ruhige, technische Motive (Rechenzentrum, Storage, GPU, Team);
  dunkel abgedimmt mit Overlay, damit Gold/Weiß trägt. Quelle aktuell Unsplash,
  ausgeliefert über `next/image` (WebP/AVIF, Lazy-Loading).
- **Hero-Hintergrund:** Bergmotiv mit dezenter „Sonne-durch-Wolken"-Animation
  (God-Rays + Ken-Burns), im Admin unter **Einstellungen** steuerbar
  (`src/lib/heroLight.ts`, `src/app/globals.css`). Respektiert
  `prefers-reduced-motion`.
- **Imagefilm:** vertikales 9:16-Video als Showreel-Element
  (`public/images/FERRION_Imagefilm_9x16.mp4`).

---

## 7. Sprache & Tonalität

- **Zweisprachig DE/EN** durchgängig; Umschaltung per Locale-Cookie bzw.
  `?lang=en` für Suchmaschinen (hreflang).
- **Tonalität:** sachlich, kompetent, B2B; kurze, konkrete Nutzenaussagen.
  Keine Floskeln. „Wir"-Perspektive gegenüber dem Kunden.
- **Wiederkehrende Wendungen:** „build to endure", „Infrastruktur, die trägt",
  „aus einer Hand".
- **Kontakt-Signatur:** `info@ferrion.at` · `ferrion.at` · Wien, Österreich.

---

## 8. Dokumente / Print

Acht Vorlagen aus einem Generator (`scripts/generate-invoice-template.js`),
alle mit gemeinsamem Briefkopf, Farbwelt und Word-Seitenfußzeile:
Rechnung, Angebot, Lieferschein, Auftragsbestätigung, **Mahnung**,
**Gutschrift/Storno**, **Abnahmeprotokoll**, **Wartungs-/SLA-Vertrag**.

- **Druckerfreundlich:** weißer Körper, **kein** dunkler Hintergrund in Kopf/Fuß.
  Logo in heller Variante (dunkler Schriftzug). Gold nur als feine Linien und als
  Tabellenkopf-/Gesamtbetrag-Fläche.
- **Format:** A4, Arial, Kopf als Briefkopf oben, **Rechtszeile als echte
  Word-Seitenfußzeile** am unteren Seitenrand (goldene Oberlinie + graue Legal-Zeile).
- **Akzente:** goldene Tabellen-Kopfzeile (schwarze Schrift), goldene
  Gesamtbetrag-Zeile.
- **Platzhalter:** `{tag}`-Syntax (docxtemplater-kompatibel) für spätere
  automatische Befüllung aus `Order`/`Quote`/`User`.
- **Rechnung** = kompaktes 1-Seiten-Layout (Leistung, Preise, Zahlung/Bank).
- **Angebot** = mehrseitiges Vertragsdokument: Präambel, Angebotsdaten & Preise,
  Leistungsbeschreibung, Allgemeine Bestimmungen (3.1–3.6), Auftrags­verarbeitungs­
  vereinbarung (4.1–4.7), Zahlungsbedingungen & Vergütung (5.1–5.4),
  Gerichtsstand, Schlussbestimmungen, Auftragserteilung mit
  Unterschriftsbereich und elektronischer Beauftragung an `order@ferrion.at`.
  Abschnittsüberschriften mit goldener Unterlinie; Rechtstexte sind Mustertexte.
- **Lieferschein** = Positionen **ohne** Preise (Pos, Art.-Nr., Beschreibung,
  Menge, Einheit) + Empfangsbestätigung mit Unterschriftsfeld.
- **Auftragsbestätigung** = Positionen **mit** Preisen + Summen, Konditionsblock
  (Liefertermin, Leistungszeitraum, Zahlungsbedingungen).
- **Mahnung** = Anschreiben + Betragsübersicht (offen, Mahnspesen, Verzugszinsen,
  Gesamt) mit Zahlungsaufforderung.
- **Gutschrift/Storno** = Positionen mit Preisen + Bezug zur Ursprungsrechnung.
- **Abnahmeprotokoll** = Gegenstand, Leistungen, Feststellungen (Ankreuzfelder),
  Abnahmeerklärung + Unterschriften.
- **Wartungs-/SLA-Vertrag** = mehrseitiger Vertrag mit Leistungsumfang,
  SLA-Reaktionszeiten-Tabelle, Vergütung, Laufzeit/Kündigung, Haftung,
  Datenschutz, Schlussbestimmungen + Unterschriften.

---

## 9. Pflege / Governance

- Dieser Guide ist die **Single Source of Truth** fürs Erscheinungsbild und wird
  **bei jeder Designänderung mitaktualisiert** (Farbe, Logo, Komponentenmuster,
  Dokument-Layout) inkl. Datum oben.
- Verbindliche Werte stehen im Code; dieser Guide beschreibt sie kuratiert:
  - Farben/Muster: `src/components/**`, `src/app/globals.css`
  - Hero-Animation: `src/lib/heroLight.ts`
  - Druckvorlagen: `scripts/generate-invoice-template.js`
- **Bekannte Abweichung (Cleanup-Kandidat):** Der Quick-Login im Header nutzt eine
  grünstichige Button-Fläche (`#2d3f2d`) — sollte auf den goldenen CTA-Stil
  angeglichen werden (`src/components/home/Header.tsx`).
