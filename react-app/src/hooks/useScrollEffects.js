import { useEffect } from 'react'

// Ports the vanilla main.js behaviours (scroll-reveal + metric count-up) to
// React. Runs after every route change, since the page content changes.
const REVEAL_SELECTOR =
  '.split-services .service-card, .metric-strip > div, ' +
  '.feature-section > *, .section-heading, .service-grid > *, .cta-band > *, ' +
  '.about-global-section > *, .about-history-copy > *, .about-detail-section > *, ' +
  '.leader-card, .contact-intro, .contact-form, .legal-section, ' +
  '.news-intro, .news-list > *'

const STAGGER_GROUPS =
  '.split-services, .metric-strip, .service-grid, .team-grid, .about-history-copy, .news-list'

function animateCount(el) {
  const match = /^(\d+)(.*)$/.exec(el.textContent.trim())
  if (!match) return
  const target = parseInt(match[1], 10)
  const suffix = match[2]
  const duration = 1100
  const started = performance.now()
  const step = (now) => {
    const p = Math.min(1, (now - started) / duration)
    const eased = 1 - Math.pow(1 - p, 3)
    el.textContent = Math.round(target * eased) + suffix
    if (p < 1) requestAnimationFrame(step)
    else el.textContent = target + suffix
  }
  requestAnimationFrame(step)
}

export default function useScrollEffects(pathname) {
  useEffect(() => {
    window.scrollTo(0, 0)

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !('IntersectionObserver' in window)) return

    // run after paint so the new route's DOM exists
    const raf = requestAnimationFrame(() => {
      const targets = document.querySelectorAll(REVEAL_SELECTOR)
      targets.forEach((el) => el.classList.add('reveal'))

      document.querySelectorAll(STAGGER_GROUPS).forEach((group) => {
        Array.prototype.slice.call(group.children, 0, 5).forEach((child, i) => {
          if (child.classList.contains('reveal')) child.classList.add('reveal-' + (i + 1))
        })
      })

      const revealObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('in')
              revealObs.unobserve(entry.target)
            }
          })
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      )
      targets.forEach((el) => revealObs.observe(el))

      const figures = document.querySelectorAll('.metric-strip strong')
      const countObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            countObs.unobserve(entry.target)
            animateCount(entry.target)
          })
        },
        { threshold: 0.4 }
      )
      figures.forEach((el) => countObs.observe(el))

      cleanup.obs = [revealObs, countObs]
    })

    const cleanup = { obs: [] }
    return () => {
      cancelAnimationFrame(raf)
      cleanup.obs.forEach((o) => o.disconnect())
    }
  }, [pathname])
}
