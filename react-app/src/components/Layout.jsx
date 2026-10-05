import { useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import useScrollEffects from '../hooks/useScrollEffects.js'

export default function Layout({ children }) {
  const { pathname } = useLocation()
  useScrollEffects(pathname)

  return (
    <div className="site-shell min-h-screen overflow-x-hidden bg-paper">
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  )
}
