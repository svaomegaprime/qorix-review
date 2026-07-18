import prisma from "../db.server";
import { upsertOrderWithLineItems } from "../services/orders.server.js";
import { authenticate, unauthenticated } from "../shopify.server";
import { formatOrder } from "../utils/formatOrder.js";
import { getStoreData } from "../utils/getStoreData";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  if (topic !== "ORDERS_CREATE") {
    return new Response(null, { status: 200 });
  }

  const formattedOrder = formatOrder(payload);
  const { admin } = await unauthenticated.admin(shop);
  const { id: storeId } = await getStoreData(admin);

  const reviewedProducts = await prisma.review.findMany({
    where: {
      storeId,
      productId: {
        in: formattedOrder.products.map((item) => String(item.productId)),
      },
      reviewerEmail: formattedOrder.email,
    },
    select: { productId: true },
  });
  const reviewedProductIds = new Set(
    reviewedProducts.map((review) => String(review.productId)),
  );

  formattedOrder.products = formattedOrder.products.map((item) => ({
    ...item,
    isReviewed: reviewedProductIds.has(String(item.productId)),
  }));

  await upsertOrderWithLineItems({ formattedOrder, storeId });

  return Response.json(formattedOrder);
};
