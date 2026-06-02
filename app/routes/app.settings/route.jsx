import { useOutlet } from "react-router";
import Settings from "./routes/index.jsx";
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
        <s-grid gridTemplateColumns="270px 1fr" gap="base" alignItems="start">
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

              <s-divider />

              <s-heading>Review display</s-heading>

              <Clickable
                title="Widgets"
                icon="paint-brush-flat"
                url="/app/settings/publishing-moderation"
              />

              <s-divider />

              <s-heading>General</s-heading>

              <Clickable title="Branding" icon="paint-brush-flat" />

              <Clickable title="Admin notifications" icon="notification" />
            </s-section>
          </div>

          {/* End---- Settings Menu */}

          {/* Start----- Setting Previews */}
          <s-box>{outlet ?? <Settings />}</s-box>
          {/* End----- Setting Previews */}
        </s-grid>
      </div>
    </>
  );
}
