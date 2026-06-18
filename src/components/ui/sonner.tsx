import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    theme="dark"
    className="toaster group"
    toastOptions={{
      classNames: {
        toast:
          "group toast group-[.toaster]:bg-[#152536] group-[.toaster]:text-white group-[.toaster]:border-[#4ADE80]/25 group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-white/70",
        actionButton: "group-[.toast]:bg-[#4ADE80] group-[.toast]:text-[#0D1B2A]",
        cancelButton: "group-[.toast]:bg-[#1a2d42] group-[.toast]:text-white/70",
      },
    }}
    {...props}
  />
);

export { Toaster, toast };
