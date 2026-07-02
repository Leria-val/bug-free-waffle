// src/pages/BuscaAdvogados.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

const AREAS = [
  'Todas as áreas',
  'Direito Civil','Direito Criminal','Direito Trabalhista','Direito de Família',
  'Direito Empresarial','Direito Tributário','Direito Previdenciário',
  'Direito do Consumidor','Direito Imobiliário','Direito Digital',
]

// Dados mock — exibidos quando o backend não está disponível
const MOCK = [
  { id: '1', name: 'Dr. Ricardo Alves',  areas: ['Direito Civil','Direito Empresarial'],        bio: 'Especialista em contratos e litígios empresariais com mais de 12 anos de experiência.' },
  { id: '2', name: 'Dra. Ana Costa',     areas: ['Direito de Família','Direito Civil'],          bio: 'Atuação em divórcio, guarda de filhos e herança com abordagem humanizada.' },
  { id: '3', name: 'Dr. Paulo Mendes',   areas: ['Direito Criminal','Direito Digital'],          bio: 'Defesa criminal e crimes cibernéticos. Membro da Comissão de Direito Digital da OAB.' },
  { id: '4', name: 'Dra. Clara Rocha',   areas: ['Direito Trabalhista'],                        bio: 'Especialista em demissões, assédio e direitos do empregado.' },
  { id: '5', name: 'Dr. Henrique Lima',  areas: ['Direito Tributário','Direito Empresarial'],    bio: 'Planejamento tributário e recuperação de créditos fiscais.' },
]

export default function BuscaAdvogados() {
  const [advogados, setAdvogados] = useState([])   // lista completa
  const [area, setArea]           = useState('Todas as áreas')
  const [loading, setLoading]     = useState(true)
  const { isAuthenticated }       = useAuth()
  const navigate                  = useNavigate()

  useEffect(() => {
    api.get('/advogados')
      .then(r => {
        // Backend retorna { advogados: [...] } — fallback para arrays alternativos
        const lista = r.data.advogados || r.data.lawyers || r.data || []
        setAdvogados(Array.isArray(lista) ? lista : MOCK)
      })
      .catch(() => setAdvogados(MOCK))
      .finally(() => setLoading(false))
  }, [])

  // Filtragem local — sem chamada extra ao backend
  const filtered = area === 'Todas as áreas'
    ? advogados
    : advogados.filter(a => a.areas?.includes(area))

  const handleContact = () => {
    navigate(isAuthenticated ? '/client/triagem' : '/login', {
      state: { message: 'Faça login para ver o perfil completo e entrar em contato.' }
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808' }}>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent)', marginBottom: 16 }} />
          <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 36, color: '#f0ede6', marginBottom: 10 }}>
            Advogados disponíveis
          </h1>
          <p style={{ color: '#a09880', fontSize: 15 }}>
            Filtre por área de atuação e encontre o profissional certo para o seu caso.
          </p>
        </div>

        {/* Filtro */}
        <div style={{ marginBottom: 36, maxWidth: 340 }}>
          <label style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a09880', display: 'block', marginBottom: 8 }}>
            Área de atuação
          </label>
          <select
            value={area}
            onChange={e => setArea(e.target.value)}
            style={{ width: '100%', background: '#111', border: '1px solid #2e2e2e', borderRadius: 6, color: '#f0ede6', padding: '10px 14px', fontSize: 14, outline: 'none' }}
          >
            {AREAS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        {/* Estados */}
        {loading && (
          <p style={{ color: '#5a5545', fontSize: 13, letterSpacing: '0.08em' }}>CARREGANDO...</p>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 48, textAlign: 'center' }}>
            <p style={{ color: '#a09880' }}>Nenhum advogado encontrado para esta área no momento.</p>
          </div>
        )}

        {/* Grid de cards */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(adv => (
              <div key={adv.id} style={{ background: '#111', border: '1px solid #222', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Avatar + nome */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Georgia,serif', fontSize: 20, color: '#d4af37', flexShrink: 0,
                  }}>
                    {adv.name?.[0] || '?'}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, color: '#f0ede6' }}>{adv.name}</div>
                    <div style={{ fontSize: 11, color: '#5a5545', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Advogado · OAB/SP
                    </div>
                  </div>
                </div>

                {/* Badges de área */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(adv.areas || []).map(a => (
                    <span key={a} style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 500,
                      background: 'rgba(212,175,55,0.08)', color: '#d4af37',
                      border: '1px solid rgba(212,175,55,0.2)',
                    }}>{a}</span>
                  ))}
                </div>

                {/* Bio */}
                <p style={{ color: '#a09880', fontSize: 13, lineHeight: 1.6, flex: 1 }}>
                  {adv.bio || 'Advogado especializado com atuação no escritório Justiça & Direito.'}
                </p>

                <div style={{ height: 1, background: '#1e1e1e' }} />

                {/* CTA */}
                {!isAuthenticated ? (
                  <div>
                    <p style={{ fontSize: 12, color: '#5a5545', marginBottom: 10 }}>
                      Faça login para ver o perfil completo e entrar em contato.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to="/login" style={{ flex: 1, textAlign: 'center', background: '#d4af37', color: '#080808', padding: '9px 0', borderRadius: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                        Entrar
                      </Link>
                      <Link to="/register" style={{ flex: 1, textAlign: 'center', background: 'transparent', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)', padding: '9px 0', borderRadius: 6, textDecoration: 'none', fontSize: 12 }}>
                        Criar conta
                      </Link>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleContact} style={{ width: '100%', padding: '10px 0', background: '#d4af37', color: '#080808', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Entrar em contato
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}