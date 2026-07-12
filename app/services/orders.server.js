import prisma from "../db.server.js";

/**
 * @param {import("@prisma/client").Prisma.TransactionClient} tx
 * @param {string} orderDbId
 * @param {Array<Record<string, any>>} products
 */
async function replaceOrderLineItems(tx, orderDbId, products) {
  await tx.orderLineItem.deleteMany({ where: { orderId: orderDbId } });
  if (products.length === 0) return;

  await tx.orderLineItem.createMany({
    data: products.map((product) => ({
      orderId: orderDbId,
      productId: String(product.productId),
      title: product.title,
      quantity: product.quantity,
      handle: product.productHandle ?? product.handle ?? null,
      url: product.url ?? null,
      image: product.image ?? null,
      isReviewed: product.isReviewed ?? false,
    })),
  });
}

/**
 * Idempotently persist an order header and replace its line items atomically.
 * @param {{ formattedOrder: Record<string, any>, storeId: string }} input
 */
export async function upsertOrderWithLineItems({ formattedOrder, storeId }) {
  const products = formattedOrder.products ?? [];
  const orderFields = {
    orderId: formattedOrder.orderId,
    fulfillmentStatus: formattedOrder.fulfillmentStatus ?? "unfulfilled",
    paymentStatus: formattedOrder.status,
    userEmail: formattedOrder.email,
    reviewCheckStatus: "PENDING",
    totalPrice: formattedOrder.totalPrice,
    currency: formattedOrder.currency,
  };

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.upsert({
      where: {
        storeId_orderId: { storeId, orderId: formattedOrder.orderId },
      },
      update: orderFields,
      create: {
        ...orderFields,
        store: { connect: { storeGID: storeId } },
      },
    });

    await replaceOrderLineItems(tx, order.id, products);
    return order;
  });
}
