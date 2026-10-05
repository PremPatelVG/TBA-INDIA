import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'
import MetricStrip from '../components/MetricStrip.jsx'
import CtaBand from '../components/CtaBand.jsx'

export default function About() {
  return (
    <>
      <Seo
        title="About Us | TBA India"
        description="TBA India brings the Transworld Business Advisors global model to entrepreneurs, buyers, sellers, and brokers across India."
        path="/about-us"
      />

      <section className="inner-hero">
        <div>
          <p className="eyebrow">About TBA India</p>
          <h1>About Transworld Business Advisors India.</h1>
          <p>TBA India brings the Transworld Business Advisors global model to entrepreneurs, buyers, sellers, and brokers across India.</p>
        </div>
      </section>

      <section className="content-page">
        <div className="about-global-section grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.85fr_1fr]">
          <div className="about-visual about-visual-global about-visual-image" aria-label="Global business advisory network">
            <img src="/assets/images/about-global-network.webp" alt="Business advisors networking at a professional event" loading="lazy" />
          </div>
          <div>
            <p className="eyebrow">Who we are, globally</p>
            <h2>Who We Are, Globally</h2>
            <p>Transworld Business Advisors is the world's largest business brokerage and franchise organization, helping buyers and sellers of businesses come together with clarity, confidentiality, and professionalism.</p>
            <p>Founded in Florida in 1979 and now present across 20+ countries worldwide, Transworld has built its reputation on one simple idea: every business deserves the right advisor to guide it through one of the most important transitions in its life. TBA India is the master franchise partner bringing this global model to India.</p>
          </div>
        </div>
      </section>

      <section className="about-history-section">
        <div className="section-heading">
          <p className="eyebrow">Our history</p>
          <h2>Helping Entrepreneurs for 45+ Years</h2>
        </div>
        <div className="about-history-copy">
          <p>Transworld Business Advisors was founded in 1979 in South Florida by Don and Bonnie Parrish. It quickly grew into one of the largest business brokerage firms in the United States.</p>
          <p>Although the company was thriving, founder Andrew Cagnetta envisioned even more growth. It was not long before United Franchise Group CEO Ray Titus and Cagnetta teamed up to offer Transworld Business Advisors as a franchise.</p>
          <p>With more than 30 years of experience in franchising, Titus provided the leadership under United Franchise Group, and Cagnetta provided the business brokerage industry experience. This symbiotic relationship has grown Transworld into more than 250 locations around the world and has helped more than 15,000 business owners sell their businesses.</p>
          <Link to="/our-leadership-team" className="btn btn-outline">Meet Our Team</Link>
        </div>
      </section>

      <MetricStrip />

      <section className="about-detail-section grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.9fr_1fr]">
        <div>
          <p className="eyebrow">For business owners</p>
          <h2>Why Sell With Transworld?</h2>
          <p>When a business owner needs to sell their company, they cannot just stick a For Sale sign in the window. That is where business brokers come in. By bringing in someone with deep experience evaluating potential businesses and franchises and overseeing the entire transaction, you can rest assured you will get the most possible for your business.</p>
        </div>
        <div className="about-visual about-visual-sell about-visual-image" aria-label="Business sale advisory process">
          <img src="/assets/images/about-owner-advisory.webp" alt="Advisors reviewing business expansion plans in India" loading="lazy" />
        </div>
      </section>

      <section className="about-detail-section about-detail-section-reverse grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="about-visual about-visual-broker about-visual-image lg:order-1" aria-label="Broker network support">
          <img src="/assets/images/about-broker-support.webp" alt="Advisor presenting market insights to business clients" loading="lazy" />
        </div>
        <div className="lg:order-2">
          <p className="eyebrow">For future brokers</p>
          <h2>Why Become a Broker With Transworld Business Advisors?</h2>
          <p>Our global network of brokers receives turnkey solutions to build solid businesses, including:</p>
          <ul className="about-list">
            <li>Comprehensive training program</li>
            <li>Full marketing support</li>
            <li>Local field support</li>
            <li>A name and philosophy that people trust</li>
          </ul>
        </div>
      </section>

      <CtaBand />
    </>
  )
}
