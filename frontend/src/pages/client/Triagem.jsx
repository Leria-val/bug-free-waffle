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

// Toast de notificação simulada — aparece no canto superior direito
function Toast({ show }) {
  if (!show) return null
  return (
    <div style={{
      position: 'fixed', top: 24, right: 24, zIndex: 9999,
      background: '#161616',
      border: '1px solid rgba(212,175,55,0.4)',
      borderRadius: 10,
      padding: '14px 20px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      maxWidth: 340,
      animation: 'slideIn 0.3s ease',
    }}>
      <span style={{ fontSize: 20 }}>📧</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#d4af37', marginBottom: 4 }}>
          Notificação enviada
        </div>
        <div style={{ fontSize: 12, color: '#a09880', lineHeight: 1.5 }}>
          Recebemos seu relato. Temos advogados disponíveis — acesse seu painel para ver os perfis e entrar em contato.
        </div>
      </div>
    </div>
  )
}

export default function Triagem() {
  const { user }                = useAuth()
  const { post, loading, error} = useApi()
  const navigate                = useNavigate()
  const [success, setSuccess]   = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [form, setForm]         = useState({
    nome: user?.name || '', area_atuacao: '', resumo_caso: '', email_contato: user?.email || '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await post('/triagem', form)
      setSuccess(true)
      // Mostra o toast por 4 segundos
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)
      // Redireciona para o painel após 3.5s
      setTimeout(() => navigate('/client/dashboard'), 3500)
    } catch (_) {
      // erro já capturado pelo useApi
    }
  }

  // Simula o clique no botão de notificação por email (sem envio real)
  const handleFakeEmailBtn = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 4000)
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <Toast show={showToast} />
      <div style={{ display:'flex', flex:1 }}>
        <Sidebar />
        <main style={{ flex:1, padding:'40px 48px', overflowY:'auto' }}>

          <div style={{ maxWidth: 640 }}>
            <div style={{ marginBottom: 32 }}>
              <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)', marginBottom:16 }} />
              <h1 style={{ fontFamily:'Georgia,serif', fontSize:30, marginBottom:10 }}>
                Relato de Caso Confidencial
              </h1>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <p style={{ color:'var(--text-secondary,#a09880)', fontSize:14 }}>
                  Seu relato será criptografado antes de ser armazenado.
                </p>
                <CryptoBadge />
              </div>
            </div>

            {success ? (
              <div className="card" style={{ textAlign:'center', padding:48 }}>
                <div style={{ fontSize:40, marginBottom:16 }}>✅</div>
                <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, marginBottom:12, color:'var(--gold,#d4af37)' }}>
                  Relato recebido com sucesso
                </h2>
                <p style={{ color:'var(--text-secondary,#a09880)', fontSize:14, lineHeight:1.7, marginBottom:24 }}>
                  Seu caso foi registrado e criptografado. Nossa equipe foi notificada e irá analisar sua solicitação em breve.
                </p>

                {/* Botão de notificação — visual, sem envio real */}
                <button
                  type="button"
                  onClick={handleFakeEmailBtn}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 18px',
                    background: 'transparent',
                    border: '1px solid rgba(212,175,55,0.3)',
                    borderRadius: 6, color: '#a09880',
                    fontSize: 12, cursor: 'pointer', marginBottom: 24,
                  }}
                >
                  📧 Reenviar notificação
                </button>

                <p style={{ color:'var(--text-muted,#5a5545)', fontSize:12 }}>
                  Redirecionando para o painel...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card" style={{ display:'flex', flexDirection:'column', gap:22 }}>

                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:12, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-secondary,#a09880)' }}>
                    Nome
                  </label>
                  <input
                    type="text" value={form.nome} onChange={set('nome')} required
                    style={{ background:'var(--bg-secondary,#111)', border:'1px solid #2e2e2e', borderRadius:6, color:'var(--text-primary,#f0ede6)', padding:'10px 14px', fontSize:14, outline:'none', width:'100%' }}
                  />
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:12, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-secondary,#a09880)' }}>
                    Área de atuação
                  </label>
                  <select
                    value={form.area_atuacao} onChange={set('area_atuacao')} required
                    style={{ background:'var(--bg-secondary,#111)', border:'1px solid #2e2e2e', borderRadius:6, color: form.area_atuacao ? 'var(--text-primary,#f0ede6)' : '#5a5545', padding:'10px 14px', fontSize:14, outline:'none', width:'100%' }}
                  >
                    <option value="">Selecione a área do seu caso</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:12, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-secondary,#a09880)' }}>
                    Resumo do caso
                  </label>
                  <textarea
                    placeholder="Descreva brevemente sua situação. Este relato ficará criptografado e acessível apenas ao advogado designado."
                    value={form.resumo_caso} onChange={set('resumo_caso')}
                    minLength={20} required
                    style={{ background:'var(--bg-secondary,#111)', border:'1px solid #2e2e2e', borderRadius:6, color:'var(--text-primary,#f0ede6)', padding:'10px 14px', fontSize:14, outline:'none', width:'100%', minHeight:160, resize:'vertical', fontFamily:'inherit' }}
                  />
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  <label style={{ fontSize:12, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-secondary,#a09880)' }}>
                    Email de contato
                  </label>
                  <input
                    type="email" value={form.email_contato} onChange={set('email_contato')} required
                    style={{ background:'var(--bg-secondary,#111)', border:'1px solid #2e2e2e', borderRadius:6, color:'var(--text-primary,#f0ede6)', padding:'10px 14px', fontSize:14, outline:'none', width:'100%' }}
                  />
                </div>

                {error && (
                  <div style={{ padding:'12px 16px', background:'rgba(192,57,43,0.1)', border:'1px solid #c0392b', borderRadius:6, color:'#e57373', fontSize:13 }}>
                    🚫 {error}
                  </div>
                )}

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:8 }}>
                  <CryptoBadge />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: loading ? '#555' : 'var(--gold,#d4af37)',
                      color: '#080808', border: 'none', borderRadius: 6,
                      padding: '10px 22px', fontSize: 13, fontWeight: 500,
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Enviando...' : 'Enviar relato com segurança'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}