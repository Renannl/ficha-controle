import { OPERACOES, OPERACAO_KEYS } from "../../data/fichaTemplate";
import { PAINEL_LABELS, PAINEL_KEYS } from "../../data/painelTemplates";

export default function InfoPlanningSection({
  ficha,
  handle,
  operacaoAtual,
  onOperacaoChange,
  onTipoPainelChange,
}) {
  const isEstrutura = String(ficha.operacao) === "10";

  return (
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
            <input
              type="date"
              value={ficha.dataInicio}
              onChange={handle("dataInicio")}
            />
          </div>

          <div className="field">
            <label>Data de Término</label>
            <input
              type="date"
              value={ficha.dataTermino}
              onChange={handle("dataTermino")}
            />
          </div>
        </div>

        <div className="form-grid form-grid-2">
          <div className="field">
            <label>Tempo Previsto</label>
            <input
              value={ficha.tempoPrevisto}
              onChange={handle("tempoPrevisto")}
              placeholder="7 Dias"
            />
          </div>

          <div className="field">
            <label>Recurso</label>
            <input
              value={ficha.recurso}
              onChange={handle("recurso")}
              placeholder="2 Pessoas"
            />
          </div>
        </div>

        <div className="field">
          <label>Operação</label>
          <select
            value={ficha.operacao}
            onChange={(e) => onOperacaoChange(e.target.value)}
          >
            {OPERACAO_KEYS.map((key) => (
              <option key={key} value={key}>
                {OPERACOES[key].label}
              </option>
            ))}
          </select>
        </div>

        {isEstrutura && (
          <div className="field">
            <label>Tipo de Painel</label>
            <select
              value={ficha.tipoPainel || ""}
              onChange={(e) => onTipoPainelChange(e.target.value)}
            >
              <option value="" disabled>
                Selecione o tipo de painel
              </option>
              {PAINEL_KEYS.map((key) => (
                <option key={key} value={key}>
                  {PAINEL_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="field">
          <label>Equipe</label>

          <div className="auto-filled-value">
            <span className="auto-tag">Auto</span>
            {operacaoAtual?.equipe || ficha.equipe}
          </div>
        </div>

        <div className="field">
          <label>Colaboradores</label>

          <input
            value={ficha.colaboradores}
            onChange={handle("colaboradores")}
            placeholder="Nomes dos colaboradores"
          />
        </div>

        <div className="field">
          <label>Objetivo</label>

          <div className="auto-filled-value">
            <span className="auto-tag">Auto</span>
            {operacaoAtual?.objetivo || ficha.objetivo}
          </div>
        </div>
      </div>
    </div>
  );
}
