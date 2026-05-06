import { OPERACOES } from '../data/fichaTemplate'

export default function Header({ ficha, user, progress, onBack, onApprove }) {
  const opLabel = OPERACOES[ficha.operacao]?.label || ficha.operacao

  function handlePrint() {
    window.print()
  }

  return (
    <header className="top-header">
      <button className="back-btn" onClick={onBack} title="Voltar">
        ←
      </button>
      <div className="header-info-wrap">
        <img src="/ip.png" alt="Logo" className="header-logo" />
        <div className="header-info">
          <div className="header-title">
            {ficha.nomeEquipamento || 'Nova Ficha'}
          </div>
          <div className="header-sub">
            {ficha.codigo} · {opLabel}
          </div>
        </div>
      </div>
      
      <div className="header-actions">
        {/* Lógica de Botões de Aprovação na Interface Principal da Ficha */}
        {ficha.status === 'finalizada' && (
          <div className="approval-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px' }}>
            {/* Status atual visível */}
            {ficha.statusAprovacao === 'aprovado' && <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--green)', marginRight: '8px' }}>APROVADO ✓</span>}
            {ficha.statusAprovacao === 'reprovado' && <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--red)', marginRight: '8px' }}>REPROVADO ✗</span>}
            
            {/* Botões de Ação para Privilegiados */}
            {user?.permissions?.includes('aprovar') && ficha.statusAprovacao !== 'aprovado' && (
              <button onClick={() => onApprove('aprovado')} className="btn" style={{ background: 'var(--green)', color: '#fff', border: 'none', padding: '6px 14px', fontSize: '12px', borderRadius: '4px', fontWeight: 'bold' }}>
                Aprovar
              </button>
            )}
            {user?.permissions?.includes('rejeitar') && ficha.statusAprovacao !== 'reprovado' && (
              <button onClick={() => onApprove('reprovado')} className="btn" style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '6px 14px', fontSize: '12px', borderRadius: '4px', fontWeight: 'bold' }}>
                Rejeitar
              </button>
            )}
          </div>
        )}

        <div className="header-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>
      </div>
    </header>
  )
}
