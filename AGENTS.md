# Qorix Review — Agent Guide

## Dev commands

| Command | Purpose |
|---|---|
| `npm run dev` | Shopify CLI dev (tunnel + Prisma + Vite) |
| `npm run typecheck` | `react-router typegen && tsc --noEmit` |
| `npm run lint` | ESLint with cache |
| `npm run build` | `react-router build` |
| `npm run setup` | `prisma generate && prisma migrate deploy` |
| `npm run worker` | Start BullMQ worker (separate process) |

Run `lint` → `typecheck` → `build` before committing.

## Architecture

- **Framework**: React Router v7 (@react-router/fs-routes for file-based routing)
- **Auth**: `@shopify/shopify-app-react-router` — `authenticate.admin(request)` for admin pages, `authenticate.public.appProxy(request)` for storefront API
- **DB**: PostgreSQL via Prisma (`prisma/schema.prisma` includes models from `prisma/models/`)
- **Background jobs**: BullMQ via Redis (queue name: `QUEUE_SCHEDULE_EMAIL`)
- **Email**: Nodemailer + EJS templates in `app/utils/template/`
- **File storage**: AWS S3-compatible (MinIO locally, configured via env)
- **Route groups**: Custom pattern — nested route directories (`app.requests/`, `app.settings/`, etc.) with `routes.js` calling `createRouteGroupRoutes(import.meta.url)`; child routes in `routes/app.*.jsx` files under `routes/`
- **Env**: `engine-strict=true` in `.npmrc`; Node >=20.19 <22 or >=22.12

## Store ID pattern

- Store identity comes from Shopify GID string (`gid://shopify/Shop/...`), stored as `storeGID`
- **Avoid** `getStoreData(admin)` in webhooks — it makes an unnecessary GraphQL call. Query `prisma.store` locally via `shop` URL instead (issue #4 in `issues.md`)
- Most models reference store by `storeGID` string, NOT the UUID primary key (known anti-pattern, see issue #8)
- Prisma compound key `@@unique([storeId, orderId])` on Order model

## Error handling

- Wrap all loaders/actions in try-catch
- Use `adminErrorResponse(error)` for admin routes (catches Shopify redirect Responses)
- Use `AppError.handle(error)` for API routes — returns `{ ok: false, status, message, code, details }`
- Use `sendResponse(null, { ok, status, message, data })` for success responses
- Storefront widget must check BOTH `response.ok` AND `result.ok` after fetch

## Known bugs / audit findings (issues.md)

- **IDOR**: Settings update actions don't verify store ownership of `id` — always add `storeSettingsId` to where clause
- **Orders memory**: `getOrdersWithStatus.server.js` queries ALL orders instead of just the 250 fetched from Shopify — use `orderId: { in: orderIds }`
- **Metafields**: Review moderation (approve/reject/delete) must call `updateProductReviewDefineMetafields` to sync Shopify product metafields
- **Cancellation bug**: `webhooks.orders.cancelled.jsx` line 100-102 — when `isSkipCancelledOrder` is true, the code **sends** emails instead of **removing** queued jobs. Fix: remove jobs via `removeJobInQueue` and set status to `FAILED`
- **Redis config**: Hardcoded to localhost:6379 in `app/lib/redis/redis.js` — use `REDIS_URL` env var instead
- **SMTP typo**: `confirmatisonEmailSubject` typo on line 204 of `review.service.js`

## Queue / Worker

- Worker process: `app/lib/bullmq/bullmq.worker.js` — must be started separately via `npm run worker`
- Job names: `JOB_SCHEDULE_EMAIL`, `JOB_REMINDER_EMAIL`
- Queue helper: `addJobInQueue(queue, jobName, data, delay, jobId)` in `bullmq.queue.js`
- Job payload should include `{ emailData, payload: { storeId, orderId } }` to enable status updates
- Redis required: `docker compose up` for local development

## Prisma

- Schema at `prisma/schema.prisma`, with models split across `prisma/models/*.prisma`
- Prisma client auto-generated; run `npm run setup` after schema changes
- Use `prisma.$transaction` for atomic operations (e.g., review submission with metafield writes + email)
- On Windows ARM64: set `PRISMA_CLIENT_ENGINE_TYPE=binary`

## Shopify specifics

- App proxy prefix: `/apps/api` (configured in `shopify.app.toml`)
- Webhooks: defined in `shopify.app.toml` (preferred) — topics: `orders/create`, `orders/updated`, `orders/cancelled`, `app/uninstalled`, `app/scopes_update`
- Webhook handlers must respond in <5s; avoid external API calls inside them
- Embedded app: use `<Link>` from react-router, not `<a>`; use `redirect` from `authenticate.admin`, not from react-router
- Extension in `extensions/qorix-review/` (theme app extension type)
