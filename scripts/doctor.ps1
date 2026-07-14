$ErrorActionPreference = "Continue"

Write-Host "SproutScout developer prerequisite check" -ForegroundColor Cyan
Write-Host "This script does not install or modify anything.`n"

$failed = $false

function Check-Command {
  param(
    [Parameter(Mandatory=$true)][string]$Name,
    [string]$VersionArgs = "--version",
    [bool]$Required = $true
  )

  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if (-not $cmd) {
    if ($Required) {
      Write-Host "[MISSING] $Name" -ForegroundColor Red
      $script:failed = $true
    } else {
      Write-Host "[OPTIONAL MISSING] $Name" -ForegroundColor Yellow
    }
    return
  }

  try {
    $parts = $VersionArgs -split ' '
    $version = & $Name $parts 2>&1 | Select-Object -First 1
    Write-Host "[OK] $Name - $version" -ForegroundColor Green
  } catch {
    Write-Host "[FOUND] $Name at $($cmd.Source), version check failed" -ForegroundColor Yellow
  }
}

Check-Command -Name "git"
Check-Command -Name "node"
Check-Command -Name "npm"
Check-Command -Name "npx"
Check-Command -Name "docker" -Required $false
Check-Command -Name "adb" -Required $false
Check-Command -Name "eas" -Required $false

Write-Host "`nAdditional checks" -ForegroundColor Cyan
Write-Host "OS: $([System.Environment]::OSVersion.VersionString)"
Write-Host "PowerShell: $($PSVersionTable.PSVersion)"

if (Get-Command docker -ErrorAction SilentlyContinue) {
  docker info *> $null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Docker engine is running" -ForegroundColor Green
  } else {
    Write-Host "[WARNING] Docker command exists but engine is not running" -ForegroundColor Yellow
  }
}

Write-Host "`nManual items to record in PROJECT_STATE.md:" -ForegroundColor Cyan
Write-Host "- Primary physical iOS or Android test device"
Write-Host "- GitHub repository status"
Write-Host "- Expo account status"
Write-Host "- Whether WSL will be used for local Supabase"

if ($failed) {
  Write-Host "`nRequired prerequisites are missing. Record the output before installing tools." -ForegroundColor Red
  exit 1
}

Write-Host "`nRequired command checks passed." -ForegroundColor Green
exit 0
