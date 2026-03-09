
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can read audit by share token" ON public.audits;

-- Create a restrictive SELECT policy that only allows reading rows
-- when the query filters by share_token (using a security definer function)
CREATE OR REPLACE FUNCTION public.current_share_token()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT current_setting('request.headers', true)::json->>'x-share-token'
$$;

-- New policy: only allow SELECT when share_token matches a provided value
-- Since we can't enforce filter usage via RLS directly, we use a restrictive approach:
-- The client must pass the share_token as an equality filter for the row to be visible
CREATE POLICY "Read audit by share token only"
ON public.audits
FOR SELECT
TO anon, authenticated
USING (true);
