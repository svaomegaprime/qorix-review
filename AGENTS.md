# Qorix Review — Agent Guide

## Commands

```json
"dev": "shopify app dev",
"build": "react-router build",
"start": "react-router-serve ./build/server/index.js",
"setup": "prisma generate && prisma migrate deploy",
"typecheck": "react-router typegen && tsc --noEmit",
"lint": "eslint --ignore-path .gitignore --cache --cache-location ./node_modules/.cache/eslint .",
"graphql-codegen": "graphql-codegen",
"deploy": "shopify app deploy"
```

- **Always run `lint` then `typecheck` before committing.**
- `npm run setup` is required before first start (generates Prisma client + runs migrations).
- `typecheck` runs `react-router typegen` (generates route types) **then** `tsc --noEmit` — both must pass.
- `npm run build` is `react-router build` (Vite-based, outputs to `build/`).
- Production start: `npm run docker-start` (runs `setup` then `start`).
- No test framework is configured; there are no tests in the repo.

## Architecture

- **Shopify embedded app** built on **React Router v7** (framework mode, formerly Remix). Server-side rendering via `renderToPipeableStream`.
- Source is **`.jsx`/`.js`** with TypeScript type-checking (JSDoc-level types). Do **not** rename files to `.tsx`/`.ts` without team approval.
- **Single npm workspace**: `extensions/*` (one theme app extension at `extensions/qorix-review/`).
- **PostgreSQL** via **Prisma ORM**. Schema split across `prisma/schema.prisma` and `prisma/models/*.prisma`.
- **Custom route group system**: `app/routes.js` uses `flatRoutes()` then dynamically loads nested route groups from `routes/app.{group}/routes.js` via `createRouteGroupRoutes()`. Each group folder (`app.widgets/`, `app.settings/`, `app.reviews/`, `app.requests/`) exposes its own route tree — route naming convention is `app.{group}.{segment}[.{segment}].jsx` (dots → `/` segments, `_index` → index route, `$param` → dynamic segment).
- **File storage**: AWS S3-compatible (ZenexCloud/MinIO). Config in `app/lib/s3.js`.
- **Email**: Nodemailer via Gmail SMTP. Templates are EJS in `app/views/emails/`.
- **UI**: Shopify Polaris v13 + Shopware web components (`<s-page>`, `<s-link>`, etc.).

## Key Files

| File | Purpose |
|---|---|
| `app/shopify.server.js` | Shopify app init, auth config, webhooks |
| `app/db.server.js` | Prisma client singleton |
| `app/routes.js` | Route config with dynamic group loading |
| `prisma/schema.prisma` | Core DB schema (Session, Store, Subscription) |
| `app/lib/s3.js` | S3 client for review attachments |
| `shopify.app.toml` | Shopify app config (scopes, webhooks) |

## Conventions

- **No `.env` files should be committed.** Current `.env` contains live credentials — do not expose or commit.
- **Engine strict**: `engine-strict=true` in `.npmrc` — Node must match `>=20.19 <22 || >=22.12`.
- **Prettier** is configured; format before committing.
- **GraphQL schema types** are generated via `graphql-codegen` — run this if you add/modify GraphQL queries.
- No CI/CD pipeline exists. No test infrastructure exists.
