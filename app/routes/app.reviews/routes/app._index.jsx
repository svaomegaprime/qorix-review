import Loader from "../../../components/essentials/Loader";
import TabButton from "../../../components/essentials/TabButton";
import CustomSection from "../../../components/essentials/CustomSection";
import ReviewItem from "../../../components/essentials/ReviewItem";
import Text from "../../../components/essentials/elements/Text";
import { useLoaderData, useNavigation, useFetcher } from "react-router";
import { useState, useRef } from "react";
import prisma from "../../../db.server";
import { requireAdminContext } from "../../../services/adminContext.server.js";
import { adminErrorResponse } from "../../../utils/adminError.server";
import { useAdminFetcherToast } from "../../../utils/useAdminFetcherToast";
import {
  deleteReviewWithAttachments,
  updateReviewStatus,
} from "../../../services/reviews.server.js";
import { sendEmail } from "../../../utils/sendEmail";
import { buildReplyEmailData } from "../../../services/emailPayload.server.js";
import { usePagination } from "../../../hooks/usePagination.js";
import { updateProductReviewDefineMetafields } from "../../../utils/updateProductReviewDefineMetafields";
import { authenticate } from "../../../shopify.server";
const REVIEWS_PER_PAGE = 8;
const EXPORT_PREVIEW_LIMIT = 5;

function formatExportValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(" | ");
  }

  return String(value);
}

function escapeCsvValue(value) {
  const normalizedValue = formatExportValue(value).replace(/\r?\n|\r/g, " ");
  return `"${normalizedValue.replace(/"/g, '""')}"`;
}

function formatExportDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}

function buildExportRows(reviewList) {
  return reviewList.map((review) => ({
    id: review.id,
    productTitle: review.productTitle || "",
    productHandle: review.productHandle || "",
    productId: review.productId || "",
    reviewerName: review.reviewerName || "",
    reviewerEmail: review.reviewerEmail || "",
    reviewerPhone: review.reviewerPhone || "",
    rating: review.rating ?? "",
    title: review.title || "",
    body: review.body || "",
    status: review.status || "",
    source: review.source || "",
    isVerified: review.isVerified ? "Yes" : "No",
    attachmentCount: review.attachments?.length ?? 0,
    attachmentUrls:
      review.attachments?.map((attachment) => attachment.url).filter(Boolean) ??
      [],
    reply: review.reply?.body || "",
    createdAt: formatExportDate(review.createdAt),
    updatedAt: formatExportDate(review.updatedAt),
  }));
}

