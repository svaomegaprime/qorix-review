import {
  getReviewedProductIdsForOrder,
  upsertOrderWithLineItems,
} from "../services/orders.server.js";
import { authenticate, unauthenticated } from "../shopify.server";
import { formatOrder } from "../utils/formatOrder.js";
import { getStoreData } from "../utils/getStoreData";
import { normalizeShopifyId } from "../utils/shopifyGid.js";

export const action = async ({ request }) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  if (topic !== "ORDERS_CREATE") {
    return new Response(null, { status: 200 });
  }

  const formattedOrder = formatOrder(payload);
  const { admin } = await unauthenticated.admin(shop);
  const { id: storeId } = await getStoreData(admin);

  const reviewedProductIds = await getReviewedProductIdsForOrder({
    storeId,
    orderId: formattedOrder.orderId,
  });

  formattedOrder.products = formattedOrder.products.map((item) => ({
    ...item,
    isReviewed: reviewedProductIds.has(normalizeShopifyId(item.productId)),
  }));

  await upsertOrderWithLineItems({ formattedOrder, storeId });

  return Response.json(formattedOrder);
};
