import { PageShell } from "@/components/PageShell";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invokeRunAudit, resetAuditRequestLock, shouldStartAuditRequest } from "@/lib/runAudit";

const steps = [
  { icon: "🔍", text: "Searching Google for your name..." },
  { icon: "📱", text: "Checking your social profiles..." },
  { icon: "📊", text: "Analysing how you're positioned online..." },
  { icon: "🏆", text: "Benchmarking against competitors in your city..." },
  { icon: "🤖", text: "Building your personalised visibility plan..." },
];

const Scanning = () => {
  const navigate = useNavigate();
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
    if (!shouldStartAuditRequest()) return;

    const raw = sessionStorage.getItem("auditFormData");
    if (!raw) {
      resetAuditRequestLock();
      navigate("/");
      return;
    }

    const formData = JSON.parse(raw);

    const runAudit = async () => {
      try {
        const response = await invokeRunAudit(formData);

        if (response.error) {
          throw new Error(response.error);
        }
        if (!response.share_token) {
          throw new Error("No share token returned from audit.");
        }

        sessionStorage.removeItem("auditFormData");
        navigate(`/results/${response.share_token}`);
      } catch (err: unknown) {
        console.error("Audit error:", err);
        resetAuditRequestLock();
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setError(message);
      }
    };

    runAudit();
  }, [navigate]);

  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mx-auto space-y-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white animate-pulse-brand">
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
                <span className={`text-sm ${i < visibleSteps - 1 ? "text-[#4ADE80]" : "text-white/65"}`}>
                  {step.text}
                </span>
                {i < visibleSteps - 1 && <span className="ml-auto text-[#4ADE80] text-xs">✓</span>}
              </div>
            ))}
          </div>

          <div className="w-full h-1.5 bg-[#1a2d42] rounded-full overflow-hidden">
            <div className="h-full bg-[#4ADE80] rounded-full animate-fill-bar" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-300 text-left">
              {error}
              <button
                type="button"
                onClick={() => {
                  resetAuditRequestLock();
                  navigate("/");
                }}
                className="block mt-2 text-[#4ADE80] underline"
              >
                Go back and try again
              </button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default Scanning;
