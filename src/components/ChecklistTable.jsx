import { useState } from 'react'

export default function ChecklistTable({
  ficha,
  checklistItems,
  onToggleMark,
  onSetResultado,
  isTaf = false,
  tafData,
  onUpdateTaf
}) {
  const [expandedId, setExpandedId] = useState(null)

  const totalItems = ficha.items.length
  const doneItems = ficha.items.filter(i => i.resultado === 'ok' || i.resultado === 'na').length
  const pct = Math.round((doneItems / totalItems) * 100)

  function toggleExpand(id) {
    if (isTaf) return // Não expande sessões no TAF
    setExpandedId(prev => prev === id ? null : id)
  }

  function handleResultado(index, value) {
    const current = ficha.items[index].resultado
    onSetResultado(index, current === value ? '' : value)
  }

  return (
    <div className="checklist-wrap">
      {isTaf && (
        <div className="taf-section-title flex justify-between items-center" style={{ margin: '0 0 16px' }}>
          <span>TESTES FUNCIONAIS E VISUAIS</span>
          <div className="flex gap-4">
            <label className="flex items-center gap-1 font-bold text-[10px] cursor-pointer">
              <input 
                type="checkbox" 
                checked={!tafData.functionalNotApplicable} 
                onChange={e => onUpdateTaf({ functionalNotApplicable: !e.target.checked })} 
              /> Aplicável
            </label>
            <label className="flex items-center gap-1 font-bold text-[10px] cursor-pointer">
              <input 
                type="checkbox" 
                checked={tafData.functionalNotApplicable} 
                onChange={e => onUpdateTaf({ functionalNotApplicable: e.target.checked })} 
              /> Não Aplicável
            </label>
          </div>
        </div>
      )}
      {/* Summary */}
      <div className="checklist-summary">
        <span className="summary-text">{doneItems}/{totalItems} itens</span>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="summary-text">{pct}%</span>
      </div>

      {/* Items */}
      {ficha.items.map((item, index) => {
        const template = checklistItems.find(c => c.id === item.id)
        const isExpanded = !isTaf && expandedId === item.id

        return (
          <div
            key={item.id}
            className={`checklist-item ${isExpanded ? 'expanded' : ''}`}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            {/* Item header */}
            <div className="checklist-item-header" onClick={() => toggleExpand(item.id)}>
              <div className="checklist-item-number">{item.id}</div>
              <div className="checklist-item-desc">{template?.descricao}</div>
              <div className="checklist-item-status">
                <div className="resultado-btns">
                  <button
                    className={`resultado-btn ${item.resultado === 'ok' ? 'ok-active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleResultado(index, 'ok') }}
                  >
                    {isTaf ? 'C' : 'OK'}
                  </button>
                  <button
                    className={`resultado-btn ${item.resultado === 'na' ? 'na-active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleResultado(index, 'na') }}
                  >
                    {isTaf ? 'NC' : 'NA'}
                  </button>
                </div>
              </div>
              {!isTaf && <span className={`expand-arrow ${isExpanded ? 'open' : ''}`}>▼</span>}
            </div>

            {/* Expanded: session marks */}
            {isExpanded && (
              <div className="checklist-item-sessions">
                <div className="text-xs font-semibold text-secondary mb-2">
                  Sessões de Trabalho (toque para marcar ✔)
                </div>
                <div className="sessions-grid">
                  {item.sessionMarks.map((mark, sIdx) => (
                    <button
                      key={sIdx}
                      className={`session-mark ${mark === 'feito' ? 'mark-feito' : ''} ${mark === 'na' ? 'mark-na' : ''}`}
                      onClick={() => onToggleMark(index, sIdx, mark === 'feito' ? '' : 'feito')}
                      onContextMenu={(e) => { e.preventDefault(); onToggleMark(index, sIdx, mark === 'na' ? '' : 'na') }}
                      title={`Sessão ${sIdx + 1}: toque = ✔ | segure/clique-direito = NA`}
                    >
                      <span className="mark-number">{sIdx + 1}ª</span>
                      {mark === 'feito' && '✔'}
                      {mark === 'na' && '—'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
