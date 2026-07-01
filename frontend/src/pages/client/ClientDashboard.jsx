// src/pages/client/ClientDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import Stepper from '../../components/Stepper.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'

export default function ClientDashboard() {
  const { user }          = useAuth()
  const { get, loading }  = useApi()
  const [cases, setCases] = useState([])

  useEffect(() => {
    get('/casos').then(r => setCases(r.cases || [])).catch(() => {})
  }, [])

  const STATUS_STEPS = ['TRIAGEM', 'ANALISE', 'EM_ANDAMENTO', 'CONCLUIDO', 'ARQUIVADO']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)', marginBottom: 16 }} />
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 30, color: '#f0ede6', marginBottom: 6 }}>
              Olá, {user?.name?.split(' ')[0]}
            </h1>
            <p style={{ color: '#a09880', fontSize: 14 }}>
              Acompanhe seu caso e mantenha comunicação segura com seu advogado.
            </p>
          </div>

          {/* Ações rápidas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
            {[
              { label: 'Abrir relato',      desc: 'Descreva seu caso',   to: '/client/triagem',    icon: '📋' },
              { label: 'Chat seguro',       desc: 'Falar com advogado',  to: '/client/chat',       icon: '💬' },
              { label: 'Enviar documentos', desc: 'Anexar arquivos',     to: '/client/documentos', icon: '📁' },
            ].map(item => (
              <Link key={item.to} to={item.to} style={{
                display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none',
                background: '#111', border: '1px solid #222', borderRadius: 12,
                padding: '18px 20px', transition: 'border-color 0.2s',
              }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 14, color: '#f0ede6', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#5a5545' }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Meus casos */}
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, color: '#f0ede6', marginBottom: 20 }}>
            Meus casos
          </h2>

          {loading && (
            <p style={{ color: '#5a5545', fontSize: 13 }}>Carregando...</p>
          )}

          {!loading && cases.length === 0 && (
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 48, textAlign: 'center' }}>
              <p style={{ color: '#a09880', marginBottom: 20, fontSize: 14 }}>
                Você ainda não abriu nenhum relato.
              </p>
              <Link to="/client/triagem" style={{
                background: '#d4af37', color: '#080808', padding: '10px 22px',
                borderRadius: 6, textDecoration: 'none', fontSize: 13,
                fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Abrir primeiro relato
              </Link>
            </div>
          )}

          {cases.map(c => (
            <div key={c.id} style={{
              background: '#111', border: '1px solid #222', borderRadius: 12,
              padding: 24, marginBottom: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#f0ede6', marginBottom: 4 }}>
                    {c.title_area}
                  </div>
                  <div style={{ fontSize: 12, color: '#5a5545' }}>
                    Aberto em {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    {c.lawyer_name && ` · Advogado: ${c.lawyer_name}`}
                  </div>
                </div>
                <Link to={`/client/chat/${c.id}`} style={{
                  background: 'transparent', color: '#d4af37',
                  border: '1px solid rgba(212,175,55,0.25)', borderRadius: 6,
                  padding: '7px 16px', textDecoration: 'none', fontSize: 12,
                }}>
                  Abrir chat
                </Link>
              </div>

              {/* Stepper readonly para o cliente */}
              <Stepper steps={STATUS_STEPS} current={c.status} />
            </div>
          ))}

        </main>
      </div>
    </div>
  )
}