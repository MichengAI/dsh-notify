param(
  [Parameter(Mandatory = $true)][string]$PayloadB64
)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Continue'
try {
  $payload = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($PayloadB64)) | ConvertFrom-Json
} catch {
  exit 0
}
$sound = [string]$payload.sound
if (-not $sound -or -not (Test-Path -LiteralPath $sound)) { exit 0 }
try {
  (New-Object System.Media.SoundPlayer $sound).PlaySync()
} catch {
  try { (New-Object System.Media.SoundPlayer $sound).Play() } catch { }
}