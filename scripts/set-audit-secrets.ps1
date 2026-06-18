# Run AFTER: npx supabase link --project-ref YOUR_PROJECT_REF
# Replace the placeholder values below, then run:
#   powershell -ExecutionPolicy Bypass -File .\scripts\set-audit-secrets.ps1

$secrets = @{
  SERPER_API_KEY = "PASTE_SERPER_API_KEY_HERE"
  GROQ_API_KEY   = "PASTE_GROQ_API_KEY_HERE"
}

foreach ($entry in $secrets.GetEnumerator()) {
  if ($entry.Value -like "PASTE_*") {
    Write-Error "Update placeholder value for $($entry.Key) before running this script."
    exit 1
  }
  npx supabase secrets set "$($entry.Key)=$($entry.Value)"
}

Write-Host "Secrets set. Deploy the function with:"
Write-Host "npx supabase functions deploy run-audit"
