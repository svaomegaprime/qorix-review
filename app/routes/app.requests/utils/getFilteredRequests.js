export function getFilteredRequests(requests, search, dateRange) {
  const normalizedSearch = search.trim().toLowerCase();

  return requests.filter((request) => {
    const matchesDate = isWithinDateRange(request.createdAt, dateRange);
    const matchesSearch =
      !normalizedSearch ||
      [
        request.fullName,
        request.email,
        request.orderId,
        request.reviewCheckStatus,
        ...(request.products?.map((product) => product.title) ?? []),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        );

    return matchesDate && matchesSearch;
  });
}

function isWithinDateRange(createdAt, dateRange) {
  if (!dateRange || dateRange === "all") {
    return true;
  }

  const days = Number(dateRange.replace("days", ""));

  if (!Number.isFinite(days)) {
    return true;
  }

  const requestDate = new Date(createdAt).getTime();

  if (Number.isNaN(requestDate)) {
    return false;
  }

  const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
  return requestDate >= cutoffDate;
}
