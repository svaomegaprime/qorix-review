# DRY Refactoring Plan

## Purpose

Reduce duplicated behaviour without changing Shopify routes, database contracts, email content, or widget output. This is a refactoring plan, not a mandate to turn every similar-looking component into a generic abstraction.

## Audit summary (12 July 2026)

The clearest duplication is in a few repeated cross-cutting workflows:

| Area | Confirmed locations | Why it matters |
| --- | --- | --- |
| Widget route shells | Six `app/routes/app.widgets/routes/*/route.jsx` files | The files have the same loader and outlet fallback, differing only in a log message. |
| Settings save bar | `app.index.jsx`, `app.email-settings.jsx`, `app.branding.jsx`, `app.admin-notification.jsx`, `app.publishing-moderation.jsx`, and `data/app.widgets.jsx` | Repeated dirty-state comparison, save/discard handlers, and `<ui-save-bar>` markup can drift. |
| Order formatting | `webhooks.orders.create.jsx`, `webhooks.orders.updated.jsx`, `webhooks.orders.cancelled.jsx` | Each contains `formatOrder()` and a local relative-time formatter; a canonical `getRelativeTime` utility already exists. |
| Product GID conversion | order webhooks, requests route, and both product-review metafield utilities | Small differences in ID handling can cause malformed GraphQL IDs. |
| Email payloads | order webhooks, requests route, review routes, and `api.review/review.service.js` | SMTP and branding/template fields are repeated. This is workflow-sensitive, so it must be consolidated carefully. |
| Review mutations | `app._index.jsx` and `app.reviews/routes/app._index.jsx` | Attachment deletion and review-status changes are duplicated. |

The largest files are the requests route (1,252 lines), reviews route (957 lines), and several widget editor/preview files (roughly 440–875 lines). Size alone is not duplication: refactor those only after extracting the confirmed shared behaviour above.

## Rules for every phase

1. Preserve existing route URLs, loader/action response shapes, Prisma schema, email templates, and Liquid/widget public settings.
2. Move one behaviour at a time. Do not combine feature changes, renames, formatting-only churn, and refactoring in one pull request.
3. Put server-only code in `*.server.js` modules. Do not import Prisma, Shopify admin clients, S3, or Node-only libraries into client-rendered route code.
4. Prefer a focused function or hook with an explicit contract over a universal component with many flags.
5. Add JSDoc parameter/return types to every new shared JavaScript module and document its error behaviour.
6. After each phase, run `npm run lint` followed by `npm run typecheck`. For webhook, email, or upload work, also complete the relevant manual checklist below.

## Step-by-step implementation plan

### Phase 0 — Establish a safe baseline

1. Create a refactoring branch and record the current `npm run lint` and `npm run typecheck` results.
2. List the manual smoke paths that currently work: install/load the embedded app, open every settings page, save/discard each settings form, open each widget editor, receive an order-created/updated/cancelled webhook, send a review request, submit a review, and delete a review with an attachment.
3. Add a short `README` section or this document's completion log for each refactoring PR: files changed, behaviour preserved, commands run, and manual checks completed.
4. Do not start broad UI extraction until the safe mechanical phases below have passed their checks.

**Exit criteria:** baseline quality results and smoke-path evidence are recorded. No production behaviour has changed.

### Phase 1 — Eliminate exact, low-risk duplication

1. Create `app/utils/formatOrder.js` and move the canonical `formatOrder(order)` implementation there. It must retain the current fields (`orderId`, customer fallback name, Gravatar URL, prices, and mapped line items).
2. Delete the three local `formatOrder()` copies from:
   - `app/routes/webhooks.orders.create.jsx`
   - `app/routes/webhooks.orders.updated.jsx`
   - `app/routes/webhooks.orders.cancelled.jsx`
3. Replace all local `getRelativeTime()` definitions in those webhook routes and `app/utils/sync.orders.js` with imports from `app/utils/getRelativeTime.js`. First compare outputs for invalid, current, and historical dates; preserve the existing behaviour or explicitly correct it in a separate bug-fix PR.
4. Create `app/utils/shopifyGid.js` with a narrowly scoped `toProductGid(productId)` helper. It must return an existing Product GID unchanged, convert a numeric/string ID once, and return `null`/`undefined` safely for missing input.
5. Replace hand-built `gid://shopify/Product/...` conversions in:
   - `app/utils/updateProductReviewMetafield.js`
   - `app/utils/updateProductReviewDefineMetafields.js`
   - `app/routes/app.requests/routes/app._index.jsx`
   - `app/routes/webhooks.orders.updated.jsx`
   - `app/routes/webhooks.orders.cancelled.jsx`
