// src/components/ProtectedRoute.jsx
// Bloqueia rotas não autenticadas ou sem o role correto
// Exibe "Acesso Restrito/Confidencial" se tentar burlar a rota

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
        <span className="text-muted" style={{ fontSize: 13, letterSpacing: '0.1em' }}>
          VERIFICANDO ACESSO...
        </span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verifica se o role do usuário está na lista de roles permitidas
  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', gap: 16, padding: 32,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(200,75,75,0.12)', border: '1px solid rgba(200,75,75,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
        }}>
          🔒
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-1)' }}>
          Acesso Restrito/Confidencial
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14, textAlign: 'center', maxWidth: 360 }}>
          Você não possui permissão para acessar esta área. Esta tentativa de acesso foi registrada.
        </p>
        <a href="/" className="btn btn-outline" style={{ marginTop: 8 }}>
          Voltar ao início
        </a>
      </div>
    )
  }

  return children
}