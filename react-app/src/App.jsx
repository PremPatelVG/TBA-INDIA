import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Leadership from './pages/Leadership.jsx'
import News from './pages/News.jsx'
import Contact from './pages/Contact.jsx'
import Legal from './pages/Legal.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<About />} />
        <Route path="/our-leadership-team" element={<Leadership />} />
        <Route path="/tba-news" element={<News />} />
        <Route path="/contact-us" element={<Contact />} />
        <Route path="/terms-and-conditions" element={<Legal page="terms" />} />
        <Route path="/privacy-policy" element={<Legal page="privacy" />} />
        <Route path="/ada" element={<Legal page="ada" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}
