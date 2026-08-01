/* eslint-disable react/prop-types */

import CustomSection from "../../../components/essentials/CustomSection";
import { useAppWindowClose } from "../utils/useAppWindowClose";
import {
    getAppEmbedDeepLink,
    getAppBlockDeepLink,
} from "../../../utils/themeEditorLinks";

const WIDGET_BLOCK_MAP = {
    quick_review: { isEmbed: true, handle: "app_embed", template: "product" },
    trust_bar: { isEmbed: false, handle: "trust_bar", template: "product" },
    review_reel: { isEmbed: false, handle: "qorix-review-reel-widget", template: "product" },
    video_stack: { isEmbed: false, handle: "video-stack-widget", template: "product" },
    quote_loop: { isEmbed: false, handle: "quoteloop", template: "product" },
    review_hub: { isEmbed: false, handle: "review_hub", template: "product" },
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

    const config = WIDGET_BLOCK_MAP[widget?.id] || { isEmbed: false, handle: widget?.id, template: "product" };
    const embedUrl = config.isEmbed
        ? getAppEmbedDeepLink({ shop, apiKey, embedHandle: config.handle })
        : getAppBlockDeepLink({
            shop,
            apiKey,
            blockHandle: config.handle,
            template: config.template,
            target: "newAppsSection",
        });

    const isInstalled = status === "INSTALLED";

    return (
        <>
            <s-app-window id={appWindowId} src={widget?.editUrl}></s-app-window>
            <CustomSection background="#fff" border="none" boxShadow="none" padding="none" overflow="hidden">
                <CustomSection background="#BCE1AF" border="none" boxShadow="none" borderRadius="0" aspectRatio="1/0.83">
                    <CustomSection background="#fff" padding="none" aspectRatio="1/0.8" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                        <img src={widget?.previewUrl} alt={`${widget?.name} preview`} />
                    </CustomSection>
                </CustomSection>
                <s-grid gap="small" padding="small base">
                    <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                        <s-heading>{widget?.name}</s-heading>
                        <s-badge tone={isInstalled ? "success" : "caution"}>
                            {isInstalled ? "Installed" : "Not installed"}
                        </s-badge>
                    </s-stack>
                    <s-paragraph color="subdued">{widget?.description}</s-paragraph>
                    <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                        <s-button
                            variant={isInstalled ? "secondary" : "primary"}
                            disabled={isInstalled}
                            href={isInstalled ? undefined : embedUrl}
                            target="_blank"
                        >
                            {isInstalled ? "Installed" : "Install"}
                        </s-button>
                        <s-button icon="paint-brush-round" command="--show" commandFor={appWindowId}>
                            Customize
                        </s-button>
                    </s-stack>
                </s-grid>
            </CustomSection>
        </>
    );
}
