# needImprove.md — Qorix Review Project Audit

> **Severity**: 🔴 Critical (silent failure / data loss / security) | 🟠 High (broken flow / wrong behavior) | 🟡 Medium (maintenance / inconsistency) | 🔵 Low (code quality)

---

## 🔴 CRITICAL — Silent Failures & Logic Bugs (No Response to User)

### 1. Cancellation webhook: main email block NEVER executes
**File**: `app/routes/webhooks.orders.cancelled.jsx:45-52,110`  
**Bug**: The condition `if (isRefunded && isOrderCancelled && isCorrectOrderValue)` at line 110 can **never be true**.  
- `isRefunded` requires `status === "refunded"` or `"partially_refunded"` (line 46-48)  
- `isOrderCancelled` requires `status === "cancelled"` (line 51)  
- These statuses are **mutually exclusive**. The AND condition means **no email is ever scheduled from the cancellation webhook**.  
**Impact**: Review requests are never sent when an order is cancelled. Complete silent failure.

### 2. Cancellation webhook: skip logic inverted
**File**: `app/routes/webhooks.orders.cancelled.jsx:314`  
**Bug**: `if (!isRefunded || !isOrderCancelled)` — When `isSkipCancelledOrder = true`, the code sets `isOrderCancelled = false`. This means `!false = true`, so the "remove jobs" block **always** runs regardless of skip settings.  
**Impact**: Jobs are always removed or status always updated when a cancellation webhook arrives, regardless of store settings.

### 3. `isOpen` query parameter always true
**File**: `app/routes/api.review/review.service.js:60,416`  
**Code**: `const isOpen = Boolean(url.searchParams.get("isOpen")) || true;`  
**Bug**: `Boolean(null) || true` → `false || true` → `true`. The `isOpen` param has no effect. Every review is treated as "open" (coming from storefront widget).  
**Impact**: The order OPENED status tracking fires on EVERY review fetch, not just storefront ones. Silent.

### 4. `orderId` always prefixed with `"#"`, never falls back to `""`
**File**: `app/routes/api.review/review.service.js:61,417`  
**Code**: `const orderId = "#" + url.searchParams.get("orderId") || "";`  
**Bug**: Operator precedence: `("#" + null) || ""` → `"#null" || ""` → `"#null"`. The fallback never works.  
**Impact**: `orderId` becomes `"#null"` when not provided. Order lookup always fails silently.

### 5. Cross-store SMTP credential leak
**File**: `app/utils/sendEmail.js:21-38`  
**Bug**: `let transporter = null;` is a **module-level singleton**. Once a transporter is created for Store A's SMTP, ALL subsequent emails for ALL stores use Store A's SMTP credentials.  
**Impact**: Emails from Store B are sent using Store A's SMTP server. Complete cross-store data leak. **Data breach**.

### 6. IDOR — All settings actions update by ID without store verification
**Files**:  
- `app/routes/app.settings/routes/app.admin-notification.jsx:42-46`  
- `app/routes/app.settings/routes/app.branding.jsx:81-86`  
- `app/routes/app.settings/routes/app.publishing-moderation.jsx:43-48`  
- `app/routes/app.settings/routes/app.index.jsx:61-66`  
- `app/routes/app.settings/routes/app.email-settings.jsx:73-79`  

**Bug**: All settings actions update records by `id` from the request body **without verifying the caller owns that record**. A malicious store admin could guess or enumerate IDs and modify another store's settings.  
**Impact**: Security vulnerability — any store can modify any other store's settings (SMTP credentials, branding, moderation rules, etc.).

### 7. Review moderation (approve/reject/delete) does NOT sync metafields
**File**: `app/routes/app.reviews/routes/app._index.jsx:169-178,214-218`  
**Bug**: When reviewing a review (PATCH), or deleting a review (DELETE), `updateProductReviewDefineMetafields` is **never called**. The Shopify product metafields (`reviews.rating` and `reviews.rating_count`) become stale.  
**Impact**: Storefront displays wrong average rating and review count until next review submission.

### 8. Confirmation email uses wrong email body field
**File**: `app/routes/webhooks.orders.cancelled.jsx:174`  
**Bug**: `requestEmailBody: formetEmailBody(storeSettings?.emailSettings?.reminderEmailBody)` — The request email template receives the **reminder** email body instead of the request email body.  
**Impact**: Customers get wrong email content in request emails from cancellation flow.