6. Create a tiny reusable widget shell component or factory for the six identical `route.jsx` files under `app/routes/app.widgets/routes/`. Keep the individual route files as thin imports/exports so the current file-based routing remains intact. Remove the loader `console.log` calls rather than preserving a different log string per route.

**Exit criteria:** no local `formatOrder` or local `getRelativeTime` definitions remain; Product GID conversion has one implementation; every widget URL and index fallback still renders.

### Phase 2 — Centralize server-side review and order persistence

1. Add a server-only review service, for example `app/services/reviews.server.js`, with:
   - `updateReviewStatus({ reviewId, status, storeId })`
   - `deleteReviewWithAttachments({ reviewId, storeId })`
2. Move the duplicated status update and attachment/S3 cleanup from `app/routes/app._index.jsx` and `app/routes/app.reviews/routes/app._index.jsx` into that service.
3. Authorize the store before every mutation and scope each Prisma `where` clause by the store. Define the deletion order: load review and attachment URLs, delete S3 objects with logged best-effort failures, then delete the database record (or retain a recoverable record if storage deletion must be atomic).
4. Extract the order header + line-item transaction from `webhooks.orders.create.jsx` into `app/services/orders.server.js`. Its input should be a formatted order and store ID; it should own replacing the line items and the duplicate-webhook/idempotency handling.
5. Adopt the service only in `ORDERS_CREATE` first. Compare its persisted order/line-item shape with a real webhook payload before extending it to requests or other webhook topics.

**Exit criteria:** the duplicated route actions only authenticate, validate input, call a service, and form the HTTP response. Repeated webhook delivery does not create duplicate order data.

### Phase 3 — Standardize email payload construction

1. Inspect the EJS template variables used by `RequestsEmail`, `ReminderEmail`, `ReplyEmail`, `ConfirmEmail`, and `AdminNotify` before moving fields. Write down required versus optional variables.
2. Create `app/services/email-payload.server.js` with small composable builders rather than one all-purpose object:
   - `buildSmtpConfig(emailSettings)`
   - `buildBrandingTemplateData(brandingSettings)`
   - `buildRequestEmailPayload(...)`
   - `buildReminderEmailPayload(...)`
   - `buildReplyEmailPayload(...)`
3. Rename `formetEmailBody.js` to `formatEmailBody.js` and update imports. Keep a temporary forwarding module only if a staged migration needs it; remove that forwarding module before the phase closes.
4. Replace local body-formatting functions and repeated SMTP/branding blocks first in `webhooks.orders.updated.jsx` and `webhooks.orders.cancelled.jsx`, then in the requests, reviews, dashboard, and API review flows.
5. Ensure builders do not log SMTP passwords or expose them in loader data or client responses.
6. Compare a rendered sample of every affected EJS template before and after. Check subject, recipient, sender, reply-to, product URL, branding colors, footer, unsubscribe link, and button text.

**Exit criteria:** SMTP field mapping and branding fields each have one source of truth; all email template variables still render and no credentials appear in logs/responses.

### Phase 4 — Extract the settings dirty/save lifecycle

1. Define the shared contract from the existing settings pages: initial value, draft value, normalized saved value after an action, submit callback, discard callback, and optional reset key.
2. Implement a client-only hook, for example `app/hooks/useSaveBarForm.js`, that:
   - compares draft and saved values;
   - shows/hides a caller-supplied unique save-bar ID;
   - submits through the supplied `fetcher` callback;
   - updates saved state only from a successful response;
   - resets draft state on discard; and
   - hides the bar on unmount.
3. Implement a small `SaveBar` presentation component for the repeated `<ui-save-bar>` buttons. The hook owns behaviour; the component should not know Prisma models or form fields.
4. Migrate one simple page first: `app.settings/routes/app.publishing-moderation.jsx`. Verify save, discard, browser navigation prompt, and a failed request.
5. Migrate `app.index.jsx`, `app.admin-notification.jsx`, `data/app.widgets.jsx`, and `app.branding.jsx` one page at a time.
6. Migrate `app.email-settings.jsx` last because it normalizes defaults and replaces its saved state from `fetcher.data.emailSettings`; preserve that special success behaviour explicitly.
7. Keep individual loader/action queries initially. Do not create a generic `prisma[model].update` action: models have different authorization, validation, multipart, upsert, and response requirements.

**Exit criteria:** each page has exactly one dirty-state/save-bar lifecycle, but keeps its own validation and persistence action. Save/discard works after loader revalidation and failed submissions.

### Phase 5 — Reduce repeated route auth and settings queries cautiously

