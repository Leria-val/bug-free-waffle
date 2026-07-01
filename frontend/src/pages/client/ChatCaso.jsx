// src/pages/client/ChatCaso.jsx
// Chat seguro do cliente com o advogado

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import { CryptoBadge } from '../../components/CryptoBadge.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'
import api from '../../services/api.js'

export default function ChatCaso() {
  const { id: paramId }     = useParams()
  const { user }            = useAuth()
  const { get }             = useApi()
  const [cases, setCases]   = useState([])
  const [activeId, setActive] = useState(paramId || '')
  const [messages, setMessages] = useState([])
  const [docs, setDocs]     = useState([])
  const [text, setText]     = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef        = useRef()
  const bottomRef           = useRef()
  const navigate            = useNavigate()

  useEffect(() => {
    get('/casos').then(r => {
      if (r.ok) {
        const valid = r.data.cases.filter(c => c.status !== 'TRIAGEM')
        setCases(valid)
        if (!activeId && valid.length > 0) setActive(valid[0].id)
      }
    })
  }, [])

  useEffect(() => {
    if (!activeId) return
    get(`/casos/${activeId}/mensagens`).then(r => { if (r.ok) setMessages(r.data.messages) })
    get(`/casos/${activeId}/documentos`).then(r => { if (r.ok) setDocs(r.data.documents) })
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
    } catch { /* silencioso */ }
    finally { setSending(false) }
  }

  const activeCase = cases.find(c => c.id === activeId)

  const uploadDocument = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !activeId) return

    setUploadError('')

    // Validação no front: 50MB, PDF ou imagem (espelha o multer do backend)
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setUploadError('Apenas PDF ou imagens são permitidos.')
      e.target.value = ''
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError('Arquivo muito grande. Máximo 50MB.')
      e.target.value = ''
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post(`/casos/${activeId}/documentos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setDocs(d => [res.data.document, ...d])
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Erro ao enviar arquivo.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ display:'flex', flex:1 }}>
        <Sidebar />
        <main style={{ flex:1, display:'flex', overflow:'hidden' }}>

          {/* Lista de casos */}
          <div style={{ width: 220, borderRight:'1px solid var(--border)', overflowY:'auto', padding:'16px 0' }}>
            <div style={{ padding:'0 16px 12px', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-3)' }}>
              Casos ativos
            </div>
            {cases.length === 0 && (
              <p style={{ padding:'0 16px', fontSize:13, color:'var(--text-3)' }}>
                Nenhum caso com advogado atribuído.
              </p>
            )}
            {cases.map(c => (
              <button key={c.id} onClick={() => setActive(c.id)} style={{
                display:'block', width:'100%', textAlign:'left',
                padding:'10px 16px', background: activeId === c.id ? 'rgba(201,168,76,0.08)' : 'transparent',
                borderLeft: activeId === c.id ? '2px solid var(--gold)' : '2px solid transparent',
                border:'none', cursor:'pointer',
              }}>
                <div style={{ fontSize:13, color:'var(--text-1)' }}>{c.title_area}</div>
                <div style={{ fontSize:11, color:'var(--text-3)' }}>{c.lawyer_name || 'Aguardando'}</div>
              </button>
            ))}
          </div>

          {/* Área de chat */}
          {activeId ? (
            <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
              {/* Header */}
              <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:18 }}>{activeCase?.title_area}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)' }}>Advogado: {activeCase?.lawyer_name || 'Não atribuído'}</div>
                </div>
                <CryptoBadge />
              </div>

              {/* Documentos + upload */}
              <div style={{ padding:'10px 24px', borderBottom:'1px solid var(--border)', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                {docs.map(d => (
                  <span key={d.id} style={{
                    padding:'3px 10px', background:'var(--bg-3)',
                    border:'1px solid var(--border)', borderRadius:4,
                    fontSize:11, color:'var(--text-2)',
                  }}>📄 {d.file_name}</span>
                ))}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={uploadDocument}
                  style={{ display:'none' }}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{ fontSize: 11 }}
                >
                  {uploading ? 'Enviando...' : '+ Anexar documento'}
                </button>
                {uploadError && (
                  <span style={{ fontSize: 11, color: '#ef5350' }}>{uploadError}</span>
                )}
              </div>

              {/* Mensagens */}
              <div style={{ flex:1, overflowY:'auto', padding:'24px', display:'flex', flexDirection:'column', gap:12 }}>
                {messages.map(m => {
                  const isMe = m.sender_id === user.id
                  return (
                    <div key={m.id} style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth:'72%', padding:'10px 14px',
                        background: isMe ? 'rgba(201,168,76,0.12)' : 'var(--surface)',
                        border: `1px solid ${isMe ? 'var(--border-mid)' : 'var(--border)'}`,
                        borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      }}>
                        <div style={{ fontSize:13, color:'var(--text-1)', lineHeight:1.5 }}>{m.message_text}</div>
                        <div style={{ fontSize:10, color:'var(--text-3)', marginTop:4, textAlign:'right' }}>
                          {m.sender_name} · {new Date(m.created_at).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
                <input
                  className="form-input"
                  placeholder="Mensagem segura..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  style={{ flex:1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
                  {sending ? '...' : 'Enviar'}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <p style={{ color:'var(--text-3)', fontSize:14 }}>Selecione um caso para abrir o chat</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}