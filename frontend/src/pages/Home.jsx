// src/pages/Home.jsx
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

export default function Home() {
  return (
    <div className="page-wrapper">
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '96px 0 80px', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="divider-gold" style={{ margin: '0 auto 28px' }} />
          <h1 className="display" style={{ fontSize: 52, color: 'var(--text-1)', marginBottom: 20 }}>
            Advocacia com<br />
            <span style={{ color: 'var(--gold)' }}>discrição absoluta.</span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 17, lineHeight: 1.7, marginBottom: 40 }}>
            Atendimento confidencial para casos sigilosos.<br />
            Encontre o advogado certo para sua situação — sem redes sociais, sem exposição.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/advogados" className="btn btn-primary" style={{ padding: '13px 32px', fontSize: 13 }}>
              Encontrar Advogado
            </Link>
            <Link to="/register" className="btn btn-outline" style={{ padding: '13px 32px', fontSize: 13 }}>
              Criar Conta de Cliente
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '🔒', title: 'Sigilo Garantido', desc: 'Todos os relatos são criptografados com AES-256 antes de serem armazenados.' },
              { icon: '⚖', title: 'Advogados Verificados', desc: 'Apenas profissionais com credenciais da firma acessam o sistema interno.' },
              { icon: '📋', title: 'Acompanhamento em Tempo Real', desc: 'Visualize o status do seu processo e comunique-se com seu advogado de forma segura.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card-sm" style={{ textAlign: 'center', padding: '32px 24px' }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 10 }}>{title}</h3>
                <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '72px 0', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 540 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text-1)', marginBottom: 24, fontStyle: 'italic' }}>
            "Seu caso é confidencial.<br />Nosso compromisso também."
          </p>
          <Link to="/advogados" className="btn btn-primary">
            Ver Advogados Disponíveis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 0', marginTop: 'auto' }}>
        <div className="container" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-3)', letterSpacing:'0.08em' }}>
            JUSTIÇA & DIREITO
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Portal Confidencial · Todos os direitos reservados
          </span>
        </div>
      </footer>
    </div>
  )
}