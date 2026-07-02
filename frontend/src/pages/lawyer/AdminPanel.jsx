// src/pages/lawyer/AdminPanel.jsx
import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import Pagination from '../../components/Pagination.jsx'
import { useApi } from '../../hooks/useApi.js'

const AREAS_ATUACAO = [
  'Direito Civil', 'Direito Criminal', 'Direito Trabalhista', 'Direito de Família',
  'Direito Empresarial', 'Direito Tributário', 'Direito Previdenciário',
  'Direito do Consumidor', 'Direito Imobiliário', 'Direito Digital',
]

const PER_PAGE = 8

export default function AdminPanel() {
  const { get, post, patch, loading } = useApi()
  const [usuarios, setUsuarios]       = useState([])
  const [casos, setCasos]             = useState([])
  const [relatorio, setRelatorio]     = useState(null)
  const [aba, setAba]                 = useState('usuarios')
  const [form, setForm]               = useState({ name: '', email: '', password: '', area_atuacao: '', bio: '' })
  const [msg, setMsg]                 = useState('')
  const [erro, setErro]               = useState('')
  const [usuariosPage, setUsuariosPage] = useState(1)
  const [casosPage, setCasosPage]       = useState(1)
  const [assigning, setAssigning]       = useState({}) // { [caseId]: lawyer_id selecionado }

  useEffect(() => {
    get('/admin/usuarios').then(r => setUsuarios(r.users || [])).catch(() => {})
    get('/admin/relatorio').then(r => setRelatorio(r)).catch(() => {})
    get('/casos').then(r => setCasos(r.cases || [])).catch(() => {})
  }, [])

  const advogados = usuarios.filter(u => u.role === 'LAWYER' && u.is_active)

  const atribuirAdvogado = async (caseId) => {
    const lawyer_id = assigning[caseId]
    if (!lawyer_id) return
    try {
      await patch(`/casos/${caseId}/assign`, { lawyer_id })
      const r = await get('/casos')
      setCasos(r.cases || [])
    } catch {}
  }

  const criarAdvogado = async (e) => {
    e.preventDefault()
    setMsg(''); setErro('')
    try {
      const r = await post('/admin/advogados', form)
      setMsg(`✅ Advogado ${r.user.name} criado! MFA: ${r.mfa_secret}`)
      setForm({ name: '', email: '', password: '', area_atuacao: '', bio: '' })
      const r2 = await get('/admin/usuarios')
      setUsuarios(r2.users || [])
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

  const s = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const labelStyle = {
    fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#a09880', display: 'block', marginBottom: 6
  }
  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #2e2e2e',
    borderRadius: 6, color: '#f0ede6', padding: '10px 14px', fontSize: 14,
    outline: 'none', marginBottom: 16,
  }
  const btnStyle = (active) => ({
    padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 500, letterSpacing: '0.06em',
    background: active ? '#d4af37' : 'transparent',
    color: active ? '#080808' : '#a09880',
    borderBottom: active ? 'none' : '1px solid #222',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#080808' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>

          <div style={{ marginBottom: 32 }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)', marginBottom: 16 }} />
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 28, color: '#f0ede6', marginBottom: 4 }}>
              Painel Administrativo
            </h1>
            <p style={{ color: '#a09880', fontSize: 14 }}>Gerencie advogados, clientes e relatórios do escritório.</p>
          </div>

          {/* Relatório resumido */}
          {relatorio && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
              {[
                { label: 'Advogados', valor: relatorio.usuarios?.LAWYER || 0, icon: '⚖️' },
                { label: 'Clientes',  valor: relatorio.usuarios?.CLIENT || 0, icon: '👤' },
                { label: 'Casos',     valor: Object.values(relatorio.casos || {}).reduce((a,b) => a+b, 0), icon: '📁' },
                { label: 'Sem advogado', valor: relatorio.casos_sem_advogado || 0, icon: '⏳' },
              ].map(c => (
                <div key={c.label} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontSize: 28, fontWeight: 300, color: '#d4af37', fontFamily: 'Georgia,serif' }}>{c.valor}</div>
                  <div style={{ fontSize: 12, color: '#5a5545', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{c.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Abas */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: '1px solid #222', paddingBottom: 0 }}>
            {['usuarios', 'criar', 'casos'].map(a => (
              <button key={a} onClick={() => setAba(a)} style={btnStyle(aba === a)}>
                {a === 'usuarios' ? 'Usuários' : a === 'criar' ? '+ Criar Advogado' : 'Casos'}
              </button>
            ))}
          </div>

          {/* Aba: Usuários */}
          {aba === 'usuarios' && (
            <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #222' }}>
                    {['Nome', 'Email', 'Perfil', 'Status', 'Ação'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, color: '#5a5545', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.slice((usuariosPage - 1) * PER_PAGE, usuariosPage * PER_PAGE).map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                      <td style={{ padding: '14px 20px', fontSize: 14, color: '#f0ede6' }}>{u.name}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: '#a09880' }}>{u.email}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                          background: u.role === 'ADMIN' ? 'rgba(212,175,55,0.12)' : u.role === 'LAWYER' ? 'rgba(26,107,58,0.15)' : '#1e1e1e',
                          color: u.role === 'ADMIN' ? '#d4af37' : u.role === 'LAWYER' ? '#4caf50' : '#a09880',
                          border: `1px solid ${u.role === 'ADMIN' ? 'rgba(212,175,55,0.25)' : u.role === 'LAWYER' ? 'rgba(76,175,80,0.3)' : '#2e2e2e'}`,
                        }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 12, color: u.is_active ? '#4caf50' : '#ef5350' }}>
                          {u.is_active ? '● Ativo' : '○ Inativo'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => toggleAtivo(u.id, u.is_active)}
                            style={{
                              padding: '5px 14px', borderRadius: 6, border: '1px solid #2e2e2e',
                              background: 'transparent', color: u.is_active ? '#ef5350' : '#4caf50',
                              fontSize: 12, cursor: 'pointer',
                            }}
                          >
                            {u.is_active ? 'Desativar' : 'Ativar'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {aba === 'usuarios' && usuarios.length > PER_PAGE && (
            <Pagination
              page={usuariosPage}
              totalPages={Math.ceil(usuarios.length / PER_PAGE)}
              onChange={setUsuariosPage}
            />
          )}

          {/* Aba: Criar Advogado */}
          {aba === 'criar' && (
            <div style={{ maxWidth: 520 }}>
              <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 32 }}>
                <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 20, color: '#f0ede6', marginBottom: 24 }}>
                  Criar conta de advogado
                </h2>
                <p style={{ fontSize: 13, color: '#5a5545', marginBottom: 24 }}>
                  O email deve usar o domínio <span style={{ color: '#d4af37' }}>@justicaedireito.adv.br</span>
                </p>

                <form onSubmit={criarAdvogado}>
                  <label style={labelStyle}>Nome completo</label>
                  <input style={inputStyle} value={form.name} onChange={s('name')} placeholder="Dr. Nome Sobrenome" required />

                  <label style={labelStyle}>Email profissional</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={s('email')} placeholder="nome@justicaedireito.adv.br" required />

                  <label style={labelStyle}>Senha inicial</label>
                  <input style={inputStyle} type="password" value={form.password} onChange={s('password')} placeholder="Mínimo 8 caracteres" minLength={8} required />

                  <label style={labelStyle}>Área de atuação</label>
                  <select style={inputStyle} value={form.area_atuacao} onChange={s('area_atuacao')} required>
                    <option value="">Selecione...</option>
                    {AREAS_ATUACAO.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>

                  <label style={labelStyle}>Bio pública (opcional)</label>
                  <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.bio} onChange={s('bio')} placeholder="Breve apresentação exibida na busca pública de advogados" />

                  {msg && (
                    <div style={{ padding: '12px 16px', background: 'rgba(26,107,58,0.12)', border: '1px solid #1a6b3a', borderRadius: 6, color: '#66bb6a', fontSize: 13, marginBottom: 16 }}>
                      {msg}
                    </div>
                  )}
                  {erro && (
                    <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.1)', border: '1px solid #c0392b', borderRadius: 6, color: '#e57373', fontSize: 13, marginBottom: 16 }}>
                      {erro}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: loading ? '#333' : '#d4af37', color: '#080808',
                      border: 'none', borderRadius: 6, padding: '11px 24px',
                      fontSize: 13, fontWeight: 600, letterSpacing: '0.08em',
                      textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', width: '100%',
                    }}
                  >
                    {loading ? 'Criando...' : 'Criar Advogado'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Aba: Casos */}
          {aba === 'casos' && (() => {
            const casosPageItems = casos.slice((casosPage - 1) * PER_PAGE, casosPage * PER_PAGE)
            return (
              <div>
                {casos.length === 0 && (
                  <div className="card" style={{ background: '#111', border: '1px solid #222', borderRadius: 12, textAlign: 'center', padding: 48 }}>
                    <p style={{ color: '#a09880' }}>Nenhum caso registrado ainda.</p>
                  </div>
                )}

                {casosPageItems.map(c => (
                  <div key={c.id} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 20, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontFamily: 'Georgia,serif', fontSize: 17, color: '#f0ede6', marginBottom: 4 }}>{c.title_area}</div>
                        <div style={{ fontSize: 12, color: '#5a5545' }}>
                          Cliente: {c.client_name} · {c.client_email}
                          <br />
                          Status: <span style={{ color: '#d4af37' }}>{c.status}</span>
                          {c.lawyer_name ? ` · Advogado: ${c.lawyer_name}` : ' · Sem advogado atribuído'}
                        </div>
                      </div>

                      {!c.lawyer_name && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <select
                            style={{ ...inputStyle, marginBottom: 0, width: 220 }}
                            value={assigning[c.id] || ''}
                            onChange={e => setAssigning(a => ({ ...a, [c.id]: e.target.value }))}
                          >
                            <option value="">Selecionar advogado...</option>
                            {advogados.map(a => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => atribuirAdvogado(c.id)}
                            disabled={!assigning[c.id]}
                            style={{
                              padding: '9px 18px', borderRadius: 6, border: 'none',
                              background: assigning[c.id] ? '#d4af37' : '#333',
                              color: assigning[c.id] ? '#080808' : '#666',
                              fontSize: 13, fontWeight: 600, cursor: assigning[c.id] ? 'pointer' : 'not-allowed',
                            }}
                          >
                            Atribuir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {casos.length > PER_PAGE && (
                  <Pagination
                    page={casosPage}
                    totalPages={Math.ceil(casos.length / PER_PAGE)}
                    onChange={setCasosPage}
                  />
                )}
              </div>
            )
          })()}
        </main>
      </div>
    </div>
  )
}