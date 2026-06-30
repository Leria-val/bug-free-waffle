// src/pages/BuscaAdvogados.jsx
// Página pública — filtra advogados por área, mostra prévia dos cards
// Para ver perfil completo e entrar em contato → login obrigatório

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

const AREAS = [
  'Todas as áreas',
  'Direito Civil',
  'Direito Criminal',
  'Direito Trabalhista',
  'Direito de Família',
  'Direito Empresarial',
  'Direito Tributário',
  'Direito Previdenciário',
  'Direito do Consumidor',
  'Direito Imobiliário',
  'Direito Digital',
]

export default function BuscaAdvogados() {
  const [advogados, setAdvogados] = useState([])
  const [filtered, setFiltered]   = useState([])
  const [area, setArea]           = useState('Todas as áreas')
  const [loading, setLoading]     = useState(true)
  const { isAuthenticated }       = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/advogados')
      .then(r => { setAdvogados(r.data.lawyers); setFiltered(r.data.lawyers) })
      .catch(() => {
        // Dados mock para demonstração quando a API não está disponível
        const mock = [
          { id: '1', name: 'Dr. Ricardo Alves',  areas: ['Direito Civil', 'Direito Empresarial'], bio: 'Especialista em contratos e litígios empresariais com mais de 12 anos de experiência.' },
          { id: '2', name: 'Dra. Ana Costa',     areas: ['Direito de Família', 'Direito Civil'],  bio: 'Atuação em divórcio, guarda de filhos e processos de herança com abordagem humanizada.' },
          { id: '3', name: 'Dr. Paulo Mendes',   areas: ['Direito Criminal', 'Direito Digital'],  bio: 'Defesa criminal e casos de crimes cibernéticos. Membro da Comissão de Direito Digital da OAB.' },
          { id: '4', name: 'Dra. Clara Rocha',   areas: ['Direito Trabalhista'],                  bio: 'Especialista em direito do trabalho, demissões, assédio e direitos do empregado.' },
          { id: '5', name: 'Dr. Henrique Lima',  areas: ['Direito Tributário', 'Direito Empresarial'], bio: 'Planejamento tributário e recuperação de créditos fiscais para pessoas físicas e jurídicas.' },
        ]
        setAdvogados(mock)
        setFiltered(mock)
      })
      .finally(() => setLoading(false))
  }, [])

  // Filtra por área quando o select muda
  useEffect(() => {
    if (area === 'Todas as áreas') {
      setFiltered(advogados)
    } else {
      setFiltered(advogados.filter(a => a.areas?.includes(area)))
    }
  }, [area, advogados])

  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Faça login para ver o perfil completo e entrar em contato.' } })
    } else {
      navigate('/client/triagem')
    }
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="container" style={{ padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div className="divider-gold" style={{ marginBottom: 16 }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, marginBottom: 10 }}>
            Advogados disponíveis
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
            Filtre por área de atuação e encontre o profissional certo para o seu caso.
          </p>
        </div>

        {/* Filtro */}
        <div style={{ marginBottom: 36, maxWidth: 340 }}>
          <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
            Área de atuação
          </label>
          <select
            className="form-select"
            value={area}
            onChange={e => setArea(e.target.value)}
          >
            {AREAS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>

        {/* Grid de cards */}
        {loading ? (
          <p className="text-muted" style={{ fontSize: 13, letterSpacing: '0.08em' }}>
            CARREGANDO...
          </p>
        ) : filtered.length === 0 ? (
          <div className="card-sm" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ color: 'var(--text-2)' }}>
              Nenhum advogado encontrado para esta área no momento.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {filtered.map(adv => (
              <div key={adv.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Avatar + nome */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid var(--border-mid)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--gold)',
                  }}>
                    {adv.name[0]}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{adv.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Advogado · OAB/SP
                    </div>
                  </div>
                </div>

                {/* Áreas (badges) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {adv.areas?.map(a => (
                    <span key={a} className="badge badge-gold" style={{ fontSize: 10 }}>{a}</span>
                  ))}
                </div>

                {/* Bio — prévia, sem informações de contato */}
                <p style={{ color: 'var(--text-2)', fontSize: 13, lineHeight: 1.6 }}>
                  {adv.bio}
                </p>

                <div className="divider" />

                {/* CTA — login para ver mais */}
                {!isAuthenticated ? (
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
                      Faça login para ver o perfil completo e entrar em contato.
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to="/login" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '9px 0', fontSize: 12 }}>
                        Entrar
                      </Link>
                      <Link to="/register" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', padding: '9px 0', fontSize: 12 }}>
                        Criar conta
                      </Link>
                    </div>
                  </div>
                ) : (
                  <button onClick={handleContact} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
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