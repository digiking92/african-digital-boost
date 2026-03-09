import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";

const professions = [
  "Business Coach", "Life Coach", "Lawyer", "Doctor", "Consultant",
  "HR Professional", "Financial Advisor", "Therapist / Counsellor",
  "Real Estate Agent", "Marketing Professional", "Other"
];

const countries = [
  "Nigeria", "Kenya", "Ghana", "South Africa", "Egypt", "Ethiopia",
  "Tanzania", "Uganda", "Rwanda", "Senegal", "Other African Country"
];

const Index = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    profession: "",
    country: "",
    city: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = formData.full_name && formData.profession && formData.country && formData.city;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    // Store form data and navigate to scanning
    sessionStorage.setItem("auditFormData", JSON.stringify(formData));
    navigate("/scanning");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg mx-auto text-center space-y-8">
        {/* Hero text */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            Are You <span className="text-primary">Invisible</span> on Google?
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
            Find out exactly how African professionals, clients, and employers see you online — in 60 seconds.
          </p>
        </div>

        {/* Social proof */}
        <p className="text-sm text-primary font-medium">
          Join 2,400+ African professionals who've audited their digital presence
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left bg-card border border-border rounded-xl p-6 shadow-gold">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-foreground">Your Full Name</Label>
            <Input
              id="full_name"
              placeholder="e.g. Amara Okafor"
              maxLength={100}
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Your Profession</Label>
            <Select value={formData.profession} onValueChange={(v) => setFormData({ ...formData, profession: v })}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select your profession" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {professions.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Country</Label>
            <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-foreground">City</Label>
            <Input
              id="city"
              placeholder="e.g. Lagos, Nairobi, Accra"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="w-full bg-primary text-primary-foreground hover:bg-gold-glow text-lg font-bold py-6 rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? "Starting..." : "Run My Free Audit →"}
          </Button>
        </form>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          {["No sign-up required", "100% Free", "Results in under 60 seconds"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
