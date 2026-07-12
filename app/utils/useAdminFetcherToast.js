import { useEffect, useRef } from "react";

export function useAdminFetcherToast(fetcher) {
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data || fetcher.data.ok !== false) {
      return;
    }

    const message = fetcher.data.message || "Something went wrong.";
    if (lastMessageRef.current === message) {
      return;
    }

    lastMessageRef.current = message;
    shopify.toast.show(message, { isError: true });
  }, [fetcher.data, fetcher.state]);
}