export async function loader({ request }) {
  try {
    const { storeData } = await requireAdminContext(request);
    const reviews = await prisma.review.findMany({
      where: {
        storeId: storeData.id,
      },
      include: {
        attachments: true,
        reply: true,
      },
    });
    const storeSettings = await prisma.storeSettings.findUnique({
      where: {
        storeId: storeData.id,
      },
      include: {
        publishingModeration: true,
      },
    });

    return {
      reviews: reviews,
      storeSettings: storeSettings,
    };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

async function getFilteredReviews(storeId, search, rating, productId) {
  const where = {
    storeId,
  };

  if (search) {
    where.OR = [
      { reviewerName: { contains: search, mode: "insensitive" } },
      { body: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { productTitle: { contains: search, mode: "insensitive" } },
    ];
  }

  if (rating !== "all") {
    where.rating = parseInt(rating, 10);
  }

  if (productId !== "all") {
    where.productId = productId;
  }

  return await prisma.review.findMany({
    where,
    include: {
      attachments: true,
      reply: true,
    },
  });
}

export async function action({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    const { storeData } = await requireAdminContext(request);
    const method = request.method.toUpperCase();

    switch (method) {
      case "GET": {
        const url = new URL(request.url);
        const search = url.searchParams.get("search") || "";
        const rating = url.searchParams.get("rating") || "all";
        const productId = url.searchParams.get("productId") || "all";
        const reviews = await getFilteredReviews(
          storeData.id,
          search,
          rating,
          productId,
        );
        return { reviews };
      }
      case "POST": {
        const formData = await request.formData();
        const search = formData.get("search") || "";
        const rating = formData.get("rating") || "all";
        const productId = formData.get("productId") || "all";
        const reviews = await getFilteredReviews(
          storeData.id,
          search,
          rating,
          productId,
        );
        return { reviews };
      }
      case "PATCH": {
        const formData = await request.formData();
        const reviewId = formData.get("reviewId");
        const status = formData.get("status");

        if (reviewId && status) {
          await updateReviewStatus({
            reviewId: String(reviewId),
            status: String(status),
            storeId: storeData.id,
          });
        }

        const search = formData.get("search") || "";
        const rating = formData.get("rating") || "all";
        const productId = formData.get("productId") || "all";
        const reviews = await getFilteredReviews(
          storeData.id,
          search,
          rating,
          productId,
        );
        return { reviews };
      }
      case "DELETE": {
        const formData = await request.formData();
        const reviewId = formData.get("reviewId");
        if (reviewId) {
          const reviewData = await deleteReviewWithAttachments({
            reviewId: String(reviewId),
            storeId: storeData.id,
          });
          await updateProductReviewDefineMetafields(
            admin,
            reviewData.productId,
            storeData.id,
          );
        }

        const search = formData.get("search") || "";
        const rating = formData.get("rating") || "all";
        const productId = formData.get("productId") || "all";
        const reviews = await getFilteredReviews(
          storeData.id,
          search,
          rating,
          productId,
        );
        return { reviews };
      }

      // Reply review
      case "PUT": {
        const formData = await request.formData();
        const reviewId = formData.get("reviewId");
        const body = formData.get("body");

        if (reviewId && body) {
          const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: { reply: { create: { body } } },
            include: {
              reply: true,
            },
          });
          console.log(updatedReview);

          const storeSettings = await prisma.storeSettings.findUnique({
            where: { storeId: storeData.id },
            include: {
              emailSettings: true,
              publishingModeration: true,
              brandingSettings: true,
            },
          });

          const buttonUrl =
            updatedReview.productHandle && storeData?.storeURL
              ? `https://${storeData.storeURL}/products/${updatedReview.productHandle}`
              : "#";
          const replyEmailData = buildReplyEmailData({
            review: updatedReview,
            storeSettings,
            storeData,
            buttonUrl,
          });

          await sendEmail(replyEmailData);
        }

        const search = formData.get("search") || "";
        const rating = formData.get("rating") || "all";
        const productId = formData.get("productId") || "all";
        const reviews = await getFilteredReviews(
          storeData.id,
          search,
          rating,
          productId,
        );
        return { reviews };
      }
      default: {
        return new Response("Method Not Allowed", { status: 405 });
      }
    }
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export default function Reviews() {
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation

  // Start----Accessing loaded data using useLoaderData
  const { reviews, storeSettings } = useLoaderData();
  // End----Accessing loaded data using useLoaderData

  // Start----State for active tab
  const [activeTab, setActiveTab] = useState("all");
  // End----State for active tab
  // Start----Reviews pagination state
  // End----Reviews pagination state

  // Start----useFetcher and filters state
  const fetcher = useFetcher();
  useAdminFetcherToast(fetcher);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const searchTimeoutRef = useRef(null);

  const baseReviews = fetcher.data?.reviews ?? reviews;
  const exportRows = buildExportRows(
    [...reviews].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );
  const exportPreviewRows = exportRows.slice(0, EXPORT_PREVIEW_LIMIT);
  const exportColumns = [
    "id",
    "productTitle",
    "productHandle",
    "productId",
    "reviewerName",
    "reviewerEmail",
    "reviewerPhone",
    "rating",
    "title",
    "body",
    "status",
    "source",
    "isVerified",
    "attachmentCount",
    "attachmentUrls",
    "reply",
    "createdAt",
    "updatedAt",
  ];

  // Extract unique products from all loaded reviews
  const uniqueProducts = [];
  const seenProductIds = new Set();
  reviews.forEach((review) => {
    if (review.productId && !seenProductIds.has(review.productId)) {
      seenProductIds.add(review.productId);
      uniqueProducts.push({
        id: review.productId,
        title: review.productTitle || "Unknown Product",
      });
    }
  });

  const triggerFilter = (search, rating, product) => {
    setCurrentPage(1);
    fetcher.submit({ search, rating, productId: product }, { method: "POST" });
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      triggerFilter(val, selectedRating, selectedProduct);
    }, 400);
  };

  const handleRatingChange = (val) => {
    setSelectedRating(val);
    triggerFilter(searchQuery, val, selectedProduct);
  };

  const handleProductChange = (val) => {
    setSelectedProduct(val);
    triggerFilter(searchQuery, selectedRating, val);
  };

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };
  // End----useFetcher and filters state

  // Derived filteredReviews based on activeTab
  const statusMap = {
    pending: "PENDING",
    published: "PUBLISHED",
    spam: "SPAM",
    archive: "ARCHIVE",
  };

  const filteredReviews =
    activeTab === "all"
      ? baseReviews
      : baseReviews.filter((review) => review.status === statusMap[activeTab]);

  // Sort reviews based on sortOrder
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Start----Tab click handler
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };
  // End----Tab click handler

  const {
    currentPage: safeCurrentPage,
    items: paginatedReviews,
    setCurrentPage,
    setPage: handlePaginationClick,
    startIndex: pageStartIndex,
    endIndex: pageEndIndex,
    totalItems: totalReviews,
    totalPages,
  } = usePagination(sortedReviews, REVIEWS_PER_PAGE);
  const visiblePages = [];
  if (safeCurrentPage - 1 >= 1) {
    visiblePages.push(safeCurrentPage - 1);
  }
  visiblePages.push(safeCurrentPage);
  if (safeCurrentPage + 1 <= totalPages) {
    visiblePages.push(safeCurrentPage + 1);
  }

  // Start----Handle import
  function handleExportReview() {
    const csvLines = [
      exportColumns.join(","),
      ...exportRows.map((row) =>
        exportColumns.map((column) => escapeCsvValue(row[column])).join(","),
      ),
    ];
    const csvContent = csvLines.join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateSuffix = new Date().toISOString().slice(0, 10);

    link.href = downloadUrl;
    link.download = `reviews-export-${dateSuffix}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  }
  // End----Handle import

  // Start----Handle status toggle
  const handleStatusUpdate = (reviewId, state) => {
    fetcher.submit(
      {
        reviewId,
        status: state,
        search: searchQuery,
        rating: selectedRating,
        productId: selectedProduct,
      },
      { method: "PATCH" },
    );
  };
  // End----Handle status toggle

  // Start----Handle review delete
  const handleReviewDelete = (reviewId, attachments) => {
    fetcher.submit(
      {
        reviewId,
        search: searchQuery,
        rating: selectedRating,
        productId: selectedProduct,
        attachments: attachments ? JSON.stringify(attachments) : "[]",
      },
      { method: "DELETE" },
    );
  };
  // End----Handle review delete
  // Start----Handle review reply
  const handleReviewReply = (reviewId, body) => {
    fetcher.submit(
      {
        reviewId,
        body,
      },
      { method: "PUT" },
    );
  };
  // End----Handle review delete

  if (loading) {
    return <Loader />; // Show loader while navigating to this page or when loader is fetching data
  }

  return (
    <>
      {/* <s-modal id="export-reviews-modal" heading="Export Reviews">
        <s-stack gap="base">
          <s-text>
            Download all reviews as a CSV file. Previewing the first{" "}
            {Math.min(exportPreviewRows.length, EXPORT_PREVIEW_LIMIT)} of{" "}
            {exportRows.length} reviews.
          </s-text>
          <div
            style={{
              overflowX: "auto",
              border: "1px solid #d9d9d9",
              borderRadius: "12px",
              maxHeight: "320px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
                minWidth: "1100px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f6f6f7" }}>
                  {exportColumns.map((column) => (
                    <th
                      key={column}
                      style={{
                        textAlign: "left",
                        padding: "10px 12px",
                        borderBottom: "1px solid #e3e3e3",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exportPreviewRows.length > 0 ? (
                  exportPreviewRows.map((row) => (
                    <tr key={row.id}>
                      {exportColumns.map((column) => (
                        <td
                          key={`${row.id}-${column}`}
                          style={{
                            padding: "10px 12px",
                            borderBottom: "1px solid #f1f1f1",
                            verticalAlign: "top",
                          }}
                        >
                          {formatExportValue(row[column]) || "-"}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={exportColumns.length}
                      style={{ padding: "16px 12px", textAlign: "center" }}
                    >
                      No reviews available for export.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </s-stack>

        <s-button
          class="close-btn"
          slot="secondary-actions"
          commandFor="export-reviews-modal"
          command="--hide"
        >
          Close
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          commandFor="export-reviews-modal"
          command="--hide"
          onClick={() => handleExportReview()}
          disabled={!exportRows.length}
        >
          Download
        </s-button>
      </s-modal> */}
      <s-page>
        {/* Start----Page Header */}
        <s-grid
          gridTemplateColumns="auto 1fr"
          alignItems="center"
          gap="base"
          paddingBlock="small large"
        >
          <s-stack direction="inline" alignItems="center" gap="small">
            <Text as="h2">Reviews</Text>
            <s-badge
              tone={
                storeSettings?.publishingModeration.autoPublishRules ===
                "AUTO_PUBLISH"
                  ? "success"
                  : "default"
              }
              color="strong"
            >
              Auto-Publish:{" "}
              {storeSettings?.publishingModeration.autoPublishRules ===
              "AUTO_PUBLISH"
                ? "On"
                : "Off"}
            </s-badge>
          </s-stack>
          <s-grid gridTemplateColumns="auto auto auto" justifyContent="end">
            {/* <s-button
              icon="download"
              onClick={() => shopify.modal.show("import-reviews-modal")}
            >
              Import
            </s-button> */}
            <s-button icon="upload" onClick={() => handleExportReview()}>
              Export
            </s-button>
          </s-grid>
        </s-grid>
        {/* End----Page Header */}

        {/* Start----Page main filter tabs */}
        <s-stack paddingBlock="small base">
          <s-section>
            <s-grid
              gridTemplateColumns="repeat(auto-fit, minmax(100px, 1fr))"
              gap="base"
            >
              {/* Start----All reviews button */}
              <TabButton
                isActive={activeTab === "all"}
                onClick={() => handleTabClick("all")}
              >
                All Reviews{" "}
                <s-badge tone="success" color="strong">
                  {baseReviews.length}
                </s-badge>
              </TabButton>
              {/* End----All reviews button */}
              {/* Start----Pending reviews button */}
              <TabButton
                isActive={activeTab === "pending"}
                onClick={() => handleTabClick("pending")}
              >
                Pending{" "}
                <s-badge tone="warning" color="strong">
                  {
                    baseReviews.filter((review) => review.status === "PENDING")
                      .length
                  }
                </s-badge>
              </TabButton>
              {/* End----Pending reviews button */}
              {/* Start----Published reviews button */}
              <TabButton
                isActive={activeTab === "published"}
                onClick={() => handleTabClick("published")}
              >
                Published{" "}
                <s-badge tone="success" color="strong">
                  {
                    baseReviews.filter(
                      (review) => review.status === "PUBLISHED",
                    ).length
                  }
                </s-badge>
              </TabButton>
              {/* End----Published reviews button */}
              {/* Start----Spam reviews button */}
              {/* <TabButton
                isActive={activeTab === "spam"}
                onClick={() => handleTabClick("spam")}
              >
                Spam{" "}
                <s-badge tone="critical" color="strong">
                  {baseReviews.filter((review) => review.status === "SPAM").length}
                </s-badge>
              </TabButton> */}
              {/* End----Spam reviews button */}
              {/* Start----Archive reviews button */}
              <TabButton
                isActive={activeTab === "archive"}
                onClick={() => handleTabClick("archive")}
              >
                Archive{" "}
                <s-badge tone="neutral" color="strong">
                  {
                    baseReviews.filter((review) => review.status === "ARCHIVE")
                      .length
                  }
                </s-badge>
              </TabButton>
              {/* End----Archive reviews button */}
            </s-grid>
          </s-section>
        </s-stack>
        {/* End----Page main filter tabs */}

        {/* Start----Page main content */}
        <s-section>
          {/* Start----Page main content header */}
          <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
            <s-grid gridTemplateColumns="242px 109px 120px" gap="base">
              {/* Start----Search field */}
              <s-search-field
                placeholder="Search by name or product"
                value={searchQuery}
                onInput={(e) => handleSearchChange(e.currentTarget.value)}
              />
              {/* End----Search field */}
              {/* Start----Filter options by rating */}
              <s-select
                value={selectedRating}
                onChange={(e) => handleRatingChange(e.currentTarget.value)}
              >
                <s-option value="all">All ratings</s-option>
                <s-option value="5">5 stars</s-option>
                <s-option value="4">4 stars</s-option>
                <s-option value="3">3 stars</s-option>
                <s-option value="2">2 stars</s-option>
                <s-option value="1">1 star</s-option>
              </s-select>
              {/* End----Filter options by rating */}
              {/* Start----Filter options by product */}
              <s-select
                value={selectedProduct}
                onChange={(e) => handleProductChange(e.currentTarget.value)}
              >
                <s-option value="all">All products</s-option>
                {uniqueProducts.map((prod) => (
                  <s-option key={prod.id} value={prod.id}>
                    {prod.title}
                  </s-option>
                ))}
              </s-select>
              {/* End----Filter options by product */}
            </s-grid>
            {/* Start----Sort button */}
            <s-press-button
              pressed={sortOrder === "oldest"}
              icon="select"
              onClick={handleSortToggle}
            >
              {sortOrder === "newest" ? "Newest first" : "Oldest first"}
            </s-press-button>
            {/* End----Sort button */}
          </s-grid>
          {/* End----Page main content header */}

          {/* Start----Reviews list */}
          <CustomSection margin="35px 0 0">
            <s-stack>
              {totalReviews === 0 ? (
                <s-stack alignItems="center">
                  <s-text>No {activeTab} reviews found</s-text>
                </s-stack>
              ) : (
                paginatedReviews.map((review, index) => (
                  <div key={review.id}>
                    <s-grid gridTemplateColumns="auto 1fr" gap="base">
                      <s-checkbox /> {/* Checkbox for selection of reviews */}
                      <ReviewItem
                        data={review}
                        handleStatusUpdate={handleStatusUpdate}
                        handleReviewDelete={handleReviewDelete}
                        handleReviewReply={handleReviewReply}
                      />
                    </s-grid>
                    {index !== paginatedReviews.length - 1 && (
                      <s-stack paddingBlock="base">
                        <s-divider />
                      </s-stack>
                    )}
                  </div>
                ))
              )}
            </s-stack>
          </CustomSection>
          {/* End----Reviews list */}

          {/* Start----Reviews pagination */}
          <s-grid
            gridTemplateColumns="auto 1fr"
            alignItems="center"
            paddingBlock="large-300 small"
          >
            <s-paragraph>
              Showing{" "}
              <b>
                {totalReviews === 0 ? 0 : pageStartIndex + 1}-{pageEndIndex}
              </b>{" "}
              of <b>{totalReviews}</b> reviews
            </s-paragraph>
            <s-stack direction="inline" gap="small" justifyContent="end">
              <s-button
                disabled={safeCurrentPage === 1}
                onClick={() => handlePaginationClick(safeCurrentPage - 1)}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    width: "75px",
                    justifyContent: "center",
                  }}
                >
                  <s-icon type="arrow-left" />
                  Previous
                </div>
              </s-button>
              {visiblePages
                .filter(
                  (page) =>
                    page >= safeCurrentPage - 1 && page <= safeCurrentPage + 1,
                )
                .map((page) => (
                  <s-press-button
                    key={page}
                    pressed={safeCurrentPage === page}
                    onClick={() => handlePaginationClick(page)}
                  >
                    {page}
                  </s-press-button>
                ))}

              <s-button
                disabled={safeCurrentPage === totalPages}
                onClick={() => handlePaginationClick(safeCurrentPage + 1)}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    width: "70px",
                    justifyContent: "center",
                  }}
                >
                  Next
                  <s-icon type="arrow-right" />
                </div>
              </s-button>
            </s-stack>
          </s-grid>
          {/* End----Reviews pagination */}
        </s-section>
        {/* End----Page main content */}
      </s-page>
    </>
  );
}
