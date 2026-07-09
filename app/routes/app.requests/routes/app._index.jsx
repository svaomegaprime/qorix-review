import Loader from "../../../components/essentials/Loader";
import Text from "../../../components/essentials/elements/Text";
import TabButton from "../../../components/essentials/TabButton";
import CustomSection from "../../../components/essentials/CustomSection";
import Analytics from "../components/Analytics";
import RequestItem from "../components/RequestItem";
import { Prisma } from "@prisma/client";
import { useFetcher, useLoaderData, useNavigation } from "react-router";
import { useRef, useState, Fragment } from "react";
import { randomUUID } from "crypto";
import getRequestsWithReviewStatus from "../utils/getRequestsWithReviewStatus";
import { authenticate } from "../../../shopify.server";
import { getStoreData } from "../../../utils/getStoreData";
import { getFilteredRequests } from "../utils/getFilteredRequests";
import { getProduct } from "../../../utils/getProduct";
import prisma from "../../../db.server";
import { addJobInQueue, reviewQueue } from "../../../lib/bullmq/bullmq.queue";
import { adminErrorResponse } from "../../../utils/adminError.server";
import { useAdminFetcherToast } from "../../../utils/useAdminFetcherToast";
const REQUESTS_PER_PAGE = 5;
const MODAL_REQUESTS_PER_PAGE = 8;
const MAX_VISIBLE_PAGE_BUTTONS = 4;
const TAB_CONFIG = [
  {
    key: "ALL",
    label: "All status",
    statuses: null,
    tone: "success",
  },
  {
    key: "SENT",
    label: "Sent",
    statuses: ["SENT"],
    tone: "warning",
  },
  {
    key: "OPENED",
    label: "Opened",
    statuses: ["OPENED"],
    tone: "success",
  },
  {
    key: "PENDING",
    label: "Pending",
    statuses: ["PENDING"],
    tone: "warning",
  },
  {
    key: "REVIEWED",
    label: "Reviewed",
    statuses: ["REVIEWED"],
    tone: "success",
  },
  {
    key: "FAILED",
    label: "Failed",
    statuses: ["FAILED"],
    tone: "critical",
  },
];

export async function loader({ request }) {
  try {
    const { session, admin } = await authenticate.admin(request);
    const { id } = await getStoreData(admin);
    const requests = await getRequestsWithReviewStatus(session, id);

    return {
      requests,
    };
  } catch (error) {
    return adminErrorResponse(error);
  }
}

function formatEmailBody(message, storeSettings, formattedOrder) {
  return String(message ?? "")
    .replace(/{{first_name}}/g, formattedOrder?.fullName ?? "")
    .replace(
      /{{store_name}}/g,
      storeSettings?.brandingSettings?.storeDisplayName ?? "",
    )
    .replace(/{{product_name}}/g, formattedOrder?.products?.[0]?.title ?? "");
}

