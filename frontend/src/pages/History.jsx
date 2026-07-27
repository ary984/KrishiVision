import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPredictions } from '../api/client'
import { getMergedScans } from '../utils/scanStorage'

function predictionToScan(p) {
  const disease = p.disease || ''
  let status = 'healthy'
  if (disease && disease.toLowerCase() !== 'healthy') {
    status = p.confidence >= 0.75 ? 'critical' : 'warning'
  }
  const date = p.created_at
    ? new Date(p.created_at).toLocaleString('default', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—'
  return {
    id: p.id,
    crop: p.crop_type || p.cropType || p.crop || p.filename || 'Unknown',
    title: disease || 'Healthy Crop',
    status,
    date,
    image: p.image_url || p.imageUrl || p.image || null,
  }
}

const statusConfig = {
  critical: {
    badge: 'bg-error-container text-on-error-container',
    icon: 'warning',
    label: 'CRITICAL',
  },
  healthy: {
    badge: 'bg-primary-fixed text-on-primary-fixed-variant',
    icon: 'check_circle',
    label: 'HEALTHY',
  },
  warning: {
    badge: 'bg-secondary-container text-on-secondary-container',
    icon: 'error',
    label: 'WARNING',
  },
}

export default function History() {
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getPredictions(50)
      .then((data) => setScans(getMergedScans(data).slice(0, 50).map(predictionToScan)))
      .catch((err) => {
        const fallbackScans = getMergedScans([]).slice(0, 50).map(predictionToScan)
        setScans(fallbackScans)
        if (fallbackScans.length === 0) setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = scans.filter(
    (scan) =>
      scan.title.toLowerCase().includes(search.toLowerCase()) ||
      scan.crop.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl px-6 py-8 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary leading-none" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Scan History
              </h1>
              <p className="mt-2 text-on-surface-variant">Review and manage your historical crop diagnostics.</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-on-surface-variant">
              <span className="text-sm font-medium">{scans.length} Total Scans</span>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-surface-container-low p-2 rounded-2xl">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" style={{ fontSize: '20px' }}>search</span>
              <input
                type="text"
                placeholder="Search by crop or disease..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-lowest rounded-xl pl-12 pr-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant border-none"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 bg-surface-container-lowest px-5 py-3 rounded-xl text-on-surface-variant font-medium hover:bg-white transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>filter_list</span>
                <span>Crop Type</span>
              </button>
              <button className="flex items-center gap-2 bg-surface-container-lowest px-5 py-3 rounded-xl text-on-surface-variant font-medium hover:bg-white transition-colors">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_today</span>
                <span>Recent</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cards Grid */}
      <section className="px-6 md:px-12 mt-4 max-w-6xl mx-auto pb-8">
        {loading && (
          <div className="flex justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 text-outline-variant">cloud_off</span>
            <p className="text-lg font-medium">Could not load scans</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((scan) => {
              const cfg = statusConfig[scan.status]
              return (
                <div
                  key={scan.id}
                  className="group bg-surface-container-lowest rounded-3xl overflow-hidden hover:shadow-[0_12px_40px_rgba(25,28,28,0.06)] transition-all duration-300 flex flex-col cursor-pointer"
                >
                  <div className="relative h-48 overflow-hidden bg-surface-container-high">
                    {scan.image ? (
                      <img
                        src={scan.image}
                        alt={scan.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-outline-variant text-5xl">image</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`${cfg.badge} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                          {cfg.icon}
                        </span>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1">{scan.crop}</p>
                    <h3 className="text-xl font-bold text-on-surface mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>{scan.title}</h3>
                    <div className="mt-auto flex items-center justify-between border-t border-outline-variant/10 pt-4">
                      <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                        <span>{scan.date}</span>
                      </div>
                      <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* New Scan Card */}
            <Link
              to="/scan"
              className="group border-2 border-dashed border-outline-variant/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">add_a_photo</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Scan New Sample
              </h3>
              <p className="text-sm text-on-surface-variant mt-1">Add a new diagnostic to your history</p>
            </Link>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && scans.length > 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block text-outline-variant">search_off</span>
            <p className="text-lg font-medium">No scans found for &quot;{search}&quot;</p>
          </div>
        )}

        {!loading && !error && scans.length === 0 && (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-4 block text-outline-variant">history</span>
            <p className="text-lg font-medium">No scans yet</p>
            <p className="text-sm mt-1">Upload your first crop image to get started.</p>
          </div>
        )}

        {/* Load More */}
        {scans.length > 0 && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              className="bg-surface-container-high text-on-surface-variant font-bold py-4 px-10 rounded-2xl hover:bg-surface-container-highest transition-colors flex items-center gap-2"
            >
              <span>Load Previous Scans</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>keyboard_arrow_down</span>
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
