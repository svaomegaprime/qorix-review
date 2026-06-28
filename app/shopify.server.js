import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
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
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  hooks: {
    afterAuth: async ({ session }) => {
      try {
        const adminApiUrl = `https://${session.shop}/admin/api/2026-04/graphql.json`;

        const response = await fetch(adminApiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": session.accessToken,
          },
          body: JSON.stringify({ query: GET_SHOP_BASIC_INFO }),
        });



        const text = await response.text();

        if (!response.ok) {
          console.error("Shopify HTTP error:", response.status, text);
          return;
        }

        const result = JSON.parse(text);

        if (result.errors) {
          console.error("Shopify GraphQL errors:", result.errors);
          return;
        }

        const shopData = result.data?.shop;

        if (!shopData) {
          console.error("No shop data returned:", result);
          return;
        }

        console.log("Shop info:", shopData);



        await prisma.store.upsert({
          where: { storeGID: shopData.id },
          update: {
            storeURL: shopData.myshopifyDomain,
            storeEmail: shopData.email ?? "",
          },
          create: {
            storeGID: shopData.id,
            storeURL: shopData.myshopifyDomain,
            storeEmail: shopData.email ?? "",
          },
        });

        
        //  fst a db te up hobe dbr deoa res dia metafield ar data update hobe
        // Full settings install ar sathe sathe update korte hobe
        // sob widget ar default data db te update kore metafield a rakhte hobe

        //  

      } catch (error) {
        console.error("afterAuth shop fetch failed:", error);
      }
    }
  },
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
