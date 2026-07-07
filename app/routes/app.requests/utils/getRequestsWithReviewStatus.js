import { getOrders } from "../../../utils/sync.orders";
import { getOrdersWithStatus } from "./getOrdersWithStatus.server";

async function getRequestsWithReviewStatus(session, storeId) {
  const orders = await getOrders(session.shop, session.accessToken);
  return await getOrdersWithStatus(orders, storeId);
}

export default getRequestsWithReviewStatus;
