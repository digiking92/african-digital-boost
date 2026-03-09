
-- Drop and recreate views without SECURITY DEFINER

DROP VIEW IF EXISTS public.audit_summary;
CREATE VIEW public.audit_summary AS
SELECT
  date_trunc('day', created_at) AS day,
  count(*) AS total_audits,
  round(avg(score), 1) AS avg_score,
  count(email) AS emails_captured,
  profession,
  country,
  tier
FROM public.audits
GROUP BY date_trunc('day', created_at), profession, country, tier;

DROP VIEW IF EXISTS public.leads_summary;
CREATE VIEW public.leads_summary AS
SELECT
  country,
  offer_interest,
  max(created_at) AS latest_lead,
  round(avg(score), 1) AS avg_score,
  count(*) AS total_leads
FROM public.leads
GROUP BY country, offer_interest;
