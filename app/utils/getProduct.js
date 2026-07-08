export const getProduct = async (admin, productId) => {
  const response = await admin.graphql(
    `#graphql
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          onlineStoreUrl
          status

          featuredImage {
            url
            altText
          }
        }
      }
    `,
    {
      variables: {
        id: productId,
      },
    },
  );

  const { data, errors } = await response.json();

  if (errors?.length) {
    console.error("Failed to fetch product", { productId, errors });
    return null;
  }

  return data?.product ?? null;
};
