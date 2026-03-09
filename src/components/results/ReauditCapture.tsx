import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReauditCaptureProps {
  auditId: string;
}

export const ReauditCapture = ({ auditId }: ReauditCaptureProps) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      // Save to leads
      await supabase.from("leads").insert({
        audit_id: auditId,
        email,
        source: "reaudit",
      });

      // Schedule reaudit
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 30);

      await supabase.from("reaudit_queue").insert({
        audit_id: auditId,
        email,
        scheduled_at: scheduledAt.toISOString(),
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Failed to save email:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-card border border-primary/30 rounded-xl p-6 text-center space-y-2">
        <p className="text-primary font-semibold">✓ You're all set!</p>
        <p className="text-sm text-muted-foreground">We'll email you your updated score in 30 days.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground">Track Your Progress</h3>
        <p className="text-sm text-muted-foreground">
          We'll re-scan your Google presence in 30 days and email you your new score — free.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
          required
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-gold-glow whitespace-nowrap"
        >
          {loading ? "..." : "Send Me My 30-Day Re-Audit"}
        </Button>
      </form>
      <p className="text-xs text-muted-foreground">No spam. One email in 30 days with your updated score.</p>
    </div>
  );
};
