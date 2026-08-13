import { useEffect, useRef } from "react";

const DEFAULT_SAVING_MESSAGE = "Saving changes to database...";

function getDynamicSavingMessage(fetcher, customSavingMessage) {
  if (customSavingMessage && customSavingMessage !== DEFAULT_SAVING_MESSAGE) {
    return customSavingMessage;
  }

  const method = (fetcher.formMethod || "POST").toUpperCase();
  const formData = fetcher.formData;

  // Specific action overrides based on FormData
  if (formData) {
    if (formData.get("isReminderEmail") === "true") {
      return "Sending reminder email...";
    }
    if (formData.get("isRetryEmail") === "true") {
      return "Resending review request...";
    }
    if (formData.get("reviewIds") || formData.get("reviewId")) {
      if (method === "DELETE") return "Deleting review...";
      if (method === "PATCH") return "Updating review status...";
      if (method === "PUT") return "Saving review reply...";
    }
    if (formData.get("status")) {
      return "Updating status...";
    }
  }

  // Detect page / widget context from current location
  if (typeof window !== "undefined" && window.location?.pathname) {
    const path = window.location.pathname.toLowerCase();

    // Widget pages
    if (path.includes("quick-review")) return "Saving Quick Review widget...";
    if (path.includes("trust-bar")) return "Saving Trust Bar widget...";
    if (path.includes("video-stack")) return "Saving Video Stack widget...";
    if (path.includes("quote-loop")) return "Saving Quote Loop widget...";
    if (path.includes("review-reel")) return "Saving Review Reel widget...";
    if (path.includes("review-hub")) return "Saving Review Hub widget...";

    // Settings pages
    if (path.includes("email-settings")) return "Saving email settings...";
    if (path.includes("branding")) return "Saving branding settings...";
    if (path.includes("publishing-moderation"))
      return "Saving moderation settings...";
    if (path.includes("admin-notification"))
      return "Saving notification settings...";
  }

  switch (method) {
    case "DELETE":
      return "Deleting...";
    case "PATCH":
    // case "PUT":
    //   return "Updating changes...";
    case "POST":
    default:
      return "Saving changes...";
  }
}

export function useAdminFetcherToast(
  fetcher,
  {
    savingMessage = DEFAULT_SAVING_MESSAGE,
    successMessage = "Saved successfully!",
  } = {},
) {
  const lastStateRef = useRef(fetcher.state);

  useEffect(() => {
    if (typeof shopify === "undefined" || !shopify.toast) return;

    const prevState = lastStateRef.current;
    const currentState = fetcher.state;

    // Transition from idle to submitting/loading -> show dynamic saving toast
    if (
      prevState === "idle" &&
      (currentState === "submitting" || currentState === "loading")
    ) {
      const activeMessage = getDynamicSavingMessage(fetcher, savingMessage);
      shopify.toast.show(activeMessage);
    }

    // Transition from submitting/loading to idle -> show success or error toast
    if (
      (prevState === "submitting" || prevState === "loading") &&
      currentState === "idle" &&
      fetcher.data
    ) {
      if (fetcher.data.ok === false) {
        const message = fetcher.data.message || "Something went wrong.";
        shopify.toast.show(message, { isError: true });
      } else if (fetcher.data.ok === true) {
        const message = fetcher.data.message || successMessage;
        shopify.toast.show(message);
      }
    }

    lastStateRef.current = currentState;
  }, [
    fetcher.state,
    fetcher.data,
    fetcher.formMethod,
    fetcher.formData,
    savingMessage,
    successMessage,
  ]);
}
