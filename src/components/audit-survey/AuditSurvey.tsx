import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SurveyProgress } from "./SurveyProgress";
import { isValidEmail } from "@/lib/emailValidation";

const professions = [
  "Business Coach", "Life Coach", "Lawyer", "Doctor", "Consultant",
  "HR Professional", "Financial Advisor", "Therapist / Counsellor",
  "Real Estate Agent", "Marketing Professional", "Other",
];

const countries = [
  "Algeria",
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Cameroon",
  "Côte d'Ivoire",
  "Egypt",
  "Ethiopia",
  "Ghana",
  "Kenya",
  "Mauritius",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Nigeria",
  "Rwanda",
  "Senegal",
  "South Africa",
  "Tanzania",
  "Tunisia",
  "Uganda",
  "Zambia",
  "Zimbabwe",
  "Other African Country",
  "Outside Africa",
];

const TOTAL_STEPS = 7;

type FormData = {
  full_name: string;
  email: string;
  profession: string;
  country: string;
  city: string;
  social_handle: string;
  instagram_handle: string;
  tiktok_handle: string;
  x_handle: string;
  linkedin_handle: string;
};

const emptyForm: FormData = {
  full_name: "",
  email: "",
  profession: "",
  country: "",
  city: "",
  social_handle: "",
  instagram_handle: "",
  tiktok_handle: "",
  x_handle: "",
  linkedin_handle: "",
};

const SurveyCta = ({
  onClick,
  disabled,
  label,
  type = "button",
}: {
  onClick?: () => void;
  disabled?: boolean;
  label: string;
  type?: "button" | "submit";
}) => (
  <Button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="w-full max-w-md mx-auto brand-cta text-base py-6 rounded-xl shadow-brand transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
  >
    {label} <ChevronRight className="ml-1 h-5 w-5 inline" />
  </Button>
);

