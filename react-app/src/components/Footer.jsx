import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-cta flex flex-wrap items-center justify-center gap-4 lg:justify-between">
        <h2>Ready for what comes next on your entrepreneurial journey?</h2>
        <Link to="/contact-us" className="btn btn-light">Talk to an Advisor</Link>
      </div>
      <div className="footer-main grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Link to="/" className="brand footer-brand logo-link" aria-label="TBA India home">
            <span className="logo-panel footer-logo-panel">
              <img src="/assets/images/tba-logo-stacked.webp" alt="TBA India" className="brand-logo" />
            </span>
          </Link>
          <p>TBA India supports business owners, buyers, investors, and growing entrepreneurs with confidential advisory conversations.</p>
        </div>
        <div>
          <h3>Quick Links</h3>
          <div className="footer-links">
            <Link to="/about-us">About</Link>
            <Link to="/our-leadership-team">Leadership Team</Link>
            <Link to="/tba-news">TBA News</Link>
            <Link to="/contact-us">Contact Us</Link>
            <Link to="/terms-and-conditions">Terms & Conditions</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/ada">ADA</Link>
          </div>
        </div>
        <div>
          <h3>Get in Touch</h3>
          <address>
            TBA India<br />
            Binori B-301, Ambli BRTS Road,<br />
            Ahmedabad, Gujarat 380058<br />
            <a href="mailto:indiaops@tbaindia.in">indiaops@tbaindia.in</a><br />
            <a href="tel:+919586009183">+91 95860-09183</a>
          </address>
        </div>
      </div>
      <div className="footer-bottom">
        <span>Copyright 2026 TBA India. All Rights Reserved.</span>
        <span>Business advisory information is provided for general discussion only.</span>
      </div>
    </footer>
  )
}
