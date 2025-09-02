import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import FileUpload from './pages/FileUpload'
import FileView from './pages/FileView'
import Analytics from './pages/Analytics'
import LoadingSpinner from './components/LoadingSpinner'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = "854312165167-ai2tevkg711312s6tjs3ujsv380nc3pc.apps.googleusercontent.com";

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>

      <Router>
        <div className="min-h-screen bg-gray-50">
          {user && <Navbar />}
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/dashboard" /> : <Register />}
            />
            <Route
              path="/dashboard"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/upload"
              element={user ? <FileUpload /> : <Navigate to="/login" />}
            />
            <Route
              path="/file/:id"
              element={user ? <FileView /> : <Navigate to="/login" />}
            />
            <Route
              path="/analytics/:id"
              element={user ? <Analytics /> : <Navigate to="/login" />}
            />
            <Route
              path="/"
              element={<Navigate to={user ? "/dashboard" : "/login"} />}
            />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>

  )
}

export default App
