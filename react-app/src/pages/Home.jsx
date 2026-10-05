import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import MetricStrip from '../components/MetricStrip.jsx'
import CtaBand from '../components/CtaBand.jsx'

export default function Home() {
  return (
    <>
      <Seo
        title="Home | TBA India"
        description="Business advisory support for owners, buyers, investors, and confidential enquiries."
        path="/"
      />

      <section className="home-hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">Trusted business advisory for owners, buyers, and investors</p>
          <h1>Connecting business sellers and buyers with clarity, confidence, and care.</h1>
          <p className="hero-lede">TBA India helps entrepreneurs explore exits, acquisitions, and business growth opportunities through practical advisory support and confidential conversations.</p>
          <div className="hero-actions">
            <Link to="/contact-us" className="btn btn-primary">Start Your Journey to Selling</Link>
            <Link to="/contact-us" className="btn btn-light">Find Your Next Business Venture</Link>
          </div>
        </div>
      </section>

      <section className="split-services grid grid-cols-1 md:grid-cols-2" aria-label="Business advisory services">
        <article className="service-card">
          <h3>Sell a Business</h3>
          <p>Plan a confidential exit, prepare buyer-ready documents, and move through negotiations with experienced guidance.</p>
          <Link to="/contact-us">Start Your Journey</Link>
        </article>
        <article className="service-card">
          <h3>Buy a Business</h3>
          <p>Review opportunities, understand the numbers, and shortlist businesses that match your goals and investment profile.</p>
          <Link to="/contact-us">Find Opportunities</Link>
        </article>
      </section>

      <MetricStrip />

      <section className="feature-section grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="section-copy">
          <p className="eyebrow">Why TBA India?</p>
          <h2>Experienced support for important business decisions.</h2>
          <p>Buying or selling a business can be one of the biggest financial decisions an entrepreneur makes. Our role is to organize the process, protect confidentiality, and help each conversation move toward a practical next step.</p>
          <Link to="/about-us" className="text-link">Learn More About Us</Link>
        </div>
        <div className="process-panel">
          <h3>How we help</h3>
          <ol>
            <li>Confidential consultation</li>
            <li>Business valuation review</li>
            <li>Buyer or seller matching</li>
            <li>Negotiation and closing support</li>
          </ol>
        </div>
      </section>

      <section className="service-grid-section">
        <div className="section-heading">
          <p className="eyebrow">Advisory pathways</p>
          <h2>Choose the conversation that fits your stage.</h2>
        </div>
        <div className="service-grid grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article className="service-card compact">
            <h3>Sell a Business</h3>
            <p>Plan a confidential exit, prepare buyer-ready documents, and move through negotiations with experienced guidance.</p>
            <Link to="/contact-us">Start Your Journey</Link>
          </article>
          <article className="service-card compact">
            <h3>Buy a Business</h3>
            <p>Review opportunities, understand the numbers, and shortlist businesses that match your goals and investment profile.</p>
            <Link to="/contact-us">Find Opportunities</Link>
          </article>
          <article className="service-card compact">
            <h3>Mergers &amp; Acquisitions</h3>
            <p>Support for growth-minded owners, strategic buyers, investors, and families evaluating acquisition or divestment options.</p>
            <Link to="/contact-us">Speak to an Advisor</Link>
          </article>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
