import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useSocketStore } from './stores/socketStore'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import Projects from './pages/Projects'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

// Components
import LoadingSpinner from './components/ui/LoadingSpinner'
import Layout from './components/layout/Layout'

function App() {
  const { user, loading, checkAuth } = useAuthStore()
  const { connect, disconnect } = useSocketStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (user) {
      connect()
    } else {
      disconnect()
    }
  }, [user, connect, disconnect])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/chat" element={user ? <Layout><Chat /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/chat/:roomId" element={user ? <Layout><Chat /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/projects" element={user ? <Layout><Projects /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/projects/:projectId" element={user ? <Layout><Projects /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/profile" element={user ? <Layout><Profile /></Layout> : <Navigate to="/login" replace />} />
        <Route path="/settings" element={user ? <Layout><Settings /></Layout> : <Navigate to="/login" replace />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
      </Routes>
    </div>
  )
}

export default App