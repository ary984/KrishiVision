import { NavLink, Link } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard', exact: true },
  { to: '/scan', icon: 'center_focus_strong', label: 'Scan' },
  { to: '/history', icon: 'history', label: 'History' },
  { to: '/insights', icon: 'insights', label: 'Insights' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
]

const Sidebar = () => {
  return (
    <aside className="h-screen w-64 hidden md:flex flex-col bg-stone-100 p-4 gap-2 fixed left-0 top-0 overflow-y-auto z-40">
      <Link to="/dashboard" className="mb-8 px-2 block no-underline">
        <h2 className="text-lg font-black text-emerald-900 uppercase tracking-wider" style={{ fontFamily: 'Manrope, sans-serif' }}>
          KrishiVision
        </h2>
        <p className="text-stone-500 font-bold uppercase mt-1" style={{ fontSize: '10px', letterSpacing: '0.2em' }}>
          Field Intelligence
        </p>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              isActive
                ? 'bg-white text-emerald-700 rounded-lg shadow-sm flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200'
                : 'text-stone-500 hover:text-emerald-600 flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200'
            }
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-surface-container-low rounded-2xl flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant">person</span>
        </div>
        <div>
          <p className="text-sm font-bold text-on-surface" style={{ fontFamily: 'Manrope, sans-serif' }}>Farmer</p>
          <p className="text-xs text-on-surface-variant">Field Lead</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
