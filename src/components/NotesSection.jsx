import { NOTA_DOCUMENTOS } from '../data/fichaTemplate'

export default function NotesSection({ ficha, observacoes, onChange, onChangeAlteracoes, isFoto, onFinalizar }) {
  return (
    <div className="notes-section">
      <div className="card">
        <div className="section-header">
          <div className="section-icon">📝</div>
          <div>
            <h2>Observações</h2>
            <p>Anotações gerais sobre a execução</p>
          </div>
        </div>

        {/* Nota fixa de documentos */}
        <div className="notes-info">
          <strong style={{ color: 'var(--amber)' }}>⚠ Nota:</strong> {NOTA_DOCUMENTOS}
        </div>

        {/* Motivo da Reprovação (se houver) */}
        {ficha?.statusAprovacao === 'reprovado' && ficha?.motivoReprovacao && (
          <div className="rejection-note" style={{ background: 'var(--red-glow)', borderLeft: '4px solid var(--red)', padding: '16px', borderRadius: '4px', marginBottom: '16px' }}>
            <h4 style={{ color: 'var(--red)', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>⚠️ Motivo da Reprovação</h4>
            <p style={{ color: 'var(--red)', fontSize: '13px', whiteSpace: 'pre-wrap' }}>{ficha.motivoReprovacao}</p>
          </div>
        )}

        {/* Container de observações */}
        <div style={{ display: 'flex', gap: '20px', flexDirection: (ficha?.status === 'finalizada' || ficha?.statusAprovacao === 'reprovado') ? 'row' : 'column' }}>
          
          {/* Campo de observações (Original) */}
          <div className="field" style={{ flex: 1 }}>
            <label>Observações Gerais</label>
            <textarea
              value={observacoes}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Adicione observações sobre a execução, pendências, ocorrências..."
              rows={6}
            />
            <p className="text-xs text-muted mt-2" style={{ fontStyle: 'italic' }}>
              No mais anotar no verso.
            </p>
          </div>

          {/* Campo de Alterações (Apenas para edições pós-finalização ou rejeição) */}
          {(ficha?.status === 'finalizada' || ficha?.statusAprovacao === 'reprovado') && (
            <div className="field" style={{ flex: 1 }}>
              <label>
                Alterações Feitas 
                <span style={{ color: 'var(--amber)', marginLeft: '4px', fontStyle: 'italic' }}>*Obrigatório</span>
              </label>
              <textarea
                value={ficha.alteracoesFeitas || ''}
                onChange={(e) => onChangeAlteracoes(e.target.value)}
                placeholder="Exemplo: 'Corrigido número de série do instrumento X', 'Ajustada tensão de teste no painel', etc..."
                rows={6}
                style={{ borderColor: (!ficha.alteracoesFeitas || !ficha.alteracoesFeitas.trim()) ? 'var(--amber)' : '' }}
              />
              <p className="text-xs text-muted mt-2" style={{ fontStyle: 'italic', color: 'var(--amber)' }}>
                Esta ficha já estava finalizada. Justifique as edições recentes.
              </p>
            </div>
          )}

        </div>

        {isFoto && onFinalizar && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-primary w-full text-lg" onClick={onFinalizar}>
              Finalizar e Gerar PDF
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
