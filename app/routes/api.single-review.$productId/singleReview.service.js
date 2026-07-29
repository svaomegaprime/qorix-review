import { getStoreData } from "../../utils/getStoreData";
import prisma from "../../db.server";
import { AppError } from "../../utils/appError.server";
import { sendResponse } from "../../utils/sendResponse";

async function getSingleReview(request, admin, params) {
  try {
    // 1. request theke api.single-review.$productId productId collect koro
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const productId =
      params?.productId ||
      url.searchParams.get("productId") ||
      pathParts[pathParts.length - 1];

    if (!productId) {
      return sendResponse(null, {
        ok: false,
        status: 400,
        message: "Product ID is required",
      });
    }

    const storeData = await getStoreData(admin);
    const storeId = storeData?.id;

    if (!storeId) {
      throw new Error("Unable to resolve store data for this request");
    }

    // 2. prisma.review.findMany({where: {productId: req.ProductId}})
    const stats = await prisma.review.aggregate({
      where: { storeId, productId: String(productId) },
      _count: { _all: true },
      _avg: { rating: true },
    });

    return sendResponse(null, {
      ok: true,
      status: 200,
      message: "Single product reviews fetched successfully",
      data: {
        productId,
        totalReviews: stats._count._all || 0,
        averageRating: Number((stats._avg.rating || 0).toFixed(2)),
      },
    });
  } catch (error) {
    console.error("[ERROR::api.single-review.getSingleReview]", error);
    return sendResponse(null, AppError.handle(error));
  }
}

export const singleReviewService = {
  getSingleReview,
};
