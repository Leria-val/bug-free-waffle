// src/components/CryptoBadge.jsx
// Selo visual de criptografia ponta a ponta

export function CryptoBadge() {
  return (
    <div className="crypto-badge">
      Criptografia de Ponta a Ponta · AES-256
    </div>
  )
}

// src/components/Stepper.jsx
// Barra de progresso do status do processo
const STEPS = [
  { key: 'TRIAGEM',      label: 'Triagem'      },
  { key: 'ANALISE',      label: 'Análise'      },
  { key: 'EM_ANDAMENTO', label: 'Em andamento' },
  { key: 'CONCLUIDO',    label: 'Concluído'    },
]

export function Stepper({ currentStatus }) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStatus)

  return (
    <div className="stepper">
      {STEPS.map((step, i) => {
        const isDone   = i < currentIndex
        const isActive = i === currentIndex

        return (
          <div key={step.key} className={`step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
            {/* Linha conectora (exceto o primeiro) */}
            {i > 0 && <div className="step-line" style={{ right: '50%' }} />}

            <div className="step-dot">
              {isDone ? '✓' : i + 1}
            </div>
            <span className="step-label">{step.label}</span>
          </div>
        )
      })}
    </div>
  )
}