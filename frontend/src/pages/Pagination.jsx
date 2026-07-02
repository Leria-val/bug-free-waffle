// src/components/Pagination.jsx
// Paginação reutilizável — controla uma página atual e emite onChange

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    // Mostra sempre a primeira, última, atual e vizinhas; "…" para o resto
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  const btnBase = {
    minWidth: 32, height: 32, padding: '0 8px', borderRadius: 6,
    border: '1px solid #2e2e2e', background: 'transparent',
    color: '#a09880', fontSize: 13, cursor: 'pointer',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 24, justifyContent: 'center' }}>
      <button
        style={{ ...btnBase, opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'not-allowed' : 'pointer' }}
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        ‹
      </button>

      {pages.map((p, idx) =>
        p === '…' ? (
          <span key={`dots-${idx}`} style={{ color: '#5a5545', fontSize: 13, padding: '0 4px' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              ...btnBase,
              background: p === page ? '#d4af37' : 'transparent',
              color: p === page ? '#080808' : '#a09880',
              fontWeight: p === page ? 600 : 400,
              borderColor: p === page ? '#d4af37' : '#2e2e2e',
            }}
          >
            {p}
          </button>
        )
      )}

      <button
        style={{ ...btnBase, opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </div>
  )
}