// src/pages/lawyer/Requisicoes.jsx
// Aba de requisições — casos em TRIAGEM sem advogado atribuído (só Admin atribui)
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import { useApi } from '../../hooks/useApi.js'


export default function Requisicoes() {
  const { get, loading } = useApi()
  const [cases, setCases] = useState([])

  useEffect(() => {
    // Admin vê todos, advogado vê só os seus — o backend filtra por role
    get('/casos').then(r => {
      setCases((r.cases || []).filter(c => c.status === 'TRIAGEM'))
    }).catch(() => {})
  }, [])

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ display:'flex', flex:1 }}>
        <Sidebar />
        <main style={{ flex:1, padding:'40px 48px', overflowY:'auto' }}>

          <div style={{ marginBottom: 32 }}>
            <div className="divider-gold" style={{ marginBottom: 16 }} />
            <h1 style={{ fontFamily:'var(--font-display)', fontSize: 30, marginBottom: 8 }}>
              Requisições de novos clientes
            </h1>
            <p style={{ color:'var(--text-2)', fontSize:14 }}>
              Relatos recebidos pelo formulário de triagem aguardando atribuição de advogado.
            </p>
          </div>

          {loading && <p className="text-muted" style={{ fontSize:13 }}>Carregando...</p>}

          {!loading && cases.length === 0 && (
            <div className="card" style={{ textAlign:'center', padding:48 }}>
              <p style={{ color:'var(--text-2)' }}>Nenhuma requisição pendente no momento.</p>
            </div>
          )}

          {cases.map(c => (
            <div key={c.id} className="card" style={{ marginBottom: 16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:18, marginBottom:4 }}>{c.title_area}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>
                    Cliente: {c.client_name} · {c.client_email}
                    <br />Recebido em: {new Date(c.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div style={{ display:'flex', gap: 8 }}>
                  <span className="badge badge-gray">Aguardando atribuição</span>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  )
}