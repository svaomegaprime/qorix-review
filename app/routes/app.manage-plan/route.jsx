import { useEffect } from "react";
import { useLoaderData } from "react-router";
import Loader from "../../components/essentials/Loader";
import { authenticate } from "../../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
    query ShopShow {
      shop {
        myshopifyDomain
      }
    }`,
  );
  const json = await response.json();
  const shopDomain = json?.data?.shop?.myshopifyDomain;
  const storeHandle = shopDomain?.replace(".myshopify.com", "") || "";
  const billingUrl = `https://admin.shopify.com/store/${storeHandle}/charges/qorix-product-review/pricing_plans`;

  return { billingUrl };
};

export default function ManagePlan() {
  const { billingUrl } = useLoaderData();

  useEffect(() => {
    if (!billingUrl) return;
    if (window.top && window.top !== window) {
      window.top.location.href = billingUrl;
    } else {
      window.location.href = billingUrl;
    }
  }, [billingUrl]);

  return <Loader />;
}
