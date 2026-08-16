param(
  [string]$ProfileName = 'web'
)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
& "$PSScriptRoot\scripts\install.ps1" -ProfileName $ProfileName