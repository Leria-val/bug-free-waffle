// src/App.jsx
// Configuração central de rotas — públicas, cliente, advogado, admin

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Páginas públicas
import Home             from './pages/Home.jsx'
import BuscaAdvogados   from './pages/BuscaAdvogados.jsx'
import Login            from './pages/Login.jsx'
import Register         from './pages/Register.jsx'
import MfaChallenge     from './pages/MfaChallenge.jsx'

// Páginas do cliente
import ClientDashboard  from './pages/client/ClientDashboard.jsx'
import Triagem          from './pages/client/Triagem.jsx'
import DocumentUpload   from './pages/client/DocumentUpload.jsx'
import ChatCasoClient   from './pages/client/ChatCaso.jsx'

// Páginas do advogado
import LawyerDashboard  from './pages/lawyer/LawyerDashboard.jsx'
import Requisicoes      from './pages/lawyer/Requisicoes.jsx'
import ChatCasoLawyer   from './pages/lawyer/ChatCasoLawyer.jsx'
import AdminPanel       from './pages/lawyer/AdminPanel.jsx'

export default function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      {/* ── Rotas públicas ──────────────────── */}
      <Route path="/"          element={<Home />} />
      <Route path="/advogados" element={<BuscaAdvogados />} />
      <Route path="/login"     element={!isAuthenticated ? <Login /> : <Navigate to={getRoleHome(user?.role)} />} />
      <Route path="/register"  element={!isAuthenticated ? <Register /> : <Navigate to="/client/dashboard" />} />
      <Route path="/mfa"       element={<MfaChallenge />} />

      {/* ── Rotas do Cliente ────────────────── */}
      <Route path="/client/dashboard"    element={<ProtectedRoute roles={['CLIENT']}><ClientDashboard /></ProtectedRoute>} />
      <Route path="/client/triagem"      element={<ProtectedRoute roles={['CLIENT']}><Triagem /></ProtectedRoute>} />
      <Route path="/client/documentos"   element={<ProtectedRoute roles={['CLIENT']}><DocumentUpload /></ProtectedRoute>} />
      <Route path="/client/chat/:id?"    element={<ProtectedRoute roles={['CLIENT']}><ChatCasoClient /></ProtectedRoute>} />

      {/* ── Rotas do Advogado ───────────────── */}
      <Route path="/lawyer/dashboard"    element={<ProtectedRoute roles={['LAWYER', 'ADMIN']}><LawyerDashboard /></ProtectedRoute>} />
      <Route path="/lawyer/requisicoes"  element={<ProtectedRoute roles={['LAWYER', 'ADMIN']}><Requisicoes /></ProtectedRoute>} />
      <Route path="/lawyer/chat/:id?"    element={<ProtectedRoute roles={['LAWYER', 'ADMIN']}><ChatCasoLawyer /></ProtectedRoute>} />

      {/* ── Rotas do Admin ──────────────────── */}
      <Route path="/admin"               element={<ProtectedRoute roles={['ADMIN']}><AdminPanel /></ProtectedRoute>} />

      {/* Rota 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function getRoleHome(role) {
  return { ADMIN: '/admin', LAWYER: '/lawyer/dashboard', CLIENT: '/client/dashboard' }[role] || '/'
}