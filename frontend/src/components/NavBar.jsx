// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LABEL = { ADMIN: 'Administrador', LAWYER: 'Advogado', CLIENT: 'Cliente' }
const ROLE_HOME  = { ADMIN: '/admin', LAWYER: '/lawyer/dashboard', CLIENT: '/client/dashboard' }

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,11,0.92)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height: 60 }}>

        {/* Logo */}
        <Link to="/" style={{ display:'flex', flexDirection:'column', gap: 1, textDecoration:'none' }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600,
            color: 'var(--gold)', letterSpacing: '0.08em',
          }}>
            JUSTIÇA & DIREITO
          </span>
          <span style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-3)', textTransform:'uppercase' }}>
            Escritório de Advocacia
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display:'flex', alignItems:'center', gap: 28 }}>
          {!isAuthenticated && (
            <>
              <Link to="/advogados" style={{ fontSize: 13, color: 'var(--text-2)', letterSpacing:'0.04em' }}>
                Advogados
              </Link>
              <Link to="/login" className="btn btn-outline" style={{ padding: '7px 18px', fontSize: 12 }}>
                Entrar
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '7px 18px', fontSize: 12 }}>
                Criar conta
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link
                to={ROLE_HOME[user.role]}
                style={{ fontSize: 13, color: 'var(--text-2)', letterSpacing:'0.04em' }}
              >
                Painel
              </Link>
              <div style={{ display:'flex', alignItems:'center', gap: 12 }}>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-1)' }}>{user.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing:'0.1em', textTransform:'uppercase' }}>
                    {ROLE_LABEL[user.role]}
                  </div>
                </div>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(201,168,76,0.12)',
                  border: '1px solid var(--border-mid)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--gold)',
                }}>
                  {user.name[0].toUpperCase()}
                </div>
                <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }}>
                  Sair
                </button>
              </div>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}