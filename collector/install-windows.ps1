# Ferrion Managed-Service-Collector — Windows-Einrichtung
# Registriert einen taeglichen Scheduled Task, der index.js mit config.json
# im selben Verzeichnis ausfuehrt. Als Administrator ausfuehren.
#
# Nutzung:
#   .\install-windows.ps1                          Live-Push an das Portal
#   .\install-windows.ps1 -ExportDir C:\ferrion-exports   Export-Datei statt Push (air-gapped)

param(
  [string]$ExportDir,
  [string]$TaskName = "FerrionManagedServiceCollector",
  [string]$Time = "06:00"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigPath = Join-Path $ScriptDir "config.json"
$IndexPath = Join-Path $ScriptDir "index.js"

if (-not (Test-Path $ConfigPath)) {
  Write-Error "config.json fehlt in $ScriptDir — zuerst config.example.json kopieren und ausfuellen."
  exit 1
}

$NodePath = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $NodePath) {
  Write-Error "node.exe wurde nicht im PATH gefunden. Node.js 18+ installieren."
  exit 1
}

$Arguments = "`"$IndexPath`" `"$ConfigPath`""
if ($ExportDir) {
  $Arguments += " --export-dir `"$ExportDir`""
}

$Action = New-ScheduledTaskAction -Execute $NodePath -Argument $Arguments -WorkingDirectory $ScriptDir
$Trigger = New-ScheduledTaskTrigger -Daily -At $Time
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Ferrion Managed-Service-Collector" -Force

Write-Host "Scheduled Task '$TaskName' angelegt — laeuft taeglich um $Time."
if ($ExportDir) {
  Write-Host "Modus: Export-Datei nach $ExportDir (manueller Upload im Admin-Bereich noetig)."
} else {
  Write-Host "Modus: Live-Push an das Ferrion-Portal."
}
Write-Host "Testlauf jetzt: node `"$IndexPath`" `"$ConfigPath`""
