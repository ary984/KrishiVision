import { useState, useEffect } from 'react'
import { getPredictions } from '../api/client'

const MAX_CHART_HEIGHT = 160

function computeInsights(predictions) {
  const total = predictions.length
  const diseaseCases = predictions.filter(
    (p) => p.disease && p.disease.toLowerCase() !== 'healthy'
  )
  const diseaseCount = diseaseCases.length
  const accuracyVals = predictions
    .filter((p) => p.confidence != null)
    .map((p) => p.confidence)
  const accuracy = accuracyVals.length
    ? Math.round((accuracyVals.reduce((a, b) => a + b, 0) / accuracyVals.length) * 100)
    : 0

  // Disease breakdown
  const diseaseTally = {}
  diseaseCases.forEach((p) => {
    const key = p.disease
    diseaseTally[key] = (diseaseTally[key] || 0) + 1
  })
  const diseaseBreakdown = Object.entries(diseaseTally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / Math.max(diseaseCases.length, 1)) * 100),
    }))

  // Monthly scan trend (last 6 months)
  const monthMap = {}
  predictions.forEach((p) => {
    if (!p.created_at) return
    const d = new Date(p.created_at)
    const key = d.toLocaleString('default', { month: 'short' })
    if (!monthMap[key]) monthMap[key] = { month: key, healthy: 0, diseased: 0, ts: d }
    const isDisease = p.disease && p.disease.toLowerCase() !== 'healthy'
    if (isDisease) monthMap[key].diseased += 1
    else monthMap[key].healthy += 1
  })
  const monthlyScans = Object.values(monthMap)
    .sort((a, b) => a.ts - b.ts)
    .slice(-6)

  return { total, diseaseCount, accuracy, crops: total, diseaseBreakdown, monthlyScans }
}

const staticRecommendations = [
  {
    icon: 'water_drop',
    color: 'text-primary',
    bg: 'bg-primary-fixed',
    title: 'Reduce irrigation in high-risk zones',
    desc: 'High moisture increases fungal risk. Monitor disease detections closely over the next 72 hours.',
  },
  {
    icon: 'bug_report',
    color: 'text-tertiary',
    bg: 'bg-tertiary-fixed',
    title: 'Schedule preventative treatment',
    desc: 'Early intervention reduces disease spread significantly. Review your top detections above.',
  },
  {
    icon: 'eco',
    color: 'text-secondary',
    bg: 'bg-secondary-container',
    title: 'Maintain soil nutrient balance',
    desc: 'Leaf discolouration detected in recent scans. Consider soil amendment within 2 weeks.',
  },
]

export default function Insights() {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPredictions(100)
      .then((data) => setInsights(computeInsights(data)))
      .catch(() => setInsights(computeInsights([])))
      .finally(() => setLoading(false))
  }, [])

  const monthlyScans = insights?.monthlyScans ?? []
  const maxBar = Math.max(...monthlyScans.map((m) => m.healthy + m.diseased), 1)

  return (
    <div className="p-6 md:p-12 pb-32 md:pb-12 bg-surface min-h-screen">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Crop Insights
        </h1>
        <p className="text-on-surface-variant mt-2 text-lg">
          Season-wide analytics across all your scans and field data.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              { icon: 'analytics', color: 'text-primary', value: insights.total.toLocaleString(), label: 'Total Scans' },
              { icon: 'coronavirus', color: 'text-tertiary', value: insights.diseaseCount, label: 'Disease Cases' },
              { icon: 'verified', color: 'text-secondary', value: insights.accuracy ? `${insights.accuracy}%` : '—', label: 'Avg Confidence' },
              { icon: 'potted_plant', color: 'text-primary', value: insights.crops, label: 'Crops Monitored' },
            ].map((s) => (
              <div key={s.label} className="bg-surface-container-low p-7 rounded-3xl flex flex-col justify-between h-40">
                <span className={`material-symbols-outlined ${s.color} text-3xl`}>{s.icon}</span>
                <div>
                  <p className="font-extrabold text-3xl text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>{s.value}</p>
                  <p className="text-on-surface-variant uppercase tracking-widest text-xs mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Monthly Scan Trend */}
            <section className="lg:col-span-2 bg-surface-container-low p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-on-surface mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Monthly Scan Trend
              </h2>
              {monthlyScans.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">bar_chart</span>
                  <p className="text-sm">No scan data yet</p>
                </div>
              ) : (
                <>
                  <div className="flex items-end gap-4 h-48">
                    {monthlyScans.map((m) => {
                      const healthyH = Math.round((m.healthy / maxBar) * MAX_CHART_HEIGHT)
                      const diseasedH = Math.round((m.diseased / maxBar) * MAX_CHART_HEIGHT)
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex flex-col-reverse gap-[2px]">
                            <div
                              className="w-full bg-primary-fixed rounded-t-lg transition-all"
                              style={{ height: `${healthyH}px` }}
                              title={`${m.healthy} healthy`}
                            />
                            <div
                              className="w-full bg-error-container rounded-t-lg transition-all"
                              style={{ height: `${diseasedH}px` }}
                              title={`${m.diseased} diseased`}
                            />
                          </div>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold mt-2">{m.month}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex gap-6 mt-4">
                    <span className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span className="w-3 h-3 rounded-sm bg-primary-fixed inline-block" />
                      Healthy
                    </span>
                    <span className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span className="w-3 h-3 rounded-sm bg-error-container inline-block" />
                      Diseased
                    </span>
                  </div>
                </>
              )}
            </section>

            {/* Top Diseases */}
            <section className="bg-surface-container-low p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-on-surface mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Top Diseases
              </h2>
              {insights.diseaseBreakdown.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-on-surface-variant">
                  <span className="material-symbols-outlined text-3xl mb-2 text-outline-variant">check_circle</span>
                  <p className="text-sm">No diseases detected yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {insights.diseaseBreakdown.map((d) => (
                    <div key={d.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-on-surface">{d.name}</span>
                        <span className="text-on-surface-variant">{d.count} cases</span>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Recommendations */}
          <section>
            <h2 className="text-2xl font-bold text-on-surface mb-6" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Actionable Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {staticRecommendations.map((r) => (
                <div key={r.title} className="bg-surface-container-low p-7 rounded-3xl flex flex-col gap-4">
                  <div className={`w-11 h-11 rounded-xl ${r.bg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-[20px] ${r.color}`}>{r.icon}</span>
                  </div>
                  <h3 className="font-bold text-on-surface leading-snug" style={{ fontFamily: 'Manrope, sans-serif' }}>{r.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{r.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
