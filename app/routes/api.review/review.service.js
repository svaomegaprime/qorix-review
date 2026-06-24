import { getStoreData } from "../../utils/getStoreData";
import prisma from "../../db.server";
import { uploadFile } from "../../lib/uploadFile"
import { isFileLike } from "../../utils/isFileLike"
import { AppError } from "../../utils/appError.server"
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


    console.log(res)



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

    console.log("productId", productId)

    const { id } = await getStoreData(admin)

    const res = await prisma.review.findMany({
      where: {
        storeId: id,
        ...(productId ? { productId } : {}),
      },
      include: {
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    console.log("[REVIEW DATA]",res)

    return {
      ok: true,
      data: res,
    }

  } catch (error) {
    console.error("[ERROR::api.review.getReview]", error);
    return AppError.handle(error);
  }
}
export const reviewService = {
  postReview,
  getReview,
};
