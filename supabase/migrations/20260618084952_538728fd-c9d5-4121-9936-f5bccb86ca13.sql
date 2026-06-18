
-- 1. Add explicit restrictive SELECT policy on audits (deny all direct reads; access only via SECURITY DEFINER RPC)
CREATE POLICY "No direct select on audits" ON public.audits FOR SELECT USING (false);

-- 2. Remove public SELECT on share_events (audit_id enumeration risk)
DROP POLICY IF EXISTS "Anyone can read share events" ON public.share_events;

-- 3. Revoke SELECT from anon/authenticated on sensitive tables so they aren't exposed via PostgREST/GraphQL
REVOKE SELECT ON public.audits FROM anon, authenticated;
REVOKE SELECT ON public.leads FROM anon, authenticated;
REVOKE SELECT ON public.share_events FROM anon, authenticated;
REVOKE SELECT ON public.reaudit_queue FROM anon, authenticated;

-- 4. Restrict EXECUTE on the SECURITY DEFINER RPC to anon only (used by public share links); revoke from authenticated/public
REVOKE EXECUTE ON FUNCTION public.get_audit_by_share_token(text) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.get_audit_by_share_token(text) TO anon;
