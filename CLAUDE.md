# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- **Always run `lint` then `typecheck` before considering work done.** Follow the checklist in `.github/pull_request_template.md`.
- `npm run setup` is required before first start (Prisma generate + migrate deploy), and again after editing any `prisma/schema.prisma` / `prisma/models/*.prisma` file.
- `typecheck` runs `react-router typegen` (generates route types into `.react-router/`) **then** `tsc --noEmit`. Both steps must pass — this is a `.jsx`/`.js` codebase type-checked via JSDoc, not native TS.
- **No test framework and no tests in the repo.** There is no CI/CD pipeline either — lint/typecheck are the only automated gates.
- `shopify app dev clean & shopify app dev` runs clean in the background — the `&` is intentional, not a typo.

## Architecture

- **Shopify embedded app** built on **React Router v7** (framework mode, formerly Remix). SSR via `renderToPipeableStream`.
- Source is **`.jsx`/`.js`** with TypeScript type-checking at the JSDoc level. Do **not** rename files to `.tsx`/`.ts` without team approval.
- Single npm workspace: `extensions/*` (currently one theme extension at `extensions/qorix-review/`).
- **PostgreSQL** via **Prisma ORM**. Schema is split across `prisma/schema.prisma` (Session, Store, Subscription, enums) and `prisma/models/*.prisma` (`reviews.prisma`, `orders.prisma`, `settings.prisma`, `widgets.prisma`). After editing any schema file, run `npm run setup`.
- **BullMQ** job queue backed by **Redis** (localhost:6379). The worker (`app/lib/bullmq/bullmq.worker.js`) runs as a separate process via `npm run worker`. `docker-compose.yml` only provisions Redis — the app itself is not containerized there.
- **S3-compatible storage**: ZenexCloud, hardcoded endpoint `bucket.zenexcloud.com:9000` in `app/lib/s3/s3.config.js`. Requires `ZENEX_ACCESS_KEY_ID` and `ZENEX_SECRET_ACCESS_KEY` env vars.
- **Email**: Nodemailer via Gmail SMTP. Templates are EJS files in `app/views/emails/`.
- **UI**: Shopify Polaris v13 plus Shopware/Polaris web components (`<s-page>`, `<s-link>`, etc.).

### Route system

`app/routes.js` calls `flatRoutes()` and then dynamically stitches in nested route groups: for every `app.{group}/` directory that matches `app.[a-z0-9.-]+`, if it has a `routes.js`, that module's default export replaces the children of the corresponding parent route (`routes/app.{group}/route.jsx`). Each group folder — `app.widgets/`, `app.settings/`, `app.reviews/`, `app.requests/` — owns its own route tree via its local `routes.js`.

Route naming follows flat-routes conventions: dots (`app.widgets.foo`) map to `/` path segments, `_index` is the index route, `$param` is a dynamic segment.

### Key files

| File                              | Purpose                                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `app/shopify.server.js`           | Shopify app init, auth, webhooks, `afterAuth` hook (creates Store + default Settings + QuickReviewWidget) |
| `app/db.server.js`                | Prisma client singleton (cached on `global` in dev)                                                       |
| `app/routes.js`                   | Route config with dynamic per-group loading (see above)                                                   |
| `prisma/schema.prisma`            | Core DB schema (Session, Store, Subscription, enums)                                                      |
| `prisma/models/*.prisma`          | Extended schema: reviews, orders, settings, widgets                                                       |
| `app/lib/s3/s3.config.js`         | ZenexCloud S3 client                                                                                      |
| `app/lib/redis/redis.js`          | Redis connection for BullMQ                                                                               |
| `app/lib/bullmq/bullmq.worker.js` | Background worker for email scheduling/reminders                                                          |
| `shopify.app.toml`                | Shopify app config (scopes, webhooks, API version)                                                        |
| `shopify.web.toml`                | Web role config (predev/dev commands differ from `package.json`)                                          |
| `.graphqlrc.js`                   | GraphQL codegen config — outputs types to `app/types/`                                                    |

## Conventions

- **No `.env` files are committed.** The local `.env` holds live credentials — never expose or commit it.
- **Engine strict**: `engine-strict=true` in `.npmrc` — Node must satisfy `>=20.19 <22 || >=22.12`.
- **Prettier** is configured with defaults (no `.prettierrc`). Format before committing.
- Run `npm run graphql-codegen` after adding or modifying GraphQL queries; it regenerates types into `app/types/`.
- **API version drift**: `shopify.app.toml` declares `api_version = "2026-07"`, but `.graphqlrc.js` and `shopify.server.js` pin `ApiVersion.October25`. Keep these in sync when bumping the API version.
- **Server-only modules**: server-side dependencies must stay in `*.server.js` files — this is enforced by ESLint env overrides.
- Before adding new logic, search for an existing helper, hook, service, or component first (see the DRY checklist in `.github/pull_request_template.md`). Keep route URLs, loader/action response shapes, Prisma contracts, and widget settings backward compatible unless a break is explicitly intended.

### Embedded-app gotchas (Shopify iframe constraints)

- Use `Link` from `react-router` or `@shopify/polaris`, never a raw `<a>`.
- Use the `redirect` returned from `authenticate.admin`, not `redirect` from `react-router`, or session state can break inside the iframe.
- Use `useSubmit` from `react-router` for programmatic form submission.
- Shop-specific webhooks registered via `shopify.registerWebhooks`/`afterAuth` only resync on install or token expiry — prefer declaring webhooks in `shopify.app.toml` so `npm run deploy` syncs them automatically.