### 9. `updateProductReviewMetafield.js` stores full array as `number_integer`
**File**: `app/utils/updateProductReviewMetafield.js:65`  
**Code**: `value: String(JSON.stringify(reviews))`  
**Bug**: The metafield is declared as `type: "number_integer"` but the value is the entire serialized reviews array. Shopify will reject this type/value mismatch.  
**Impact**: Metafield set fails silently, product review count never updated on storefront.

### 10. App uninstall only deletes sessions — data leak
**File**: `app/routes/webhooks.app.uninstalled.jsx:12`  
**Bug**: Only `db.session.deleteMany({ where: { shop } })` is called. Store data (orders, reviews, settings, widgets) is **never cleaned up**.  
**Impact**: Orphaned data accumulates in database forever. For SaaS, this is a GDPR liability.

### 11. `docker-start` script is broken — worker never starts
**File**: `package.json` (script: `docker-start`)  
**Code**: `npm run setup && npm run start && npm run worker`  
**Bug**: `npm run start` runs `react-router-serve ./build/server/index.js` — a **long-running server process**. `npm run worker` after `&&` will **never execute**.  
**Impact**: Docker deployment has no background worker. Emails never send.

### 12. `confirmatisonEmailSubject` typo — wrong field referenced
**File**: `app/routes/api.review/review.service.js:270`  
**Bug**: `emailSettings.confirmatisonEmailSubject` — missing an "i" after "t". The correct Prisma field is `confirmationEmailSubject`. This always evaluates to `undefined`.  
**Impact**: Confirmation email subject always falls back to hardcoded default, ignoring store settings.

---

## 🟠 HIGH — Broken Flow / Wrong Behavior

### 13. Hardcoded Redis connection (localhost:6379)
**File**: `app/lib/redis/redis.js:4-5`  
**Bug**: `host: "localhost", port: 6379` — Hardcoded. AGENTS.md explicitly says to use `REDIS_URL` env var.  
**Impact**: Won't connect in any non-local environment.

### 14. Hardcoded S3 endpoint
**File**: `app/lib/s3/s3.config.js:6`  
**Bug**: `endpoint: "http://bucket.zenexcloud.com:9000"` — Hardcoded MinIO-like endpoint.  
**Impact**: Only works with that specific S3-compatible endpoint. Won't work with AWS S3, DigitalOcean Spaces, etc.

### 15. `getStoreData(admin)` in webhooks (unnecessary GraphQL call)
**Files**:  
- `app/routes/webhooks.orders.cancelled.jsx:22`  
- `app/routes/webhooks.orders.create.jsx:15`  
- `app/routes/webhooks.orders.updated.jsx:30`  

**Bug**: AGENTS.md explicitly says "Avoid `getStoreData(admin)` in webhooks — it makes an unnecessary GraphQL call."  
**Impact**: Wastes Shopify API quota and adds latency to time-sensitive webhooks (<5s response required).

### 16. `checkPublishRules` fetches ALL orders with admin token in public API
**File**: `app/routes/api.review/middleware/checkPublishRules.js:12`  
**Code**: `getOrders(session.shop, session.accessToken)`  
**Bug**:  
- Fetches ALL orders (max 250) from Shopify to check if reviewer is verified purchaser  
- Uses `session.accessToken` from `authenticate.public.appProxy` — this session may not have admin-level access  
- For stores with >250 orders, verified purchasers may be missed  
**Impact**: Either crashes or misses verification checks. Heavy performance cost per review submission.

### 17. `getOrdersWithStatus.server.js` queries ALL orders with no filter
**File**: `app/routes/app.requests/utils/getOrdersWithStatus.server.js:18-30`  
**Bug**: `prisma.order.findMany({ where: { storeId } })` — No limit clause. AGENTS.md warns about this.  
**Impact**: Memory exhaustion for stores with thousands of orders.

### 18. `getOrders` GraphQL query — `handle` and `url` fields don't exist in response
**File**: `app/utils/sync.orders.js:99-103`  
**Bug**: `item.product?.handle || null` — The GraphQL query for `lineItems` only requests `product { id }`. `handle` and `url` are **not queried** and will always be `null`.  
**Impact**: Product handles/URLs are always null when fetched through this path.

### 19. API version inconsistency (3 different versions)
**Files**:  
- `shopify.app.toml`: `api_version = "2026-07"`  
- `app/shopify.server.js:26`: `ApiVersion.October25`  
- `app/utils/sync.orders.js:47`: `/admin/api/2025-01/graphql.json`  

