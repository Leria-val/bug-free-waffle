// src/pages/client/Triagem.jsx
// Formulário confidencial de relato de caso — disparado após login do cliente

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import { CryptoBadge } from '../../components/CryptoBadge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'



const AREAS = [
  'Direito Civil','Direito Criminal','Direito Trabalhista','Direito de Família',
  'Direito Empresarial','Direito Tributário','Direito Previdenciário',
  'Direito do Consumidor','Direito Imobiliário','Direito Digital',
]

export default function Triagem() {
  const { user }                = useAuth()
  const { post, loading, error} = useApi()
  const navigate                = useNavigate()
  const [success, setSuccess]   = useState(false)
  const [form, setForm]         = useState({
    nome: user.name, area_atuacao: '', resumo_caso: '', email_contato: user.email,
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await post('/triagem', form)
    if (res.ok) {
      setSuccess(true)
      setTimeout(() => navigate('/client/dashboard'), 3000)
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ display:'flex', flex:1 }}>
        <Sidebar />
        <main style={{ flex:1, padding:'40px 48px', overflowY:'auto' }}>

          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 32 }}>
              <div className="divider-gold" style={{ marginBottom: 16 }} />
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginBottom: 10 }}>
                Relato de Caso Confidencial
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap: 16 }}>
                <p style={{ color:'var(--text-2)', fontSize: 14 }}>
                  Seu relato será criptografado antes de ser armazenado.
                </p>
                <CryptoBadge />
              </div>
            </div>

            {success ? (
              <div className="card" style={{ textAlign:'center', padding: 48 }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize: 24, marginBottom: 12 }}>
                  Relato recebido
                </h2>
                <p style={{ color:'var(--text-2)', fontSize: 14 }}>
                  Recebemos seu relato. Temos advogados disponíveis — verifique seu email e faça login para ver seus perfis e entrar em contato.
                </p>
                <p style={{ color:'var(--text-3)', fontSize: 12, marginTop: 16 }}>
                  Redirecionando para o painel...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card" style={{ display:'flex', flexDirection:'column', gap: 22 }}>

                <div className="form-group">
                  <label className="form-label">Nome</label>
                  <input className="form-input" type="text" value={form.nome} onChange={set('nome')} required />
                </div>

                <div className="form-group">
                  <label className="form-label">Área de atuação</label>
                  <select className="form-select" value={form.area_atuacao} onChange={set('area_atuacao')} required>
                    <option value="">Selecione a área do seu caso</option>
                    {AREAS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Resumo do caso</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Descreva brevemente sua situação. Seja o mais claro possível — este relato ficará criptografado e acessível apenas ao advogado designado."
                    value={form.resumo_caso}
                    onChange={set('resumo_caso')}
                    style={{ minHeight: 160 }}
                    minLength={20}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email de contato</label>
                  <input className="form-input" type="email" value={form.email_contato} onChange={set('email_contato')} required />
                </div>

                {error && <div className="alert alert-error">🚫 {error}</div>}

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop: 8 }}>
                  <CryptoBadge />
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar relato com segurança'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}