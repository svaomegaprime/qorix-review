import { useState } from "react";

/**
 * Keep page bounds and slicing consistent while leaving pagination UI local.
 * @param {Array<any>} items
 * @param {number} pageSize
 */
export function usePagination(items, pageSize) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const setPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return {
    currentPage: safeCurrentPage,
    endIndex,
    items: items.slice(startIndex, endIndex),
    setCurrentPage,
    setPage,
    startIndex,
    totalItems,
    totalPages,
  };
}
