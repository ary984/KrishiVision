import { Link } from 'react-router-dom'

const features = [
  {
    icon: 'biotech',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-on-primary-fixed-variant',
    title: 'Disease Detection',
    description: 'Our AI identifies 150+ known pathogens, insects, and nutrient deficiencies with 98% accuracy across major crop varieties.',
  },
  {
    icon: 'bolt',
    iconBg: 'bg-primary-fixed',
    iconColor: 'text-on-primary-fixed-variant',
    title: 'Instant Diagnosis',
    description: 'No more waiting for lab results. Get comprehensive health reports directly on your device in real-time.',
  },
  {
    icon: 'checklist',
    iconBg: 'bg-secondary-container',
    iconColor: 'text-on-secondary-container',
    title: 'Treatment Suggestions',
    description: 'Personalised recovery protocols including organic remedies and chemical interventions tailored to your region.',
  },
]

const footerLinks = {
  Resources: ['Documentation', 'API Reference', 'Agronomy Blog', 'Field Guides'],
  Company: ['About Us', 'Careers', 'Sustainability', 'Contact'],
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>

      {/* ── Header ── */}
      <header className="w-full bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-900 text-base">park</span>
            <span className="font-extrabold text-[22px] leading-none tracking-tight text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>
              KrishiVision
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-on-surface-variant">
            <a className="text-emerald-900 font-semibold" href="#hero">Home</a>
            <a className="hover:text-on-surface transition-colors" href="#features">Solutions</a>
            <a className="hover:text-on-surface transition-colors" href="#cta">Community</a>
            <a className="hover:text-on-surface transition-colors" href="#cta">Pricing</a>
          </nav>

          <Link
            to="/dashboard"
            className="bg-primary text-on-primary px-5 py-2 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Open Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="bg-surface-container-low" id="hero">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex bg-primary-fixed text-on-primary-fixed text-[11px] font-semibold tracking-[0.14em] uppercase px-4 py-1 rounded-full">
                Precision Agriculture
              </span>

              <h1 className="text-[44px] md:text-[62px] leading-[1.02] font-extrabold mt-6 tracking-[-0.02em] text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Detect Crop<br />Diseases{' '}
                <span className="text-emerald-900 italic">Instantly</span>
                <span className="font-semibold"> with AI</span>
              </h1>

              <p className="text-on-surface-variant text-lg leading-relaxed mt-6 max-w-[520px]">
                Protect your harvest with KrishiVision's advanced neural networks. Simply take a photo and get expert diagnosis in seconds.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/scan"
                  className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-semibold px-6 py-3 rounded-xl shadow-lg hover:opacity-90 transition"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  <span className="material-symbols-outlined text-[18px]">upload</span>
                  Upload Image
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-surface-container text-on-surface border border-outline-variant font-semibold px-6 py-3 rounded-xl hover:bg-surface-container-high transition"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  Try Demo
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[34px] bg-surface-container-lowest border border-outline-variant p-4 shadow-[0_16px_50px_rgba(11,22,14,0.08)]">
                <div className="rounded-[26px] overflow-hidden relative bg-[#1A2520] min-h-[420px]">
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"
                    alt="Crop field"
                  />
                  <div className="absolute top-5 right-5 bg-white/90 backdrop-blur px-4 py-3 rounded-2xl w-[260px]">
                    <div className="flex items-center gap-2 text-[15px] font-semibold text-on-surface">
                      <span className="material-symbols-outlined text-red-500 text-[19px]">warning</span>
                      Pathogen Detected
                    </div>
                    <p className="text-sm text-on-surface-variant mt-1">Blight Infection: 89% probability</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="bg-background py-16 md:py-20 border-t border-outline-variant/70" id="features">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-extrabold text-[40px] md:text-[50px] tracking-[-0.02em] text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Smart Diagnostic Engine
              </h2>
              <p className="text-on-surface-variant mt-4 text-lg">
                Built by agronomists and data scientists to bring enterprise-grade insights to every acre.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {features.map((f) => (
                <article key={f.title} className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-7">
                  <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-[20px] ${f.iconColor}`}>{f.icon}</span>
                  </div>
                  <h3 className="text-[28px] font-bold mt-6 text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>{f.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed mt-3">{f.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-background py-8 md:py-10" id="cta">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8">
            <div className="bg-primary rounded-[34px] p-8 md:p-12 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-on-primary text-[40px] md:text-[48px] leading-tight font-extrabold tracking-[-0.02em]" style={{ fontFamily: 'Manrope, sans-serif' }}>
                  Ready to secure your next harvest?
                </h2>
                <p className="text-on-primary/80 text-lg mt-4 max-w-2xl">
                  Join 50,000+ farmers worldwide who use KrishiVision to reduce crop loss and maximise yield efficiency.
                </p>
                <Link
                  to="/dashboard"
                  className="mt-7 inline-block bg-white/90 hover:bg-white text-on-surface font-semibold px-6 py-3 rounded-xl transition"
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  Get Started Free
                </Link>
              </div>

              <div className="w-full max-w-[380px] bg-white/80 rounded-2xl p-2 border border-white/60">
                <div className="rounded-xl overflow-hidden aspect-[16/9] bg-black">
                  <img
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80"
                    alt="Mobile app preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-surface-container-high border-t border-outline-variant mt-10">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-14 md:py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-900 text-base">park</span>
              <span className="font-extrabold text-[22px] leading-none text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>KrishiVision</span>
            </div>
            <p className="text-on-surface-variant mt-5 leading-relaxed max-w-[260px] text-sm">
              Advancing global food security through neural-enabled agronomy and community wisdom.
            </p>
            <div className="flex items-center gap-3 mt-6 text-on-surface">
              <span className="w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-xs">↗</span>
              <span className="w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-xs">◎</span>
              <span className="w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-xs">◉</span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs uppercase tracking-[0.16em] text-on-surface-variant font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>{heading}</h4>
              <ul className="mt-5 space-y-3 text-sm">
                {links.map((link) => (
                  <li key={link}><a className="hover:underline text-on-surface" href="#">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-2">
            <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 max-w-[320px] md:ml-auto">
              <h4 className="font-semibold text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>Newsletter</h4>
              <p className="text-on-surface-variant text-sm mt-2">Get the latest crop alerts and diagnostic updates.</p>
              <input
                className="mt-4 w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none text-on-surface"
                type="email"
                placeholder="email@field.com"
              />
              <button
                className="mt-3 w-full bg-primary hover:opacity-90 text-on-primary font-semibold rounded-xl px-4 py-3 transition"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-10 text-xs text-on-surface-variant">
          © {new Date().getFullYear()} KrishiVision · Precision technology for sustainable harvests.
        </div>
      </footer>
    </div>
  )
}
