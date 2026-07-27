import { NavLink } from 'react-router-dom'
import Sidebar from './Sidebar'

const mobileNavItems = [
  { to: '/dashboard', icon: 'home', label: 'Home', exact: true },
  { to: '/scan', icon: 'photo_camera', label: 'Scan' },
  { to: '/history', icon: 'cloud_done', label: 'History' },
  { to: '/insights', icon: 'insights', label: 'Insights' },
  { to: '/settings', icon: 'person', label: 'Profile' },
]

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <main className="flex-1 md:ml-64 pb-24 md:pb-0 min-w-0">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg flex justify-around items-center px-4 pt-2 pb-6 z-50 rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {mobileNavItems.map(({ to, icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              isActive
                ? 'flex flex-col items-center justify-center bg-emerald-100 text-emerald-900 rounded-2xl px-5 py-2 transition-all'
                : 'flex flex-col items-center justify-center text-stone-400 px-5 py-2 transition-all'
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            <span className="font-bold uppercase mt-1" style={{ fontSize: '10px', letterSpacing: '0.1em', fontFamily: 'Manrope, sans-serif' }}>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Layout
