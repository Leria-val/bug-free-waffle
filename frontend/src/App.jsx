// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Home           from './pages/Home.jsx'
import BuscaAdvogados from './pages/BuscaAdvogados.jsx'
import Login          from './pages/Login.jsx'
import Register       from './pages/Register.jsx'
import MfaChallenge   from './pages/MfaChallenge.jsx'
import ChatSeguro     from './pages/ChatSeguro.jsx'

import ClientDashboard from './pages/client/ClientDashboard.jsx'
import Triagem         from './pages/client/Triagem.jsx'
import DocumentUpload  from './pages/client/DocumentUpload.jsx'

import LawyerDashboard from './pages/lawyer/LawyerDashboard.jsx'
import Requisicoes     from './pages/lawyer/Requisicoes.jsx'
import AdminPanel      from './pages/lawyer/AdminPanel.jsx'

export default function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      {/* Públicas */}
      <Route path="/"          element={<Home />} />
      <Route path="/advogados" element={<BuscaAdvogados />} />
      <Route path="/login"     element={!isAuthenticated ? <Login /> : <Navigate to={getRoleHome(user?.role)} />} />
      <Route path="/register"  element={!isAuthenticated ? <Register /> : <Navigate to="/client/dashboard" />} />
      <Route path="/mfa"       element={<MfaChallenge />} />

      {/* Cliente */}
      <Route path="/client/dashboard" element={<ProtectedRoute roles={['CLIENT']}><ClientDashboard /></ProtectedRoute>} />
      <Route path="/client/triagem"   element={<ProtectedRoute roles={['CLIENT']}><Triagem /></ProtectedRoute>} />
      <Route path="/client/documentos"element={<ProtectedRoute roles={['CLIENT']}><DocumentUpload /></ProtectedRoute>} />

      {/* Chat unificado — acessível por cliente E advogado */}
      <Route path="/client/chat/:id?" element={<ProtectedRoute roles={['CLIENT']}><ChatSeguro /></ProtectedRoute>} />
      <Route path="/lawyer/chat/:id?" element={<ProtectedRoute roles={['LAWYER','ADMIN']}><ChatSeguro /></ProtectedRoute>} />

      {/* Advogado */}
      <Route path="/lawyer/dashboard"   element={<ProtectedRoute roles={['LAWYER','ADMIN']}><LawyerDashboard /></ProtectedRoute>} />
      <Route path="/lawyer/requisicoes" element={<ProtectedRoute roles={['LAWYER','ADMIN']}><Requisicoes /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function getRoleHome(role) {
  return { ADMIN:'/admin', LAWYER:'/lawyer/dashboard', CLIENT:'/client/dashboard' }[role] || '/'
}