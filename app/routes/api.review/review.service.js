import { getStoreData } from "../../utils/getStoreData";
import {
  getCache,
  setCache,
  invalidateReviewCache,
} from "../../lib/redis/reviewCache.js";
import prisma from "../../db.server";
import { uploadFile } from "../../lib/s3/uploadFile";
import { isFileLike } from "../../utils/isFileLike";
import { AppError } from "../../utils/appError.server";
import checkPublishRules from "./middleware/checkPublishRules";
import { sendResponse } from "../../utils/sendResponse";
import { buildSmtpConfig } from "../../services/emailPayload.server.js";
import { addJobInQueue, reviewQueue } from "../../lib/bullmq/bullmq.queue";
import { getOrderReviewTarget } from "../../services/orders.server.js";
import { normalizeShopifyId } from "../../utils/shopifyGid.js";

const MAX_REVIEWER_NAME_LENGTH = 20;
const MAX_REVIEWER_EMAIL_LENGTH = 100;
const MAX_REVIEW_BODY_LENGTH = 300;

function normalizeOrderNumber(value) {
  if (!value || value === "null" || value === "undefined") return null;
  return value.startsWith("#") ? value : `#${value}`;
}

function normalizeReviewVerification(review) {
  return {
    ...review,
    isVerified: Boolean(review.isVerified && review.orderRecordId),
  };
}

function buildFromAddress(displayName, email) {
  const cleanEmail = String(email || "").trim();
  const cleanName = String(displayName || "").trim();

  if (!cleanEmail) return "";
  if (!cleanName) return cleanEmail;

  return `"${cleanName.replace(/"/g, "")}" <${cleanEmail}>`;
}

async function getStoreContext(session, admin) {
  const fallbackStoreData = session?.shop
    ? await prisma.store.findFirst({
        where: {
          storeURL: session.shop,
        },
        select: {
          storeGID: true,
          storeURL: true,
          storeEmail: true,
        },
      })
    : null;

  const storeData = await getStoreData(
    admin,
    fallbackStoreData
      ? {
          id: fallbackStoreData.storeGID,
          name: session?.shop ?? "",
          storeURL: fallbackStoreData.storeURL,
          email: fallbackStoreData.storeEmail,
        }
      : null,
  );

  if (!storeData?.id) {
    throw new Error("Unable to resolve store data for this request");
  }

  return storeData;
}

