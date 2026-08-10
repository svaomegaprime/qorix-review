/* eslint-disable react/prop-types */

import CustomSection from "../../../components/essentials/CustomSection";
import { useAppWindowClose } from "../utils/useAppWindowClose";
import {
  getAppEmbedDeepLink,
  getAppBlockDeepLink,
} from "../../../utils/themeEditorLinks";

const WIDGET_BLOCK_MAP = {
  quick_review: {
    isEmbed: false,
    handle: "quick_review",
    template: "product",
    target: "newAppsSection",
  },
  trust_bar: {
    isEmbed: false,
    handle: "trust_bar",
    template: "product",
    target: "mainSection",
  },
  review_reel: {
    isEmbed: false,
    handle: "qorix-review-reel-widget",
    template: "index",
    target: "newAppsSection",
  },
  video_stack: {
    isEmbed: false,
    handle: "video-stack-widget",
    template: "index",
    target: "newAppsSection",
  },
  quote_loop: {
    isEmbed: false,
    handle: "quoteloop",
    template: "index",
    target: "newAppsSection",
  },
  review_hub: {
    isEmbed: false,
    handle: "review_hub",
    template: "index",
    target: "newAppsSection",
  },
};

export default function WidgetItem({
  widget,
  status = "NOT_INSTALLED",
  shop = "",
  apiKey = "",
}) {
  const appWindowId = `edit-window${widget?.id}`;

  useAppWindowClose({
    appWindowId,
    widgetId: widget?.id,
    onClose: () => {
      console.log("App window hidden:", widget?.id);
    },
  });

  const config = WIDGET_BLOCK_MAP[widget?.id] || {
    isEmbed: false,
    handle: widget?.id,
    template: "index",
    target: "newAppsSection",
  };
  const embedUrl = config.isEmbed
    ? getAppEmbedDeepLink({ shop, apiKey, embedHandle: config.handle })
    : getAppBlockDeepLink({
        shop,
        apiKey,
        blockHandle: config.handle,
        template: config.template,
        target: config.target || "newAppsSection",
      });

  const isInstalled = status === "INSTALLED";

  return (
    <>
      <s-app-window id={appWindowId} src={widget?.editUrl}></s-app-window>
      <CustomSection
        background="#fff"
        border="none"
        boxShadow="none"
        padding="none"
        overflow="hidden"
      >
        <CustomSection
          border="none"
          boxShadow="none"
          borderRadius="0"
          aspectRatio="1/0.83"
          padding="none"
        >
          <CustomSection
            padding="none"
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <img
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              src={widget?.previewUrl}
              alt={`${widget?.name} preview`}
            />
          </CustomSection>
        </CustomSection>
        <s-grid gap="small" padding="small base">
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
          >
            <s-heading>{widget?.name}</s-heading>
            <s-badge tone={isInstalled ? "success" : "caution"}>
              {isInstalled ? "Installed" : "Not installed"}
            </s-badge>
          </s-stack>
          <s-paragraph color="subdued">{widget?.description}</s-paragraph>
          <s-stack
            direction="inline"
            justifyContent="space-between"
            alignItems="center"
          >
            <s-button
              variant={isInstalled ? "secondary" : "primary"}
              disabled={isInstalled}
              href={isInstalled ? undefined : embedUrl}
              target="_blank"
            >
              {isInstalled ? "Installed" : "Install"}
            </s-button>
            <s-button
              icon="paint-brush-round"
              command="--show"
              commandFor={appWindowId}
            >
              Customize
            </s-button>
          </s-stack>
        </s-grid>
      </CustomSection>
    </>
  );
}
