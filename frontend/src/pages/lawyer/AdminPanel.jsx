// src/pages/lawyer/AdminPanel.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import { useApi } from '../../hooks/useApi.js'

const S = {
  label: { fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'#a09880', display:'block', marginBottom:6 },
  input: { width:'100%', background:'#0a0a0a', border:'1px solid #2e2e2e', borderRadius:6, color:'#f0ede6', padding:'10px 14px', fontSize:14, outline:'none', marginBottom:16 },
  card:  { background:'#111', border:'1px solid #222', borderRadius:12, padding:28 },
}

export default function AdminPanel() {
  const { get, post, patch, loading } = useApi()
  const [usuarios, setUsuarios]       = useState([])
  const [relatorio, setRelatorio]     = useState(null)
  const [aba, setAba]                 = useState('usuarios')
  const [form, setForm]               = useState({ name:'', email:'', password:'' })
  const [msg, setMsg]                 = useState('')
  const [erro, setErro]               = useState('')

  useEffect(() => {
    get('/admin/usuarios').then(r  => setUsuarios(r.users || [])).catch(() => {})
    get('/admin/relatorio').then(r => setRelatorio(r)).catch(() => {})
  }, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const criarAdvogado = async (e) => {
    e.preventDefault()
    setMsg(''); setErro('')
    try {
      const r = await post('/admin/advogados', {
        name:     form.name,
        email:    form.email.includes('@') ? form.email : `${form.email}@justicaedireito.adv.br`,
        password: form.password,
      })
      setMsg(`✅ ${r.user.name} criado! Código MFA: ${r.mfa_secret}`)
      setForm({ name:'', email:'', password:'' })
      get('/admin/usuarios').then(r => setUsuarios(r.users || []))
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao criar advogado.')
    }
  }

  const toggleAtivo = async (id, ativo) => {
    try {
      await patch(`/admin/usuarios/${id}/ativar`, { is_active: !ativo })
      setUsuarios(us => us.map(u => u.id === id ? { ...u, is_active: !ativo } : u))
    } catch {}
  }

  const roleBadge = (role) => ({
    ADMIN:  { bg:'rgba(212,175,55,0.12)', color:'#d4af37', border:'rgba(212,175,55,0.25)' },
    LAWYER: { bg:'rgba(26,107,58,0.15)',  color:'#4caf50', border:'rgba(76,175,80,0.3)' },
    CLIENT: { bg:'#1e1e1e',               color:'#a09880', border:'#2e2e2e' },
  }[role] || {})

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#080808' }}>
      <Navbar />
      <div style={{ display:'flex', flex:1 }}>
        <Sidebar />
        <main style={{ flex:1, padding:'40px 48px', overflowY:'auto' }}>

          <div style={{ marginBottom:32 }}>
            <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)', marginBottom:16 }} />
            <h1 style={{ fontFamily:'Georgia,serif', fontSize:28, color:'#f0ede6', marginBottom:4 }}>Painel Administrativo</h1>
            <p style={{ color:'#a09880', fontSize:14 }}>Gerencie advogados, clientes e acompanhe métricas do escritório.</p>
          </div>

          {/* Métricas */}
          {relatorio && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:40 }}>
              {[
                { label:'Advogados',    valor: relatorio.usuarios?.LAWYER || 0,                                          icon:'⚖️' },
                { label:'Clientes',     valor: relatorio.usuarios?.CLIENT || 0,                                          icon:'👤' },
                { label:'Total casos',  valor: Object.values(relatorio.casos || {}).reduce((a,b)=>a+b,0),               icon:'📁' },
                { label:'Sem advogado', valor: relatorio.casos_sem_advogado || 0,                                       icon:'⏳' },
              ].map(c => (
                <div key={c.label} style={{ background:'#111', border:'1px solid #222', borderRadius:12, padding:'20px 24px' }}>
                  <div style={{ fontSize:24, marginBottom:8 }}>{c.icon}</div>
                  <div style={{ fontSize:28, fontWeight:300, color:'#d4af37', fontFamily:'Georgia,serif' }}>{c.valor}</div>
                  <div style={{ fontSize:11, color:'#5a5545', marginTop:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>{c.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Abas */}
          <div style={{ display:'flex', gap:4, borderBottom:'1px solid #222', marginBottom:28 }}>
            {[['usuarios','Usuários'],['criar','+ Criar Advogado']].map(([k,l]) => (
              <button key={k} onClick={() => setAba(k)} style={{
                padding:'8px 20px', border:'none', cursor:'pointer', fontSize:13,
                background: aba===k ? '#d4af37' : 'transparent',
                color:      aba===k ? '#080808'  : '#a09880',
                borderRadius:'6px 6px 0 0',
              }}>{l}</button>
            ))}
          </div>

          {/* Aba Usuários */}
          {aba === 'usuarios' && (
            <div style={{ ...S.card, padding:0, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid #222' }}>
                    {['Nome','Email','Perfil','Status','Ação'].map(h => (
                      <th key={h} style={{ padding:'12px 20px', textAlign:'left', fontSize:11, color:'#5a5545', letterSpacing:'0.1em', textTransform:'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => {
                    const rb = roleBadge(u.role)
                    return (
                      <tr key={u.id} style={{ borderBottom:'1px solid #1a1a1a' }}>
                        <td style={{ padding:'14px 20px', fontSize:14, color:'#f0ede6' }}>{u.name}</td>
                        <td style={{ padding:'14px 20px', fontSize:13, color:'#a09880' }}>{u.email}</td>
                        <td style={{ padding:'14px 20px' }}>
                          <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:500, background:rb.bg, color:rb.color, border:`1px solid ${rb.border}` }}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding:'14px 20px', fontSize:12, color: u.is_active ? '#4caf50' : '#ef5350' }}>
                          {u.is_active ? '● Ativo' : '○ Inativo'}
                        </td>
                        <td style={{ padding:'14px 20px' }}>
                          {u.role !== 'ADMIN' && (
                            <button onClick={() => toggleAtivo(u.id, u.is_active)} style={{
                              padding:'5px 14px', borderRadius:6, border:'1px solid #2e2e2e',
                              background:'transparent', color: u.is_active ? '#ef5350' : '#4caf50',
                              fontSize:12, cursor:'pointer',
                            }}>
                              {u.is_active ? 'Desativar' : 'Ativar'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Aba Criar Advogado */}
          {aba === 'criar' && (
            <div style={{ maxWidth:500 }}>
              <div style={S.card}>
                <h2 style={{ fontFamily:'Georgia,serif', fontSize:20, color:'#f0ede6', marginBottom:8 }}>Criar conta de advogado</h2>
                <p style={{ fontSize:13, color:'#5a5545', marginBottom:24 }}>
                  O email será criado com domínio <span style={{ color:'#d4af37' }}>@justicaedireito.adv.br</span>.<br/>
                  Pode digitar só o prefixo (ex: <em>joao.silva</em>) ou o email completo.
                </p>

                <form onSubmit={criarAdvogado}>
                  <label style={S.label}>Nome completo</label>
                  <input style={S.input} value={form.name} onChange={set('name')} placeholder="Dr. Nome Sobrenome" required />

                  <label style={S.label}>Email (prefixo ou completo)</label>
                  <input style={S.input} value={form.email} onChange={set('email')} placeholder="nome.sobrenome" required />

                  <label style={S.label}>Senha inicial</label>
                  <input style={S.input} type="password" value={form.password} onChange={set('password')} placeholder="Mínimo 8 caracteres" minLength={8} required />

                  {msg  && <div style={{ padding:'12px 16px', background:'rgba(26,107,58,0.12)', border:'1px solid #1a6b3a', borderRadius:6, color:'#66bb6a', fontSize:13, marginBottom:16 }}>{msg}</div>}
                  {erro && <div style={{ padding:'12px 16px', background:'rgba(192,57,43,0.1)',  border:'1px solid #c0392b', borderRadius:6, color:'#e57373', fontSize:13, marginBottom:16 }}>{erro}</div>}

                  <button type="submit" disabled={loading} style={{
                    background: loading ? '#333' : '#d4af37', color:'#080808', border:'none',
                    borderRadius:6, padding:'11px 24px', fontSize:13, fontWeight:600,
                    letterSpacing:'0.08em', textTransform:'uppercase',
                    cursor: loading ? 'not-allowed' : 'pointer', width:'100%',
                  }}>
                    {loading ? 'Criando...' : 'Criar Advogado'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}