**Bug**: Three different API versions. `October25` is a deprecated/removed stable version.  
**Impact**: Features may break when old versions are sunset.

### 20. Empty `api.unsubscribe` route directory
**File**: `app/routes/api.unsubscribe/` (empty directory, no route files)  
**Bug**: The directory exists but contains no route files. Any request to this path will result in a 404 or unexpected behavior.  
**Impact**: Unsubscribe links in emails may break.

### 21. `getOrders` in sync.orders.js fetches only 250 orders
**File**: `app/utils/sync.orders.js:56`  
**Bug**: `variables: { first: 250 }` — Hardcoded limit with no pagination. Only the most recent 250 orders are fetched.  
**Impact**: Stores with >250 orders will have incomplete data in the Requests page.

### 22. `formetEmailBody` replaces `{{first_name}}` with empty string
**File**: `app/routes/webhooks.orders.cancelled.jsx:98, app/routes/webhooks.orders.updated.jsx:109`  
**Bug**: `.replace(/{{first_name}}/g, "")` — The first name placeholder is replaced with **empty string** instead of the actual customer name.  
**Impact**: "Hi {{first_name}}" becomes "Hi " in emails.

### 23. No null check on `storeSettings` in cancellation webhook
**File**: `app/routes/webhooks.orders.cancelled.jsx:46`  
**Bug**: `storeSettings.requestScheduling.isSkipRefundedOrder` — If `storeSettings` is `null` (store setup incomplete), this throws `TypeError: Cannot read properties of null`.  
**Impact**: Webhook crashes silently, 500 response to Shopify, webhook gets retried.

### 24. `review.service.js` response hides side-effect failures
**File**: `app/routes/api.review/review.service.js:395-403`  
**Bug**: Both success paths return `"Review submitted successfully"` — whether side effects (metafield sync, emails) succeeded or failed.  
**Impact**: Store admin thinks everything worked, but metafields haven't been updated or emails haven't been sent.

### 25. Export CSV includes `reviewerPhone` phantom field
**File**: `app/routes/app.reviews/routes/app._index.jsx:57`  
**Bug**: `reviewerPhone` is referenced in export but this field doesn't exist in the Review model export. It will always be empty.  
**Impact**: Misleading export schema. Importers expecting this field will get empty data.

---

## 🟡 MEDIUM — Maintenance / Inconsistency / Reliability

### 26. Multiple `console.log` statements in production code
**Files**: Many files throughout the project.  
**Bug**: Excessive `console.log` statements for debugging that should be removed or replaced with proper logging.  
**Impact**: Log pollution, potential PII leakage in production logs.

### 27. `storeId` pattern inconsistency
**Bug**: Some models use `storeId` as a string reference to `storeGID`, others use `storeGID` directly. Settings models reference `StoreSettings` via `storeSettingsId`.  
**Impact**: Confusing data model. AGENTS.md acknowledges this as known anti-pattern.

### 28. Prisma `reviewerPhone` field defined but never used
**File**: `prisma/models/reviews.prisma:12`  
**Bug**: `reviewerPhone String?` is defined but never collected in the review form, never set in any service.  
**Impact**: Dead column in database.

### 29. `isSpamFilter` setting defined but never implemented
**File**: `prisma/models/settings.prisma:77`, `app/routes/app.settings/data/defaultData.js:50`  
**Bug**: `isSpamFilter Boolean @default(true)` is stored but there is **no spam filter logic** anywhere in the codebase.  
**Impact**: Mismatched setting — users can toggle it but it does nothing.

### 30. Review DELETE has no confirmation dialog
**File**: `app/routes/app.reviews/routes/app._index.jsx`  
**Bug**: No `confirm()` or modal before deleting a review.  
**Impact**: Accidental data loss with no undo.

### 31. Both `require` and `import` used (via ESLint config)
**Bug**: Mixed module systems in the codebase.  
**Impact**: Potential ESM/CJS interop issues.

### 32. Global PrismaClient not declared in TypeScript
**File**: `app/db.server.js:5`  
**Bug**: `global.prismaGlobal = new PrismaClient()` — TypeScript will error on `prismaGlobal` not being on the `global` type.  
**Impact**: Typecheck should fail on this.

