const CALENDLY_POPUP_URL =
  "https://calendly.com/frohitedigitals/30min?background_color=0d1b2a&text_color=ffffff&primary_color=4ade80";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

export function openCalendlyBooking() {
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: CALENDLY_POPUP_URL });
    return;
  }
  window.open(CALENDLY_POPUP_URL, "_blank", "noopener,noreferrer");
}
