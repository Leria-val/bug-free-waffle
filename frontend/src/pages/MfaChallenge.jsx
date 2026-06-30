// src/pages/MfaChallenge.jsx
// Segunda etapa de autenticação (MFA fictício) para advogados e admins

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

export default function MfaChallenge() {
  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()
  const navigate              = useNavigate()
  const location              = useLocation()

  const { tempToken, mfaCode, email } = location.state || {}

  // Se não veio pelo fluxo correto, redireciona
  if (!tempToken) {
    navigate('/login')
    return null
  }

  const ROLE_REDIRECT = { ADMIN: '/admin', LAWYER: '/lawyer/dashboard' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-mfa', { tempToken, mfaCode: code })
      login(res.data.token, res.data.user)
      navigate(ROLE_REDIRECT[res.data.user.role] || '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Código inválido.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24,
      background: 'radial-gradient(ellipse at top, #13120F 0%, var(--bg) 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 4 }}>
            JUSTIÇA & DIREITO
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Verificação em duas etapas
          </div>
        </div>

        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>
              Código de acesso
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: 13 }}>
              Um código foi enviado para o email associado à conta
              <span style={{ color: 'var(--gold-dim)', display: 'block', marginTop: 4 }}>{email}</span>
            </p>
          </div>

          {/* Código fictício exibido na tela (para demonstração) */}
          <div className="alert alert-info" style={{ marginBottom: 20, textAlign: 'center' }}>
            <span style={{ fontSize: 13 }}>Código de demonstração: </span>
            <strong style={{ fontFamily: 'monospace', fontSize: 18, letterSpacing: '0.2em' }}>{mfaCode}</strong>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Digite o código de 6 dígitos</label>
              <input
                className="form-input"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: 22, fontFamily: 'monospace' }}
                autoFocus
                required
              />
            </div>

            {error && <div className="alert alert-error">🚫 {error}</div>}

            <button type="submit" className="btn btn-primary" disabled={loading || code.length < 6}
              style={{ width: '100%', justifyContent: 'center', padding: '12px 0' }}>
              {loading ? 'Verificando...' : 'Confirmar acesso'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 12, cursor: 'pointer' }}>
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}