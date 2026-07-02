// src/pages/lawyer/LawyerDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import Stepper from '../../components/Stepper.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'

const STATUS_STEPS = ['TRIAGEM','ANALISE','EM_ANDAMENTO','CONCLUIDO','ARQUIVADO']

const STATUS_COLOR = {
  TRIAGEM:      { bg:'#1e1e1e',               color:'#a09880' },
  ANALISE:      { bg:'rgba(212,175,55,0.1)',   color:'#d4af37' },
  EM_ANDAMENTO: { bg:'rgba(212,175,55,0.12)',  color:'#e8c84a' },
  CONCLUIDO:    { bg:'rgba(26,107,58,0.15)',   color:'#4caf50' },
  ARQUIVADO:    { bg:'#1e1e1e',               color:'#5a5545' },
}

export default function LawyerDashboard() {
  const { user }          = useAuth()
  const { get, loading }  = useApi()
  const [cases, setCases] = useState([])

  useEffect(() => {
    get('/casos').then(r => setCases(r.cases || [])).catch(() => {})
  }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#080808' }}>
      <Navbar />
      <div style={{ display:'flex', flex:1 }}>
        <Sidebar />
        <main style={{ flex:1, padding:'40px 48px', overflowY:'auto' }}>

          <div style={{ marginBottom:36 }}>
            <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)', marginBottom:16 }} />
            <h1 style={{ fontFamily:'Georgia,serif', fontSize:30, color:'#f0ede6', marginBottom:6 }}>
              Painel — {user?.name}
            </h1>
            <p style={{ color:'#a09880', fontSize:14 }}>
              Apenas você tem acesso aos processos atribuídos a você.
            </p>
          </div>

          {/* Métricas */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:40 }}>
            {[
              { label:'Total de casos',  value: cases.length },
              { label:'Em andamento',    value: cases.filter(c => c.status === 'EM_ANDAMENTO').length },
              { label:'Concluídos',      value: cases.filter(c => c.status === 'CONCLUIDO').length },
            ].map(item => (
              <div key={item.label} style={{ background:'#111', border:'1px solid #222', borderRadius:12, padding:'20px 24px', textAlign:'center' }}>
                <div style={{ fontFamily:'Georgia,serif', fontSize:36, color:'#d4af37' }}>{item.value}</div>
                <div style={{ fontSize:12, color:'#5a5545', letterSpacing:'0.06em', textTransform:'uppercase', marginTop:4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Header feed */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h2 style={{ fontFamily:'Georgia,serif', fontSize:22, color:'#f0ede6' }}>Meus casos</h2>
            <Link to="/lawyer/requisicoes" style={{
              background:'transparent', color:'#d4af37', border:'1px solid rgba(212,175,55,0.3)',
              borderRadius:6, padding:'7px 16px', textDecoration:'none', fontSize:12,
            }}>
              Ver requisições
            </Link>
          </div>

          {loading && <p style={{ color:'#5a5545', fontSize:13 }}>Carregando...</p>}

          {!loading && cases.length === 0 && (
            <div style={{ background:'#111', border:'1px solid #222', borderRadius:12, padding:48, textAlign:'center' }}>
              <p style={{ color:'#a09880', fontSize:14 }}>Nenhum caso atribuído a você no momento.</p>
              <p style={{ color:'#5a5545', fontSize:12, marginTop:8 }}>Aguarde a atribuição pelo administrador.</p>
            </div>
          )}

          {cases.map(c => {
            const sc = STATUS_COLOR[c.status] || STATUS_COLOR.TRIAGEM
            return (
              <div key={c.id} style={{ background:'#111', border:'1px solid #222', borderRadius:12, padding:24, marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                      <span style={{ fontFamily:'Georgia,serif', fontSize:18, color:'#f0ede6' }}>{c.title_area}</span>
                      <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:sc.bg, color:sc.color }}>
                        {c.status}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:'#5a5545' }}>
                      Cliente: {c.client_name} · {c.client_email} · {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  {/* Botão de chat seguro com o cliente */}
                  <Link to={`/lawyer/chat/${c.id}`} style={{
                    background:'#d4af37', color:'#080808', border:'none',
                    borderRadius:6, padding:'8px 18px', textDecoration:'none',
                    fontSize:12, fontWeight:600, letterSpacing:'0.06em',
                    whiteSpace:'nowrap',
                  }}>
                    💬 Chat seguro
                  </Link>
                </div>

                {/* Stepper readonly no dashboard */}
                <Stepper steps={STATUS_STEPS} current={c.status} />
              </div>
            )
          })}

        </main>
      </div>
    </div>
  )
}