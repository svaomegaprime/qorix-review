import prisma from "../../../db.server";

export async function getOrdersWithStatus(orders, storeId) {
  const ordersDb = await prisma.order.findMany({
    where: {
      storeId,
    },
    select: {
      userEmail: true,
      orderId: true,
      reviewCheckStatus: true,
      requestType: true,
    },
  });

  // Create lookup map (email + orderId)
  const orderMap = new Map(
    ordersDb.map((order) => [
      `${order.userEmail}-${order.orderId}`,
      {
        reviewCheckStatus: order.reviewCheckStatus,
        requestType: order.requestType,
      },
    ]),
  );

  // Merge reviewCheckStatus and requestType into Shopify orders
  return orders.map((order) => {
    const key = `${order.email}-${order.orderId}`;
    const dbData = orderMap.get(key);
    return {
      ...order,
      reviewCheckStatus: dbData?.reviewCheckStatus ?? "PENDING",
      requestType: dbData?.requestType ?? "AUTOMATIC",
    };
  });
}