export const AuditSurvey = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"hero" | "survey">("hero");
  const [step, setStep] = useState(0);
  const [showMoreHandles, setShowMoreHandles] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  const firstName = formData.full_name.trim().split(" ")[0] || "friend";
  const set = (patch: Partial<FormData>) => setFormData((prev) => ({ ...prev, ...patch }));

  const canAdvance = [
    !!formData.full_name.trim(),
    isValidEmail(formData.email),
    !!formData.profession,
    !!formData.country,
    !!formData.city.trim(),
    true,
    true,
  ][step];

  const goNext = () => {
    if (step === 1 && !isValidEmail(formData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    if (!canAdvance) return;
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 0) setStep((s) => s - 1);
    else setPhase("hero");
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    sessionStorage.setItem("auditFormData", JSON.stringify(formData));
    navigate("/scanning");
  };

  const handleStepKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canAdvance && step < TOTAL_STEPS - 1) {
      e.preventDefault();
      goNext();
    }
  };

  if (phase === "hero") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 relative overflow-hidden min-h-[calc(100vh-3.5rem)] brand-hero-bg">
        <div className="pointer-events-none absolute inset-0 brand-hero-overlay" />

        <div className="relative z-10 w-full max-w-2xl mx-auto text-center space-y-8 animate-fade-in-up">
          <p className="text-sm md:text-base text-white/80 tracking-wide uppercase">
            Experience what Google really thinks of you
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.1] uppercase drop-shadow-lg">
            Who&apos;s Winning When<br />
            Clients Search<br />
            <span className="text-[#4ADE80]">Your Name?</span>
          </h1>

          <p className="text-lg md:text-xl text-white/85 max-w-lg mx-auto leading-relaxed">
            <span className="text-white font-semibold">You</span>
            {" want to know "}
            <span className="text-[#4ADE80] italic">
              if you&apos;re invisible online and what to fix.
            </span>
          </p>

          <p className="text-sm text-white/70">
            We got you. It all begins with a few quick questions below.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <span className="text-2xl text-[#4ADE80] hidden sm:inline rotate-[-12deg]">↘</span>
            <SurveyCta
              label="Get started here"
              onClick={() => {
                setPhase("survey");
                setStep(0);
              }}
            />
            <span className="text-2xl text-[#4ADE80] hidden sm:inline rotate-[12deg]">↙</span>
          </div>

          <p className="text-xs text-white/60 pt-4">
            Free audit · Results in under 60 seconds · Report sent to your inbox
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-4 py-10 min-h-[calc(100vh-4rem)]"
      onKeyDown={handleStepKeyDown}
    >
      <div className="w-full max-w-lg mx-auto space-y-8">
        <SurveyProgress current={step} total={TOTAL_STEPS} />

        <div key={step} className="space-y-6 text-center animate-fade-in-up">
          {step === 0 && (
            <>
              <p className="text-lg md:text-xl text-white leading-relaxed">
                Okay, this will be quick and painless{" "}
                <span className="text-[#4ADE80]">(pinky promise)</span>.
                <br />
                <br />
                But before we start, we don&apos;t wanna be rude...
                <br />
                <span className="font-bold text-white">So what&apos;s your name?</span>
              </p>
              <Input
                autoFocus
                placeholder="Please enter your full name"
                maxLength={100}
                value={formData.full_name}
                onChange={(e) => set({ full_name: e.target.value })}
                className="max-w-md mx-auto h-14 text-base audit-input text-center"
              />
            </>
          )}

          {step === 1 && (
            <>
              <p className="text-lg md:text-xl text-white leading-relaxed">
                Awesome, <span className="text-[#4ADE80] font-semibold">{firstName}</span>!
                <br />
                <br />
                I&apos;ll send your full report and action plan to your inbox.
                <br />
                <span className="font-bold text-white">What&apos;s your best email address?</span>
              </p>
              <Input
                autoFocus
                type="email"
                placeholder="Please enter your email address"
                maxLength={254}
                value={formData.email}
                onChange={(e) => {
                  set({ email: e.target.value });
                  if (emailError) setEmailError("");
                }}
                className="max-w-md mx-auto h-14 text-base audit-input text-center"
              />
              {emailError && (
                <p className="text-sm text-red-400">{emailError}</p>
              )}
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                No spam. One report email now, plus optional follow-ups to help you improve your score.
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-lg md:text-xl text-white leading-relaxed">
                Thanks, {firstName}.
                <br />
                <br />
                <span className="font-bold">What do you do for a living?</span>
                <br />
                <span className="text-sm text-white/65 mt-2 block">
                  We&apos;ll search how Google sees professionals like you.
                </span>
              </p>
              <Select value={formData.profession} onValueChange={(v) => set({ profession: v })}>
                <SelectTrigger className="max-w-md mx-auto h-14 text-base audit-input">
                  <SelectValue placeholder="Select your profession" />
                </SelectTrigger>
                <SelectContent className="bg-[#152536] border-[#4ADE80]/25 text-white max-h-60">
                  {professions.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-lg md:text-xl text-white leading-relaxed">
                {firstName}, <span className="font-bold">which country are you building your brand in?</span>
                <br />
                <span className="text-sm text-white/65 mt-2 block">
                  Your market changes who you&apos;re really competing against.
                </span>
              </p>
              <Select value={formData.country} onValueChange={(v) => set({ country: v })}>
                <SelectTrigger className="max-w-md mx-auto h-14 text-base audit-input">
                  <SelectValue placeholder="Select your country" />
                </SelectTrigger>
                <SelectContent className="bg-[#152536] border-[#4ADE80]/25 text-white max-h-60">
                  {countries.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {step === 4 && (
            <>
              <p className="text-lg md:text-xl text-white leading-relaxed">
                Almost there, {firstName}. <span className="font-bold">Which city are you based in?</span>
                <br />
                <span className="text-sm text-white/65 mt-2 block">
                  We&apos;ll benchmark you against the top professionals showing up in {formData.country || "your country"}.
                </span>
              </p>
              <Input
                autoFocus
                placeholder="e.g. Lagos, Nairobi, Accra"
                maxLength={100}
                value={formData.city}
                onChange={(e) => set({ city: e.target.value })}
                className="max-w-md mx-auto h-14 text-base audit-input text-center"
              />
            </>
          )}

          {step === 5 && (
            <>
              <p className="text-lg md:text-xl text-white leading-relaxed">
                {firstName}, <span className="font-bold">got a social handle?</span>
                <br />
                <span className="text-sm text-white/65 mt-2 block">
                  Optional, but this is where we often find hidden visibility gaps Google won&apos;t tell you about.
                </span>
              </p>
              <Input
                placeholder="e.g. @yourhandle"
                maxLength={80}
                value={formData.social_handle}
                onChange={(e) => set({ social_handle: e.target.value })}
                className="max-w-md mx-auto h-14 text-base audit-input text-center"
              />
              <button
                type="button"
                onClick={() => setShowMoreHandles(!showMoreHandles)}
                className="flex items-center gap-1 text-sm text-[#4ADE80] hover:underline mx-auto"
              >
                {showMoreHandles ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Different handle per platform?
              </button>
              {showMoreHandles && (
                <div className="space-y-3 text-left max-w-md mx-auto">
                  {[
                    { id: "instagram_handle" as const, label: "Instagram", placeholder: "yourhandle" },
                    { id: "tiktok_handle" as const, label: "TikTok", placeholder: "yourhandle" },
                    { id: "x_handle" as const, label: "X (Twitter)", placeholder: "yourhandle" },
                    { id: "linkedin_handle" as const, label: "LinkedIn", placeholder: "your-handle" },
                  ].map((field) => (
                    <Input
                      key={field.id}
                      placeholder={`${field.label}: ${field.placeholder}`}
                      maxLength={80}
                      value={formData[field.id]}
                      onChange={(e) => set({ [field.id]: e.target.value })}
                      className="h-11 audit-input"
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {step === 6 && (
            <>
              <p className="text-lg md:text-xl text-white leading-relaxed">
                {firstName}, we&apos;re about to search Google <span className="text-[#4ADE80] font-semibold">live</span> for your name.
                <br />
                <br />
                <span className="font-bold text-2xl md:text-3xl block mt-2">
                  You&apos;ll see your score, who&apos;s beating you, and exactly what to fix.
                </span>
              </p>
              <ul className="text-sm text-white/65 space-y-2 text-left max-w-md mx-auto pt-2">
                <li>✓ Your Google visibility score out of 100</li>
                <li>✓ Named competitors in {formData.city || "your city"}</li>
                <li>✓ A personalised action plan, not generic advice</li>
                <li>✓ Full report emailed to {formData.email || "you"}</li>
              </ul>
            </>
          )}
        </div>

        <div className="space-y-3 max-w-md mx-auto">
          {step < TOTAL_STEPS - 1 ? (
            <>
              <SurveyCta
                label="Next"
                onClick={goNext}
                disabled={!canAdvance}
              />
              {step === 5 && (
                <button
                  type="button"
                  onClick={goNext}
                  className="w-full text-sm text-white/55 hover:text-white transition-colors py-2"
                >
                  Skip for now →
                </button>
              )}
            </>
          ) : (
            <SurveyCta
              label={isSubmitting ? "Scanning..." : "Reveal my score"}
              onClick={handleSubmit}
              disabled={isSubmitting}
            />
          )}

          <button
            type="button"
            onClick={goBack}
            className="w-full text-sm text-white/55 hover:text-white transition-colors py-2"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
};
