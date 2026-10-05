import { Link } from 'react-router-dom'

export default function CtaBand({
  eyebrow = 'Next step',
  heading = 'Tell us what you are planning. We will help you decide the right path.',
  buttonText = 'Contact Our Team',
}) {
  return (
    <section className="cta-band">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{heading}</h2>
      <Link to="/contact-us" className="btn btn-primary">{buttonText}</Link>
    </section>
  )
}
