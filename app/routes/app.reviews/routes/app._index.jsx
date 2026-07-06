import TEMP_REVIEWS from "../data/reviews.json";
import Loader from "../../../components/essentials/Loader";
import TabButton from "../../../components/essentials/TabButton";
import CustomSection from "../../../components/essentials/CustomSection";
import ReviewItem from "../../../components/essentials/ReviewItem";
import Text from "../../../components/essentials/elements/Text";
import { useLoaderData, useNavigation, useFetcher } from "react-router";
import { useState, useRef } from "react";
import { authenticate } from "../../../shopify.server";
import prisma from "../../../db.server";
import { getStoreData } from "../../../utils/getStoreData";

const REVIEWS_PER_PAGE = 8;

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const storeData = await getStoreData(admin);
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
  console.log("Reviews fetched from database:", storeSettings);
  return {
    reviews: reviews,
    storeSettings: storeSettings,
  };
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
  const { admin } = await authenticate.admin(request);
  const storeData = await getStoreData(admin);
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
        await prisma.review.update({
          where: { id: reviewId },
          data: { status: status },
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
        await prisma.review.delete({
          where: { id: reviewId },
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
    case "PUT": {
      const formData = await request.formData();
      const reviewId = formData.get("reviewId");
      const body = formData.get("body");

      if (reviewId && body) {
        await prisma.review.update({
          where: { id: reviewId },
          data: { reply: { create: { body } } },
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
    default: {
      return new Response("Method Not Allowed", { status: 405 });
    }
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
  const [currentPage, setCurrentPage] = useState(1);
  // End----Reviews pagination state

  // Start----useFetcher and filters state
  const fetcher = useFetcher();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" or "oldest"
  const searchTimeoutRef = useRef(null);

  const baseReviews = fetcher.data?.reviews ?? reviews;

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

  // Start----Pagination click handler
  const handlePaginationClick = (page) => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE),
    );
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };
  // End----Pagination click handler

  const totalReviews = filteredReviews.length;
  const totalPages = Math.max(1, Math.ceil(totalReviews / REVIEWS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * REVIEWS_PER_PAGE;
  const pageEndIndex = Math.min(
    pageStartIndex + REVIEWS_PER_PAGE,
    totalReviews,
  );
  const paginatedReviews = sortedReviews.slice(pageStartIndex, pageEndIndex);
  const visiblePages = [];
  if (safeCurrentPage - 1 >= 1) {
    visiblePages.push(safeCurrentPage - 1);
  }
  visiblePages.push(safeCurrentPage);
  if (safeCurrentPage + 1 <= totalPages) {
    visiblePages.push(safeCurrentPage + 1);
  }

  // Start----Debugging loaded data
  console.clear();
  console.log("Reviews data loaded:", reviews);
  // End----Debugging loaded data

  // Start----Handle import
  function handleImport() {}
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
  const handleReviewDelete = (reviewId) => {
    fetcher.submit(
      {
        reviewId,
        search: searchQuery,
        rating: selectedRating,
        productId: selectedProduct,
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
      <s-modal id="import-reviews-modal" heading="Import Reviews" open>
        <s-stack>
          <s-drop-zone
            label="Upload reviews CSV file"
            accessibilityLabel="Upload reviews CSV file"
            accept=".csv,.xlsx"
            onInput="console.log('onInput', event.currentTarget?.value)"
            onChange="console.log('onChange', event.currentTarget?.value)"
            onDropRejected="console.log('onDropRejected', event.currentTarget?.value)"
          ></s-drop-zone>
        </s-stack>

        <s-button slot="secondary-actions" commandFor="modal" command="--hide">
          Close
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          commandFor="modal"
          command="--hide"
        >
          Save
        </s-button>
      </s-modal>
      <s-modal id="export-reviews-modal">
        <s-text>Hello, Export Reviews!</s-text>
      </s-modal>
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
          <s-grid
            gridTemplateColumns="auto auto auto"
            gap="small"
            justifyContent="end"
          >
            <s-button
              icon="download"
              onClick={() => shopify.modal.show("import-reviews-modal")}
            >
              Import
            </s-button>
            <s-button
              icon="upload"
              onClick={() => shopify.modal.show("export-reviews-modal")}
            >
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
                placeholder="Search reviews,"
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
