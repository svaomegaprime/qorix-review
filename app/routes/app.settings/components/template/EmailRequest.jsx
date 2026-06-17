import BrandLogo from "../../../../assets/icon/brandLogo.png";

export default function EmailRequest() {
  return (
    <>
      <style>
        {`
        
        /* Mother selector: everything for this email lives under .email-request */
        .email-request {
            max-width: 500px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e6e6e6;
            border-radius: 12px;
            padding: 20px;
            box-sizing: border-box;
        }
        
        .email-request .qr-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 18px;
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
        
        .email-request .qr-brand-name {
            font-size: 19px;
            font-weight: 700;
            color: #1a1a1a;
            letter-spacing: 0.2px;
        }
        
        .email-request .qr-brand-sub {
            font-size: 10px;
            font-weight: 600;
            color: #9a9a9a;
            letter-spacing: 2.5px;
        }
        
        .email-request .qr-tagline {
            font-size: 14px;
            color: #8b8b8b;
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
            color: #4a4a4a;
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
            color: #1a1a1a;
        }
        
        .email-request .qr-product-date {
            font-size: 13px;
            color: #9a9a9a;
        }
        
        .email-request .qr-cta {
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
            color: #b0b0b0;
            margin: 0 0 6px;
        }
        
        .email-request .qr-footer-meta a {
            color: #b0b0b0;
            text-decoration: underline;
        }
        
        .email-request .qr-footer-powered {
            font-size: 13px;
            color: #9a9a9a;
            margin: 0;
        }
        
        .email-request .qr-footer-powered .qr-brand-highlight {
            color: #1f8f4f;
            font-weight: 700;
        }
    `}
      </style>
      <div class="email-request">
        <div class="qr-header">
          <img src={BrandLogo} alt="Brand logo" />
        </div>

        <p class="qr-tagline">Skincare that makes you glow</p>

        <hr class="qr-divider" />

        <p class="qr-greeting">Hi Osman,</p>
        <p class="qr-message">
          Thank you for your recent order from Qorix Review! We'd love to hear
          what you think. It only takes 30 seconds.
        </p>

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
          Leave a review <span class="qr-cta-arrow">&#8594;</span>
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
    </>
  );
}
