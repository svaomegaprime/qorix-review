# Qorix Review - SQA Code Audit Report

This report outlines critical issues, database bottlenecks, Shopify API best-practice violations, and logic bugs identified in the current implementation. 

---

### Table of Contents
1. [Security Vulnerability: IDOR in Settings Routes](#1-security-vulnerability-idor-in-settings-routes)
2. [Database Performance: Memory Bloat & Full Scans on Request Dashboard](#2-database-performance-memory-bloat--full-scans-on-request-dashboard)
3. [Storefront Latency: Syncing Orders on Public storefront Widget](#3-storefront-latency-syncing-orders-on-public-storefront-widget)
4. [Webhook Reliability: External API Calls in Webhooks](#4-webhook-reliability-external-api-calls-in-webhooks)
5. [Shopify Metafields Out-of-Sync on Review Moderation](#5-shopify-metafields-out-of-sync-on-review-moderation)
6. [Logic Bug: Reversed Order Cancellation Handling](#6-logic-bug-reversed-order-cancellation-handling)
7. [Environment Configuration: Hardcoded Redis Connection](#7-environment-configuration-hardcoded-redis-connection)
8. [Database Schema: Non-Primary Key Relation Anti-Pattern](#8-database-schema-non-primary-key-relation-anti-pattern)
9. [SMTP Template Subject Typo](#9-smtp-template-subject-typos)
10. [Background Worker Status Integration Gap](#10-background-worker-status-integration-gap)

---

### 1. Security Vulnerability: IDOR in Settings Routes
* **Locations**: 
  * [app/routes/app.settings/routes/app.index.jsx:L54-75](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/app.settings/routes/app.index.jsx#L54-L75)
  * [app/routes/app.settings/routes/app.email-settings.jsx:L62-91](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/app.settings/routes/app.email-settings.jsx#L62-L91)
  * [app/routes/app.settings/routes/app.publishing-moderation.jsx:L35-57](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/app.settings/routes/app.publishing-moderation.jsx#L35-L57)
  * [app/routes/app.settings/routes/app.branding.jsx:L66-88](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/app.settings/routes/app.branding.jsx#L66-L88)
  * [app/routes/app.settings/routes/app.admin-notification.jsx:L34-56](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/app.settings/routes/app.admin-notification.jsx#L34-L56)
* **Issue**:
  In each of the settings update actions, the code accepts a payload from the client containing database IDs (e.g. `data.id` or `storeSettingsId`) and executes database updates or upserts using that ID. However, the backend **does not verify** if the database ID belongs to the authenticated store.
  ```javascript
  // Example from app.index.jsx (vulnerable action)
  export async function action({ request }) {
    const { admin } = await authenticate.admin(request);
    const data = await request.json(); // contains 'id' of scheduling config
    
    // Updates the scheduling config directly without checking store ownership!
    const requestSchedulingData = await prisma.requestScheduling.update({
      where: { id: data.id }, 
      data,
    });
  }
  ```
* **Impact**: Critical. Any authenticated store merchant can modify the settings of any other merchant's store (e.g., SMTP details, email templates, branding details) simply by sending custom JSON with guessed or brute-forced UUIDs.
* **Improvement**: 
  Always retrieve the store's global GID using the Shopify Admin Context, find the merchant's `StoreSettings` record, and verify ownership:
  ```javascript
  const { id: storeGID } = await getStoreData(admin);
  const storeSettings = await prisma.storeSettings.findUnique({
    where: { storeId: storeGID },
  });
  
  // Ensure we only update configs linked to this store's settings ID
  await prisma.requestScheduling.update({
    where: {
      id: data.id,
      storeSettingsId: storeSettings.id,
    },
    data,
  });
  ```

---

### 2. Database Performance: Memory Bloat & Full Scans on Request Dashboard
* **Location**: [app/routes/app.requests/utils/getOrdersWithStatus.server.js:L18-30](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/app.requests/utils/getOrdersWithStatus.server.js#L18-L30)
* **Issue**:
  When loading the review requests dashboard, the code pulls the last 250 orders from Shopify and merges their state with the local database. However, to do this, the local database query pulls **all** order entries in the database for the given store:
  ```javascript
  const ordersDb = await prisma.order.findMany({
    where: { storeId }, // Fetches EVERY SINGLE ORDER in database history for this store
    select: { userEmail: true, orderId: true, ... }
  });
  ```
* **Impact**: High. If a merchant has accumulated 10,000+ orders, this query will retrieve all of them into Node.js memory on every single page load or search action. This will lead to high latency, database server CPU spikes, memory exhaustion, and eventual server crashes.
* **Improvement**:
  Only select the database records that match the specific 250 orders fetched from Shopify:
  ```javascript
  const orderIds = orders.map(o => o.orderId);
  const ordersDb = await prisma.order.findMany({
    where: {
      storeId,
      orderId: { in: orderIds }, // Restricts query size to 250 records max
    },
    select: { ... },
  });
  ```

---

### 3. Storefront Latency: Syncing Orders on Public Storefront Widget
* **Location**: [app/routes/api.review/middleware/checkPublishRules.js:L12-20](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/api.review/middleware/checkPublishRules.js#L12-L20)
* **Issue**:
  When a public user submits a review via the storefront widget, the backend must verify if they bought the product (`isVerified`). To do this, it calls `getOrders(session.shop, session.accessToken)` which executes a blocking GraphQL network fetch request to Shopify to fetch 250 orders.
* **Impact**:
  1. **User Experience**: Submission response times are delayed by seconds as the server awaits external Shopify GraphQL API calls.
  2. **API Limits**: High traffic will quickly trigger Shopify GraphQL API rate limits (429/throttled).
  3. **Verification Bug**: If the customer's order is older than the last 250 orders of the shop, their order won't be returned by the Shopify API, so the review will wrongly be classified as "unverified" (even though they are a valid customer).
  4. **ID Format Comparison**: `product.id` from Shopify GraphQL is a full GID (`gid://shopify/Product/1234567`), whereas the frontend submitted `productId` might be a raw number string (`1234567`). Direct comparison `product.id === productId` will fail due to format mismatch.
* **Improvement**:
  Query the local `Order` database table (which is already kept up-to-date by order creation webhooks) using index-backed query lookups:
  ```javascript
  const cleanProductId = String(productId).split("/").pop(); // Normalize ID
  
  const isVerified = reviewerEmail
    ? await prisma.order.findFirst({
        where: {
          storeId: storeId,
          userEmail: reviewerEmail,
          productsJson: {
            path: "$[*].productId",
            array_contains: cleanProductId, // Or JSON processing depending on SQL dialect
          },
        },
      }) !== null
    : false;
  ```

---

### 4. Webhook Reliability: External API Calls in Webhooks
* **Locations**: 
  * [app/routes/webhooks.orders.create.jsx:L14-15](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/webhooks.orders.create.jsx#L14-L15)
  * [app/routes/webhooks.orders.cancelled.jsx:L17-19](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/webhooks.orders.cancelled.jsx#L17-L19)
* **Issue**:
  When Shopify sends webhooks (like order creation or cancellation), the webhook handlers load the store's global GID by creating an offline admin client and calling Shopify GraphQL API (`getStoreData(admin)`):
  ```javascript
  const { admin } = await unauthenticated.admin(shop);
  const { id } = await getStoreData(admin); // GraphQL API Call
  ```
* **Impact**: Shopify webhooks require a 200 OK response within 5 seconds, otherwise they time out and retry. Unnecessary GraphQL queries inside webhooks slow down request times, waste API call credits, and introduce dependency on external API availability.
* **Improvement**:
  Since the store GID is already mapped to the store URL during installation (in the `afterAuth` callback of `shopify.server.js`), query the local database directly:
  ```javascript
  const store = await prisma.store.findFirst({
    where: { storeURL: shop },
    select: { storeGID: true },
  });
  const id = store?.storeGID;
  ```

---

### 5. Shopify Metafields Out-of-Sync on Review Moderation
* **Location**: [app/routes/app.reviews/routes/app._index.jsx:L161-227](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/app.reviews/routes/app._index.jsx#L161-L227)
* **Issue**:
  When a public review is submitted, it may be set to `PENDING` (moderation hold) based on moderation rules. Later, when an admin goes to the dashboard to approve (`PATCH` status to `PUBLISHED`), reject (`PATCH` status to `REJECTED`), or delete (`DELETE` action) the review, the code executes Prisma updates, but **never** triggers the `updateProductReviewDefineMetafields(admin, productId, storeId)` helper.
* **Impact**: Shopify product metafields (which store average ratings and total counts) will fall permanently out-of-sync when review states change. Storefront badges (like star counts under product titles) will show incorrect/old ratings.
* **Improvement**:
  Ensure all status updates (`PATCH`) and deletions (`DELETE`) execute `updateProductReviewDefineMetafields` immediately after the database change.

---

### 6. Logic Bug: Reversed Order Cancellation Handling
* **Location**: [app/routes/webhooks.orders.cancelled.jsx:L99-103](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/webhooks.orders.cancelled.jsx#L99-L103)
* **Issue**:
  1. The webhook `ORDERS_CANCELLED` triggers when an order is cancelled. However, the code attempts to check if it is cancelled using:
     ```javascript
     const isOrderCancel = storeSettings.requestScheduling.isSkipCancelledOrder && formattedOrder.status === "refunded";
     ```
     This checks if financial status is `"refunded"`. An order can be cancelled without being refunded immediately, making this check unreliable.
  2. If `isOrderCancel` resolves to `true`, the code enters an `if` statement and **schedules** email requests (`addJobInQueue`)!
* **Impact**:
  1. If `isSkipCancelledOrder` is set to `true` (skip emails for cancelled orders), the system actually **sends** reviews instead of skipping them.
  2. The webhook doesn't cancel existing scheduled email jobs from the queue. If an order was scheduled when created/fulfilled, and then gets cancelled, the email is still sent because the existing jobs in the Redis queue are never removed.
* **Improvement**:
  Instead of scheduling emails, check if the cancelled order already has queued jobs in the database (`redisBullmqJobId`), remove them using `removeJobInQueue`, and update the database status to `FAILED` or `SKIPPED`:
  ```javascript
  if (storeSettings.requestScheduling.isSkipCancelledOrder) {
    const existingOrder = await prisma.order.findUnique({
      where: { storeId_orderId: { storeId, orderId: formattedOrder.orderId } }
    });
    
    if (existingOrder?.redisBullmqJobId) {
      const { reviewRequestId, reminderJobId } = existingOrder.redisBullmqJobId;
      if (reviewRequestId) await removeJobInQueue(reviewQueue, reviewRequestId);
      if (reminderJobId) await removeJobInQueue(reviewQueue, reminderJobId);
    }
    
    await prisma.order.update({
      where: { storeId_orderId: { storeId, orderId: formattedOrder.orderId } },
      data: { reviewCheckStatus: "FAILED" } // Stop requests
    });
  }
  ```

---

### 7. Environment Configuration: Hardcoded Redis Connection
* **Location**: [app/lib/redis/redis.js:L3-7](file:///c:/Users/mdeft/Documents/qorix-review/app/lib/redis/redis.js#L3-L7)
* **Issue**:
  The connection options for Redis are hardcoded to `localhost` on port `6379`:
  ```javascript
  export const connection = new Redis({
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
  });
  ```
* **Impact**: This will fail instantly in dockerized production, staging, or hosting environments (like Fly.io, Heroku, or AWS) where Redis runs on external hosts.
* **Improvement**: 
  Retrieve Redis URL/connection options from environmental configurations:
  ```javascript
  export const connection = process.env.REDIS_URL 
    ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
    : new Redis({
        host: process.env.REDIS_HOST || "localhost",
        port: Number(process.env.REDIS_PORT) || 6379,
        maxRetriesPerRequest: null,
      });
  ```

---

### 8. Database Schema: Non-Primary Key Relation Anti-Pattern
* **Location**: [prisma/schema.prisma:L36-70](file:///c:/Users/mdeft/Documents/qorix-review/prisma/schema.prisma#L36-L70)
* **Issue**:
  The `Store` table defines a UUID primary key `id` (`id String @id @default(uuid()) @db.Uuid()`), but every other model (`Subscription`, `StoreSettings`, `Review`, `Order`, etc.) references the `storeGID` (a long string like `gid://shopify/Shop/12345`) for foreign key relations:
  ```prisma
  model Subscription {
    storeId String @unique
    store   Store  @relation(fields: [storeId], references: [storeGID], onDelete: Cascade)
  }
  ```
* **Impact**: Poor database design. Referencing a long string (Shopify GID) instead of the compact indexed UUID primary key `id` as foreign keys wastes index storage, consumes unnecessary space, and significantly slows down table join operations.
* **Improvement**:
  Migrate foreign relations to point to the primary key UUID `id` of the `Store` model instead of `storeGID`.

---

### 9. SMTP Template Subject Typos
* **Location**: [app/routes/api.review/review.service.js:L204](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/api.review/review.service.js#L204)
* **Issue**:
  Line 204 references a property with a typo:
  ```javascript
  emailSettings.confirmatisonEmailSubject ?? "Thank you for your review"
  ```
* **Impact**: The settings option `emailSettings.confirmationEmailSubject` (without the extra `s`) won't be resolved, so emails will always fall back to `"Thank you for your review"`.

---

### 10. Background Worker Status Integration Gap
* **Location**: [app/lib/bullmq/bullmq.worker.js](file:///c:/Users/mdeft/Documents/qorix-review/app/lib/bullmq/bullmq.worker.js)
* **Issue**:
  When BullMQ worker executes emails, it does not update the order's `reviewCheckStatus` in the database to `"SENT"` or `"FAILED"`. In fact, the worker and queue service only receive `emailData` and have no access to the corresponding order's database `id` or `orderId` to update it.
* **Impact**:
  The requests list page in the admin panel will display `"Pending"` indefinitely even after the system successfully emails the customer.
* **Improvement**:
  Pass the database `orderId` and `storeId` inside the BullMQ job payload. In the worker completion and failure callbacks, write updates back to the database:
  ```javascript
  // On Success:
  await prisma.order.update({
    where: { storeId_orderId: { storeId, orderId } },
    data: { reviewCheckStatus: "SENT" },
  });
  ```
