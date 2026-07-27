import { useLocation, useNavigate, Link } from 'react-router-dom'

const DISEASE_INFO = {
  default: {
    description:
      'Our AI model has analyzed your crop sample and detected a potential anomaly. Please review the diagnosis below and follow the recommended treatment steps.',
    causes: [
      'Excessive humidity or moisture on leaf surfaces.',
      'Poor air circulation within the plant canopy.',
      'Infected soil or nearby plant debris.',
    ],
    treatment: [
      { step: 'Step 1', instruction: 'Remove and isolate visibly infected plant parts immediately.' },
      { step: 'Step 2', instruction: 'Apply appropriate fungicide or pesticide treatment as directed.' },
    ],
  },
}

function getDiseaseInfo(diseaseName) {
  if (!diseaseName) return DISEASE_INFO.default
  const key = Object.keys(DISEASE_INFO).find(
    (k) => k.toLowerCase() === diseaseName.toLowerCase()
  )
  return key ? DISEASE_INFO[key] : DISEASE_INFO.default
}

function severityFromDisease(disease) {
  if (!disease) return 'unknown'
  const lower = disease.toLowerCase()
  if (lower.includes('healthy') || lower.includes('normal')) return 'healthy'
  if (lower.includes('severe') || lower.includes('blight') || lower.includes('rust')) return 'critical'
  return 'warning'
}

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const { result, imageUrl } = location.state || {}

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface px-6 text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">analytics</span>
        <h2 className="text-2xl font-bold text-on-surface mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          No Results Yet
        </h2>
        <p className="text-on-surface-variant mb-8">Upload a plant image to get an AI diagnostic report.</p>
        <Link
          to="/scan"
          className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Start a Scan
        </Link>
      </div>
    )
  }

  const severity = severityFromDisease(result.disease)
  const confidence = result.confidence != null
    ? `${(result.confidence * 100).toFixed(0)}`
    : result.confidence_pct ?? '–'

  const info = getDiseaseInfo(result.disease)

  const severityBanner = {
    healthy: {
      bg: 'bg-primary-fixed',
      text: 'text-on-primary-fixed-variant',
      icon: 'check_circle',
      iconBg: 'bg-secondary',
      label: 'Healthy Crop',
      sublabel: 'No Action Required',
    },
    warning: {
      bg: 'bg-secondary-container',
      text: 'text-on-secondary-container',
      icon: 'warning',
      iconBg: 'bg-secondary',
      label: 'Moderate Concern',
      sublabel: 'Monitor Closely',
    },
    critical: {
      bg: 'bg-error-container',
      text: 'text-on-error-container',
      icon: 'warning',
      iconBg: 'bg-error',
      label: 'High Severity Level',
      sublabel: 'Action Required',
    },
    unknown: {
      bg: 'bg-surface-container',
      text: 'text-on-surface',
      icon: 'info',
      iconBg: 'bg-outline',
      label: 'Analysis Complete',
      sublabel: 'Review results below',
    },
  }
  const banner = severityBanner[severity]

  return (
    <div className="flex min-h-screen bg-surface">
      <main className="flex-1 min-w-0 bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-8 md:py-12">
          {/* Top Section: Header & Image */}
          <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
            <div className="flex-1 w-full">
              <div className="mb-6">
                <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
                  Diagnostic Report
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Scan Result
                </h1>
                <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
                  {result.recommendation || 'Our AI-driven botanical analysis has completed. Review the details below.'}
                </p>
              </div>

              {/* Stats Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-surface-container-lowest rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-40">
                  <span className="text-on-surface-variant text-sm font-medium">Disease Name</span>
                  <div>
                    <h2 className="text-3xl font-bold text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {result.disease || 'Unknown'}
                    </h2>
                    {result.scientific_name && (
                      <p className="text-xs text-on-surface-variant mt-1 italic">{result.scientific_name}</p>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-surface-container-lowest rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between h-40">
                  <div className="flex justify-between items-start">
                    <span className="text-on-surface-variant text-sm font-medium">Confidence Score</span>
                    <span className="material-symbols-outlined text-primary">verified_user</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="font-black text-primary" style={{ fontSize: '3rem', fontFamily: 'Manrope, sans-serif' }}>
                      {confidence}
                    </h2>
                    <span className="text-2xl font-bold text-primary-container">%</span>
                  </div>
                </div>

                <div className={`md:col-span-2 p-6 ${banner.bg} ${banner.text} rounded-3xl flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    <div className={`${banner.iconBg} w-12 h-12 rounded-2xl flex items-center justify-center text-white`}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {banner.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tighter opacity-80">{banner.sublabel}</p>
                      <h3 className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>{banner.label}</h3>
                    </div>
                  </div>
                  <span className="hidden md:block material-symbols-outlined text-4xl opacity-30">priority_high</span>
                </div>
              </div>

              {/* Probabilities */}
              {result.probabilities && Object.keys(result.probabilities).length > 0 && (
                <div className="mt-6 p-6 bg-surface-container-lowest rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <h3 className="font-bold text-on-surface mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
                    Probability Breakdown
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(result.probabilities)
                      .sort(([, a], [, b]) => b - a)
                      .map(([disease, prob]) => (
                        <div key={disease}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-on-surface-variant">{disease}</span>
                            <span className="font-bold text-on-surface">{(prob * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-700"
                              style={{ width: `${(prob * 100).toFixed(1)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Image */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="aspect-square rounded-[2rem] overflow-hidden bg-surface-container-highest shadow-2xl relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="Uploaded plant sample" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl text-outline-variant">image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6">
                  <div className="flex items-center gap-2 text-white bg-black/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    Uploaded Sample
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">description</span>
                <h3 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Description</h3>
              </div>
              <div className="p-8 bg-surface-container-low rounded-[2rem] min-h-[200px]">
                <p className="text-on-surface-variant leading-relaxed">{info.description}</p>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">account_tree</span>
                <h3 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Likely Causes</h3>
              </div>
              <div className="p-8 bg-surface-container-low rounded-[2rem] min-h-[200px]">
                <ul className="space-y-4">
                  {info.causes.map((cause, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                      <p className="text-on-surface-variant text-sm">{cause}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">medical_services</span>
                <h3 className="font-bold text-lg" style={{ fontFamily: 'Manrope, sans-serif' }}>Recommended Treatment</h3>
              </div>
              <div className="p-8 bg-surface-container-low rounded-[2rem] border-2 border-primary/5 min-h-[200px]">
                {result.recommendation && (
                  <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">{result.recommendation}</p>
                )}
                {info.treatment.map((t, i) => (
                  <div key={i} className="bg-surface-container-lowest p-4 rounded-2xl mb-3 last:mb-0">
                    <p className="text-xs font-bold text-primary uppercase mb-1">{t.step}</p>
                    <p className="text-sm text-on-surface font-medium">{t.instruction}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center pt-8 border-t border-outline-variant/10">
            <Link
              to="/scan"
              className="px-10 py-5 bg-primary text-on-primary rounded-full font-extrabold text-lg shadow-xl hover:opacity-90 transition-all active:scale-95 flex items-center gap-3"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              <span className="material-symbols-outlined">add_a_photo</span>
              Scan Another
            </Link>
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="px-10 py-5 border-2 border-primary/20 text-primary hover:bg-primary/5 rounded-full font-bold text-lg transition-all active:scale-95 flex items-center gap-3"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              <span className="material-symbols-outlined">history</span>
              View History
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