1. Add a server-only `requireAdminContext(request)` helper returning `{ admin, session, storeId }`; it should authenticate and call `getStoreData(admin)` exactly once.
2. Migrate only routes that need all three values. Routes that only authenticate should continue to call `authenticate.admin(request)` directly.
3. Add a focused `getStoreSettings(storeId, include)` repository helper only after confirming the same Prisma `include` shape occurs at least three times. Keep each caller's explicit `include` object; avoid a giant default include that loads unnecessary relations.
4. Replace unused destructured `session`/`admin` variables and diagnostic `console.log` calls while touching these routes. Preserve meaningful error logs without credentials or customer personal data.

**Exit criteria:** repeated admin/store lookup has one implementation where appropriate; loaders do not fetch relations they do not use.

### Phase 6 — Review list/request list and widget editors separately

1. Map the actual shared UI contracts before extracting components: pagination state, filters, sort, date range, empty state, row actions, selection, and loader data.
2. Extract only neutral UI primitives shared by both lists, such as `PaginationControls`, `ListToolbar`, and `EmptyState`. Keep `ReviewItem` and `RequestItem` domain-specific unless their data and action contracts genuinely match.
3. Split `app.requests/routes/app._index.jsx` and `app.reviews/routes/app._index.jsx` by responsibility (loader/action, filter parsing, list container, and domain row/action components) before attempting cross-route sharing.
4. For widget editors, first identify common controls already present (`Range`, `ColorPicker`, save bar, headers). Extract a shared widget-settings form layer only if at least three editors use the same data model and validation. Do not force video, carousel, and simple-display previews into a common renderer.

**Exit criteria:** the large routes become easier to navigate and test, with no loss of domain-specific behaviour or widget preview fidelity.

### Phase 7 — Prevent duplication from returning

1. Add a PR checklist: search before copying a helper, use the shared services/builders where applicable, and explain any intentional duplication in the PR description.
2. Add a lightweight duplicate-code report (for example `jscpd`) only after its configuration excludes generated output, `node_modules`, `build`, vendor assets such as `swiper-bundle.min.*`, and Shopify extension dependencies. Start in report-only mode; do not block development on legacy findings.
3. Add targeted automated tests when a test runner is introduced: order formatting, Product GID conversion, email payload builders, review deletion decision flow, and save-bar dirty-state logic.
4. Make the duplicate report advisory first; set a baseline after the priority phases and reject only newly introduced duplication above the agreed threshold.

**Exit criteria:** new duplication is visible during review without creating noisy or brittle tooling.

## Deliberately out of scope

- Changing the Prisma schema, moving enums, or deleting commented schema declarations: these are data-model changes, not DRY refactors.
- Collapsing the four route-group `routes.js` files: they are intentional one-line adapters for the repository's dynamic route-group architecture and already delegate to `createRouteGroupRoutes`.
- Renaming every typo or normalizing all quote styles in the same refactor: track naming/formatting cleanup separately to keep diffs reviewable.
- Rewriting all large widget preview components: similarity has not yet been established and each preview has different behaviour.

## Completion log

Record each completed phase here with date, pull request/commit, `lint` result, `typecheck` result, and manual checks performed.

| Phase | Date | Reference | Verification |
| --- | --- | --- | --- |
| 0 | 2026-07-12 | Baseline audit | Typecheck passed. Full lint baseline had 652 errors and 9 warnings before refactoring. |
| 1 | 2026-07-12 | Local implementation | Shared order formatter, relative-time utility, Product GID utility, and widget route factory implemented. |
| 2 | 2026-07-12 | Local implementation | Store-scoped review mutation service and idempotent order persistence service implemented. |
| 3 | 2026-07-12 | Local implementation | Request/reminder/reply payload builders, SMTP/branding builders, corrected email-body utility, and one BullMQ send path implemented. |
| 4 | 2026-07-12 | Local implementation | Six settings pages migrated to the shared save-bar form lifecycle and component. |
| 5 | 2026-07-12 | Local implementation | Shared authenticated admin/store context adopted by dashboard, reviews, requests, and settings loaders. |
| 6 | 2026-07-12 | Local implementation | Shared product enrichment and pagination state extracted; domain-specific list rows and widget renderers intentionally remain separate. |
| 7 | 2026-07-12 | Partial | PR checklist added. Duplicate-code CI and automated tests remain deferred because this repository has no CI or test runner configured. |

### Final verification (2026-07-12)

- Changed-file ESLint: passed with no errors or warnings.
- Full repository ESLint: legacy baseline improved from 652 errors/9 warnings to 623 errors/4 warnings; remaining findings are outside this DRY refactor, mainly missing prop validation/accessibility in large UI components and linting of vendored extension assets.
- `npm run typecheck`: passed.
- `npm run build`: passed for client and SSR bundles; only React Router future-flag and existing unused-default-import warnings remain.
