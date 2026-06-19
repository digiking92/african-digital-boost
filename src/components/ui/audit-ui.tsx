import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { sanitizeExternalUrl } from "@/lib/safeUrl";

/** Shared audit report UI: navy + green only, high contrast. */
export const AuditSection = ({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "verified" | "highlight";
}) => (
  <section
    className={cn(
      "rounded-2xl border p-6 md:p-7 space-y-4",
      variant === "verified" && "border-[#4ADE80]/35 bg-[#152536]",
      variant === "highlight" && "border-[#4ADE80]/50 bg-[#1a3048]",
      variant === "default" && "border-[#4ADE80]/20 bg-[#152536]",
      className,
    )}
  >
    {children}
  </section>
);

export const AuditBadge = ({
  children,
  variant = "green",
}: {
  children: ReactNode;
  variant?: "green" | "outline";
}) => (
  <span
    className={cn(
      "inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded",
      variant === "green" && "bg-[#4ADE80] text-[#0D1B2A]",
      variant === "outline" && "border border-[#4ADE80]/50 text-[#4ADE80] bg-[#4ADE80]/10",
    )}
  >
    {children}
  </span>
);

export const AuditTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{children}</h3>
);

export const AuditSubtitle = ({ children }: { children: ReactNode }) => (
  <p className="text-sm text-white/75 leading-relaxed">{children}</p>
);

export const AuditLabel = ({ children }: { children: ReactNode }) => (
  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#4ADE80]/90">{children}</p>
);

export const AuditBody = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("text-sm text-white/90 leading-relaxed", className)}>{children}</p>
);

export const AuditMuted = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("text-sm text-white/65 leading-relaxed", className)}>{children}</p>
);

export const AuditInnerCard = ({
  children,
  className,
  highlight,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}) => (
  <div
    className={cn(
      "rounded-xl border p-4 transition-colors",
      highlight
        ? "border-[#4ADE80]/45 bg-[#1a3048]"
        : "border-[#4ADE80]/15 bg-[#0D1B2A]/60 hover:border-[#4ADE80]/35",
      className,
    )}
  >
    {children}
  </div>
);

export const AuditLink = ({ href, children }: { href: string; children: ReactNode }) => {
  const safeHref = sanitizeExternalUrl(href);
  if (!safeHref) {
    return <span className="text-sm text-white/55 break-all">{children}</span>;
  }
  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-[#4ADE80] font-medium hover:underline underline-offset-2 break-all"
    >
      {children}
    </a>
  );
};