function buildRequestEmailData(formattedOrder, storeSettings) {
  return {
    to: formattedOrder.email,
    from: storeSettings?.emailSettings?.smtpUser,
    replyTo: storeSettings?.brandingSettings?.storeReplyToEmail,
    templateName: "RequestsEmail",
    subject: storeSettings?.emailSettings?.requestEmailSubjectLine,
    smtpConfig: {
      smtpHost: storeSettings?.emailSettings?.smtpHost,
      smtpPort: storeSettings?.emailSettings?.smtpPort,
      smtpUser: storeSettings?.emailSettings?.smtpUser,
      smtpPassword: storeSettings?.emailSettings?.smtpPassword,
    },
    templateData: {
      name: formattedOrder?.fullName,
      storeTagline: storeSettings?.brandingSettings?.storeTagline,
      timeAgo: formattedOrder?.timeAgo,
      products: formattedOrder?.products ?? [],
      storeName: storeSettings?.brandingSettings?.storeDisplayName,
      requestEmailBody: formatEmailBody(
        storeSettings?.emailSettings?.reminderEmailBody,
        storeSettings,
        formattedOrder,
      ),
      requestEmailButton: storeSettings?.emailSettings?.reminderEmailButton,
      storeFooterText: storeSettings?.brandingSettings?.emailFooterText ?? "",
      storeFooterLinkText:
        storeSettings?.brandingSettings?.emailFooterLinkText ?? "",
      isShowFooterBadge: storeSettings?.brandingSettings?.isShowFooterBadge,
      storeLogo: storeSettings?.brandingSettings?.storeLogo,
      storeLogoPosition: storeSettings?.brandingSettings?.storeLogoPosition,
      emailPrimaryButtonColor:
        storeSettings?.brandingSettings?.emailPrimaryButtonColor,
      emailButtonTextColor:
        storeSettings?.brandingSettings?.emailButtonTextColor,
      emailBackgroundColor:
        storeSettings?.brandingSettings?.emailBackgroundColor,
      emailHeadingColor: storeSettings?.brandingSettings?.emailHeadingColor,
      emailBodyTextColor: storeSettings?.brandingSettings?.emailBodyTextColor,
      emailAccentBorderColor:
        storeSettings?.brandingSettings?.emailAccentBorderColor,
    },
  };
}

async function bulkUpsertOrders(orderRows) {
  if (!orderRows.length) {
    return;
  }

  // 1. Bulk Upsert Orders (without productsJson column)
  const orderValues = Prisma.join(
    orderRows.map(
      (row) =>
        Prisma.sql`(
        ${row.id}::uuid,
        ${row.storeId},
        ${row.orderId},
        ${row.fulfillmentStatus},
        ${row.paymentStatus},
        ${row.userEmail},
        ${row.reviewCheckStatus}::"ReviewCheckStatus",
        ${row.requestType}::"RequestType",
        ${row.totalPrice},
        ${row.currency},
        ${JSON.stringify(row.redisBullmqJobId)}::jsonb,
        NOW(),
        NOW()
      )`,
    ),
  );

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "Order" (
      "id",
      "storeId",
      "orderId",
      "fulfillmentStatus",
      "paymentStatus",
      "userEmail",
      "reviewCheckStatus",
      "requestType",
      "totalPrice",
      "currency",
      "redisBullmqJobId",
      "createdAt",
      "updatedAt"
    )
    VALUES ${orderValues}
    ON CONFLICT ("storeId", "orderId") DO UPDATE SET
      "fulfillmentStatus" = EXCLUDED."fulfillmentStatus",
      "paymentStatus" = EXCLUDED."paymentStatus",
      "userEmail" = EXCLUDED."userEmail",
      "reviewCheckStatus" = EXCLUDED."reviewCheckStatus",
      "requestType" = EXCLUDED."requestType",
      "totalPrice" = EXCLUDED."totalPrice",
      "currency" = EXCLUDED."currency",
      "redisBullmqJobId" = EXCLUDED."redisBullmqJobId",
      "updatedAt" = NOW()
  `);

  // 2. Query actual Order UUID PKs (in case database had existing ones)
  const dbOrders = await prisma.order.findMany({
    where: {
      OR: orderRows.map((row) => ({
        storeId: row.storeId,
        orderId: row.orderId,
      })),
    },
    select: {
      id: true,
      storeId: true,
      orderId: true,
    },
  });

  const orderIdToUuidMap = new Map(
    dbOrders.map((o) => [`${o.storeId}-${o.orderId}`, o.id]),
  );

  // 3. Delete existing line items for these orders to refresh them
  await prisma.orderLineItem.deleteMany({
    where: {
      orderId: {
        in: dbOrders.map((o) => o.id),
      },
    },
  });

  // 4. Bulk Upsert OrderLineItems
  const lineItemRows = [];
  for (const row of orderRows) {
    const orderUuid = orderIdToUuidMap.get(`${row.storeId}-${row.orderId}`);
    if (!orderUuid) continue;

    const products = Array.isArray(row.productsJson) ? row.productsJson : [];
    for (const p of products) {
      lineItemRows.push({
        id: randomUUID(),
        orderId: orderUuid,
        productId: String(p.productId),
        title: p.title,
        quantity: p.quantity ?? 1,
        handle: p.productHandle ?? p.handle ?? null,
        url: p.url ?? null,
        image: p.image ?? null,
        isReviewed: p.isReviewed ?? false,
      });
    }
  }

  if (lineItemRows.length > 0) {
    const lineItemValues = Prisma.join(
      lineItemRows.map(
        (row) =>
          Prisma.sql`(
          ${row.id}::uuid,
          ${row.orderId}::uuid,
          ${row.productId},
          ${row.title},
          ${row.quantity}::integer,
          ${row.handle},
          ${row.url},
          ${row.image},
          ${row.isReviewed}::boolean,
          NOW(),
          NOW()
        )`,
      ),
    );

    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "OrderLineItem" (
        "id",
        "orderId",
        "productId",
        "title",
        "quantity",
        "handle",
        "url",
        "image",
        "isReviewed",
        "createdAt",
        "updatedAt"
      )
      VALUES ${lineItemValues}
      ON CONFLICT ("orderId", "productId") DO UPDATE SET
        "title" = EXCLUDED."title",
        "quantity" = EXCLUDED."quantity",
        "handle" = EXCLUDED."handle",
        "url" = EXCLUDED."url",
        "image" = EXCLUDED."image",
        "isReviewed" = EXCLUDED."isReviewed",
        "updatedAt" = NOW()
    `);
  }
}

