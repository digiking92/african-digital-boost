-- Aggregate views can leak business metrics; not needed for the public app.
REVOKE SELECT ON public.audit_summary FROM anon, authenticated;
REVOKE SELECT ON public.leads_summary FROM anon, authenticated;
