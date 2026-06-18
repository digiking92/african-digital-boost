# Deploy AuditME backend (run as project owner: christopheruvw@gmail.com)
# 1. Copy .env.supabase.example to .env.supabase and fill in values
# 2. npx supabase login
# 3. powershell -ExecutionPolicy Bypass -File .\scripts\deploy-supabase.ps1

$ErrorActionPreference = "Stop"
$ProjectRef = "azsubeqomrvigujzhpyf"
$Root = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $Root ".env.supabase"

if (-not (Test-Path $EnvFile)) {
  Write-Error "Missing $EnvFile — copy .env.supabase.example and fill in your values."
}

Get-Content $EnvFile | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim().Trim('"')
    if ($value) { Set-Item -Path "env:$name" -Value $value }
  }
}

$required = @("SERPER_API_KEY", "GROQ_API_KEY", "ZEPTOMAIL_API_KEY", "ZEPTOMAIL_FROM_EMAIL", "SITE_URL", "ADMIN_DASHBOARD_PASSWORD")
foreach ($key in $required) {
  if (-not (Get-Item "env:$key" -ErrorAction SilentlyContinue)) {
    Write-Error "Missing $key in .env.supabase"
  }
}

Write-Host "Linking project $ProjectRef..."
npx supabase link --project-ref $ProjectRef

Write-Host "Pushing database migrations..."
npx supabase db push --linked --yes

Write-Host "Setting edge function secrets..."
foreach ($key in @("SERPER_API_KEY", "GROQ_API_KEY", "ZEPTOMAIL_API_KEY", "ZEPTOMAIL_FROM_EMAIL", "ZEPTOMAIL_FROM_NAME", "SITE_URL", "ADMIN_DASHBOARD_PASSWORD")) {
  $val = (Get-Item "env:$key" -ErrorAction SilentlyContinue).Value
  if ($val) {
    npx supabase secrets set "${key}=$val" --project-ref $ProjectRef
  }
}

Write-Host "Deploying edge functions..."
npx supabase functions deploy run-audit --project-ref $ProjectRef
npx supabase functions deploy admin-dashboard --project-ref $ProjectRef

Write-Host "Done. Admin dashboard: /admin"
