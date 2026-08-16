param([string]$PayloadB64 = '')
# dsh-notify 托盘：读取状态文件，显示待处理数量；点击打开本机 GUI。
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = 'SilentlyContinue'

if ($PayloadB64 -eq '') { exit 0 }
try {
  $payload = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($PayloadB64)) | ConvertFrom-Json
} catch { exit 0 }

$stateFile = [string]$payload.stateFile
$port = [int]$payload.port
$url = [string]$payload.url
$lockFile = [string]$payload.lockFile
if ($stateFile -eq '' -or $port -le 0) { exit 0 }
if ($url -eq '') { $url = "http://127.0.0.1:$port" }
if ($lockFile -eq '') { $lockFile = Join-Path $env:TEMP "dsh-notify-tray-$port.lock" }

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class DshNotifyIcon { [DllImport("user32.dll")] public static extern bool DestroyIcon(IntPtr handle); }'

if (Test-Path -LiteralPath $lockFile) {
  $oldPid = 0
  try { $oldPid = [int](Get-Content -LiteralPath $lockFile -Raw) } catch { }
  if ($oldPid -gt 0 -and (Get-Process -Id $oldPid -ErrorAction SilentlyContinue)) { exit 0 }
}
try { [IO.File]::WriteAllText($lockFile, [string]$PID) } catch { }

$script:iconCache = @{}
function New-DshTrayIcon([int]$Count) {
  if ($script:iconCache.ContainsKey($Count)) { return $script:iconCache[$Count] }
  $bmp = New-Object System.Drawing.Bitmap 32, 32
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
  $fill = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 16, 163, 127))
  $g.FillRectangle($fill, 4, 4, 24, 24)
  $g.FillEllipse([System.Drawing.Brushes]::White, 12, 12, 8, 8)
  if ($Count -gt 0) {
    $badge = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 220, 53, 69))
    $g.FillEllipse($badge, 16, 0, 16, 16)
    $text = if ($Count -gt 99) { '99+' } else { [string]$Count }
    $font = New-Object System.Drawing.Font 'Segoe UI', 7, ([System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($text, $font, [System.Drawing.Brushes]::White, (New-Object System.Drawing.RectangleF 16, 0, 16, 16), $sf)
    $font.Dispose()
    $sf.Dispose()
    $badge.Dispose()
  }
  $g.Dispose()
  $fill.Dispose()
  $icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
  $script:iconCache[$Count] = $icon
  return $icon
}

$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Visible = $true
$notify.Icon = (New-DshTrayIcon 0)
$menu = New-Object System.Windows.Forms.ContextMenuStrip
$openItem = New-Object System.Windows.Forms.ToolStripMenuItem
$openItem.Text = '打开 DSH'
$openItem.Add_Click({ Start-Process $url })
$exitItem = New-Object System.Windows.Forms.ToolStripMenuItem
$exitItem.Text = '退出托盘'
$exitItem.Add_Click({ $notify.Visible = $false; [System.Windows.Forms.Application]::Exit() })
[void]$menu.Items.Add($openItem)
[void]$menu.Items.Add($exitItem)
$notify.ContextMenuStrip = $menu

$script:lastCount = -1
$script:Refresh = {
  try {
    $state = ([IO.File]::ReadAllText($stateFile, [Text.Encoding]::UTF8) | ConvertFrom-Json)
    $pending = 0
    if ($state.pending) { $pending = [int]$state.pending }
    $completed = @($state.completed)
    $total = $pending + $completed.Count
    if ($total -ne $script:lastCount) {
      $script:lastCount = $total
      $notify.Icon = (New-DshTrayIcon $total)
      $tip = "DSH 待处理 $pending，未读 $($completed.Count)"
      if ($tip.Length -gt 120) { $tip = $tip.Substring(0, 120) }
      $notify.Text = $tip
    }
  } catch { }
}

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 1500
$timer.Add_Tick($script:Refresh)
$timer.Start()
& $script:Refresh

$script:lastClick = [DateTime]::MinValue
$notify.Add_Click({
  $now = Get-Date
  if (($now - $script:lastClick).TotalMilliseconds -lt 400) { return }
  $script:lastClick = $now
  try {
    $state = ([IO.File]::ReadAllText($stateFile, [Text.Encoding]::UTF8) | ConvertFrom-Json)
    $state.completed = @()
    [IO.File]::WriteAllText($stateFile, ($state | ConvertTo-Json -Depth 5), (New-Object Text.UTF8Encoding($false)))
  } catch { }
  Start-Process $url
})

$watch = New-Object System.Windows.Forms.Timer
$watch.Interval = 5000
$watch.Add_Tick({
  $alive = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  if (-not $alive) {
    $notify.Visible = $false
    [System.Windows.Forms.Application]::Exit()
  }
})
$watch.Start()
[System.Windows.Forms.Application]::Run()

foreach ($icon in $script:iconCache.Values) {
  try { [DshNotifyIcon]::DestroyIcon($icon.Handle) | Out-Null; $icon.Dispose() } catch { }
}
try { Remove-Item -LiteralPath $lockFile -Force -ErrorAction SilentlyContinue } catch { }
if ($notify) { $notify.Dispose() }