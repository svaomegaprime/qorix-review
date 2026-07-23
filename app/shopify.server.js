import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import {
  DEFAULT_ADMIN_NOTIFICATION,
  DEFAULT_BRANDING,
  DEFAULT_OUTGOING_REQUEST_EMAIL,
  DEFAULT_POST_REQUEST_EMAIL,
  DEFAULT_PUBLISHING_MODERATION,
  DEFAULT_REQUEST_SCHEDULING,
  DEFAULT_SMTP_SETUP,
  DEFAULT_WIDGET,
} from "./routes/app.settings/data/defaultData";
import { DEFAULT_DB_FORMATED_DATA } from "./routes/app.widgets/routes/app.quick-review/data/defaultData";
import { setAppMetafield } from "./utils/appMetafields.server";
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
  webhooks: {
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/orders/create",
    },
    ORDERS_UPDATED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/orders/updated",
    },
    ORDERS_CANCELLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/orders/cancelled",
    },
  },
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  hooks: {
    afterAuth: async ({ session, admin }) => {
      try {
        shopify.registerWebhooks({ session });
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

        //full store data send to the database for the first time and update if already exists
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

        // Full settings install ar sathe sathe update korte hobe

        const storeSettings = await prisma.storeSettings.upsert({
          where: {
            storeId: shopData.id,
          },
          update: {},
          create: {
            storeId: shopData.id,
            requestScheduling: {
              create: DEFAULT_REQUEST_SCHEDULING,
            },
            emailSettings: {
              create: {
                ...DEFAULT_SMTP_SETUP,
                ...DEFAULT_OUTGOING_REQUEST_EMAIL,
                ...DEFAULT_POST_REQUEST_EMAIL,
              },
            },
            publishingModeration: {
              create: DEFAULT_PUBLISHING_MODERATION,
            },
            widgetsSettings: {
              create: DEFAULT_WIDGET,
            },
            brandingSettings: {
              create: DEFAULT_BRANDING,
            },
            adminNotification: {
              create: DEFAULT_ADMIN_NOTIFICATION,
            },
          },
          include: {
            requestScheduling: true,
            emailSettings: true,
            publishingModeration: true,
            widgetsSettings: true,
            brandingSettings: true,
            adminNotification: true,
          },
        });

        // all data is set in the database for the first time and update if already exists
        const quickReviewWidget = await prisma.quickReviewWidget.upsert({
          where: {
            storeId: shopData.id,
          },
          update: {},
          create: {
            ...DEFAULT_DB_FORMATED_DATA,
            storeId: shopData.id,
          },
        });

        const metafieldResult = await setAppMetafield(
          admin,
          "quick_review",
          quickReviewWidget,
        );

        // Quote Loop Widget data set in the database for the first time and update if already exists
        // const quoteLoopWidget = await prisma.quoteLoopWidget.upsert({
        //   where: {
        //     storeId: shopData.id,
        //   },
        //   update: {},
        //   create: {
        //     ...DEFAULT_DB_FORMATED_DATA,
        //     storeId: shopData.id,
        //   },
        // });

        // const metafieldResult1 = await setAppMetafield(
        //   admin,
        //   "quote_loop",
        //   quoteLoopWidget,
        // );
      } catch (error) {
        console.error("afterAuth shop fetch failed:", error);
      }
    },
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
