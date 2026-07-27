import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAccountData, clearAllScans } from '../utils/scanStorage'

const cropOptions = ['Wheat', 'Rice', 'Soybean', 'Corn', 'Cotton', 'Sugarcane', 'Tomato', 'Other']
const regionOptions = ['North India', 'South India', 'East India', 'West India', 'Central India', 'Other']

const STORAGE_KEY = 'krishivision_settings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSettings(profile, notifications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, notifications }))
  } catch {
    // Storage unavailable — silently ignore
  }
}

const defaults = loadSettings()

export default function Settings() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(defaults?.notifications ?? {
    emailAlerts: true,
    diseaseAlerts: true,
    weeklyReport: false,
    weatherAdvisories: true,
  })

  const [profile, setProfile] = useState(defaults?.profile ?? {
    name: 'Farmer',
    email: 'farmer@krishivision.app',
    region: 'North India',
    cropType: 'Wheat',
  })

  const [saved, setSaved] = useState(false)
  const [actionNotice, setActionNotice] = useState('')

  const toggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    saveSettings(profile, updated)
  }

  const showNotice = (message) => {
    setActionNotice(message)
    setTimeout(() => setActionNotice(''), 2500)
  }

  return (
    <div className="p-6 md:p-12 pb-32 md:pb-12 bg-surface min-h-screen">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Settings
        </h1>
        <p className="text-on-surface-variant mt-2 text-lg">
          Manage your profile, notifications, and preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* Profile */}
          <section className="bg-surface-container-low p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-on-surface mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Profile
            </h2>
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-surface-variant text-3xl">person</span>
              </div>
              <div>
                <p className="font-bold text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>{profile.name}</p>
                <p className="text-sm text-on-surface-variant">{profile.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email Address', key: 'email', type: 'email' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    value={profile[key]}
                    onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Region
                </label>
                <select
                  value={profile.region}
                  onChange={(e) => setProfile((p) => ({ ...p, region: e.target.value }))}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none"
                >
                  {regionOptions.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Primary Crop Type
                </label>
                <select
                  value={profile.cropType}
                  onChange={(e) => setProfile((p) => ({ ...p, cropType: e.target.value }))}
                  className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm text-on-surface focus:border-primary focus:outline-none"
                >
                  {cropOptions.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                saveSettings(profile, notifications)
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
              }}
              className="mt-6 bg-primary text-on-primary font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition flex items-center gap-2"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              {saved && <span className="material-symbols-outlined text-[18px]">check</span>}
              {saved ? 'Saved!' : 'Save Profile'}
            </button>
          </section>

          {/* Notifications */}
          <section className="bg-surface-container-low p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-on-surface mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Notifications
            </h2>
            <div className="flex flex-col gap-5">
              {[
                { key: 'emailAlerts', icon: 'email', label: 'Email Alerts', desc: 'Receive scan results and summaries via email.' },
                { key: 'diseaseAlerts', icon: 'coronavirus', label: 'Disease Alerts', desc: 'Instant notifications when a disease is detected.' },
                { key: 'weeklyReport', icon: 'summarize', label: 'Weekly Report', desc: 'A weekly digest of your field activity and trends.' },
                { key: 'weatherAdvisories', icon: 'wb_cloudy', label: 'Weather Advisories', desc: 'Alerts for weather conditions that may affect crops.' },
              ].map(({ key, icon, label, desc }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-primary-fixed-variant text-[18px]">{icon}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>{label}</p>
                      <p className="text-xs text-on-surface-variant">{desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(key)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${notifications[key] ? 'bg-primary' : 'bg-outline-variant'}`}
                    aria-label={`Toggle ${label}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications[key] ? 'translate-x-6' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-8">
          {/* About */}
          <section className="bg-surface-container-low p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-on-surface mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              About KrishiVision
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-emerald-900 text-2xl">park</span>
              <div>
                <p className="font-bold text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>KrishiVision</p>
                <p className="text-xs text-on-surface-variant">Field Intelligence</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-on-surface-variant">
              <div className="flex justify-between">
                <span>Version</span>
                <span className="font-medium text-on-surface">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Model</span>
                <span className="font-medium text-on-surface">KV-Vision v2</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span className="font-medium text-on-surface">Mar 2025</span>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-error-container/40 border border-error-container p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-on-surface mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Danger Zone
            </h2>
            <p className="text-sm text-on-surface-variant mb-5">
              These actions are irreversible. Proceed with caution.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (!window.confirm('Clear all scan history? This action cannot be undone.')) return
                  clearAllScans()
                  showNotice('Scan history cleared.')
                }}
                className="w-full border border-on-error-container/30 text-on-error-container text-sm font-semibold px-4 py-3 rounded-xl hover:bg-error-container/60 transition"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Clear Scan History
              </button>
              <button
                onClick={() => {
                  if (!window.confirm('Delete demo account data and return to login?')) return
                  clearAccountData()
                  showNotice('Account data deleted.')
                  navigate('/login')
                }}
                className="w-full bg-error text-on-error text-sm font-semibold px-4 py-3 rounded-xl hover:opacity-90 transition"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Delete Account
              </button>
            </div>
            {actionNotice && (
              <p className="text-xs text-on-error-container mt-3">{actionNotice}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
