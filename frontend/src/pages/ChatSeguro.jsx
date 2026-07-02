// src/pages/ChatSeguro.jsx
// Chat unificado — funciona para CLIENTE e ADVOGADO
// Advogado: vê resumo do caso, pode mudar status via Stepper
// Cliente:  pode enviar documentos e mensagens

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Sidebar from '../components/Sidebar.jsx'
import Stepper from '../components/Stepper.jsx'
import { CryptoBadge } from '../components/CryptoBadge.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useApi } from '../hooks/useApi.js'
import api from '../services/api.js'

const STATUS_STEPS = ['TRIAGEM','ANALISE','EM_ANDAMENTO','CONCLUIDO','ARQUIVADO']

export default function ChatSeguro() {
  const { id: caseId }      = useParams()
  const { user }             = useAuth()
  const { get }              = useApi()
  const navigate             = useNavigate()
  const isLawyer             = user?.role === 'LAWYER' || user?.role === 'ADMIN'

  const [casos, setCasos]       = useState([])
  const [activeId, setActiveId] = useState(caseId || '')
  const [msgs, setMsgs]         = useState([])
  const [docs, setDocs]         = useState([])
  const [text, setText]         = useState('')
  const [sending, setSending]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [restricted, setRestricted] = useState('')
  const bottomRef  = useRef()
  const fileRef    = useRef()

  // Carrega lista de casos do usuário
  useEffect(() => {
    get('/casos')
      .then(r => {
        const list = r.cases || []
        setCasos(list)
        if (!activeId && list.length > 0) setActiveId(list[0].id)
      })
      .catch(() => {})
  }, [])

  // Carrega mensagens e docs quando muda o caso ativo
  useEffect(() => {
    if (!activeId) return
    setRestricted('')
    setMsgs([])
    setDocs([])

    get(`/casos/${activeId}/mensagens`)
      .then(r => setMsgs(r.messages || []))
      .catch(err => {
        if (err.response?.status === 403) {
          setRestricted(err.response.data?.error || 'Acesso Restrito/Confidencial')
        }
      })

    get(`/casos/${activeId}/documentos`)
      .then(r => setDocs(r.documents || []))
      .catch(() => {})
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const activeCase = casos.find(c => c.id === activeId)

  const sendMsg = async (e) => {
    e.preventDefault()
    if (!text.trim() || !activeId) return
    setSending(true)
    try {
      const res = await api.post(`/casos/${activeId}/mensagens`, { message_text: text })
      setMsgs(m => [...m, res.data.message])
      setText('')
    } catch (err) {
      if (err.response?.status === 403) setRestricted('Acesso Restrito/Confidencial')
    } finally {
      setSending(false)
    }
  }

  const uploadDoc = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadErr('')
    const allowed = ['application/pdf','image/jpeg','image/png','image/webp']
    if (!allowed.includes(file.type)) { setUploadErr('Apenas PDF ou imagens.'); e.target.value=''; return }
    if (file.size > 50*1024*1024) { setUploadErr('Máximo 50MB.'); e.target.value=''; return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await api.post(`/casos/${activeId}/documentos`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setDocs(d => [res.data.document, ...d])
    } catch { setUploadErr('Erro ao enviar arquivo.') }
    finally { setUploading(false); e.target.value='' }
  }

  const updateStatus = async (newStatus) => {
    try {
      await api.patch(`/casos/${activeId}/status`, { status: newStatus })
      setCasos(cs => cs.map(c => c.id === activeId ? { ...c, status: newStatus } : c))
      setStatusMsg(`Status atualizado para ${newStatus}`)
      setTimeout(() => setStatusMsg(''), 3000)
    } catch {}
  }

  const baseUrl = api.defaults.baseURL?.replace('/api','') || 'http://localhost:5000'

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh', background:'#080808' }}>
      <Navbar />
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <Sidebar />

        {/* Lista de casos */}
        <div style={{ width:220, borderRight:'1px solid #1a1a1a', overflowY:'auto', padding:'16px 0', flexShrink:0 }}>
          <div style={{ padding:'0 14px 10px', fontSize:10, letterSpacing:'0.12em', textTransform:'uppercase', color:'#5a5545' }}>
            {isLawyer ? 'Meus casos' : 'Seus casos'}
          </div>
          {casos.length === 0 && (
            <p style={{ padding:'0 14px', fontSize:12, color:'#5a5545' }}>
              {isLawyer ? 'Nenhum caso atribuído.' : 'Nenhum caso aberto ainda.'}
            </p>
          )}
          {casos.map(c => (
            <button key={c.id} onClick={() => setActiveId(c.id)} style={{
              display:'block', width:'100%', textAlign:'left', padding:'10px 14px',
              background: activeId === c.id ? 'rgba(212,175,55,0.08)' : 'transparent',
              borderLeft: `2px solid ${activeId === c.id ? '#d4af37' : 'transparent'}`,
              border:'none', cursor:'pointer',
            }}>
              <div style={{ fontSize:13, color:'#f0ede6', marginBottom:2 }}>{c.title_area}</div>
              <div style={{ fontSize:11, color:'#5a5545' }}>
                {isLawyer ? c.client_name : c.lawyer_name || 'Sem advogado'}
              </div>
              <span style={{ fontSize:9, padding:'1px 6px', borderRadius:8, background:'#1e1e1e', color:'#a09880', display:'inline-block', marginTop:3 }}>
                {c.status}
              </span>
            </button>
          ))}
          {/* Botão novo relato só para cliente */}
          {!isLawyer && (
            <div style={{ padding:'14px' }}>
              <Link to="/client/triagem" style={{ display:'block', textAlign:'center', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', borderRadius:6, color:'#d4af37', padding:'8px', textDecoration:'none', fontSize:12 }}>
                + Novo relato
              </Link>
            </div>
          )}
        </div>

        {/* Área principal */}
        {restricted ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
            <div style={{ fontSize:40 }}>⚠️</div>
            <h2 style={{ fontFamily:'Georgia,serif', color:'#f0ede6' }}>Acesso Restrito/Confidencial</h2>
            <p style={{ color:'#a09880', fontSize:13, textAlign:'center', maxWidth:360 }}>
              Este caso pertence a outro advogado. Sua tentativa foi registrada.
            </p>
            <button onClick={() => navigate(-1)} style={{ background:'transparent', color:'#d4af37', border:'1px solid rgba(212,175,55,0.3)', borderRadius:6, padding:'8px 20px', cursor:'pointer', fontSize:13 }}>
              Voltar
            </button>
          </div>
        ) : activeId ? (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

            {/* Header */}
            <div style={{ padding:'16px 24px', borderBottom:'1px solid #1a1a1a', flexShrink:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: isLawyer ? 12 : 0 }}>
                <div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:18, color:'#f0ede6' }}>
                    {activeCase?.title_area}
                  </div>
                  <div style={{ fontSize:12, color:'#5a5545', marginTop:2 }}>
                    {isLawyer
                      ? `Cliente: ${activeCase?.client_name} · ${activeCase?.client_email}`
                      : `Advogado: ${activeCase?.lawyer_name || 'Aguardando atribuição'}`
                    }
                  </div>
                  {statusMsg && <div style={{ fontSize:12, color:'#4caf50', marginTop:4 }}>✅ {statusMsg}</div>}
                </div>
                <CryptoBadge />
              </div>

              {/* Stepper clicável só para advogado */}
              {isLawyer && (
                <Stepper
                  steps={STATUS_STEPS}
                  current={activeCase?.status}
                  onChange={updateStatus}
                />
              )}
              {/* Stepper readonly para cliente */}
              {!isLawyer && (
                <div style={{ marginTop:10 }}>
                  <Stepper steps={STATUS_STEPS} current={activeCase?.status} />
                </div>
              )}
            </div>

            {/* Documentos */}
            <div style={{ padding:'8px 24px', borderBottom:'1px solid #1a1a1a', display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', flexShrink:0, minHeight:44 }}>
              {docs.map(d => (
                <a key={d.id} href={`${baseUrl}/uploads/${d.file_path}`} target="_blank" rel="noreferrer"
                  style={{ padding:'3px 10px', background:'#1a1a1a', border:'1px solid #2e2e2e', borderRadius:4, fontSize:11, color:'#a09880', textDecoration:'none' }}>
                  📄 {d.file_name}
                </a>
              ))}
              <input ref={fileRef} type="file" accept=".pdf,image/*" onChange={uploadDoc} style={{ display:'none' }} />
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ background:'transparent', border:'1px dashed #2e2e2e', borderRadius:4, color:'#5a5545', padding:'3px 10px', fontSize:11, cursor:'pointer' }}>
                {uploading ? 'Enviando...' : '+ Anexar'}
              </button>
              {uploadErr && <span style={{ fontSize:11, color:'#ef5350' }}>{uploadErr}</span>}
            </div>

            {/* Mensagens */}
            <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:10 }}>
              {msgs.length === 0 && (
                <div style={{ textAlign:'center', marginTop:40 }}>
                  <p style={{ color:'#5a5545', fontSize:13 }}>Nenhuma mensagem ainda.</p>
                  <p style={{ color:'#3a3a3a', fontSize:12, marginTop:4 }}>
                    {isLawyer ? 'Responda ao cliente abaixo.' : 'Envie sua primeira mensagem ao advogado.'}
                  </p>
                </div>
              )}
              {msgs.map(m => {
                const isMe = m.sender_id === user?.id
                return (
                  <div key={m.id} style={{ display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth:'72%', padding:'10px 14px',
                      background: isMe ? 'rgba(212,175,55,0.1)' : '#161616',
                      border: `1px solid ${isMe ? 'rgba(212,175,55,0.2)' : '#1e1e1e'}`,
                      borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    }}>
                      <div style={{ fontSize:13, color:'#f0ede6', lineHeight:1.5 }}>{m.message_text}</div>
                      <div style={{ fontSize:10, color:'#5a5545', marginTop:4, textAlign:'right' }}>
                        {m.sender_name} · {new Date(m.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMsg} style={{ padding:'14px 24px', borderTop:'1px solid #1a1a1a', display:'flex', gap:10, flexShrink:0 }}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={isLawyer ? 'Responder ao cliente...' : 'Mensagem para o advogado...'}
                style={{ flex:1, background:'#0a0a0a', border:'1px solid #2e2e2e', borderRadius:6, color:'#f0ede6', padding:'10px 14px', fontSize:14, outline:'none' }}
              />
              <button type="submit" disabled={sending || !text.trim()} style={{
                background: sending || !text.trim() ? '#333' : '#d4af37',
                color:'#080808', border:'none', borderRadius:6, padding:'10px 20px',
                fontSize:13, fontWeight:600, cursor: sending || !text.trim() ? 'not-allowed' : 'pointer',
              }}>
                {sending ? '...' : 'Enviar'}
              </button>
            </form>
          </div>
        ) : (
          <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ textAlign:'center' }}>
              <p style={{ color:'#5a5545', fontSize:14 }}>Selecione um caso para abrir o chat</p>
              {!isLawyer && (
                <Link to="/client/triagem" style={{ display:'inline-block', marginTop:16, background:'#d4af37', color:'#080808', padding:'10px 24px', borderRadius:6, textDecoration:'none', fontSize:13, fontWeight:600 }}>
                  Abrir primeiro relato
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}