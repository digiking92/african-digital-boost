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
    <h3 className="text-xl font-bold text-foreground text-center">Professionals We've Helped</h3>
    <div className="grid gap-4">
      {testimonials.map((t, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.profession}</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">{t.scoreBefore}</span>
              <span className="text-muted-foreground">→</span>
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full">{t.scoreAfter}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic">"{t.quote}"</p>
        </div>
      ))}
    </div>
  </div>
);
