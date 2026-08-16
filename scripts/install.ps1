param(
  [string]$ProfileName = 'web'
)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location -LiteralPath $PSScriptRoot\..
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
dsh plugin --profile $ProfileName add .
Write-Host '安装完成。请重启 DSH 后再打开设置 → 通知。'