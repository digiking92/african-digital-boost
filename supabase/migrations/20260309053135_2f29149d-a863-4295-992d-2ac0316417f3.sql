
-- Drop the still-permissive SELECT policy
DROP POLICY IF EXISTS "Read audit by share token only" ON public.audits;

-- Drop the unused function
DROP FUNCTION IF EXISTS public.current_share_token();

-- Create an RPC function to fetch audit by share_token (security definer bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_audit_by_share_token(p_share_token text)
RETURNS SETOF public.audits
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.audits WHERE share_token = p_share_token LIMIT 1;
$$;
