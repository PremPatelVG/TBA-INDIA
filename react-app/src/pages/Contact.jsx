import { useState } from 'react'
import Seo from '../components/Seo.jsx'

// Google Apps Script web-app endpoint (writes to the Enquiries sheet + emails).
const SHEET_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwx4P4hQuyOkYeAsI4TroWy5ImBKTWSaPi3Z_DTWtCdqQ1ayH7z428V_lF7ucH1zmZ8/exec'
const SHEET_TOKEN = ''

const EMPTY = { first_name: '', last_name: '', email: '', phone: '', interest: 'Sell a Business', message: '', 'bot-field': '' }

export default function Contact() {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const payload = { ...form, token: SHEET_TOKEN, page: window.location.pathname }
      const res = await fetch(SHEET_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
      const ok = res.ok && (await res.json().catch(() => ({ ok: true }))).ok !== false
      if (!ok) throw new Error('rejected')
      setForm(EMPTY)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <Seo
        title="Contact Us | TBA India"
        description="Share your details and our admin team will review the enquiry and contact you soon."
        path="/contact-us"
      />

      <section className="inner-hero">
        <div>
          <p className="eyebrow">Contact Us</p>
          <h1>Select the right conversation and tell us how to reach you.</h1>
          <p>Share your details and our admin team will review the enquiry and contact you soon.</p>
        </div>
      </section>

      <section className="contact-section grid grid-cols-1 gap-8 lg:grid-cols-[0.78fr_1fr]">
        <div className="contact-intro">
          <p className="eyebrow">Get in touch</p>
          <h2>Start with a confidential enquiry.</h2>
          <p>Use this form for business sale discussions, purchase enquiries, mergers and acquisitions support, or general advisory questions.</p>
          <div className="contact-card">
            <h3>TBA India</h3>
            <p>Binori B-301, Ambli BRTS Road, Ahmedabad, Gujarat 380058</p>
            <a href="mailto:indiaops@tbaindia.in">indiaops@tbaindia.in</a>
            <a href="tel:+919586009183">+91 95860-09183</a>
          </div>
        </div>

        <form className="contact-form grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <p className="hidden full-field" aria-hidden="true">
            <label>Do not fill this field
              <input name="bot-field" tabIndex={-1} autoComplete="off" value={form['bot-field']} onChange={update} />
            </label>
          </p>
          <label>First Name*
            <input name="first_name" type="text" autoComplete="given-name" required value={form.first_name} onChange={update} />
          </label>
          <label>Last Name*
            <input name="last_name" type="text" autoComplete="family-name" required value={form.last_name} onChange={update} />
          </label>
          <label>Email*
            <input name="email" type="email" autoComplete="email" required value={form.email} onChange={update} />
          </label>
          <label>Phone
            <input name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={update} />
          </label>
          <label>Interest
            <select name="interest" value={form.interest} onChange={update}>
              <option>Sell a Business</option>
              <option>Buy a Business</option>
              <option>Mergers &amp; Acquisitions</option>
              <option>General Advisory</option>
            </select>
          </label>
          <label className="full-field">Message*
            <textarea name="message" rows={5} required value={form.message} onChange={update}></textarea>
          </label>
          <button className="btn btn-primary full-field" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Submit Enquiry'}
          </button>
          {status === 'error' && (
            <p className="form-error full-field">We could not send the form automatically. Please email indiaops@tbaindia.in directly.</p>
          )}
        </form>
      </section>

      {status === 'success' && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="success-title" onClick={() => setStatus('idle')}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <h2 id="success-title">Enquiry received</h2>
            <p>Thank you. Our admin team will contact you soon.</p>
            <button className="btn btn-primary" type="button" onClick={() => setStatus('idle')}>Close</button>
          </div>
        </div>
      )}
    </>
  )
}
