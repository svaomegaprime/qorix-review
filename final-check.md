# Shopify App Store Review — Final Check

## Summary

✅ **Likely passing:** 24  
❌ **Likely failing:** 2  
⚠️ **Needs review:** 8  
⏭️ **Groups skipped:** 9 _(not applicable or opt-in)_

## Requirements that need review

### 1.1.1 Use session tokens for authentication

**Why this needs attention:** The implementation looks correct, but incognito operation needs a live verification.

**What was detected:** Shopify React Router auth and server-side Prisma session storage are used; no browser-storage auth was found.

### 1.2.1–1.2.3 Shopify App Pricing / Billing API and plan changes

**Why this needs attention:** No billing implementation is present. This is acceptable only if the app is entirely free.

**What was detected:** No Shopify Billing mutations, external payments, or in-app upgrade/downgrade flow were found.

### 2.3.2 Authenticate immediately after install

**Why this needs attention:** The protected routes are correctly SDK-guarded, but the configured redirect URL appears inconsistent with the configured auth prefix.

**What was detected:** The SDK uses `/auth`, but `shopify.app.toml` registers `/api/auth`. Verify the production OAuth callback end-to-end.

### 2.3.3 Redirect to the app UI after installation

**Why this needs attention:** Confirm a successful OAuth approval returns merchants to `/app`.

**What was detected:** Route protection exists, but the callback redirect cannot be confirmed from source alone.

### 3.1.1 Use a valid TLS/SSL certificate

**Why this needs attention:** The deployed certificate and HTTPS enforcement need a live check.

**What was detected:** HTTPS app URLs are configured.

### 3.2.1 Request `read_all_orders` only when necessary

**Why this needs attention:** Your submission notes must justify historical-order access.

**What was detected:** `read_all_orders` is requested, and `app/utils/sync.orders.js` paginates orders without a 60-day bound.

## Requirements that are likely failing

### 1.1.4 Use only factual information

**Why this matters:** Storefront content cannot show fabricated or unverified reviews.

**What was found:** `extensions/qorix-review/blocks/video-stack-widget.liquid` includes a hard-coded five-star review from “Ava Rajib,” marked `verified: true`. Remove it from storefront output or make it clearly non-public preview content.

### 2.3.1 Initiate installation from a Shopify-owned surface

**Why this matters:** App Store installs must not ask merchants to type their shop domain.

**What was found:** Manual `myshopify.com` fields exist in `app/routes/auth.login/route.jsx` and `app/routes/_index/route.jsx`.

## Skipped groups

- **5.2 Payment** — no payment extension.
- **5.3 Payment facilitator** — opt-in.
- **5.4 Purchase option** — relevant scopes absent.
- **5.5 Product sourcing** — opt-in.
- **5.6 Checkout customization** — no checkout UI extension.
- **5.7 Sales channel** — no channel configuration extension.
- **5.8 Post purchase** — no post-purchase extension.
- **5.9 Mobile app builders** — opt-in.
- **5.10 Donation** — opt-in.

## Resources

- [App Store requirements](https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements)
- [Submitting for review](https://shopify.dev/docs/apps/launch/app-store-review/submit-app-for-review)
