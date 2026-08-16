param(
  [string]$ProfileName = 'web'
)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
& "$PSScriptRoot\scripts\uninstall.ps1" -ProfileName $ProfileName