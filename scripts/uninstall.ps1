param(
  [string]$ProfileName = 'web'
)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
dsh plugin --profile $ProfileName remove @michengai/dsh-notify
Write-Host '卸载完成。请重启 DSH。配置会保留在 settings 中。'