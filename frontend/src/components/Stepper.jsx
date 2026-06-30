// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CLIENT_LINKS = [
  { to: '/client/dashboard',  label: 'Meu Painel',    icon: '⊞' },
  { to: '/client/triagem',    label: 'Meu Caso',       icon: '📋' },
  { to: '/client/chat',       label: 'Chat Seguro',    icon: '💬' },
  { to: '/client/documentos', label: 'Arquivos',       icon: '📁' },
  { to: '/advogados',         label: 'Advogados',      icon: '⚖' },
]

const LAWYER_LINKS = [
  { to: '/lawyer/dashboard',   label: 'Painel',         icon: '⊞' },
  { to: '/lawyer/requisicoes', label: 'Requisições',    icon: '📬' },
  { to: '/lawyer/casos',       label: 'Meus Casos',     icon: '📋' },
  { to: '/lawyer/chat',        label: 'Chat Seguro',    icon: '💬' },
  { to: '/lawyer/arquivos',    label: 'Arquivos',       icon: '📁' },
]

const ADMIN_LINKS = [
  { to: '/admin',              label: 'Painel Admin',   icon: '⊞' },
  { to: '/admin/usuarios',     label: 'Usuários',       icon: '👤' },
  { to: '/admin/casos',        label: 'Todos os Casos', icon: '📋' },
  { to: '/admin/relatorio',    label: 'Relatório',      icon: '📊' },
]

export default function Sidebar() {
  const { isClient, isLawyer, isAdmin } = useAuth()
  const links = isAdmin ? ADMIN_LINKS : isLawyer ? LAWYER_LINKS : CLIENT_LINKS

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      borderRight: '1px solid var(--border)',
      padding: '32px 0',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 24px',
            fontSize: 13,
            color: isActive ? 'var(--gold)' : 'var(--text-2)',
            background: isActive ? 'rgba(201,168,76,0.07)' : 'transparent',
            borderRight: isActive ? '2px solid var(--gold)' : '2px solid transparent',
            textDecoration: 'none',
            transition: 'all var(--transition)',
            letterSpacing: '0.02em',
          })}
        >
          <span style={{ fontSize: 14 }}>{icon}</span>
          {label}
        </NavLink>
      ))}
    </aside>
  )
}