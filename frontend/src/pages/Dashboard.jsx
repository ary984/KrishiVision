import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPredictions } from '../api/client'
import { getLocation, getWeather, computeRiskAdvisory } from '../api/weather'

const statusStyles = {
  critical: 'bg-error-container text-on-error-container',
  healthy: 'bg-primary-fixed text-on-primary-fixed-variant',
  warning: 'bg-secondary-container text-on-secondary-container',
}

function predictionToScan(p) {
  const disease = p.disease || ''
  let status = 'healthy'
  let statusLabel = 'Healthy'
  let statusNote = 'Optimal Growth'
  if (disease && disease.toLowerCase() !== 'healthy') {
    status = p.confidence >= 0.75 ? 'critical' : 'warning'
    statusLabel = status === 'critical' ? disease : 'Warning'
    statusNote = status === 'critical' ? 'Action Required' : 'Monitor Closely'
  }
  return {
    id: p.id,
    title: p.filename || 'Crop Sample',
    location: p.created_at
      ? new Date(p.created_at).toLocaleString('default', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : '—',
    status,
    statusLabel,
    statusNote,
    image: p.image_url || null,
  }
}

export default function Dashboard() {
  const [recentScans, setRecentScans] = useState([])
  const [stats, setStats] = useState({ total: 0, diseased: 0, crops: 0 })
  const [predictions, setPredictions] = useState([])
  const [weather, setWeather] = useState({
    temperature: null,
    humidity: null,
    label: '',
    icon: 'cloud',
    locationName: '',
    advisory: null,
    loading: true,
    error: false,
  })

  useEffect(() => {
    getPredictions(20)
      .then((data) => {
        setPredictions(data)
        const scans = data.map(predictionToScan)
        setRecentScans(scans.slice(0, 3))
        const diseased = data.filter(
          (p) => p.disease && p.disease.toLowerCase() !== 'healthy'
        ).length
        setStats({ total: data.length, diseased, crops: data.length })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    async function fetchWeather() {
      try {
        const loc = await getLocation()
        const data = await getWeather(loc.lat, loc.lng)
        if (cancelled) return
        const advisory = computeRiskAdvisory(data, predictions)
        setWeather({
          temperature: data.temperature,
          humidity: data.humidity,
          label: data.label,
          icon: data.icon,
          locationName: loc.locationName,
          advisory,
          loading: false,
          error: false,
        })
      } catch {
        if (!cancelled) {
          setWeather((prev) => ({ ...prev, loading: false, error: true }))
        }
      }
    }
    fetchWeather()
    return () => { cancelled = true }
  }, [predictions])

  return (
    <div className="p-6 md:p-12 pb-32 md:pb-12 bg-surface min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Welcome Back
          </h1>
          <p className="text-on-surface-variant mt-2 text-lg">
            Your crops are showing promising growth today. Review areas that need attention.
          </p>
        </div>
        <Link
          to="/scan"
          className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg hover:opacity-90 transition-opacity"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          <span className="material-symbols-outlined">photo_camera</span>
          Start New Scan
        </Link>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-low p-8 rounded-3xl flex flex-col justify-between h-48">
          <span className="material-symbols-outlined text-primary text-3xl">analytics</span>
          <div>
            <p className="font-extrabold text-3xl" style={{ fontFamily: 'Manrope, sans-serif' }}>{stats.total.toLocaleString()}</p>
            <p className="text-on-surface-variant uppercase tracking-widest text-xs mt-1">Scans Done</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-3xl flex flex-col justify-between h-48">
          <span className="material-symbols-outlined text-tertiary text-3xl">coronavirus</span>
          <div>
            <p className="font-extrabold text-3xl" style={{ fontFamily: 'Manrope, sans-serif' }}>{stats.diseased}</p>
            <p className="text-on-surface-variant uppercase tracking-widest text-xs mt-1">Diseases Detected</p>
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-3xl flex flex-col justify-between h-48">
          <span className="material-symbols-outlined text-secondary text-3xl">potted_plant</span>
          <div>
            <p className="font-extrabold text-3xl" style={{ fontFamily: 'Manrope, sans-serif' }}>{stats.crops}</p>
            <p className="text-on-surface-variant uppercase tracking-widest text-xs mt-1">Crops Monitored</p>
          </div>
        </div>
      </section>

      {/* Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Scans */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Recent Field Scans
            </h3>
            <Link to="/history" className="text-primary font-bold text-sm hover:underline" style={{ fontFamily: 'Manrope, sans-serif' }}>
              View History
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {recentScans.length === 0 ? (
              <div className="bg-surface-container-lowest p-10 rounded-2xl text-center text-on-surface-variant border border-outline-variant/10">
                <span className="material-symbols-outlined text-4xl mb-3 block text-outline-variant">photo_camera</span>
                <p className="font-medium">No scans yet — upload your first crop image!</p>
              </div>
            ) : (
              recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="bg-surface-container-lowest p-5 rounded-2xl flex items-center gap-6 shadow-sm border border-outline-variant/10 hover:bg-surface-container-low transition-colors duration-300"
                >
                  {scan.image ? (
                    <img
                      src={scan.image}
                      alt={scan.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-outline-variant text-3xl">image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h4 className="font-bold text-lg text-on-surface truncate" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {scan.title}
                    </h4>
                    <p className="text-on-surface-variant text-sm">{scan.location}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`${statusStyles[scan.status]} px-3 py-1 rounded-full font-bold uppercase tracking-widest`} style={{ fontSize: '10px' }}>
                      {scan.statusLabel}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">{scan.statusNote}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Environmental Advisory — Live Weather */}
        <section className="lg:col-span-1">
          <div className="bg-surface-container-high p-8 rounded-3xl h-full flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>

            {weather.loading ? (
              /* Loading skeleton */
              <div className="relative z-10 flex flex-col gap-4 animate-pulse">
                <div className="h-7 w-3/4 bg-surface-container rounded-lg"></div>
                <div className="h-4 w-full bg-surface-container rounded-lg"></div>
                <div className="h-4 w-5/6 bg-surface-container rounded-lg"></div>
                <div className="mt-auto h-20 bg-surface-container rounded-2xl"></div>
              </div>
            ) : weather.error ? (
              /* Error fallback */
              <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-3 text-outline-variant">cloud_off</span>
                <p className="font-medium text-sm">Weather data unavailable</p>
                <p className="text-xs mt-1">Check your connection and refresh</p>
              </div>
            ) : (
              /* Live weather data */
              <>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-2xl font-bold text-on-surface leading-tight" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      Environmental Advisory
                    </h3>
                    {weather.advisory && weather.advisory.urgency !== 'low' && (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        weather.advisory.urgency === 'high'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}>
                        {weather.advisory.urgency} risk
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant mt-3 leading-relaxed">
                    {weather.advisory ? weather.advisory.advisoryText : 'Weather conditions are favorable for crop growth.'}
                    {weather.advisory && weather.advisory.diseaseName && (
                      <> Watch for <strong className="text-primary">{weather.advisory.diseaseName}</strong> recurrence.</>
                    )}
                  </p>
                </div>
                <div className="mt-auto relative z-10 bg-surface-container-lowest/50 backdrop-blur-md p-4 rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <span className="material-symbols-outlined text-primary">{weather.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                        {weather.locationName || 'Current Weather'}
                      </p>
                      <p className="font-bold text-on-surface text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>
                        {weather.temperature}°C • {weather.label}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/scan"
                    className="block w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm text-center hover:opacity-90 transition-opacity"
                    style={{ fontFamily: 'Manrope, sans-serif' }}
                  >
                    Apply Preventative Measure
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
