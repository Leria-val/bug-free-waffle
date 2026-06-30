// src/pages/lawyer/LawyerDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import { Stepper } from '../../components/CryptoBadge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'



const STATUS_BADGE = {
  TRIAGEM:      'badge-gray',
  ANALISE:      'badge-gold',
  EM_ANDAMENTO: 'badge-gold',
  CONCLUIDO:    'badge-green',
  ARQUIVADO:    'badge-gray',
}

export default function LawyerDashboard() {
  const { user }        = useAuth()
  const { get, loading} = useApi()
  const [cases, setCases] = useState([])

  useEffect(() => {
    get('/casos').then(r => { if (r.ok) setCases(r.data.cases) })
  }, [])

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ display:'flex', flex:1 }}>
        <Sidebar />
        <main style={{ flex:1, padding:'40px 48px', overflowY:'auto' }}>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize: 30, marginBottom: 6 }}>
              Painel — {user.name}
            </h1>
            <p style={{ color:'var(--text-2)', fontSize: 14 }}>
              Casos atribuídos a você. Apenas você tem acesso a estes processos.
            </p>
          </div>

          {/* Resumo */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:40 }}>
            {[
              { label:'Total de casos',   value: cases.length },
              { label:'Em andamento',     value: cases.filter(c => c.status === 'EM_ANDAMENTO').length },
              { label:'Concluídos',       value: cases.filter(c => c.status === 'CONCLUIDO').length },
            ].map(item => (
              <div key={item.label} className="card-sm" style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize: 36, color:'var(--gold)' }}>{item.value}</div>
                <div style={{ fontSize: 12, color:'var(--text-3)', letterSpacing:'0.06em', textTransform:'uppercase', marginTop: 4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Feed de casos */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize: 22 }}>Meus casos</h2>
            <Link to="/lawyer/requisicoes" className="btn btn-outline" style={{ fontSize: 12, padding:'7px 16px' }}>
              Ver requisições
            </Link>
          </div>

          {loading && <p className="text-muted" style={{ fontSize:13 }}>Carregando...</p>}

          {!loading && cases.length === 0 && (
            <div className="card" style={{ textAlign:'center', padding: 48 }}>
              <p style={{ color:'var(--text-2)' }}>Nenhum caso atribuído a você no momento.</p>
            </div>
          )}

          {cases.map(c => (
            <div key={c.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily:'var(--font-display)', fontSize: 18 }}>{c.title_area}</span>
                    <span className={`badge ${STATUS_BADGE[c.status]}`}>{c.status}</span>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>
                    Cliente: {c.client_name} · {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <Link to={`/lawyer/chat/${c.id}`} className="btn btn-primary" style={{ fontSize:12, padding:'7px 16px' }}>
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