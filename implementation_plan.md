# Prevent Review Request Emails for Already Reviewed Products

This plan outlines the changes to check for existing reviews during email request dispatch (both manual request trigger and the background BullMQ mail worker) and skip sending the email if all products in the order have already been reviewed.

## Context & Schema Analysis

1. **Review Schema (`prisma/models/reviews.prisma`)**:
   - Contains a unique constraint: `@@unique([storeId, productId, reviewerEmail])`.
   - Does **not** contain an `orderId` field.
2. **Order Schema (`prisma/models/orders.prisma`)**:
   - Stores `storeId`, `orderId`, `userEmail`, and `productsJson` (an array of products including `productId` and `isReviewed` flag).
3. **Logic Match**:
   - To check if a product in an order has been reviewed, we look up the `Review` table for the matching `storeId`, the customer's email (`userEmail` from the order), and the `productId`.
   - If a matching review exists, the product is marked as `isReviewed: true`.
   - If all products in the order are reviewed, the order is fully reviewed (`reviewCheckStatus: "REVIEWED"`), and no request email should be sent.

---

## Proposed Changes

### Component 1: Manual Requests Page

We will add a review check during manual request dispatch in the `PUT` action handler.

#### [MODIFY] [app._index.jsx](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/app.requests/routes/app._index.jsx)

- In the `PUT` action handler, before adding email jobs to the queue:
  1. Fetch reviews from the `Review` table matching the `storeId`, `reviewerEmail` (order email), and the order's product IDs.
  2. Map over the order's products to stamp `isReviewed: true` for any matching product IDs.
  3. If all products are already reviewed:
     - Skip queueing the review request email.
     - Add the order to `orderRows` with `reviewCheckStatus: "REVIEWED"` and `redisBullmqJobId: { reviewRequestId: null, reminderJobId: null }` so it is upserted correctly.
  4. If some products are not reviewed:
     - Queue the review request email.
     - Add the order to `orderRows` with `reviewCheckStatus: "SENT"`.

---

### Component 2: Background Email Queue Service

We will add a final safeguard check in the BullMQ worker right before the email is sent, which handles both automatic webhook triggers and reminders.

#### [MODIFY] [bullmq.service.js](file:///c:/Users/mdeft/Documents/qorix-review/app/lib/bullmq/bullmq.service.js)

- In `scheduleEmailSend` and `reminderEmailSend`:
  1. If `payload.storeId` and `payload.orderId` are present, retrieve the order from the database.
  2. Fetch reviews from the `Review` table matching `storeId`, `reviewerEmail` (customer email), and the product IDs in `productsJson`.
  3. Update `productsJson` with `isReviewed: true` for products that have reviews.
  4. Save the updated `productsJson` and update the status to `REVIEWED` if all products are now reviewed.
  5. If all products are already reviewed, **skip** calling `sendEmail(emailData)` and return immediately.

---

## Verification Plan

### Automated Tests
- Check that the build completes successfully:
  ```powershell
  npm run build
  ```

### Manual Verification
1. Create a mock order with a customer email and product.
2. In Prisma Studio / DB, add a review for that product under the same customer email and store.
3. In the Requests page, trigger a manual review request for that order.
4. Verify that no email job is sent/processed and the order status is updated to `REVIEWED`.
