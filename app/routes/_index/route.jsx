import { redirect, Form, useLoaderData } from "react-router";
import { login } from "../../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <>
      <div className="page">
        {/* Navbar */}
        <header className="navbarWrapper">
          <nav className="navbar">
            <div className="navLeft">
              <div className="logo">Q</div>
              <span className="brandName">Qorix Review</span>
            </div>

            <ul className="navLinks">
              <li>
                <a
                  href="https://qorix-review-docs.nextvence.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Docs
                </a>
              </li>
              <li>
                <a
                  href="https://qorix-review-docs.nextvence.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://qorix-review-docs.nextvence.com/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </header>

        <section className="hero">
          <div className="heroOverlay"></div>

          <div className="heroContent">
            <span className="badge">Shopify Review & Rating App</span>

            <h1 className="heading">Grow Your Store with Qorix Review</h1>

            <p className="subheading">
              Build trust and boost conversions using high-converting review
              widgets. Capture customer photos, videos, and authentic reviews to
              drive repeat sales.
            </p>

            {showForm && (
              <Form className="form" method="post" action="/auth/login">
                <div className="label">
                  <span className="labelTitle">Shop domain</span>
                  <input
                    className="input"
                    type="text"
                    name="shop"
                    placeholder="e.g: my-shop-domain.myshopify.com"
                    required
                  />
                  <span className="helperText">
                    e.g: my-shop-domain.myshopify.com
                  </span>
                </div>
                <button className="button" type="submit">
                  Log in
                </button>
              </Form>
            )}
          </div>
        </section>
      </div>

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html,
        body {
          width: 100%;
          min-height: 100%;
          scroll-behavior: smooth;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #022c22;
        }

        body {
          overflow-x: hidden;
        }

        .page {
          min-height: 100vh;
        }

        /* NAVBAR */
        .navbarWrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          padding: 18px 20px;
        }

        .navbar {
          max-width: 1180px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 22px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
        }

        .navLeft {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.1rem;
          color: #ffffff;
          background: linear-gradient(135deg, #10b981, #059669, #34d399);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
        }

        .brandName {
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        .navLinks {
          display: flex;
          align-items: center;
          gap: 28px;
          list-style: none;
        }

        .navLinks a {
          color: #f8fafc;
          text-decoration: none;
          font-size: 0.96rem;
          font-weight: 600;
          transition: color 0.2s ease, opacity 0.2s ease;
          opacity: 0.9;
        }

        .navLinks a:hover {
          color: #a7f3d0;
          opacity: 1;
        }

        /* HERO */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 20px 32px;
          overflow: hidden;
          background:
            radial-gradient(circle at top right, rgba(16, 185, 129, 0.32), transparent 28%),
            radial-gradient(circle at bottom left, rgba(5, 150, 105, 0.22), transparent 34%),
            radial-gradient(circle at center top, rgba(52, 211, 153, 0.12), transparent 40%),
            linear-gradient(135deg, #022c22 0%, #064e3b 35%, #047857 70%, #059669 100%);
        }

        .heroOverlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(2, 44, 34, 0.18),
            rgba(2, 44, 34, 0.48)
          );
          z-index: 1;
        }

        .heroContent {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 860px;
          text-align: center;
          color: #ffffff;
        }

        .badge {
          display: inline-block;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #d1fae5;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 22px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(10px);
        }

        .heading {
          font-size: clamp(2.6rem, 6vw, 4.8rem);
          line-height: 1.05;
          font-weight: 800;
          margin-bottom: 22px;
          letter-spacing: -0.02em;
        }

        .subheading {
          font-size: 1.08rem;
          line-height: 1.9;
          color: #d1fae5;
          max-width: 720px;
          margin: 0 auto 36px;
        }

        .form {
          max-width: 700px;
          margin: 0 auto;
          padding: 28px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          backdrop-filter: blur(14px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.24);
        }

        .label {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }

        .labelTitle {
          font-size: 1rem;
          font-weight: 700;
          color: #ecfdf5;
        }

        .input {
          width: 100%;
          padding: 16px 18px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.96);
          color: #022c22;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.18);
        }

        .helperText {
          font-size: 0.92rem;
          color: #a7f3d0;
        }

        .button {
          margin-top: 18px;
          width: 100%;
          padding: 15px 18px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #10b981, #059669, #34d399);
          color: #ffffff;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 12px 30px rgba(16, 185, 129, 0.28);
        }

        .button:hover {
          transform: translateY(-2px);
          opacity: 0.97;
        }

        @media (max-width: 768px) {
          .navbarWrapper {
            padding: 14px 14px;
          }

          .navbar {
            padding: 14px 16px;
            border-radius: 18px;
          }

          .brandName {
            font-size: 0.95rem;
          }

          .navLinks {
            gap: 14px;
          }

          .navLinks a {
            font-size: 0.86rem;
          }

          .hero {
            padding: 130px 16px 24px;
          }

          .heading {
            font-size: 2.4rem;
          }

          .subheading {
            font-size: 1rem;
          }

          .form {
            padding: 22px;
          }
        }

        @media (max-width: 560px) {
          .navbar {
            flex-direction: column;
            gap: 14px;
          }

          .navLinks {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
