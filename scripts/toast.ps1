param(
  [Parameter(Mandatory = $true)][string]$PayloadB64
)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'Continue'

function Write-NotifyLog([string]$Message) {
  try {
    $target = if ($script:Payload -and $script:Payload.logFile) { [string]$script:Payload.logFile } else { Join-Path $env:TEMP 'dsh-notify-toast.log' }
    Add-Content -LiteralPath $target -Value ('{0} toast {1}' -f (Get-Date -Format 'yyyy-MM-ddTHH:mm:ss.fffK'), $Message) -Encoding UTF8
  } catch { }
}

function ConvertTo-XmlText([string]$Value) {
  if ([string]::IsNullOrEmpty($Value)) { return '' }
  return $Value.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;').Replace("'", '&apos;')
}

function Test-SystemFocusAssist {
  $candidates = @(
    'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\CloudStore\Store\DefaultAccount\Current\default$Windows.Data.Notifications.FocusAssist$\Current'
  )
  foreach ($path in $candidates) {
    if (-not (Test-Path -LiteralPath $path)) { continue }
    $data = (Get-ItemProperty -LiteralPath $path -Name Data -ErrorAction SilentlyContinue).Data
    if ($null -ne $data -and [int]$data -ne 0) { return $true }
  }
  return $false
}

try {
  $script:Payload = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($PayloadB64)) | ConvertFrom-Json
} catch {
  Write-NotifyLog ('payload decode failed: ' + $_.Exception.Message)
  exit 0
}

$line1 = [string]$script:Payload.line1
$line2 = [string]$script:Payload.line2
$line3 = [string]$script:Payload.line3
$mute = $script:Payload.mute -eq $true
$respectDnd = $script:Payload.respectSystemDnd -eq $true
$silent = $false
if ($respectDnd -and (Test-SystemFocusAssist)) { $silent = $true }

$audioXml = if ($mute -or $silent) { "<audio silent='true' />" } else { "<audio src='ms-winsoundevent:Notification.Default' />" }
$line3Xml = ''
if ($line3.Length -gt 0) { $line3Xml = '<text>' + (ConvertTo-XmlText $line3) + '</text>' }
$xml = "<toast duration='short'><visual><binding template='ToastGeneric'><text>$(ConvertTo-XmlText $line1)</text><text>$(ConvertTo-XmlText $line2)</text>$line3Xml</binding></visual>$audioXml</toast>"

try {
  [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
  [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
  $doc = New-Object Windows.Data.Xml.Dom.XmlDocument
  $doc.LoadXml($xml)
  $toast = [Windows.UI.Notifications.ToastNotification]::new($doc)
  $appIds = @(
    'MichengAI.DshNotify',
    '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
  )
  foreach ($appId in $appIds) {
    try {
      [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
      Write-NotifyLog ('shown via ' + $appId)
      break
    } catch {
      Write-NotifyLog ('show failed via ' + $appId)
    }
  }
} catch {
  Write-NotifyLog ('toast threw: ' + $_.Exception.Message)
}
