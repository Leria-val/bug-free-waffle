// src/pages/client/ChatCaso.jsx
// Chat seguro do cliente com o advogado

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import { CryptoBadge } from '../../components/CryptoBadge'
import { useAuth } from '../../context/AuthContext'
import { useApi } from '../../hooks/useApi'
import api from '../../services/api'

const STATUS_OPTIONS = ['TRIAGEM', 'ANALISE', 'EM_ANDAMENTO', 'CONCLUIDO', 'ARQUIVADO']

export default function ChatCasoLawyer() {
  const { id: paramId }       = useParams()
  const { user }               = useAuth()
  const { get }                 = useApi()
  const [cases, setCases]       = useState([])
  const [activeId, setActive]   = useState(paramId || '')
  const [messages, setMessages] = useState([])
  const [docs, setDocs]         = useState([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [restrictedError, setRestrictedError] = useState('')
  const bottomRef                = useRef()
  const navigate                 = useNavigate()

  // Lista os casos atribuídos a este advogado (backend já filtra por lawyer_id)
  useEffect(() => {
    get('/casos').then(res => {
      setCases(res.cases || [])
      if (!activeId && res.cases?.length > 0) setActive(res.cases[0].id)
    }).catch(() => {})
  }, [])

  // Carrega mensagens e documentos do caso ativo
  // Se a API retornar 403, exibe "Acesso Restrito/Confidencial" —
  // isso acontece se um Advogado A tentar acessar URL de um caso do Advogado B
  useEffect(() => {
    if (!activeId) return
    setRestrictedError('')

    get(`/casos/${activeId}/mensagens`)
      .then(res => setMessages(res.messages || []))
      .catch(err => {
        if (err.response?.status === 403) {
          setRestrictedError(err.response.data?.error || 'Acesso Restrito/Confidencial')
          setMessages([])
        }
      })

    get(`/casos/${activeId}/documentos`)
      .then(res => setDocs(res.documents || []))
      .catch(() => {})
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeId) return
    setSending(true)
    try {
      const res = await api.post(`/casos/${activeId}/mensagens`, { message_text: text })
      setMessages(m => [...m, res.data.message])
      setText('')
    } catch (err) {
      if (err.response?.status === 403) {
        setRestrictedError(err.response.data?.error || 'Acesso Restrito/Confidencial')
      }
    } finally {
      setSending(false)
    }
  }

  const updateStatus = async (newStatus) => {
    if (!activeId || updatingStatus) return
    setUpdatingStatus(true)
    try {
      await api.patch(`/casos/${activeId}/status`, { status: newStatus })
      setCases(cs => cs.map(c => c.id === activeId ? { ...c, status: newStatus } : c))
    } catch (err) {
      if (err.response?.status === 403) {
        setRestrictedError(err.response.data?.error || 'Acesso Restrito/Confidencial')
      }
    } finally {
      setUpdatingStatus(false)
    }
  }

  const activeCase = cases.find(c => c.id === activeId)

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Lista de casos atribuídos a este advogado */}
          <div style={{ width: 240, borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '16px 0' }}>
            <div style={{ padding: '0 16px 12px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
              Meus casos
            </div>
            {cases.length === 0 && (
              <p style={{ padding: '0 16px', fontSize: 13, color: 'var(--text-3)' }}>
                Nenhum caso atribuído a você ainda.
              </p>
            )}
            {cases.map(c => (
              <button key={c.id} onClick={() => setActive(c.id)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 16px',
                background: activeId === c.id ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderLeft: activeId === c.id ? '2px solid var(--gold, #d4af37)' : '2px solid transparent',
                border: 'none', cursor: 'pointer',
              }}>
                <div style={{ fontSize: 13, color: 'var(--text-1)' }}>{c.title_area}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.client_name}</div>
                <span style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: 8,
                  background: 'var(--bg-3)', color: 'var(--text-2)',
                  display: 'inline-block', marginTop: 4,
                }}>{c.status}</span>
              </button>
            ))}
          </div>

          {/* Área de chat */}
          {restrictedError ? (
            // Bloco da Regra de Negócio de Sigilo — exibido se a API retornar 403
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ fontSize: '2rem', color: 'var(--gold, #d4af37)' }}>⚠</div>
              <h2 style={{ fontFamily: 'var(--font-display, Georgia)', color: 'var(--text-1)' }}>
                {restrictedError}
              </h2>
              <p style={{ color: 'var(--text-3)', fontSize: 13, maxWidth: 360, textAlign: 'center' }}>
                Este caso está sob sigilo de outro advogado da firma.
                Sua tentativa de acesso foi registrada pelo sistema.
              </p>
              <button className="btn btn-outline" onClick={() => navigate('/lawyer/dashboard')}>
                Voltar ao painel
              </button>
            </div>
          ) : activeId ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Header com Stepper de status */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display, Georgia)', fontSize: 18 }}>{activeCase?.title_area}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      Cliente: {activeCase?.client_name} · {activeCase?.client_email}
                    </div>
                  </div>
                  <CryptoBadge />
                </div>

                <Stepper
                  steps={STATUS_OPTIONS}
                  current={activeCase?.status}
                  onChange={updateStatus}
                  disabled={updatingStatus}
                />
              </div>

              {/* Documentos do cliente (somente visualização) */}
              {docs.length > 0 && (
                <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {docs.map(d => (
                    <a
                      key={d.id}
                      href={`${api.defaults.baseURL.replace('/api', '')}/uploads/${d.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        padding: '3px 10px', background: 'var(--bg-3)',
                        border: '1px solid var(--border)', borderRadius: 4,
                        fontSize: 11, color: 'var(--text-2)', textDecoration: 'none',
                      }}
                    >📄 {d.file_name}</a>
                  ))}
                </div>
              )}

              {/* Mensagens */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {messages.map(m => {
                  const isMe = m.sender_id === user.id
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '72%', padding: '10px 14px',
                        background: isMe ? 'rgba(201,168,76,0.12)' : 'var(--surface)',
                        border: `1px solid ${isMe ? 'var(--border-mid)' : 'var(--border)'}`,
                        borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      }}>
                        <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5 }}>{m.message_text}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, textAlign: 'right' }}>
                          {m.sender_name} · {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <input
                  className="form-input"
                  placeholder="Responder ao cliente..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
                  {sending ? '...' : 'Enviar'}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Selecione um caso para abrir o chat</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}