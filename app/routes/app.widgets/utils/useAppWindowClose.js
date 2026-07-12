import { useEffect } from "react";

const APP_WINDOW_CHANNEL = "qorix:app-window";
const APP_WINDOW_STORAGE_KEY = "qorix:app-window-event";
const CLOSE_APP_WINDOW_EVENT = "qorix:close-app-window";

const createClosePayload = (widgetId) => ({
    type: CLOSE_APP_WINDOW_EVENT,
    widgetId,
    nonce: Date.now(),
});

const isClosePayloadForWidget = (payload, widgetId) => (
    payload?.type === CLOSE_APP_WINDOW_EVENT && payload?.widgetId === widgetId
);

export function requestAppWindowClose(widgetId) {
    const payload = createClosePayload(widgetId);

    if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel(APP_WINDOW_CHANNEL);
        channel.postMessage(payload);
        window.setTimeout(() => channel.close(), 250);
    }

    try {
        localStorage.setItem(APP_WINDOW_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
        console.warn("Unable to request app-window close through storage:", error);
    }

    window.parent.postMessage(payload, "*");
    window.top.postMessage(payload, "*");
}

export function useAppWindowClose({ appWindowId, widgetId, onClose }) {
    useEffect(() => {
        const appWindow = document.getElementById(appWindowId);
        let channel;

        const closeAppWindow = () => {
            document.getElementById(appWindowId)?.hide?.();
        };

        const handleCloseRequest = (payload) => {
            if (!isClosePayloadForWidget(payload, widgetId)) {
                return;
            }

            closeAppWindow();
        };

        const handleMessage = (event) => {
            if (event.origin !== window.location.origin) {
                return;
            }

            handleCloseRequest(event.data);
        };

        const handleChannelMessage = (event) => {
            handleCloseRequest(event.data);
        };

        const handleStorage = (event) => {
            if (event.key !== APP_WINDOW_STORAGE_KEY || !event.newValue) {
                return;
            }

            try {
                handleCloseRequest(JSON.parse(event.newValue));
            } catch (error) {
                console.warn("Unable to parse app-window close request:", error);
            }
        };

        const handleHide = () => {
            onClose?.();
        };

        if ("BroadcastChannel" in window) {
            channel = new BroadcastChannel(APP_WINDOW_CHANNEL);
            channel.addEventListener("message", handleChannelMessage);
        }

        window.addEventListener("message", handleMessage);
        window.addEventListener("storage", handleStorage);
        appWindow?.addEventListener("hide", handleHide);

        return () => {
            channel?.removeEventListener("message", handleChannelMessage);
            channel?.close();
            window.removeEventListener("message", handleMessage);
            window.removeEventListener("storage", handleStorage);
            appWindow?.removeEventListener("hide", handleHide);
        };
    }, [appWindowId, onClose, widgetId]);
}
