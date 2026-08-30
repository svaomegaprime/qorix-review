import { useOutlet, useRouteLoaderData } from "react-router";
import Settings from "./routes/app.index.jsx";
import Clickable from "./components/elements/Clickable.jsx";
import {
  DEFAULT_OUTGOING_REQUEST_EMAIL,
  DEFAULT_POST_REQUEST_EMAIL,
  DEFAULT_SMTP_SETUP,
} from "./data/defaultData.js";
import { useState } from "react";

export async function loader() {
  return {
    outgoingRequestEmail: DEFAULT_OUTGOING_REQUEST_EMAIL,
    postRequestEmail: DEFAULT_POST_REQUEST_EMAIL,
    smtpSetup: DEFAULT_SMTP_SETUP,
  };
}
export default function SettingsRoot() {
    const { planState } = useRouteLoaderData("routes/app");

  const outlet = useOutlet();
  const [open, setOpen] = useState(false);

  return (
    <>
    <style>
      {
        `
        .review_requsts_top_bar{
          position: sticky;
          top: 40px;
        }

        @media (max-width: 620px) {
          .review_requsts_top_bar {
            position: relative;
            top: 0;
          }
        }
        `
      }
    </style>
      <div
        style={{
          maxWidth: "1200px",
          width: "100%",
          margin: "40px auto",
        }}
      >
        <s-query-container>
          <s-grid
            gridTemplateColumns="@container (inline-size > 620px) 270px 1fr, 1fr"
            gap="base"
            alignItems="start"
          >
            {/* Start---- Settings Menu */}
            <div className ="review_requsts_top_bar"
              
            >
              <s-section>
                <s-heading>Settings</s-heading>

                <Clickable
                  title="Request scheduling"
                  icon="receipt-dollar"
                  url="/app/settings"
                  planState={planState}
                />

                <Clickable
                  title="Email settings"
                  icon="email"
                  url="/app/settings/email-settings"
                  planState={planState}
                />

                <Clickable
                  title="Publishing & moderation"
                  icon="receipt-dollar"
                  url="/app/settings/publishing-moderation"
                  planState={planState}
                />

                {/* <s-stack paddingBlock="base">
                  <s-divider />
                </s-stack> */}

                {/* <s-heading>Review display</s-heading>

                <Clickable
                  title="Widgets"
                  icon="paint-brush-flat"
                  url="/app/settings/widgets"
                /> */}

                <s-stack paddingBlock="base">
                  <s-divider />
                </s-stack>

                <s-heading>General</s-heading>

                <Clickable
                  title="Branding"
                  icon="paint-brush-flat"
                  url="/app/settings/branding"
                  planState={planState}
                />

                <Clickable
                  title="Admin notifications"
                  icon="notification"
                  url="/app/settings/admin-notification"
                  planState={planState}
                />
              </s-section>
            </div>
            {/* End---- Settings Menu */}
            {/* Start---- Settings Menu Mobile*/}
            <div style={{ position: "relative", display: "none" }}>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: "1px solid #e5e5e5",
                  background: "#fff",
                }}
              >
                <h3 style={{ margin: 0 }}>Menu</h3>

                <button
                  onClick={() => setOpen(!open)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "24px",
                  }}
                >
                  ☰
                </button>
              </div>

              {/* Dropdown Menu */}
              {open && (
                <div
                  style={{
                    position: "absolute",
                    top: "60px",
                    right: "0",
                    width: "320px",
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0,0,0,.12)",
                    zIndex: 999,
                    padding: "16px",
                  }}
                >
                  <s-section>
                    <s-heading>Request reviews</s-heading>

                    <Clickable
                      title="Request scheduling"
                      icon="receipt-dollar"
                      url="/app/settings"
                    />

                    <Clickable
                      title="Email settings"
                      icon="email"
                      url="/app/settings/email-settings"
                    />

                    <Clickable
                      title="Publishing & moderation"
                      icon="receipt-dollar"
                      url="/app/settings/publishing-moderation"
                    />

                    <s-stack paddingBlock="base">
                      <s-divider />
                    </s-stack>

                    <s-heading>Review display</s-heading>

                    <Clickable
                      title="Widgets"
                      icon="paint-brush-flat"
                      url="/app/settings/widgets"
                    />

                    <s-stack paddingBlock="base">
                      <s-divider />
                    </s-stack>

                    <s-heading>General</s-heading>

                    <Clickable
                      title="Branding"
                      icon="paint-brush-flat"
                      url="/app/settings/branding"
                    />

                    <Clickable
                      title="Admin notifications"
                      icon="notification"
                      url="/app/settings/admin-notification"
                    />
                  </s-section>
                </div>
              )}
            </div>
            {/* End---- Settings Menu Mobile */}

            {/* Start----- Setting Previews */}
            <s-box>{outlet ?? <Settings />}</s-box>
            {/* End----- Setting Previews */}
          </s-grid>
        </s-query-container>
      </div>
    </>
  );
}
