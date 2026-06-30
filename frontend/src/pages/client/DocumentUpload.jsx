// src/pages/client/DocumentUpload.jsx
import { useState, useEffect, useRef } from 'react'
import Navbar from '../../components/Navbar.jsx'
import Sidebar from '../../components/Sidebar.jsx'
import { CryptoBadge } from '../../components/CryptoBadge.jsx'
import { useApi } from '../../hooks/useApi.js'
import api from '../../services/api.js'


export default function DocumentUpload() {
  const [cases, setCases]       = useState([])
  const [selectedCase, setCase] = useState('')
  const [docs, setDocs]         = useState([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg]           = useState(null)
  const { get }                 = useApi()
  const fileRef                 = useRef()

  useEffect(() => {
    get('/casos').then(r => { if (r.ok) setCases(r.data.cases) })
  }, [])

  useEffect(() => {
    if (!selectedCase) return
    get(`/casos/${selectedCase}/documentos`).then(r => { if (r.ok) setDocs(r.data.documents) })
  }, [selectedCase])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedCase) return
    setUploading(true)
    setMsg(null)
    try {
      const form = new FormData()
      form.append('file', file)
      await api.post(`/casos/${selectedCase}/documentos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setMsg({ type: 'success', text: `"${file.name}" enviado com sucesso.` })
      // Recarrega lista
      get(`/casos/${selectedCase}/documentos`).then(r => { if (r.ok) setDocs(r.data.documents) })
    } catch {
      setMsg({ type: 'error', text: 'Erro ao enviar o arquivo. Tente novamente.' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const fmtSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`
    return `${(bytes/(1024*1024)).toFixed(1)} MB`
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <div style={{ display:'flex', flex:1 }}>
        <Sidebar />
        <main style={{ flex:1, padding:'40px 48px', overflowY:'auto' }}>
          <div style={{ maxWidth: 600 }}>
            <div style={{ marginBottom: 32 }}>
              <div className="divider-gold" style={{ marginBottom: 16 }} />
              <h1 style={{ fontFamily:'var(--font-display)', fontSize: 30, marginBottom: 10 }}>
                Documentos confidenciais
              </h1>
              <CryptoBadge />
            </div>

            <div className="card" style={{ display:'flex', flexDirection:'column', gap: 20 }}>
              {/* Selecionar caso */}
              <div className="form-group">
                <label className="form-label">Selecionar caso</label>
                <select className="form-select" value={selectedCase} onChange={e => setCase(e.target.value)}>
                  <option value="">— Escolha um caso —</option>
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>{c.title_area} · {new Date(c.created_at).toLocaleDateString('pt-BR')}</option>
                  ))}
                </select>
              </div>

              {/* Upload */}
              {selectedCase && (
                <>
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: '1.5px dashed var(--border-mid)',
                      borderRadius: 'var(--radius-md)',
                      padding: '32px 24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold-dim)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-mid)'}
                  >
                    <div style={{ fontSize: 28, marginBottom: 10 }}>📎</div>
                    <p style={{ color:'var(--text-2)', fontSize: 14 }}>
                      {uploading ? 'Enviando...' : 'Clique para selecionar PDF ou imagem'}
                    </p>
                    <p style={{ color:'var(--text-3)', fontSize: 12, marginTop: 6 }}>Máximo 50MB</p>
                    <input ref={fileRef} type="file" accept=".pdf,image/*" onChange={handleUpload} style={{ display:'none' }} />
                  </div>

                  {msg && (
                    <div className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}>
                      {msg.text}
                    </div>
                  )}

                  {/* Lista de documentos */}
                  {docs.length > 0 && (
                    <div>
                      <div className="form-label" style={{ marginBottom: 12 }}>Arquivos enviados</div>
                      {docs.map(d => (
                        <div key={d.id} style={{
                          display:'flex', justifyContent:'space-between', alignItems:'center',
                          padding: '10px 14px', background:'var(--bg-2)',
                          borderRadius:'var(--radius-sm)', marginBottom: 8,
                          border:'1px solid var(--border)',
                        }}>
                          <div>
                            <div style={{ fontSize: 13, color:'var(--text-1)' }}>📄 {d.file_name}</div>
                            <div style={{ fontSize: 11, color:'var(--text-3)' }}>
                              {fmtSize(d.file_size)} · {new Date(d.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </div>
                          <span className="badge badge-green" style={{ fontSize: 10 }}>Enviado</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}