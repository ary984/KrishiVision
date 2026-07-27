import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import ScanUpload from './pages/ScanUpload'
import History from './pages/History'
import Results from './pages/Results'
import Insights from './pages/Insights'
import Settings from './pages/Settings'

function ProtectedLayout({ children }) {
  const isLoggedIn = localStorage.getItem('krishivision_demo_auth') === 'true'
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route
        path="/*"
        element={
          <ProtectedLayout>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="scan" element={<ScanUpload />} />
                <Route path="history" element={<History />} />
                <Route path="results" element={<Results />} />
                <Route path="insights" element={<Insights />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </Layout>
          </ProtectedLayout>
        }
      />
    </Routes>
  )
}

export default App
