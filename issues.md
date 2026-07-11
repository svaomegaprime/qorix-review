# Qorix Review — Comprehensive Audit Report

## How to Use

Issues are grouped by category with severity labels. Each issue includes file paths, line numbers, the problem description, impact, and fix guidance. Work through them in priority order: **Critical → High → Medium → Low**.

---

## Table of Contents

1. [Secrets & Credential Exposure](#1-secrets--credential-exposure)
2. [Security: IDOR (Insecure Direct Object Reference)](#2-security-idor)
3. [Security: XSS & Input Validation](#3-security-xss--input-validation)
4. [Security: Missing Protections](#4-security-missing-protections)
5. [Critical Logic Bugs](#5-critical-logic-bugs)
6. [Data Integrity & Race Conditions](#6-data-integrity--race-conditions)
7. [Error Handling](#7-error-handling)
8. [Performance & Database](#8-performance--database)
9. [Configuration & Environment](#9-configuration--environment)
10. [Webhook Reliability](#10-webhook-reliability)
11. [Database Schema & Prisma](#11-database-schema--prisma)
12. [Worker & Queue Issues](#12-worker--queue-issues)
13. [Code Quality & Duplication](#13-code-quality--duplication)
14. [Infrastructure & Production Readiness](#14-infrastructure--production-readiness)

---

## 1. Secrets & Credential Exposure

### 1.1 Secrets committed to `.env` in version control — ROTATE IMMEDIATELY
- **Severity**: 🔴 Critical
- **File**: `.env`
- **Issue**: The `.env` file contains actual production credentials: Shopify API secret, S3 keys, SMTP password, database connection string with credentials. These should NEVER be committed to git.
- **Impact**: Anyone with repo access has full Shopify API, S3, SMTP, and database access. All secrets must be rotated.
- **Fix**: Remove `.env` from git history (`git rm --cached .env`), add to `.gitignore`, rotate ALL credentials, use Shopify CLI secrets or a vault for production.

### 1.2 SMTP passwords stored in plaintext in database
- **Severity**: 🔴 Critical
- **File**: `prisma/models/settings.prisma:43`
- **Issue**: `smtpPassword String?` is stored in plaintext in the `EmailSettings` table.
- **Impact**: Database compromise exposes all store email credentials.
- **Fix**: Encrypt SMTP passwords at rest (e.g., using Node.js `crypto.createCipheriv` with app-level key).

### 1.3 Shopify access tokens stored in plaintext
- **Severity**: 🔴 Critical
- **File**: `prisma/schema.prisma:23`
- **Issue**: `accessToken String` — every store's Shopify API access token is stored in plaintext.
- **Impact**: Database breach exposes full API access to all stores.
- **Fix**: Encrypt access tokens at rest. Use Shopify's session storage encryption if available.

---

## 2. Security: IDOR

All settings endpoints accept a client-provided database ID and update the record **without verifying the authenticated store owns it**. Any store admin can modify any other store's data by guessing or brute-forcing UUIDs.

### 2.1 IDOR in Scheduling Settings (`app.index.jsx`)
- **Severity**: 🔴 Critical
- **File**: `app/routes/app.settings/routes/app.index.jsx:61-66`
- **Fix**: Add `storeSettingsId` from the authenticated store to the `where` clause.

### 2.2 IDOR in Email Settings (`app.email-settings.jsx`)
- **Severity**: 🔴 Critical
- **File**: `app/routes/app.settings/routes/app.email-settings.jsx:73-79`
- **Fix**: Look up `storeSettings` by the authenticated store's GID first; verify `storeSettingsId` matches.

### 2.3 IDOR in Publishing Moderation (`app.publishing-moderation.jsx`)
- **Severity**: 🔴 Critical
- **File**: `app/routes/app.settings/routes/app.publishing-moderation.jsx:43-48`

### 2.4 IDOR in Branding Settings (`app.branding.jsx`)
- **Severity**: 🔴 Critical
- **File**: `app/routes/app.settings/routes/app.branding.jsx:81-86`

### 2.5 IDOR in Admin Notification (`app.admin-notification.jsx`)
- **Severity**: 🔴 Critical
- **File**: `app/routes/app.settings/routes/app.admin-notification.jsx:42-47`

### 2.6 IDOR in Widgets Settings (`app.widgets.jsx`)
- **Severity**: 🔴 Critical
- **File**: `app/routes/app.settings/data/app.widgets.jsx:44-49`

### 2.7 IDOR in Review CRUD (Dashboard)
- **Severity**: 🔴 Critical
- **File**: `app/routes/app._index.jsx:58-73`
- **Issue**: PATCH/DELETE/PUT on reviews use `where: { id: reviewId }` without verifying `storeId`. Any store can modify/delete another's reviews.

### 2.8 IDOR in Review Moderation
- **Severity**: 🔴 Critical
- **File**: `app/routes/app.reviews/routes/app._index.jsx:168-238`
- **Issue**: Same pattern — review CRUD operations lack store ownership verification.

### 2.9 Logo upload lacks ownership validation
- **Severity**: 🔴 High
- **File**: `app/routes/app.settings/routes/app.branding.jsx:45-86`
- **Issue**: File upload and settings update don't verify the authenticated store owns the branding record.

---

## 3. Security: XSS & Input Validation

### 3.1 XSS in email templates via unescaped output
- **Severity**: 🔴 Critical
- **File**: `app/utils/template/ConfirmEmail.ejs:126`
- **Issue**: `<%- emailBody %>` renders unescaped HTML. `emailBody` contains user-submitted review data (name, body, etc.). An attacker can inject arbitrary JS/HTML by submitting a malicious review.
- **Impact**: Victims reading confirmation emails get XSS payloads executed in their email client.
- **Fix**: Use `<%=` (escaped output) or sanitize content before rendering. Never use `<%-` with user-controlled content.

### 3.2 Mass assignment on all settings endpoints
- **Severity**: 🔴 Critical
- **Files**: All 5 settings action files (same as IDOR list)
- **Issue**: `prisma.update({ where: { id: data.id }, data })` spreads the entire client payload. Attackers can set arbitrary DB fields including `storeSettingsId`, `storeId`, or `createdAt`.
- **Fix**: Whitelist allowed fields explicitly in the `data` object.

### 3.3 No server-side file validation on upload
- **Severity**: 🔴 High
- **File**: `app/lib/s3/uploadFile.js:10-55`
- **Issue**: No server-side file size limit or type validation. Client-side 20MB limit can be bypassed. MIME type prefix checks (e.g., `startsWith("image/")`) are trivially spoofable.
- **Fix**: Validate file magic bytes server-side, enforce size limit, scan for malware.

### 3.4 No rate limiting on public review submission
- **Severity**: 🔴 High
- **File**: `app/routes/api.review/review.service.js`
- **Issue**: The POST endpoint for review submission has NO rate limiting. Attackers can flood with spam reviews.
- **Fix**: Implement rate limiting (e.g., `express-rate-limit` or shopify-specific throttling).

### 3.5 Unsafe JSON.parse of user input
- **Severity**: 🔴 High
- **Files**: `app/routes/app.requests/routes/app._index.jsx:389,564`
- **Issue**: `JSON.parse(String(formData.get("orders") || "[]"))` without try-catch on the parse itself. Malformed JSON throws, potentially exposing error details.

### 3.6 No input sanitization on review body
- **Severity**: 🟠 Medium
- **File**: `app/routes/api.review/review.service.js:81-91`
- **Issue**: Review body and reviewer name are stored directly from form data without HTML sanitization. Stored content may be rendered unsafely in dashboard or email templates.

### 3.7 No validation on `rating` field (1-5 range)
- **Severity**: 🟠 Medium
- **File**: `app/routes/api.review/review.service.js:86`
- **Issue**: `rating: Number(formData.get("rating") || 0)` — no range check. Attackers can submit rating=0 or rating=999.

### 3.8 Potential path traversal via upload filename
- **Severity**: 🟠 Medium
- **File**: `app/lib/s3/uploadFile.js:35`
- **Issue**: `file.name` is used directly in S3 key without sanitization. A filename like `../../etc/passwd` could cause directory traversal in bucket storage.

---

## 4. Security: Missing Protections

### 4.1 No CORS headers on public API
- **Severity**: 🟠 Medium
- **File**: `app/routes/api.review/route.jsx:1-17`
- **Issue**: Public `/apps/api/review` endpoint returns no CORS headers. Storefront widgets loaded on custom domains may be blocked by browser CORS policy.
- **Fix**: Add `Access-Control-Allow-Origin: *` or use the requesting origin.

### 4.2 No CSRF protection on public API
- **Severity**: 🟠 Medium
- **File**: `app/routes/api.review/review.service.js`
- **Issue**: POST endpoint has no CSRF token validation. While not a standard requirement for public APIs, combined with no rate limiting, this enables cross-origin abuse.

### 4.3 List-Unsubscribe header misconfigured
- **Severity**: 🟠 Medium
- **File**: `app/utils/sendEmail.js:81-82`
- **Issue**: `List-Unsubscribe` uses the product page URL rather than an actual unsubscribe endpoint. Not RFC compliant and may be flagged by email providers.
- **Fix**: Implement a proper unsubscribe endpoint and use its URL here.

### 4.4 No product ownership verification in review submission
- **Severity**: 🟠 Medium
- **File**: `app/routes/api.review/review.service.js:86-90`
- **Issue**: `productId`, `productHandle`, `productTitle` are accepted from client without verifying they belong to the merchant's store.
- **Fix**: Verify product exists and belongs to store via GraphQL or local Order table.

---

## 5. Critical Logic Bugs

### 5.1 `isOpen` boolean always evaluates to `true`
- **Severity**: 🔴 Critical
- **File**: `app/routes/api.review/review.service.js:60`
- **Issue**: `const isOpen = Boolean(url.searchParams.get("isOpen")) || true;`. `Boolean(null)` = `false`, so `false || true` = `true` **always**. Should be `url.searchParams.get("isOpen") === "true"`.
- **Impact**: Every review submission attempts order line-item lookups (which likely fail silently), adding latency to every submission.

### 5.2 `review_count` metafield set to serialized reviews array
- **Severity**: 🔴 Critical
- **File**: `app/utils/updateProductReviewMetafield.js:65`
- **Issue**: `value: String(JSON.stringify(reviews))` — the entire reviews array is serialized as a string into the `review_count` metafield. This should be `String(reviewCount)`.
- **Impact**: Will exceed Shopify's metafield size limit. Leaks all customer rating data into metafields. The `review_count` field is completely unusable.

### 5.3 Cross-tenant SMTP singleton leak
- **Severity**: 🔴 Critical
- **File**: `app/utils/sendEmail.js:21-23`
- **Issue**: `let transporter = null` is a module-level singleton. Once created for Store A's SMTP config, ALL subsequent emails from ALL stores use Store A's transporter.
- **Impact**: Cross-tenant data leak and security breach. Store B's emails are sent through Store A's SMTP. Store A sees Store B's email traffic.
- **Fix**: Create a new transporter on every `sendEmail()` call, or use a per-store cached map.

### 5.4 `orderId` prepends "#" even when null
- **Severity**: 🟠 Medium
- **File**: `app/routes/api.review/review.service.js:61`
- **Issue**: `const orderId = "#" + url.searchParams.get("orderId") || "";` — operator precedence: evaluated as `("#" + url.searchParams.get("orderId")) || ""`. If param is null, `orderId` = `"#null"`.

### 5.5 Order cancellation sends emails instead of removing them
- **Severity**: 🔴 Critical
- **File**: `app/routes/webhooks.orders.cancelled.jsx:99-103`
- **Issue**: When `isSkipCancelledOrder` is `true` (skip emails for cancelled orders), the code enters the `if` block and **schedules** email jobs via `addJobInQueue`. This is the exact inverse of the intended behavior.
- **Fix**: Remove queued jobs via `removeJobInQueue` and set `reviewCheckStatus` to `FAILED`.

### 5.6 `isOrderCancel` only checks "refunded" status
- **Severity**: 🔴 High
- **File**: `app/routes/webhooks.orders.cancelled.jsx:100-102`
- **Issue**: Checks `formattedOrder.status === "refunded"`. Cancelled orders may have status "cancelled", "voided", or other values. Many cancellations will be missed.
- **Fix**: Check for `formattedOrder.cancelledAt || formattedOrder.status === "cancelled"` instead.

### 5.7 ID format mismatch in product verification
- **Severity**: 🔴 Critical
- **File**: `app/routes/api.review/middleware/checkPublishRules.js:18`
- **Issue**: `product.id === productId` — `getOrders()` returns `product.id` as full GID (`gid://shopify/Product/12345`), but `reviewData.productId` from form submission is a plain number string. Comparison **always returns false**.
- **Impact**: `isVerified` is **always** `false`, meaning ALL storefront reviews are classified as "unverified" even for legitimate customers.

### 5.8 Database settings default does not match UI options
- **Severity**: 🟢 Low
- **File**: `prisma/models/settings.prisma:115`
- **Issue**: Schema default for `storeLogoPosition` is `"LEFT"` but UI dropdown options are `"start"`, `"center"`, `"end"`. Default will never match any selection.

---

## 6. Data Integrity & Race Conditions

### 6.1 Review creation not wrapped in transaction
- **Severity**: 🔴 High
- **File**: `app/routes/api.review/review.service.js:120-132`
- **Issue**: Review is persisted first, then metafields and emails are sent. If email/metafields fail after the review is committed, the review exists in the DB but metafields are out of sync.
- **Fix**: Use `prisma.$transaction` for atomicity, or implement compensating actions.

### 6.2 Race condition: Redis job added before DB transaction
- **Severity**: 🔴 High
- **File**: `app/routes/webhooks.orders.updated.jsx:286-313,346-403`
- **Issue**: Jobs are added to Redis queue FIRST, then the order upsert DB transaction runs. If the transaction fails, Redis jobs reference non-existent order records — orphan jobs.
- **Fix**: Add jobs to Redis only AFTER the DB transaction succeeds.

### 6.3 Metafields not synced on review moderation
- **Severity**: 🔴 High
- **Files**:
  - `app/routes/app._index.jsx:58-74`
  - `app/routes/app.reviews/routes/app._index.jsx:168-238`
- **Issue**: PATCH (approve/reject) and DELETE on reviews never call `updateProductReviewDefineMetafields`.
- **Impact**: Product metafields (average rating, review count) fall permanently out of sync when review states change.

### 6.4 No cleanup on app uninstall
- **Severity**: 🔴 High
- **File**: `app/routes/webhooks.app.uninstalled.jsx:1-16`
- **Issue**: Only deletes sessions. Leaves behind `Order`, `Review`, `StoreSettings`, `Store` records. Orphan data accumulates forever.
- **Fix**: Cascade delete all store data on uninstall.

### 6.5 Duplicate metafield utility functions (inconsistent strategy)
- **Severity**: 🔴 High
- **Files**:
  - `app/utils/updateProductReviewMetafield.js` — uses keys `average_rating`, `review_count` (no namespace)
  - `app/utils/updateProductReviewDefineMetafields.js` — uses namespace `"reviews"` with keys `"rating"`, `"rating_count"`
- **Issue**: Both files exist but use different namespaces and keys. It's unclear which is actually used. The first one (6.5) also has the `review_count` bug (issue 5.2).
- **Fix**: Remove the duplicate and consolidate on one strategy.

---

## 7. Error Handling

### 7.1 BullMQ jobs swallow errors — jobs silently "succeed" on failure
- **Severity**: 🔴 Critical
- **File**: `app/lib/bullmq/bullmq.service.js:27-44,70-87`
- **Issue**: Both `scheduleEmailSend()` and `reminderEmailSend()` catch errors, log them with `console.log(error)`, and `return` (no re-throw). BullMQ marks these jobs as **completed** even when email sending fails. Despite `attempts: 3` in `addJobInQueue`, the retry mechanism never fires.
- **Fix**: Re-throw the error after the catch block so BullMQ retries failed jobs. Only update status to `FAILED` on final failure (after all retries exhausted).

### 7.2 No global unhandled rejection / uncaught exception handlers
- **Severity**: 🔴 High
- **File**: `app/routes/entry.server.jsx`
- **Issue**: No `process.on('uncaughtException')` or `process.on('unhandledRejection')` anywhere. Any unhandled promise rejection will crash the Node process silently.
- **Fix**: Add global error handlers that log the error and optionally attempt graceful shutdown.

### 7.3 Webhook error handling only catches P2002
- **Severity**: 🔴 High
- **File**: `app/routes/webhooks.orders.create.jsx:87-121`
- **Issue**: The catch block only handles `P2002` (unique constraint violation). Any other Prisma error re-throws and may cause an unhandled rejection in the webhook.

### 7.4 No error handling on uninstall/scope webhooks
- **Severity**: 🔴 High
- **Files**:
  - `app/routes/webhooks.app.uninstalled.jsx:4-15`
  - `app/routes/webhooks.app.scopes_update.jsx:4-21`
- **Issue**: No try-catch wrapping. If DB calls fail, the webhook returns an error response to Shopify (triggering retries) or crashes.

### 7.5 No error handling on GraphQL fetch calls
- **Severity**: 🟠 Medium
- **Files**:
  - `app/utils/sync.orders.js:46-58`
  - `app/utils/getProduct.js:2-24`
  - `app/utils/appMetafields.server.js:53-60,88,107-113`
- **Issue**: `admin.graphql()` and `fetch()` calls are not wrapped in try-catch. Network failures cause unhandled rejections.

### 7.6 API controller lacks error boundary
- **Severity**: 🟠 Medium
- **Files**:
  - `app/routes/api.review/route.jsx:4-13`
  - `app/routes/api.review/review.controller.js:2-12`
  - `app/routes/api.upload/route.jsx:10-13`
  - `app/routes/api.upload/upload.controller.js:2-16`
- **Issue**: No try-catch wrapping. Runtime errors propagate as unhandled rejections. Upload controller GET handler returns `undefined`.

### 7.7 Loaders without try-catch
- **Severity**: 🟢 Low (most are simple)
- **Files**: `app/routes/app.jsx:6-11`, `app/routes/app.reviews/route.jsx:4-7`, `app/routes/app.widgets/route.jsx:4-7`, `app/routes/app.requests/route.jsx:4-6`, `app/routes/app.settings/route.jsx:11-17`, `app/routes/auth.login/route.jsx:7-19`, `app/routes/_index/route.jsx:5-13`, `app/routes/auth.$.jsx:4-8`, and 8+ widget route loaders.
- **Fix**: Wrap all loaders/actions in try-catch. Follow the pattern described in AGENTS.md.

### 7.8 Only one ErrorBoundary in the entire app
- **Severity**: 🟠 Medium
- **File**: `app/routes/app.jsx:31-33`
- **Issue**: No child route has its own ErrorBoundary. Errors in child components are caught only by the top-level Shopify boundary, providing no contextual error information.

### 7.9 `getStoreData` returns null on error, callers may crash
- **Severity**: 🟠 Medium
- **File**: `app/utils/getStoreData.js:30`
- **Issue**: Errors cause the function to return `null`. Callers accessing `.id` on null result will get "Cannot read property 'id' of null" errors.

### 7.10 No abort timeout cleanup in SSR
- **Severity**: 🟢 Low
- **File**: `app/routes/entry.server.jsx:49`
- **Issue**: `setTimeout(abort, streamTimeout + 1000)` — if the stream completes before the timeout, there's no way to cancel it, potentially causing "Abort was called after being destroyed" error.

---

## 8. Performance & Database

### 8.1 Queries ALL orders instead of just the 250 from Shopify
- **Severity**: 🔴 High
- **File**: `app/routes/app.requests/utils/getOrdersWithStatus.server.js:19`
- **Issue**: `prisma.order.findMany({ where: { storeId } })` fetches EVERY historical order. On stores with 10K+ orders, this causes memory exhaustion and DB CPU spikes.
- **Fix**: Filter by `orderId: { in: orderIds }` (the 250 orders fetched from Shopify).

### 8.2 Syncs orders on every storefront review submission
- **Severity**: 🔴 High
- **File**: `app/routes/api.review/middleware/checkPublishRules.js:12-20`
- **Issue**: `getOrders(session.shop, session.accessToken)` — fetches 250 orders from Shopify GraphQL on every review submit. Adds seconds of latency, burns API rate limits.
- **Fix**: Query the local `Order` database table instead.

### 8.3 No pagination in order sync
- **Severity**: 🟠 Medium
- **File**: `app/utils/sync.orders.js:46-57`
- **Issue**: Uses `first: 250` with no `after` cursor. Only fetches the first 250 orders. Stores with more orders have incomplete data.
- **Fix**: Implement cursor-based pagination to fetch all orders.

### 8.4 Missing indexes on key query fields
- **Severity**: 🟠 Medium
- **File**: `prisma/models/`
- **Missing indexes**:
  - `HelpfulCount`: no index on `customerId` or `email`
  - `OrderLineItem`: no index on `productId`
  - `Review`: no index on `reviewerEmail` alone (only in compound key)
- **Impact**: Full table scans on these query patterns. Slows down as data grows.

### 8.5 GraphQL query requests fields that are never returned
- **Severity**: 🟠 Medium
- **File**: `app/utils/sync.orders.js:31-37`
- **Issue**: Query requests `product { id }` but NOT `handle` or `url`. Yet later code accesses `item.product?.handle` which is always `undefined`.

### 8.6 Redundant duplicate review existence check
- **Severity**: 🟢 Low
- **File**: `app/routes/webhooks.orders.updated.jsx:90-103,324-342`
- **Issue**: The same `prisma.review.findFirst` logic is executed twice in the same webhook handler.

---

## 9. Configuration & Environment

### 9.1 Hardcoded Redis connection (no env var support)
- **Severity**: 🔴 High
- **File**: `app/lib/redis/redis.js:3-7`
- **Issue**: `host: "localhost"`, `port: 6379` hardcoded. No `REDIS_URL` env var support.
- **Fix**: Use `process.env.REDIS_URL` with fallback.

### 9.2 Hardcoded S3 endpoint
- **Severity**: 🟠 Medium
- **File**: `app/lib/s3/s3.config.js:6`
- **Issue**: `endpoint: "http://bucket.zenexcloud.com:9000"` hardcoded. Uses HTTP not HTTPS.
- **Fix**: Use environment variable and enforce HTTPS.

### 9.3 Placeholder URLs in `shopify.app.toml`
- **Severity**: 🔴 High
- **File**: `shopify.app.toml:5,40`
- **Issue**: `application_url = "https://example.com"` and `redirect_urls = [ "https://example.com/api/auth" ]` — will cause OAuth redirect failures in production.

### 9.4 `SHOPIFY_APP_URL` empty in `.env`
- **Severity**: 🔴 High
- **File**: `.env:5`
- **Issue**: `SHOPIFY_APP_URL=` is empty. Used in `shopify.server.js:28` — empty app URL breaks OAuth.

### 9.5 API version mismatch across configs
- **Severity**: 🟠 Medium
- **Files**: `shopify.app.toml:12` uses `2026-07`, `shopify.server.js:26` uses `October25` (2025-10), `sync.orders.js:47` uses `2025-01`.
- **Issue**: Three different API versions across the codebase. Inconsistent API behavior and possible field-level issues.

### 9.6 Queue name hardcoded, constants file empty
- **Severity**: 🟢 Low
- **Files**: `app/lib/bullmq/bullmq.queue.js:27`, `app/lib/bullmq/constants.js`
- **Issue**: Queue name `"QUEUE_SCHEDULE_EMAIL"` is hardcoded. `constants.js` is completely empty.

### 9.7 Redis exposed without authentication
- **Severity**: 🔴 High
- **File**: `docker-compose.yml:7-8`
- **Issue**: Redis port `6379:6379` exposed to host without any password or authentication.
- **Fix**: Use `REDIS_URL` env var, add Redis password, don't expose port publicly.

---

## 10. Webhook Reliability

### 10.1 External GraphQL calls inside webhooks
- **Severity**: 🔴 High
- **Files**:
  - `app/routes/webhooks.orders.create.jsx:14-15`
  - `app/routes/webhooks.orders.updated.jsx:29-31`
  - `app/routes/webhooks.orders.cancelled.jsx:17-19`
- **Issue**: `getStoreData(admin)` makes a blocking GraphQL API call inside the 5-second webhook timeout window. Should query `prisma.store` locally via `shop` URL.
- **Fix**: `const store = await prisma.store.findFirst({ where: { storeURL: shop } })` instead.

### 10.2 Webhooks lack store identity timeout handling
- **Severity**: 🟠 Medium
- **Files**: Same as above
- **Issue**: If the GraphQL call times out, the webhook handler crashes silently.

### 10.3 App uninstall webhook doesn't clean up worker jobs
- **Severity**: 🔴 High
- **File**: `app/routes/webhooks.app.uninstalled.jsx`
- **Issue**: When a store uninstalls, Redis jobs for that store are never removed from the queue. The worker will attempt to send emails for a non-existent store.

---

## 11. Database Schema & Prisma

### 11.1 Non-primary key relation anti-pattern
- **Severity**: 🔴 High
- **File**: `prisma/schema.prisma:36-70`
- **Issue**: All models reference `storeGID` (a long string like `gid://shopify/Shop/12345`) instead of the UUID primary key `id`. Wasted index storage, slower joins.
- **Fix**: Migrate foreign relations to use the UUID primary key `id`.

### 11.2 No cascade delete on Session table
- **Severity**: 🟢 Low
- **File**: `prisma/schema.prisma:16-34`
- **Issue**: When a store is removed, sessions remain orphaned.

### 11.3 `redisBullmqJobId` stored as unstructured JSON
- **Severity**: 🟠 Medium
- **File**: `prisma/models/orders.prisma:29`
- **Issue**: Stored as `Json?` with no schema enforcement. Code expects `{ reviewRequestId, reminderJobId }` but any structure can be stored.

### 11.4 Unique constraint too restrictive on reviews
- **Severity**: 🟠 Medium
- **File**: `prisma/models/reviews.prisma:28`
- **Issue**: `@@unique([storeId, productId, reviewerEmail])` — prevents a customer from ever leaving more than one review per product. No way to update or replace.

---

## 12. Worker & Queue Issues

### 12.1 Worker started with `vite-node` (dev tool) in production
- **Severity**: 🟠 Medium
- **File**: `package.json:21`
- **Issue**: `"worker": "vite-node app/lib/bullmq/bullmq.worker.js"` — `vite-node` is a dev tool. May cause memory leaks or slower startup in production.
- **Fix**: Build the worker file separately and use `node` to run it.

### 12.2 Worker events don't update database status
- **Severity**: 🟠 Medium
- **File**: `app/lib/bullmq/bullmq.worker.js:29-36`
- **Issue**: `"completed"` and `"failed"` event handlers only log to console. The DB status update in the service layer is the only mechanism — if that fails, the worker event provides no fallback.

### 12.3 No error handling on queue creation
- **Severity**: 🟠 Medium
- **File**: `app/lib/bullmq/bullmq.queue.js:4-8`
- **Issue**: `createQueue()` instantiates `new Queue(...)` synchronously but Redis connection may fail. No error handler attached.

### 12.4 Duplicate code between `scheduleEmailSend` and `reminderEmailSend`
- **Severity**: 🟢 Low
- **File**: `app/lib/bullmq/bullmq.service.js:4-88`
- **Issue**: Both functions are nearly identical (90%+ code duplication). Should be refactored.

---

## 13. Code Quality & Duplication

### 13.1 SMTP subject typo
- **Severity**: 🟠 Medium
- **File**: `app/routes/api.review/review.service.js:272`
- **Issue**: `confirmatisonEmailSubject` (typo) should be `confirmationEmailSubject`. The setting is never read correctly; default fallback always used.

### 13.2 `formatOrder` and `getRelativeTime` duplicated across 4 files
- **Severity**: 🟢 Low
- **Files**: `webhooks.orders.create.jsx`, `webhooks.orders.updated.jsx`, `webhooks.orders.cancelled.jsx`, `sync.orders.js`
- **Fix**: Centralize into a shared utility file.

### 13.3 `randomUUID` import may fail on older Node versions
- **Severity**: 🟠 Medium
- **File**: `app/routes/app.requests/routes/app._index.jsx:10`
- **Issue**: `import { randomUUID } from "crypto"` requires Node 19+ or explicit import. Use `crypto.randomUUID()` instead.

### 13.4 Gravatar uses MD5 (cryptographically broken)
- **Severity**: 🟠 Medium
- **Files**: All webhook handlers and `sync.orders.js` (MD5 for Gravatar)
- **Issue**: MD5 is cryptographically broken. Use SHA-256 for Gravatar hashing instead.

### 13.5 Dashboard Search uses POST (breaks browser navigation)
- **Severity**: 🟢 Low
- **File**: `app/routes/app.reviews/routes/app._index.jsx:155-167`
- **Issue**: Filter/submit actions use POST, which prevents browser back/forward button from working.

### 13.6 Export CSV ignores active filter set
- **Severity**: 🟢 Low
- **File**: `app/routes/app.reviews/routes/app._index.jsx:271-277`
- **Issue**: `exportRows` always uses `[...reviews]` (all from loader), not `baseReviews` (filtered via fetcher).

### 13.7 Only shows error toasts, never success toasts
- **Severity**: 🟢 Low
- **File**: `app/utils/useAdminFetcherToast.js:7-8`
- **Issue**: Checks `fetcher.data.ok !== false`. Never shows success messages when `ok: true`.

### 13.8 Unused import of TEMP_REVIEWS
- **Severity**: 🟢 Low
- **File**: `app/routes/app.reviews/routes/app._index.jsx:1`
- **Issue**: `import TEMP_REVIEWS from "../data/reviews.json"` — imported but never used.

### 13.9 Unnecessary GraphQL query before every metafield write
- **Severity**: 🟢 Low
- **File**: `app/utils/appMetafields.server.js:88`
- **Issue**: `setAppMetafield` calls `getAppInstallationMetafields` first every time. The `currentAppInstallationId` doesn't change per-call.

### 13.10 Default settings contain example/placeholder data
- **Severity**: 🟢 Low
- **File**: `app/routes/app.settings/data/defaultData.js`
- **Issue**: Contains example values like `"Glow Store"`, `"hello@glowstore.com"`, `"example@gmail.com"`. New stores that don't configure branding will send emails with these placeholders.

### 13.11 Phone number regex over-matches
- **Severity**: 🟢 Low
- **File**: `app/routes/api.review/middleware/contentFilter.js:32-34`
- **Issue**: Phone number regex is overly broad and may match numeric strings like order numbers or dates, replacing them with `****`.

---

## 14. Infrastructure & Production Readiness

### 14.1 Dockerfile runs `npm run dev` as CMD
- **Severity**: 🟠 Medium
- **File**: `Dockerfile:18`
- **Issue**: `CMD ["npm", "run", "dev"]` in production. Combined with `NODE_ENV=production`, this is contradictory and may cause unexpected behavior.
- **Fix**: Use `npm run start` (which runs `react-router-serve`).

### 14.2 Dockerfile doesn't start the BullMQ worker
- **Severity**: 🟠 Medium
- **File**: `Dockerfile`
- **Issue**: Only the web server runs. Background email jobs will never be processed in Docker deployments.

### 14.3 Login page uses static placeholder content
- **Severity**: 🟢 Low
- **File**: `app/routes/auth.$.jsx:21,23`
- **Issue**: "A short heading about [your app]" and placeholder feature list items.

### 14.4 `console.log` statements leak sensitive data
- **Severity**: 🟢 Low
- **Files**: Multiple files including `review.service.js:109`, `upload.service.js:21`, `sendEmail.js:91`, `bullmq.service.js`
- **Issue**: Various `console.log` statements output order data, uploaded file URLs, and other potentially sensitive information. In production, use structured logging.

---

## Severity Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 18 |
| 🔴 High | 24 |
| 🟠 Medium | 32 |
| 🟢 Low | 28 |

**Total: 102 issues found**

(Original 10 issues from the first audit are included and expanded in this document.)
