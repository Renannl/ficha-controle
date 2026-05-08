import { OPERACOES, OPERACAO_KEYS } from '../data/fichaTemplate'

export default function InfoCard({ ficha, onChange, onOperacaoChange }) {
  function handle(field) {
    return (e) => onChange(field, e.target.value)
  }

  const operacaoAtual = OPERACOES[ficha.operacao]

  return (
    <div className="info-section">
      {/* Identificação do Documento */}
      <div className="card mb-3">
        <div className="section-header">
          <div className="section-icon">📄</div>
          <div>
            <h2>Identificação do Documento</h2>
            <p>Código, folha e revisão</p>
          </div>
        </div>
        <div className="form-grid form-grid-3">
          <div className="field">
            <label>Código</label>
            <input disabled value={ficha.codigo} onChange={handle('codigo')} placeholder="PRO-001" />
          </div>
          <div className="field">
            <label>Folha</label>
            <input onChange={handle('folha')} placeholder="1/1" />
          </div>
          <div className="field">
            <label>Revisão</label>
            <input onChange={handle('revisao')} placeholder="01" />
          </div>
        </div>
      </div>

      {/* Equipamento */}
      <div className="card mb-3">
        <div className="section-header">
          <div className="section-icon">⚙️</div>
          <div>
            <h2>Dados do Equipamento</h2>
            <p>Identificação e localização</p>
          </div>
        </div>
        <div className="form-grid gap-3">
          <div className="field">
            <label>Nome do Equipamento</label>
            <input value={ficha.nomeEquipamento} onChange={handle('nomeEquipamento')} placeholder="Ex: Quadro de Transferência Automática" />
          </div>
          <div className="form-grid form-grid-2">
            <div className="field">
              <label>Nº do Ind.</label>
              <input value={ficha.nrInd} onChange={handle('nrInd')} placeholder="10110-01" />
            </div>
            <div className="field">
              <label>QTD</label>
              <input value={ficha.qtd} onChange={handle('qtd')} placeholder="1" />
            </div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="field">
              <label>Obra</label>
              <input value={ficha.obra} onChange={handle('obra')} placeholder="UVB Marca" />
            </div>
            <div className="field">
              <label>TAG</label>
              <input value={ficha.tag} onChange={handle('tag')} placeholder="QTA" />
            </div>
          </div>
          <div className="field">
            <label>Cliente</label>
            <input value={ficha.cliente} onChange={handle('cliente')} placeholder="Marca Ambiental" />
          </div>
        </div>
      </div>

      {/* Planejamento */}
      <div className="card mb-3">
        <div className="section-header">
          <div className="section-icon">📅</div>
          <div>
            <h2>Planejamento</h2>
            <p>Datas, recursos e equipe</p>
          </div>
        </div>
        <div className="form-grid gap-3">
          <div className="form-grid form-grid-2">
            <div className="field">
              <label>Data de Início</label>
              <input type="date" value={ficha.dataInicio} onChange={handle('dataInicio')} />
            </div>
            <div className="field">
              <label>Data de Término</label>
              <input type="date" value={ficha.dataTermino} onChange={handle('dataTermino')} />
            </div>
          </div>
          <div className="form-grid form-grid-2">
            <div className="field">
              <label>Tempo Previsto</label>
              <input value={ficha.tempoPrevisto} onChange={handle('tempoPrevisto')} placeholder="7 Dias" />
            </div>
            <div className="field">
              <label>Recurso</label>
              <input value={ficha.recurso} onChange={handle('recurso')} placeholder="2 Pessoas" />
            </div>
          </div>

          {/* ─── Operação (Menu Suspenso) ─── */}
          <div className="field">
            <label>Operação</label>
            <select
              value={ficha.operacao}
              onChange={(e) => onOperacaoChange(e.target.value)}
            >
              {OPERACAO_KEYS.map(key => (
                <option key={key} value={key}>
                  {OPERACOES[key].label}
                </option>
              ))}
            </select>
          </div>

          {/* Equipe (auto-preenchido pela operação) */}
          <div className="field">
            <label>Equipe</label>
            <div className="auto-filled-value">
              <span className="auto-tag">Auto</span>
              {operacaoAtual?.equipe || ficha.equipe}
            </div>
          </div>

          <div className="field">
            <label>Colaboradores</label>
            <input value={ficha.colaboradores} onChange={handle('colaboradores')} placeholder="Nomes dos colaboradores" />
          </div>

          {/* Objetivo (auto-preenchido pela operação) */}
          <div className="field">
            <label>Objetivo</label>
            <div className="auto-filled-value">
              <span className="auto-tag">Auto</span>
              {operacaoAtual?.objetivo || ficha.objetivo}
            </div>
          </div>
        </div>
      </div>

      {/* Aviso de operação */}
      <div className="operation-info-banner">
        <span className="operation-info-icon">ℹ️</span>
        <span>
          Ao trocar a <strong>Operação</strong>, o checklist, equipe e objetivo
          serão atualizados automaticamente. O progresso anterior será reiniciado.
        </span>
      </div>
    </div>
  )
}
