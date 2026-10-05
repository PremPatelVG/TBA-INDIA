import Seo from '../components/Seo.jsx'
import CtaBand from '../components/CtaBand.jsx'

export default function News() {
  return (
    <>
      <Seo
        title="TBA News | TBA India"
        description="Latest news, announcements, and updates from TBA India."
        path="/tba-news"
      />

      <section className="inner-hero">
        <div>
          <p className="eyebrow">TBA News</p>
          <h1>TBA News &amp; Updates</h1>
          <p>Announcements, milestones, and insights from the TBA India team.</p>
        </div>
      </section>

      <section className="news-section">
        <div className="news-intro">
          <p className="eyebrow">Latest updates</p>
          <h2 style={{ color: 'var(--green-950)', fontFamily: "'Source Serif 4',Georgia,serif", fontSize: 'clamp(1.9rem,3.8vw,3.1rem)', lineHeight: 1.1 }}>
            What's happening at TBA India
          </h2>
        </div>

        <div className="news-list">
          <article className="news-card news-feature">
            <div className="news-media">
              <img
                src="/assets/images/news-tba-india-launch.webp"
                alt="Launch of TBA India — Ray Titus, CEO of United Franchise Group, with the TBA India leadership team at the launch event"
                loading="lazy"
              />
            </div>
            <div className="news-body">
              <div className="news-meta">
                <span className="news-date">01 September 2026</span>
                <span className="news-tag">Announcement</span>
              </div>
              <h2>Launch of TBA India</h2>
              <p className="news-lede">India's new business transition economy: what happens after a business is built?</p>
              <p className="news-standfirst">Indian entrepreneurs turn their focus from building companies to creating long-term enterprise value — entering a new era of business.</p>
              <p><span className="news-place">1st September 2026 (New Delhi):</span> India's entrepreneurial story is gradually entering its next defining chapter — one that goes beyond starting and scaling businesses to answering a more complex question: what happens after the business is built?</p>
              <p>As Indian enterprises mature, decisions around mergers and acquisitions (M&amp;A), succession, franchising, acquisitions, and business exits are becoming increasingly important. This shift is giving rise to what could become "India's Business Economy in Transition", where creating enterprise value becomes as important as creating enterprises.</p>
              <p>Transworld Business Advisors (TBA), the world's largest business brokerage firm, launched in India with Ray Titus, CEO, United Franchise Group (UFG), gracing the event. It addresses the emerging opportunity in family, legacy and small business and brings expertise across business sales, acquisitions, M&amp;A, franchising, succession and wealth creation.</p>
              <p>TBA is addressing India's $123.8 billion business deal market, targeting businesses with annual turnover of ₹5 crore to ₹200 crore+ and bringing them onto its platform to unlock meaningful deals and growth opportunities. Powered by its proprietary CRM technology, enhanced with AI and successfully deployed across global markets, the platform offers an end-to-end ecosystem connecting businesses, facilitating transactions and enabling growth.</p>
              <blockquote className="news-quote">
                <p>"The biggest threat to India's entrepreneurial story is not failure; it is businesses that succeed but remain dependent on their founders. If we want Indian companies to compete globally, we must stop measuring success only by revenue and start measuring it by how independently, sustainably and strategically a business can grow."</p>
                <cite>Yash Vasant, Chairman, Transworld Business Advisors India (TBA India)</cite>
              </blockquote>
              <p>For decades, the dominant entrepreneurial ambition in India was straightforward: build a company, grow revenues and expand operations. But what happens after a business is built?</p>
              <p>The emerging opportunity reflects a broader shift in entrepreneurial thinking. Instead of relying exclusively on organic expansion, entrepreneurs are increasingly asking: can acquisitions help us scale faster? How can we identify businesses that complement our existing operations? And how can established businesses unlock the wealth and value they have created?</p>
              <p>The new generation of entrepreneurs is also increasingly asking different questions: how can I scale through acquisitions? How do I prepare my company for investment? How can I transition ownership to the next generation? And how do I unlock the value created over decades?</p>
              <p>This changing approach could create a significant opportunity in India's MSME ecosystem, where established businesses may increasingly become potential targets for strategic acquisitions, investment and consolidation.</p>
              <blockquote className="news-quote">
                <p>"India does not have a shortage of entrepreneurs; it has a shortage of businesses built to become institutions. Our ambition with TBA India is to help change that equation by connecting credible businesses, capital, expertise and trusted relationships, so Indian companies don't just grow bigger, but become globally investable and acquisition-ready."</p>
                <cite>Ray Titus, CEO, United Franchise Group (UFG)</cite>
              </blockquote>
              <blockquote className="news-quote">
                <p>"India's next economic breakthrough will not come from creating more businesses; it will come from making existing businesses more valuable, transferable and globally relevant. Too many Indian entrepreneurs have built businesses around themselves rather than building enterprises that can outlive them. TBA India is here to change that mindset."</p>
                <cite>Sanjiv Maini, President, TBA India</cite>
              </blockquote>
              <p>TBA's India entry comes against this changing backdrop, with the company seeking to help entrepreneurs navigate critical ownership and transition decisions.</p>
              <p>The company believes India's maturing entrepreneurial ecosystem will increasingly require professional expertise around buying and selling businesses, M&amp;A, succession and strategic exits.</p>
              <p>Other distinguished guests were also present on the occasion, and valuable interactions during the event enlightened the audience on the value that TBA India brings to Indian SMEs.</p>
            </div>
          </article>
        </div>
      </section>

      <CtaBand
        heading="Have a story or an enquiry? We would love to hear from you."
      />
    </>
  )
}
