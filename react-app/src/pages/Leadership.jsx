import Seo from '../components/Seo.jsx'
import CtaBand from '../components/CtaBand.jsx'
import leaders from '../data/leaders.js'

export default function Leadership() {
  return (
    <>
      <Seo
        title="Our Leadership Team | TBA India"
        description="Meet the leadership team guiding TBA India."
        path="/our-leadership-team"
      />

      <section className="inner-hero">
        <div>
          <p className="eyebrow">Our Leadership Team</p>
          <h1>Meet the leadership team guiding TBA India.</h1>
          <p>Our board members and regional leaders support confidential business advisory conversations across India.</p>
        </div>
      </section>

      <section className="leadership-section">
        <div className="team-grid">
          {leaders.map((p) => (
            <article className="leader-card" key={p.name}>
              <div className="leader-photo-frame">
                <img src={p.img} alt={p.name} className="leader-photo" style={{ objectPosition: p.pos }} />
              </div>
              <div className="leader-body">
                <h2>{p.name}</h2>
                <p className="role">{p.role}</p>
                <ul className="leader-creds">
                  {p.creds.map((c) => <li key={c}>{c}</li>)}
                </ul>
                <p className="leader-bio">{p.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CtaBand />
    </>
  )
}
