import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const DEMO_AUTH_KEY = 'krishivision_demo_auth'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (localStorage.getItem(DEMO_AUTH_KEY) === 'true') {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const onSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem(DEMO_AUTH_KEY, 'true')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-[0_20px_60px_rgba(10,20,10,0.08)]">
        <div className="text-center mb-8">
          <span className="material-symbols-outlined text-primary text-4xl">park</span>
          <h1 className="text-3xl font-extrabold text-on-surface mt-3" style={{ fontFamily: 'Manrope, sans-serif' }}>
            KrishiVision Demo Login
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Enter any credentials to continue to your dashboard.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="demo@krishivision.app"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:opacity-90 transition"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Sign In
          </button>
        </form>

        <Link
          to="/landing"
          className="mt-5 block text-center text-sm text-primary font-semibold hover:underline"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          View product landing page
        </Link>
      </div>
    </div>
  )
}
