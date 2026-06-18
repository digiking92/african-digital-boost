# Run AFTER: npx supabase link --project-ref azsubeqomrvigujzhpyf
# Replace the placeholder values below, then run:
#   powershell -ExecutionPolicy Bypass -File .\scripts\set-audit-secrets.ps1

$secrets = @{
  SERPER_API_KEY           = "PASTE_SERPER_API_KEY_HERE"
  GROQ_API_KEY             = "PASTE_GROQ_API_KEY_HERE"
  ZEPTOMAIL_API_KEY        = "PASTE_ZEPTOMAIL_SEND_MAIL_TOKEN_HERE"
  ZEPTOMAIL_FROM_EMAIL     = "reports@yourdomain.com"
  ZEPTOMAIL_FROM_NAME      = "AuditME"
  SITE_URL                 = "https://your-auditme-domain.com"
  ADMIN_DASHBOARD_PASSWORD = "PASTE_STRONG_ADMIN_PASSWORD_HERE"
}

foreach ($entry in $secrets.GetEnumerator()) {
  if ($entry.Value -like "PASTE_*") {
    Write-Error "Update placeholder value for $($entry.Key) before running this script."
    exit 1
  }
  npx supabase secrets set "$($entry.Key)=$($entry.Value)" --project-ref azsubeqomrvigujzhpyf
}

Write-Host "Secrets set. Deploy functions with:"
Write-Host "npx supabase functions deploy run-audit --project-ref azsubeqomrvigujzhpyf"
Write-Host "npx supabase functions deploy admin-dashboard --project-ref azsubeqomrvigujzhpyf"
Write-Host "Apply migration: npx supabase db push --project-ref azsubeqomrvigujzhpyf"
