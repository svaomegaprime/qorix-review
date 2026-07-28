/* eslint-disable react/prop-types */

import CustomSection from "../../../components/essentials/CustomSection";
import { useAppWindowClose } from "../utils/useAppWindowClose";

export default function WidgetItem({ widget, status = "NOT_INSTALLED" }) {
    const appWindowId = `edit-window${widget?.id}`;

    useAppWindowClose({
        appWindowId,
        widgetId: widget?.id,
        onClose: () => {
            console.log("App window hidden:", widget?.id);
        },
    });

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
                        <s-badge tone={status === "INSTALLED" ? "success" : "caution"}>{status === "INSTALLED" ? "Installed" : "Not installed"}</s-badge>
                    </s-stack>
                    <s-paragraph color="subdued">{widget?.description}</s-paragraph>
                    <s-stack direction="inline" justifyContent="space-between" alignItems="center">
                        <s-button disabled={status === "INSTALLED"}>{status === "INSTALLED" ? "Embeded" : "Embed now"}</s-button>
                        <s-button icon="paint-brush-round"  command="--show" commandFor={appWindowId}>Customize</s-button>
                    </s-stack>
                </s-grid>
            </CustomSection>
        </>
    )
}
