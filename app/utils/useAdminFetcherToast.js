import { useEffect, useRef } from "react";

export function useAdminFetcherToast(
  fetcher,
  {
    savingMessage = "Saving changes to database...",
    successMessage = "Saved successfully!",
  } = {},
) {
  const lastStateRef = useRef(fetcher.state);

  useEffect(() => {
    if (typeof shopify === "undefined" || !shopify.toast) return;

    const prevState = lastStateRef.current;
    const currentState = fetcher.state;

    // Transition from idle to submitting/loading -> show saving toast
    if (
      prevState === "idle" &&
      (currentState === "submitting" || currentState === "loading")
    ) {
      shopify.toast.show(savingMessage);
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
  }, [fetcher.state, fetcher.data, savingMessage, successMessage]);
}
