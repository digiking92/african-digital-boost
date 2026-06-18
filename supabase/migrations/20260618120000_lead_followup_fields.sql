-- Lead follow-up fields for sales dashboard
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS follow_up_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS report_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS report_url text;

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_follow_up_status_idx ON public.leads (follow_up_status);

COMMENT ON COLUMN public.leads.follow_up_status IS 'new | contacted | interested | booked | closed | no_response';
