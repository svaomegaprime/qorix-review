import { getStoreData } from "../../utils/getStoreData";
import prisma from "../../db.server";
import { uploadFile } from "../../lib/uploadFile"
import { isFileLike } from "../../utils/isFileLike"
import { AppError } from "../../utils/appError.server"
import { updateProductReviewDefineMetafields } from "../../utils/updateProductReviewDefineMetafields"
import { sendEmail } from "../../utils/sendEmail"


async function postReview(request, admin) {


  try {
    const { id } = await getStoreData(admin)

    const formData = await request.formData();
    // review.service.js
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
    console.log({ success: true, urls: uploadedData })

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
        attachments: {
          create: attachments,
        }
      },
      include: {
        attachments: true,
      },
    })

    const productMedafieldResult = await updateProductReviewDefineMetafields(admin, reviewData.productId, reviewData.storeId);
    console.log("[quick-review][action] Product metafield save result", productMedafieldResult);



    console.log(res)


    await sendEmail({
      to: reviewData.reviewerEmail,
      subject: "Thank you for your purchase!",
      from: '"Qorix Reviews" <support@qorix.com>',
      replyTo: "support@qorix.com",
      templateName: "ConfirmEmail",

      templateData: {
        logoUrl: "https://via.placeholder.com/150x50?text=Qorix+Review",

        customerName: reviewData.reviewerName,

        product: {
          title: "Premium Leather Backpack",
          price: "$89.99",
          image:
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",

          url: "https://demo-store.com/products/premium-leather-backpack",

          averageRating: 4.8,

          totalReviews: 127,
        },

        review: {
          rating: 4,

          comment:
            reviewData.body,
        },
      },


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
async function getReview(request, admin) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const sort = url.searchParams.get("sort") || "ALL";
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 10;

    console.log("productId", productId);
    console.log("sort", sort);

    const { id } = await getStoreData(admin);

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

    console.log("[REVIEW DATA]", res);

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
