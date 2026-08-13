export default function EmailConfirmation({ postRequestEmail, brandSettings }) {
  return (
    <>
      <div class="email-confirmation">
        {brandSettings.storeLogo && (
          <div class="qr-header">
            <img src={brandSettings.storeLogo} alt="Brand Logo" />
          </div>
        )}

        {brandSettings.storeTagline && (
          <p class="qr-tagline">{brandSettings.storeTagline}</p>
        )}

        <hr class="qr-divider" />

        {/* <p class="qr-greeting">Hi Osman,</p> */}

        {postRequestEmail.confirmationEmailBody && (
          <p class="qr-message">{postRequestEmail.confirmationEmailBody}</p>
        )}

        <div class="qr-product-card">
          <div class="qr-product-info">
            <div class="qr-product-name">Hydrating eye cream</div>
            <div class="qr-product-date">Submitted Mar 21, 2026</div>
          </div>
        </div>

        <a href="#" class="qr-cta">
          View your review <span class="qr-cta-arrow">&#8594;</span>
        </a>

        <div class="qr-footer">
          <p class="qr-footer-meta">
            {brandSettings.emailFooterText}
            <a href="#">{brandSettings.emailFooterLinkText}</a>
          </p>
          {brandSettings.isShowFooterBadge && (
            <p class="qr-footer-powered">
              Powered by <span class="qr-brand-highlight">Qorix</span>
            </p>
          )}
        </div>
      </div>
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
            /* Mother selector: everything for this email lives under .email-confirmation */
            .email-confirmation {
                max-width: 500px;
                margin: 0 auto;
                background: var(--email-bg);
                border: 1px solid var(--email-border-color);
                border-radius: 14px;
                padding: 20px;
                box-sizing: border-box;
            }

            .email-confirmation .qr-header {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: var(--store-logo-position);
                gap: 10px;
                margin-bottom: 18px;
            }

            .email-confirmation .qr-header img {
                width: 110px;
                max-width: 100%;
            }

            .email-confirmation .qr-logo-mark {
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

            .email-confirmation .qr-brand {
                line-height: 1.05;
            }

            .email-confirmation .qr-brand-name {
                font-size: 19px;
                font-weight: 700;
                color: #1a1a1a;
                letter-spacing: 0.2px;
            }

            .email-confirmation .qr-brand-sub {
                font-size: 10px;
                font-weight: 600;
                color: #9a9a9a;
                letter-spacing: 2.5px;
            }

            .email-confirmation .qr-tagline {
                font-size: 14px;
                color: var(--email-body-text-color);
                margin: 0 0 18px;
            }

            .email-confirmation .qr-divider {
                border: none;
                border-top: 1px solid #e9e9e9;
                margin: 0 0 24px;
            }

            .email-confirmation .qr-greeting {
                font-size: 15px;
                font-weight: 700;
                color: #1a1a1a;
                margin: 0 0 12px;
            }

            .email-confirmation .qr-message {
                font-size: 14.5px;
                line-height: 1.55;
                color: var(--email-body-text-color);
                margin: 0 0 24px;
            }

            .email-confirmation .qr-product-card {
                display: flex;
                align-items: center;
                gap: 14px;
                border: 1px solid #e9e9e9;
                border-radius: 6px;
                padding: 14px;
                margin-bottom: 28px;
            }

            .email-confirmation .qr-product-avatar {
                width: 56px;
                height: 56px;
                flex-shrink: 0;
                border-radius: 50%;
                border: 1px solid #d8d8d8;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .email-confirmation .qr-product-avatar svg {
                width: 26px;
                height: 26px;
                color: #b8b8b8;
            }

            .email-confirmation .qr-product-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .email-confirmation .qr-rating {
                font-size: 16px;
                color: #f5a623;
                letter-spacing: 2px;
                line-height: 1;
            }

            .email-confirmation .qr-product-name {
                font-size: 14.5px;
                font-weight: 700;
                color: var(--email-heading-color);
            }

            .email-confirmation .qr-product-date {
                font-size: 13px;
                color: var(--email-body-text-color);
            }

            .email-confirmation .qr-cta {
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

            .email-confirmation .qr-cta-arrow {
                font-size: 16px;
                line-height: 1;
            }

            .email-confirmation .qr-footer {
                text-align: center;
            }

            .email-confirmation .qr-footer-meta {
                font-size: 12.5px;
                color: rgb(from var(--email-body-text-color) r g b / 70%);
                margin: 0 0 6px;
            }

            .email-confirmation .qr-footer-meta a {
                color: rgb(from var(--email-body-text-color) r g b / 70%);
                text-decoration: underline;
            }

            .email-confirmation .qr-footer-powered {
                font-size: 13px;
                color: rgb(from var(--email-body-text-color) r g b / 50%);
                margin: 0;
            }

            .email-confirmation .qr-footer-powered .qr-brand-highlight {
                color: var(--email-button-bg-color);
                font-weight: 700;
            }
        `}
      </style>
    </>
  );
}
