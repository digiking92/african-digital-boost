import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { icon: "🔍", text: "Searching Google for your name..." },
  { icon: "📊", text: "Analysing your search result quality..." },
  { icon: "🔗", text: "Checking LinkedIn and social profiles..." },
  { icon: "🗺️", text: "Looking for Google Business Profile..." },
  { icon: "📰", text: "Scanning African media mentions..." },
  { icon: "🏆", text: "Benchmarking against competitors in your city..." },
  { icon: "🤖", text: "Generating your personalised action plan..." },
];

const Scanning = () => {
  const navigate = useNavigate();
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev >= steps.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const raw = sessionStorage.getItem("auditFormData");
    if (!raw) {
      navigate("/");
      return;
    }

    const formData = JSON.parse(raw);

    const runAudit = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("run-audit", {
          body: formData,
        });

        if (fnError) throw fnError;
        if (!data?.share_token) throw new Error("No share token returned");

        sessionStorage.removeItem("auditFormData");
        navigate(`/results/${data.share_token}`);
      } catch (err: any) {
        console.error("Audit error:", err);
        setError("Something went wrong. Please try again.");
      }
    };

    runAudit();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md mx-auto space-y-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground animate-pulse-gold">
          Scanning your Google presence...
        </h2>

        <div className="space-y-4 text-left">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-500 ${
                i < visibleSteps ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="text-2xl">{step.icon}</span>
              <span className={`text-sm ${i < visibleSteps - 1 ? "text-primary" : "text-muted-foreground"}`}>
                {step.text}
              </span>
              {i < visibleSteps - 1 && <span className="ml-auto text-primary text-xs">✓</span>}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-fill-bar" />
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive">
            {error}
            <button
              onClick={() => navigate("/")}
              className="block mt-2 text-primary underline"
            >
              Go back and try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scanning;
