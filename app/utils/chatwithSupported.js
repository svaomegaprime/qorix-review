export function openTawkChat() {
  if (typeof window === "undefined") return;

  if (window.Tawk_API?.showWidget) {
    window.Tawk_API.showWidget();
  }

  if (window.Tawk_API?.maximize) {
    window.Tawk_API.maximize();
  }
}