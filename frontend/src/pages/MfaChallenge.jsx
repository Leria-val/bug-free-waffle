// src/pages/MfaChallenge.jsx
// Segunda etapa de autenticação (MFA fictício) para advogados e admins

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

export default function MfaChallenge() {
  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { setSession }        = useAuth()
  const navigate              = useNavigate()
  const location              = useLocation()

  const { tempToken, mfaCode, email } = location.state || {}

  // ✅ CORRETO: navigate() dentro de useEffect, nunca durante o render
  useEffect(() => {
    if (!tempToken) {
      navigate('/login', { replace: true })
    }
  }, [tempToken, navigate])

  // Evita render enquanto redireciona
  if (!tempToken) return null

  const ROLE_REDIRECT = { ADMIN: '/admin', LAWYER: '/lawyer/dashboard' }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/verify-mfa', { tempToken, mfaCode: code })
      setSession(res.data.token, res.data.user)
      navigate(ROLE_REDIRECT[res.data.user.role] || '/', { replace: true })
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
      background: '#080808',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: '#d4af37', letterSpacing: '0.1em', marginBottom: 4 }}>
            JUSTIÇA & DIREITO
          </div>
          <div style={{ fontSize: 11, color: '#5a5545', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Verificação em duas etapas
          </div>
        </div>

        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
            <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#f0ede6', marginBottom: 8 }}>
              Código de acesso
            </h2>
            <p style={{ color: '#a09880', fontSize: 13 }}>
              Código enviado para
              <span style={{ color: '#d4af37', display: 'block', marginTop: 4 }}>{email}</span>
            </p>
          </div>

          {/* Código fictício exibido na tela — projeto de demonstração */}
          <div style={{
            background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20, textAlign: 'center',
          }}>
            <span style={{ fontSize: 13, color: '#a09880' }}>Código de demonstração: </span>
            <strong style={{ fontFamily: 'monospace', fontSize: 22, letterSpacing: '0.3em', color: '#d4af37' }}>
              {mfaCode}
            </strong>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a09880', display: 'block', marginBottom: 6 }}>
                Digite o código de 6 dígitos
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%', background: '#0a0a0a', border: '1px solid #2e2e2e',
                  borderRadius: 6, color: '#f0ede6', padding: '12px 14px',
                  fontSize: 24, fontFamily: 'monospace', letterSpacing: '0.4em',
                  textAlign: 'center', outline: 'none',
                }}
                autoFocus
                required
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(192,57,43,0.1)', border: '1px solid #c0392b', borderRadius: 6, color: '#e57373', fontSize: 13 }}>
                🚫 {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length < 6}
              style={{
                width: '100%', padding: '12px 0',
                background: loading || code.length < 6 ? '#333' : '#d4af37',
                color: '#080808', border: 'none', borderRadius: 6,
                fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: loading || code.length < 6 ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Verificando...' : 'Confirmar acesso'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#5a5545', fontSize: 12, cursor: 'pointer' }}
            >
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}