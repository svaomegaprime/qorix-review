import { getStoreData } from "../../utils/getStoreData";
import prisma from "../../db.server";
import { uploadFile } from "../../lib/s3/uploadFile";
import { isFileLike } from "../../utils/isFileLike";
import { AppError } from "../../utils/appError.server";
import { updateProductReviewDefineMetafields } from "../../utils/updateProductReviewDefineMetafields";
import { sendEmail } from "../../utils/sendEmail";
import checkPublishRules from "./middleware/checkPublishRules";
import { sendResponse } from "../../utils/sendResponse";
import { buildSmtpConfig } from "../../services/emailPayload.server.js";

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
    const isOpen = Boolean(url.searchParams.get("isOpen")) || true;
    const orderId = "#" + url.searchParams.get("orderId") || "";
    // review.service.js

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

    const reviewData = {
      storeId: id,
      reviewerName: formData.get("reviewerName") || null,
      reviewerEmail: formData.get("reviewerEmail") || null,
      body: formData.get("body") || null,
      rating: Number(formData.get("rating") || 0),
      source: formData.get("source") || "PRODUCT_PAGE",
      productId: formData.get("productId") || null,
      productHandle: formData.get("productHandle") || null,
      productTitle: formData.get("productTitle") || null,
    };
    const publishRules = await checkPublishRules(
      session,
      publishingModeration,
      reviewData,
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

    if (isOpen && reviewData.reviewerEmail) {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: {
            storeId_orderId: {
              storeId: id,
              orderId,
            },
            userEmail: reviewData.reviewerEmail || undefined,
          },
          include: {
            lineItems: true,
          },
        });
        console.log("order.review.service", order);

        if (order) {
          const extractNumericId = (val) => {
            if (!val) return "";
            const str = String(val);
            if (str.includes("/")) return str.split("/").pop();
            return str;
          };

          const productIdToMatch = extractNumericId(reviewData.productId);

          const lineItem = order.lineItems.find(
            (item) => extractNumericId(item.productId) === productIdToMatch,
          );

          if (!lineItem) {
            throw new Error("Product not found in order");
          }

          // Update the specific line item
          await tx.orderLineItem.update({
            where: {
              id: lineItem.id,
            },
            data: {
              isReviewed: true,
            },
          });

          // Check if all line items in this order are now reviewed
          const remainingUnreviewed = await tx.orderLineItem.count({
            where: {
              orderId: order.id,
              isReviewed: false,
              // Exclude the one we just updated
              id: { not: lineItem.id },
            },
          });

          const allReviewed = remainingUnreviewed === 0;

          if (allReviewed) {
            await tx.order.update({
              where: {
                id: order.id,
              },
              data: {
                reviewCheckStatus: "REVIEWED",
              },
            });
          }
        }
      });
    }

    if (!isOpen && reviewData.reviewerEmail) {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: {
            storeId_orderId: {
              storeId: id,
              orderId,
            },
            userEmail: reviewData.reviewerEmail,
          },
          include: {
            lineItems: true,
          },
        });

        if (order) {
          const extractNumericId = (val) => {
            if (!val) return "";
            const str = String(val);
            if (str.includes("/")) return str.split("/").pop();
            return str;
          };

          const productIdToMatch = extractNumericId(reviewData.productId);

          const lineItem = order.lineItems.find(
            (item) => extractNumericId(item.productId) === productIdToMatch,
          );

          if (!lineItem) {
            throw new Error("Product not found in order");
          }

          // Update the specific line item
          await tx.orderLineItem.update({
            where: {
              id: lineItem.id,
            },
            data: {
              isReviewed: true,
            },
          });

          // Check if all line items in this order are now reviewed
          const remainingUnreviewed = await tx.orderLineItem.count({
            where: {
              orderId: order.id,
              isReviewed: false,
              // Exclude the one we just updated
              id: { not: lineItem.id },
            },
          });

          const allReviewed = remainingUnreviewed === 0;

          if (allReviewed) {
            await tx.order.update({
              where: {
                id: order.id,
              },
              data: {
                reviewCheckStatus: "REVIEWED",
              },
            });
          }
        } else {
          // get all orderdata use
          // Create a new order
          // sync.orders // get order data
          // then normalised data
          // like
          //         {
          //   id: order.name,
          //   orderId: order.name,
          //   fullName,
          //   email,
          //   emailVerified: customer.verified_email || false,
          //   avatar,
          //   status: order.financial_status,
          //   fulfillmentStatus: order.fulfillment_status,
          //   createdAt: order.created_at,
          //   timeAgo: getRelativeTime(order.created_at),
          //   totalPrice: order.current_total_price,
          //   currency: order.subtotal_price_set.shop_money.currency_code,
          //   products: (order.line_items || []).map((item) => ({
          //     title: item.title,
          //     productId: item.product_id,
          //     productHandle: item.handle ?? null,
          //     quantity: item.quantity,
          //     url: item.url ?? null,
          //   })),
          // }
          // match which product ar match with my review email productId
          // depends on this match
          //get product data use getProduct util function
          // then make a array of product data  like accept order.prisma look order.pr
          // create order data
          // with reviewed status i mean reviewCheckStatus : REVIEWED also the other info like order id and other things
        }
      });
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
    // client mail

    try {
      await updateProductReviewDefineMetafields(
        admin,
        reviewData.productId,
        reviewData.storeId,
      );
    } catch (error) {
      console.error("[WARN::api.review.metafields]", error);
      sideEffectErrors.push("metafields");
    }

    if (reviewData.reviewerEmail) {
      try {
        await sendEmail({
          to: reviewData.reviewerEmail,
          from: buildFromAddress(storeName, senderEmail),
          replyTo: replyToEmail,
          templateName: "ConfirmEmail",
          subject:
            emailSettings.confirmationEmailSubject ??
            "Thank you for your review",
          templateData: {
            subject:
              emailSettings.confirmatisonEmailSubject ??
              "Thank you for your review",
            storeName,
            logo: brandingSettings.storeLogo ?? "",
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
            emailBodyTextColor:
              brandingSettings.emailBodyTextColor ?? "#108848",
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
        });
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
      try {
        await sendEmail({
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
        });
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
    const isOpen = Boolean(url.searchParams.get("isOpen")) || true;
    const orderId = "#" + url.searchParams.get("orderId") || "";

    const { id } = await getStoreContext(session, admin);
    console.log("isOpen", isOpen, orderId);

    if (isOpen) {
      const extractNumericId = (val) => {
        if (!val) return "";
        const str = String(val);
        if (str.includes("/")) return str.split("/").pop();
        return str;
      };

      const numericProductId = extractNumericId(productId);

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
        await prisma.order.update({
          where: {
            id: orderToUpdate.id,
          },
          data: {
            reviewCheckStatus: "OPENED",
          },
        });
      }
    }
    // Base query
    const query = {
      where: {
        storeId: id,
        ...(productId ? { productId } : {}),
      },
      include: {
        attachments: true,
        helpfulCount: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    };

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

    // const res = await prisma.review.findMany(query);
    const [res, info] = await Promise.all([
      prisma.review.findMany(query),

      // prisma.review.count({where: query.where}),
      prisma.review.aggregate({
        where: query.where,

        _count: {
          _all: true,
        },

        _avg: {
          rating: true,
        },
      }),
    ]);

    return sendResponse(null, {
      ok: true,
      status: 200,
      message: "Reviews fetched successfully",
      data: {
        reviews: res,
        totalReviews: info._count._all,
        totalPages: Math.ceil(info._count._all / limit),
        currentPage: page,
        averageRating: Number((info._avg.rating || 0).toFixed(1)),
      },
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
