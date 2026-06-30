const GET_SHOP_BASIC_INFO = `#graphql
  query GetShopBasicInfo {
    shop {
      id
      name
      myshopifyDomain
      email
    }
  }
`;

export const getStoreData = async (admin, fallbackStoreData = null) => {
  try {
    const response = await admin.graphql(GET_SHOP_BASIC_INFO);
    const json = await response.json();

    const shop = json?.data?.shop;

    if (!shop) {
      return fallbackStoreData || null;
    }

    return {
      id: shop.id,
      name: shop.name,
      storeURL: shop.myshopifyDomain,
      email: shop.email,
    };
  } catch (error) {
    console.error("Failed to fetch store data:", error);
    return fallbackStoreData || null;
  }
};