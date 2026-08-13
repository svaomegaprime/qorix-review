export default function EmailRequest({ outgoingRequestEmail, brandSettings }) {
  return (
    <>
      <style>
        {`
        :root {
          --store-logo-position: ${brandSettings.storeLogoPosition};
          --email-button-bg-color: ${brandSettings.emailPrimaryButtonColor};
          --email-button-text-color: ${brandSettings.emailButtonTextColor};
          --email-heading-color: ${brandSettings.emailHeadingColor};
          --email-bg : ${brandSettings.emailBackgroundColor};
          --email-body-text-color: ${brandSettings.emailBodyTextColor};
          --email-border-color: ${brandSettings.emailAccentBorderColor};
        }

        /* Mother selector: everything for this email lives under .email-request */
        .email-request {
            max-width: 500px;
            margin: 0 auto;
            background: var(--email-bg);
            border: 1px solid var(--email-border-color);
            border-radius: 12px;
            padding: 20px;
            box-sizing: border-box;
        }

        .email-request .qr-header {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: var(--store-logo-position);
            gap: 10px;
            margin-bottom: 18px;
        }

        .email-request .qr-header img {
            width: 110px;
            max-width: 100%;
        }

        .email-request .qr-logo-mark {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #1f8f4f;
            color: #ffffff;
            font-size: 17px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .email-request .qr-brand {
            line-height: 1.05;
        }


        .email-request .qr-tagline {
            font-size: 14px;
            color: var(--email-body-text-color);
            margin: 0 0 18px;
        }

        .email-request .qr-divider {
            border: none;
            border-top: 1px solid #e9e9e9;
            margin: 0 0 24px;
        }

        .email-request .qr-greeting {
            font-size: 15px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 12px;
        }

        .email-request .qr-message {
            font-size: 14.5px;
            line-height: 1.55;
            color: var(--email-body-text-color);
            margin: 0 0 24px;
        }

        .email-request .qr-product-card {
            display: flex;
            align-items: center;
            gap: 14px;
            border: 1px solid #e9e9e9;
            border-radius: 6px;
            padding: 14px;
            margin-bottom: 28px;
        }

        .email-request .qr-product-thumb {
            width: 64px;
            height: 64px;
            flex-shrink: 0;
            border-radius: 4px;
            background: #f1f1ef;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .email-request .qr-product-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .email-request .qr-product-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .email-request .qr-product-name {
            font-size: 14.5px;
            font-weight: 700;
            color: var(--email-body-text-color);
        }

        .email-request .qr-product-date {
            font-size: 13px;
            color: var(--email-body-text-color);
        }

        .email-request .qr-cta {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            background: var(--email-button-bg-color);
            color: var(--email-button-text-color);
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            border: none;
            border-radius: 6px;
            padding: 15px 0;
            box-sizing: border-box;
            margin-bottom: 30px;
            cursor: pointer;
        }

        .email-request .qr-cta-arrow {
            font-size: 16px;
            line-height: 1;
        }

        .email-request .qr-footer {
            text-align: center;
        }

        .email-request .qr-footer-meta {
            font-size: 12.5px;
            color: rgb(from var(--email-body-text-color) r g b / 70%);
            margin: 0 0 6px;
        }

        .email-request .qr-footer-meta a {
            color: rgb(from var(--email-body-text-color) r g b / 70%);
            text-decoration: underline;
        }

        .email-request .qr-footer-powered {
            font-size: 13px;
            color: rgb(from var(--email-body-text-color) r g b / 50%);
            margin: 0;
        }

        .email-request .qr-footer-powered .qr-brand-highlight {
            color: var(--email-button-bg-color);
            font-weight: 700;
        }
    `}
      </style>
      <div class="email-request">
        {brandSettings.storeLogo && (
          <div class="qr-header">
            <img src={brandSettings.storeLogo} alt="Brand logo" />
          </div>
        )}

        {brandSettings.storeTagline && (
          <p class="qr-tagline">{brandSettings.storeTagline}</p>
        )}
        <hr class="qr-divider" />

        {/* <p class="qr-greeting">Hi Osman,</p> */}
        {outgoingRequestEmail.requestEmailBody && (
          <p class="qr-message">{outgoingRequestEmail.requestEmailBody}</p>
        )}

        <div class="qr-product-card">
          <div class="qr-product-thumb">
            <img
              src="https://plus.unsplash.com/premium_photo-1676070096487-32dd955e09e0?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3V0ZSUyMGZsb3dlcnxlbnwwfHwwfHx8MA%3D%3D"
              alt="Hydrating eye cream"
            />
          </div>
          <div class="qr-product-info">
            <div class="qr-product-name">Hydrating eye cream</div>
            <div class="qr-product-date">Ordered, march 14, 2026</div>
          </div>
        </div>

        <a href="#" class="qr-cta">
          {outgoingRequestEmail.requestEmailButton}{" "}
          {/* <span class="qr-cta-arrow">&#8594;</span> */}
        </a>

        <div class="qr-footer">
          <p class="qr-footer-meta">
            {brandSettings.emailFooterText ? brandSettings.emailFooterText : ""}{" "}
            {brandSettings.emailFooterLinkText && (
              <a href="#">{brandSettings.emailFooterLinkText}</a>
            )}
          </p>
          {brandSettings.isShowFooterBadge && (
            <p class="qr-footer-powered">
              Powered by <span class="qr-brand-highlight">Qorix</span>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
