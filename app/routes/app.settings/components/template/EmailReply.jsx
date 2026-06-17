import BrandLogo from "../../../../assets/icon/brandLogo.png";

export default function EmailReply() {
  return (
    <>
      <div class="email-reply">
        <div class="qr-header">
          <img src={BrandLogo} alt="brand logo" />
        </div>

        <p class="qr-tagline">Skincare that makes you glow</p>

        <hr class="qr-divider" />

        <p class="qr-greeting">Hi Osman,</p>
        <p class="qr-message">
          Glow Store just replied to your review of Hydrating Eye Cream.
        </p>

        <div class="qr-card">
          <div class="qr-card-avatar">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <circle cx="12" cy="8" r="3.2"></circle>
              <path
                d="M5 19c0-3.5 3-6 7-6s7 2.5 7 6"
                stroke-linecap="round"
              ></path>
            </svg>
          </div>
          <div class="qr-card-body">
            <div class="qr-card-title">Your review</div>
            <div class="qr-rating">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p class="qr-quote">
              &ldquo;Good results, noticed a difference after a week.&rdquo;
            </p>
          </div>
        </div>

        <div class="qr-card">
          <div class="qr-card-avatar">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                d="M4 9.5 5.5 4h13L20 9.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M5.5 9.5V19h13V9.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
              <path
                d="M10 19v-5h4v5"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
          </div>
          <div class="qr-card-body">
            <div class="qr-card-title">Reply from Glow Store</div>
            <p class="qr-quote">
              &ldquo;Thank you Osman! So glad it&rsquo;s working well for you
              &#127807;&rdquo;
            </p>
          </div>
        </div>

        <a href="#" class="qr-cta">
          See the reply <span class="qr-cta-arrow">&#8594;</span>
        </a>

        <div class="qr-footer">
          <p class="qr-footer-meta">
            @2026 glow store &nbsp;&middot;&nbsp; <a href="#">Unsubscribe</a>
          </p>
          <p class="qr-footer-powered">
            Powered by <span class="qr-brand-highlight">Qorix</span>
          </p>
        </div>
      </div>
      <style>
        {`  
       
        /* Mother selector: everything for this email lives under .email-reply */
        .email-reply {
            max-width: 500px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e6e6e6;
            border-radius: 20px;
            padding: 20px;
            box-sizing: border-box;
        }
        
        .email-reply .qr-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 18px;
        }
        
        .email-reply .qr-logo-mark {
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
        
        .email-reply .qr-brand {
            line-height: 1.05;
        }
        
        .email-reply .qr-brand-name {
            font-size: 19px;
            font-weight: 700;
            color: #1a1a1a;
            letter-spacing: 0.2px;
        }
        
        .email-reply .qr-brand-sub {
            font-size: 10px;
            font-weight: 600;
            color: #9a9a9a;
            letter-spacing: 2.5px;
        }
        
        .email-reply .qr-tagline {
            font-size: 14px;
            color: #8b8b8b;
            margin: 0 0 18px;
        }
        
        .email-reply .qr-divider {
            border: none;
            border-top: 1px solid #e9e9e9;
            margin: 0 0 24px;
        }
        
        .email-reply .qr-greeting {
            font-size: 15px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 12px;
        }
        
        .email-reply .qr-message {
            font-size: 14.5px;
            line-height: 1.55;
            color: #4a4a4a;
            margin: 0 0 24px;
        }
        
        .email-reply .qr-card {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            border: 1px solid #e9e9e9;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
        }
        
        .email-reply .qr-card-avatar {
            width: 44px;
            height: 44px;
            flex-shrink: 0;
            border-radius: 50%;
            border: 1px solid #d8d8d8;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .email-reply .qr-card-avatar svg {
            width: 22px;
            height: 22px;
            color: #b8b8b8;
        }
        
        .email-reply .qr-card-body {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 0;
        }
        
        .email-reply .qr-card-title {
            font-size: 14.5px;
            font-weight: 700;
            color: #1a1a1a;
        }
        
        .email-reply .qr-rating {
            font-size: 16px;
            color: #f5a623;
            letter-spacing: 2px;
            line-height: 1;
        }
        
        .email-reply .qr-quote {
            font-size: 14px;
            line-height: 1.5;
            color: #4a4a4a;
            margin: 0;
        }
        
        .email-reply .qr-cta {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            background: #1f8f4f;
            color: #ffffff;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            border: none;
            border-radius: 8px;
            padding: 15px 0;
            box-sizing: border-box;
            margin: 26px 0 30px;
            cursor: pointer;
        }
        
        .email-reply .qr-cta-arrow {
            font-size: 16px;
            line-height: 1;
        }
        
        .email-reply .qr-footer {
            text-align: center;
        }
        
        .email-reply .qr-footer-meta {
            font-size: 12.5px;
            color: #b0b0b0;
            margin: 0 0 6px;
        }
        
        .email-reply .qr-footer-meta a {
            color: #b0b0b0;
            text-decoration: underline;
        }
        
        .email-reply .qr-footer-powered {
            font-size: 13px;
            color: #9a9a9a;
            margin: 0;
        }
        
        .email-reply .qr-footer-powered .qr-brand-highlight {
            color: #1f8f4f;
            font-weight: 700;
        }
    `}
      </style>
    </>
  );
}
