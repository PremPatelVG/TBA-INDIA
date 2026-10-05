import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const NAV = [
  ['/', 'Home'],
  ['/about-us', 'About Us'],
  ['/our-leadership-team', 'Our Leadership Team'],
  ['/tba-news', 'TBA News'],
  ['/contact-us', 'Contact Us'],
  ['/terms-and-conditions', 'T&C'],
  ['/privacy-policy', 'Privacy Policy'],
  ['/ada', 'ADA'],
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const navRef = useRef(null)
  const btnRef = useRef(null)

  // close the mobile menu whenever the route changes
  useEffect(() => { setOpen(false) }, [pathname])

  // sticky-header shadow / promo collapse
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // close on outside-click or Escape while open
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (navRef.current && !navRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('click', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header className={'site-header w-full' + (scrolled ? ' is-scrolled' : '')}>
      <div className="promo-bar flex min-h-10 flex-wrap items-center justify-center gap-2 px-4 py-2 text-center text-sm text-white">
        <span>Helping owners buy, grow, and sell businesses.</span>
        <Link to="/contact-us">Talk to an Advisor</Link>
      </div>

      <div className="brand-row flex flex-col gap-4 bg-white px-4 py-5 md:flex-row md:items-center md:justify-between lg:px-16">
        <Link className="brand logo-link inline-flex items-center" to="/" aria-label="TBA India home">
          <span className="logo-panel">
            <img src="/assets/images/tba-logo-stacked.webp" alt="TBA India" className="brand-logo" />
          </span>
        </Link>
        <div className="header-actions flex flex-wrap items-center gap-3">
          <a href="tel:+919586009183" className="phone-link" aria-label="Call TBA India">+91 95860-09183</a>
          <Link to="/contact-us" className="btn btn-outline">Contact Us</Link>
        </div>
      </div>

      <nav className="main-nav flex items-center justify-end px-4 py-3 md:justify-center" aria-label="Main navigation">
        <button
          ref={btnRef}
          className="mobile-nav-trigger"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={open}
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
        <div ref={navRef} className={'nav-menu nav-items' + (open ? ' is-open' : '')}>
          {NAV.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
