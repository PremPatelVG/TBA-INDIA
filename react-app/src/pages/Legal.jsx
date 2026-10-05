import Seo from '../components/Seo.jsx'
import manifest from '../content/legal.json'
import privacyHtml from '../content/privacy.html?raw'
import termsHtml from '../content/terms.html?raw'
import adaHtml from '../content/ada.html?raw'

const BODIES = { privacy: privacyHtml, terms: termsHtml, ada: adaHtml }

export default function Legal({ page }) {
  const meta = manifest[page]
  const body = BODIES[page]

  return (
    <>
      <Seo title={meta.title} description={meta.description} path={meta.path} />

      <section className="inner-hero">
        <div>
          <p className="eyebrow" dangerouslySetInnerHTML={{ __html: meta.eyebrow }} />
          <h1 dangerouslySetInnerHTML={{ __html: meta.h1 }} />
          <p dangerouslySetInnerHTML={{ __html: meta.intro }} />
        </div>
      </section>

      <section className="content-page">
        <div className="legal-copy" dangerouslySetInnerHTML={{ __html: body }} />
      </section>
    </>
  )
}
