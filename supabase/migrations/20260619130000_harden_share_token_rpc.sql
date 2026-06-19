-- Reject malformed share tokens early (reduces enumeration noise). Keeps 10–24 char legacy + new tokens.
CREATE OR REPLACE FUNCTION public.get_audit_by_share_token(p_share_token text)
RETURNS SETOF public.audits
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.audits
  WHERE share_token = p_share_token
    AND char_length(p_share_token) BETWEEN 10 AND 24
    AND p_share_token ~ '^[a-z0-9]+$'
  LIMIT 1;
$$;
