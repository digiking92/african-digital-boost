interface SurveyProgressProps {
  current: number;
  total: number;
}

export const SurveyProgress = ({ current, total }: SurveyProgressProps) => (
  <div className="flex items-center justify-center gap-0 w-full max-w-md mx-auto px-2">
    {Array.from({ length: total }, (_, i) => (
      <div key={i} className="flex items-center flex-1 last:flex-none">
        <div
          className={`h-3 w-3 rounded-full shrink-0 transition-colors duration-300 ${
            i <= current ? "bg-[#4ADE80]" : "bg-white/25"
          }`}
        />
        {i < total - 1 && (
          <div
            className={`h-0.5 flex-1 transition-colors duration-300 ${
              i < current ? "bg-[#4ADE80]" : "bg-white/15"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);
