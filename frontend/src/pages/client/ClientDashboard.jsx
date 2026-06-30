// src/pages/client/ClientDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import { Stepper } from '../../components/CryptoBadge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'

export default function ClientDashboard() {
  const { user }        = useAuth()
  const { get, loading} = useApi()
  const [cases, setCases] = useState([])

  useEffect(() => {
    get('/casos').then(r => { if (r.ok) setCases(r.data.cases) })
  }, [])

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, marginBottom: 6 }}>
              Olá, {user.name.split(' ')[0]}
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
              Acompanhe seu caso e mantenha comunicação segura com seu advogado.
            </p>
          </div>

          {/* Ações rápidas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 40 }}>
            {[
              { label: 'Abrir relato', desc: 'Descreva seu caso', to: '/client/triagem', icon: '📋' },
              { label: 'Chat seguro', desc: 'Falar com advogado', to: '/client/chat', icon: '💬' },
              { label: 'Enviar documentos', desc: 'Anexar arquivos', to: '/client/documentos', icon: '📁' },
            ].map(item => (
              <Link key={item.to} to={item.to} className="card-sm" style={{ display:'flex', gap: 14, alignItems:'center', textDecoration:'none' }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--text-1)', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Meus casos */}
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 20 }}>
            Meus casos
          </h2>

          {loading && <p className="text-muted" style={{ fontSize: 13 }}>Carregando...</p>}

          {!loading && cases.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>
                Você ainda não abriu nenhum relato.
              </p>
              <Link to="/client/triagem" className="btn btn-primary">Abrir primeiro relato</Link>
            </div>
          )}

          {cases.map(c => (
            <div key={c.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 4 }}>{c.title_area}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    Aberto em {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    {c.lawyer_name && ` · Advogado: ${c.lawyer_name}`}
                  </div>
                </div>
                <Link to={`/client/chat/${c.id}`} className="btn btn-outline" style={{ fontSize: 12, padding: '7px 16px' }}>
                  Abrir chat
                </Link>
              </div>
              <Stepper currentStatus={c.status} />
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}