async function postReview(request, session, admin) {
  try {
    const { id, name, storeURL, email } = await getStoreContext(session, admin);

    const formData = await request.formData();
    const url = new URL(request.url);
    const isOpen = url.searchParams.get("isOpen") === "true";
    const orderId = normalizeOrderNumber(url.searchParams.get("orderId"));

    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeId: id,
      },
      include: {
        emailSettings: true,
        brandingSettings: true,
        adminNotification: true,
        publishingModeration: true,
      },
    });

    const brandingSettings = storeSettings?.brandingSettings ?? {};
    const emailSettings = storeSettings?.emailSettings ?? {};
    const publishingModeration = storeSettings?.publishingModeration ?? {};
    const adminNotification = storeSettings?.adminNotification ?? {};

    const reviewerName = formData.get("reviewerName");
    const reviewerEmail = formData.get("reviewerEmail");
    const body = formData.get("body");

    const fieldLimits = [
      {
        value: reviewerName,
        maxLength: MAX_REVIEWER_NAME_LENGTH,
        message: "Reviewer name cannot exceed 20 characters",
      },
      {
        value: reviewerEmail,
        maxLength: MAX_REVIEWER_EMAIL_LENGTH,
        message: "Reviewer email cannot exceed 100 characters",
      },
      {
        value: body,
        maxLength: MAX_REVIEW_BODY_LENGTH,
        message: "Review body cannot exceed 300 characters",
      },
    ];

    const invalidField = fieldLimits.find(
      ({ value, maxLength }) =>
        typeof value === "string" && value.length > maxLength,
    );

    if (invalidField) {
      return sendResponse(null, {
        ok: false,
        status: 400,
        message: invalidField.message,
        data: {},
      });
    }

    const reviewData = {
      storeId: id,
      reviewerName: reviewerName || null,
      reviewerEmail: String(reviewerEmail || "").trim() || null,
      body: body || null,
      rating: Number(formData.get("rating") || 0),
      source: formData.get("source") || "PRODUCT_PAGE",
      productId: formData.get("productId") || null,
      productHandle: formData.get("productHandle") || null,
      productTitle: formData.get("productTitle") || null,
      productImage: formData.get("productImage") || null,
    };

    let orderTarget = null;

    if (orderId) {
      if (!reviewData.reviewerEmail || !reviewData.productId) {
        return sendResponse(null, {
          ok: false,
          status: 400,
          message: "Email and product are required for an order review",
          data: {},
        });
      }

      orderTarget = await getOrderReviewTarget({
        storeId: id,
        orderId,
        reviewerEmail: reviewData.reviewerEmail,
        productId: reviewData.productId,
      });

      if (!orderTarget) {
        return sendResponse(null, {
          ok: false,
          status: 404,
          message: "Order email and review provided email are not match",
          data: {},
        });
      }

      const existingOrderReview = await prisma.review.findFirst({
        where: {
          orderRecordId: orderTarget.order.id,
          productId: reviewData.productId,
          reviewerEmail: {
            equals: String(reviewData.reviewerEmail).trim(),
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      if (existingOrderReview) {
        return sendResponse(null, {
          ok: false,
          status: 409,
          message: "This order has already reviewed this product",
          data: {},
        });
      }
    } else if (reviewData.reviewerEmail) {
      const existingReview = await prisma.review.findFirst({
        where: {
          storeId: reviewData.storeId,
          reviewerEmail: {
            equals: String(reviewData.reviewerEmail).trim(),
            mode: "insensitive",
          },
          productId: reviewData.productId,
        },
        select: { id: true },
      });

      if (existingReview) {
        return sendResponse(null, {
          ok: false,
          status: 409,
          message: "You have already reviewed this product.",
          data: {},
        });
      }
    }

    const publishRules = checkPublishRules(
      publishingModeration,
      reviewData,
      { isVerified: Boolean(orderTarget) },
    );
    const submittedAt = formData.get("submittedAt") || null;

    const files = [
      ...formData.getAll("media"),
      ...formData.getAll("files"),
    ].filter(isFileLike);

    const uploadedData = [];

    for (const file of files) {
      if (!file.size) continue;
      const uploaded = await uploadFile(file);
      console.log(uploaded);
      uploadedData.push(uploaded);
    }

    const attachments = uploadedData.map((item) => {
      return {
        type: item.type.startsWith("video/") ? "VIDEO" : "IMAGE",
        url: item.url,
      };
    });

    const res = await prisma.review.create({
      data: {
        ...reviewData,
        orderRecordId: orderTarget?.order.id ?? null,
        status: publishRules.status,
        ...publishRules,
        attachments: {
          create: attachments,
        },
      },
      include: {
        attachments: true,
      },
    });

    // Invalidate review cache for this store + product
    await invalidateReviewCache(id, reviewData.productId);

    // Dispatch heavy side-effects (order sync + metafield update) to background worker
    if (reviewData.reviewerEmail && reviewData.productId) {
      try {
        await addJobInQueue(
          reviewQueue,
          "POST_REVIEW_ORDER_METAFIELD_SYNC",
          {
            shop: session?.shop,
            storeId: id,
            productId: String(reviewData.productId),
            reviewerEmail: String(reviewData.reviewerEmail),
            reviewId: res.id,
            orderId,
            isOpen,
          },
          0,
          `POST_REVIEW_SYNC_${res.id}`,
        );
      } catch (err) {
        console.error("[WARN::api.review.orderMetafieldSyncJob]", err);
      }
    }

    const sideEffectErrors = [];

    const storeName = brandingSettings.storeDisplayName ?? name ?? "";

    const emailBody = (
      emailSettings.confirmationEmailBody ??
      "your review has been received. We really appreciate you taking the time!"
    )
      .replace(/{{first_name}}/g, reviewData.reviewerName ?? "")
      .replace(/{{store_name}}/g, storeName ?? "")
      .replace(/{{product_name}}/g, reviewData.productTitle ?? "")
      .replace(/{{review_rating}}/g, reviewData.rating ?? "");

    const formatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const formattedDate = `Submitted ${formatter.format(
      submittedAt ? new Date(submittedAt) : new Date(),
    )}`;

    const senderEmail =
      emailSettings.smtpUser ||
      brandingSettings.storeReplyToEmail ||
      email ||
      "";

    const replyToEmail =
      brandingSettings.storeReplyToEmail ||
      emailSettings.smtpUser ||
      email ||
      undefined;

    const productUrl =
      storeURL && reviewData.productHandle
        ? `https://${storeURL}/products/${reviewData.productHandle}`
        : "#";

    const unsubscribeUrl = replyToEmail
      ? `mailto:${replyToEmail}?subject=Unsubscribe`
      : "";

    if (reviewData.reviewerEmail) {
      const clientEmailData = {
        to: reviewData.reviewerEmail,
        from: buildFromAddress(storeName, senderEmail),
        replyTo: replyToEmail,
        templateName: "ConfirmEmail",
        subject:
          emailSettings.confirmationEmailSubject ?? "Thank you for your review",
        templateData: {
          subject:
            emailSettings.confirmatisonEmailSubject ??
            "Thank you for your review",
          storeName,
          logo: brandingSettings.storeLogo ?? "",
          storeLogoPosition: brandingSettings.storeLogoPosition ?? "start",
          tagline: brandingSettings.storeTagline ?? "",
          customerName: reviewData.reviewerName ?? "",
          emailBody,
          buttonUrl: productUrl,
          buttonText: "View your review",

          emailPrimaryButtonColor:
            brandingSettings.emailPrimaryButtonColor ?? "#269e1bff",
          emailButtonTextColor:
            brandingSettings.emailButtonTextColor ?? "#FFFFFF",
          emailBackgroundColor:
            brandingSettings.emailBackgroundColor ?? "#eef0ee",
          emailHeadingColor: brandingSettings.emailHeadingColor ?? "#303030",
          emailBodyTextColor: brandingSettings.emailBodyTextColor ?? "#108848",
          emailAccentBorderColor:
            brandingSettings.emailAccentBorderColor ?? "#f0f0f0",

          product: {
            title: reviewData.productTitle ?? "",
          },
          review: {
            rating: reviewData.rating ?? 0,
            date: formattedDate,
          },
          emailFooterText: brandingSettings.emailFooterText ?? "",
          unsubscribeUrl,
          isShowFooterBadge: brandingSettings.isShowFooterBadge ?? false,
        },
        smtpConfig: buildSmtpConfig(emailSettings),
      };
      try {
        await addJobInQueue(
          reviewQueue,
          "JOB_CLIENT_CONFIRMATION_EMAIL",
          {
            emailData: clientEmailData,
          },
          0,
          `JOB_CLIENT_CONFIRMATION_EMAIL_${res.id}`,
        );
      } catch (error) {
        console.error("[WARN::api.review.confirmationEmail]", error);
        sideEffectErrors.push("confirmation_email");
      }
    }

    // admin mail
    const adminEmails = Object.values(
      adminNotification?.notificationEmailAddress ?? {},
    ).filter(Boolean);

    if (!adminEmails.length && email) adminEmails.push(email);

    // admin mail — condition check based on adminNotification settings
    const isNewReview = adminNotification?.isNewReviewNotify ?? true;
    const isApprovalNeeded = adminNotification?.isReviewApprovalNotify ?? true;
    const isLowStar = adminNotification?.isLowStarReviewNotify ?? true;

    const isReviewPending = res.status === "PENDING";
    const isLowStarReview = (reviewData.rating ?? 0) <= 2;

    // Determine if we should send the admin notification at all
    const shouldNotifyNewReview = isNewReview;
    const shouldNotifyApproval = isApprovalNeeded && isReviewPending;
    const shouldNotifyLowStar = isLowStar && isLowStarReview;

    const shouldSendAdminEmail =
      shouldNotifyNewReview || shouldNotifyApproval || shouldNotifyLowStar;

    // Build subject and body based on which condition is the most specific
    let adminSubject;
    let adminEmailBody;

    if (shouldNotifyLowStar) {
      // Low-star review — highest priority / most specific alert
      adminSubject = `⚠️ Low Star Alert: ${reviewData.rating ?? 0}★ review on "${reviewData.productTitle || "your product"}"`;
      adminEmailBody = `A low star review (${reviewData.rating ?? 0} star${(reviewData.rating ?? 0) === 1 ? "" : "s"}) was submitted by ${reviewData.reviewerName ?? "a customer"} for "${reviewData.productTitle || "your product"}". Please review it and decide whether to publish or reject.`;
    } else if (shouldNotifyApproval) {
      // Review held for moderation
      adminSubject = `🔍 Review Needs Moderation: "${reviewData.productTitle || "your product"}"`;
      adminEmailBody = `A new review was submitted by ${reviewData.reviewerName ?? "a customer"} for "${reviewData.productTitle || "your product"}" and is currently held for your approval. Please log in to your dashboard to approve or reject it.`;
    } else {
      // Generic new review notification
      adminSubject = `📬 New Review: "${reviewData.productTitle || "your product"}"`;
      adminEmailBody = `A new review was submitted by ${reviewData.reviewerName ?? "a customer"} for "${reviewData.productTitle || "your product"}".`;
    }

    if (adminEmails.length && shouldSendAdminEmail) {
      const adminEmailData = {
        to: adminEmails[0],
        bcc: adminEmails.slice(1),
        from: buildFromAddress(storeName, senderEmail),
        replyTo: replyToEmail,
        templateName: "AdminNotify",
        subject: adminSubject,
        templateData: {
          subject: adminSubject,
          storeName,
          logo: brandingSettings.storeLogo ?? "",
          tagline: brandingSettings.storeTagline ?? "",
          reviewerName: reviewData.reviewerName ?? "Anonymous",
          reviewerEmail: reviewData.reviewerEmail ?? "",
          rating: reviewData.rating ?? 0,
          reviewBody: res.body ?? "",
          status: res.status ?? "PENDING",
          productTitle: reviewData.productTitle ?? "",
          productUrl,
          manageUrl: `https://${storeURL}/admin/apps/qorix-review/app/reviews`,
          submittedDate: formattedDate,
          adminEmailBody,
        },
        smtpConfig: buildSmtpConfig(emailSettings),
      };
      try {
        await addJobInQueue(
          reviewQueue,
          "JOB_ADMIN_NOTIFICATION_EMAIL",
          {
            emailData: adminEmailData,
          },
          0,
          `JOB_ADMIN_NOTIFICATION_EMAIL_${res.id}`,
        );
      } catch (error) {
        console.error("[WARN::api.review.adminEmail]", error);
        sideEffectErrors.push("admin_email");
      }
    }

    return sendResponse(null, {
      ok: true,
      status: 201,
      message:
        sideEffectErrors.length > 0
          ? "Review submitted successfully"
          : "Review submitted successfully",
      data: res,
    });
  } catch (error) {
    console.error("[ERROR::api.review]", error);
    return sendResponse(null, AppError.handle(error));
  }
}
async function getReview(request, session, admin) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const sort = url.searchParams.get("sort") || "ALL";
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 10;
    const filterMinStar = url.searchParams.get("filterMinStar") || "ALL";
    const customerEmail = String(
      url.searchParams.get("customerEmail") || "",
    ).trim();
    const isOpen = url.searchParams.get("isOpen") === "true";
    const orderId = normalizeOrderNumber(url.searchParams.get("orderId"));

    const { id } = await getStoreContext(session, admin);

    if (isOpen && orderId) {
      const numericProductId = normalizeShopifyId(productId);

      // Find if there's an order with this orderId and a matching lineItem
      const orderToUpdate = await prisma.order.findFirst({
        where: {
          storeId: id,
          orderId: orderId,
          lineItems: {
            some: {
              productId: {
                endsWith: numericProductId,
              },
            },
          },
        },
        select: { id: true },
      });

      if (orderToUpdate) {
        await prisma.order.updateMany({
          where: {
            id: orderToUpdate.id,
            reviewCheckStatus: { not: "REVIEWED" },
          },
          data: {
            reviewCheckStatus: "OPENED",
          },
        });
      }
    }
    // ── Redis cache-aside ──────────────────────────────────────────
    const cacheKey = `reviews:${id}:${productId || "all"}:${page}:${limit}:${sort}:${filterMinStar}`;
    const cached = await getCache(cacheKey);

    if (cached) {
      console.log("[CACHE::HIT]", cacheKey);

      cached.reviews = (cached.reviews ?? []).map(normalizeReviewVerification);

      // Re-apply per-user helpfulCount personalisation on top of cached data
      if (customerEmail && cached.reviews) {
        cached.reviews = cached.reviews.map((review) => {
          const helpfulCount = Array.isArray(review.helpfulCount)
            ? review.helpfulCount
            : [];
          const normalizedEmail = customerEmail.toLowerCase();
          const helpfulTotal = helpfulCount.reduce(
            (total, item) => (item?.isHelpful === true ? total + 1 : total),
            0,
          );
          const isHelpful = Boolean(
            normalizedEmail &&
            helpfulCount.some(
              (item) =>
                item?.isHelpful === true &&
                String(item.customerEmail || "").toLowerCase() ===
                  normalizedEmail,
            ),
          );
          return { ...review, helpfulTotal, isHelpful };
        });
      }

      return sendResponse(null, {
        ok: true,
        status: 200,
        message: "Reviews fetched successfully",
        data: cached,
      });
    }

    console.log("[CACHE::MISS]", cacheKey);
    // ── End cache check ──────────────────────────────────────────

    // Base where — unfiltered, used for ratingCounts and allAttachments
    const baseWhere = {
      storeId: id,
      status: "PUBLISHED",
      ...(productId ? { productId } : {}),
    };

    // Base query
    const query = {
      where: {
        ...baseWhere,
      },
      include: {
        reply: true,
        attachments: true,
        helpfulCount: {
          where: customerEmail
            ? {
                OR: [{ isHelpful: true }, { customerEmail }],
              }
            : {
                isHelpful: true,
              },
          select: {
            isHelpful: true,
            customerEmail: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    };

    // Min star filter logic
    switch (filterMinStar) {
      case "STAR_1":
        query.where.rating = { gte: 1 };
        break;
      case "STAR_2":
        query.where.rating = { gte: 2 };
        break;
      case "STAR_3":
        query.where.rating = { gte: 3 };
        break;
      case "STAR_4":
        query.where.rating = { gte: 4 };
        break;
      case "STAR_5":
        query.where.rating = { gte: 5 };
        break;
      default:
        break;
    }

    // Sorting logic
    switch (sort) {
      case "MOST_RECENT":
      case "ALL":
        query.orderBy = {
          createdAt: "desc",
        };
        break;

      case "HIGHEST_RATING":
        query.orderBy = {
          rating: "desc",
        };
        break;
      case "LOWEST_RATING":
        query.orderBy = {
          rating: "asc",
        };
        break;

      case "ONLY_PICTURES":
        query.where.attachments = {
          some: {
            type: "IMAGE",
          },
        };
        break;

      case "ONLY_VIDEO":
        query.where.attachments = {
          some: {
            type: "VIDEO",
          },
        };
        break;

      case "MOST_HELPFUL":
        query.where.helpfulCount = {
          some: {
            isHelpful: true,
          },
        };
        query.orderBy = {
          helpfulCount: {
            _count: "desc",
          },
        };
        break;

      default:
        query.orderBy = {
          createdAt: "desc",
        };
    }

    const [res, filteredInfo, overallInfo, ratingGroups, allAttachments] =
      await Promise.all([
        prisma.review.findMany(query),

        // Used only for pagination of the currently filtered review list.
        prisma.review.aggregate({
          where: query.where,
          _count: {
            _all: true,
          },
        }),

        // Product summary must not change when the list is filtered/sorted.
        // baseWhere always scopes it to this store, product and published status.
        prisma.review.aggregate({
          where: baseWhere,
          _count: {
            _all: true,
          },
          _avg: {
            rating: true,
          },
        }),

        // Rating counts across ALL reviews for this product (ignores sort/filter/pagination)
        prisma.review.groupBy({
          by: ["rating"],
          where: baseWhere,
          _count: {
            _all: true,
          },
        }),

        // All attachments across ALL reviews for this product
        prisma.attachment.findMany({
          where: {
            review: baseWhere,
          },
          select: {
            id: true,
            type: true,
            url: true,
            reviewId: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
      ]);

    // Build ratingCounts object: { 5: n, 4: n, 3: n, 2: n, 1: n }
    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const group of ratingGroups) {
      const r = Number(group.rating);
      if (ratingCounts[r] !== undefined) {
        ratingCounts[r] = group._count._all;
      }
    }

    // Zero-out star keys below the filterMinStar threshold
    const minStarMap = {
      STAR_1: 1,
      STAR_2: 2,
      STAR_3: 3,
      STAR_4: 4,
      STAR_5: 5,
    };
    const minStar = minStarMap[filterMinStar];
    if (minStar) {
      for (let s = 1; s < minStar; s++) {
        ratingCounts[s] = 0;
      }
    }

    const responseData = {
      reviews: res.map(normalizeReviewVerification),
      totalReviews: overallInfo._count._all,
      filteredTotalReviews: filteredInfo._count._all,
      totalPages: Math.ceil(filteredInfo._count._all / limit),
      currentPage: page,
      averageRating: Number((overallInfo._avg.rating || 0).toFixed(1)),
      ratingCounts,
      attachments: allAttachments,
    };

    // Write to cache (fire-and-forget, don't block response)
    setCache(cacheKey, responseData);

    return sendResponse(null, {
      ok: true,
      status: 200,
      message: "Reviews fetched successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("[ERROR::api.review.getReview]", error);
    return sendResponse(null, AppError.handle(error));
  }
}

export const reviewService = {
  postReview,
  getReview,
};
