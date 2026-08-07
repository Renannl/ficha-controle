import PrintHeader from "./PrintHeader";
import { OPERACOES, NOTA_DOCUMENTOS } from "../../data/fichaTemplate";
import { getPainelChecklistItems } from "../../data/painelTemplates";

export default function PrintViewOperacao({ ficha, isBook = false }) {
  const op = OPERACOES[ficha.operacao];
  const isPainel = String(ficha.operacao) === "10" && !!ficha.tipoPainel;

  const templateItems = isPainel
    ? getPainelChecklistItems(ficha.tipoPainel, { incluirVerificacao: false })
    : op?.items || [];

  const totalDataCols = isPainel ? 2 : 17;

  return (
    <div className={`print-view-root ${isBook ? "book-mode" : "print-only"}`}>
      {/* CABEÇALHO DA FICHA */}
      <PrintHeader ficha={ficha} />

      {/* DADOS DO EQUIPAMENTO */}
      <div className="print-section-title">DADOS DO EQUIPAMENTO</div>
      <table className="print-info-table">
        <tbody>
          <tr>
            <td colSpan="2">
              <strong>Nome do Equipamento:</strong> {ficha.nomeEquipamento}
            </td>
            <td colSpan="2">
              <strong>Nº do Ind.:</strong> {ficha.numeroInd}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Obra:</strong> {ficha.obra}
            </td>
            <td>
              <strong>TAG:</strong> {ficha.tag}
            </td>
            <td colSpan="2">
              <strong>Cliente:</strong> {ficha.cliente}
            </td>
          </tr>
        </tbody>
      </table>

      {/* PLANEJAMENTO */}
      <div className="print-section-title">PLANEJAMENTO</div>
      <table className="print-info-table">
        <tbody>
          <tr>
            <td colSpan="2">
              <strong>Operação:</strong> {op?.label || "Operação não definida"}
            </td>
            <td colSpan="2">
              <strong>Equipe:</strong> {op?.equipe || "—"}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Data Início:</strong> {ficha.dataInicio}
            </td>
            <td>
              <strong>Data Término:</strong> {ficha.dataTermino}
            </td>
            <td>
              <strong>Tempo Previsto:</strong> {ficha.tempoPrevisto}
            </td>
            <td>
              <strong>Recurso:</strong> {ficha.recurso}
            </td>
          </tr>
          <tr>
            <td colSpan="4">
              <strong>Colaboradores:</strong> {ficha.colaboradores}
            </td>
          </tr>
        </tbody>
      </table>

      {/* CHECKLIST TABLE */}
      {!isPainel && (
        <div className="print-checklist-group-label">
          SESSÕES DE TRABALHO (1ª a 15ª)
        </div>
      )}
      <div className="print-checklist-container">
        <table
          className={`print-checklist-table ${isPainel ? "no-sessions" : ""}`}
        >
          <colgroup>
            <col className="col-it" />
            <col className="col-desc" />
            {!isPainel &&
              [...Array(15)].map((_, i) => (
                <col key={i} className="col-sessions" />
              ))}
            <col className="col-result" />
            <col className="col-result" />
          </colgroup>

          <thead>
            <tr className="main-header">
              <th className="col-it">IT</th>
              <th className="col-desc">DESCRIÇÃO</th>

              {!isPainel &&
                [...Array(15)].map((_, i) => (
                  <th key={i} className="mark-cell">
                    {i + 1}º
                  </th>
                ))}

              <th className="res-cell">OK</th>
              <th className="res-cell">NA</th>
            </tr>
          </thead>

          <tbody>
            {(() => {
              let categoriaAtual = null;
              const rows = [];

              templateItems.forEach((item) => {
                const isFirstOfSection = item.categoria !== categoriaAtual;

                if (isFirstOfSection) {
                  categoriaAtual = item.categoria;
                  const isBarramento = /barramento/i.test(categoriaAtual);

                  rows.push(
                    <tr
                      key={`title-${categoriaAtual}`}
                      className="section-title-row"
                      data-section={isBarramento ? "barramento" : undefined}
                    >
                      <td colSpan={totalDataCols + 2}>{item.categoria}</td>
                    </tr>,
                  );
                }

                const fichaItem = (ficha.items || []).find(
                  (fi) => fi.id === item.id,
                ) || {
                  sessionMarks: [],
                  resultado: "",
                };

                const marks = isPainel
                  ? []
                  : Array(15)
                      .fill("")
                      .map((_, i) => (fichaItem.sessionMarks || [])[i] || "");

                rows.push(
                  <tr
                    key={item.id}
                    className={isFirstOfSection ? "section-first-item-row" : ""}
                  >
                    <td className="text-center">{item.numero}</td>

                    <td className="item-desc">{item.descricao}</td>

                    {!isPainel &&
                      marks.map((mark, i) => (
                        <td key={i} className="text-center mark-cell">
                          {mark === "feito" ? "✓" : mark === "na" ? "—" : ""}
                        </td>
                      ))}

                    <td className="text-center res-mark">
                      {fichaItem.resultado === "ok" ? "X" : ""}
                    </td>
                    <td className="text-center res-mark">
                      {fichaItem.resultado === "na" ? "X" : ""}
                    </td>
                  </tr>,
                );
              });

              return rows;
            })()}

            <tr className="goal-row">
              <td colSpan="2">
                <strong>Objetivo:</strong> {op?.objetivo}
              </td>
              <td colSpan={totalDataCols}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* OBSERVAÇÕES */}
      <div className="print-final-block">
        <div className="print-section-title">OBSERVAÇÕES</div>
        <div className="print-notes">
          {ficha.observacoes || "Nenhuma observação registrada."}
        </div>

        <div className="print-docs-note">
          <strong>Nota:</strong> {NOTA_DOCUMENTOS}
        </div>

        {ficha.alteracoesFeitas && (
          <div style={{ marginTop: "10px" }}>
            <div className="print-section-title">
              ALTERAÇÕES FEITAS APÓS FINALIZAÇÃO
            </div>
            <div className="print-notes">{ficha.alteracoesFeitas}</div>
          </div>
        )}

        <table
          className="print-signatures-table"
          style={{
            width: "100%",
            marginTop: "10px",
            tableLayout: "fixed",
            borderCollapse: "collapse",
          }}
        >
          <tbody>
            <tr>
              <td
                className="sig-box"
                style={{ width: "33.33%", padding: "5px", overflow: "hidden" }}
              >
                <div className="sig-line">
                  {ficha.assinaturas.supervisor.dataUrl ? (
                    <img
                      src={ficha.assinaturas.supervisor.dataUrl}
                      alt="Assinatura"
                    />
                  ) : (
                    <div style={{ height: "35px" }}></div>
                  )}
                </div>
                <div className="sig-label">Supervisor de Produção</div>
                <div className="sig-name">
                  {ficha.assinaturas.supervisor.nome || "____________________"}
                </div>
                <div className="sig-date">
                  Data: {ficha.assinaturas.supervisor.data || "__/__/____"}
                </div>
              </td>
              <td
                className="sig-box"
                style={{ width: "33.33%", padding: "5px", overflow: "hidden" }}
              >
                <div className="sig-line">
                  {ficha.assinaturas.qualidade.dataUrl ? (
                    <img
                      src={ficha.assinaturas.qualidade.dataUrl}
                      alt="Assinatura"
                    />
                  ) : (
                    <div style={{ height: "35px" }}></div>
                  )}
                </div>
                <div className="sig-label">Responsável pela Qualidade</div>
                <div className="sig-name">
                  {ficha.assinaturas.qualidade.nome || "____________________"}
                </div>
                <div className="sig-date">
                  Data: {ficha.assinaturas.qualidade.data || "__/__/____"}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
