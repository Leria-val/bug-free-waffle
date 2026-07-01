// src/components/Stepper.jsx
// Barra de progresso do status do processo.
// Usado tanto no painel do advogado (clicável, muda status)
// quanto no painel do cliente (somente leitura).

const LABELS = {
  TRIAGEM:      'Triagem',
  ANALISE:      'Em Análise',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO:    'Concluído',
  ARQUIVADO:    'Arquivado',
}

function Stepper({ steps, current, onChange, disabled }) {
  const currentIndex = steps.indexOf(current)

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      {steps.map((step, i) => {
        const isDone    = i < currentIndex
        const isActive  = i === currentIndex
        const isFuture  = i > currentIndex
        const clickable = typeof onChange === 'function' && !disabled

        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onChange(step)}
              title={LABELS[step] || step}
              style={{
                width: 28, height: 28, borderRadius: '50%',
                border: `2px solid ${isDone || isActive ? 'var(--gold, #d4af37)' : 'var(--border, #2e2e2e)'}`,
                background: isDone ? 'var(--gold, #d4af37)' : isActive ? 'rgba(212,175,55,0.15)' : 'transparent',
                color: isDone ? '#080808' : isActive ? 'var(--gold, #d4af37)' : 'var(--text-3, #5a5545)',
                fontSize: 11, fontWeight: 600,
                cursor: clickable ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s ease',
              }}
            >
              {isDone ? '✓' : i + 1}
            </button>

            <span style={{
              marginLeft: 6, marginRight: i < steps.length - 1 ? 6 : 0,
              fontSize: 11, whiteSpace: 'nowrap',
              color: isActive ? 'var(--gold, #d4af37)' : isDone ? 'var(--text-1, #f0ede6)' : 'var(--text-3, #5a5545)',
              fontWeight: isActive ? 600 : 400,
            }}>
              {LABELS[step] || step}
            </span>

            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 16,
                background: isDone ? 'var(--gold, #d4af37)' : 'var(--border, #2e2e2e)',
                transition: 'background 0.2s ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
-e

export { Stepper }
export default Stepper