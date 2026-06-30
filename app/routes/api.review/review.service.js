import { getStoreData } from "../../utils/getStoreData";
import prisma from "../../db.server";
import { uploadFile } from "../../lib/uploadFile"
import { isFileLike } from "../../utils/isFileLike"
import { AppError } from "../../utils/appError.server"
import { updateProductReviewDefineMetafields } from "../../utils/updateProductReviewDefineMetafields"
import { sendEmail } from "../../utils/sendEmail"
import checkPublishRules from "./middleware/checkPublishRules"

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
    const { id, name, storeURL, email } = await getStoreContext(
      session,
      admin,
    );

    const formData = await request.formData();
    // review.service.js


    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        storeId: id,
      },
      include: {
        emailSettings: true,
        brandingSettings: true,
        adminNotification: true,
        publishingModeration: true
      }
    })

    const brandingSettings = storeSettings?.brandingSettings ?? {};
    const emailSettings = storeSettings?.emailSettings ?? {};
    const publishingModeration = storeSettings?.publishingModeration ?? {};

    const reviewData = {
      storeId: id,
      reviewerName: formData.get("reviewerName") || null,
      reviewerEmail: formData.get("reviewerEmail") || null,
      body: formData.get("body") || null,
      rating: Number(formData.get("rating") || 0),
      status: "PUBLISHED",
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

    console.log(publishRules);

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
        type: item.type.startsWith("video/")
          ? "VIDEO"
          : "IMAGE",
        url: item.url
      }
    })

    const res = await prisma.review.create({
      data: {
        ...reviewData,
        ...publishRules,
        attachments: {
          create: attachments,
        }
      },
      include: {
        attachments: true,
      },
    })

    await updateProductReviewDefineMetafields(admin, reviewData.productId, reviewData.storeId);


    const storeName = brandingSettings.storeDisplayName ?? name;

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
      submittedAt ? new Date(submittedAt) : new Date()
    )}`;

    console.log(formattedDate);

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
        : `https://${storeURL || "qorix.ai"}`;

    const unsubscribeUrl = replyToEmail
      ? `mailto:${replyToEmail}?subject=Unsubscribe`
      : "";

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
          emailSettings.confirmationEmailSubject ??
          "Thank you for your review",

        logo: brandingSettings.storeLogo ?? "",

        tagline:
          brandingSettings.storeTagline ?? "",

        customerName:
          reviewData.reviewerName ?? "",

        emailBody,

        buttonUrl: productUrl,

        buttonText: "View your review",

        product: {
          title: reviewData.productTitle ?? "",
        },

        review: {
          rating: reviewData.rating ?? 0,
          date: formattedDate,
        },

        emailFooterText:
          brandingSettings.emailFooterText ?? "",

        unsubscribeUrl,

        isShowFooterBadge:
          brandingSettings.isShowFooterBadge ?? false,
      },
      smtpConfig: {
        smtpUser: emailSettings.smtpUser,
        smtpPassword: emailSettings.smtpPassword,
        smtpPort: emailSettings.smtpPort,
        smtpHost: emailSettings.smtpHost,
      }

    });



    return {
      ok: true,
      data: res,
    };
  } catch (error) {
    console.error("[ERROR::api.review]", error);
    return AppError.handle(error);
  }

}
async function getReview(request, session, admin) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const sort = url.searchParams.get("sort") || "ALL";
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 10;

    const { id } = await getStoreContext(session, admin);

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
      })
    ]);



    return {
      ok: true,
      data: res,

      totalReviews: info._count._all,

      totalPages: Math.ceil(info._count._all / limit),
      currentPage: page,

      averageRating: Number(
        (info._avg.rating || 0).toFixed(1)
      ),
    };
  } catch (error) {
    console.error("[ERROR::api.review.getReview]", error);
    return AppError.handle(error);
  }
}
// async function getReview(request, admin) {
//   try {
//     const url = new URL(request.url);
//     const productId = url.searchParams.get("productId");
//     const sort = url.searchParams.get("sort");

//     console.log("productId", productId)

//     const { id } = await getStoreData(admin)

//     const res = await prisma.review.findMany({
//       where: {
//         storeId: id,
//         ...(productId ? { productId } : {}),
//       },
//       include: {
//         attachments: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     })
//     console.log("[REVIEW DATA]",res)

//     return {
//       ok: true,
//       data: res,
//     }

//   } catch (error) {
//     console.error("[ERROR::api.review.getReview]", error);
//     return AppError.handle(error);
//   }
// }
export const reviewService = {
  postReview,
  getReview,
};
