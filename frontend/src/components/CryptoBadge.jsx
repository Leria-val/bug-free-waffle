// src/components/CryptoBadge.jsx
// Selo visual "Criptografia de Ponta a Ponta"

export function CryptoBadge() {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      background: 'rgba(212, 175, 55, 0.08)',
      border: '1px solid rgba(212, 175, 55, 0.25)',
      borderRadius: 20,
      fontSize: 11,
      color: '#d4af37',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
    }}>
      <span>🔒</span>
      <span>Criptografia de Ponta a Ponta · AES-256</span>
    </div>
  )
}

export default CryptoBadge