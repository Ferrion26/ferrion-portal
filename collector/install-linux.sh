#!/usr/bin/env bash
# Ferrion Managed-Service-Collector — Linux-Einrichtung
# Traegt einen taeglichen cron-Eintrag fuer den aktuellen Benutzer ein.
#
# Nutzung:
#   ./install-linux.sh                       Live-Push an das Portal
#   ./install-linux.sh --export-dir /pfad     Export-Datei statt Push (air-gapped)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_PATH="$SCRIPT_DIR/config.json"
INDEX_PATH="$SCRIPT_DIR/index.js"
CRON_TIME="0 6 * * *"
EXPORT_DIR="${2:-}"

if [ ! -f "$CONFIG_PATH" ]; then
  echo "config.json fehlt in $SCRIPT_DIR — zuerst config.example.json kopieren und ausfuellen." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node wurde nicht im PATH gefunden. Node.js 18+ installieren." >&2
  exit 1
fi

NODE_PATH="$(command -v node)"
CMD="$NODE_PATH \"$INDEX_PATH\" \"$CONFIG_PATH\""
if [ "${1:-}" = "--export-dir" ] && [ -n "$EXPORT_DIR" ]; then
  CMD="$CMD --export-dir \"$EXPORT_DIR\""
fi

CRON_LINE="$CRON_TIME cd \"$SCRIPT_DIR\" && $CMD >> \"$SCRIPT_DIR/collector.log\" 2>&1"

(crontab -l 2>/dev/null | grep -v "$INDEX_PATH"; echo "$CRON_LINE") | crontab -

echo "cron-Eintrag gesetzt — laeuft taeglich um 06:00."
if [ -n "$EXPORT_DIR" ]; then
  echo "Modus: Export-Datei nach $EXPORT_DIR (manueller Upload im Admin-Bereich noetig)."
else
  echo "Modus: Live-Push an das Ferrion-Portal."
fi
echo "Testlauf jetzt: node \"$INDEX_PATH\" \"$CONFIG_PATH\""