export async function action({ request }) {
  try {
    const { session, admin } = await authenticate.admin(request);
    const { id } = await getStoreData(admin);
    const method = request.method.toUpperCase();

    switch (method) {
      case "GET": {
        const url = new URL(request.url);
        const search = url.searchParams.get("search") || "";
        const dateRange = url.searchParams.get("dateRange") || "all";
        const requests = await getRequestsWithReviewStatus(session, id);

        return {
          requests: getFilteredRequests(requests, search, dateRange),
        };
      }
      case "POST": {
        const formData = await request.formData();
        const search = formData.get("search") || "";
        const dateRange = formData.get("dateRange") || "all";
        const requests = await getRequestsWithReviewStatus(session, id);

        return {
          requests: getFilteredRequests(requests, search, dateRange),
        };
      }
      case "PUT": {
        const formData = await request.formData();
        const search = formData.get("search") || "";
        const dateRange = formData.get("dateRange") || "all";
        const parsedOrders = JSON.parse(String(formData.get("orders") || "[]"));
        const selectedOrders = Array.isArray(parsedOrders) ? parsedOrders : [];

        const storeSettings = await prisma.storeSettings.findFirst({
          where: {
            storeId: id,
          },
          include: {
            requestScheduling: true,
            emailSettings: true,
            publishingModeration: true,
            widgetsSettings: true,
            brandingSettings: true,
            adminNotification: true,
          },
        });

        const orderRows = [];

        for (const formattedOrder of selectedOrders) {
          // Start:: Enrich products with handle and url from Shopify
          const enrichedProducts = await Promise.all(
            (formattedOrder.products ?? [])?.map(async (item) => {
              const gid = item.productId
                ? String(item.productId).startsWith("gid://")
                  ? item.productId
                  : `gid://shopify/Product/${item.productId}`
                : null;

              if (!gid) return item;

              try {
                const product = await getProduct(admin, gid);
                const productHandle =
                  product?.handle ?? item.productHandle ?? item.handle ?? null;
                const productUrl =
                  product?.onlineStoreUrl ??
                  (productHandle
                    ? `https://${session.shop}/products/${productHandle}?isOpen=true&orderId=${formattedOrder?.orderId.split("#")[1]}`
                    : null);

                return {
                  ...item,
                  productHandle,
                  handle: productHandle,
                  image: product?.featuredImage?.url ?? item.image ?? null,
                  url: productUrl ?? item.url ?? null,
                };
              } catch (error) {
                console.error("Failed to enrich order product", {
                  productId: item.productId,
                  error,
                });
                return item;
              }
            }),
          );

          formattedOrder.products = enrichedProducts;
          // End:: Enrich products

          // Start:: Check existing reviews for this store + email
          const existReview = await prisma.review.findMany({
            where: {
              storeId: id,
              productId: {
                in: formattedOrder.products.map((item) =>
                  String(item.productId),
                ),
              },
              reviewerEmail: formattedOrder.email,
            },
            select: { productId: true },
          });

          const reviewedProductIds = new Set(
            existReview.map((r) => String(r.productId)),
          );

          formattedOrder.products = formattedOrder.products.map((item) => ({
            ...item,
            isReviewed: reviewedProductIds.has(String(item.productId)),
          }));

          const allReviewed =
            formattedOrder.products.length > 0 &&
            formattedOrder.products.every(
              (product) => product.isReviewed === true,
            );
          // End:: Check existing reviews

          if (allReviewed) {
            // All products already reviewed — skip email, mark as REVIEWED
            orderRows.push({
              id: randomUUID(),
              storeId: id,
              orderId: formattedOrder.orderId,
              fulfillmentStatus:
                formattedOrder.fulfillmentStatus ?? "unfulfilled",
              paymentStatus: formattedOrder.status ?? "",
              userEmail: formattedOrder.email ?? "",
              productsJson: formattedOrder.products ?? [],
              reviewCheckStatus: "REVIEWED",
              requestType: "MANUAL",
              totalPrice: formattedOrder.totalPrice ?? null,
              currency: formattedOrder.currency ?? null,
              redisBullmqJobId: {
                reviewRequestId: null,
                reminderJobId: null,
              },
            });
          } else {
            // Not all reviewed — send review request email
            const requestEmailData = buildRequestEmailData(
              formattedOrder,
              storeSettings,
            );

            const scheduledJobResponse = await addJobInQueue(
              reviewQueue,
              "JOB_SCHEDULE_EMAIL",
              {
                emailData: requestEmailData,
                payload: {
                  storeId: id,
                  orderId: formattedOrder.orderId,
                },
              },
              0,
            );

            orderRows.push({
              id: randomUUID(),
              storeId: id,
              orderId: formattedOrder.orderId,
              fulfillmentStatus:
                formattedOrder.fulfillmentStatus ?? "unfulfilled",
              paymentStatus: formattedOrder.status ?? "",
              userEmail: formattedOrder.email ?? "",
              productsJson: formattedOrder.products ?? [],
              reviewCheckStatus: "SENT",
              requestType: "MANUAL",
              totalPrice: formattedOrder.totalPrice ?? null,
              currency: formattedOrder.currency ?? null,
              redisBullmqJobId: {
                reviewRequestId: scheduledJobResponse?.id ?? null,
                reminderJobId: null,
              },
            });
          }
        }

        await bulkUpsertOrders(orderRows);

        const requests = await getRequestsWithReviewStatus(session, id);

        return {
          requests: getFilteredRequests(requests, search, dateRange),
          manualRequestResult: {
            sent: selectedOrders.length,
          },
        };
      }
      default: {
        return new Response("Method Not Allowed", { status: 405 });
      }
    }
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export default function Requests() {
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  // End----Default CSR loading state checking for navigation

  // Start----Accessing loaded data using useLoaderData
  const { requests } = useLoaderData();
  // End----Accessing loaded data using useLoaderData

  // Start----State for active tab
  const [activeTab, setActiveTab] = useState("ALL");
  // End----State for active tab
  // Start----Requests pagination state
  const [currentPage, setCurrentPage] = useState(1);
  // End----Requests pagination state

  // Start----useFetcher and filters state
  const fetcher = useFetcher();
  useAdminFetcherToast(fetcher);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const searchTimeoutRef = useRef(null);
  const filterLoading = fetcher.state !== "idle";

  const baseRequests = fetcher.data?.requests ?? requests;

  const triggerFilter = (search, dateRange) => {
    setCurrentPage(1);
    fetcher.submit({ search, dateRange }, { method: "POST" });
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      triggerFilter(val, selectedDateRange);
    }, 0);
  };

  const handleDateRangeChange = (val) => {
    setSelectedDateRange(val);
    triggerFilter(searchQuery, val);
  };

  const handleSortToggle = () => {
    setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"));
  };
  // End----useFetcher and filters state

  // Start----Modal states for Request Review Modal
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalCurrentPage, setModalCurrentPage] = useState(1);
  const [modalSelectedOrders, setModalSelectedOrders] = useState(new Set());
  // End----Modal states for Request Review Modal

  const filteredRequests =
    activeTab === "ALL"
      ? baseRequests
      : baseRequests.filter((request) => {
          const tabConfig = TAB_CONFIG.find((item) => item.key === activeTab);
          return tabConfig?.statuses?.includes(request.reviewCheckStatus);
        });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Start----Modal filtering logic
  const modalFilteredRequests = baseRequests.filter((request) => {
    const query = modalSearchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      (request.fullName && request.fullName.toLowerCase().includes(query)) ||
      (request.email && request.email.toLowerCase().includes(query)) ||
      (request.orderId && request.orderId.toLowerCase().includes(query)) ||
      (request.products &&
        request.products.some(
          (p) => p.title && p.title.toLowerCase().includes(query),
        ))
    );
  });
  // End----Modal filtering logic

  const modalTotalRequests = modalFilteredRequests.length;
  const modalTotalPages = Math.max(
    1,
    Math.ceil(modalTotalRequests / MODAL_REQUESTS_PER_PAGE),
  );
  const safeModalCurrentPage = Math.min(modalCurrentPage, modalTotalPages);
  const modalPageStartIndex =
    (safeModalCurrentPage - 1) * MODAL_REQUESTS_PER_PAGE;
  const modalPageEndIndex = Math.min(
    modalPageStartIndex + MODAL_REQUESTS_PER_PAGE,
    modalTotalRequests,
  );
  const modalPaginatedRequests = modalFilteredRequests.slice(
    modalPageStartIndex,
    modalPageEndIndex,
  );

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
      Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE),
    );
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
  };
  // End----Pagination click handler

  const handleModalPaginationClick = (page) => {
    const nextPage = Math.min(Math.max(page, 1), modalTotalPages);
    setModalCurrentPage(nextPage);
  };

  const totalRequests = filteredRequests.length;
  const totalPages = Math.max(1, Math.ceil(totalRequests / REQUESTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * REQUESTS_PER_PAGE;
  const pageEndIndex = Math.min(
    pageStartIndex + REQUESTS_PER_PAGE,
    totalRequests,
  );
  const paginatedRequests = sortedRequests.slice(pageStartIndex, pageEndIndex);
  const visiblePageStart = Math.min(
    Math.max(safeCurrentPage - Math.floor(MAX_VISIBLE_PAGE_BUTTONS / 2), 1),
    Math.max(totalPages - MAX_VISIBLE_PAGE_BUTTONS + 1, 1),
  );
  const visiblePageCount = Math.min(MAX_VISIBLE_PAGE_BUTTONS, totalPages);
  const visiblePages = Array.from(
    { length: visiblePageCount },
    (_, index) => visiblePageStart + index,
  );

  function handleCheckBox(val, item) {
    setModalSelectedOrders((prev) => {
      const next = new Set(prev);
      if (val) {
        next.add(item.orderId);
      } else {
        next.delete(item.orderId);
      }
      return next;
    });
  }

  function handleManualRequestSend() {
    const selectedOrdersData = baseRequests.filter((r) =>
      modalSelectedOrders.has(r.orderId),
    );

    if (!selectedOrdersData.length) {
      return;
    }

    fetcher.submit(
      {
        orders: JSON.stringify(selectedOrdersData),
        search: searchQuery,
        dateRange: selectedDateRange,
      },
      { method: "PUT" },
    );
    setModalSelectedOrders(new Set());
  }

  if (loading) {
    return <Loader />; // Show loader while navigating to this page or when loader is fetching data
  }
  return (
    <>
      <s-modal id={`request-rewiew-modal`} heading="Request Reviews">
        <s-section padding="none">
          <s-table>
            <s-search-field
              slot="filters"
              label="Search orders"
              labelAccessibilityVisibility="exclusive"
              placeholder="Search orders..."
              value={modalSearchQuery}
              onInput={(e) => {
                setModalSearchQuery(e.currentTarget.value);
                setModalCurrentPage(1);
              }}
            />
            <s-table-header-row>
              <s-table-header listSlot="primary">
                {/* <s-checkbox/> */}
              </s-table-header>
              <s-table-header listSlot="primary">Order ID</s-table-header>
              <s-table-header listSlot="primary">Product</s-table-header>
              <s-table-header listSlot="inline">Customer</s-table-header>
              <s-table-header listSlot="labeled">Status</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {modalPaginatedRequests.map((item) => (
                <s-table-row key={item.orderId}>
                  <s-table-cell>
                    <s-checkbox
                      checked={modalSelectedOrders.has(item.orderId)}
                      onChange={(e) => handleCheckBox(e.target.checked, item)}
                    />
                  </s-table-cell>
                  <s-table-cell>{item.orderId}</s-table-cell>
                  <s-table-cell>
                    <s-text
                      style={{
                        display: "block",
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.products?.map((product, index) => (
                        <Fragment key={product?.productId || index}>
                          {product?.title + ", " || "-"}
                          <br />
                        </Fragment>
                      ))}
                    </s-text>
                  </s-table-cell>
                  <s-table-cell>{item.fullName}</s-table-cell>
                  <s-table-cell>
                    <s-badge
                      tone={
                        item.reviewCheckStatus === "SENT"
                          ? "warning"
                          : item.reviewCheckStatus === "OPENED"
                            ? "info"
                            : item.reviewCheckStatus === "REVIEWED"
                              ? "success"
                              : item.reviewCheckStatus === "FAILED"
                                ? "critical"
                                : "neutral"
                      }
                    >
                      {item.reviewCheckStatus === "PENDING"
                        ? "NOT SENT"
                        : item.reviewCheckStatus}
                    </s-badge>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
          <s-divider />
          <s-stack
            direction="inline"
            alignItems="center"
            justifyContent="space-between"
            paddingBlockEnd="small"
            paddingInlineStart="small"
          >
            <s-paragraph>
              Showing{" "}
              <b>
                {modalTotalRequests === 0 ? 0 : modalPageStartIndex + 1}-
                {modalPageEndIndex}
              </b>{" "}
              of <b>{modalTotalRequests}</b> requests
            </s-paragraph>
            <s-stack
              direction="inline"
              justifyContent="end"
              gap="base"
              paddingInlineEnd="small"
              alignItems="center"
            >
              <s-button
                disabled={safeModalCurrentPage === 1}
                onClick={() =>
                  handleModalPaginationClick(safeModalCurrentPage - 1)
                }
              >
                Previous
              </s-button>
              <s-button
                disabled={safeModalCurrentPage === modalTotalPages}
                onClick={() =>
                  handleModalPaginationClick(safeModalCurrentPage + 1)
                }
              >
                Next
              </s-button>
            </s-stack>
          </s-stack>
        </s-section>

        <s-button
          class="close-btn"
          slot="secondary-actions"
          commandFor="request-rewiew-modal"
          command="--hide"
          tone="critical"
        >
          Cancel
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          commandFor="request-rewiew-modal"
          command="--hide"
          disabled={!modalSelectedOrders.size || filterLoading}
          onClick={handleManualRequestSend}
        >
          Send Review Request
        </s-button>
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
            <Text as="h2">Requests</Text>
            {/* <s-badge tone="success" color="strong">
            Auto-send: On
          </s-badge> */}
          </s-stack>
          <s-grid gridTemplateColumns="auto auto auto" justifyContent="end">
            {/* <s-button icon="settings">Request reviews</s-button> */}
            <s-button
              commandFor="request-rewiew-modal"
              command="--show"
              icon="plus"
            >
              Send manual request
            </s-button>
          </s-grid>
        </s-grid>
        {/* End----Page Header */}

        {/* Start----Analytics Section */}
        <Analytics data={requests} />
        {/* End----Analytics Section */}

        {/* Start----Page main filter tabs */}
        <s-stack paddingBlock="small base">
          <s-section>
            <s-grid
              gridTemplateColumns="repeat(auto-fit, minmax(100px, 1fr))"
              gap="base"
            >
              {TAB_CONFIG.map((tab) => (
                <TabButton
                  key={tab.key}
                  isActive={activeTab === tab.key}
                  onClick={() => handleTabClick(tab.key)}
                >
                  {tab.label}{" "}
                  <s-badge tone={tab.tone} color="strong">
                    {tab.statuses
                      ? baseRequests.filter((request) =>
                          tab.statuses.includes(request.reviewCheckStatus),
                        ).length
                      : baseRequests.length}
                  </s-badge>
                </TabButton>
              ))}
            </s-grid>
          </s-section>
        </s-stack>
        {/* End----Page main filter tabs */}

        {/* Start----Page main content */}
        <s-section>
          {/* Start----Page main content header */}
          <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="center">
            <s-grid gridTemplateColumns="242px 120px" gap="base">
              {/* Start----Search field */}
              <s-search-field
                placeholder="Search customers..."
                value={searchQuery}
                onInput={(e) => handleSearchChange(e.currentTarget.value)}
              />
              {/* End----Search field */}
              {/* Start----Filter options by date */}
              <s-grid
                gridTemplateColumns="auto auto"
                gap="base"
                alignItems="center"
              >
                <s-select
                  value={selectedDateRange}
                  onChange={(e) => handleDateRangeChange(e.currentTarget.value)}
                >
                  <s-option value="all">All time</s-option>
                  <s-option value="7days">Last 7 days</s-option>
                  <s-option value="30days">Last 30 days</s-option>
                  <s-option value="90days">Last 90 days</s-option>
                </s-select>
                {/* End----Filter options by date */}
                {filterLoading && (
                  <s-spinner
                    accessibilityLabel={"spinner"}
                    size={"size"}
                  ></s-spinner>
                )}
              </s-grid>
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

          {/* Start----Requests list */}
          <CustomSection margin="35px 0 0">
            <s-stack>
              {totalRequests === 0 ? (
                <s-stack alignItems="center">
                  <s-text>No {activeTab} requests found</s-text>
                </s-stack>
              ) : (
                paginatedRequests.map((request, index) => (
                  <div key={request.id}>
                    <s-grid gridTemplateColumns="auto 1fr" gap="base">
                      <s-checkbox /> {/* Checkbox for selection of requests */}
                      <RequestItem data={request} />
                    </s-grid>
                    {index !== paginatedRequests.length - 1 && (
                      <s-stack paddingBlock="base">
                        <s-divider />
                      </s-stack>
                    )}
                  </div>
                ))
              )}
            </s-stack>
          </CustomSection>
          {/* End----Requests list */}

          {/* Start----Requests pagination */}
          <s-grid
            gridTemplateColumns="auto 1fr"
            alignItems="center"
            paddingBlock="large-300 small"
          >
            <s-paragraph>
              Showing{" "}
              <b>
                {totalRequests === 0 ? 0 : pageStartIndex + 1}-{pageEndIndex}
              </b>{" "}
              of <b>{totalRequests}</b> requests
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
              {visiblePages.map((page) => (
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
          {/* End----Requests pagination */}
        </s-section>
        {/* End----Page main content */}
      </s-page>
    </>
  );
}