### 33. `isFileLike` check may not work in all environments
**File**: `app/utils/isFileLike.js`  
**Bug**: Checks `typeof value.arrayBuffer === "function"` — In some serverless/edge environments, File/Blob may not have `arrayBuffer`.  
**Impact**: File uploads may silently fail.

### 34. No rate limiting on review submission API
**File**: `app/routes/api.review/route.jsx`  
**Bug**: The public API has no rate limiting.  
**Impact**: Vulnerable to spam/bot attacks.

### 35. Webhook handlers return 200 even on errors
**Files**: All webhook files.  
**Bug**: Webhooks often return 200 after catching errors silently (e.g., P2002 catch in orders.create).  
**Impact**: Shopify thinks the webhook succeeded, the error is hidden.

### 36. `trustBarWidgets` relation misspelled in Store model
**File**: `prisma/schema.prisma:44`  
**Bug**: `TrustBarWidget` model exists but Prisma relation field is `trustBarWidgets` (plural instead of singular/consistent).  
**Impact**: Minor inconsistency.

---

## 🔵 LOW — Code Quality / Cleanliness

### 37. Duplicate `getRelativeTime` function in multiple files
**Files**:  
- `app/routes/webhooks.orders.cancelled.jsx:400-417`  
- `app/routes/webhooks.orders.create.jsx:172-189`  
- `app/routes/webhooks.orders.updated.jsx:458-475`  
- `app/utils/sync.orders.js:109-126`  

**Bug**: The exact same `getRelativeTime` function is copy-pasted in 4 files.  
**Impact**: Maintainability nightmare.

### 38. Duplicate `formatOrder` function in 3 webhook files
**Files**:  
- `app/routes/webhooks.orders.cancelled.jsx:359-398`  
- `app/routes/webhooks.orders.create.jsx:132-170`  
- `app/routes/webhooks.orders.updated.jsx:417-455`  

**Bug**: Same function copy-pasted.  
**Impact**: Changes need to be made in 3 places.

### 39. Duplicate product enrichment logic in 3+ files
**Files**:  
- `app/routes/webhooks.orders.cancelled.jsx:112-147`  
- `app/routes/webhooks.orders.updated.jsx:145-183`  
- `app/routes/app.requests/routes/app._index.jsx:161-203,410-448`  

**Bug**: Same `getProduct` → enrich pattern duplicated.  
**Impact**: High maintenance cost.

### 40. `bullmq.service.js` identical functions
**File**: `app/lib/bullmq/bullmq.service.js`  
**Bug**: `scheduleEmailSend` and `reminderEmailSend` are identical except for the name.  
**Impact**: Dead code / unnecessary duplication.

### 41. Empty `constants.js`
**File**: `app/lib/bullmq/constants.js` (empty file)  
**Bug**: The file exists but contains nothing.  
**Impact**: Confusing import expectations.

### 42. Unused `TEMP_REVIEWS` import
**File**: `app/routes/app.reviews/routes/app._index.jsx:1`  
**Code**: `import TEMP_REVIEWS from "../data/reviews.json";`  
**Bug**: `TEMP_REVIEWS` is never used.  
**Impact**: Dead import.

### 43. Commented-out code blocks throughout
**Files**: Multiple files have large commented-out code blocks (e.g., import modal in `app.reviews`, weekly summary in `app.admin-notification`).  
**Impact**: Readability suffers.

### 44. Default data references example store
**File**: `app/routes/app.settings/data/defaultData.js:67-98`  
**Bug**: Default brand settings refer to "Glow Store", "Osman from Glow Store", "hello@glowstore.com", "https://www.glowstore.com".  
**Impact**: New stores start with placeholder/branded data that must be manually changed.

### 45. `upload.controller.js` GET returns `undefined`
**File**: `app/routes/api.upload/upload.controller.js:8`  
**Code**: `case "GET": return ;`  
**Impact**: Will return `undefined` — likely causes issues if GET is called.

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 12 |
| 🟠 High | 13 |
| 🟡 Medium | 11 |
| 🔵 Low | 9 |
| **Total** | **45** |

### Top 5 things to fix first:
1. **Cross-store SMTP leak** (`sendEmail.js` transporter singleton) — data breach
2. **IDOR vulnerabilities** in all settings actions — security  
3. **Cancellation webhook logic** — review requests never send for cancelled orders  
4. **`isOpen` always true** — broken order tracking  
5. **`getStoreData` in webhooks** — wasted API calls causing timeouts
