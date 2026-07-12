# Qorix Review - Error Handling & API Atomicity Guide

This guide details best practices for handling errors across the server-side (loaders and actions), the database layer (preventing partial commits via Prisma transactions), and the frontend widget extension.

---

### Table of Contents
1. [Prisma Transactions: Preventing Partial Database Commits](#1-prisma-transactions-preventing-partial-database-commits)
2. [Server-Side Error Handling in Loaders & Actions](#2-server-side-error-handling-in-loaders--actions)
3. [Frontend Widget (Extension) Error Verification](#3-frontend-widget-extension-error-verification)
4. [Standardized AppError Integration API Contract](#4-standardized-apperror-integration-api-contract)

---

### 1. Prisma Transactions: Preventing Partial Database Commits
* **Problem**: 
  In the review submission service ([app/routes/api.review/review.service.js](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/api.review/review.service.js)), a review is created in the database first, then metafields are written to Shopify, and finally a confirmation email is sent. If the email sending fails (e.g. SMTP connection issue) or the Shopify API times out, the service throws an error and returns a failure response. However, the review **remains persisted** in the database. The database states change despite the API response indicating a failure.
  
* **Solution (Interactive Transactions)**:
  Use Prisma's interactive transaction API (`prisma.$transaction`) to wrap database changes. If any step fails before the API request completes, throwing an error inside the transaction callback automatically rolls back all database modifications.
  
* **Implementation Pattern**:
  ```javascript
  // app/routes/api.review/review.service.js
  async function postReview(request, session, admin) {
    try {
      const { id, name, storeURL, email } = await getStoreContext(session, admin);
      const formData = await request.formData();
      
      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // 1. Create review within the transaction context (tx)
        const newReview = await tx.review.create({
          data: {
            ...reviewData,
            status: publishRules.status,
            attachments: { create: attachments },
          },
          include: { attachments: true },
        });

        // 2. Perform external updates/checks
        await updateProductReviewDefineMetafields(admin, reviewData.productId, id);
        
        // 3. Send email. If this throws an error, the transaction rolls back!
        if (reviewData.reviewerEmail) {
          await sendEmail({
            to: reviewData.reviewerEmail,
            // Smtp config & template data...
          });
        }
        
        return newReview;
      });

      return sendResponse(null, {
        ok: true,
        status: 201,
        message: "Review submitted successfully",
        data: result,
      });
    } catch (error) {
      console.error("[ERROR::api.review]", error);
      // Returns structured AppError JSON
      return sendResponse(null, AppError.handle(error));
    }
  }
  ```

---

### 2. Server-Side Error Handling in Loaders & Actions
* **Problem**:
  Multiple loader and action files lack try-catch blocks or do not catch errors gracefully. If an error occurs, the server crashes or falls back to React Router's default error page, breaking the user interface.
  * *Example*: [app/routes/app.requests/routes/app._index.jsx](file:///c:/Users/mdeft/Documents/qorix-review/app/routes/app.requests/routes/app._index.jsx) actions and loaders execute queries without try-catch blocks.

* **Solution**:
  Wrap loader and action bodies in try-catch blocks. For API routes, return the handled `AppError`. For dashboard loaders, return a clean state with error metadata to show localized warnings instead of a full crash.

* **Implementation Pattern for Actions**:
  ```javascript
  export async function action({ request }) {
    try {
      const { session, admin } = await authenticate.admin(request);
      // Method logic here...
    } catch (error) {
      console.error("Action execution failed:", error);
      // Always return JSON payload using AppError for unified structure
      return Response.json(AppError.handle(error), { status: 500 });
    }
  }
  ```

---

### 3. Frontend Widget (Extension) Error Verification
* **Problem**:
  In React Router/Remix, when a controller returns a plain object (like the object returned by `sendResponse` or `AppError.handle(error)`), the framework automatically wraps it in a standard HTTP `200 OK` response.
  In the storefront widget ([extensions/qorix-review/assets/quick-review.js:L204-208](file:///c:/Users/mdeft/Documents/qorix-review/extensions/qorix-review/assets/quick-review.js#L204-L208)), the client checks if the submission was successful by checking `response.ok`:
  ```javascript
  const response = await fetch("/apps/api/review", { method: "POST", body: formData });
  
  if (!response.ok) { // This is true even if the API failed but returned HTTP 200
    throw new Error("Failed to submit review");
  }
  
  const result = await response.json();
  // BUG: It never checks if result.ok === false!
  this.submitSuccess = true; // Shows success screen even if backend failed!
  ```

* **Solution**:
  The client-side JavaScript must verify both the HTTP status (`response.ok`) and the custom JSON result status (`result.ok === false`):
  ```javascript
  // extensions/qorix-review/assets/quick-review.js
  const response = await fetch("/apps/api/review", { method: "POST", body: formData });
  const result = await response.json();

  if (!response.ok || result.ok === false) {
    throw new Error(result.message || "Failed to submit review");
  }

  // Proceed with success state
  this.submitSuccess = true;
  ```

---

### 4. Standardized AppError Integration API Contract
The `AppError` helper ([app/utils/appError.server.js](file:///c:/Users/mdeft/Documents/qorix-review/app/utils/appError.server.js)) formats errors into a unified structure. When returned, it provides a consistent API schema:

```json
{
  "ok": false,
  "status": 500,
  "message": "Friendly error message text here.",
  "code": "DB_CONNECTION_FAILED",
  "details": {
    "prismaCode": "P1001",
    "prismaName": "PrismaClientInitializationError"
  }
}
```

#### How to return AppError from endpoints:
Always pass the thrown error object into `AppError.handle(error)` inside catch blocks, and pass the result to `sendResponse`:

```javascript
try {
  // Database logic
} catch (error) {
  // Log locally and format standard response
  const formattedError = AppError.handle(error);
  return sendResponse(null, formattedError);
}
```
This guarantees that storefront widgets and dashboard fetchers can reliably read `result.ok` and `result.message` to display user-friendly error alerts.
