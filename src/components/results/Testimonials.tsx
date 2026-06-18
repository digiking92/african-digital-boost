import { AuditInnerCard, AuditMuted, AuditTitle } from "@/components/ui/audit-ui";

const testimonials = [
  {
    name: "Chidi Eze",
    profession: "Business Coach, Lagos",
    scoreBefore: 22,
    scoreAfter: 71,
    quote: "Within 6 weeks of working with the team, three clients found me on Google and booked calls. I'd been invisible for 4 years.",
  },
  {
    name: "Amina Kamau",
    profession: "HR Consultant, Nairobi",
    scoreBefore: 31,
    scoreAfter: 64,
    quote: "I thought LinkedIn was enough. It wasn't. They showed me what I was missing and fixed it fast.",
  },
];

export const Testimonials = () => (
  <div className="space-y-4">
    <AuditTitle>Professionals We&apos;ve Helped</AuditTitle>
    <div className="grid gap-4">
      {testimonials.map((t, i) => (
        <AuditInnerCard key={i} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">{t.name}</p>
              <p className="text-xs text-white/55">{t.profession}</p>
            </div>
            <div className="flex items-center gap-2 text-xs shrink-0">
              <span className="bg-white/10 text-white/70 px-2 py-0.5 rounded-full">{t.scoreBefore}</span>
              <span className="text-white/40">→</span>
              <span className="bg-[#4ADE80]/20 text-[#4ADE80] px-2 py-0.5 rounded-full font-semibold">{t.scoreAfter}</span>
            </div>
          </div>
          <AuditMuted className="italic">&quot;{t.quote}&quot;</AuditMuted>
        </AuditInnerCard>
      ))}
    </div>
  </div>
);
