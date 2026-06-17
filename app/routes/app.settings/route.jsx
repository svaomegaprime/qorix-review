import { useOutlet } from "react-router";
import Settings from "./routes/app.index.jsx";
import Clickable from "./components/elements/Clickable.jsx";

export default function SettingsRoot() {
  const outlet = useOutlet();

  return (
    <>
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
            <div
              style={{
                position: "sticky",
                top: "40px",
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

            {/* End---- Settings Menu */}

            {/* Start----- Setting Previews */}
            <s-box>{outlet ?? <Settings />}</s-box>
            {/* End----- Setting Previews */}
          </s-grid>
        </s-query-container>
      </div>
    </>
  );
}
