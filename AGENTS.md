# Qorix Review — Agent Guide

## Commands

```json
"dev": "shopify app dev clean & shopify app dev",
"build": "react-router build",
"start": "react-router-serve ./build/server/index.js",
"setup": "prisma generate && prisma migrate deploy",
"typecheck": "react-router typegen && tsc --noEmit",
"lint": "eslint --ignore-path .gitignore --cache --cache-location ./node_modules/.cache/eslint .",
"graphql-codegen": "graphql-codegen",
"worker": "vite-node app/lib/bullmq/bullmq.worker.js",
"docker-start": "npm run setup && npm run start && npm run worker",
"deploy": "shopify app deploy"
```

- **Always run `lint` then `typecheck` before committing.** See PR template at `.github/pull_request_template.md`.
- `npm run setup` required before first start (Prisma generate + migrate deploy).
- `typecheck` = `react-router typegen` (generates route types into `.react-router/`) **then** `tsc --noEmit`. Both must pass.
- No test framework. No tests in the repo.
- `shopify app dev clean & shopify app dev` runs clean in background — the `&` is intentional.

## Architecture

- **Shopify embedded app** on **React Router v7** (framework mode, formerly Remix). SSR via `renderToPipeableStream`.
- Source is **`.jsx`/`.js`** with TypeScript type-checking (JSDoc-level). Do **not** rename to `.tsx`/`.ts` without team approval.
- **Single npm workspace**: `extensions/*` (one theme extension at `extensions/qorix-review/`).
- **PostgreSQL** via **Prisma ORM**. Schema split: `prisma/schema.prisma` (Session, Store, Subscription, enums) + `prisma/models/*.prisma` (reviews, orders, settings, widgets). After editing, run `npm run setup`.
- **BullMQ job queue** backed by **Redis** (localhost:6379). Worker runs as a separate process via `npm run worker`. Docker Compose only provides Redis — the app process itself is not containerized in that compose file.
- **S3-compatible storage**: ZenexCloud (hardcoded endpoint `bucket.zenexcloud.com:9000`) in `app/lib/s3/s3.config.js`. Needs `ZENEX_ACCESS_KEY_ID` and `ZENEX_SECRET_ACCESS_KEY` env vars.
- **Email**: Nodemailer via Gmail SMTP. Templates are EJS in `app/views/emails/`.
- **UI**: Shopify Polaris v13 + Shopware web components (`<s-page>`, `<s-link>`, etc.).

## Route System

`app/routes.js` uses `flatRoutes()` then dynamically loads nested route groups from `routes/app.{group}/routes.js`. Each group folder (`app.widgets/`, `app.settings/`, `app.reviews/`, `app.requests/`) exposes its own route tree.

Route naming: dots → `/` segments, `_index` → index route, `$param` → dynamic segment.

## Key Files

| File | Purpose |
|---|---|
| `app/shopify.server.js` | Shopify app init, auth, webhooks, afterAuth hook (creates Store + default Settings + QuickReviewWidget) |
| `app/db.server.js` | Prisma client singleton (dev: cached on `global`) |
| `app/routes.js` | Route config with dynamic group loading |
| `prisma/schema.prisma` | Core DB schema (Session, Store, Subscription, enums) |
| `prisma/models/*.prisma` | Extended schema: reviews, orders, settings, widgets |
| `app/lib/s3/s3.config.js` | ZenexCloud S3 client |
| `app/lib/redis/redis.js` | Redis connection for BullMQ |
| `app/lib/bullmq/bullmq.worker.js` | Background worker for email scheduling/reminders |
| `shopify.app.toml` | Shopify app config (scopes, webhooks, API version) |
| `shopify.web.toml` | Web role config (predev/dev commands differ from package.json) |
| `.graphqlrc.js` | GraphQL codegen config — outputs to `app/types/` |

## Conventions

- **No `.env` files committed.** Current `.env` contains live credentials — never expose or commit.
- **Engine strict**: `engine-strict=true` in `.npmrc` — Node must match `>=20.19 <22 || >=22.12`.
- **Prettier** configured (uses defaults, no `.prettierrc` file). Format before committing.
- **GraphQL codegen**: `npm run graphql-codegen` generates types into `app/types/`. Run after adding/modifying GraphQL queries.
- **API version note**: `shopify.app.toml` declares `api_version = "2026-07"` but `.graphqlrc.js` and `shopify.server.js` use `ApiVersion.October25`. Keep these in sync when updating.
- **Server-only modules**: keep server dependencies in `*.server.js` files (enforced by ESLint env overrides).
- **No CI/CD pipeline. No test infrastructure.**
