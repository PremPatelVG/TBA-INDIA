import { Link } from 'react-router-dom'
import Seo from '../components/Seo.jsx'

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found | TBA India" description="The page you were looking for could not be found." path="/404" />
      <section className="inner-hero">
        <div>
          <p className="eyebrow">Error 404</p>
          <h1>We couldn't find that page.</h1>
          <p>The page you were looking for may have moved. Let's get you back on track.</p>
        </div>
      </section>
      <section className="content-page" style={{ textAlign: 'center' }}>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </section>
    </>
  )
}
