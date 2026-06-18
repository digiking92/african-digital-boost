import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  transparentHeader?: boolean;
}

export const BrandMark = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <img
      src="/auditme-logo.png"
      alt="AuditME"
      className="h-8 w-auto object-contain"
      width={120}
      height={32}
    />
  </div>
);

export const PageShell = ({ children, className = "", transparentHeader = false }: PageShellProps) => (
  <div className={`min-h-screen flex flex-col bg-[#0D1B2A] text-white ${className}`}>
    <header
      className={`sticky top-0 z-50 ${
        transparentHeader
          ? "bg-[#0D1B2A]/60 backdrop-blur-sm border-b border-white/10"
          : "bg-[#0D1B2A] border-b border-[#4ADE80]/20"
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 py-3">
        <BrandMark />
      </div>
    </header>
    {children}
  </div>
);
