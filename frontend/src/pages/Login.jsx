// src/pages/Login.jsx
// Tela de autenticação unificada — valida credenciais e redireciona por role

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }               = useAuth()
  const navigate                = useNavigate()
  const location                = useLocation()

  const message = location.state?.message // mensagem vinda de BuscaAdvogados

  const ROLE_REDIRECT = {
    ADMIN:  '/admin',
    LAWYER: '/lawyer/dashboard',
    CLIENT: '/client/dashboard',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Preencha email e senha.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await api.post('/auth/login', { email, password })
      const { requiresMfa, tempToken, mfaCode, token, user } = res.data

      if (requiresMfa) {
        // Advogado/Admin → vai para MFA
        navigate('/mfa', { state: { tempToken, mfaCode, email } })
      } else {
        // Cliente → login direto
        login(token, user)
        navigate(ROLE_REDIRECT[user.role] || '/')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciais inválidas.')
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
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 4 }}>
            JUSTIÇA & DIREITO
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Acesso ao Portal
          </div>
        </div>

        {/* Mensagem de contexto (ex: vindo de BuscaAdvogados) */}
        {message && (
          <div className="alert alert-info" style={{ marginBottom: 20 }}>
            {message}
          </div>
        )}

        <div className="card">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 24 }}>
            Entrar
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Erro estilizado em vermelho */}
            {error && (
              <div className="alert alert-error">
                🚫 {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px 0', marginTop: 4 }}
            >
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Ainda não tem conta?{' '}
              <Link to="/register" style={{ color: 'var(--gold)' }}>Criar conta gratuita</Link>
            </span>
          </div>
        </div>

        {/* Info para advogados */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Advogados: use seu email <span style={{ color: 'var(--gold-dim)' }}>@justicaedireito.adv.br</span>
          </p>
        </div>
      </div>
    </div>
  )
}